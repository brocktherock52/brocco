// User/workspace profile + branding. Captured in the personalized onboarding
// step (suggested by Braeden on the 2026-05-26 partner call: "let them put
// their name in there or their business name, let them upload a logo, maybe
// let them change colors... the second they're in, they're invested because it
// becomes theirs"). Stored in localStorage today; mirror to the server once the
// auth + KV layer lands. Consumed by:
//   - the dashboard top bar (shows the logo + business name)
//   - the polished PDF export (brands the cover + footer)
//   - retention copy ("your workspace")

export interface BroccoProfile {
  /** The person's first name (or full name). Optional. */
  name: string;
  /** Their company / brand name. Drives the PDF cover + dashboard chip. */
  businessName: string;
  /** What they use brocco for, free text, feeds smarter suggestions later. */
  useCase: string;
  /** Data-URL of an uploaded logo (kept small, we downscale on upload). */
  logoDataUrl: string;
  /** Brand accent as a hex string (e.g. "#7C3AED"). Themes the PDF + accents. */
  brandColor: string;
  /** Set once the user has completed (or explicitly skipped) personalization. */
  completedAt: number | null;
}

const STORAGE_KEY = 'brocco:profile';
export const PROFILE_CHANGED_EVENT = 'brocco:profile-changed';

// brocco's signature violet. Matches --brand in globals.css so an un-themed
// export still looks on-brand.
export const DEFAULT_BRAND_COLOR = '#7C3AED';

export function emptyProfile(): BroccoProfile {
  return {
    name: '',
    businessName: '',
    useCase: '',
    logoDataUrl: '',
    brandColor: DEFAULT_BRAND_COLOR,
    completedAt: null,
  };
}

export function getProfile(): BroccoProfile {
  if (typeof window === 'undefined') return emptyProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<BroccoProfile>;
    return { ...emptyProfile(), ...parsed };
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(patch: Partial<BroccoProfile>): BroccoProfile {
  const next = { ...getProfile(), ...patch };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(PROFILE_CHANGED_EVENT));
    } catch {}
  }
  return next;
}

/** True once the user has gone through personalization (filled or skipped). */
export function hasCompletedProfile(): boolean {
  return getProfile().completedAt != null;
}

/** Mark personalization done without changing other fields. */
export function markProfileComplete(): BroccoProfile {
  return saveProfile({ completedAt: Date.now() });
}

/**
 * Downscale + re-encode an uploaded image to a small square data-URL so we can
 * stash a logo in localStorage without blowing the quota. Returns a PNG
 * data-URL capped at `max` px on its longest edge.
 */
export function fileToLogoDataUrl(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file (PNG, JPG, or SVG).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const src = String(reader.result || '');
      const img = new Image();
      img.onerror = () => reject(new Error('That image could not be decoded.'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Canvas unavailable, fall back to the raw data-URL.
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
