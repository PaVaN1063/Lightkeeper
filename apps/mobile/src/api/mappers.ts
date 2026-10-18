import { Source, SourceCategory, Watch } from '../types';

/** Shapes returned by the API (apps/api/src/watches/watch.dto.ts). */
export type ApiWatch = {
  id: string;
  name: string;
  goal: string;
  status: 'watching' | 'paused' | 'goal_met';
  priceTarget: number | null;
  intervalMin: number;
  sourceId: string | null;
  createdAt: string;
  triggeredAt: string | null;
  lastCheckedAt: string | null;
  aiSummary: string | null;
  pages: { id: string; url: string; site: string; title: string | null; price: number | null; lastCheckedAt: string | null; status: 'ok' | 'failing'; lastError: string | null }[];
  events: { id: string; kind: 'alert' | 'change' | 'started' | 'error'; title: string | null; text: string; link: string | null; site: string | null; feedback: 'useful' | 'not_useful' | null; createdAt: string }[];
};

export type ApiSource = { id: string; badge: string; name: string; goal: string; url: string; site: string; category: string };

export type ParsedGoal = { conditionType: string; keywords: string[]; priceTarget: number | null; name: string; summary: string; sites: string[] };

/** "just now", "8 min ago", "3 h ago", "Yesterday", "Oct 14" */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'not yet';
  const d = new Date(iso);
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  if (h < 48) return 'yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** "Today · 2:14 PM", "Yesterday · 6:02 PM", "Oct 12 · 11:30 AM" */
function when(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return `Today · ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday · ${time}`;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${time}`;
}

function capitalise(site: string) {
  const name = site.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function toWatch(w: ApiWatch): Watch {
  const multi = w.pages.length > 1;
  const checked = timeAgo(w.lastCheckedAt);
  const statusNote =
    w.status === 'goal_met'
      ? timeAgo(w.triggeredAt)
      : w.status === 'paused'
        ? 'Paused'
        : w.lastCheckedAt
          ? `Checked ${checked}`
          : 'First check running…';
  return {
    id: w.id,
    name: w.name,
    goal: w.goal,
    status: w.status,
    interval: w.intervalMin <= 10 ? '10m' : w.intervalMin <= 30 ? '30m' : '1h',
    lastChecked: checked,
    statusNote,
    targetPrice: w.priceTarget ?? undefined,
    aiSummary: w.status === 'goal_met' ? w.aiSummary ?? undefined : undefined,
    sourceId: w.sourceId,
    pages: w.pages.map((p) => ({
      id: p.id,
      site: p.site,
      title: p.title ?? p.site,
      url: p.url,
      price: p.price ?? undefined,
      lastChecked: timeAgo(p.lastCheckedAt),
      failing: p.status === 'failing',
      lastError: p.lastError,
    })),
    timeline: w.events.map((e) => ({
      id: e.id,
      when: when(e.createdAt),
      kind: e.kind,
      title: e.title ?? undefined,
      text: e.text,
      link: e.link,
      site: multi && e.site ? capitalise(e.site) : undefined,
      feedback: e.feedback,
    })),
  };
}

export function toSource(s: ApiSource): Source {
  const cats: SourceCategory[] = ['Exams', 'Jobs', 'Results', 'Local'];
  return { id: s.id, badge: s.badge, name: s.name, goal: s.goal, site: s.site, category: (cats.includes(s.category as SourceCategory) ? s.category : 'Exams') as SourceCategory };
}
