// Recovery from an early v1 preview database, whose schema predates the published v1 schema.
import { expect, test, type Page } from '@playwright/test';

test.skip(!process.env.E2E_DRAFTS, 'needs a build with draft exercises (E2E_DRAFTS=1)');

// Frozen from c02c953: no schedulerConfigs store or review-log sequence index. Do not copy the
// current schema into the fixture: that hides accidental upgrades by Settings.
const EARLY_PREVIEW_V1 = {
  snapshots: { keyPath: 'hash', indexes: ['taskId'] },
  sessions: { keyPath: 'id', indexes: ['createdAt'] },
  attempts: { keyPath: 'id', indexes: ['sessionId', 'taskId', 'requestId', 'state'] },
  requests: { keyPath: 'id', indexes: ['status', 'createdAt'] },
  replies: { keyPath: 'id', indexes: ['requestId'] },
  gradings: { keyPath: 'id', indexes: ['attemptId', 'requestId'] },
  reviewLogs: { keyPath: 'id', indexes: ['taskId', 'attemptId', 'gradingId'] },
  cards: { keyPath: 'taskId', indexes: [] },
  taskStates: { keyPath: 'taskId', indexes: [] },
  flags: { keyPath: 'id', indexes: ['attemptId'] },
  operations: { keyPath: 'opId', indexes: [] },
  settings: { keyPath: 'key', indexes: [] },
} as const;

// Frozen from the preview deployed at d76cef5. Its v1 stores and indexes match the published
// schema, including the unique review sequence and scheduler configuration stores.
const DEPLOYED_PREVIEW_V1 = {
  snapshots: { keyPath: 'hash', indexes: ['taskId'] },
  sessions: { keyPath: 'id', indexes: ['createdAt'] },
  attempts: { keyPath: 'id', indexes: ['sessionId', 'taskId', 'requestId', 'state'] },
  requests: { keyPath: 'id', indexes: ['status', 'createdAt'] },
  replies: { keyPath: 'id', indexes: ['requestId'] },
  gradings: { keyPath: 'id', indexes: ['attemptId', 'requestId'] },
  reviewLogs: { keyPath: 'id', indexes: ['taskId', 'attemptId', 'gradingId', '&seq'] },
  cards: { keyPath: 'taskId', indexes: [] },
  taskStates: { keyPath: 'taskId', indexes: [] },
  flags: { keyPath: 'id', indexes: ['attemptId'] },
  operations: { keyPath: 'opId', indexes: [] },
  schedulerConfigs: { keyPath: 'version', indexes: [] },
  settings: { keyPath: 'key', indexes: [] },
} as const;

async function snapshotLegacy(page: Page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('premise-preview');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const names = Array.from(db.objectStoreNames).sort();
      const tx = db.transaction(names, 'readonly');
      const stores = await Promise.all(
        names.map((name) => {
          const store = tx.objectStore(name);
          const get = store.getAll();
          return new Promise<{
            name: string;
            keyPath: string | string[] | null;
            autoIncrement: boolean;
            indexes: string[];
            indexDefinitions: {
              name: string;
              keyPath: string | string[];
              unique: boolean;
              multiEntry: boolean;
            }[];
            rows: unknown[];
          }>((resolve, reject) => {
            get.onsuccess = () =>
              resolve({
                name,
                keyPath: store.keyPath,
                autoIncrement: store.autoIncrement,
                indexes: Array.from(store.indexNames).sort(),
                indexDefinitions: Array.from(store.indexNames, (indexName) => {
                  const index = store.index(indexName);
                  return {
                    name: indexName,
                    keyPath: index.keyPath,
                    unique: index.unique,
                    multiEntry: index.multiEntry,
                  };
                }),
                rows: (get.result as unknown[]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
              });
            get.onerror = () => reject(get.error);
          });
        }),
      );
      return { version: db.version, stores };
    } finally {
      db.close();
    }
  });
}

