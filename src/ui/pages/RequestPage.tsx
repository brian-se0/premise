import { useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { content } from '../../content.ts';
import { formatLocalDate, localDateOf } from '../../domain/dates.ts';
import { selfGradeScore } from '../../domain/gradeValidator.ts';
import type {
  AttemptRecord,
  CardRecord,
  GradingRecord,
  RatingChoice,
  ReplyRecord,
  RequestRecord,
  SnapshotRecord,
} from '../../domain/records.ts';
import { parseReply, PARSER_VERSION, type ParsedBlock, type ParseResult } from '../../domain/scoreParser.ts';
import {
  abandonRequest,
  addFlag,
  canChangeGrade,
  confirmRows,
  correctGrade,
  discardRows,
  OpError,
  rowState,
  StaleError,
  startSession,
  undoLatest,
  type GradeRow,
  type RowState,
} from '../../storage/ops.ts';
import { ctx, db, newOpId, saveSetting, useLive, useSettings } from '../runtime.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

export const DISCLOSURE =
  'Premise does not upload your answers or progress; it only downloads its own app files. When you paste a grading prompt into another service, that service receives your answers under its own terms and privacy settings. Avoid personal information in answers.';

const CHATBOTS = [
  { name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { name: 'Claude', url: 'https://claude.ai/new' },
  { name: 'Gemini', url: 'https://gemini.google.com/app' },
];

interface Row {
  rowId: string;
  attempt: AttemptRecord;
  snapshot: SnapshotRecord;
  grading: GradingRecord | undefined;
  state: RowState;
  reply: ReplyRecord | undefined;
  card: CardRecord | undefined;
  changeable: boolean;
}

interface Loaded {
  request: RequestRecord;
  rows: Row[];
}

async function load(id: string): Promise<Loaded | null> {
  const request = await db.requests.get(id);
  if (!request) return null;
  const rows: Row[] = [];
  for (const [rowId, attemptId] of Object.entries(request.rows)) {
    const attempt = (await db.attempts.get(attemptId))!;
    const snapshot = (await db.snapshots.get(attempt.snapshotHash))!;
    const grading = attempt.currentGradingId ? await db.gradings.get(attempt.currentGradingId) : undefined;
    const reply = grading?.replyId ? await db.replies.get(grading.replyId) : undefined;
    rows.push({
      rowId,
      attempt,
      snapshot,
      grading,
      state: rowState(attempt, grading),
      reply,
      card: await db.cards.get(attempt.taskId),
      changeable: await canChangeGrade(db, attempt.id),
    });
  }
  return { request, rows };
}

function errorText(e: unknown): string {
  if (e instanceof StaleError) return `${e.message} The page now shows the current state.`;
  if (e instanceof OpError) return e.message;
  return `Something went wrong and nothing was saved: ${e instanceof Error ? e.message : String(e)}`;
}

export function RequestPage() {
  const id = useParams().id ?? '';
  const [params] = useSearchParams();
  const data = useLive(() => load(id), [id]);
  const settings = useSettings();
  const [notice, setNotice] = useState('');

  if (data === undefined || !settings) return <p>Loading…</p>;
  if (data === null) return <NotFoundPage />;
  const { request, rows } = data;
  const waiting = rows.filter((r) => r.state === 'pending' || r.state === 'needs-review');

  return (
    <>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>Grading request {request.label}</h1>
      <p className="meta">
        {rows.length} {rows.length === 1 ? 'answer' : 'answers'} · {waiting.length} waiting ·{' '}
        {request.status === 'abandoned' ? 'discarded' : request.status}
      </p>
      {notice && (
        <p role="alert" className="notice">
          {notice}
        </p>
      )}

      {waiting.length > 0 && (
        <>
          <CopySection request={request} disclosureSeen={settings.disclosureSeen} selfFirst={params.has('self')} />
          {request.promptText !== null && <PasteSection request={request} rows={rows} onNotice={setNotice} />}
        </>
      )}

      <h2>Answers</h2>
      <ol className="rows">
        {rows.map((r) => (
          <RowView key={r.rowId} row={r} request={request} onNotice={setNotice} />
        ))}
      </ol>

      {waiting.length > 0 && (
        <p>
          <button
            className="danger link"
            onClick={() => {
              if (!window.confirm('Discard every answer still waiting in this request? They will count for nothing.'))
                return;
              abandonRequest(db, ctx(), newOpId(), request.id).catch((e: unknown) => setNotice(errorText(e)));
            }}
          >
            Discard the waiting answers
          </button>
        </p>
      )}
    </>
  );
}

function CopySection({
  request,
  disclosureSeen,
  selfFirst,
}: {
  request: RequestRecord;
  disclosureSeen: boolean;
  selfFirst: boolean;
}) {
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState(false);

  if (request.promptText === null) {
    return <p className="notice">This item is too long to grade by chatbot. Grade it yourself below.</p>;
  }
  const prompt = request.promptText;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setFallback(true);
    }
  };

  const onCopy = () => {
    if (!disclosureSeen) setShowDisclosure(true);
    else void copy();
  };

  return (
    <section aria-labelledby="copy">
      <h2 id="copy">1. Copy the grading prompt</h2>
      {selfFirst && <p className="meta">Grading it yourself? Use "Grade it myself" on each answer below.</p>}
      {showDisclosure ? (
        <div role="dialog" aria-modal="false" aria-labelledby="disclosure-title" className="dialog">
          <h3 id="disclosure-title">Before you paste</h3>
          <p>{DISCLOSURE}</p>
          <button
            className="primary"
            onClick={() => {
              setShowDisclosure(false);
              void saveSetting('disclosureSeen', true).then(copy);
            }}
          >
            I understand, copy
          </button>
        </div>
      ) : (
        <div className="row">
          <button className="primary" onClick={onCopy}>
            {copied ? 'Copied' : 'Copy for grading'}
          </button>
          <button className="link" onClick={() => setFallback((f) => !f)}>
            {fallback ? 'Hide prompt' : 'Show prompt'}
          </button>
        </div>
      )}
      {fallback && (
        <>
          <label htmlFor="prompt-text" className="meta">
            Select all and copy this text:
          </label>
          <textarea id="prompt-text" readOnly rows={8} value={prompt} onFocus={(e) => e.currentTarget.select()} />
        </>
      )}
      <p className="meta">
        Paste it into a chatbot:{' '}
        {CHATBOTS.map((c, i) => (
          <span key={c.name}>
            {i > 0 && ' · '}
            <a href={c.url} target="_blank" rel="noopener noreferrer">
              {c.name}
            </a>
          </span>
        ))}
        . The links never carry your answers.
      </p>
    </section>
  );
}

