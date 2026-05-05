'use client';

import { useEffect, useState } from 'react';
import { Download, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton({
  variant = 'pill',
  className,
}: {
  variant?: 'pill' | 'primary' | 'ghost';
  className?: string;
}) {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
      toast.success('brocco installed', { description: 'Find it in your dock or app drawer.' });
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!event) {
      toast.message('Install from your browser menu', {
        description: 'On iOS Safari: Share → Add to Home Screen. On desktop Chrome: address bar install icon.',
      });
      return;
    }
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
      setEvent(null);
    }
  }

  if (installed) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-mono text-[12px] text-emerald-300',
          className,
        )}
      >
        <Check className="h-3.5 w-3.5" />
        installed
      </span>
    );
  }

  const base = 'inline-flex items-center gap-1.5';
  if (variant === 'primary') {
    return (
      <button onClick={install} className={cn(base, 'btn-primary text-[13px] px-4 py-2', className)}>
        <Download className="h-3.5 w-3.5" />
        Install app
      </button>
    );
  }
  if (variant === 'ghost') {
    return (
      <button onClick={install} className={cn(base, 'btn-ghost text-[13px] px-4 py-2', className)}>
        <Download className="h-3.5 w-3.5" />
        Install app
      </button>
    );
  }
  return (
    <button
      onClick={install}
      className={cn(
        base,
        'rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[12.5px] text-ink-dim transition-colors hover:bg-white/[0.07] hover:text-white',
        className,
      )}
    >
      <Download className="h-3 w-3" />
      Install app
    </button>
  );
}
