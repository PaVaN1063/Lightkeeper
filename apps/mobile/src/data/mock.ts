// Mock data for the UI-only phase. Replaced by API calls once the NestJS backend exists.
// Site addresses here are placeholders — use the real official URLs before launch.
import { Source, Watch } from '../types';

export const MOCK_USER = { name: 'Pavan Kumar', firstName: 'Pavan', initials: 'PK', email: 'pavan@example.com' };

export const PLAN_LIMITS = {
  guest: { watches: 1, pagesPerWatch: 2 },
  free: { watches: 3, pagesPerWatch: 2 },
  pro: { watches: 25, pagesPerWatch: 10 },
};

export const MOCK_WATCHES: Watch[] = [
  {
    id: 'gate-2027',
    name: 'GATE 2027 admit card',
    goal: 'Alert when an admit card or hall ticket download link appears.',
    status: 'goal_met',
    interval: '1h',
    lastChecked: '12 min ago',
    statusNote: '12 min ago',
    aiSummary: 'The admit card download link is now live on the candidate portal.',
    pages: [
      { id: 'p1', site: 'gate2027.ac.in', title: 'GATE 2027 candidate portal', url: 'https://gate2027.ac.in', lastChecked: '12 min ago' },
    ],
    timeline: [
      {
        id: 't1',
        when: 'Today · 2:14 PM',
        kind: 'alert',
        title: 'GATE 2027 admit card is out',
        text: 'A new "Download Admit Card" link was added to the candidate portal.',
        feedback: null,
      },
      { id: 't2', when: 'Yesterday · 6:02 PM', kind: 'change', text: 'Exam city slip released. No admit card yet.' },
      { id: 't3', when: 'Oct 12 · 11:30 AM', kind: 'change', text: 'Mock test link added to the page.' },
      { id: 't4', when: 'Oct 9', kind: 'started', text: 'Started watching' },
    ],
  },
  {
    id: 'oneplus-13',
    name: 'OnePlus 13 under ₹50,000',
    goal: 'Alert when either site drops below ₹50,000.',
    status: 'watching',
    interval: '1h',
    lastChecked: '8 min ago',
    statusNote: 'Checked 8 min ago',
    targetPrice: 50000,
    pages: [
      { id: 'p1', site: 'flipkart.com', title: 'OnePlus 13 5G (Black Eclipse, 256 GB)', url: 'https://www.flipkart.com', price: 51499, lastChecked: '8 min ago' },
      { id: 'p2', site: 'amazon.in', title: 'OnePlus 13 (Black Eclipse, 256 GB)', url: 'https://www.amazon.in', price: 52999, lastChecked: '8 min ago' },
    ],
    timeline: [
      { id: 't1', when: 'Today · 1:40 PM', kind: 'change', site: 'Flipkart', text: 'Price fell from ₹53,999 to ₹51,499. Still ₹1,499 above your target.' },
      { id: 't2', when: 'Yesterday · 9:15 PM', kind: 'change', site: 'Amazon', text: 'New bank offer added. Price unchanged at ₹52,999.' },
      { id: 't3', when: 'Oct 15', kind: 'started', text: 'Started watching 2 sites' },
    ],
  },
  {
    id: 'react-jobs',
    name: 'New React developer jobs',
    goal: 'Alert when a new React or frontend role is posted.',
    status: 'paused',
    interval: '1h',
    lastChecked: '4 days ago',
    statusNote: 'Since Oct 14',
    pages: [
      { id: 'p1', site: 'careers.razorpay.com', title: 'Careers · Engineering', url: 'https://careers.razorpay.com', lastChecked: '4 days ago' },
    ],
    timeline: [
      { id: 't1', when: 'Oct 14', kind: 'change', text: 'You paused this watch.' },
      { id: 't2', when: 'Oct 3', kind: 'started', text: 'Started watching' },
    ],
  },
];

export const MOCK_SOURCES: Source[] = [
  { id: 'gate', badge: 'GATE', name: 'GATE 2027', goal: 'Admit card and results', site: 'gate2027.ac.in', category: 'Exams' },
  { id: 'upsc', badge: 'UPSC', name: 'UPSC CSE 2027', goal: 'New notifications', site: 'upsc.gov.in', category: 'Exams' },
  { id: 'ssc', badge: 'SSC', name: 'SSC CGL 2026', goal: 'Tier 1 result', site: 'ssc.gov.in', category: 'Exams' },
  { id: 'ibps', badge: 'IBPS', name: 'IBPS PO 2026', goal: 'Call letter released', site: 'ibps.in', category: 'Exams' },
  { id: 'jee', badge: 'JEE', name: 'JEE Main 2027', goal: 'Session 1 updates', site: 'jeemain.nta.nic.in', category: 'Exams' },
  { id: 'neet', badge: 'NEET', name: 'NEET UG 2027', goal: 'Registration opens', site: 'neet.nta.nic.in', category: 'Exams' },
  { id: 'rzp', badge: 'RZP', name: 'Razorpay careers', goal: 'New engineering roles', site: 'careers.razorpay.com', category: 'Jobs' },
  { id: 'zoho', badge: 'ZOHO', name: 'Zoho careers', goal: 'New frontend roles', site: 'careers.zohocorp.com', category: 'Jobs' },
  { id: 'au', badge: 'AU', name: 'Andhra University', goal: 'Semester results', site: 'andhrauniversity.edu.in', category: 'Results' },
  { id: 'cbse', badge: 'CBSE', name: 'CBSE results', goal: 'Class 10 and 12 results', site: 'cbseresults.nic.in', category: 'Results' },
  { id: 'power', badge: 'PWR', name: 'Power cut notices', goal: 'Planned outages in your area', site: '[your electricity board]', category: 'Local' },
];

export const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

/** Pulls "amazon.in" out of "https://www.amazon.in/OnePlus-13/dp/..." */
export function siteFromUrl(url: string): string | null {
  const m = url.trim().match(/^(?:https?:\/\/)?(?:www\.)?([^/\s?#]+\.[a-z]{2,})(?:[/?#]|$)/i);
  return m ? m[1].toLowerCase() : null;
}

/** Stand-in for the AI "parse goal" call: builds the sentence shown on the confirm screen. */
export function previewSentence(sites: string[], goal: string, interval: string): string {
  const where = sites.length === 0 ? 'the page' : sites.length === 1 ? sites[0] : sites.slice(0, -1).join(', ') + ' and ' + sites[sites.length - 1];
  const every = interval === '1h' ? 'every hour' : interval === '30m' ? 'every 30 minutes' : 'every 10 minutes';
  const price = goal.match(/₹\s?([\d,]+)/);
  if (price) {
    const either = sites.length > 1 ? 'either one drops' : 'the price drops';
    return `I'll check ${where} ${every} and alert you as soon as ${either} below ₹${price[1]}.`;
  }
  const clean = goal.replace(/^(tell me|alert me|notify me)\s+(when|if)\s+/i, '').replace(/\.$/, '');
  return `I'll check ${where} ${every} and alert you when ${clean || 'something changes'}.`;
}
