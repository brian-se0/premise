import { describe, expect, it } from 'vitest';
import { loadExercises } from '../../scripts/content.ts';
import { addDays, isDueOn, localDate } from '../../src/domain/dates.ts';
import { planExercise, planNewOnly, planToday, type PlannerState } from '../../src/domain/planner.ts';
import type { AttemptRecord, CardRecord, GradingRecord } from '../../src/domain/records.ts';
import { DEFAULT_SETTINGS } from '../../src/domain/records.ts';
import { ratingFor, review, Rating } from '../../src/domain/scheduler.ts';

const exercises = await loadExercises();
const TODAY = '2026-10-10';

function state(extra: Partial<PlannerState> = {}): PlannerState {
  return {
    exercises,
    attempts: [],
    gradings: [],
    cards: [],
    taskStates: [],
    settings: { finalWeeks: false, dailyReviewCap: DEFAULT_SETTINGS.dailyReviewCap, focus: { tag: null, note: '' } },
    today: TODAY,
    ...extra,
  };
}

let n = 0;
function graded(taskId: string, score: number, max: number, tags: string[], day: string) {
  const id = `a${++n}`;
  const at = `${day}T12:00:00.000Z`;
  const attempt: AttemptRecord = {
    id,
    sessionId: 's',
    taskId,
    snapshotHash: 'h',
    answer: 'x',
    state: 'submitted',
    kind: 'new',
    stimulusSeenBefore: false,
    ratingChoice: 'good',
    requestId: 'r',
    currentGradingId: `g${id}`,
    revision: 3,
    startedAt: at,
    submittedAt: at,
    updatedAt: at,
    elapsedSeconds: null,
  };
  const grading: GradingRecord = {
    id: `g${id}`,
    attemptId: id,
    requestId: 'r',
    replyId: null,
    opId: 'o',
    score,
    max,
    tags,
    status: 'accepted',
    source: 'parsed',
    disqualified: false,
    feedbackRange: null,
    createdAt: at,
  };
  const card: CardRecord = {
    ...review('fsrs-1', null, score === max ? Rating.Good : Rating.Again, at).after,
    taskId,
    schedulerVersion: 'fsrs-1',
  };
  return { attempt, grading, card };
}

function exerciseOf(taskId: string) {
  return taskId.split('.')[0];
}

describe('scheduler', () => {
  it('rating policy v1', () => {
    expect(ratingFor(1, 2, 'new', 'easy')).toBe(Rating.Again);
    expect(ratingFor(2, 2, 'review', 'good')).toBe(Rating.Good);
    expect(ratingFor(2, 2, 'review', 'hard')).toBe(Rating.Hard);
    expect(ratingFor(2, 2, 'new', 'easy')).toBe(Rating.Easy);
    expect(ratingFor(2, 2, 'coached', 'good')).toBeNull();
  });

  it('uses whole days and never reviews before the last review', () => {
    const first = review('fsrs-1', null, Rating.Good, '2026-10-05T10:00:00.000Z');
    expect(first.after.scheduled_days).toBeGreaterThanOrEqual(1);
    const late = review('fsrs-1', first.after, Rating.Good, '2026-10-01T10:00:00.000Z');
    expect(late.reviewedAt).toBe('2026-10-05T10:00:00.000Z');
  });

  it('local dates', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(localDate(new Date(2026, 9, 4, 23, 59))).toBe('2026-10-04');
    expect(isDueOn(new Date(2026, 9, 4, 23, 0).toISOString(), '2026-10-04')).toBe(true);
    expect(isDueOn(new Date(2026, 9, 5, 0, 30).toISOString(), '2026-10-04')).toBe(false);
  });
});

