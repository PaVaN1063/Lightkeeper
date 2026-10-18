// In-memory app state for the mock-data phase. Later this becomes TanStack Query + the API.
import React, { createContext, useContext, useMemo, useState } from 'react';
import { MOCK_SOURCES, MOCK_WATCHES, PLAN_LIMITS, previewSentence, siteFromUrl } from '../data/mock';
import { DraftWatch, Feedback, Source, Watch } from '../types';

type Session = 'signed_out' | 'guest' | 'user';

type AppState = {
  session: Session;
  watches: Watch[];
  sources: Source[];
  watchedSources: Record<string, boolean>;
  draft: DraftWatch;
  limits: { watches: number; pagesPerWatch: number };
  activeCount: number;
  canAddWatch: boolean;
  signIn: () => void;
  continueAsGuest: () => void;
  signOut: () => void;
  setDraft: (d: Partial<DraftWatch>) => void;
  resetDraft: () => void;
  createWatchFromDraft: () => string;
  togglePause: (id: string) => void;
  deleteWatch: (id: string) => void;
  setFeedback: (watchId: string, eventId: string, value: Feedback) => void;
  toggleSource: (id: string) => void;
};

const emptyDraft: DraftWatch = { urls: [''], goal: '', interval: '1h' };

const AppContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>('signed_out');
  const [watches, setWatches] = useState<Watch[]>(MOCK_WATCHES);
  const [watchedSources, setWatchedSources] = useState<Record<string, boolean>>({ gate: true });
  const [draft, setDraftState] = useState<DraftWatch>(emptyDraft);

  const limits = session === 'guest' ? PLAN_LIMITS.guest : PLAN_LIMITS.free;
  // Paused watches don't count toward the plan limit.
  const activeCount = watches.filter((w) => w.status !== 'paused').length;

  const value = useMemo<AppState>(
    () => ({
      session,
      watches,
      sources: MOCK_SOURCES,
      watchedSources,
      draft,
      limits,
      activeCount,
      canAddWatch: activeCount < limits.watches,
      signIn: () => {
        setSession('user');
        setWatches(MOCK_WATCHES);
      },
      continueAsGuest: () => {
        setSession('guest');
        // A guest starts with the one ready-made watch they picked.
        setWatches(
          MOCK_WATCHES.filter((w) => w.id === 'gate-2027').map((w): Watch => ({
            ...w,
            status: 'watching',
            statusNote: 'Checked 20 min ago',
            lastChecked: '20 min ago',
            aiSummary: undefined,
            timeline: [{ id: 't1', when: 'Today', kind: 'started', text: 'Started watching' }],
          })),
        );
      },
      signOut: () => {
        setSession('signed_out');
        setWatches(MOCK_WATCHES);
      },
      setDraft: (d) => setDraftState((prev) => ({ ...prev, ...d })),
      resetDraft: () => setDraftState(emptyDraft),
      createWatchFromDraft: () => {
        const sites = draft.urls.map(siteFromUrl).filter((s): s is string => !!s);
        const id = 'w-' + Date.now();
        const watch: Watch = {
          id,
          name: draft.goal.replace(/^(tell me|alert me|notify me)\s+(when|if)\s+/i, '').replace(/^\w/, (c) => c.toUpperCase()) || 'New watch',
          goal: previewSentence(sites, draft.goal, draft.interval),
          status: 'watching',
          interval: draft.interval,
          lastChecked: 'just now',
          statusNote: 'Checked just now',
          pages: sites.map((site, i) => ({ id: 'p' + i, site, title: site, url: draft.urls[i], lastChecked: 'just now' })),
          timeline: [{ id: 't1', when: 'Just now', kind: 'started', text: `Started watching ${sites.length > 1 ? sites.length + ' sites' : ''}`.trim() }],
        };
        setWatches((prev) => [watch, ...prev]);
        setDraftState(emptyDraft);
        return id;
      },
      togglePause: (id) =>
        setWatches((prev) =>
          prev.map((w): Watch =>
            w.id === id
              ? w.status === 'paused'
                ? { ...w, status: 'watching', statusNote: 'Checked just now' }
                : { ...w, status: 'paused', statusNote: 'Paused just now' }
              : w,
          ),
        ),
      deleteWatch: (id) => setWatches((prev) => prev.filter((w) => w.id !== id)),
      setFeedback: (watchId, eventId, value) =>
        setWatches((prev) =>
          prev.map((w) =>
            w.id !== watchId ? w : { ...w, timeline: w.timeline.map((e) => (e.id === eventId ? { ...e, feedback: value } : e)) },
          ),
        ),
      toggleSource: (id) => setWatchedSources((prev) => ({ ...prev, [id]: !prev[id] })),
    }),
    [session, watches, watchedSources, draft, limits, activeCount],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppStoreProvider');
  return ctx;
}
