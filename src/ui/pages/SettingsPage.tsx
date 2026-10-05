import { useEffect, useRef, useState } from 'react';
import Dexie from 'dexie';
import { content } from '../../content.ts';
import { MAX_BATCH_SIZE } from '../../domain/prompt.ts';
import {
  checkImportFile,
  exportData,
  EXPORT_SCHEMA_VERSION,
  replaceAll,
  type ImportSummary,
} from '../../storage/backup.ts';
import { DEVICE_SETTINGS, type DataSet, type ReviewLogRecord, type VersionedCard } from '../../domain/records.ts';
import { SCHEDULER_CONFIGS } from '../../domain/schedulerConfig.ts';
import { setTaskControls } from '../../storage/ops.ts';
import { TABLES } from '../../storage/db.ts';
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

const LEGACY_PREVIEW_DB = 'premise-preview';

const CARD_KEYS = [
  'schedulerVersion',
  'due',
  'stability',
  'difficulty',
  'elapsed_days',
  'scheduled_days',
  'learning_steps',
  'reps',
  'lapses',
  'state',
  'last_review',
] as const satisfies readonly (keyof VersionedCard)[];

function sameCard(a: VersionedCard | null, b: VersionedCard | null): boolean {
  return a === null || b === null ? a === b : CARD_KEYS.every((key) => a[key] === b[key]);
}

function cardKey(card: VersionedCard | null): string {
  return card === null ? 'null' : JSON.stringify(CARD_KEYS.map((key) => card[key]));
}

/** Early preview v1 omitted review sequence numbers and the version of cardBefore. */
function normalizeLegacyReviewHistory(data: DataSet): DataSet {
  const missingSeq = data.reviewLogs.filter((log) => log.seq === undefined);
  if (missingSeq.length > 0 && missingSeq.length !== data.reviewLogs.length) {
    throw new Error('Old preview data mixes review logs with and without sequence numbers.');
  }
  const historical = missingSeq.length > 0;
  if (!historical && data.reviewLogs.every((log) => !log.cardBefore || log.cardBefore.schedulerVersion)) return data;

  const attempts = new Map(data.attempts.map((attempt) => [attempt.id, attempt]));
  const logs = data.reviewLogs.map((log) => {
    const attempt = attempts.get(log.attemptId);
    if (historical && !attempt?.submittedAt) throw new Error(`Review ${log.id} has no submitted answer.`);
    return {
      ...log,
      // Old undo always restored cardBefore under this log's scheduler version.
      cardBefore: log.cardBefore
        ? { ...log.cardBefore, schedulerVersion: log.cardBefore.schedulerVersion ?? log.schedulerVersion }
        : null,
      // Before seq existed, reviewedAt held the effective scheduler time. The attempt preserves
      // the student's actual submission time; cardAfter.last_review preserves the effective time.
      reviewedAt: historical ? attempt!.submittedAt! : log.reviewedAt,
    };
  });
  if (!historical) return { ...data, reviewLogs: logs };

  const activeByTask = new Map<string, ReviewLogRecord[]>();
  for (const log of logs) {
    if (log.undone) continue;
    const active = activeByTask.get(log.taskId) ?? [];
    active.push(log);
    activeByTask.set(log.taskId, active);
  }
  const chainByTask = new Map<string, ReviewLogRecord[]>();
  for (const [taskId, active] of activeByTask) {
    const byPrevious = new Map<string, ReviewLogRecord[]>();
    for (const log of active) {
      const key = cardKey(log.cardBefore);
      const candidates = byPrevious.get(key) ?? [];
      candidates.push(log);
      byPrevious.set(key, candidates);
    }
    const chain: ReviewLogRecord[] = [];
    let prior: VersionedCard | null = null;
    while (chain.length < active.length) {
      const key = cardKey(prior);
      const matches = byPrevious.get(key);
      if (matches?.length !== 1 || !sameCard(matches[0]!.cardBefore, prior)) {
        throw new Error(`Cannot determine the old review order for ${taskId}.`);
      }
      const log = matches[0]!;
      chain.push(log);
      byPrevious.delete(key);
      prior = { ...log.cardAfter, schedulerVersion: log.schedulerVersion };
    }
    chainByTask.set(taskId, chain);
  }

  // Preserve the approximate cross-task application order. Within a task the saved card chain,
  // rather than wall-clock timestamps or random IDs, determines which review came first.
  const chronological = [...logs].sort((a, b) => a.appliedAt.localeCompare(b.appliedAt) || a.id.localeCompare(b.id));
  const cursor = new Map<string, number>();
  const ordered = chronological.map((log) => {
    if (log.undone) return log;
    const index = cursor.get(log.taskId) ?? 0;
    cursor.set(log.taskId, index + 1);
    return chainByTask.get(log.taskId)![index]!;
  });
  return { ...data, reviewLogs: ordered.map((log, index) => ({ ...log, seq: index + 1 })) };
}

