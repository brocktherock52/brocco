import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat('en-US', opts).format(n);
}

export function uid(prefix = 'b'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
