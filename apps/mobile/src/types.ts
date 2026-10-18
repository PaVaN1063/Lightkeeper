export type WatchStatus = 'goal_met' | 'watching' | 'paused';
export type CheckInterval = '1h' | '30m' | '10m';
export type Feedback = 'useful' | 'not_useful' | null;

export type SitePage = {
  id: string;
  site: string; // e.g. "amazon.in"
  title: string; // page title
  url: string;
  price?: number; // current price, for price watches
  lastChecked: string; // human label, e.g. "8 min ago"
};

export type TimelineEvent = {
  id: string;
  when: string;
  kind: 'alert' | 'change' | 'started';
  title?: string;
  text: string;
  site?: string; // which page this came from (multi-site watches)
  feedback?: Feedback;
};

export type Watch = {
  id: string;
  name: string;
  goal: string; // the user's goal, rewritten by AI
  status: WatchStatus;
  interval: CheckInterval;
  lastChecked: string;
  statusNote: string; // e.g. "12 min ago", "Since Oct 14"
  pages: SitePage[];
  targetPrice?: number;
  aiSummary?: string; // latest one-line AI summary when goal met
  timeline: TimelineEvent[];
};

export type SourceCategory = 'Exams' | 'Jobs' | 'Results' | 'Local';

export type Source = {
  id: string;
  badge: string;
  name: string;
  goal: string;
  site: string;
  category: SourceCategory;
};

export type DraftWatch = {
  urls: string[];
  goal: string;
  interval: CheckInterval;
};
