// Session planner (SPEC.md §5.1, ARCHITECTURE.md §6.4), in its simplest form for M2.
// Pure: the caller passes in content, stored state and today's local date.

import { studyableTasks } from './availability.ts';
import { isDueOn, localDateOf, type LocalDate } from './dates.ts';
import type { AttemptRecord, CardRecord, GradingRecord, SessionRecord, Settings, TaskStateRecord } from './records.ts';
import { taskId as idOf } from './snapshot.ts';
import type { BuiltExercise, Task } from './types.ts';

export interface PlannerTask {
  taskId: string;
  exerciseId: string;
  skill: string;
  difficulty: number;
  likelyErrors: string[];
}

export interface PlannerState {
  exercises: BuiltExercise[];
  attempts: AttemptRecord[];
  gradings: GradingRecord[];
  cards: CardRecord[];
  taskStates: TaskStateRecord[];
  /** Session modes, to tell today's due reviews from other exposures (daily exposure rule). */
  sessions: Pick<SessionRecord, 'id' | 'mode'>[];
  settings: Pick<Settings, 'finalWeeks' | 'dailyReviewCap' | 'focus'>;
  today: LocalDate;
}

export interface PlannedEntry {
  taskId: string;
  reason: 'review' | 'repair' | 'new';
  /** For a repair: the missed task this fresh-stimulus task checks. */
  repairs?: string;
}

/** An accepted, uncoached miss that no later fresh-stimulus success has repaired. */
export interface OpenMiss {
  taskId: string;
  skill: string;
  tags: string[];
  at: string;
  /**
   * Whether an exercise the student has never seen can check this miss (same skill, a shared
   * likely error, eligible today). When false the planner cannot offer a fresh check; the UI
   * should say so rather than promise one.
   */
  freshRepair: boolean;
}

export const SESSION_SIZE = 4;
export const FINAL_WEEKS_MIN_DIFFICULTY = 3;
/** Error tags that show an answer attacked the wrong claim, which brings conclusion tasks back. */
const WRONG_CLAIM_TAGS = ['premise-as-conclusion', 'counterpoint-as-conclusion'];
const REPAIR_WINDOW_DAYS = 30;

/** Tasks that can be studied (availability.ts), with what the planner needs. */
export function availableTasks(exercises: BuiltExercise[]): PlannerTask[] {
  return exercises.flatMap((e) =>
    studyableTasks(e).map((t: Task) => ({
      taskId: idOf(e, t),
      exerciseId: e.id,
      skill: t.skill,
      difficulty: t.difficulty ?? e.difficulty,
      likelyErrors: t.likely_errors,
    })),
  );
}

function exerciseOf(taskId: string): string {
  return taskId.slice(0, taskId.indexOf('.'));
}

/** Tasks with an answer waiting for a grade are not offered (ARCHITECTURE.md §5.2). */
export function awaitingTaskIds(attempts: AttemptRecord[], gradings: GradingRecord[]): Set<string> {
  const byId = new Map(gradings.map((g) => [g.id, g]));
  return new Set(
    attempts
      .filter((a) => a.state === 'submitted')
      .filter((a) => {
        const g = a.currentGradingId ? byId.get(a.currentGradingId) : undefined;
        return !g || g.status !== 'accepted';
      })
      .map((a) => a.taskId),
  );
}

/** Whether a task may be offered today: not suspended, not before its notBefore date, not awaiting a grade. */
export function eligibility(state: PlannerState): (taskId: string) => boolean {
  const states = new Map(state.taskStates.map((s) => [s.taskId, s]));
  const awaiting = awaitingTaskIds(state.attempts, state.gradings);
  return (taskId) => {
    const s = states.get(taskId);
    if (s?.suspended) return false;
    if (s?.notBefore && state.today < s.notBefore) return false;
    return !awaiting.has(taskId);
  };
}

/** Accepted gradings with a score, joined to their submitted attempts, oldest submission first. */
function acceptedHistory(state: PlannerState): { g: GradingRecord; a: AttemptRecord }[] {
  const attemptById = new Map(state.attempts.map((a) => [a.id, a]));
  return state.gradings
    .filter((g) => g.status === 'accepted' && g.score !== null)
    .map((g) => ({ g, a: attemptById.get(g.attemptId) }))
    .filter((x): x is { g: GradingRecord; a: AttemptRecord } => !!x.a?.submittedAt)
    .sort((x, y) => (x.a.submittedAt! < y.a.submittedAt! ? -1 : x.a.submittedAt! > y.a.submittedAt! ? 1 : 0));
}

