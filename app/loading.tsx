import { Logomark } from '@/components/logo';

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logomark className="h-10 w-10 animate-pulse" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          loading brocco
        </span>
        <span className="relative h-0.5 w-32 overflow-hidden rounded-full bg-white/[0.06]">
          <span className="absolute inset-y-0 left-0 w-1/3 animate-[shine_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand to-cyan" />
        </span>
      </div>
    </main>
  );
}
