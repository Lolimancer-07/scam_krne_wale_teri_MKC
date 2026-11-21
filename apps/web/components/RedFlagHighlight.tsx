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
    return (
      <p className="text-on-surface font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
        {text}
      </p>
    );
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
    <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs sm:text-sm leading-loose whitespace-pre-wrap font-mono text-on-surface select-text shadow-inner">
      {segments.map((seg, i) =>
        seg.isFlagged && seg.flag ? (
          <mark
            key={`${seg.flag.id}-${i}`}
            title={`${seg.flag.reason} (Risk Weight: +${seg.flag.weight})`}
            className="bg-error-container text-on-error-container border border-error/40 px-2 py-0.5 rounded font-mono font-semibold inline-flex items-baseline gap-1 mx-0.5"
          >
            <span>{seg.text}</span>
            <span className="font-mono text-[10px] text-primary font-bold">
              [+{seg.flag.weight}]
            </span>
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </div>
  );
}