/**
 * Selective conclusion tasks (SPEC.md §5.1.10): useful until two uncoached full-credit
 * conclusions on difficulty 3 or more, and again after an uncoached miss tagged as attacking
 * the wrong claim. Coached attempts are not evidence either way.
 */
function conclusionStillUseful(state: PlannerState, taskById: Map<string, PlannerTask>): boolean {
  let solid = 0;
  for (const { g, a } of acceptedHistory(state)) {
    const t = taskById.get(a.taskId);
    if (!t || a.kind === 'coached') continue;
    if (t.skill === 'conclusion' && g.score === g.max && t.difficulty >= FINAL_WEEKS_MIN_DIFFICULTY) solid++;
    if (g.score! < g.max && g.tags.some((tag) => WRONG_CLAIM_TAGS.includes(tag))) solid = 0;
  }
  return solid < 2;
}

/**
 * What the automatic planners (Today, New only) may offer at all, due or new: final-weeks
 * mode keeps difficulty 3 and up, and conclusion tasks follow the selective policy. Cards are
 * never deleted, and Library sessions (planExercise) ignore this.
 */
function automaticPolicy(state: PlannerState, tasks: PlannerTask[]): (t: PlannerTask) => boolean {
  const taskById = new Map(tasks.map((t) => [t.taskId, t]));
  const conclusionOk = conclusionStillUseful(state, taskById);
  const minDifficulty = state.settings.finalWeeks ? FINAL_WEEKS_MIN_DIFFICULTY : 1;
  return (t) => t.difficulty >= minDifficulty && (t.skill !== 'conclusion' || conclusionOk);
}

/** Due reviews the automatic planner may offer today, earliest due first (before the final-weeks cap). */
export function dueTaskIds(state: PlannerState): string[] {
  const tasks = availableTasks(state.exercises);
  const taskById = new Map(tasks.map((t) => [t.taskId, t]));
  const offered = automaticPolicy(state, tasks);
  const ok = eligibility(state);
  return state.cards
    .filter((c) => {
      const t = taskById.get(c.taskId);
      return !!t && offered(t) && isDueOn(c.due, state.today) && ok(c.taskId);
    })
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
    .map((c) => c.taskId);
}

/** Exercises with any attempt, whatever happened to it: their stimulus has been seen (SPEC.md §5.1.3). */
function seenExercises(state: PlannerState): Set<string> {
  return new Set(state.attempts.map((a) => exerciseOf(a.taskId)));
}

/**
 * Genuine repair candidates for a miss: tasks on an exercise the student has never seen, with the
 * miss's skill and a shared likely error, eligible today and allowed by the conclusion policy.
 * The final-weeks difficulty floor deliberately does not apply (SPEC.md §5.1.11: easier tasks
 * only to rebuild a distinction just missed); tasks meeting the floor are still preferred.
 */
function repairCandidates(
  state: PlannerState,
  tasks: PlannerTask[],
  miss: Pick<OpenMiss, 'taskId' | 'skill' | 'tags'>,
  seen: Set<string>,
): PlannerTask[] {
  const ok = eligibility(state);
  const taskById = new Map(tasks.map((t) => [t.taskId, t]));
  const conclusionOk = conclusionStillUseful(state, taskById);
  const floor = state.settings.finalWeeks ? FINAL_WEEKS_MIN_DIFFICULTY : 1;
  const focus = state.settings.focus.tag;
  return tasks
    .filter(
      (t) =>
        !seen.has(t.exerciseId) &&
        t.exerciseId !== exerciseOf(miss.taskId) &&
        t.skill === miss.skill &&
        t.likelyErrors.some((e) => miss.tags.includes(e)) &&
        (t.skill !== 'conclusion' || conclusionOk) &&
        ok(t.taskId),
    )
    .sort((a, b) =>
      compareRanks(
        [a.difficulty >= floor ? 0 : 1, focus && a.likelyErrors.includes(focus) ? 0 : 1, a.difficulty],
        [b.difficulty >= floor ? 0 : 1, focus && b.likelyErrors.includes(focus) ? 0 : 1, b.difficulty],
        a.taskId,
        b.taskId,
      ),
    );
}

/**
 * Accepted, uncoached misses in the last 30 days that no later fresh-stimulus success repaired.
 * A miss clears only on full credit from an uncoached attempt on a stimulus the student had not
 * seen before (stimulusSeenBefore false), on a different exercise with the same skill and a
 * shared likely error. Success on a familiar stimulus is not transfer, so it leaves the miss open.
 */
