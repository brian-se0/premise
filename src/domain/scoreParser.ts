// Score block parser, parser version 4 (docs/GRADING_PROTOCOL.md §§4–7).
// Pure: reads a pasted reply against one grading request. Never repairs, clamps or guesses a score.

import type { ParseOutcome, Range } from './records.ts';

export const PARSER_VERSION = 4;
export const MAX_REPLY_LENGTH = 200_000;
/** The only score block version this parser reads (prompt version v2). */
const BLOCK_VERSION = 2;

export interface ParserRequest {
  /** Request UUID. */
  id: string;
  /** The saved request's prompt version. The score block remains v2 for every supported prompt. */
  promptVersion: string;
  /** In request order. */
  rows: { rowId: string; max: number; allowedTags: string[] }[];
}

export type RowResult =
  | {
      rowId: string;
      status: 'valid';
      /** Null means the grader wrote `?`: the row needs review. */
      score: number | null;
      max: number;
      tags: string[];
      warnings: string[];
      /** Null when feedback could not be matched to this row. */
      feedback: Range | null;
    }
  | { rowId: string; status: 'invalid'; reason: string; warnings: string[]; feedback: Range | null }
  | { rowId: string; status: 'missing'; warnings: string[]; feedback: Range | null };

export interface ParsedBlock {
  /** Raw range of this occurrence: BEGIN line to END line, or to the last row line when incomplete. */
  range: Range;
  /** Had END SCORES. */
  complete: boolean;
  /** One per request row, in request order. */
  rows: RowResult[];
  /** Row ids in the block that are not in the request (reported, ignored). */
  unknownRowIds: string[];
  /** Block-level warnings; row warnings stay on rows. */
  warnings: string[];
  outcome: ParseOutcome;
}

export type ParseResult =
  | { kind: 'parsed'; block: ParsedBlock }
  /** Two or more non-equivalent candidates for this request, in reply order. */
  | { kind: 'choose'; options: ParsedBlock[] }
  | {
      kind: 'none';
      reason: 'too-long' | 'no-block' | 'other-request' | 'unsupported-version' | 'unsupported-prompt-version';
      message: string;
    };

const MESSAGES = {
  'too-long': 'This reply is longer than 200,000 characters',
  'no-block': 'No score block found',
  'other-request': 'This reply belongs to a different grading request',
  'unsupported-version': 'This reply uses an unsupported score format',
  'unsupported-prompt-version': 'This grading request uses an unsupported prompt version',
} as const;

/**
 * Whitespace for trimming and spacing: JavaScript's whitespace and line terminators minus U+FEFF.
 * `String.prototype.trim` and `\s` also remove U+FEFF, which the protocol promises to leave alone
 * (§5 step 2), so the parser never uses them. Zero-width characters (U+200B–U+200D, U+2060, U+FEFF)
 * are not in this set.
 */
const WS = '[\\t\\n\\v\\f\\r \\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]';
const IS_WS = new RegExp(`^${WS}$`);

/** Trims protocol whitespace only (see WS). A loop, not a regex, so long runs stay linear. */
function trimWs(s: string): string {
  let start = 0;
  let end = s.length;
  while (start < end && IS_WS.test(s[start]!)) start++;
  while (end > start && IS_WS.test(s[end - 1]!)) end--;
  return s.slice(start, end);
}

