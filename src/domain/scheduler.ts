// Rating policy v1 and the FSRS wrapper (ARCHITECTURE.md §6.1, §6.5). Pure: time is passed in.

import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import type { AttemptKind, CardFields, RatingChoice } from './records.ts';
import { schedulerConfig } from './schedulerConfig.ts';

export { Rating };

/** The FSRS rating for an accepted grading, or null when it is not a review event. */
export function ratingFor(score: number, max: number, kind: AttemptKind, choice: RatingChoice): Grade | null {
  if (kind === 'coached') return null;
  if (score < max) return Rating.Again;
  return choice === 'hard' ? Rating.Hard : choice === 'easy' ? Rating.Easy : Rating.Good;
}

function toCard(fields: CardFields): Card {
  const card: Card = {
    due: new Date(fields.due),
    stability: fields.stability,
    difficulty: fields.difficulty,
    elapsed_days: fields.elapsed_days,
    scheduled_days: fields.scheduled_days,
    learning_steps: fields.learning_steps,
    reps: fields.reps,
    lapses: fields.lapses,
    state: fields.state,
  };
  if (fields.last_review) card.last_review = new Date(fields.last_review);
  return card;
}

function fromCard(card: Card): CardFields {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  };
}

export function emptyCard(at: string): CardFields {
  return fromCard(createEmptyCard(new Date(at)));
}

/**
 * Applies one review under scheduler `version` (ARCHITECTURE.md §6.4).
 *
 * `reviewedAt` is the attempt's submission time and is never changed. Out-of-order policy: if the
 * card was already reviewed later than that (grades confirmed out of order), the scheduler runs at
 * the card's last review instead, so elapsed time is never negative. That effective time is
 * returned as `effectiveAt` and is also `after.last_review`; callers store `reviewedAt` as given.
 *
 * `before` may come from any scheduler version: its card fields are used as they are.
 */
export function review(
  version: string,
  before: CardFields | null,
  rating: Grade,
  reviewedAt: string,
): { after: CardFields; effectiveAt: string } {
  const config = schedulerConfig(version);
  if (!config) throw new Error(`Unknown scheduler version ${version}`);
  const scheduler = fsrs(generatorParameters({ ...config, w: [...config.w] }));
  const card = before ?? emptyCard(reviewedAt);
  const at = effectiveReviewTime(before, reviewedAt);
  const { card: next } = scheduler.next(toCard(card), new Date(at), rating);
  return { after: fromCard(next), effectiveAt: at };
}

/** The time the scheduler applies a review at: the later of submission and the card's last review. */
export function effectiveReviewTime(before: CardFields | null, reviewedAt: string): string {
  return before?.last_review && before.last_review > reviewedAt ? before.last_review : reviewedAt;
}
