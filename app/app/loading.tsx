import { Logomark } from '@/components/logo';

export default function AppLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-bg-0 text-ink">
      <div className="text-center">
        <Logomark className="mx-auto h-10 w-10 animate-pulse" />
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          spinning up agents
        </p>
        <div className="mx-auto mt-3 h-0.5 w-32 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-1/3 animate-[shine_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand to-cyan" />
        </div>
      </div>
    </div>
  );
}
