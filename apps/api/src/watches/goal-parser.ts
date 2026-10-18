import { ConditionType } from '@prisma/client';

/**
 * Rule-based goal parser: turns "Tell me when the GATE admit card is out" into a precise check.
 * This is the stand-in for the Gemini "parse goal" call. Same output shape, so swapping is easy.
 */
export type ParsedGoal = {
  conditionType: ConditionType;
  keywords: string[];
  priceTarget: number | null;
  name: string;
  summary: string;
};

// Phrases people wait for on Indian exam, job and shopping pages. Longest first so "hall ticket" beats "ticket".
const KNOWN_PHRASES = [
  'provisional answer key',
  'final answer key',
  'back in stock',
  'admit card',
  'hall ticket',
  'call letter',
  'answer key',
  'merit list',
  'cut off',
  'cutoff',
  'score card',
  'scorecard',
  'result',
  'results',
  'notification',
  'recruitment',
  'vacancy',
  'vacancies',
  'registration',
  'application form',
  'exam date',
  'exam city',
  'date sheet',
  'timetable',
  'syllabus',
  'interview',
  'counselling',
  'counseling',
  'seat allotment',
  'in stock',
];

const STOPWORDS = new Set(
  (
    'a an the is are was be been to of for on in at by and or when if it its this that my me i you please tell alert notify let know ' +
    'comes come out released release published publish appears appear page site website new any get up down soon there will gets ' +
    'posted post declared announced available opened open live job jobs role roles opening openings position positions hiring added'
  ).split(' '),
);

const ANY_CHANGE_RE = /\b(any ?thing|any change|changes?|updated?|modif(y|ied))\b/i;
const PRICE_RE = /(?:below|under|less than|lower than|drops? (?:below|to|under)|<|cheaper than|at most|max(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*([\d,]{3,})/i;
const RUPEE_RE = /(?:₹|rs\.?\s|inr\s?)\s*([\d,]{3,})/i;

function cleanSentence(goal: string): string {
  return goal
    .trim()
    .replace(/^(please\s+)?(tell|alert|notify|ping|let)\s+(me|us)\s+(know\s+)?(when|if|once|as soon as)\s+/i, '')
    .replace(/[.!?]+$/, '')
    .trim();
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseGoal(goalText: string, sites: string[], intervalMin: number): ParsedGoal {
  const goal = (goalText ?? '').trim();
  const lower = goal.toLowerCase();
  const sentence = cleanSentence(goal);
  const where = sites.length <= 1 ? sites[0] ?? 'the page' : `${sites.slice(0, -1).join(', ')} and ${sites[sites.length - 1]}`;
  const every = intervalMin >= 60 ? 'every hour' : `every ${intervalMin} minutes`;
  const name = capitalise(sentence.replace(/^the\s+/i, '')).slice(0, 60) || 'New watch';

  // 1. Price watches: "below ₹50,000"
  const price = goal.match(PRICE_RE) ?? goal.match(RUPEE_RE);
  if (price) {
    const target = Number(price[1].replace(/,/g, ''));
    if (Number.isFinite(target) && target > 0) {
      const either = sites.length > 1 ? 'either one drops' : 'the price drops';
      return {
        conditionType: 'PRICE',
        keywords: [],
        priceTarget: target,
        name,
        summary: `I'll check ${where} ${every} and alert you as soon as ${either} below ₹${target.toLocaleString('en-IN')}.`,
      };
    }
  }

  // 2. Words the user put in quotes: tell me when "Tier 1 result" appears
  const quoted = [...goal.matchAll(/["“]([^"”]{2,60})["”]/g)].map((m) => m[1].trim().toLowerCase());

  // 3. Known phrases
  const known = KNOWN_PHRASES.filter((p) => lower.includes(p));
  // Drop phrases contained in a longer match ("result" inside "results")
  const phrases = [...new Set([...quoted, ...known])].filter((p, _i, all) => !all.some((q) => q !== p && q.includes(p)));

  if (phrases.length > 0) {
    // Add a distinguishing word like "2027", "CGL" or "Tier 1" when present, so we don't match last year's result.
    const extras = [
      ...(goal.match(/\b(20\d\d|tier[\s-]?[1-4]|phase[\s-]?[1-4]|session[\s-]?[1-4])\b/gi) ?? []),
      ...(goal.match(/\b[A-Z]{2,6}\b/g) ?? []),
    ]
      .map((x) => x.toLowerCase().replace(/[\s-]+/g, ' '))
      .filter((x, i, all) => !STOPWORDS.has(x) && all.indexOf(x) === i);
    const keywords = phrases.slice(0, 4);
    const qualifier = extras.length ? ` (looking for ${extras.slice(0, 3).join(', ')} too)` : '';
    return {
      conditionType: 'KEYWORD',
      keywords: [...keywords, ...extras.slice(0, 3).map((x) => `~${x}`)],
      priceTarget: null,
      name,
      summary: `I'll check ${where} ${every} and alert you when ${keywords.map((k) => `"${k}"`).join(' or ')} appears${qualifier}.`,
    };
  }

  // 4. "Tell me when anything changes"
  if (ANY_CHANGE_RE.test(goal) || goal.length === 0) {
    return {
      conditionType: 'ANY_CHANGE',
      keywords: [],
      priceTarget: null,
      name: goal ? name : `Changes on ${where}`,
      summary: `I'll check ${where} ${every} and alert you when the page changes.`,
    };
  }

  // 5. Fallback: significant words from the sentence
  const words = sentence
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  const keywords = [...new Set(words)].sort((a, b) => b.length - a.length).slice(0, 3);
  if (keywords.length === 0) {
    return {
      conditionType: 'ANY_CHANGE',
      keywords: [],
      priceTarget: null,
      name,
      summary: `I'll check ${where} ${every} and alert you when the page changes.`,
    };
  }
  // Any of the words counts. Alerts only fire on lines that are new, so this stays focused.
  return {
    conditionType: 'KEYWORD',
    keywords,
    priceTarget: null,
    name,
    summary: `I'll check ${where} ${every} and alert you when something new mentions ${keywords.map((k) => `"${k}"`).join(' or ')}.`,
  };
}

/**
 * Keyword matching rule. Plain keywords: at least one must appear.
 * Keywords starting with "~" are qualifiers (like "2027"): if any are given, at least one must also appear.
 * A multi-word fallback keyword also matches when every one of its words appears.
 */
export function keywordsMatch(text: string, keywords: string[]): string | null {
  const t = text.toLowerCase();
  const main = keywords.filter((k) => !k.startsWith('~'));
  const qualifiers = keywords.filter((k) => k.startsWith('~')).map((k) => k.slice(1));
  const hit = main.find((k) => t.includes(k) || (k.includes(' ') && k.split(' ').every((w) => t.includes(w))));
  if (!hit) return null;
  if (qualifiers.length > 0 && !qualifiers.some((q) => t.includes(q))) return null;
  return hit;
}
