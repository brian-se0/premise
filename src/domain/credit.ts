import type { Source } from './types.ts';

/** The shared credit line (docs/EXERCISE_FORMAT.md §7). Null for original content. */
export function formatCredit(source: Source): string | null {
  if (source.type === 'original') return null;
  const license =
    source.type === 'public-domain'
      ? 'Public domain in the United States'
      : `CC BY 4.0, ${source.license_uri ?? ''}`;
  const changes = source.modifications ? `Adapted: ${source.modifications}` : 'Unmodified';
  return `${source.attribution ?? ''}. ${license}. ${changes}`;
}
