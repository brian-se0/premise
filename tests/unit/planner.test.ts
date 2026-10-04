import { describe, expect, it } from 'vitest';
import { loadExercises } from '../../scripts/content.ts';
import { addDays, isDueOn, localDate } from '../../src/domain/dates.ts';
import {
  dueTaskIds,
  openMisses,
  planExercise,
  planNewOnly,
  planToday,
  type PlannerState,
} from '../../src/domain/planner.ts';
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
    sessions: [],
    settings: { finalWeeks: false, dailyReviewCap: DEFAULT_SETTINGS.dailyReviewCap, focus: { tag: null, note: '' } },
    today: TODAY,
    ...extra,
  };
}

let n = 0;
function graded(
  taskId: string,
  score: number,
  max: number,
  tags: string[],
  day: string,
  extra: Partial<AttemptRecord> = {},
) {
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
    ...extra,
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

/** An attempt opened today in a session (shown, not graded). */
function opened(taskId: string, sessionId: string, extra: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    ...graded(taskId, 0, 1, [], TODAY).attempt,
    sessionId,
    state: 'submitted',
    currentGradingId: null,
    ...extra,
  };
}

function dueYesterday(card: CardRecord): CardRecord {
  return { ...card, due: '2026-10-09T00:00:00.000Z' };
}

const FINAL = { finalWeeks: true, dailyReviewCap: 2, focus: { tag: null, note: '' } };

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

describe('planner repair loop', () => {
  it('reserves a fresh repair under a full review load and puts it before the repeat', () => {
    const miss = graded('arg-0003.flaw', 0, 2, ['wrong-gap'], '2026-10-01');
    const others = ['arg-0002.assumption', 'arg-0006.assumption', 'arg-0008.assumption'].map((t) =>
      graded(t, 2, 2, [], '2026-10-01'),
    );
    const all = [miss, ...others];
    const s = state({
      attempts: all.map((x) => x.attempt),
      gradings: all.map((x) => x.grading),
      cards: all.map((x) => dueYesterday(x.card)),
    });
    expect(dueTaskIds(s)).toHaveLength(4);
    const plan = planToday(s);
    expect(plan).toHaveLength(4);
    const repair = plan.findIndex((e) => e.reason === 'repair');
    expect(plan[repair]).toMatchObject({ repairs: 'arg-0003.flaw' });
    expect(plan[repair]!.taskId).toMatch(/^arg-000[1457]\.flaw$/);
    const repeat = plan.findIndex((e) => e.taskId === 'arg-0003.flaw');
    expect(repeat).toBeGreaterThan(repair);
    expect(plan.filter((e) => e.reason === 'review')).toHaveLength(3);
  });

  it('holds back a repeat when its fresh repair does not fit', () => {
    const miss = graded('arg-0003.flaw', 0, 2, ['wrong-gap'], '2026-10-01');
    const s = state({ attempts: [miss.attempt], gradings: [miss.grading], cards: [dueYesterday(miss.card)] });
    expect(planToday(s, 1)).toEqual([expect.objectContaining({ reason: 'repair', repairs: 'arg-0003.flaw' })]);
  });

  it('a success on a familiar stimulus leaves the miss open; a fresh one clears it', () => {
    const miss = graded('arg-0003.flaw', 0, 2, ['wrong-gap'], '2026-10-01');
    const familiar = graded('arg-0001.flaw', 2, 2, [], '2026-10-02', { stimulusSeenBefore: true });
    const coached = graded('arg-0004.flaw', 2, 2, [], '2026-10-02', { kind: 'coached' });
    const fresh = graded('arg-0005.flaw', 2, 2, [], '2026-10-03');
    const open = (xs: (typeof miss)[]) =>
      openMisses(state({ attempts: xs.map((x) => x.attempt), gradings: xs.map((x) => x.grading) })).map(
        (m) => m.taskId,
      );
    expect(open([miss, familiar])).toEqual(['arg-0003.flaw']);
    expect(open([miss, coached])).toEqual(['arg-0003.flaw']);
    expect(open([miss, familiar, fresh])).toEqual([]);
  });

  it('repairs only from unseen exercises, and says so when none is left', () => {
    const miss = graded('arg-0003.flaw', 0, 2, ['wrong-gap'], '2026-10-01');
    // Seen but never attempted on their flaw task: arg-0001, arg-0004, arg-0005, arg-0007.
    const shown = ['arg-0001.conclusion', 'arg-0004.weaken', 'arg-0005.conclusion', 'arg-0007.flaw'].map(
      (t): AttemptRecord => ({
        ...graded(t, 0, 1, [], '2026-10-02').attempt,
        state: 'skipped',
        currentGradingId: null,
      }),
    );
    const s = state({ attempts: [miss.attempt, ...shown], gradings: [miss.grading] });
    expect(openMisses(s)).toEqual([expect.objectContaining({ taskId: 'arg-0003.flaw', freshRepair: false })]);
    const plan = planToday(s);
    expect(plan.some((e) => e.reason === 'repair')).toBe(false);
    // A flaw task from a seen exercise may still come as a generic new task, never as a repair.
    for (const e of plan.filter((x) => x.taskId.endsWith('.flaw'))) expect(e.reason).toBe('new');

    const open = openMisses(state({ attempts: [miss.attempt], gradings: [miss.grading] }));
    expect(open[0]!.freshRepair).toBe(true);
  });
});

