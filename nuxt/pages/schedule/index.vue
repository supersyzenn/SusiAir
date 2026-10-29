<script setup lang="ts">
import { ChevronLeft, ChevronRight, Check, CalendarDays, CircleHelp } from 'lucide-vue-next';
import type { Pilot, Schedule, SchedulesResponse } from '~/types/api';
import { formatDate, errorMessage } from '~/utils/format';
import { monthCells, adjacentMonth, scheduleMonth } from '~/utils/calendar';
import { readableText } from '~/utils/color';
const api=useApi();
const session=useSessionStore();
const route=useRoute();
const router=useRouter();
const year=ref(0),month=ref(0);
const data=ref<SchedulesResponse|null>(null);
const loading=ref(true),error=ref('');
let requestId=0;
const monthLabel=computed(()=>year.value ? new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year.value,month.value-1,1))) : 'Your schedule');
const cells=computed(()=>year.value ? monthCells(year.value,month.value) : []);
const byDay=computed(()=>{
  const days:Record<string,Schedule[]>={};
  for(const row of data.value?.schedules || []) (days[row.duty_date] ||= []).push(row);
  return days;
});
function dutyStatus(date:string) {
  const rows=byDay.value[date] || [];
  const planned=rows.reduce((sum,row)=>sum+row.count_schedules,0);
  const logged=rows.reduce((sum,row)=>sum+row.count_logbooks,0);
  return {complete:planned===logged,remaining:Math.max(0,planned-logged)};
}
function cellLabel(date:string) {
  const rows=byDay.value[date] || [];
  const status=dutyStatus(date);
  return `${formatDate(date)}${rows.length?`: ${rows.map(row=>row.duty_type).join(', ')}, ${status.complete?'all duties logged':`${status.remaining} duties remaining`}`:', no duties'}`;
}
async function load() {
  const id=++requestId;
  loading.value=true;error.value='';
  try {
    if(!session.pilot) session.pilot=await api<Pilot>('/pilot/me');
    if(!year.value) {const parts=session.pilot.today.split('-');year.value=Number(parts[0]);month.value=Number(parts[1]);}
    const result=await api<SchedulesResponse>(`/schedules?year=${year.value}&month=${String(month.value).padStart(2,'0')}`);
    if(id===requestId) data.value=result;
  } catch(e) {if(id===requestId) error.value=errorMessage(e);}
  finally {if(id===requestId) loading.value=false;}
}
function move(delta:number) {
  const next=adjacentMonth(year.value,month.value,delta);
  if(next.year<1900 || next.year>2199) return;
  year.value=next.year;month.value=next.month;
  router.replace({path:'/schedule',query:{month:`${year.value}-${String(month.value).padStart(2,'0')}`}});
  load();
}
function reset() {router.replace('/schedule');year.value=0;month.value=0;load();}
function openDate(date:string) {
  navigateTo({path:`/schedule/${date}`,query:{month:`${year.value}-${String(month.value).padStart(2,'0')}`}});
}
useHead({title:'Schedule · Susi Air'});
onMounted(()=>{
  const selected=scheduleMonth(route.query.month);
  if(selected) {year.value=selected.year;month.value=selected.month;}
  load();
});
</script>
<template>
  <AppShell><section class="page-intro"><p class="eyebrow">YOUR DUTY CALENDAR</p><h1>Schedule<span class="name-period">.</span></h1><p class="muted">A clear view of your month, on duty and off.</p></section>
    <section class="surface calendar-card"><div class="calendar-toolbar"><div class="calendar-month"><span class="calendar-heading-icon"><CalendarDays :size="21" /></span><h2 aria-live="polite">{{ monthLabel }}</h2></div><div class="calendar-controls"><button class="text-button" :disabled="!year" @click="reset">Today</button><button class="icon-button" aria-label="Previous month" :disabled="!year || (year===1900 && month===1)" @click="move(-1)"><ChevronLeft :size="20" /></button><button class="icon-button" aria-label="Next month" :disabled="!year || (year===2199 && month===12)" @click="move(1)"><ChevronRight :size="20" /></button></div></div>
      <StatePanel v-if="loading || error" :loading="loading" :error="error" @retry="load" />
      <template v-else-if="data"><div class="weekday-grid"><span v-for="day in ['MON','TUE','WED','THU','FRI','SAT','SUN']" :key="day">{{ day }}</span></div><div class="calendar-grid"><button v-for="cell in cells" :key="cell.date" class="calendar-cell" :class="{outside:!cell.current,today:cell.date===data.today,'has-duty':!!byDay[cell.date]?.length}" :style="{'--day-color':byDay[cell.date]?.[0]?.base_color}" :aria-label="cellLabel(cell.date)" :aria-current="cell.date===data.today?'date':undefined" @click="openDate(cell.date)"><span class="day-number">{{ cell.day }}</span><span v-if="byDay[cell.date]?.length" class="duty-status" :class="{complete:dutyStatus(cell.date).complete}" :title="dutyStatus(cell.date).complete?'All duties logged':`${dutyStatus(cell.date).remaining} duties remaining`"><Check v-if="dutyStatus(cell.date).complete" :size="12" :stroke-width="3" /><template v-else>{{ dutyStatus(cell.date).remaining }}</template></span><span class="day-entries"><span v-for="entry in byDay[cell.date] || []" :key="entry.id" class="duty-entry" :style="{'--duty-color':entry.base_color,color:readableText(entry.base_color)}"><span class="duty-code">{{ entry.base_name }}</span><small>{{ entry.duty_type }}</small></span></span></button></div><p v-if="!data.schedules.length" class="empty-month" role="status">No duties scheduled for {{ monthLabel }}.</p><div class="calendar-explainer"><CircleHelp :size="15" /><span><Check :size="12" /> All duties logged <i /> Number badge = duties remaining</span></div></template>
    </section><section v-if="data" class="surface legend-card"><p class="eyebrow">DUTY TYPES</p><div class="duty-legend"><div v-for="item in data.legend" :key="item.code"><i :style="{background:item.color}"/><span><strong>{{ item.code }}</strong>{{ item.label }}</span></div></div></section><p class="business-date-note">Select any date to open its detail page.</p>
  </AppShell>
</template>
