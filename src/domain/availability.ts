// Effective status (EXERCISE_FORMAT.md §6): one rule for what can be studied.
// Production bundles hold published and retired exercises; development bundles add drafts.

import type { BuiltExercise, Task } from './types.ts';

/** Tasks that can be studied: active tasks of exercises that are not retired. */
export function studyableTasks(exercise: BuiltExercise): Task[] {
  return exercise.status === 'retired' ? [] : exercise.tasks.filter((t) => t.status === 'active');
}

export function isStudyable(exercise: BuiltExercise): boolean {
  return studyableTasks(exercise).length > 0;
}
