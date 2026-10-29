import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthCells, adjacentMonth, scheduleMonth, isScheduleDate } from '../nuxt/utils/calendar.ts';
test('May 2026 starts on Friday in a Monday-first grid',()=>{
  const cells=monthCells(2026,5);
  assert.equal(cells[0].date,'2026-04-27');
  assert.equal(cells[4].date,'2026-05-01');
  assert.equal(cells.filter(c=>c.current).length,31);
  assert.equal(cells.length%7,0);
});
test('leap February includes 29 days',()=>{
  assert.equal(monthCells(2024,2).filter(c=>c.current).length,29);
});
test('month navigation crosses year boundaries in both directions',()=>{
  assert.deepEqual(adjacentMonth(2026,12,1),{year:2027,month:1});
  assert.deepEqual(adjacentMonth(2026,1,-1),{year:2025,month:12});
});
test('calendar return context accepts only real API-supported months',()=>{
  assert.deepEqual(scheduleMonth('2026-04'),{year:2026,month:4});
  for(const value of ['2026-13','2026-4','bad',['2026-04'],'1800-01']) assert.equal(scheduleMonth(value),null);
});
test('detail dates reject normalized impossible dates and accept leap years',()=>{
  assert.equal(isScheduleDate('2026-05-15'),true);
  assert.equal(isScheduleDate('2024-02-29'),true);
  for(const value of ['2026-02-30','2026-02-29','2026-13-01','2026-5-15',[],null]) assert.equal(isScheduleDate(value),false);
});
