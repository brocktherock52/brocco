'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Key, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const KEY_STORAGE = 'brocco:byok';

export function getKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY_STORAGE);
}

export function ByokModal({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: string | null;
  onSaved: (key: string | null) => void;
}) {
  const [val, setVal] = useState(initial ?? '');

  function save() {
    if (!val) {
      localStorage.removeItem(KEY_STORAGE);
      onSaved(null);
      toast.success('Key removed. Demo mode is on.');
    } else if (!/^sk-[a-zA-Z0-9_-]{15,}$/.test(val.trim())) {
      toast.error('That does not look like a valid key. Continue anyway?', {
        action: {
          label: 'Save anyway',
          onClick: () => {
            localStorage.setItem(KEY_STORAGE, val.trim());
            onSaved(val.trim());
            onOpenChange(false);
          },
        },
      });
      return;
    } else {
      localStorage.setItem(KEY_STORAGE, val.trim());
      onSaved(val.trim());
      toast.success('Key saved. Stored in your browser only.');
    }
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-bg-0/70 backdrop-blur-md data-[state=open]:animate-fade-up" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/[0.10] bg-bg-1/95 p-6 shadow-glow backdrop-blur-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-0.5 font-mono text-[11px] text-cyan-glow">
                <Key className="h-3 w-3" /> BYOK
              </div>
              <Dialog.Title className="mt-3 text-[18px] font-semibold tracking-tight">
                Bring your own API key
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[13.5px] text-ink-dim">
                Anthropic, OpenAI, or any OpenAI-compatible endpoint. Stored in <strong>your browser only</strong>, never sent to brocco.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-md p-1 text-ink-faint hover:bg-white/[0.06] hover:text-white">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <input
            type="password"
            placeholder="sk-..."
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="mt-5 w-full rounded-lg border border-white/[0.10] bg-bg-2 px-3 py-2.5 font-mono text-[13px] text-ink outline-none transition-colors focus:border-brand/60"
          />

          <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink-faint">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Local-only. No telemetry. Clear with the same button to switch back to demo mode.
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener"
              className="text-[12.5px] text-cyan-glow underline-offset-4 hover:underline"
            >
              Get an Anthropic key →
            </a>
            <button onClick={save} className="btn-primary text-[13px] px-5 py-2">
              Save key
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
