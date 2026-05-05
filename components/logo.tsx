import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * brocco mark — uses the user's official brand image (white cartoon
 * crocodile, side view, friendly face, scaled tail). Source asset at
 * /assets/brocco-mark.png. Loaded via Next/Image for proper srcset +
 * AVIF/WEBP optimization. Square aspect.
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <Image
      src="/assets/brocco-mark-transparent.png"
      alt="brocco crocodile mark"
      width={512}
      height={512}
      priority
      className={cn('object-contain', className)}
    />
  );
}

/**
 * Wordmark = brocco icon + 'brocco.ai' text.
 * Two layouts: stacked image (uses brocco-wordmark.png with text built in)
 * or inline (mark + spacer + .ai-styled text).
 */
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
