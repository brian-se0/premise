// Scheduler versions (ARCHITECTURE.md §6.5). Adding a version or changing parameters
// requires a DECISIONS.md entry.

export interface SchedulerConfig {
  request_retention: number;
  maximum_interval: number;
  enable_fuzz: boolean;
  enable_short_term: boolean;
  w: readonly number[];
}

/** Default parameters of ts-fsrs 5.4.2, copied so an upgrade cannot change them silently. */
const TS_FSRS_5_4_2_DEFAULT_W = [
  0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483,
  0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
] as const;

// Versions come from imported files. A null prototype makes every lookup, including callers that
// use bracket notation, an own-key lookup rather than an Object.prototype lookup.
export const SCHEDULER_CONFIGS: Record<string, SchedulerConfig> = Object.assign(
  Object.create(null) as Record<string, SchedulerConfig>,
  {
    'fsrs-1': {
      request_retention: 0.9,
      maximum_interval: 365,
      enable_fuzz: false,
      enable_short_term: false,
      w: TS_FSRS_5_4_2_DEFAULT_W,
    },
  },
);

export function schedulerConfig(version: string): SchedulerConfig | undefined {
  return Object.hasOwn(SCHEDULER_CONFIGS, version) ? SCHEDULER_CONFIGS[version] : undefined;
}

export const CURRENT_SCHEDULER = 'fsrs-1';
export const RATING_POLICY = 'v1';
