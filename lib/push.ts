// Web-push subscription helpers (client side).
//
// Server-side fan-out lives at /api/push/notify. To send a push,
// generate VAPID keys via `npx web-push generate-vapid-keys` and set
// NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY in Vercel env.

const STORAGE_KEY = 'brocco:push-subscription';

export interface PushPrefs {
  /** has the user opted in? */
  enabled: boolean;
  /** ISO timestamp of last opt-in change */
  changedAt: number;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(safe);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function getPushPrefs(): PushPrefs {
  if (typeof window === 'undefined') return { enabled: false, changedAt: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, changedAt: 0 };
    return JSON.parse(raw) as PushPrefs;
  } catch {
    return { enabled: false, changedAt: 0 };
  }
}

function savePrefs(p: PushPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent('brocco:push-changed'));
  } catch {}
}

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function subscribePush(): Promise<{ ok: boolean; reason?: string }> {
  if (!(await isPushSupported())) {
    return { ok: false, reason: 'unsupported' };
  }
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) {
    return { ok: false, reason: 'vapid-key-missing' };
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, reason: 'permission-denied' };
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid).buffer as ArrayBuffer,
    });
    // POST subscription to server so it can fan-out pushes
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(sub),
    });
    savePrefs({ enabled: true, changedAt: Date.now() });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'unknown' };
  }
}

export async function unsubscribePush(): Promise<void> {
  if (!(await isPushSupported())) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    await fetch('/api/push/unsubscribe', { method: 'POST' });
    savePrefs({ enabled: false, changedAt: Date.now() });
  } catch {}
}
