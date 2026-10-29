import { rollingHours, dailyHours, documentState } from '../src/common/calculations';

describe('flight windows (inclusive UTC date-only arithmetic)', () => {
  const rows = [
    { date: '2026-05-08', hours: 99 },
    { date: '2026-05-09', hours: 3.2 },
    { date: '2026-05-14', hours: 2.1 },
    { date: '2026-05-15', hours: 4.3 },
    { date: '2026-05-16', hours: 5.5 },
  ];
  it('excludes the eighth day and includes today without floating point noise', () => {
    expect(rollingHours(rows, '2026-05-15', 7)).toBe(9.6);
  });
  it('counts missing days as zero, including before dataset start', () => {
    expect(dailyHours(rows, '2026-05-06', '2026-05-09')).toEqual([
      { date: '2026-05-06', hours: 0 }, { date: '2026-05-07', hours: 0 },
      { date: '2026-05-08', hours: 99 }, { date: '2026-05-09', hours: 3.2 },
    ]);
    expect(rollingHours(rows, '2026-05-07', 365)).toBe(0);
  });
  it('uses supplied future hours when projecting a future window', () => {
    expect(rollingHours(rows, '2026-05-16', 7)).toBe(11.9);
  });
  it('handles leap day and year boundaries', () => {
    expect(dailyHours([], '2024-02-28', '2024-03-01')).toHaveLength(3);
    expect(dailyHours([], '2025-12-31', '2026-01-01')).toHaveLength(2);
  });
});

describe('expiry thresholds relative to the configured business date', () => {
  it.each([
    ['2026-05-14', -1, 'expired'], ['2026-05-15', 0, 'expired'],
    ['2026-05-16', 1, 'soon'], ['2026-06-14', 30, 'soon'], ['2026-06-15', 31, 'safe'],
  ])('%s has %s days remaining and is %s', (expiry, daysRemaining, status) => {
    expect(documentState(expiry as string, '2026-05-15', 30)).toEqual({ daysRemaining, status });
  });
});