/** The removed public preview used its own database on the same origin. Inspect it without creating it. */
async function hasLegacyPreviewData(): Promise<boolean> {
  if (__PREVIEW__ || !(await Dexie.exists(LEGACY_PREVIEW_DB))) return false;
  // No declared version: declaring today's schema would upgrade an earlier v1 preview database.
  const legacy = new Dexie(LEGACY_PREVIEW_DB);
  try {
    await legacy.open();
    // Include settings and other records too: a focus note may be the only data worth recovering.
    return (await Promise.all(legacy.tables.map((table) => table.count()))).some((count) => count > 0);
  } catch {
    // If an old database cannot be inspected, still offer the export path rather than hide it.
    return true;
  } finally {
    legacy.close();
  }
}

async function exportLegacyPreview(): Promise<void> {
  if (!(await Dexie.exists(LEGACY_PREVIEW_DB))) throw new Error('The old preview data is no longer present.');
  const legacy = new Dexie(LEGACY_PREVIEW_DB);
  try {
    await legacy.open();
    const now = new Date().toISOString();
    const present = new Set(legacy.tables.map((table) => table.name));
    const data = (await legacy.transaction('r', legacy.tables, async () =>
      Object.fromEntries(
        await Promise.all(
          TABLES.map(async (name) => [name, present.has(name) ? await legacy.table(name).toArray() : []] as const),
        ),
      ),
    )) as unknown as DataSet;
    const normalized = normalizeLegacyReviewHistory(data);
    const versions = new Set(normalized.cards.map((card) => card.schedulerVersion));
    for (const log of normalized.reviewLogs) {
      versions.add(log.schedulerVersion);
      if (log.cardBefore) versions.add(log.cardBefore.schedulerVersion);
    }
    const stored = new Map(normalized.schedulerConfigs.map((record) => [record.version, record.config]));
    const schedulerConfigs = Object.create(null) as Record<string, Record<string, unknown>>;
    for (const version of [...versions].sort()) {
      const config = Object.hasOwn(SCHEDULER_CONFIGS, version) ? SCHEDULER_CONFIGS[version] : stored.get(version);
      if (!config) throw new Error(`Scheduler version ${version} has no stored configuration.`);
      schedulerConfigs[version] = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;
    }
    const { schedulerConfigs: _table, settings, ...rest } = normalized;
    const file = {
      app: 'premise',
      schemaVersion: EXPORT_SCHEMA_VERSION,
      exportedAt: now,
      appVersion: __COMMIT__.slice(0, 7),
      schedulerConfigs,
      ...rest,
      settings: settings.filter((record) => !(DEVICE_SETTINGS as readonly string[]).includes(record.key)),
    };
    download(`premise-preview-recovery-${now.slice(0, 10)}.json`, JSON.stringify(file));
  } finally {
    legacy.close();
  }
}

function Backup({ lastExportAt }: { lastExportAt: string | null }) {
  const [pending, setPending] = useState<{ data: DataSet; summary: ImportSummary } | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [legacyPreviewAvailable, setLegacyPreviewAvailable] = useState<boolean | null>(null);
  // One backup action at a time, so "Export current data first" finishes before Replace can start.
  const [busy, setBusy] = useState(false);
  // Only the latest file selection may show a preview; an earlier, slower check is ignored.
  const selection = useRef(0);

  useEffect(() => {
    let active = true;
    void hasLegacyPreviewData()
      .then((available) => {
        if (active) setLegacyPreviewAvailable(available);
      })
      .catch((e: unknown) => {
        if (active) {
          setLegacyPreviewAvailable(false);
          setStatus(`Could not check old preview data: ${e instanceof Error ? e.message : String(e)}`);
        }
      });
    return () => {
      active = false;
    };
  }, []);

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

  const onLegacyExport = () =>
    run(async () => {
      try {
        await exportLegacyPreview();
        setStatus('Old preview backup downloaded.');
      } catch (e) {
        setStatus(`Old preview export failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    });

  const onFile = async (file: File | undefined) => {
    const token = ++selection.current;
    setProblems([]);
    setPending(null);
    setStatus('');
    if (!file) return;
    try {
      const check = await checkImportFile(file);
      if (token !== selection.current) return;
      if (check.ok) setPending({ data: check.data, summary: check.summary });
      else setProblems(check.problems);
    } catch {
      if (token === selection.current) setProblems(['The backup file could not be read or validated.']);
    }
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
    <section aria-labelledby="backup" aria-busy={legacyPreviewAvailable === null}>
      <h2 id="backup">Backup</h2>
      <p className="meta">
        Everything stays on this device.{' '}
        {lastExportAt ? `Last export: ${new Date(lastExportAt).toLocaleString()}.` : 'No export yet.'}
      </p>
      <button disabled={busy} onClick={() => void onExport()}>
        Export a backup
      </button>
      {legacyPreviewAvailable && (
        <div className="panel">
          <h3>One-time recovery: old preview data</h3>
          <p>
            An earlier preview kept practice data separately on this device. Download its backup to preserve it. This
            does not add it to your current practice data or change either copy.
          </p>
          <button disabled={busy} onClick={() => void onLegacyExport()}>
            Download old preview backup
          </button>
        </div>
      )}
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
