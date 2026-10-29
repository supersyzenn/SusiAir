<script setup lang="ts">
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Clock3, TrendingUp } from 'lucide-vue-next';
import type { DailyHoursResponse, Pilot } from '~/types/api';
import { formatDate, hours, errorMessage } from '~/utils/format';
import { adjacentMonth } from '~/utils/calendar';
import { logbookRange, historyBounds } from '~/utils/logbook';

const api=useApi();
const session=useSessionStore();
const selectedMonth=ref('');
const data=ref<DailyHoursResponse|null>(null);
const bounds=ref<ReturnType<typeof historyBounds>>(null);
const loading=ref(true);
const error=ref('');
const flyingOnly=ref(false);
let requestId=0;
const monthLabel=computed(()=>selectedMonth.value ? formatDate(`${selectedMonth.value}-01`,{month:'long',year:'numeric'}) : 'Flight history');
const previousAllowed=computed(()=>!!bounds.value && selectedMonth.value>bounds.value.firstMonth);
const nextAllowed=computed(()=>!!bounds.value && selectedMonth.value<bounds.value.lastMonth);
const visibleDays=computed(()=>(data.value?.days || []).filter(day=>!flyingOnly.value || day.hours>0).slice().reverse());

async function load() {
  const id=++requestId;
  loading.value=true;error.value='';
  try {
    const pilot=session.pilot || await api<Pilot>('/pilot/me');
    if(id!==requestId || !session.token) return;
    session.pilot=pilot;
    selectedMonth.value ||= pilot.today.slice(0,7);
    const month=selectedMonth.value;
    const cap=bounds.value && bounds.value.lastDate<pilot.today ? bounds.value.lastDate : pilot.today;
    const range=logbookRange(month,cap);
    if(!range) {selectedMonth.value=cap.slice(0,7);await load();return;}
    const result=await api<DailyHoursResponse>(`/flight-hours?from=${range.from}&to=${range.to}`);
    if(id!==requestId || !session.token) return;
    const available=historyBounds(result.today,result.dataStart,result.dataEnd);
    bounds.value=available;
    if(available) {
      const monthInBounds=month<available.firstMonth ? available.firstMonth : month>available.lastMonth ? available.lastMonth : month;
      if(monthInBounds!==month || range.to>available.lastDate) {
        selectedMonth.value=monthInBounds;await load();return;
      }
    }
    data.value=result;
  } catch(e) {if(id===requestId) error.value=errorMessage(e);}
  finally {if(id===requestId) loading.value=false;}
}
function move(delta:number) {
  if(!bounds.value || !selectedMonth.value) return;
  const [year,month]=selectedMonth.value.split('-').map(Number);
  const next=adjacentMonth(year!,month!,delta);
  const target=`${next.year}-${String(next.month).padStart(2,'0')}`;
  if(target<bounds.value.firstMonth || target>bounds.value.lastMonth) return;
  selectedMonth.value=target;load();
}
function latest() {
  if(!bounds.value) return;
  selectedMonth.value=bounds.value.lastMonth;load();
}
useHead({title:'Logbook · Susi Air'});
onMounted(load);
onBeforeUnmount(()=>{requestId++;});
</script>

<template>
  <AppShell>
    <section class="page-intro logbook-intro">
      <div><p class="eyebrow">YOUR FLIGHT HISTORY</p><h1>Logbook<span class="name-period">.</span></h1><p class="muted">A daily record of your time in the skies.</p></div>
      <span class="quiet-chip"><BookOpen :size="15" /> Daily flight hours</span>
    </section>
    <div class="logbook-toolbar">
      <div class="logbook-month"><CalendarDays :size="21" /><h2 aria-live="polite">{{ monthLabel }}</h2></div>
      <div class="logbook-controls">
        <button class="text-button" :disabled="!bounds" @click="latest">Latest month</button>
        <button class="icon-button" aria-label="Previous month" :disabled="!previousAllowed" @click="move(-1)"><ChevronLeft :size="19" /></button>
        <button class="icon-button" aria-label="Next month" :disabled="!nextAllowed" @click="move(1)"><ChevronRight :size="19" /></button>
      </div>
    </div>
    <StatePanel v-if="loading || error" :loading="loading" :error="error" @retry="load" />
    <template v-else-if="data">
      <section class="logbook-summary" aria-label="Selected month totals">
        <article class="surface logbook-stat logbook-stat-primary"><div class="logbook-stat-heading"><p>Recorded hours</p><Clock3 :size="19" /></div><strong data-testid="logbook-total">{{ hours(data.statistics.totalHours) }} <small>h</small></strong><p class="logbook-stat-caption">{{ formatDate(data.from,{day:'numeric',month:'short'}) }} – {{ formatDate(data.to) }}</p></article>
        <article class="surface logbook-stat"><div class="logbook-stat-heading"><p>Flying days</p><CalendarDays :size="19" /></div><strong data-testid="logbook-flying-days">{{ data.statistics.flyingDays }}</strong><p class="logbook-stat-caption">Days with recorded hours</p></article>
        <article class="surface logbook-stat"><div class="logbook-stat-heading"><p>Average per flying day</p><TrendingUp :size="19" /></div><strong data-testid="logbook-average">{{ hours(data.statistics.averageFlyingDayHours) }} <small>h</small></strong><p class="logbook-stat-caption">Across flying days this month</p></article>
      </section>
      <section class="surface logbook-records">
        <div class="logbook-table-heading">
          <div><h2>Daily flight hours</h2><p class="muted">Through {{ formatDate(data.to) }}</p></div>
          <label class="logbook-filter"><input v-model="flyingOnly" type="checkbox"> Flying days only</label>
        </div>
        <StatePanel v-if="!bounds" empty="No flight hours recorded yet." />
        <StatePanel v-else-if="!visibleDays.length" :empty="flyingOnly ? 'No flying days in this month.' : 'No daily records available for this month.'" />
        <table v-else class="logbook-table">
          <caption class="visually-hidden">Daily flight hours for {{ monthLabel }}, through {{ formatDate(data.to) }}</caption>
          <thead><tr><th scope="col">Date</th><th scope="col">Flight hours</th><th scope="col" class="logbook-status-column">Daily record</th></tr></thead>
          <tbody>
            <tr v-for="day in visibleDays" :key="day.date" :class="{'logbook-zero':day.hours===0}">
              <th scope="row"><div class="logbook-day"><span class="logbook-day-icon"><CalendarDays :size="17" /></span><span><strong>{{ formatDate(day.date,{day:'numeric',month:'short'}) }}</strong><small>{{ formatDate(day.date,{weekday:'long'}) }}</small></span></div></th>
              <td><span class="logbook-hours">{{ hours(day.hours) }} <small>h</small></span></td>
              <td class="logbook-status-column"><span class="logbook-record-state" :class="{'has-hours':day.hours>0}"><i />{{ day.hours>0?'Hours recorded':'No recorded hours' }}</span></td>
            </tr>
          </tbody>
        </table>
        <footer v-if="bounds && data.dataStart" class="logbook-table-footer"><span>{{ visibleDays.length }} {{ flyingOnly?'flying days':'daily records' }}</span><span>Available history: {{ formatDate(data.dataStart) }} – {{ formatDate(bounds.lastDate) }}</span></footer>
      </section>
    </template>
  </AppShell>
</template>
