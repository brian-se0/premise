import { useRef, useState } from 'react';
import { content } from '../../content.ts';
import { MAX_BATCH_SIZE } from '../../domain/prompt.ts';
import { checkImport, exportData, MAX_IMPORT_BYTES, replaceAll, type ImportSummary } from '../../storage/backup.ts';
import type { DataSet } from '../../domain/records.ts';
import { setTaskControls } from '../../storage/ops.ts';
import { ctx, db, findTask, newOpId, saveSetting, useLive, useSettings } from '../runtime.ts';

export function SettingsPage() {
  const settings = useSettings();
  if (!settings) return <p>Loading…</p>;
  return (
    <>
      <h1>Settings</h1>

      <section aria-labelledby="practice-settings">
        <h2 id="practice-settings">Practice</h2>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.finalWeeks}
            onChange={(e) => void saveSetting('finalWeeks', e.target.checked)}
          />{' '}
          Final-weeks mode: short sessions of medium and hard tasks, and a daily cap on reviews
        </label>
        {settings.finalWeeks && (
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={settings.timerEnabled}
                onChange={(e) => void saveSetting('timerEnabled', e.target.checked)}
              />{' '}
              Show a timer
            </label>
            <label>
              Target seconds per task{' '}
              <select
                value={settings.timerSeconds}
                onChange={(e) => void saveSetting('timerSeconds', Number(e.target.value))}
              >
                {[90, 105, 120].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Most reviews per day{' '}
              <select
                value={settings.dailyReviewCap}
                onChange={(e) => void saveSetting('dailyReviewCap', Number(e.target.value))}
              >
                {[2, 3, 4, 6, 8].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <label>
          Grade{' '}
          <select
            value={settings.gradingMode}
            onChange={(e) => void saveSetting('gradingMode', e.target.value as typeof settings.gradingMode)}
          >
            <option value="batch">at the end of a session</option>
            <option value="per-exercise">after each argument</option>
          </select>
        </label>
        <label>
          Answers per grading prompt{' '}
          <select value={settings.batchSize} onChange={(e) => void saveSetting('batchSize', Number(e.target.value))}>
            {Array.from({ length: MAX_BATCH_SIZE }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section aria-labelledby="focus">
        <h2 id="focus">Focus</h2>
        <p className="meta">Pick a reasoning mistake you keep making. Premise will favour tasks that test it.</p>
        <label>
          Mistake{' '}
          <select
            value={settings.focus.tag ?? ''}
            onChange={(e) => void saveSetting('focus', { ...settings.focus, tag: e.target.value || null })}
          >
            <option value="">None</option>
            {Object.entries(content.taxonomy.error_tags).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="focus-note" className="meta">
          Note to yourself about a miss in your official practice. Describe the mistake in your own words; don't copy
          official questions here.
        </label>
        <textarea
          id="focus-note"
          rows={2}
          defaultValue={settings.focus.note}
          onBlur={(e) => void saveSetting('focus', { ...settings.focus, note: e.target.value })}
        />
      </section>

      <Suspended />

      <Backup lastExportAt={settings.lastExportAt} />
    </>
  );
}

function Suspended() {
  const suspended = useLive(() => db.taskStates.filter((t) => t.suspended).toArray(), []);
  return (
    <section aria-labelledby="suspended">
      <h2 id="suspended">Hidden tasks</h2>
      {!suspended || suspended.length === 0 ? (
        <p className="meta">None. "Stop showing this task" on a graded answer hides a task from your sessions.</p>
      ) : (
        <ul className="list">
          {suspended.map((t) => {
            const found = findTask(t.taskId);
            return (
              <li key={t.taskId}>
                {found ? found.task.prompt : t.taskId}{' '}
                <button
                  className="link"
                  onClick={() => void setTaskControls(db, ctx(), newOpId(), t.taskId, { suspended: false })}
                >
                  Show again
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportNow() {
  const now = new Date().toISOString();
  const file = await exportData(db, now, __COMMIT__.slice(0, 7));
  download(`premise-backup-${now.slice(0, 10)}.json`, JSON.stringify(file));
  // Recorded only once the file has been produced.
  await saveSetting('lastExportAt', now);
}

function Backup({ lastExportAt }: { lastExportAt: string | null }) {
  const [pending, setPending] = useState<{ data: DataSet; summary: ImportSummary } | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  // One backup action at a time, so "Export current data first" finishes before Replace can start.
  const [busy, setBusy] = useState(false);
  // Only the latest file selection may show a preview; an earlier, slower check is ignored.
  const selection = useRef(0);

  const running = useRef(false);
  const run = async (action: () => Promise<void>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    try {
      await action();
    } finally {
      running.current = false;
      setBusy(false);
    }
  };

  const onExport = () =>
    run(async () => {
      try {
        await exportNow();
      } catch (e) {
        setStatus(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    });

  const onFile = async (file: File | undefined) => {
    const token = ++selection.current;
    setProblems([]);
    setPending(null);
    setStatus('');
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setProblems([`The file is larger than ${MAX_IMPORT_BYTES / 1024 / 1024} MB.`]);
      return;
    }
    const check = await checkImport(await file.text());
    if (token !== selection.current) return;
    if (check.ok) setPending({ data: check.data, summary: check.summary });
    else setProblems(check.problems);
  };

  const replace = () =>
    run(async () => {
      if (!pending) return;
      try {
        await replaceAll(db, pending.data);
        setPending(null);
        setStatus('Imported. Your previous data was replaced.');
      } catch (e) {
        setStatus(`Import failed and nothing changed: ${e instanceof Error ? e.message : String(e)}`);
      }
    });

  return (
    <section aria-labelledby="backup">
      <h2 id="backup">Backup</h2>
      <p className="meta">
        Everything stays on this device.{' '}
        {lastExportAt ? `Last export: ${new Date(lastExportAt).toLocaleString()}.` : 'No export yet.'}
      </p>
      <button disabled={busy} onClick={() => void onExport()}>
        Export a backup
      </button>
      <h3>Import</h3>
      <p className="meta">Importing replaces all data on this device with the file's contents.</p>
      <label>
        Backup file{' '}
        <input type="file" accept="application/json,.json" onChange={(e) => void onFile(e.target.files?.[0])} />
      </label>
      {problems.length > 0 && (
        <div role="alert">
          <p>This file can't be imported:</p>
          <ul>
            {problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {pending && (
        <div className="panel">
          <p>
            The file has {pending.summary.counts.attempts} answers, {pending.summary.counts.gradings} grades and{' '}
            {pending.summary.counts.cards} scheduled tasks
            {pending.summary.lastActivity
              ? `, last active ${new Date(pending.summary.lastActivity).toLocaleString()}`
              : ''}
            .
          </p>
          {pending.summary.unknownSchedulers.length > 0 && (
            <p className="meta">
              Some reviews use a scheduler this version doesn't know; their history stays readable but can't be
              corrected or undone.
            </p>
          )}
          <div className="row">
            <button disabled={busy} onClick={() => void onExport()}>
              Export current data first
            </button>
            <button className="danger" disabled={busy} onClick={() => void replace()}>
              Replace everything
            </button>
            <button className="link" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {status && <p role="status">{status}</p>}
    </section>
  );
}
