import {test} from 'node:test';
import assert from 'node:assert/strict';
import {logbookRange,historyBounds} from '../nuxt/utils/logbook.ts';
test('current month ends on the business date, while earlier months include their final day',()=>{
  assert.deepEqual(logbookRange('2026-05','2026-05-15'),{from:'2026-05-01',to:'2026-05-15'});
  assert.deepEqual(logbookRange('2026-04','2026-05-15'),{from:'2026-04-01',to:'2026-04-30'});
  assert.deepEqual(logbookRange('2024-02','2026-05-15'),{from:'2024-02-01',to:'2024-02-29'});
  assert.deepEqual(logbookRange('2025-12','2026-05-15'),{from:'2025-12-01',to:'2025-12-31'});
});
test('future or malformed months cannot become recorded history ranges',()=>{
  for(const month of ['2026-06','2026-13','bad','2026-5']) assert.equal(logbookRange(month,'2026-05-15'),null);
});
test('navigation bounds intersect source history with the business date',()=>{
  assert.deepEqual(historyBounds('2026-05-15','2024-12-27','2026-05-31'),{firstMonth:'2024-12',lastMonth:'2026-05',lastDate:'2026-05-15'});
  assert.deepEqual(historyBounds('2026-07-15','2024-12-27','2026-05-31'),{firstMonth:'2024-12',lastMonth:'2026-05',lastDate:'2026-05-31'});
});
test('empty or entirely future source data has no recorded navigation bounds',()=>{
  assert.equal(historyBounds('2026-05-15',null,null),null);
  assert.equal(historyBounds('2026-05-15','2026-06-01','2026-06-30'),null);
});
