import { cn } from '@/lib/utils';

/**
 * brocco mark — all-white crocodile silhouette.
 * Adapted from Twemoji 1F40A 🐊 (Twitter, CC-BY 4.0). Side-view pose:
 * tail on the left, two leg blobs underneath, snout on the right with
 * a small dark eye dot for character. ViewBox 36x36 (square).
 *
 * Attribution: Twitter Twemoji, https://github.com/twitter/twemoji,
 * licensed under CC-BY 4.0 — https://creativecommons.org/licenses/by/4.0/
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      role="img"
      aria-label="brocco crocodile mark"
      className={cn(className)}
    >
      {/* legs: two rounded blobs under the body */}
      <path
        fill="#FFFFFF"
        d="M19 32c0 1-1.723 3-3.334 3C14.056 35 14 33.657 14 32s1.306-3 2.916-3C18.527 29 19 30.343 19 32zm11 0c0 1-1.723 3-3.334 3C25.056 35 25 33.657 25 32s1.306-3 2.916-3C29.527 29 30 30.343 30 32z"
      />
      {/* body + tail + head */}
      <path
        fill="#FFFFFF"
        d="M36 25c0-6-3.172-9.171-6-12-1-1-1.399.321-1 1 .508.862 3 8-2 8h-2c-5 0-6.172-1.172-9-4-4.5-4.5-7 0-9 0-6 0-7-1.812-7 2 0 3 3 4 6 4s3 1 5 4c1.071 1.606 2.836 3.211 5.023 4.155.232 1.119 2.774 3.845 4.311 3.845C21.944 36 22 34.657 22 33h5c.034 0 .066-.01.101-.01.291.005.587.01.899.01 0 1 1.723 3 3.334 3C32.944 36 33 34.657 33 33c0-.302-.057-.587-.137-.861C34.612 31.193 36 29.209 36 25z"
      />
      {/* single eye dot for character */}
      <circle cx="11.6" cy="18.7" r="0.95" fill="#0A0A0F" />
      {/* teeth nicks at the snout tip */}
      <path fill="#0A0A0F" d="M5 21h2l-1 1zM3 21h2l-1 1.4zM1 21h2l-1 1.9z" opacity="0.55" />
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