describe('planner', () => {
  it('a first session draws one task per unseen exercise, easiest first, conclusion included early on', () => {
    const plan = planToday(state());
    expect(plan).toHaveLength(4);
    expect(new Set(plan.map((e) => exerciseOf(e.taskId))).size).toBe(4);
    expect(plan.every((e) => e.reason === 'new')).toBe(true);
    expect(plan[0]!.taskId.startsWith('arg-0006')).toBe(true);
  });

  it('puts due reviews first, then repairs a miss with a fresh exercise on the same skill and error', () => {
    const miss = graded('arg-0001.flaw', 0, 2, ['correlation-causation', 'missed-alternative'], '2026-10-01');
    const due = { ...miss.card, due: '2026-10-09T00:00:00.000Z' };
    const plan = planToday(state({ attempts: [miss.attempt], gradings: [miss.grading], cards: [due] }));
    expect(plan[0]).toEqual({ taskId: 'arg-0001.flaw', reason: 'review' });
    // No other flaw task lists correlation-causation or missed-alternative, so no repair is possible yet.
    expect(plan.filter((e) => e.reason === 'repair')).toEqual([]);

    const miss2 = graded('arg-0003.flaw', 1, 2, ['wrong-gap'], '2026-10-08');
    const plan2 = planToday(state({ attempts: [miss2.attempt], gradings: [miss2.grading], cards: [miss2.card] }));
    const repair = plan2.find((e) => e.reason === 'repair');
    expect(repair?.taskId).toMatch(/^arg-000[1457]\.flaw$/);
    expect(plan2.indexOf(repair!)).toBeLessThan(plan2.findIndex((e) => e.reason === 'new'));
  });

  it('respects suspension, notBefore, waiting grades and sibling spacing', () => {
    const waiting: AttemptRecord = {
      ...graded('arg-0006.assumption', 0, 2, [], TODAY).attempt,
      currentGradingId: null,
    };
    const plan = planToday(
      state({
        attempts: [waiting],
        taskStates: [
          { taskId: 'arg-0002.conclusion', suspended: true, notBefore: null },
          { taskId: 'arg-0001.conclusion', suspended: false, notBefore: '2026-10-11' },
        ],
      }),
    );
    const ids = plan.map((e) => e.taskId);
    expect(ids).not.toContain('arg-0002.conclusion');
    expect(ids).not.toContain('arg-0001.conclusion');
    expect(ids.some((t) => t.startsWith('arg-0006'))).toBe(false); // touched today
  });

  it('final-weeks mode keeps medium and hard tasks only and caps reviews', () => {
    const plan = planToday(
      state({ settings: { finalWeeks: true, dailyReviewCap: 1, focus: { tag: null, note: '' } } }),
    );
    for (const e of plan) {
      const ex = exercises.find((x) => x.id === exerciseOf(e.taskId))!;
      expect(ex.difficulty).toBeGreaterThanOrEqual(3);
    }
    const a = graded('arg-0004.flaw', 2, 2, [], '2026-10-01');
    const b = graded('arg-0005.flaw', 2, 2, [], '2026-10-01');
    const cards = [a.card, b.card].map((c) => ({ ...c, due: '2026-10-09T00:00:00.000Z' }));
    const capped = planToday(
      state({
        attempts: [a.attempt, b.attempt],
        gradings: [a.grading, b.grading],
        cards,
        settings: { finalWeeks: true, dailyReviewCap: 1, focus: { tag: null, note: '' } },
      }),
    );
    expect(capped.filter((e) => e.reason === 'review')).toHaveLength(1);
  });

  it('stops offering conclusion tasks after two full-credit medium or hard conclusions', () => {
    const a = graded('arg-0005.conclusion', 1, 1, [], '2026-10-01');
    const b = graded('arg-0008.conclusion', 1, 1, [], '2026-10-02');
    const plan = planNewOnly(
      state({ attempts: [a.attempt, b.attempt], gradings: [a.grading, b.grading], cards: [a.card, b.card] }),
      { skill: 'conclusion', difficulty: null },
    );
    expect(plan).toEqual([]);
  });

  it('focus favours tasks with the chosen likely error', () => {
    const plan = planToday(
      state({ settings: { finalWeeks: false, dailyReviewCap: 6, focus: { tag: 'part-to-whole', note: '' } } }),
    );
    expect(plan[0]!.taskId).toBe('arg-0004.flaw');
  });

  it('a library session offers every eligible active task of the exercise', () => {
    expect(planExercise(state(), 'arg-0004').map((e) => e.taskId)).toEqual(['arg-0004.flaw', 'arg-0004.weaken']);
  });
});