const BEGIN_LINE = new RegExp(`^BEGIN SCORES(${WS}.*)?$`, 'i');
const HEADER = /^BEGIN SCORES v(\d+) request=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
const END_LINE = /^END SCORES$/i;
const ROW_LINE = new RegExp(`^I\\d{2}${WS}*\\|`, 'i');
const HEADING_LINE = /^I\d{2}:/i;
const BULLET = new RegExp(`^[-*•]${WS}+`);
const UNFILLED_SCORE = new RegExp(`^__${WS}*/`);
const FENCE_LINE = /^(`{3,}|~{3,})[\w+-]*$/;
// Backtick fence info strings cannot contain backticks; an inline code span is not an opener.
const FEEDBACK_FENCE_START = /^(`{3,}(?=[^`]*$)|~{3,})(.*)$/;
const MARKDOWN_HEADING = /#{1,6}[ \t]+/y;
const HEADING_SCORE = new RegExp(`^(${WS}*(?:\\d+|\\?)${WS}*/${WS}*\\d+)(?=${WS}|$|[^\\w/])`);
const FEEDBACK_LIST_MARKER = new RegExp(`^(?:[-*+•]|\\d+[.)])${WS}+`);
const HEADING_DECORATORS = /^[*_`~]*/;
const HEADING_PREFIX_DECORATORS = /[*_`~]+/y;
const BOUNDED_HEADING_ID = /^I\d+/i;
const BOUNDED_HEADING_SEPARATOR = /^[:.\-–—]/;
const END_OF_ITEMS = '=== END OF ITEMS ===';

/** One line of the reply: raw offsets (line break excluded) and the cleaned text used for matching. */
interface Line {
  start: number;
  end: number;
  /** Null for a line that is only a code fence (ignored). */
  text: string | null;
}

/** The §5 step 2 clean-up. Each step strips at most once, in this order. */
export function cleanLine(line: string): string | null {
  let s = trimWs(line);
  s = trimWs(s.replace(/^>/, ''));
  // A bullet needs a following space, so `**bold**` and a bare `-` tag field survive.
  s = s.replace(BULLET, '');
  if (FENCE_LINE.test(s)) return null;
  s = trimWs(s.replace(/^`+/, '').replace(/`+$/, ''));
  s = trimWs(s.replace(/^(\*\*|__)/, '').replace(/(\*\*|__)$/, ''));
  // Outer pipes only when both are present (a Markdown table row); `I01 | 2/2 | -` keeps its fields.
  if (s.length >= 2 && s.startsWith('|') && s.endsWith('|')) s = trimWs(s.slice(1, -1));
  return s;
}

function lineView(raw: string): Line[] {
  const lines: Line[] = [];
  let start = 0;
  while (start <= raw.length) {
    const lf = raw.indexOf('\n', start);
    const stop = lf === -1 ? raw.length : lf;
    const end = stop > start && raw[stop - 1] === '\r' ? stop - 1 : stop;
    lines.push({ start, end, text: cleanLine(raw.slice(start, end)) });
    if (lf === -1) break;
    start = lf + 1;
  }
  return lines;
}

type Header =
  | { kind: 'this'; version: number }
  | { kind: 'other' }
  /** A BEGIN SCORES line that is not a valid header. */
  | { kind: 'malformed' };

interface Candidate {
  header: Header;
  rowLines: Line[];
  complete: boolean;
  /** Displayed range: BEGIN line to END line, or to the last row line when incomplete. */
  range: Range;
  /**
   * Raw offset where the text this candidate consumes ends: the END line's end when complete; when
   * incomplete, the start of the BEGIN line or the end of the `=== END OF ITEMS ===` line that
   * terminates it, or the end of the reply. Text after an incomplete candidate's last row belongs to
   * that candidate, never to a later block's feedback.
   */
  consumedEnd: number;
}

/**
 * §5 step 3: a candidate runs from a BEGIN line to the next END line; a second BEGIN ends it
 * incomplete, and so does an echoed `=== END OF ITEMS ===` line (§9a), which marks the end of the
 * echoed prompt. `terminator` is the END line, or the raw offset where an incomplete candidate stops.
 */
function findCandidates(lines: Line[], requestId: string, replyLength: number): Candidate[] {
  const out: Candidate[] = [];
  let open: { begin: Line; header: Header; rowLines: Line[] } | null = null;
  const close = (terminator: Line | number) => {
    if (!open) return;
    const endLine = typeof terminator === 'number' ? null : terminator;
    const last = endLine ?? open.rowLines.at(-1) ?? open.begin;
    out.push({
      header: open.header,
      rowLines: open.rowLines,
      complete: endLine !== null,
      range: { start: open.begin.start, end: last.end },
      consumedEnd: typeof terminator === 'number' ? terminator : terminator.end,
    });
    open = null;
  };
  for (const line of lines) {
    if (line.text === null) continue;
    if (BEGIN_LINE.test(line.text)) {
      close(line.start);
      open = { begin: line, header: readHeader(line.text, requestId), rowLines: [] };
    } else if (open && END_LINE.test(line.text)) {
      close(line);
    } else if (open && line.text === END_OF_ITEMS) {
      close(line.end);
    } else if (open && ROW_LINE.test(line.text)) {
      open.rowLines.push(line);
    }
  }
  close(replyLength);
  return out;
}

/** §5 step 4. */
function readHeader(text: string, requestId: string): Header {
  const m = HEADER.exec(text);
  if (!m) return { kind: 'malformed' };
  if (m[2]!.toLowerCase() !== requestId.toLowerCase()) return { kind: 'other' };
  return { kind: 'this', version: Number(m[1]) };
}

/** §5 step 5: every row is `__/max | --`, i.e. the skeleton copied back unfilled. */
function isEcho(c: Candidate): boolean {
  return c.rowLines.every((l) => {
    const fields = l.text!.split('|');
    return fields.length === 3 && UNFILLED_SCORE.test(trimWs(fields[1]!)) && trimWs(fields[2]!) === '--';
  });
}

/** A row line's result after §6 steps 2–4, before duplicates and membership. */
type LineResult =
  | { status: 'valid'; score: number | null; max: number; tags: string[]; warnings: string[] }
  | { status: 'invalid'; reason: string; warnings: string[] };

/** §6 step 4. Tags never make a row invalid; they only produce warnings. */
function readTags(field: string, allowed: string[]): { tags: string[]; warnings: string[] } {
  if (field === '-') return { tags: [], warnings: [] };
  if (field === '--') return { tags: [], warnings: ['Tags were left unfilled (--)'] };
  if (field === '') return { tags: [], warnings: ['Tag field is empty'] };
  const tags: string[] = [];
  const warnings: string[] = [];
  for (const tag of field.split(',').map(trimWs)) {
    if (!allowed.includes(tag)) warnings.push(`Tag "${tag}" is not allowed for this item and was dropped`);
    else if (!tags.includes(tag)) tags.push(tag);
  }
  return { tags, warnings };
}

/** §6 steps 2–3. */
function readScore(field: string, expectedMax: number): { score: number | null } | { reason: string } {
  const parts = field.split('/').map(trimWs);
  if (parts.length !== 2) return { reason: `Score "${field}" is not written as score/max` };
  const [score, max] = parts as [string, string];
  if (!/^\d+$/.test(max)) return { reason: `Maximum "${max}" is not a whole number` };
  if (Number(max) !== expectedMax) return { reason: `Maximum ${max} does not match the item's maximum ${expectedMax}` };
  if (score === '?') return { score: null };
  if (score === '__') return { reason: 'Score was left unfilled (__)' };
  if (/^-\d+([.,]\d+)?$/.test(score)) return { reason: `Score ${score} is negative` };
  if (/^\d*[.,]\d+$/.test(score)) return { reason: `Score ${score} is not a whole number` };
  if (!/^\d+$/.test(score)) return { reason: `Score "${score}" is not a number` };
  if (Number(score) > expectedMax) return { reason: `Score ${score} is over the maximum ${expectedMax}` };
  return { score: Number(score) };
}

function readRow(text: string, row: ParserRequest['rows'][number]): LineResult {
  const fields = text.split('|').map(trimWs);
  if (fields.length !== 3) {
    return { status: 'invalid', reason: `Expected 3 fields separated by |, found ${fields.length}`, warnings: [] };
  }
  const { tags, warnings } = readTags(fields[2]!, row.allowedTags);
  const score = readScore(fields[1]!, row.max);
  if ('reason' in score) return { status: 'invalid', reason: score.reason, warnings };
  return { status: 'valid', score: score.score, max: row.max, tags, warnings };
}

/** §6: rows, duplicates, membership and the outcome. Feedback is filled in later. */
function parseBlock(c: Candidate, request: ParserRequest): ParsedBlock {
  const warnings: string[] = [];
  if (!c.complete) warnings.push('The score block has no END SCORES line');

  const byId = new Map<string, LineResult[]>();
  const unknownRowIds: string[] = [];
  for (const line of c.rowLines) {
    const id = line.text!.slice(0, 3).toUpperCase();
    const row = request.rows.find((r) => r.rowId.toUpperCase() === id);
    if (!row) {
      if (!unknownRowIds.includes(id)) unknownRowIds.push(id);
      continue;
    }
    byId.set(row.rowId, [...(byId.get(row.rowId) ?? []), readRow(line.text!, row)]);
  }
  for (const id of unknownRowIds) warnings.push(`Row ${id} is not part of this request and was ignored`);

  const rows = request.rows.map((r): RowResult => {
    const results = byId.get(r.rowId);
    if (!results) return { rowId: r.rowId, status: 'missing', warnings: [], feedback: null };
    const first = results[0]!;
    if (results.length > 1) {
      const key = JSON.stringify(first);
      if (results.some((x) => JSON.stringify(x) !== key)) {
        return {
          rowId: r.rowId,
          status: 'invalid',
          reason: `Row ${r.rowId} appears ${results.length} times with different contents`,
          warnings: [],
          feedback: null,
        };
      }
      warnings.push(`Row ${r.rowId} appears ${results.length} times; identical copies were collapsed`);
    }
    return { rowId: r.rowId, ...first, feedback: null };
  });

  return { range: c.range, complete: c.complete, rows, unknownRowIds, warnings, outcome: outcomeOf(rows, c, warnings) };
}

/** §6 parse outcome. */
function outcomeOf(rows: RowResult[], c: Candidate, warnings: string[]): ParseOutcome {
  if (!rows.some((r) => r.status === 'valid')) return 'manual';
  const clean =
    c.complete && warnings.length === 0 && rows.every((r) => r.status === 'valid' && r.warnings.length === 0);
  return clean ? 'clean' : 'recoverable';
}

/** §5 step 6: same parsed rows, completeness and warnings. Feedback and position do not count. */
function equivalenceKey(b: ParsedBlock): string {
  const rows = b.rows.map((r) => ({ ...r, feedback: null }));
  return JSON.stringify([rows, b.unknownRowIds, b.complete, b.warnings]);
}

/**
 * §7: the region runs from where the nearest earlier candidate stops consuming text (its END line, or
 * for an incomplete candidate the next BEGIN line, so text after its last row is never attributed),
 * or a later echoed
 * `=== END OF ITEMS ===` line, or the reply start) to the chosen block's BEGIN line. A row's
 * feedback runs from its `I01:` heading to the next heading or the region end, trailing
 * whitespace trimmed. A heading found twice or not at all leaves the row unmatched.
 */
function attachFeedback(block: ParsedBlock, raw: string, lines: Line[], candidates: Candidate[]): ParsedBlock {
  const regionEnd = block.range.start;
  let regionStart = 0;
  for (const c of candidates) if (c.consumedEnd <= regionEnd) regionStart = Math.max(regionStart, c.consumedEnd);
  for (const l of lines) {
    if (l.end <= regionEnd && l.text === END_OF_ITEMS) regionStart = Math.max(regionStart, l.end);
  }

  const headings = lines.filter(
    (l) => l.start >= regionStart && l.start < regionEnd && l.text !== null && HEADING_LINE.test(l.text),
  );
  const rows = block.rows.map((r) => {
    const own = headings.filter((h) => h.text!.slice(0, 3).toUpperCase() === r.rowId.toUpperCase());
    if (own.length !== 1) return r;
    const start = own[0]!.start;
    const boundary = headings.find((h) => h.start > start)?.start ?? regionEnd;
    // End at the last line with content: blank lines and fence-only lines before the boundary are not feedback.
    const content = lines.filter((l) => l.start >= start && l.start < boundary && l.text);
    let end = Math.min(content.at(-1)!.end, boundary);
    while (end > start && IS_WS.test(raw[end - 1]!)) end--;
    return { ...r, feedback: { start, end } };
  });
  return { ...block, rows };
}

interface BoundedHeading {
  id: string;
  quoted: boolean;
  /** An unsupported heading still bounds the preceding row, but cannot start its own feedback. */
  attributable: boolean;
  score: { points: string; max: string } | null;
}

function skipScoreDecoration(text: string): string {
  let i = 0;
  while (i < text.length) {
    const char = text[i]!;
    if (IS_WS.test(char) || '*_`([{'.includes(char)) i++;
    else break;
  }
  return text.slice(i);
}

/** Only a heading's assessment, not its ID or score block, gets emphasis/code normalization. */
function headingAssessment(text: string): string {
  let assessment = skipScoreDecoration(text);
  assessment = skipScoreDecoration(assessment.replace(/^Score\b(?:[ \t]*:)?[ \t]*/i, ''));
  return assessment.replace(/[*_`]/g, '');
}

/** The bounded reader's single interpretation of a raw heading line, including its score. */
function recognizeBoundedHeading(rawLine: string): BoundedHeading | null {
  let line = trimWs(rawLine);
  let quoted = false;
  // A quote can appear inside a list item, and lists and quotes can alternate at any depth.
  while (line) {
    if (line.startsWith('>')) {
      quoted = true;
      line = trimWs(line.slice(1));
      continue;
    }
    const withoutList = line.replace(FEEDBACK_LIST_MARKER, '');
    if (withoutList === line) break;
    line = trimWs(withoutList);
  }
  // Match cleanLine's paired outer-pipe rule without changing shared score-block cleaning.
  if (line.length >= 2 && line.startsWith('|') && line.endsWith('|')) line = trimWs(line.slice(1, -1));
  let offset = 0;
  let prefixHasTilde = false;
  let markedHeading = false;
  // The heading marks may sit outside or inside emphasis/code wrappers.
  while (offset < line.length) {
    while (offset < line.length && IS_WS.test(line[offset]!)) offset++;
    MARKDOWN_HEADING.lastIndex = offset;
    const marks = MARKDOWN_HEADING.exec(line);
    if (marks) {
      markedHeading = true;
      offset = MARKDOWN_HEADING.lastIndex;
      continue;
    }
    HEADING_PREFIX_DECORATORS.lastIndex = offset;
    const wrapper = HEADING_PREFIX_DECORATORS.exec(line)?.[0];
    if (!wrapper) break;
    prefixHasTilde ||= wrapper.includes('~');
    offset = HEADING_PREFIX_DECORATORS.lastIndex;
  }
  line = trimWs(line.slice(offset));
  const id = BOUNDED_HEADING_ID.exec(line)?.[0];
  if (!id) return null;
  line = line.slice(id.length);
  const suffix = HEADING_DECORATORS.exec(line)![0];
  line = trimWs(line.slice(suffix.length));
  const separator = BOUNDED_HEADING_SEPARATOR.exec(line)?.[0];
  // A bare marked ID or an ID followed by score/max is row-shaped but not an attributable label.
  // Ordinary prose such as "I02 is discussed below" is not a heading.
  if (!separator && line !== '' && !markedHeading && !HEADING_SCORE.test(headingAssessment(line))) return null;

  const attributable = separator === ':' && !prefixHasTilde && !suffix.includes('~');
  const assessment = headingAssessment(line.slice(separator?.length ?? 0));
  const token = HEADING_SCORE.exec(assessment)?.[1];
  let score: BoundedHeading['score'] = null;
  if (token) {
    const [points, max] = token.split('/').map(trimWs);
    score = { points: points!, max: max! };
  }
  return { id: id.toUpperCase(), quoted, attributable, score };
}

/**
 * Prompts v3 and v4 require one explicit, request-matching feedback section for the chosen score block.
 * Unbounded prose, echoed answers and ambiguous sections never become row feedback.
 * Score parsing is independent: a missing or malformed section leaves feedback unmatched.
 */
function attachBoundedFeedback(
  block: ParsedBlock,
  raw: string,
  lines: Line[],
  candidates: Candidate[],
  requestId: string,
): ParsedBlock {
  const regionEnd = block.range.start;
  let regionStart = 0;
  for (const c of candidates) if (c.consumedEnd <= regionEnd) regionStart = Math.max(regionStart, c.consumedEnd);
  for (const l of lines) {
    if (l.end <= regionEnd && l.text === END_OF_ITEMS) regionStart = Math.max(regionStart, l.end);
  }

  const markers = lines.filter((l) => {
    if (l.start < regionStart || l.start >= regionEnd) return false;
    if (trimWs(raw.slice(l.start, l.end)).startsWith('>')) return false;
    const upper = l.text?.toUpperCase() ?? '';
    return upper.startsWith('BEGIN FEEDBACK') || upper.startsWith('END FEEDBACK');
  });
  if (markers.length !== 2) return block;
  const [begin, end] = markers as [Line, Line];
  if (
    begin.text?.toLowerCase() !== `begin feedback request=${requestId.toLowerCase()}` ||
    end.text?.toLowerCase() !== 'end feedback' ||
    begin.start >= end.start
  ) {
    return block;
  }
  // A second item heading in the gap could be unbounded feedback. Other text is harmless because
  // the section boundaries and selected score block already identify the region.
  if (
    lines.some(
      (l) => l.start >= end.end && l.start < regionEnd && recognizeBoundedHeading(raw.slice(l.start, l.end)) !== null,
    )
  ) {
    return block;
  }

  const headings: { line: Line; heading: BoundedHeading; eligible: boolean }[] = [];
  let fence: { mark: string; length: number } | null = null;
  for (const l of lines) {
    if (l.start <= begin.start || l.start >= end.start) continue;
    const original = trimWs(raw.slice(l.start, l.end));
    // A quoted or fenced heading ends the preceding row but is not itself attributable feedback.
    // This prevents one row from absorbing another when a grader's fence closes unexpectedly.
    const heading = recognizeBoundedHeading(original);
    const quoted = original.startsWith('>');
    const fenceStart = FEEDBACK_FENCE_START.exec(original.replace(FEEDBACK_LIST_MARKER, ''));
    if (heading && !fenceStart)
      headings.push({ line: l, heading, eligible: heading.attributable && !heading.quoted && !fence });
    if (quoted) continue;
    if (fence) {
      let runLength = 0;
      while (original[runLength] === fence.mark) runLength++;
      if (runLength >= fence.length && trimWs(original.slice(runLength)) === '') fence = null;
      continue;
    }
    if (fenceStart) {
      fence = { mark: fenceStart[1]![0]!, length: fenceStart[1]!.length };
      continue;
    }
  }
  // A broken fence makes heading eligibility uncertain for the entire section.
  if (fence) return block;

  const rows = block.rows.map((r) => {
    const own = headings.filter((h) => h.eligible && h.heading.id === r.rowId.toUpperCase());
    if (own.length !== 1) return r;
    const score = own[0]!.heading.score;
    if (score) {
      if (r.status !== 'valid') return r;
      if (Number(score.max) !== r.max || (score.points === '?' ? r.score !== null : Number(score.points) !== r.score))
        return r;
    }
    const start = own[0]!.line.start;
    const boundary = headings.find((h) => h.line.start > start)?.line.start ?? end.start;
    const content = lines.filter((l) => l.start >= start && l.start < boundary && l.text);
    let finish = Math.min(content.at(-1)!.end, boundary);
    while (finish > start && IS_WS.test(raw[finish - 1]!)) finish--;
    return { ...r, feedback: { start, end: finish } };
  });
  return { ...block, rows };
}

/** Parses a pasted reply against one grading request (docs/GRADING_PROTOCOL.md §5). */
export function parseReply(raw: string, request: ParserRequest): ParseResult {
  if (raw.length > MAX_REPLY_LENGTH) return none('too-long');
  const promptVersion = request.promptVersion;
  if (promptVersion !== 'v2' && promptVersion !== 'v3' && promptVersion !== 'v4')
    return none('unsupported-prompt-version');

  const lines = lineView(raw);
  const candidates = findCandidates(lines, request.id, raw.length);
  // Supported candidates for this request, minus echoed skeletons and blocks without any row line.
  const usable = candidates.filter(
    (c) => c.header.kind === 'this' && c.header.version === BLOCK_VERSION && c.rowLines.length > 0 && !isEcho(c),
  );

  if (usable.length === 0) {
    if (candidates.some((c) => c.header.kind === 'this' && c.header.version !== BLOCK_VERSION)) {
      return none('unsupported-version');
    }
    if (candidates.some((c) => c.header.kind === 'other')) return none('other-request');
    return none('no-block');
  }

  // Equivalent candidates count once, represented by their last occurrence.
  const parsed = usable.map((c) => parseBlock(c, request));
  const keys = parsed.map(equivalenceKey);
  const distinct = parsed
    .filter((_, i) => keys.indexOf(keys[i]!, i + 1) === -1)
    .map((b) =>
      promptVersion === 'v3' || promptVersion === 'v4'
        ? attachBoundedFeedback(b, raw, lines, candidates, request.id)
        : attachFeedback(b, raw, lines, candidates),
    );

  if (distinct.length === 1) return { kind: 'parsed', block: distinct[0]! };
  return { kind: 'choose', options: distinct };
}

function none(reason: keyof typeof MESSAGES): ParseResult {
  return { kind: 'none', reason, message: MESSAGES[reason] };
}
