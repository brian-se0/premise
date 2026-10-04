// Renders stimulus text with the safe Markdown subset (docs/EXERCISE_FORMAT.md §1) as React
// elements. Never uses innerHTML. Lists arrive with passage skills (M6).

import type { ReactNode } from 'react';

const EMPHASIS = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;

function inline(text: string): ReactNode[] {
  return text.split(EMPHASIS).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      if (part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function Stimulus({ text }: { text: string }) {
  return (
    <div className="stimulus">
      {text.split('\n\n').map((p, i) => (
        <p key={i}>{inline(p)}</p>
      ))}
    </div>
  );
}
