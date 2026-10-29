<script setup lang="ts">
import type { Summary } from '~/types/api';
import { formatDate, hours } from '~/utils/format';

const props=defineProps<{summary:Summary}>();
const frame=ref<HTMLDivElement|null>(null);
const width=ref(760);
const compact=computed(()=>width.value<500);
const height=computed(()=>compact.value?210:Math.min(400,Math.max(244,Math.round(width.value*.23))));
const left=42,right=16,top=24,bottom=34;
const plotHeight=computed(()=>height.value-top-bottom);
const selectedIndex=ref(7);
const selected=computed(()=>props.summary.series[selectedIndex.value]!);
const x=(index:number)=>left+index*(width.value-left-right)/14;
const y=(value:number)=>top+plotHeight.value*(1-Math.min(value,props.summary.max)/props.summary.max);
const points=computed(()=>props.summary.series.map((point,i)=>`${x(i)},${y(point.hours)}`).join(' '));
const actualPoints=computed(()=>props.summary.series.slice(0,8).map((point,i)=>`${x(i)},${y(point.hours)}`).join(' '));
const futurePoints=computed(()=>props.summary.series.slice(7).map((point,i)=>`${x(i+7)},${y(point.hours)}`).join(' '));
const area=computed(()=>`${left},${top+plotHeight.value} ${points.value} ${x(14)},${top+plotHeight.value}`);
const ticks=computed(()=>Array.from({length:5},(_,i)=>Math.round(props.summary.max*i/4*10)/10));
const overflow=computed(()=>props.summary.series.some(point=>point.hours>props.summary.max));
const chartLabel=computed(()=>`${props.summary.windowDays}-day rolling flight hours, ${props.summary.limit} hour limit, ${formatDate(props.summary.series[0]!.date)} to ${formatDate(props.summary.series[14]!.date)}`);
let observer:ResizeObserver|undefined;
watch(()=>props.summary.range,()=>{selectedIndex.value=7;});
onMounted(()=>{
  observer=new ResizeObserver(entries=>{
    const size=entries[0]?.contentRect.width;
    if(size) width.value=Math.max(200,size);
  });
  if(frame.value) observer.observe(frame.value);
});
onBeforeUnmount(()=>observer?.disconnect());
</script>

<template>
  <div class="flight-chart">
    <div class="chart-legend">
      <span><i class="cyan-line" /> Flight hours</span>
      <span><i class="red-line" /><span data-testid="limit-label">{{ summary.limit }} h limit</span></span>
      <span class="projection-key"><i class="dashed-line" /> Projected</span>
    </div>
    <div ref="frame" class="chart-frame">
      <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="chartLabel">
        <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22C5E8" stop-opacity="0.18"/><stop offset="100%" stop-color="#22C5E8" stop-opacity="0"/></linearGradient></defs>
        <rect :x="x(7)" :y="top" :width="x(14)-x(7)" :height="plotHeight" fill="#F5F6F8"/>
        <g v-for="tick in ticks" :key="tick"><line :x1="left" :x2="width-right" :y1="y(tick)" :y2="y(tick)" stroke="#0E2138" stroke-opacity="0.12" stroke-dasharray="3 5"/><text :x="left-10" :y="y(tick)+4" text-anchor="end" class="axis-label">{{ tick }}</text></g>
        <polygon :points="area" fill="url(#chart-fill)"/>
        <line :x1="left" :x2="width-right" :y1="y(summary.limit)" :y2="y(summary.limit)" stroke="#E63757" stroke-width="1.4" stroke-dasharray="6 5"/>
        <line :x1="x(7)" :x2="x(7)" :y1="top-5" :y2="top+plotHeight" stroke="#6B7280" stroke-dasharray="3 4"/>
        <polyline :points="actualPoints" fill="none" stroke="#22C5E8" stroke-width="2.8" stroke-linejoin="round"/>
        <polyline :points="futurePoints" fill="none" stroke="#22C5E8" stroke-width="2.8" stroke-dasharray="5 5" stroke-linejoin="round"/>
        <line v-if="selectedIndex!==7" :x1="x(selectedIndex)" :x2="x(selectedIndex)" :y1="top" :y2="top+plotHeight" stroke="#6B7280" stroke-dasharray="2 4"/>
        <g v-for="(point,i) in summary.series" :key="point.date">
          <circle :cx="x(i)" :cy="y(point.hours)" :r="i===selectedIndex?5:3" :fill="point.hours>summary.max?'#E63757':i===selectedIndex?'#0E2138':'white'" :stroke="point.hours>summary.max?'#E63757':'#22C5E8'" :stroke-width="i===selectedIndex?2.5:1.7">
            <title>{{ formatDate(point.date) }}: {{ hours(point.hours) }} h{{ point.projected?' (projected)':'' }}{{ point.hours>summary.max?' — above chart scale':'' }}</title>
          </circle>
          <text v-if="point.hours>summary.max" :x="x(i)" :y="top-7" text-anchor="middle" class="overflow-marker">↑</text>
          <text v-if="i%2===1" :x="x(i)" :y="height-11" text-anchor="middle" class="axis-label" :class="{'today-label':i===7}">{{ i===7?'Today':formatDate(point.date,compact?{day:'numeric'}:{day:'numeric',month:'short'}) }}</text>
        </g>
      </svg>
    </div>
    <div class="chart-inspector">
      <div class="chart-selection" data-testid="chart-selection" role="status" aria-live="polite">
        <span>{{ formatDate(selected.date) }} <span class="selection-state">· {{ selected.projected?'Projected':'Recorded' }}</span></span>
        <strong>{{ hours(selected.hours) }} <small>h</small></strong>
      </div>
      <input v-model.number="selectedIndex" type="range" min="0" max="14" step="1" aria-label="Selected chart date" :aria-valuetext="`${formatDate(selected.date)}: ${hours(selected.hours)} hours, ${selected.projected?'projected':'recorded'}`" class="chart-date-slider">
      <p class="chart-range-caption">{{ formatDate(summary.series[0]!.date) }} – {{ formatDate(summary.series[14]!.date) }} <span>Slide to inspect a day</span></p>
    </div>
    <p v-if="overflow" class="overflow-note">↑ Values above the chart scale are marked in red. Exact totals are listed below.</p>
    <details class="chart-data"><summary>View daily totals</summary><table><caption>{{ summary.windowDays }}-day rolling totals</caption><thead><tr><th scope="col">Date</th><th scope="col">Hours</th><th scope="col">Status</th></tr></thead><tbody><tr v-for="point in summary.series" :key="point.date"><th scope="row">{{ formatDate(point.date) }}</th><td>{{ hours(point.hours) }}</td><td>{{ point.projected?'Projected':'Recorded' }}</td></tr></tbody></table></details>
  </div>
</template>
