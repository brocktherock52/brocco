import { cn } from '@/lib/utils';

/**
 * The brocco crocodile mark — friendly, with a face.
 * Profile silhouette inherited from v1.x (Lacoste-style), now with:
 *   - a larger expressive eye + highlight
 *   - a soft smile curve along the snout
 *   - a subtle brow above the eye
 *   - feet/tail tip details preserved
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 36"
      fill="currentColor"
      role="img"
      aria-label="brocco mark"
      className={cn(className)}
    >
      <defs>
        <linearGradient id="brocco-grad" x1="0" y1="0" x2="64" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="60%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>
      </defs>

      {/* body silhouette */}
      <path
        fill="url(#brocco-grad)"
        d="M 2 22 L 4 24 Q 1 28 5 28 L 10 26 L 16 25 L 20 25 L 20 30 L 18 30 L 18 24.5 L 26 24 L 32 24 L 32 30 L 30 30 L 30 24 L 36 24 L 42 24.5 L 48 25.5 L 56 26.5 L 62 27 L 62 25 L 58 25 L 58 23 L 62 23 L 62 21 L 56 19 L 50 18 L 46 17 L 40 16 L 38 13 L 36 16 L 32 16 L 30 12 L 28 16 L 24 16 L 22 13 L 20 16 L 16 17 L 12 19 L 8 20 Z"
      />

      {/* eyebrow — soft arc above the eye */}
      <path
        d="M 50.4 16.6 Q 52 15.5 53.6 16.6"
        stroke="#0a0d10"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />

      {/* eye — bigger and friendlier */}
      <circle cx="52" cy="19" r="2" fill="#fff" />
      <circle cx="52.2" cy="19.1" r="1.3" fill="#0a0d10" />
      <circle cx="52.6" cy="18.6" r="0.55" fill="#fff" />

      {/* smile — gentle curve along the snout */}
      <path
        d="M 56 25.6 Q 58.4 26.7 60.6 25.7"
        stroke="#0a0d10"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />

      {/* tiny tooth glint at jaw tip */}
      <path d="M 59.2 24.2 L 60 24.9 L 60.8 24.2 Z" fill="#fff" />

      {/* cheek blush (very subtle) */}
      <circle cx="48" cy="22" r="1.2" fill="#fb7185" opacity="0.18" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold', className)}>
      <Logomark className="h-6 w-12" />
      <span className="tracking-tight">
        brocco<span className="text-ink-faint">.ai</span>
      </span>
    </span>
  );
}