async function makeAcceptedHistory(page: Page, answers: [string, string]) {
  await page.goto('#/library/arg-0001');
  await page.getByRole('button', { name: 'Practice this exercise' }).click();
  for (const answer of answers) {
    await page.getByLabel('Your answer').fill(answer);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Grade with a chatbot' }).click();
  await expect(page).toHaveURL(/#\/request\//);
  const requestId = page.url().split('/request/')[1]!;
  const raw = [
    `BEGIN FEEDBACK request=${requestId}`,
    'I01: 1/1',
    '- Tip: Check the conclusion.',
    'I02: 1/2',
    '- Tip: Check the causal inference.',
    'END FEEDBACK',
    `BEGIN SCORES v2 request=${requestId}`,
    'I01 | 1/1 | -',
    'I02 | 1/2 | -',
    'END SCORES',
  ].join('\n');
  await page.locator('#reply').fill(raw);
  await page.getByRole('button', { name: 'Read scores' }).click();
  await expect(page.getByRole('button', { name: /^Confirm/ })).toBeVisible();
  await page.getByRole('button', { name: /^Confirm/ }).click();
  await expect(page.getByText(/0 waiting · closed/)).toBeVisible();
  return { requestId, raw };
}

async function permitEarlyLibraryReview(page: Page) {
  // The fixture needs a second active review of the same task to exercise cardBefore conversion.
  await page.evaluate(async () => {
    const open = indexedDB.open('premise');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    const tx = db.transaction('taskStates', 'readwrite');
    const store = tx.objectStore('taskStates');
    const get = store.getAll();
    await new Promise<void>((resolve, reject) => {
      get.onsuccess = () => {
        for (const row of get.result as { taskId: string; notBefore: string | null }[]) {
          store.put({ ...row, notBefore: null });
        }
        resolve();
      };
      get.onerror = () => reject(get.error);
    });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
}

test('Settings neither offers recovery nor creates a preview database when none exists', async ({ page }) => {
  await page.goto('#/settings');
  await expect(page.getByRole('region', { name: 'Backup' })).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByRole('button', { name: 'Download old preview backup' })).toHaveCount(0);
  expect(
    await page.evaluate(async () =>
      (await indexedDB.databases()).some((database) => database.name === 'premise-preview'),
    ),
  ).toBe(false);
});

test('deployed v1 preview recovery matches a normal backup and leaves its database unchanged', async ({ page }) => {
  const history = await makeAcceptedHistory(page, [
    'The conclusion is qualified.',
    'The premise does not establish causation.',
  ]);
  await page.goto('#/settings');
  const normalDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export a backup' }).click();
  const normalFile = await normalDownload;
  const normal = JSON.parse(Buffer.concat(await (await normalFile.createReadStream()).toArray()).toString()) as Record<
    string,
    unknown
  >;

  await page.evaluate(
    async ({ schema, data }) => {
      const activeOpen = indexedDB.open('premise');
      const active = await new Promise<IDBDatabase>((resolve, reject) => {
        activeOpen.onsuccess = () => resolve(activeOpen.result);
        activeOpen.onerror = () => reject(activeOpen.error);
      });
      const version = active.version;
      active.close();

      const oldOpen = indexedDB.open('premise-preview', version);
      oldOpen.onupgradeneeded = () => {
        for (const [name, definition] of Object.entries(schema)) {
          const store = oldOpen.result.createObjectStore(name, { keyPath: definition.keyPath });
          for (const spec of definition.indexes) {
            const unique = spec.startsWith('&');
            const indexName = unique ? spec.slice(1) : spec;
            store.createIndex(indexName, indexName, { unique });
          }
        }
      };
      const old = await new Promise<IDBDatabase>((resolve, reject) => {
        oldOpen.onsuccess = () => resolve(oldOpen.result);
        oldOpen.onerror = () => reject(oldOpen.error);
      });
      const names = Object.keys(schema);
      const write = old.transaction(names, 'readwrite');
      for (const name of names) {
        const records = name === 'schedulerConfigs' ? [] : (data[name] as unknown[]);
        for (const record of records) write.objectStore(name).put(record);
      }
      await new Promise<void>((resolve, reject) => {
        write.oncomplete = () => resolve();
        write.onerror = () => reject(write.error);
      });
      old.close();
    },
    { schema: DEPLOYED_PREVIEW_V1, data: normal },
  );

  const before = await snapshotLegacy(page);
  expect(before.stores.map((store) => store.name)).toContain('schedulerConfigs');
  expect(before.stores.find((store) => store.name === 'reviewLogs')?.indexDefinitions).toContainEqual(
    expect.objectContaining({ name: 'seq', keyPath: 'seq', unique: true }),
  );
  await page.goto('#/');
  await page.goto('#/settings');
  const recover = page.getByRole('button', { name: 'Download old preview backup' });
  await expect(recover).toBeVisible();
  const recoveryDownload = page.waitForEvent('download');
  await recover.click();
  const recoveredFile = await recoveryDownload;
  const buffer = Buffer.concat(await (await recoveredFile.createReadStream()).toArray());
  const recovered = JSON.parse(buffer.toString()) as Record<string, unknown>;
  const withoutExportTime = ({ exportedAt: _exportedAt, ...rest }: Record<string, unknown>) => rest;
  expect((recovered.requests as { id: string }[]).map((request) => request.id)).toContain(history.requestId);
  expect(recovered.replies as { requestId: string; raw: string }[]).toContainEqual(
    expect.objectContaining({ requestId: history.requestId, raw: history.raw }),
  );
  expect(recovered.gradings as unknown[]).toHaveLength(2);
  expect(withoutExportTime(recovered)).toEqual(withoutExportTime(normal));
  await page.getByLabel('Backup file').setInputFiles({
    name: recoveredFile.suggestedFilename(),
    mimeType: 'application/json',
    buffer,
  });
  await expect(page.getByRole('button', { name: 'Replace everything' })).toBeVisible();
  expect(await snapshotLegacy(page)).toEqual(before);
});

test('old preview recovery exports accepted history without changing its database', async ({ page }) => {
  const first = await makeAcceptedHistory(page, [
    'The conclusion is qualified.',
    'The premise does not establish causation.',
  ]);
  await permitEarlyLibraryReview(page);
  const second = await makeAcceptedHistory(page, [
    'The conclusion remains qualified.',
    'The causal explanation is unsupported.',
  ]);

  await page.evaluate(async (schema) => {
    const activeOpen = indexedDB.open('premise');
    const active = await new Promise<IDBDatabase>((resolve, reject) => {
      activeOpen.onsuccess = () => resolve(activeOpen.result);
      activeOpen.onerror = () => reject(activeOpen.error);
    });
    const names = Object.keys(schema);
    const source = active.transaction(names, 'readonly');
    const arrays = await Promise.all(
      names.map((name) => {
        const get = source.objectStore(name).getAll();
        return new Promise<unknown[]>((resolve, reject) => {
          get.onsuccess = () => resolve(get.result as unknown[]);
          get.onerror = () => reject(get.error);
        });
      }),
    );
    const version = active.version;
    active.close();

    const rows = Object.fromEntries(names.map((name, i) => [name, arrays[i]!])) as Record<string, unknown[]>;
    const logs = rows.reviewLogs as {
      id: string;
      taskId: string;
      attemptId: string;
      seq?: number;
      reviewedAt: string;
      cardBefore: { schedulerVersion?: string; last_review: string | null } | null;
      cardAfter: { last_review: string | null };
    }[];
    // Model c02c953 records: the early v1 stored neither seq nor cardBefore.schedulerVersion.
    // Its reviewedAt held the effective scheduler time, not necessarily the submission time.
    const sameTask = logs.filter((log) => log.taskId === 'arg-0001.conclusion').sort((a, b) => a.seq! - b.seq!);
    if (sameTask.length !== 2 || !sameTask[1]!.cardBefore) throw new Error('Expected two active reviews');
    const oldSubmission = '2026-10-04T10:00:00.000Z';
    const laterAttempt = (rows.attempts as { id: string; startedAt: string; submittedAt: string }[]).find(
      (attempt) => attempt.id === sameTask[1]!.attemptId,
    )!;
    laterAttempt.startedAt = oldSubmission;
    laterAttempt.submittedAt = oldSubmission;
    sameTask[1]!.reviewedAt = sameTask[0]!.cardAfter.last_review!;
    sameTask[1]!.cardAfter.last_review = sameTask[0]!.cardAfter.last_review;
    const currentCard = (rows.cards as { taskId: string; last_review: string | null }[]).find(
      (card) => card.taskId === sameTask[1]!.taskId,
    )!;
    currentCard.last_review = sameTask[1]!.cardAfter.last_review;
    for (const log of logs) {
      delete log.seq;
      if (log.cardBefore) delete log.cardBefore.schedulerVersion;
    }

    const oldOpen = indexedDB.open('premise-preview', version);
    oldOpen.onupgradeneeded = () => {
      for (const [name, definition] of Object.entries(schema)) {
        const store = oldOpen.result.createObjectStore(name, { keyPath: definition.keyPath });
        for (const index of definition.indexes) store.createIndex(index, index);
      }
    };
    const old = await new Promise<IDBDatabase>((resolve, reject) => {
      oldOpen.onsuccess = () => resolve(oldOpen.result);
      oldOpen.onerror = () => reject(oldOpen.error);
    });
    const write = old.transaction(names, 'readwrite');
    for (const name of names) {
      for (const record of rows[name]!) write.objectStore(name).put(record);
    }
    write.objectStore('settings').put({ key: 'focus', value: { tag: null, note: 'Recovered preview note.' } });
    await new Promise<void>((resolve, reject) => {
      write.oncomplete = () => resolve();
      write.onerror = () => reject(write.error);
    });
    old.close();
  }, EARLY_PREVIEW_V1);

  const before = await snapshotLegacy(page);
  expect(before.stores.map((s) => s.name)).not.toContain('schedulerConfigs');
  expect(before.stores.find((s) => s.name === 'reviewLogs')?.indexes).not.toContain('seq');

  await page.goto('#/settings');
  const recover = page.getByRole('button', { name: 'Download old preview backup' });
  await expect(recover).toBeVisible();
  const download = page.waitForEvent('download');
  await recover.click();
  const file = await download;
  const chunks = await (await file.createReadStream()).toArray();
  const buffer = Buffer.concat(chunks);
  const recovered = JSON.parse(buffer.toString()) as {
    requests: { id: string }[];
    replies: { requestId: string; raw: string }[];
    gradings: { id: string; requestId: string; score: number | null; status: string }[];
    reviewLogs: {
      taskId: string;
      seq: number;
      reviewedAt: string;
      cardBefore: { schedulerVersion: string } | null;
      cardAfter: { last_review: string | null };
    }[];
    cards: { taskId: string }[];
    settings: { key: string; value: unknown }[];
  };
  expect(recovered.requests.map((r) => r.id)).toContain(first.requestId);
  expect(recovered.requests.map((r) => r.id)).toContain(second.requestId);
  expect(recovered.replies.some((r) => r.requestId === first.requestId && r.raw === first.raw)).toBe(true);
  expect(recovered.replies.some((r) => r.requestId === second.requestId && r.raw === second.raw)).toBe(true);
  expect(recovered.gradings).toHaveLength(4);
  const oldGrades = before.stores.find((store) => store.name === 'gradings')!.rows as {
    id: string;
    score: number | null;
    status: string;
  }[];
  const grades = (rows: typeof oldGrades) =>
    rows.map(({ id, score, status }) => ({ id, score, status })).sort((a, b) => a.id.localeCompare(b.id));
  expect(grades(recovered.gradings)).toEqual(grades(oldGrades));
  expect(recovered.reviewLogs).toHaveLength(4);
  expect(new Set(recovered.reviewLogs.map((log) => log.seq)).size).toBe(4);
  const conclusionLogs = recovered.reviewLogs
    .filter((log) => log.taskId === 'arg-0001.conclusion')
    .sort((a, b) => a.seq - b.seq);
  expect(conclusionLogs[1]!.reviewedAt).toBe('2026-10-04T10:00:00.000Z');
  expect(conclusionLogs[1]!.cardAfter.last_review).toBe(conclusionLogs[0]!.cardAfter.last_review);
  expect(recovered.reviewLogs.filter((log) => log.cardBefore !== null)).toHaveLength(2);
  expect(recovered.reviewLogs.every((log) => !log.cardBefore || log.cardBefore.schedulerVersion === 'fsrs-1')).toBe(
    true,
  );
  expect(recovered.cards).toHaveLength(2);
  expect(recovered.settings).toContainEqual({ key: 'focus', value: { tag: null, note: 'Recovered preview note.' } });
  // Upload the bytes already read above: WebKit can lose Playwright's temporary download path
  // while a new File from that path is being read by the page.
  await page.getByLabel('Backup file').setInputFiles({
    name: file.suggestedFilename(),
    mimeType: 'application/json',
    buffer,
  });
  await expect(page.getByRole('button', { name: 'Replace everything' })).toBeVisible();
  expect(await snapshotLegacy(page)).toEqual(before);
});