describe('planner policies on due reviews', () => {
  it('final-weeks mode drops easy due reviews and applies the remaining daily cap', () => {
    const reviewedToday = graded('arg-0007.flaw', 2, 2, [], TODAY, { kind: 'review', sessionId: 'today1' });
    const easy = graded('arg-0006.assumption', 2, 2, [], '2026-10-01');
    const medium = graded('arg-0004.flaw', 2, 2, [], '2026-10-01');
    const medium2 = graded('arg-0005.flaw', 2, 2, [], '2026-10-01');
    const due = [easy, medium, medium2];
    const s = state({
      attempts: [reviewedToday.attempt, ...due.map((x) => x.attempt)],
      gradings: [reviewedToday.grading, ...due.map((x) => x.grading)],
      cards: [reviewedToday.card, ...due.map((x) => dueYesterday(x.card))],
      sessions: [{ id: 'today1', mode: 'today' }],
      settings: FINAL,
    });
    expect(dueTaskIds(s)).toEqual(['arg-0004.flaw', 'arg-0005.flaw']);
    const reviews = planToday(s).filter((e) => e.reason === 'review');
    expect(reviews).toEqual([{ taskId: 'arg-0004.flaw', reason: 'review' }]); // cap 2, one used today
    for (const e of planToday(s)) {
      expect(exercises.find((x) => x.id === exerciseOf(e.taskId))!.difficulty).toBeGreaterThanOrEqual(3);
    }
  });

  it('final-weeks mode may offer an easier fresh repair, explicitly', () => {
    const miss = graded('arg-0006.assumption', 0, 2, ['restates-conclusion'], '2026-10-01');
    const plan = planToday(state({ attempts: [miss.attempt], gradings: [miss.grading], settings: FINAL }));
    // arg-0002 and arg-0003 are difficulty 2, below the final-weeks floor of 3.
    expect(plan[0]).toMatchObject({ reason: 'repair', repairs: 'arg-0006.assumption' });
    expect(plan[0]!.taskId).toMatch(/^arg-000[23]\.assumption$/);
    expect(plan.slice(1).every((e) => e.reason === 'new')).toBe(true);
    expect(plan.filter((e) => e.taskId === 'arg-0006.assumption')).toEqual([]); // easy repeat stays out
  });

  it('mastered conclusions stop coming back as due reviews but stay in the Library', () => {
    const a = graded('arg-0005.conclusion', 1, 1, [], '2026-10-01');
    const b = graded('arg-0008.conclusion', 1, 1, [], '2026-10-02');
    const base = { attempts: [a.attempt, b.attempt], gradings: [a.grading, b.grading] };
    const s = state({ ...base, cards: [a.card, b.card].map(dueYesterday) });
    expect(dueTaskIds(s)).toEqual([]);
    expect(planToday(s).some((e) => e.taskId.endsWith('.conclusion'))).toBe(false);
    expect(planExercise(s, 'arg-0005')).toContainEqual({ taskId: 'arg-0005.conclusion', reason: 'review' });

    // A later wrong-claim miss brings them back.
    const c = graded('arg-0004.flaw', 0, 2, ['premise-as-conclusion'], '2026-10-03');
    const back = state({
      attempts: [...base.attempts, c.attempt],
      gradings: [...base.gradings, c.grading],
      cards: [a.card, b.card].map(dueYesterday),
    });
    expect(dueTaskIds(back)).toEqual(['arg-0005.conclusion', 'arg-0008.conclusion']);
  });

  it('coached successes are not evidence of conclusion mastery', () => {
    const a = graded('arg-0005.conclusion', 1, 1, [], '2026-10-01', { kind: 'coached' });
    const b = graded('arg-0008.conclusion', 1, 1, [], '2026-10-02', { kind: 'coached' });
    const plan = planNewOnly(state({ attempts: [a.attempt, b.attempt], gradings: [a.grading, b.grading] }), {
      skill: 'conclusion',
      difficulty: null,
    });
    expect(plan.length).toBeGreaterThan(0);
  });
});

