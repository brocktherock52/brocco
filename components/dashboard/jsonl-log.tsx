'use client';

import { useEffect, useRef } from 'react';
import { ScrollText } from 'lucide-react';
import type { SimEvent } from '@/lib/simulator';

export function JsonlLog({ events }: { events: SimEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [events.length]);

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
        <div className="inline-flex items-center gap-2 font-mono text-[12px] text-ink-dim">
          <ScrollText className="h-3.5 w-3.5 text-ink-faint" />
          jsonl audit
        </div>
        <span className="font-mono text-[10.5px] text-ink-faint">{events.length} events</span>
      </div>
      <div ref={ref} className="jsonl flex-1 overflow-y-auto p-3">
        {events.length === 0 ? (
          <div className="font-mono text-[11.5px] text-ink-faint">_waiting for run.._</div>
        ) : (
          events.map((e, i) => (
            <div key={i} className="leading-relaxed">
              <span className="dim">[{new Date(e.ts).toLocaleTimeString()}]</span>{' '}
              <span className="key">{e.agent}</span>
              <span className="dim">:{e.step}</span>{' '}
              {renderEvent(e)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function renderEvent(e: SimEvent): React.ReactNode {
  switch (e.type) {
    case 'thinking':
      return (
        <>
          <span className="key">thinking</span> <span className="dim">{shorten(e.text)}</span>
        </>
      );
    case 'tool_call':
      return (
        <>
          <span className="key">tool_call</span> <span className="str">{e.tool}</span>
          <span className="dim">{`({${Object.keys(e.input).join(',')}})`}</span>
        </>
      );
    case 'tool_result':
      return (
        <>
          <span className="key">result</span> <span className="dim">{shorten(e.result, 100)}</span>
        </>
      );
    case 'text':
      return (
        <>
          <span className="key">text</span> <span className="dim">{shorten(e.text, 100)}</span>
        </>
      );
    case 'delegate':
      return (
        <>
          <span className="key">delegate</span> <span className="bool">{e.to}</span> <span className="dim">{shorten(e.task, 60)}</span>
        </>
      );
    case 'done':
      return (
        <>
          <span className="key">done</span> <span className="num">{shorten(e.summary, 80)}</span>
        </>
      );
  }
}

function shorten(s: string, n = 80) {
  s = s.replace(/\n/g, ' ');
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
