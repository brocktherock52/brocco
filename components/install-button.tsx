'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Check, Share } from 'lucide-react';

import { cn } from '@/lib/utils';

interface InstallButtonProps {
  variant?: 'primary' | 'ghost' | 'pill';
  className?: string;
}

// The beforeinstallprompt event has a non-standard prompt() method.
type InstallPromptEvent = Event & {
  prompt: () => void;
  userChoice?: Promise<{ outcome: string }>;
};

/**
 * InstallButton handles PWA installation across platforms.
 * - Chrome/Edge/Android: native beforeinstallprompt
 * - iOS Safari: shows "Share, then Add to Home Screen" instructions (no API)
 * - Already installed: shows installed state
 *
 * The deferred prompt is stored in a ref (not a render-scoped `let`) so the
 * captured event survives re-renders and is still available when the user
 * actually clicks install. Previously it was a local variable that reset to
 * null every render, so the native prompt never fired.
 */
export function InstallButton({ variant = 'primary', className }: InstallButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const deferredPrompt = useRef<InstallPromptEvent | null>(null);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari exposes standalone on navigator, not via matchMedia.
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as InstallPromptEvent;
      setCanInstall(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
      deferredPrompt.current = null;
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSHint((v) => !v);
      return;
    }
    const dp = deferredPrompt.current;
    if (dp) {
      dp.prompt();
      try {
        await dp.userChoice;
      } catch {
        /* ignore */
      }
      deferredPrompt.current = null;
      setCanInstall(false);
    }
  };

  if (installed) {
    return (
      <div className={cn('inline-flex items-center gap-2 text-sm text-accent-green', className)}>
        <Check className="h-4 w-4" />
        installed
      </div>
    );
  }

  return (
    <div className={cn('inline-flex flex-col gap-2', className)}>
      <button
        onClick={handleInstall}
        aria-expanded={isIOS ? showIOSHint : undefined}
        className={cn(
          variant === 'primary' && 'btn-primary',
          variant === 'ghost' && 'btn-ghost',
          variant === 'pill' &&
            'inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-sm hover:bg-white/[0.07]',
          className,
        )}
      >
        <Download className="h-4 w-4" />
        install brocco
      </button>

      {isIOS && showIOSHint && (
        <div className="max-w-xs rounded-xl border border-white/[0.10] bg-bg-1/95 p-3 text-[13px] text-ink-dim">
          <p className="flex items-center gap-1.5 font-medium text-white">
            <Share className="h-3.5 w-3.5 text-cyan-glow" />
            add to home screen
          </p>
          <p className="mt-1.5 leading-relaxed">
            tap the <span className="text-white">share</span> icon in Safari, then choose{' '}
            <span className="text-white">add to home screen</span>. brocco opens fullscreen like a
            native app.
          </p>
        </div>
      )}
    </div>
  );
}
