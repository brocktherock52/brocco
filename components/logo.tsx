import { cn } from '@/lib/utils';

/**
 * brocco mark — scaly side-profile crocodile.
 * Custom geometry, not Twemoji-derived. Back ridge of triangular dorsal scales,
 * tessellated diamond belly scales, articulated jaw with teeth, eye with
 * highlight, four legs in a low-stance walk. Purple→cyan metallic gradient
 * with a top highlight for depth.
 *
 * ViewBox 64x36, head on the right, tail tip on the left.
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 36"
      role="img"
      aria-label="brocco crocodile mark"
      className={cn(className)}
    >
      <defs>
        <linearGradient id="croc-skin" x1="0" y1="0" x2="64" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="55%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="croc-deep" x1="0" y1="0" x2="64" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#0E7490" />
        </linearGradient>
        <linearGradient id="croc-shine" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        {/* clip the highlight + scales to the body silhouette */}
        <clipPath id="croc-body-clip">
          <path d="M 4 22 Q 1 24 2 26 L 8 25 L 12 24 L 18 23 L 26 22 L 34 22 L 42 23 L 50 24 L 56 25 L 60 25 L 62 23 Q 63 22 60 21 L 58 20 L 56 19 L 52 19 Q 50 18 48 19 L 42 19 L 36 19 Q 32 17 28 19 L 22 19 L 16 19 L 12 20 L 8 21 Z" />
        </clipPath>
      </defs>

      {/* ---------- LEGS (drawn first, behind body) ---------- */}
      <g fill="url(#croc-deep)">
        {/* front-left leg */}
        <path d="M 50 26 Q 50 30 51 32 L 53 32 Q 53.5 30 53 26 Z" />
        {/* front-right leg */}
        <path d="M 56 26 Q 56 30 57 32 L 59 32 Q 59.5 30 59 26 Z" />
        {/* back-left leg */}
        <path d="M 18 26 Q 18 30 19 32 L 21 32 Q 21.5 30 21 26 Z" />
        {/* back-right leg */}
        <path d="M 24 26 Q 24 30 25 32 L 27 32 Q 27.5 30 27 26 Z" />
      </g>

      {/* foot toes */}
      <g fill="url(#croc-deep)">
        <circle cx="51.4" cy="32.4" r="0.5" />
        <circle cx="52.6" cy="32.4" r="0.5" />
        <circle cx="57.4" cy="32.4" r="0.5" />
        <circle cx="58.6" cy="32.4" r="0.5" />
        <circle cx="19.4" cy="32.4" r="0.5" />
        <circle cx="20.6" cy="32.4" r="0.5" />
        <circle cx="25.4" cy="32.4" r="0.5" />
        <circle cx="26.6" cy="32.4" r="0.5" />
      </g>

      {/* ---------- BODY ---------- */}
      <path
        fill="url(#croc-skin)"
        d="M 4 22 Q 1 24 2 26 L 8 25 L 12 24 L 18 23 L 26 22 L 34 22 L 42 23 L 50 24 L 56 25 L 60 25 L 62 23 Q 63 22 60 21 L 58 20 L 56 19 L 52 19 Q 50 18 48 19 L 42 19 L 36 19 Q 32 17 28 19 L 22 19 L 16 19 L 12 20 L 8 21 Z"
      />

      {/* metallic top highlight clipped to body */}
      <g clipPath="url(#croc-body-clip)">
        <rect x="0" y="17" width="64" height="6" fill="url(#croc-shine)" />
      </g>

      {/* ---------- DORSAL (BACK) SCALES — triangular spikes ---------- */}
      <g fill="url(#croc-deep)">
        <path d="M 10 20 L 11 17.5 L 12 20 Z" />
        <path d="M 14 19 L 15 16.5 L 16 19 Z" />
        <path d="M 18 18.5 L 19 16 L 20 18.5 Z" />
        <path d="M 22 18 L 23 15.5 L 24 18 Z" />
        <path d="M 26 17.5 L 27 15 L 28 17.5 Z" />
        <path d="M 30 17.5 L 31 15 L 32 17.5 Z" />
        <path d="M 34 17.5 L 35 15 L 36 17.5 Z" />
        <path d="M 38 18 L 39 15.5 L 40 18 Z" />
        <path d="M 42 18.5 L 43 16 L 44 18.5 Z" />
        <path d="M 46 19 L 47 16.5 L 48 19 Z" />
      </g>

      {/* TAIL ridges */}
      <g fill="url(#croc-deep)">
        <path d="M 4 22.5 L 5 20.5 L 6 22.5 Z" />
        <path d="M 7 21.5 L 8 19.5 L 9 21.5 Z" />
      </g>

      {/* ---------- BELLY SCALE TEXTURE — diamond grid ---------- */}
      <g fill="#FFFFFF" opacity="0.18">
        {/* row 1 */}
        <circle cx="14" cy="22.5" r="0.45" />
        <circle cx="18" cy="22" r="0.45" />
        <circle cx="22" cy="21.7" r="0.45" />
        <circle cx="26" cy="21.5" r="0.45" />
        <circle cx="30" cy="21.5" r="0.45" />
        <circle cx="34" cy="21.5" r="0.45" />
        <circle cx="38" cy="21.7" r="0.45" />
        <circle cx="42" cy="22" r="0.45" />
        <circle cx="46" cy="22.5" r="0.45" />
        {/* row 2 (offset for diamond pattern) */}
        <circle cx="16" cy="24" r="0.4" />
        <circle cx="20" cy="23.8" r="0.4" />
        <circle cx="24" cy="23.6" r="0.4" />
        <circle cx="28" cy="23.5" r="0.4" />
        <circle cx="32" cy="23.5" r="0.4" />
        <circle cx="36" cy="23.5" r="0.4" />
        <circle cx="40" cy="23.6" r="0.4" />
        <circle cx="44" cy="23.8" r="0.4" />
        <circle cx="48" cy="24" r="0.4" />
        {/* row 3 */}
        <circle cx="14" cy="25.5" r="0.4" />
        <circle cx="18" cy="25.4" r="0.4" />
        <circle cx="22" cy="25.3" r="0.4" />
        <circle cx="26" cy="25.2" r="0.4" />
        <circle cx="30" cy="25.2" r="0.4" />
        <circle cx="34" cy="25.2" r="0.4" />
        <circle cx="38" cy="25.3" r="0.4" />
        <circle cx="42" cy="25.4" r="0.4" />
        <circle cx="46" cy="25.5" r="0.4" />
      </g>

      {/* ---------- HEAD details ---------- */}
      {/* eye white */}
      <circle cx="55.5" cy="20.4" r="1.4" fill="#FFFFFF" />
      {/* pupil */}
      <circle cx="55.7" cy="20.6" r="0.85" fill="#0A0A0F" />
      {/* eye highlight */}
      <circle cx="56" cy="20.2" r="0.32" fill="#FFFFFF" />

      {/* nostril */}
      <circle cx="61.2" cy="22.3" r="0.35" fill="#0A0A0F" opacity="0.7" />

      {/* mouth line */}
      <path
        d="M 50 24.4 Q 56 25.6 62 24.6"
        stroke="#0A0A0F"
        strokeWidth="0.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* visible teeth at jaw */}
      <g fill="#FFFFFF">
        <path d="M 56 24.7 L 56.6 25.6 L 57.2 24.7 Z" />
        <path d="M 58.2 24.7 L 58.8 25.6 L 59.4 24.7 Z" />
        <path d="M 60.2 24.7 L 60.8 25.6 L 61.4 24.7 Z" />
      </g>
    </svg>
  );
}

/**
 * Wordmark used in the nav and footer.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold', className)}>
      <Logomark className="h-6 w-[42px]" />
      <span className="tracking-tight">
        brocco<span className="text-ink-faint">.ai</span>
      </span>
    </span>
  );
}
