import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readableText} from '../nuxt/utils/color.ts';
test('duty text uses a high-contrast foreground without changing API duty colors',()=>{
  for(const [background,foreground] of [
    ['#10B981','#000000'],['#F59E0B','#000000'],['#FBA577','#000000'],
    ['#9CA3AF','#000000'],['#EF4444','#000000'],['#0EA5E9','#000000'],
    ['#7C3AED','#FFFFFF'],['#475569','#FFFFFF'],['#111827','#FFFFFF'],
    ['#7C2D12','#FFFFFF'],
  ]) assert.equal(readableText(background),foreground,background);
});