export function openMisses(state: PlannerState, tasks = availableTasks(state.exercises)): OpenMiss[] {
  const taskById = new Map(tasks.map((t) => [t.taskId, t]));
  const cutoff = new Date(`${state.today}T00:00:00`);
  cutoff.setDate(cutoff.getDate() - REPAIR_WINDOW_DAYS);

  const misses: Omit<OpenMiss, 'freshRepair'>[] = [];
  for (const { g, a } of acceptedHistory(state)) {
    const task = taskById.get(a.taskId);
    if (!task || a.kind === 'coached' || new Date(a.submittedAt!) < cutoff) continue;
    if (g.score! < g.max) {
      misses.push({
        taskId: a.taskId,
        skill: task.skill,
        tags: g.tags.length ? g.tags : task.likelyErrors,
        at: a.submittedAt!,
      });
      continue;
    }
    if (a.stimulusSeenBefore) continue;
    for (let i = misses.length - 1; i >= 0; i--) {
      const m = misses[i]!;
      if (
        exerciseOf(m.taskId) !== task.exerciseId &&
        m.skill === task.skill &&
        m.tags.some((t) => task.likelyErrors.includes(t))
      ) {
        misses.splice(i, 1);
      }
    }
  }
  const seen = seenExercises(state);
  return misses.map((m) => ({ ...m, freshRepair: repairCandidates(state, tasks, m, seen).length > 0 }));
}

/**
 * The daily exposure rule shared by the automatic planners (SPEC.md §5.1.3): no two tasks of one
 * exercise on the same local day unless both are due reviews. Maps each exercise shown today (or
 * planned so far) to whether every task of it was a due review. Library sessions are exempt as a
 * planner, but what they showed still counts as shown.
 */
class DailyExposure {
  private readonly shown = new Map<string, boolean>();

  constructor(state: PlannerState) {
    const modeById = new Map(state.sessions.map((s) => [s.id, s.mode]));
    for (const a of state.attempts) {
      if (localDateOf(a.startedAt) !== state.today) continue;
      // A review attempt opened from a Today session is a due review; anything else is not.
      this.add(exerciseOf(a.taskId), a.kind === 'review' && modeById.get(a.sessionId) === 'today');
    }
  }

  fits(exerciseId: string, dueReview: boolean): boolean {
    const allDue = this.shown.get(exerciseId);
    return allDue === undefined || (dueReview && allDue);
  }

  add(exerciseId: string, dueReview: boolean): void {
    this.shown.set(exerciseId, (this.shown.get(exerciseId) ?? true) && dueReview);
  }
}

/**
 * Today's session, up to the session size:
 * 1. one slot is reserved for a fresh repair when any open miss has one, even under a full review load;
 * 2. due reviews (final-weeks floor and conclusion policy applied; in final-weeks mode capped per
 *    day, open misses first). A missed task is repeated only after its fresh repair, in the same
 *    session; if both do not fit, the repeat waits. A miss with no fresh repair is repeated as usual;
 * 3. fresh repairs for remaining open misses;
 * 4. new tasks (generic fallback; never labelled a repair).
 * Repairs come first in the returned order, then the rest grouped by stimulus. The daily
 * exposure rule applies throughout.
 */
export function planToday(state: PlannerState, size = SESSION_SIZE): PlannedEntry[] {
  const tasks = availableTasks(state.exercises);
  const taskById = new Map(tasks.map((t) => [t.taskId, t]));
  const ok = eligibility(state);
  const misses = openMisses(state, tasks);
  const seen = seenExercises(state);
  const exposure = new DailyExposure(state);

  let due = dueTaskIds(state);
  if (state.settings.finalWeeks) {
    const missed = new Set(misses.map((m) => m.taskId));
    const reviewedToday = state.attempts.filter(
      (a) => a.kind === 'review' && a.submittedAt && localDateOf(a.submittedAt) === state.today,
    ).length;
    const cap = Math.max(0, state.settings.dailyReviewCap - reviewedToday);
    due = [...due.filter((t) => missed.has(t)), ...due.filter((t) => !missed.has(t))].slice(0, cap);
  }
  const dueSet = new Set(due);
  // Misses whose task is due today first, then oldest first.
  const byPriority = [...misses.filter((m) => dueSet.has(m.taskId)), ...misses.filter((m) => !dueSet.has(m.taskId))];

  const entries: PlannedEntry[] = [];
  const repaired = new Set<string>();
  const take = (taskId: string, reason: PlannedEntry['reason'], repairs?: string) => {
    entries.push(repairs ? { taskId, reason, repairs } : { taskId, reason });
    exposure.add(exerciseOf(taskId), reason === 'review');
  };
  const repairFor = (m: OpenMiss) =>
    m.freshRepair ? repairCandidates(state, tasks, m, seen).find((t) => exposure.fits(t.exerciseId, false)) : undefined;
  const placeRepair = (m: OpenMiss): boolean => {
    if (repaired.has(m.taskId)) return true;
    const fix = repairFor(m);
    if (!fix) return false;
    take(fix.taskId, 'repair', m.taskId);
    repaired.add(m.taskId);
    return true;
  };

  // 1. Reserve a fresh-repair slot.
  for (const m of byPriority) {
    if (entries.length >= size) break;
    if (placeRepair(m)) break;
  }
  // 2. Due reviews; a missed task's repeat only after its fresh repair.
  for (const taskId of due) {
    if (entries.length >= size) break;
    if (!exposure.fits(exerciseOf(taskId), true)) continue;
    const needs = misses.filter((m) => m.taskId === taskId && m.freshRepair);
    if (needs.length > 0 && !repaired.has(taskId)) {
      if (entries.length + 2 > size || !needs.some(placeRepair)) continue;
    }
    take(taskId, 'review');
  }
  // 3. Fresh repairs for other open misses.
  for (const m of byPriority) {
    if (entries.length >= size) break;
    placeRepair(m);
  }
  // 4. New tasks.
  for (const t of newCandidates(state, tasks)) {
    if (entries.length >= size) break;
    if (ok(t.taskId) && exposure.fits(t.exerciseId, false)) take(t.taskId, 'new');
  }

  const repairs = entries.filter((e) => e.reason === 'repair');
  return [
    ...repairs,
    ...groupByStimulus(
      entries.filter((e) => e.reason !== 'repair'),
      taskById,
    ),
  ];
}

