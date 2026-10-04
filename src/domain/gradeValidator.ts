// The shared grade validator (ARCHITECTURE.md §5.1 invariants 5 and 8; GRADING_PROTOCOL.md §8).
// One rule set for parsed, manual, self and imported grades.

import type { GradingSource, GradingStatus, Range } from './records.ts';

export interface GradeInput {
  /** Integer score, or null for "needs review" ("?" from a chatbot). */
  score: number | null;
  max: number;
  tags: string[];
  source: GradingSource;
  disqualified: boolean;
}

export interface GradeContext {
  snapshotMax: number;
  allowedTags: string[];
  /** The attempt is submitted and owned by the request being graded. */
  ownedByRequest: boolean;
}

/** Returns the problems with a grade; empty means valid. Never repairs anything. */
export function validateGrade(g: GradeInput, ctx: GradeContext): string[] {
  const problems: string[] = [];
  if (!ctx.ownedByRequest) problems.push('This answer does not belong to this grading request.');
  if (g.max !== ctx.snapshotMax) problems.push(`The maximum must be ${ctx.snapshotMax}, not ${g.max}.`);
  if (g.score !== null && (!Number.isInteger(g.score) || g.score < 0 || g.score > ctx.snapshotMax)) {
    problems.push(`The score must be a whole number from 0 to ${ctx.snapshotMax}.`);
  }
  if (g.score === null && g.source !== 'parsed') problems.push('Enter a score.');
  const bad = g.tags.filter((t) => !ctx.allowedTags.includes(t));
  if (bad.length) problems.push(`Tags not allowed for this task: ${bad.join(', ')}.`);
  if (new Set(g.tags).size !== g.tags.length) problems.push('Tags repeat.');
  if (g.disqualified && (g.source !== 'self' || g.score !== 0)) {
    problems.push('Only a self-grade can be disqualified, and it scores 0.');
  }
  return problems;
}

/**
 * A grading's stored status against its score (§5.1 invariant 5): accepted has a score,
 * needs-review has none and comes only from a parsed reply. Superseded revisions keep whatever
 * was valid when they were written, which validateGrade already covers.
 */
export function validateStatus(status: GradingStatus, score: number | null, source: GradingSource): string[] {
  if (status === 'accepted' && score === null) return ['An accepted grade needs a score.'];
  if (status === 'needs-review' && (score !== null || source !== 'parsed')) {
    return ['Only a parsed grade with no score can wait for review.'];
  }
  return [];
}

/**
 * A range into a reply's raw text: start <= end <= the text's length. A range needs its reply
 * (`textLength` null means there is none).
 */
export function validateRange(range: Range | null, textLength: number | null): string[] {
  if (range === null) return [];
  if (textLength === null) return ['A feedback range needs the reply it points into.'];
  const ok =
    Number.isInteger(range.start) &&
    Number.isInteger(range.end) &&
    range.start >= 0 &&
    range.start <= range.end &&
    range.end <= textLength;
  return ok ? [] : [`The range ${range.start}–${range.end} is outside the reply.`];
}

/** Self-grading: one point per ticked criterion, or 0 when a disqualifier applies. */
export function selfGradeScore(criteriaMet: boolean[], disqualified: boolean): number {
  return disqualified ? 0 : criteriaMet.filter(Boolean).length;
}
