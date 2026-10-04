// Rating policy v1 and the FSRS wrapper (ARCHITECTURE.md §6.1, §6.5). Pure: time is passed in.

import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import type { AttemptKind, CardFields, RatingChoice } from './records.ts';
import { SCHEDULER_CONFIGS } from './schedulerConfig.ts';

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
 * Applies one review. `reviewedAt` is the attempt's submission time; if the card was already
 * reviewed later than that (grades confirmed out of order), the review is placed at the card's
 * last review so elapsed time is never negative.
 */
export function review(
  version: string,
  before: CardFields | null,
  rating: Grade,
  reviewedAt: string,
): { after: CardFields; reviewedAt: string } {
  const config = SCHEDULER_CONFIGS[version];
  if (!config) throw new Error(`Unknown scheduler version ${version}`);
  const scheduler = fsrs(generatorParameters({ ...config, w: [...config.w] }));
  const card = before ?? emptyCard(reviewedAt);
  const at = card.last_review && card.last_review > reviewedAt ? card.last_review : reviewedAt;
  const { card: next } = scheduler.next(toCard(card), new Date(at), rating);
  return { after: fromCard(next), reviewedAt: at };
}
