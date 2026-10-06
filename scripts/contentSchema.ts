// Zod schema for exercise format schemas 3 and 4 (docs/EXERCISE_FORMAT.md §3).
// Objects are strict: unknown keys are errors (§4 rule 1).

import { z } from 'zod';

const text = z.string().trim().min(1);
const nullableText = text.nullable();

export const sourceSchema = z.strictObject({
  type: z.enum(['original', 'public-domain', 'cc-by']),
  title: nullableText,
  creator: nullableText,
  year: z.int().min(1).max(9999).nullable(),
  locator: nullableText,
  license_uri: nullableText,
  attribution: nullableText,
  rights_basis: nullableText,
  modifications: nullableText,
});

export const anchorSchema = z.strictObject({
  points: z.int().min(0),
  answer: text,
  note: text.optional(),
});

export const TASK_KEY = /^[a-z][a-z0-9-]*$/;

/** A form line (docs/METHOD.md §5): one line, display only, never part of a grading payload. */
export const FORM_MAX = 300;
const formLine = text.max(FORM_MAX).regex(/^[^\r\n]*$/, 'a single line');

export const taskSchema = z.strictObject({
  key: z.string().regex(TASK_KEY, 'lowercase letters, digits and hyphens, starting with a letter'),
  status: z.enum(['active', 'retired']).default('active'),
  skill: text,
  difficulty: z.int().min(1).max(5).optional(),
  difficulty_note: nullableText.optional(),
  prompt: text,
  max: z.int().min(1).max(4),
  reference: text,
  accept: text.optional(),
  disqualifiers: z.array(text).optional(),
  rubric: z.array(text).min(1),
  anchors: z.array(anchorSchema).min(2),
  likely_errors: z.array(text),
  form: formLine.optional(),
});

export const EXERCISE_ID = /^(arg|psg)-\d{4}$/;

export const frontMatterSchema = z
  .strictObject({
    schema: z.union([z.literal(3), z.literal(4)]),
    id: z.string().regex(EXERCISE_ID, 'arg-0000 or psg-0000'),
    status: z.enum(['draft', 'published', 'retired']),
    kind: z.enum(['argument', 'passage']),
    difficulty: z.int().min(1).max(5),
    topics: z.array(text),
    source: sourceSchema,
    contributors: z.array(text),
    ai_assistance: z.strictObject({ used: z.boolean(), notes: nullableText }),
    approved_by: nullableText,
    approved_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .nullable(),
    approved_revision: z
      .string()
      .regex(/^[0-9a-f]{64}$/, 'a 64-character content revision')
      .nullable(),
    tasks: z.array(taskSchema).min(1),
  })
  .superRefine((fm, ctx) => {
    // Schema 4 is schema 3 plus form lines; a schema 3 file keeps its approved bytes.
    if (fm.schema !== 3) return;
    fm.tasks.forEach((t, i) => {
      if (t.form !== undefined)
        ctx.addIssue({ code: 'custom', path: ['tasks', i, 'form'], message: 'form lines need schema 4' });
    });
  });

export type FrontMatter = z.infer<typeof frontMatterSchema>;

export const taxonomySchema = z.strictObject({
  skills: z.record(z.string(), z.strictObject({ label: text, open_ended: z.boolean() })),
  error_tags: z.record(z.string(), text),
});

export type Taxonomy = z.infer<typeof taxonomySchema>;

export const maintainersSchema = z.strictObject({ maintainers: z.array(text) });

/** Record of every task ever published (EXERCISE_FORMAT.md §4 rule 12). */
export const ledgerSchema = z.strictObject({
  tasks: z.record(
    z.string(),
    z.strictObject({
      skill: text,
      max: z.int(),
      status: z.enum(['active', 'retired']),
      revisions: z.array(z.string().regex(/^[0-9a-f]{64}$/)).min(1),
    }),
  ),
});

export type Ledger = z.infer<typeof ledgerSchema>;
