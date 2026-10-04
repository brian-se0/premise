// The shared grade validator (ARCHITECTURE.md §5.1 invariants 5 and 8; GRADING_PROTOCOL.md §8).
// One rule set for parsed, manual, self and imported grades.

import type { GradingSource } from './records.ts';

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

/** Self-grading: one point per ticked criterion, or 0 when a disqualifier applies. */
export function selfGradeScore(criteriaMet: boolean[], disqualified: boolean): number {
  return disqualified ? 0 : criteriaMet.filter(Boolean).length;
}
