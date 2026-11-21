import React from 'react';

export interface RedFlag {
  id: string;
  signal: string;
  snippet: string;
  reason: string;
  weight: number;
  startIndex?: number;
  endIndex?: number;
}

interface RedFlagHighlightProps {
  text: string;
  redFlags: RedFlag[];
}

interface Segment {
  text: string;
  isFlagged: boolean;
  flag?: RedFlag;
}

export function RedFlagHighlight({ text, redFlags }: RedFlagHighlightProps) {
  // If no flags or missing indexes, return plain text safely
  const validFlags = redFlags
    .filter(
      (f) =>
        typeof f.startIndex === 'number' &&
        typeof f.endIndex === 'number' &&
        f.startIndex >= 0 &&
        f.endIndex <= text.length &&
        f.startIndex < f.endIndex,
    )
    .sort((a, b) => (a.startIndex as number) - (b.startIndex as number));

  if (validFlags.length === 0) {
    return <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{text}</p>;
  }

  // Merge overlapping or adjacent flags
  const segments: Segment[] = [];
  let currentIndex = 0;

  for (const flag of validFlags) {
    const start = flag.startIndex as number;
    const end = flag.endIndex as number;

    if (start > currentIndex) {
      segments.push({
        text: text.slice(currentIndex, start),
        isFlagged: false,
      });
    }

    if (start >= currentIndex) {
      segments.push({
        text: text.slice(start, end),
        isFlagged: true,
        flag,
      });
      currentIndex = end;
    }
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.slice(currentIndex),
      isFlagged: false,
    });
  }

  return (
    <div className="p-4 bg-muted/40 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap font-mono">
      {segments.map((seg, i) =>
        seg.isFlagged && seg.flag ? (
          <mark
            key={`${seg.flag.id}-${i}`}
            title={`${seg.flag.reason} (Risk Weight: +${seg.flag.weight})`}
            className="bg-red-200 text-red-900 dark:bg-red-950/80 dark:text-red-200 px-1 py-0.5 rounded border border-red-300 dark:border-red-800 font-semibold cursor-help inline-block mx-0.5"
          >
            {seg.text}
            <span className="ml-1 text-[10px] bg-red-600 text-white dark:bg-red-700 px-1 py-0.2 rounded-full font-sans not-italic">
              +{seg.flag.weight}
            </span>
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </div>
  );
}
