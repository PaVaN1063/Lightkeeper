import { BadRequestException } from '@nestjs/common';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/** Turns "ssc.gov.in/results" into "https://ssc.gov.in/results" and rejects anything that isn't http(s). */
export function normalizeUrl(input: string): URL {
  const raw = (input ?? '').trim();
  if (!raw) throw new BadRequestException({ code: 'BAD_URL', message: 'Add a link to watch.' });
  let url: URL;
  try {
    // No scheme: https for normal sites, http for localhost and bare IP addresses (local test servers).
    const local = /^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/|$)/i.test(raw);
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `${local ? 'http' : 'https'}://${raw}`);
  } catch {
    throw new BadRequestException({ code: 'BAD_URL', message: `"${raw}" doesn't look like a web address.` });
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestException({ code: 'BAD_URL', message: 'Only http and https links can be watched.' });
  }
  if (url.username || url.password) {
    throw new BadRequestException({ code: 'BAD_URL', message: 'Links with a username or password are not allowed.' });
  }
  url.hash = '';
  return url;
}

export function siteOf(url: URL): string {
  return url.hostname.replace(/^www\./, '');
}

function isPrivateAddress(ip: string): boolean {
  if (ip === '::1' || ip === '0.0.0.0') return true;
  const v4 = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  if (isIP(v4) === 4) {
    const [a, b] = v4.split('.').map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  const lower = ip.toLowerCase();
  return lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
}

/**
 * Blocks addresses inside private networks unless ALLOW_PRIVATE_URLS=true (development).
 * On a public server this stops the checker from being used to probe internal services.
 */
export async function assertFetchable(url: URL): Promise<void> {
  if (process.env.ALLOW_PRIVATE_URLS === 'true') return;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new BadRequestException({ code: 'PRIVATE_URL', message: 'Local and private addresses cannot be watched.' });
  }
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address);
  if (addresses.some(isPrivateAddress)) {
    throw new BadRequestException({ code: 'PRIVATE_URL', message: 'Local and private addresses cannot be watched.' });
  }
}
