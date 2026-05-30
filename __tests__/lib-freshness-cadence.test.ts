import { describe, it, expect } from 'vitest';
import {
  isRefreshDue,
  cadenceHoursFor,
  cadenceFromHours,
  cadenceLabel,
  CADENCE_OPTIONS,
  DEFAULT_CADENCE_HOURS,
  freshnessOf,
} from '@/lib/freshness';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('lib/freshness cadence', () => {
  const now = Date.UTC(2026, 4, 27, 12, 0, 0);

  it('defaults to a 72h watching interval', () => {
    expect(DEFAULT_CADENCE_HOURS).toBe(72);
  });

  it('isRefreshDue is false before the cadence elapses', () => {
    const lastRun = now - 70 * HOUR;
    expect(isRefreshDue(lastRun, 72, now)).toBe(false);
  });

  it('isRefreshDue is true once the cadence elapses', () => {
    const lastRun = now - 73 * HOUR;
    expect(isRefreshDue(lastRun, 72, now)).toBe(true);
  });

  it('honours a weekly cadence', () => {
    const lastRun = now - 6 * DAY;
    expect(isRefreshDue(lastRun, 168, now)).toBe(false);
    expect(isRefreshDue(now - 8 * DAY, 168, now)).toBe(true);
  });

  it('maps cadence value <-> hours both ways', () => {
    expect(cadenceHoursFor('72h')).toBe(72);
    expect(cadenceHoursFor('5d')).toBe(120);
    expect(cadenceHoursFor('weekly')).toBe(168);
    expect(cadenceFromHours(120)).toBe('5d');
    expect(cadenceFromHours(168)).toBe('weekly');
  });

  it('labels every cadence option', () => {
    for (const o of CADENCE_OPTIONS) {
      expect(cadenceLabel(o.hours)).toBe(o.label);
    }
  });

  it('keeps the existing fresh/aging/stale heuristic intact', () => {
    expect(freshnessOf(now - 1 * DAY, now)).toBe('fresh');
    expect(freshnessOf(now - 6 * DAY, now)).toBe('aging');
    expect(freshnessOf(now - 20 * DAY, now)).toBe('stale');
  });
});