describe('daily exposure', () => {
  it('two New only sessions on one day never share an exercise', () => {
    const filter = { skill: null, difficulty: 3 };
    const first = planNewOnly(state(), filter);
    expect(first.map((e) => exerciseOf(e.taskId))).toEqual(['arg-0004', 'arg-0005', 'arg-0007']);
    const s = state({
      attempts: first.map((e) => opened(e.taskId, 'new1')),
      sessions: [{ id: 'new1', mode: 'new' }],
    });
    expect(planNewOnly(s, filter)).toEqual([]);
    const today = planToday(s);
    for (const e of today) expect(['arg-0004', 'arg-0005', 'arg-0007']).not.toContain(exerciseOf(e.taskId));
  });

  it('siblings share a day only when both are due reviews', () => {
    const f = graded('arg-0004.flaw', 2, 2, [], '2026-10-01');
    const w = graded('arg-0004.weaken', 2, 2, [], '2026-10-01');
    const base = { attempts: [f.attempt, w.attempt], gradings: [f.grading, w.grading] };
    const both = planToday(state({ ...base, cards: [f.card, w.card].map(dueYesterday) }));
    expect(both.filter((e) => e.reason === 'review').map((e) => e.taskId)).toEqual([
      'arg-0004.flaw',
      'arg-0004.weaken',
    ]);

    // One due today, the sibling already seen today in a Library session: not a due review, so no.
    const lib = opened('arg-0004.flaw', 'lib1', { kind: 'review' });
    const mixed = planToday(
      state({
        attempts: [...base.attempts, lib],
        gradings: base.gradings,
        cards: [f.card, dueYesterday(w.card)],
        sessions: [{ id: 'lib1', mode: 'library' }],
      }),
    );
    expect(mixed.some((e) => exerciseOf(e.taskId) === 'arg-0004')).toBe(false);

    // The same exposure from a Today session's due review allows the due sibling.
    const due = opened('arg-0004.flaw', 'today1', { kind: 'review' });
    const allowed = planToday(
      state({
        attempts: [...base.attempts, due],
        gradings: base.gradings,
        cards: [f.card, dueYesterday(w.card)],
        sessions: [{ id: 'today1', mode: 'today' }],
      }),
    );
    expect(allowed).toContainEqual({ taskId: 'arg-0004.weaken', reason: 'review' });
  });
});
