// Small helpers and the remaining mock pieces (user name until Firebase sign-in is added).

export const MOCK_USER = { name: 'Pavan Kumar', firstName: 'Pavan', initials: 'PK', email: 'pavan@example.com' };

export const PLAN_LIMITS = {
  guest: { watches: 1, pagesPerWatch: 2 },
  free: { watches: 3, pagesPerWatch: 2 },
  pro: { watches: 25, pagesPerWatch: 10 },
};

export const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

/** Pulls "amazon.in" out of "https://www.amazon.in/OnePlus-13/dp/...". Also accepts localhost and IP addresses. */
export function siteFromUrl(url: string): string | null {
  const raw = url.trim();
  if (!raw || /\s/.test(raw)) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    const ok = host === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || /\.[a-z]{2,}$/.test(host);
    return ok ? host + (u.port ? `:${u.port}` : '') : null;
  } catch {
    return null;
  }
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
