import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import { assertFetchable } from '../common/url';

export type FetchedPage = {
  title: string | null;
  text: string; // cleaned visible text, one line per block
  hash: string;
  price: number | null;
  links: { text: string; href: string }[];
};

const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 20_000;

/** Downloads a page politely and turns it into clean text we can compare between checks. */
export async function fetchPage(rawUrl: string): Promise<FetchedPage> {
  const url = new URL(rawUrl);
  await assertFetchable(url);

  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      'User-Agent': process.env.USER_AGENT ?? 'LightkeeperBot/0.1',
      Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
      'Accept-Language': 'en-IN,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`The site answered ${res.status} ${res.statusText}`.trim());

  const type = res.headers.get('content-type') ?? '';
  if (!/html|xml|text\/plain/i.test(type)) throw new Error(`Not a web page (${type || 'unknown type'})`);

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > MAX_BYTES) throw new Error('Page is too large to watch (over 3 MB)');
  const html = buf.toString('utf8');

  return extract(html, res.url || url.toString());
}

export function extract(html: string, baseUrl: string): FetchedPage {
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim().replace(/\s+/g, ' ') || null;

  // Collect links before we alter the document, so alerts can point at the direct link.
  const links: { text: string; href: string }[] = [];
  $('a[href]').each((_i, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const href = $(el).attr('href') ?? '';
    if (!text || href.startsWith('javascript:') || href.startsWith('#')) return;
    try {
      links.push({ text: text.slice(0, 200), href: new URL(href, baseUrl).toString() });
    } catch {
      /* ignore broken links */
    }
  });

  // Remove things that never matter and often change (scripts, tracking, styles).
  $('script, style, noscript, template, svg, iframe, link, meta').remove();
  // Turn block boundaries into line breaks so the text keeps its structure.
  $('br').replaceWith('\n');
  $('p, div, li, tr, td, th, h1, h2, h3, h4, h5, h6, section, article, a, marquee, span.blink, dt, dd').each((_i, el) => {
    $(el).append('\n');
  });

  const lines: string[] = [];
  for (const raw of ($('body').text() || $.root().text()).split('\n')) {
    const line = raw.replace(/\s+/g, ' ').trim();
    if (!line) continue;
    if (lines[lines.length - 1] === line) continue;
    // Ignore lines that are only a clock or counter, which change on every load.
    if (/^(\d{1,2}:\d{2}(:\d{2})?\s*(am|pm)?|visitors?:?\s*\d+|\d+)$/i.test(line)) continue;
    lines.push(line);
  }
  const text = lines.join('\n').slice(0, 200_000);

  return {
    title,
    text,
    hash: createHash('sha256').update(text).digest('hex'),
    price: findPrice(text),
    links,
  };
}

/** First rupee amount on the page that looks like a product price. Good enough for simple product pages. */
export function findPrice(text: string): number | null {
  const re = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = Math.round(Number(m[1].replace(/,/g, '')));
    if (Number.isFinite(n) && n >= 50) return n;
  }
  return null;
}

/** Lines that are new in `next` compared with `prev`: the human-readable "what changed". */
export function addedLines(prev: string | null, next: string): string[] {
  const before = new Set((prev ?? '').split('\n'));
  return next.split('\n').filter((l) => !before.has(l));
}
