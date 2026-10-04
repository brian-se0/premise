// Session planner (SPEC.md §5.1, ARCHITECTURE.md §6.4), in its simplest form for M2.
// Pure: the caller passes in content, stored state and today's local date.

import { isDueOn, localDateOf, type LocalDate } from './dates.ts';
import type { AttemptRecord, CardRecord, GradingRecord, Settings, TaskStateRecord } from './records.ts';
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
  settings: Pick<Settings, 'finalWeeks' | 'dailyReviewCap' | 'focus'>;
  today: LocalDate;
}

export interface PlannedEntry {
  taskId: string;
  reason: 'review' | 'repair' | 'new';
}

export const SESSION_SIZE = 4;
export const FINAL_WEEKS_MIN_DIFFICULTY = 3;
/** Error tags that show an answer attacked the wrong claim, which brings conclusion tasks back. */
const WRONG_CLAIM_TAGS = ['premise-as-conclusion', 'counterpoint-as-conclusion'];
const REPAIR_WINDOW_DAYS = 30;

/** Tasks that can be studied: active tasks of exercises in the bundle that are not retired. */
export function availableTasks(exercises: BuiltExercise[]): PlannerTask[] {
  return exercises
    .filter((e) => e.status !== 'retired')
    .flatMap((e) =>
      e.tasks
        .filter((t) => t.status === 'active')
        .map((t: Task) => ({
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

export function dueTaskIds(state: PlannerState): string[] {
  const available = new Set(availableTasks(state.exercises).map((t) => t.taskId));
  const ok = eligibility(state);
  return state.cards
    .filter((c) => available.has(c.taskId) && isDueOn(c.due, state.today) && ok(c.taskId))
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
    .map((c) => c.taskId);
}

interface Miss {
  taskId: string;
  skill: string;
  tags: string[];
  at: string;
}

/** Accepted, uncoached misses in the last 30 days that no later fresh-stimulus task repaired. */
export function openMisses(state: PlannerState, tasks: PlannerTask[]): Miss[] {
  const taskById = new Map(tasks.map((t) => [t.taskId, t]));
  const attemptById = new Map(state.attempts.map((a) => [a.id, a]));
  const cutoff = new Date(`${state.today}T00:00:00`);
  cutoff.setDate(cutoff.getDate() - REPAIR_WINDOW_DAYS);
  const graded = state.gradings
    .filter((g) => g.status === 'accepted' && g.score !== null)
    .map((g) => ({ g, a: attemptById.get(g.attemptId) }))
    .filter((x): x is { g: GradingRecord; a: AttemptRecord } => !!x.a && x.a.kind !== 'coached' && !!x.a.submittedAt)
    .sort((x, y) => (x.a.submittedAt! < y.a.submittedAt! ? -1 : 1));

  const misses: Miss[] = [];
  for (const { g, a } of graded) {
    const task = taskById.get(a.taskId);
    if (!task || new Date(a.submittedAt!) < cutoff) continue;
    if (g.score! < g.max) {
      misses.push({
        taskId: a.taskId,
        skill: task.skill,
        tags: g.tags.length ? g.tags : task.likelyErrors,
        at: a.submittedAt!,
      });
      continue;
    }
    // Full credit on a different exercise with the same skill and a shared likely error repairs earlier misses.
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
  return misses;
}

function conclusionStillUseful(state: PlannerState, tasks: PlannerTask[]): boolean {
  const taskById = new Map(tasks.map((t) => [t.taskId, t]));
  const attemptById = new Map(state.attempts.map((a) => [a.id, a]));
  const accepted = state.gradings
    .filter((g) => g.status === 'accepted' && g.score !== null)
    .map((g) => ({ g, a: attemptById.get(g.attemptId) }))
    .filter((x): x is { g: GradingRecord; a: AttemptRecord } => !!x.a?.submittedAt)
    .sort((x, y) => (x.a.submittedAt! < y.a.submittedAt! ? -1 : 1));
  let solid = 0;
  for (const { g, a } of accepted) {
    const t = taskById.get(a.taskId);
    if (!t) continue;
    if (t.skill === 'conclusion' && g.score === g.max && t.difficulty >= FINAL_WEEKS_MIN_DIFFICULTY) solid++;
    if (t.skill !== 'conclusion' && g.score! < g.max && g.tags.some((tag) => WRONG_CLAIM_TAGS.includes(tag))) solid = 0;
  }
  return solid < 2;
}

/**
 * Today's session: due reviews (capped in final-weeks mode, open misses first), then a
 * fresh-stimulus repair task for each open miss, then new tasks, up to the session size.
 * Never two tasks of one exercise on the same day unless both are due.
 */
export function planToday(state: PlannerState, size = SESSION_SIZE): PlannedEntry[] {
  const tasks = availableTasks(state.exercises);
  const taskById = new Map(tasks.map((t) => [t.taskId, t]));
  const ok = eligibility(state);
  const misses = openMisses(state, tasks);
  const missed = new Set(misses.map((m) => m.taskId));

  let due = dueTaskIds(state);
  if (state.settings.finalWeeks) {
    const reviewedToday = state.attempts.filter(
      (a) => a.kind === 'review' && a.submittedAt && localDateOf(a.submittedAt) === state.today,
    ).length;
    const cap = Math.max(0, state.settings.dailyReviewCap - reviewedToday);
    due = [...due.filter((t) => missed.has(t)), ...due.filter((t) => !missed.has(t))].slice(0, cap);
  }

  const touchedToday = new Set(
    state.attempts.filter((a) => localDateOf(a.startedAt) === state.today).map((a) => exerciseOf(a.taskId)),
  );
  const entries: PlannedEntry[] = due.slice(0, size).map((taskId) => ({ taskId, reason: 'review' as const }));
  const used = new Set([...touchedToday, ...entries.map((e) => exerciseOf(e.taskId))]);

  const candidates = newCandidates(state, tasks).filter((t) => ok(t.taskId) && !used.has(t.exerciseId));

  const take = (t: PlannerTask, reason: PlannedEntry['reason']) => {
    entries.push({ taskId: t.taskId, reason });
    used.add(t.exerciseId);
  };

  // Repair: a fresh-stimulus task on the same skill and likely error, before any repeat of the miss.
  for (const m of misses) {
    if (entries.length >= size) break;
    const fix = candidates.find(
      (t) =>
        !used.has(t.exerciseId) &&
        t.exerciseId !== exerciseOf(m.taskId) &&
        t.skill === m.skill &&
        t.likelyErrors.some((e) => m.tags.includes(e)),
    );
    if (fix) take(fix, 'repair');
  }
  for (const t of candidates) {
    if (entries.length >= size) break;
    if (!used.has(t.exerciseId)) take(t, 'new');
  }
  return groupByStimulus(entries, taskById);
}

/** New tasks in preference order: unseen stimuli first, focus matches first, easier first. */
export function newCandidates(state: PlannerState, tasks = availableTasks(state.exercises)): PlannerTask[] {
  const carded = new Set(state.cards.map((c) => c.taskId));
  const attempted = new Set(
    state.attempts.filter((a) => a.state !== 'draft' && a.state !== 'skipped').map((a) => a.taskId),
  );
  const seen = new Set(state.attempts.map((a) => exerciseOf(a.taskId)));
  const focus = state.settings.focus.tag;
  const conclusionOk = conclusionStillUseful(state, tasks);
  const minDifficulty = state.settings.finalWeeks ? FINAL_WEEKS_MIN_DIFFICULTY : 1;
  const fresh = tasks.filter(
    (t) =>
      !carded.has(t.taskId) &&
      !attempted.has(t.taskId) &&
      t.difficulty >= minDifficulty &&
      (t.skill !== 'conclusion' || conclusionOk),
  );
  const rank = (t: PlannerTask) => [
    seen.has(t.exerciseId) ? 1 : 0,
    focus && t.likelyErrors.includes(focus) ? 0 : 1,
    t.difficulty,
  ];
  return fresh.sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i]! - rb[i]!;
    return a.taskId < b.taskId ? -1 : 1;
  });
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

/** "New only": unseen tasks filtered by skill and difficulty, one per exercise. */
export function planNewOnly(
  state: PlannerState,
  filter: { skill: string | null; difficulty: number | null },
  size = SESSION_SIZE,
): PlannedEntry[] {
  const ok = eligibility(state);
  const used = new Set<string>();
  const entries: PlannedEntry[] = [];
  for (const t of newCandidates(state)) {
    if (entries.length >= size) break;
    if (!ok(t.taskId) || used.has(t.exerciseId)) continue;
    if (filter.skill && t.skill !== filter.skill) continue;
    if (filter.difficulty && t.difficulty !== filter.difficulty) continue;
    used.add(t.exerciseId);
    entries.push({ taskId: t.taskId, reason: 'new' });
  }
  return entries;
}

/** A Library session: the chosen exercise's active tasks that are eligible today. */
export function planExercise(state: PlannerState, exerciseId: string): PlannedEntry[] {
  const ok = eligibility(state);
  const carded = new Set(state.cards.map((c) => c.taskId));
  return availableTasks(state.exercises)
    .filter((t) => t.exerciseId === exerciseId && ok(t.taskId))
    .map((t) => ({ taskId: t.taskId, reason: carded.has(t.taskId) ? ('review' as const) : ('new' as const) }));
}
