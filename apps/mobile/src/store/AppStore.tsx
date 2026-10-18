// App state backed by the Lightkeeper API. Sign-in is still mocked (a random id per install);
// Firebase Auth replaces that later without changing the screens.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiError, loadClientId, resetClientId, setPlan } from '../api/client';
import { ApiSource, ApiWatch, ParsedGoal, toSource, toWatch } from '../api/mappers';
import { PLAN_LIMITS } from '../data/mock';
import { DraftWatch, Feedback, Source, Watch } from '../types';

type Session = 'signed_out' | 'guest' | 'user';

type AppState = {
  ready: boolean;
  session: Session;
  watches: Watch[];
  sources: Source[];
  watchedSources: Record<string, boolean>;
  loading: boolean;
  error: ApiError | null;
  draft: DraftWatch;
  limits: { watches: number; pagesPerWatch: number };
  activeCount: number;
  canAddWatch: boolean;
  refresh: () => Promise<void>;
  signIn: () => void;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  setDraft: (d: Partial<DraftWatch>) => void;
  resetDraft: () => void;
  parseDraft: () => Promise<ParsedGoal>;
  createWatchFromDraft: () => Promise<string>;
  togglePause: (id: string) => Promise<void>;
  deleteWatch: (id: string) => Promise<void>;
  checkNow: (id: string) => Promise<void>;
  setFeedback: (watchId: string, eventId: string, value: Feedback) => Promise<void>;
  toggleSource: (id: string) => Promise<void>;
};

const SESSION_KEY = 'lightkeeper.session';
const emptyDraft: DraftWatch = { urls: [''], goal: '', interval: '1h' };
const intervalMin = { '1h': 60, '30m': 30, '10m': 10 } as const;

const AppContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSessionState] = useState<Session>('signed_out');
  const [rawWatches, setRawWatches] = useState<ApiWatch[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [draft, setDraftState] = useState<DraftWatch>(emptyDraft);
  const [, setTick] = useState(0); // re-render every 30 s so "8 min ago" stays fresh
  const sessionRef = useRef<Session>('signed_out');

  const setSession = useCallback((s: Session) => {
    sessionRef.current = s;
    setSessionState(s);
    setPlan(s === 'guest' ? 'guest' : 'free');
    AsyncStorage.setItem(SESSION_KEY, s).catch(() => undefined);
  }, []);

  const refresh = useCallback(async () => {
    if (sessionRef.current === 'signed_out') return;
    setLoading(true);
    try {
      const [w, s] = await Promise.all([api<ApiWatch[]>('/watches'), api<ApiSource[]>('/sources')]);
      setRawWatches(w);
      setSources(s.map(toSource));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError(String(e), 'UNKNOWN', 0));
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore the session on start.
  useEffect(() => {
    (async () => {
      await loadClientId();
      let saved: string | null = null;
      try {
        saved = await AsyncStorage.getItem(SESSION_KEY);
      } catch {
        saved = null;
      }
      if (saved === 'guest' || saved === 'user') setSession(saved);
      setReady(true);
    })();
  }, [setSession]);

  // Load when signed in, then poll every 30 seconds so new checks and alerts show up.
  useEffect(() => {
    if (session === 'signed_out') return;
    refresh();
    const t = setInterval(() => {
      refresh();
      setTick((n) => n + 1);
    }, 30_000);
    return () => clearInterval(t);
  }, [session, refresh]);

  const replaceWatch = (w: ApiWatch) => setRawWatches((prev) => (prev.some((x) => x.id === w.id) ? prev.map((x) => (x.id === w.id ? w : x)) : [w, ...prev]));

  const watches = useMemo(() => rawWatches.map(toWatch), [rawWatches]);
  const limits = session === 'guest' ? PLAN_LIMITS.guest : PLAN_LIMITS.free;
  const activeCount = rawWatches.filter((w) => w.status === 'watching').length;
  const watchedSources = useMemo(() => Object.fromEntries(rawWatches.filter((w) => w.sourceId).map((w) => [w.sourceId as string, true])), [rawWatches]);

  const value: AppState = {
    ready,
    session,
    watches,
    sources,
    watchedSources,
    loading,
    error,
    draft,
    limits,
    activeCount,
    canAddWatch: activeCount < limits.watches,
    refresh,
    signIn: () => setSession('user'),
    continueAsGuest: () => setSession('guest'),
    signOut: async () => {
      await resetClientId();
      setRawWatches([]);
      setSession('signed_out');
    },
    setDraft: (d) => setDraftState((prev) => ({ ...prev, ...d })),
    resetDraft: () => setDraftState(emptyDraft),
    parseDraft: () =>
      api<ParsedGoal>('/watches/parse', { method: 'POST', body: { urls: draft.urls.filter((u) => u.trim()), goal: draft.goal, intervalMin: intervalMin[draft.interval] } }),
    createWatchFromDraft: async () => {
      const w = await api<ApiWatch>('/watches', {
        method: 'POST',
        body: { urls: draft.urls.filter((u) => u.trim()), goal: draft.goal, intervalMin: intervalMin[draft.interval] },
      });
      replaceWatch(w);
      setDraftState(emptyDraft);
      return w.id;
    },
    togglePause: async (id) => {
      const current = rawWatches.find((w) => w.id === id);
      const w = await api<ApiWatch>(`/watches/${id}`, { method: 'PATCH', body: { status: current?.status === 'watching' ? 'paused' : 'watching' } });
      replaceWatch(w);
    },
    deleteWatch: async (id) => {
      await api(`/watches/${id}`, { method: 'DELETE' });
      setRawWatches((prev) => prev.filter((w) => w.id !== id));
    },
    checkNow: async (id) => {
      const w = await api<ApiWatch>(`/watches/${id}/check`, { method: 'POST' });
      replaceWatch(w);
    },
    setFeedback: async (watchId, eventId, value) => {
      // Update the screen first, then save.
      setRawWatches((prev) => prev.map((w) => (w.id !== watchId ? w : { ...w, events: w.events.map((e) => (e.id === eventId ? { ...e, feedback: value } : e)) })));
      await api(`/events/${eventId}/feedback`, { method: 'POST', body: { value } }).catch(() => undefined);
    },
    toggleSource: async (sourceId) => {
      const existing = rawWatches.find((w) => w.sourceId === sourceId);
      if (existing) {
        await api(`/watches/${existing.id}`, { method: 'DELETE' });
        setRawWatches((prev) => prev.filter((w) => w.id !== existing.id));
      } else {
        const w = await api<ApiWatch>('/watches', { method: 'POST', body: { sourceId } });
        replaceWatch(w);
      }
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppStoreProvider');
  return ctx;
}
