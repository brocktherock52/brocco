import { cn } from '@/lib/utils';

/**
 * brocco mark — friendly crocodile face.
 * Front-on, square viewBox, two big domed eyes, gentle smile, tiny tooth, blush.
 * Brand gradient (violet → cyan) on the head.
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="brocco mark"
      className={cn(className)}
    >
      <defs>
        <linearGradient id="brocco-grad" x1="0" y1="6" x2="64" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="55%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>
        <radialGradient id="brocco-shade" cx="32" cy="60" r="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a0d10" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0a0d10" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* eye domes (drawn first so head sits in front) */}
      <ellipse cx="20" cy="14" rx="8.5" ry="9.5" fill="url(#brocco-grad)" />
      <ellipse cx="44" cy="14" rx="8.5" ry="9.5" fill="url(#brocco-grad)" />

      {/* main head + snout silhouette */}
      <path
        d="M 6 32
           Q 6 18 18 16
           L 46 16
           Q 58 18 58 32
           L 56.5 50
           Q 54 58.5 32 58.5
           Q 10 58.5 7.5 50 Z"
        fill="url(#brocco-grad)"
      />

      {/* soft jaw shadow for depth */}
      <path
        d="M 6 32 Q 6 18 18 16 L 46 16 Q 58 18 58 32 L 56.5 50 Q 54 58.5 32 58.5 Q 10 58.5 7.5 50 Z"
        fill="url(#brocco-shade)"
      />

      {/* little scale bumps along the brow ridge */}
      <circle cx="14" cy="20" r="1.1" fill="#0a0d10" opacity="0.20" />
      <circle cx="32" cy="18.5" r="1.1" fill="#0a0d10" opacity="0.20" />
      <circle cx="50" cy="20" r="1.1" fill="#0a0d10" opacity="0.20" />

      {/* eyes (white + pupil + highlight) */}
      <circle cx="20" cy="15" r="4.6" fill="#FFFFFF" />
      <circle cx="20.8" cy="16.1" r="2.7" fill="#0a0d10" />
      <circle cx="21.7" cy="14.9" r="1.0" fill="#FFFFFF" />

      <circle cx="44" cy="15" r="4.6" fill="#FFFFFF" />
      <circle cx="44.8" cy="16.1" r="2.7" fill="#0a0d10" />
      <circle cx="45.7" cy="14.9" r="1.0" fill="#FFFFFF" />

      {/* nostrils */}
      <ellipse cx="27" cy="34" rx="1.1" ry="1.6" fill="#0a0d10" opacity="0.70" />
      <ellipse cx="37" cy="34" rx="1.1" ry="1.6" fill="#0a0d10" opacity="0.70" />

      {/* smile */}
      <path
        d="M 17 43 Q 32 53.5 47 43"
        stroke="#0a0d10"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* tiny tooth peeking out */}
      <path d="M 30.5 48.6 L 32 51.8 L 33.5 48.6 Z" fill="#FFFFFF" />

      {/* cheek blush (subtle) */}
      <ellipse cx="11.5" cy="40" rx="2.4" ry="1.6" fill="#fb7185" opacity="0.22" />
      <ellipse cx="52.5" cy="40" rx="2.4" ry="1.6" fill="#fb7185" opacity="0.22" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold', className)}>
      <Logomark className="h-7 w-7" />
      <span className="tracking-tight">
        brocco<span className="text-ink-faint">.ai</span>
      </span>
    </span>
  );
}
