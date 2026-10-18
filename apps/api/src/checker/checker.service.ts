import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Page, Watch } from '@prisma/client';
import { keywordsMatch } from '../watches/goal-parser';
import { PrismaService } from '../prisma.service';
import { addedLines, FetchedPage, fetchPage } from './fetch-page';

const FAILS_BEFORE_WARNING = 3;

/**
 * The checking pipeline:
 * 1. every tick, find pages whose active watches are due
 * 2. fetch the page, clean it to text, hash it
 * 3. same hash as last time → nothing to do (no AI, no events)
 * 4. otherwise judge every active watch on that page (keyword / price / any change)
 * 5. record a timeline event; goal met → alert and mark the watch as goal met
 */
@Injectable()
export class CheckerService implements OnModuleInit {
  private readonly log = new Logger(CheckerService.name);
  private running = false;
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onModuleInit() {
    if (process.env.CHECKER_ENABLED === 'false') {
      this.log.warn('Checker disabled (CHECKER_ENABLED=false). Watches will only update on "Check now".');
      return;
    }
    const seconds = Math.max(15, Number(process.env.CHECKER_TICK_SECONDS ?? 60));
    const timer = setInterval(() => void this.tick(), seconds * 1000);
    this.scheduler.addInterval('checker', timer);
    this.log.log(`Checker running every ${seconds}s`);
    setTimeout(() => void this.tick(), 3000);
  }