function compareRanks(ra: number[], rb: number[], ida: string, idb: string): number {
  for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i]! - rb[i]!;
  return ida < idb ? -1 : ida > idb ? 1 : 0;
}

/** New tasks in preference order: unseen stimuli first, focus matches first, easier first. */
export function newCandidates(state: PlannerState, tasks = availableTasks(state.exercises)): PlannerTask[] {
  const carded = new Set(state.cards.map((c) => c.taskId));
  const attempted = new Set(
    state.attempts.filter((a) => a.state !== 'draft' && a.state !== 'skipped').map((a) => a.taskId),
  );
  const seen = seenExercises(state);
  const focus = state.settings.focus.tag;
  const offered = automaticPolicy(state, tasks);
  const fresh = tasks.filter((t) => !carded.has(t.taskId) && !attempted.has(t.taskId) && offered(t));
  const rank = (t: PlannerTask) => [
    seen.has(t.exerciseId) ? 1 : 0,
    focus && t.likelyErrors.includes(focus) ? 0 : 1,
    t.difficulty,
  ];
  return fresh.sort((a, b) => compareRanks(rank(a), rank(b), a.taskId, b.taskId));
}

/** Keeps tasks of one exercise together, in first-appearance order. */
function groupByStimulus(entries: PlannedEntry[], taskById: Map<string, PlannerTask>): PlannedEntry[] {
  const order: string[] = [];
  const groups = new Map<string, PlannedEntry[]>();
  for (const e of entries) {
    const ex = taskById.get(e.taskId)?.exerciseId ?? exerciseOf(e.taskId);
    if (!groups.has(ex)) {
      groups.set(ex, []);
      order.push(ex);
    }
    groups.get(ex)!.push(e);
  }
  return order.flatMap((ex) => groups.get(ex)!);
}

/** "New only": unseen tasks filtered by skill and difficulty, under the daily exposure rule. */
export function planNewOnly(
  state: PlannerState,
  filter: { skill: string | null; difficulty: number | null },
  size = SESSION_SIZE,
): PlannedEntry[] {
  const ok = eligibility(state);
  const exposure = new DailyExposure(state);
  const entries: PlannedEntry[] = [];
  for (const t of newCandidates(state)) {
    if (entries.length >= size) break;
    if (!ok(t.taskId) || !exposure.fits(t.exerciseId, false)) continue;
    if (filter.skill && t.skill !== filter.skill) continue;
    if (filter.difficulty && t.difficulty !== filter.difficulty) continue;
    exposure.add(t.exerciseId, false);
    entries.push({ taskId: t.taskId, reason: 'new' });
  }
  return entries;
}

/** A Library session: the chosen exercise's active tasks that are eligible today (no automatic policy). */
export function planExercise(state: PlannerState, exerciseId: string): PlannedEntry[] {
  const ok = eligibility(state);
  const carded = new Set(state.cards.map((c) => c.taskId));
  return availableTasks(state.exercises)
    .filter((t) => t.exerciseId === exerciseId && ok(t.taskId))
    .map((t) => ({ taskId: t.taskId, reason: carded.has(t.taskId) ? ('review' as const) : ('new' as const) }));
}
