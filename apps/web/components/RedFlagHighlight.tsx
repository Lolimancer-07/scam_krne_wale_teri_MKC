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
    return <p className="text-slate-300 font-mono text-sm whitespace-pre-wrap">{text}</p>;
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
    <div className="p-4 bg-[#000814]/90 rounded-xl border border-white/10 text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-200">
      {segments.map((seg, i) =>
        seg.isFlagged && seg.flag ? (
          <mark
            key={`${seg.flag.id}-${i}`}
            title={`${seg.flag.reason} (Risk Weight: +${seg.flag.weight})`}
            className="bg-rose-500/20 text-rose-200 border border-rose-500/40 px-1 py-0.5 rounded font-mono font-semibold cursor-help inline-block mx-0.5"
          >
            {seg.text}
            <span className="ml-1 text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded-full font-sans not-italic font-bold">
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
