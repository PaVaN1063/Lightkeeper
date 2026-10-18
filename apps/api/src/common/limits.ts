import { Plan } from '../auth/current-user';

/** Plan rules from the product plan. Paused and finished watches don't count toward the limit. */
export const PLAN_LIMITS: Record<Plan, { activeWatches: number; pagesPerWatch: number; minIntervalMin: number }> = {
  guest: { activeWatches: 1, pagesPerWatch: 2, minIntervalMin: 60 },
  free: { activeWatches: 3, pagesPerWatch: 2, minIntervalMin: 60 },
};
