// The content bundle compiled by `npm run content` (scripts/build-content.ts).

import data from './generated/content.json';
import type { BuiltExercise, ContentBundle } from './domain/types.ts';

export const content = data as unknown as ContentBundle;

export function findExercise(id: string): BuiltExercise | undefined {
  return content.exercises.find((e) => e.id === id);
}
