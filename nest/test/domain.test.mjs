import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rollingHours, dailyHours, documentState, isCalendarDate } from '../src/common/calculations.ts';
import { readFileSync } from 'node:fs';

const rows = [
  { date: '2026-05-08', hours: 99 }, { date: '2026-05-09', hours: 3.2 },
  { date: '2026-05-14', hours: 2.1 }, { date: '2026-05-15', hours: 4.3 },
  { date: '2026-05-16', hours: 5.5 },
];
test('seven-day sum includes today and excludes eighth day', () => {
  assert.equal(rollingHours(rows, '2026-05-15', 7), 9.6);
});
test('missing days and dates before seed start contribute zero', () => {
  assert.deepEqual(dailyHours(rows, '2026-05-06', '2026-05-09'), [
    { date: '2026-05-06', hours: 0 }, { date: '2026-05-07', hours: 0 },
    { date: '2026-05-08', hours: 99 }, { date: '2026-05-09', hours: 3.2 },
  ]);
  assert.equal(rollingHours(rows, '2026-05-07', 365), 0);
});
test('future rolling windows use seeded future records', () => {
  assert.equal(rollingHours(rows, '2026-05-16', 7), 11.9);
});
test('date iteration crosses leap days and years', () => {
  assert.equal(dailyHours([], '2024-02-28', '2024-03-01').length, 3);
  assert.equal(dailyHours([], '2025-12-31', '2026-01-01').length, 2);
});
for (const [expiry, daysRemaining, status] of [
  ['2026-05-14', -1, 'expired'], ['2026-05-15', 0, 'expired'],
  ['2026-05-16', 1, 'soon'], ['2026-06-14', 30, 'soon'], ['2026-06-15', 31, 'safe'],
]) test(`expiry ${expiry}: ${status} (${daysRemaining} days)`, () => {
  assert.deepEqual(documentState(expiry, '2026-05-15', 30), { daysRemaining, status });
});
test('date validation rejects normalization, timestamps and invalid leap days',()=>{
  for(const date of ['2026-02-30','2026-02-29','2026-13-01','2026-5-01','2026-05-15T00:00:00Z','bad']) assert.equal(isCalendarDate(date),false,date);
  assert.equal(isCalendarDate('2024-02-29'),true);
});
test('original dataset yields independently checked current rolling totals',()=>{
  const seed=JSON.parse(readFileSync(new URL('../data/mock-flight-hours.json',import.meta.url),'utf8'));
  for(const [days,want] of [[1,6.4],[7,25.2],[30,87.2],[90,247.6],[180,488.2],[365,1013.8]]) {
    assert.equal(rollingHours(seed.flightHours,'2026-05-15',days),want);
  }
});
