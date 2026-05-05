import { cn } from '@/lib/utils';

export function Logomark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" className={cn(className)}>
      <defs>
        <linearGradient id="brocco-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="60%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>
      </defs>
      <g fill="url(#brocco-grad)">
        <circle cx="32" cy="20" r="10.5" />
        <circle cx="20" cy="22" r="9" />
        <circle cx="44" cy="22" r="9" />
        <circle cx="26" cy="13" r="7" />
        <circle cx="38" cy="13" r="7" />
        <circle cx="14" cy="29" r="7.5" />
        <circle cx="50" cy="29" r="7.5" />
        <path d="M26.5 33 Q25.5 41 24 49 Q24 54 32 55 Q40 54 40 49 Q38.5 41 37.5 33 Z" />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold', className)}>
      <Logomark className="h-6 w-6" />
      <span className="tracking-tight">
        brocco<span className="text-ink-faint">.ai</span>
      </span>
    </span>
  );
}
