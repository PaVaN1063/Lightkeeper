import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientIdentity } from '../auth/current-user';
import { CheckerService } from '../checker/checker.service';
import { PLAN_LIMITS } from '../common/limits';
import { normalizeUrl, siteOf } from '../common/url';
import { PrismaService } from '../prisma.service';
import { SourcesService } from '../sources/sources.service';
import { parseGoal } from './goal-parser';
import { toWatchDto, watchInclude } from './watch.dto';

export type CreateWatchInput = { urls?: string[]; goal?: string; intervalMin?: number; sourceId?: string };

@Injectable()
export class WatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sources: SourcesService,
    private readonly checker: CheckerService,
  ) {}

  /** Finds or creates the user row for this app install. */
  async userFor(client: ClientIdentity) {
    return this.prisma.user.upsert({ where: { clientId: client.clientId }, create: { clientId: client.clientId }, update: {} });
  }

  private cleanUrls(urls: string[] | undefined) {
    const list = (urls ?? []).map((u) => (u ?? '').trim()).filter(Boolean);
    if (list.length === 0) throw new BadRequestException({ code: 'BAD_URL', message: 'Add at least one link to watch.' });
    const unique = [...new Map(list.map((u) => {
      const url = normalizeUrl(u);
      return [url.toString(), url] as const;
    })).values()];
    return unique;
  }

  /** Preview for the confirm screen: what we understood, without saving anything. */
  parse(input: CreateWatchInput) {
    const urls = this.cleanUrls(input.urls);
    const intervalMin = Number(input.intervalMin) || 60;
    const parsed = parseGoal(input.goal ?? '', urls.map(siteOf), intervalMin);
    return { ...parsed, conditionType: parsed.conditionType.toLowerCase(), keywords: parsed.keywords.filter((k) => !k.startsWith('~')), sites: urls.map(siteOf), urls: urls.map(String), intervalMin };
  }

  async list(client: ClientIdentity) {
    const user = await this.userFor(client);
    const rows = await this.prisma.watch.findMany({ where: { userId: user.id }, include: watchInclude, orderBy: { createdAt: 'desc' } });
    // Goal met first, then watching, then paused.
    const rank = { TRIGGERED: 0, ACTIVE: 1, PAUSED: 2 } as const;
    rows.sort((a, b) => rank[a.status] - rank[b.status]);
    return rows.map(toWatchDto);
  }

  async get(client: ClientIdentity, id: string) {
    const user = await this.userFor(client);
    const w = await this.prisma.watch.findFirst({ where: { id, userId: user.id }, include: watchInclude });
    if (!w) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Watch not found.' });
    return toWatchDto(w);
  }

  private async assertCanActivate(userId: string, client: ClientIdentity) {
    const limits = PLAN_LIMITS[client.plan];
    const active = await this.prisma.watch.count({ where: { userId, status: 'ACTIVE' } });
    if (active >= limits.activeWatches) {
      throw new ForbiddenException({
        code: 'LIMIT_WATCHES',
        message:
          client.plan === 'guest'
            ? 'Guests can keep 1 active watch. Save your account to get 3.'
            : `The free plan has ${limits.activeWatches} active watches. Pause one or wait for Pro.`,
      });
    }
  }

  async create(client: ClientIdentity, input: CreateWatchInput) {
    const user = await this.userFor(client);
    const limits = PLAN_LIMITS[client.plan];

    let goal = (input.goal ?? '').trim();
    let urlsIn = input.urls;
    let name: string | undefined;
    if (input.sourceId) {
      const source = await this.sources.get(input.sourceId);
      if (!source) throw new NotFoundException({ code: 'NOT_FOUND', message: 'That ready-made watch no longer exists.' });
      const existing = await this.prisma.watch.findFirst({ where: { userId: user.id, sourceId: source.id } });
      if (existing) return this.get(client, existing.id);
      goal = source.defaultGoal;
      urlsIn = [source.url];
      name = source.name;
    }

    const urls = this.cleanUrls(urlsIn);
    if (urls.length > limits.pagesPerWatch) {
      throw new ForbiddenException({ code: 'LIMIT_PAGES', message: `Free watches can follow ${limits.pagesPerWatch} pages. More pages come with Pro.` });
    }
    const intervalMin = Math.max(limits.minIntervalMin, Number(input.intervalMin) || 60);
    await this.assertCanActivate(user.id, client);

    const parsed = parseGoal(goal, urls.map(siteOf), intervalMin);

    const pages = await Promise.all(
      urls.map((u) => this.prisma.page.upsert({ where: { url: u.toString() }, create: { url: u.toString(), site: siteOf(u) }, update: {} })),
    );

    const watch = await this.prisma.watch.create({
      data: {
        userId: user.id,
        name: name ?? parsed.name,
        goalText: goal,
        summary: parsed.summary,
        conditionType: parsed.conditionType,
        keywords: parsed.keywords,
        priceTarget: parsed.priceTarget,
        intervalMin,
        sourceId: input.sourceId ?? null,
        pages: { create: pages.map((p) => ({ pageId: p.id })) },
        events: { create: { kind: 'STARTED', text: pages.length > 1 ? `Started watching ${pages.length} sites` : 'Started watching' } },
      },
    });

    // First check right away, so the user sees "Checked just now" and a baseline.
    await this.checker.checkWatchNow(watch.id, { force: true }).catch(() => undefined);
    return this.get(client, watch.id);
  }

  async update(client: ClientIdentity, id: string, body: { status?: string }) {
    const user = await this.userFor(client);
    const w = await this.prisma.watch.findFirst({ where: { id, userId: user.id } });
    if (!w) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Watch not found.' });

    if (body.status === 'paused') {
      await this.prisma.watch.update({ where: { id }, data: { status: 'PAUSED', events: { create: { kind: 'CHANGE', text: 'You paused this watch.' } } } });
    } else if (body.status === 'watching') {
      if (w.status !== 'ACTIVE') await this.assertCanActivate(user.id, client);
      await this.prisma.watch.update({
        where: { id },
        data: { status: 'ACTIVE', triggeredAt: null, events: { create: { kind: 'CHANGE', text: w.status === 'TRIGGERED' ? 'Watching again for the next update.' : 'You resumed this watch.' } } },
      });
    } else {
      throw new BadRequestException({ code: 'BAD_STATUS', message: 'Status must be "watching" or "paused".' });
    }
    return this.get(client, id);
  }

  async remove(client: ClientIdentity, id: string) {
    const user = await this.userFor(client);
    const { count } = await this.prisma.watch.deleteMany({ where: { id, userId: user.id } });
    if (count === 0) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Watch not found.' });
    // Pages no watch uses any more are cleaned up so they stop being fetched.
    await this.prisma.page.deleteMany({ where: { watches: { none: {} } } });
    return { ok: true };
  }

  async checkNow(client: ClientIdentity, id: string) {
    const user = await this.userFor(client);
    const w = await this.prisma.watch.findFirst({ where: { id, userId: user.id } });
    if (!w) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Watch not found.' });
    await this.checker.checkWatchNow(id, { force: true });
    return this.get(client, id);
  }

  async setFeedback(client: ClientIdentity, eventId: string, value: string | null) {
    const user = await this.userFor(client);
    const event = await this.prisma.watchEvent.findFirst({ where: { id: eventId, watch: { userId: user.id } } });
    if (!event) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Alert not found.' });
    const feedback = value === 'useful' ? 'USEFUL' : value === 'not_useful' ? 'NOT_USEFUL' : null;
    await this.prisma.watchEvent.update({ where: { id: eventId }, data: { feedback } });
    return { ok: true, feedback: value ?? null };
  }
}
