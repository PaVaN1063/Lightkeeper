import { Prisma } from '@prisma/client';

/** Everything the app needs to draw a watch card and its details screen. */
export const watchInclude = {
  pages: { include: { page: true } },
  events: { orderBy: { createdAt: 'desc' }, take: 50, include: { page: { select: { site: true } } } },
} satisfies Prisma.WatchInclude;

export type WatchWithRelations = Prisma.WatchGetPayload<{ include: typeof watchInclude }>;

const STATUS = { ACTIVE: 'watching', PAUSED: 'paused', TRIGGERED: 'goal_met' } as const;
const KIND = { STARTED: 'started', CHANGE: 'change', ALERT: 'alert', ERROR: 'error' } as const;
const FEEDBACK = { USEFUL: 'useful', NOT_USEFUL: 'not_useful' } as const;

export function toWatchDto(w: WatchWithRelations) {
  const pages = w.pages.map(({ page }) => ({
    id: page.id,
    url: page.url,
    site: page.site,
    title: page.title,
    price: page.lastPrice,
    lastCheckedAt: page.lastCheckedAt?.toISOString() ?? null,
    status: page.status === 'FAILING' ? 'failing' : 'ok',
    lastError: page.lastError,
  }));
  const lastCheckedAt = pages
    .map((p) => p.lastCheckedAt)
    .filter((d): d is string => !!d)
    .sort()
    .pop() ?? null;
  const latestAlert = w.events.find((e) => e.kind === 'ALERT');

  return {
    id: w.id,
    name: w.name,
    goal: w.summary,
    goalText: w.goalText,
    status: STATUS[w.status],
    conditionType: w.conditionType.toLowerCase(),
    keywords: w.keywords.filter((k) => !k.startsWith('~')),
    priceTarget: w.priceTarget,
    intervalMin: w.intervalMin,
    sourceId: w.sourceId,
    createdAt: w.createdAt.toISOString(),
    triggeredAt: w.triggeredAt?.toISOString() ?? null,
    lastCheckedAt,
    aiSummary: latestAlert?.text ?? null,
    pages,
    events: w.events.map((e) => ({
      id: e.id,
      kind: KIND[e.kind],
      title: e.title,
      text: e.text,
      link: e.link,
      site: e.page?.site ?? null,
      feedback: e.feedback ? FEEDBACK[e.feedback] : null,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export type WatchDto = ReturnType<typeof toWatchDto>;