interface Preview {
  raw: string;
  result: ParseResult;
  chosen: ParsedBlock | null;
  opId: string;
  revisions: Record<string, number>;
}

function PasteSection({
  request,
  rows,
  onNotice,
}: {
  request: RequestRecord;
  rows: Row[];
  onNotice: (s: string) => void;
}) {
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [ratings, setRatings] = useState<Record<string, RatingChoice>>({});
  const [busy, setBusy] = useState(false);
  const confirming = useRef(false);

  const read = () => {
    const result = parseReply(raw, {
      id: request.id,
      rows: rows.map((r) => ({ rowId: r.rowId, max: r.snapshot.max, allowedTags: r.snapshot.allowedTags })),
    });
    setPreview({
      raw,
      result,
      chosen: result.kind === 'parsed' ? result.block : null,
      opId: newOpId(),
      revisions: Object.fromEntries(rows.map((r) => [r.rowId, r.attempt.revision])),
    });
    setRatings({});
  };

  const block = preview?.chosen ?? null;
  const byRow = new Map(rows.map((r) => [r.rowId, r]));
  const toSave = block
    ? block.rows.filter((pr) => {
        const row = byRow.get(pr.rowId);
        if (!row || pr.status !== 'valid') return false;
        if (row.state === 'pending') return true;
        return row.state === 'needs-review' && pr.score !== null;
      })
    : [];

  const confirm = async () => {
    if (!preview || !block || confirming.current) return;
    confirming.current = true;
    setBusy(true);
    try {
      const gradeRows: GradeRow[] = toSave.map((pr) => {
        const row = byRow.get(pr.rowId)!;
        const valid = pr as Extract<typeof pr, { status: 'valid' }>;
        return {
          attemptId: row.attempt.id,
          revision: preview.revisions[pr.rowId]!,
          score: valid.score,
          tags: valid.tags,
          source: 'parsed',
          disqualified: false,
          feedbackRange: valid.feedback,
          ratingChoice: ratings[pr.rowId] ?? 'good',
        };
      });
      await confirmRows(db, ctx(), preview.opId, request.id, gradeRows, {
        raw: preview.raw,
        parserVersion: PARSER_VERSION,
        selectedBlock: block.range,
        parseOutcome: block.outcome,
      });
      setPreview(null);
      setRaw('');
      onNotice('');
    } catch (e) {
      onNotice(errorText(e));
      setPreview(null);
    } finally {
      confirming.current = false;
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="paste">
      <h2 id="paste">2. Paste the chatbot's whole reply</h2>
      <label htmlFor="reply" className="sr-only">
        Chatbot reply
      </label>
      <textarea id="reply" rows={6} value={raw} onChange={(e) => setRaw(e.target.value)} />
      <button onClick={read} disabled={raw.trim() === ''}>
        Read scores
      </button>

      {preview?.result.kind === 'none' && (
        <p role="alert">{preview.result.message}. You can grade the answers yourself or enter scores below.</p>
      )}

      {preview?.result.kind === 'choose' && !preview.chosen && (
        <div role="group" aria-label="Choose a score block">
          <p>This reply has more than one different score block. Which one is right?</p>
          {preview.result.options.map((o, i) => (
            <div key={i} className="choice">
              <pre className="plain">{preview.raw.slice(o.range.start, o.range.end)}</pre>
              <button onClick={() => setPreview({ ...preview, chosen: o })}>Use block {i + 1}</button>
            </div>
          ))}
        </div>
      )}

      {block && (
        <div aria-live="polite">
          <h3>What Premise read</h3>
          <ul className="list">
            {block.rows.map((pr) => {
              const row = byRow.get(pr.rowId);
              const label = row ? taskLabel(row.snapshot) : pr.rowId;
              const already = row && (row.state === 'accepted' || row.state === 'discarded');
              const full = pr.status === 'valid' && pr.score !== null && pr.score === pr.max;
              return (
                <li key={pr.rowId}>
                  <strong>
                    {pr.rowId} {label}:
                  </strong>{' '}
                  {already
                    ? `already ${row.state}`
                    : pr.status === 'valid'
                      ? pr.score === null
                        ? 'the grader could not decide (needs review)'
                        : `${pr.score}/${pr.max}`
                      : pr.status === 'missing'
                        ? 'missing from the reply'
                        : `invalid: ${pr.reason}`}
                  {pr.status === 'valid' && pr.tags.length > 0 && <span className="meta"> · {pr.tags.join(', ')}</span>}
                  {pr.status !== 'missing' && pr.feedback === null && pr.status === 'valid' && (
                    <span className="meta"> · feedback could not be matched to this item</span>
                  )}
                  {full && !already && (
                    <fieldset className="rating">
                      <legend className="sr-only">How did {pr.rowId} feel?</legend>
                      {(['good', 'hard', 'easy'] as const).map((c) => (
                        <label key={c}>
                          <input
                            type="radio"
                            name={`rating-${pr.rowId}`}
                            checked={(ratings[pr.rowId] ?? 'good') === c}
                            onChange={() => setRatings({ ...ratings, [pr.rowId]: c })}
                          />{' '}
                          {c === 'good' ? 'Normal' : c === 'hard' ? 'That was hard' : 'Too easy'}
                        </label>
                      ))}
                    </fieldset>
                  )}
                </li>
              );
            })}
          </ul>
          {(block.warnings.length > 0 || block.rows.some((r) => r.warnings.length > 0) || !block.complete) && (
            <details>
              <summary>Warnings</summary>
              <ul>
                {!block.complete && <li>The score block has no END SCORES line; check it is complete.</li>}
                {block.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
                {block.rows.flatMap((r) =>
                  r.warnings.map((w, i) => <li key={`${r.rowId}-${i}`}>{`${r.rowId}: ${w}`}</li>),
                )}
                {block.unknownRowIds.length > 0 && (
                  <li>Ignored rows not in this request: {block.unknownRowIds.join(', ')}</li>
                )}
              </ul>
            </details>
          )}
          <details>
            <summary>Full reply</summary>
            <pre className="plain">{preview!.raw}</pre>
          </details>
          <button className="primary" disabled={busy || toSave.length === 0} onClick={() => void confirm()}>
            {block.complete ? 'Confirm' : 'Confirm anyway'} {toSave.length} {toSave.length === 1 ? 'grade' : 'grades'}
          </button>
        </div>
      )}
    </section>
  );
}

function taskLabel(s: SnapshotRecord): string {
  return content.taxonomy.skills[s.skill]?.label ?? s.skill;
}

function feedbackText(row: Row): string | null {
  const range = row.grading?.feedbackRange;
  if (!range || !row.reply) return null;
  return row.reply.raw.slice(range.start, range.end);
}

function tipOf(feedback: string): string | null {
  const line = feedback.split('\n').find((l) => /^\W*tip\W*:/i.test(l.trim()));
  return line
    ? line
        .replace(/^\W*tip\W*:\s*/i, '')
        .replace(/\*+$/, '')
        .trim()
    : null;
}

function RowView({ row, request, onNotice }: { row: Row; request: RequestRecord; onNotice: (s: string) => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'none' | 'self' | 'manual' | 'correct' | 'flag'>('none');
  const { snapshot, attempt, grading, state } = row;
  const feedback = feedbackText(row);
  const tip = feedback ? tipOf(feedback) : null;
  const missed = state === 'accepted' && grading!.score! < grading!.max;

  const act = (p: Promise<unknown>) => p.then(() => setMode('none')).catch((e: unknown) => onNotice(errorText(e)));

  const tryAgain = async () => {
    const s = await startSession(db, ctx(), 'retry', [attempt.taskId]);
    navigate(`/session/${s.id}`);
  };

  return (
    <li className="row-card">
      <h3>
        {row.rowId} · {taskLabel(snapshot)}
      </h3>
      <p className="meta">{snapshot.prompt}</p>
      <blockquote className="answer">{attempt.answer.trim() === '' ? '(blank)' : attempt.answer}</blockquote>

      {state === 'accepted' && (
        <>
          <p>
            <strong>
              {grading!.score}/{grading!.max}
            </strong>
            {grading!.source !== 'parsed' && (
              <span className="meta"> · {grading!.source === 'self' ? 'self-graded' : 'entered by hand'}</span>
            )}
            {grading!.disqualified && <span className="meta"> · disqualifier applied</span>}
            {grading!.tags.length > 0 && <span className="meta"> · {grading!.tags.join(', ')}</span>}
            {attempt.kind === 'coached' && <span className="meta"> · practice retry, not scheduled</span>}
          </p>
          {tip && (
            <p className="tip">
              <strong>Correction:</strong> {tip}
            </p>
          )}
          {feedback ? (
            <details>
              <summary>Grader's feedback</summary>
              <pre className="plain">{feedback}</pre>
            </details>
          ) : grading!.source === 'parsed' ? (
            <p className="meta">
              Score imported; feedback could not be matched to this item. The full reply is kept with the request.
            </p>
          ) : null}
          {missed && attempt.kind !== 'coached' && (
            <p className="meta">Premise will check this point on a fresh argument in a later session.</p>
          )}
          {row.card && attempt.kind !== 'coached' && row.changeable && (
            <p className="meta">Due again on {formatLocalDate(localDateOf(row.card.due))}.</p>
          )}
          <details className="reference">
            <summary>Reference answer</summary>
            <p>{snapshot.reference}</p>
            {snapshot.accept && <p className="meta">Counts as correct: {snapshot.accept}</p>}
          </details>
          <div className="row">
            {missed && <button onClick={() => void tryAgain()}>Try again</button>}
            {row.changeable ? (
              <>
                <button onClick={() => setMode(mode === 'correct' ? 'none' : 'correct')}>Correct grade</button>
                <button onClick={() => void act(undoLatest(db, ctx(), newOpId(), attempt.id, attempt.revision))}>
                  Undo
                </button>
              </>
            ) : (
              <span className="meta">Older grades are locked because this task was reviewed again since.</span>
            )}
            <button className="link" onClick={() => setMode(mode === 'flag' ? 'none' : 'flag')}>
              Flag
            </button>
          </div>
        </>
      )}

      {state === 'needs-review' && <p>The grader could not decide. Enter a score or grade it yourself.</p>}
      {state === 'discarded' && <p className="meta">Discarded: this answer counts for nothing.</p>}

      {(state === 'pending' || state === 'needs-review') && (
        <div className="row">
          <button onClick={() => setMode(mode === 'self' ? 'none' : 'self')}>Grade it myself</button>
          <button onClick={() => setMode(mode === 'manual' ? 'none' : 'manual')}>Enter a score</button>
          <button
            className="link"
            onClick={() =>
              void act(
                discardRows(db, ctx(), newOpId(), request.id, [{ attemptId: attempt.id, revision: attempt.revision }]),
              )
            }
          >
            Discard
          </button>
        </div>
      )}

      {mode === 'self' && (
        <SelfGrade
          snapshot={snapshot}
          onSave={(score, disqualified, ratingChoice) =>
            act(
              confirmRows(
                db,
                ctx(),
                newOpId(),
                request.id,
                [
                  {
                    attemptId: attempt.id,
                    revision: attempt.revision,
                    score,
                    tags: [],
                    source: 'self',
                    disqualified,
                    feedbackRange: null,
                    ratingChoice,
                  },
                ],
                null,
              ),
            )
          }
        />
      )}
      {(mode === 'manual' || mode === 'correct') && (
        <ManualScore
          max={snapshot.max}
          label={mode === 'correct' ? 'Save corrected grade' : 'Save score'}
          onSave={(score, ratingChoice) => {
            const r: GradeRow = {
              attemptId: attempt.id,
              revision: attempt.revision,
              score,
              tags: mode === 'correct' ? (grading?.tags ?? []) : [],
              source: 'manual',
              disqualified: false,
              feedbackRange: mode === 'correct' ? (grading?.feedbackRange ?? null) : null,
              ratingChoice,
            };
            return act(
              mode === 'correct'
                ? correctGrade(db, ctx(), newOpId(), r)
                : confirmRows(db, ctx(), newOpId(), request.id, [r], null),
            );
          }}
        />
      )}
      {mode === 'flag' && <FlagForm onSave={(category, note) => act(addFlag(db, ctx(), attempt.id, category, note))} />}
    </li>
  );
}

function RatingPicker({ value, onChange }: { value: RatingChoice; onChange: (v: RatingChoice) => void }) {
  return (
    <fieldset className="rating">
      <legend className="meta">If full credit:</legend>
      {(['good', 'hard', 'easy'] as const).map((c) => (
        <label key={c}>
          <input type="radio" checked={value === c} onChange={() => onChange(c)} />{' '}
          {c === 'good' ? 'Normal' : c === 'hard' ? 'That was hard' : 'Too easy'}
        </label>
      ))}
    </fieldset>
  );
}

function SelfGrade({
  snapshot,
  onSave,
}: {
  snapshot: SnapshotRecord;
  onSave: (score: number, disqualified: boolean, rating: RatingChoice) => Promise<unknown>;
}) {
  const [met, setMet] = useState(snapshot.rubric.map(() => false));
  const [disqualified, setDisqualified] = useState(false);
  const [rating, setRating] = useState<RatingChoice>('good');
  const score = selfGradeScore(met, disqualified);
  return (
    <div className="panel">
      <p>
        <strong>Reference:</strong> {snapshot.reference}
      </p>
      {snapshot.accept && <p className="meta">Counts as correct: {snapshot.accept}</p>}
      <p className="meta">Examples:</p>
      <ul className="meta">
        {snapshot.anchors.map((a) => (
          <li key={a.points}>
            {a.points}/{snapshot.max}: {a.answer}
            {a.note ? ` (${a.note})` : ''}
          </li>
        ))}
      </ul>
      <fieldset>
        <legend>Tick each criterion your answer meets</legend>
        {snapshot.rubric.map((c, i) => (
          <label key={i} className="check">
            <input
              type="checkbox"
              checked={met[i]}
              onChange={(e) => setMet(met.map((m, j) => (j === i ? e.target.checked : m)))}
            />{' '}
            {c}
          </label>
        ))}
      </fieldset>
      {snapshot.disqualifiers.length > 0 && (
        <label className="check">
          <input type="checkbox" checked={disqualified} onChange={(e) => setDisqualified(e.target.checked)} /> A
          disqualifier applies: {snapshot.disqualifiers.join('; ')}
        </label>
      )}
      {score === snapshot.max && <RatingPicker value={rating} onChange={setRating} />}
      <button className="primary" onClick={() => void onSave(score, disqualified, rating)}>
        Save {score}/{snapshot.max}
      </button>
    </div>
  );
}

function ManualScore({
  max,
  label,
  onSave,
}: {
  max: number;
  label: string;
  onSave: (score: number, rating: RatingChoice) => Promise<unknown>;
}) {
  const [value, setValue] = useState('');
  const [rating, setRating] = useState<RatingChoice>('good');
  const score = Number(value);
  const valid = value !== '' && Number.isInteger(score) && score >= 0 && score <= max;
  return (
    <div className="panel">
      <label>
        Score out of {max}{' '}
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value.trim())}
          aria-invalid={value !== '' && !valid}
          size={3}
        />
      </label>
      {value !== '' && !valid && <p role="alert">Enter a whole number from 0 to {max}.</p>}
      {valid && score === max && <RatingPicker value={rating} onChange={setRating} />}
      <button className="primary" disabled={!valid} onClick={() => void onSave(score, rating)}>
        {label}
      </button>
    </div>
  );
}

function FlagForm({
  onSave,
}: {
  onSave: (c: 'unfair-grade' | 'content-problem' | 'other', note: string) => Promise<unknown>;
}) {
  const [category, setCategory] = useState<'unfair-grade' | 'content-problem' | 'other'>('unfair-grade');
  const [note, setNote] = useState('');
  return (
    <div className="panel">
      <label>
        What's wrong?{' '}
        <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
          <option value="unfair-grade">The grade is unfair</option>
          <option value="content-problem">The exercise has a problem</option>
          <option value="other">Something else</option>
        </select>
      </label>
      <label htmlFor="flag-note" className="meta">
        Note
      </label>
      <textarea id="flag-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      <button onClick={() => void onSave(category, note)}>Save flag</button>
    </div>
  );
}