  /** One scheduler pass. Skips if the previous pass is still running. */
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const pages = await this.prisma.page.findMany({
        where: { watches: { some: { watch: { status: 'ACTIVE' } } } },
        include: { watches: { where: { watch: { status: 'ACTIVE' } }, include: { watch: true } } },
      });
      const now = Date.now();
      const due = pages.filter((p) => {
        const interval = Math.min(...p.watches.map((wp) => wp.watch.intervalMin));
        return !p.lastCheckedAt || now - p.lastCheckedAt.getTime() >= interval * 60_000;
      });
      if (due.length) this.log.log(`Checking ${due.length} page(s)`);
      // A few at a time, to be gentle on our server and on the sites.
      for (let i = 0; i < due.length; i += 4) {
        await Promise.all(due.slice(i, i + 4).map((p) => this.checkPage(p.id)));
      }
    } catch (e) {
      this.log.error(`Tick failed: ${(e as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  /** Used by "Check now" and right after creating a watch. */
  async checkWatchNow(watchId: string, opts: { force?: boolean } = {}) {
    const links = await this.prisma.watchPage.findMany({ where: { watchId } });
    await Promise.all(links.map((l) => this.checkPage(l.pageId, { ...opts, onlyWatchId: opts.force ? watchId : undefined })));
  }

  async checkPage(pageId: string, opts: { force?: boolean; onlyWatchId?: string } = {}) {
    if (this.inFlight.has(pageId)) return;
    this.inFlight.add(pageId);
    try {
      const page = await this.prisma.page.findUnique({ where: { id: pageId } });
      if (!page) return;

      let fetched: FetchedPage;
      try {
        fetched = await fetchPage(page.url);
      } catch (e) {
        await this.recordFailure(page, (e as Error).message);
        return;
      }

      const firstCheck = !page.lastHash;
      const changed = page.lastHash !== fetched.hash;

      await this.prisma.page.update({
        where: { id: page.id },
        data: {
          lastCheckedAt: new Date(),
          title: fetched.title ?? page.title,
          lastHash: fetched.hash,
          lastText: fetched.text,
          lastPrice: fetched.price,
          status: 'OK',
          failCount: 0,
          lastError: null,
        },
      });

      if (page.status === 'FAILING') {
        await this.addEventForActiveWatches(page.id, { kind: 'CHANGE', text: 'The page is reachable again.' });
      }

      // Page unchanged: only watches that have never been judged need a look (no extra work otherwise).
      const onlyNew = !changed && !opts.force;
      const watches = await this.prisma.watch.findMany({
        where: {
          status: 'ACTIVE',
          pages: { some: { pageId: page.id } },
          ...(opts.onlyWatchId ? { id: opts.onlyWatchId } : {}),
          ...(onlyNew ? { baselineAt: null } : {}),
        },
      });
      for (const watch of watches) {
        await this.evaluate(watch, page, fetched, { firstForWatch: !watch.baselineAt, pageWasNew: firstCheck, changed });
        if (!watch.baselineAt) await this.prisma.watch.update({ where: { id: watch.id }, data: { baselineAt: new Date() } }).catch(() => undefined);
      }
    } finally {
      this.inFlight.delete(pageId);
    }
  }

  private async evaluate(watch: Watch, page: Page, now: FetchedPage, ctx: { firstForWatch: boolean; pageWasNew: boolean; changed: boolean }) {
    // "Changed" only counts against an older version this watch has already seen.
    const realChange = ctx.changed && !ctx.pageWasNew && !ctx.firstForWatch;
    const added = addedLines(page.lastText, now.text);
    const site = page.site;

    let met = false;
    let title = '';
    let text = '';
    let link: string | null = page.url;

    if (watch.conditionType === 'KEYWORD') {
      if (ctx.firstForWatch) {
        // Words like "result" are often already on the page (old results, menus). Note it, don't alert.
        const already = keywordsMatch(now.text, watch.keywords);
        if (already) {
          const line = now.text.split('\n').find((l) => l.toLowerCase().includes(already)) ?? '';
          await this.event(watch.id, page.id, 'CHANGE', `Heads-up: "${already}" is already mentioned on ${site} ("${trim(line, 120)}"). I'll alert you when a new mention appears.`);
        }
        return;
      }
      // Alert when the words appear in text that is new since the last check.
      const newText = added.join('\n');
      const hit = newText ? keywordsMatch(newText, watch.keywords) : null;
      if (hit) {
        met = true;
        const line = added.find((l) => l.toLowerCase().includes(hit)) ?? added[0] ?? '';
        const direct = now.links.find((l) => l.text.toLowerCase().includes(hit) && added.some((a) => a.includes(l.text)));
        link = direct?.href ?? page.url;
        title = `${watch.name}: new "${hit}" on ${site}`;
        text = `New on ${site}: ${trim(line)}`;
      }
    } else if (watch.conditionType === 'PRICE' && watch.priceTarget) {
      if (now.price !== null && now.price <= watch.priceTarget) {
        met = true;
        title = `${watch.name}: ₹${fmt(now.price)} on ${site}`;
        text = `The price on ${site} is now ₹${fmt(now.price)}, at or below your ₹${fmt(watch.priceTarget)} target.`;
      } else if (realChange && now.price !== null && now.price !== page.lastPrice) {
        const from = page.lastPrice ? `₹${fmt(page.lastPrice)}` : 'unknown';
        const gap = now.price - watch.priceTarget;
        await this.event(watch.id, page.id, 'CHANGE', `Price moved from ${from} to ₹${fmt(now.price)}. Still ₹${fmt(gap)} above your target.`);
        return;
      } else if (ctx.firstForWatch && now.price === null) {
        await this.event(watch.id, page.id, 'ERROR', `I couldn't find a ₹ price on ${site}. Shopping sites often block checkers; this works best on simple product pages.`);
        return;
      }
    } else if (watch.conditionType === 'ANY_CHANGE') {
      if (realChange) {
        met = true;
        title = `${watch.name}: the page changed`;
        text = added.length ? `New on ${site}: ${trim(added.slice(0, 2).join(' · '))}` : `Something on ${site} changed.`;
      }
    }

    if (met) {
      // Only the first page to meet the goal fires the alert (a two-site watch alerts once).
      const { count } = await this.prisma.watch.updateMany({ where: { id: watch.id, status: 'ACTIVE' }, data: { status: 'TRIGGERED', triggeredAt: new Date() } });
      if (count === 0) return;
      await this.prisma.watchEvent.create({ data: { watchId: watch.id, kind: 'ALERT', pageId: page.id, title, text, link } });
      this.log.log(`ALERT watch=${watch.id} ${title}`);
      // Push notifications get sent from here once Firebase is connected.
      return;
    }

    if (realChange && added.length > 0) {
      await this.event(watch.id, page.id, 'CHANGE', `Changed, goal not met yet. New: ${trim(added.slice(0, 2).join(' · '))}`);
    }
  }

  private async recordFailure(page: Page, message: string) {
    const failCount = page.failCount + 1;
    await this.prisma.page.update({
      where: { id: page.id },
      data: { lastCheckedAt: new Date(), failCount, lastError: message.slice(0, 300), status: failCount >= FAILS_BEFORE_WARNING ? 'FAILING' : page.status },
    });
    this.log.warn(`Fetch failed for ${page.url}: ${message}`);
    if (failCount === 1 && !page.lastHash) {
      await this.addEventForActiveWatches(page.id, { kind: 'ERROR', text: `Couldn't open ${page.site}: ${message}. I'll keep trying.` });
    } else if (failCount === FAILS_BEFORE_WARNING) {
      await this.addEventForActiveWatches(page.id, { kind: 'ERROR', text: `${page.site} has failed ${failCount} checks in a row (${message}). The site may be down or overloaded; I'll keep trying.` });
    }
  }

  private async addEventForActiveWatches(pageId: string, e: { kind: 'CHANGE' | 'ERROR'; text: string }) {
    const watches = await this.prisma.watch.findMany({ where: { status: 'ACTIVE', pages: { some: { pageId } } }, select: { id: true } });
    for (const w of watches) await this.event(w.id, pageId, e.kind, e.text);
  }

  private event(watchId: string, pageId: string, kind: 'CHANGE' | 'ERROR', text: string) {
    return this.prisma.watchEvent.create({ data: { watchId, pageId, kind, text } });
  }
}

function trim(s: string, n = 180) {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

function fmt(n: number) {
  return n.toLocaleString('en-IN');
}
