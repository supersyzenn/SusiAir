<script setup lang="ts">
import { ArrowUpRight, CalendarDays, Clock3, ShieldCheck } from 'lucide-vue-next';
import type { Pilot, Summary, DocumentsResponse, Range } from '~/types/api';
import { hours, formatDate, errorMessage } from '~/utils/format';
const session = useSessionStore();
const api = useApi();
const summary = ref<Summary|null>(null);
const documents = ref<DocumentsResponse|null>(null);
const range = ref<Range>('1w');
const loading = ref(true);
const chartLoading = ref(false);
const error = ref('');
const chartError = ref('');
let requestId = 0;
useHead({ title:'Home · Susi Air' });
async function load() {
  loading.value = true;error.value = '';
  try {
    const [pilot,totals,docs] = await Promise.all([api<Pilot>('/pilot/me'),api<Summary>(`/flight-hours/summary?range=${range.value}`),api<DocumentsResponse>('/documents')]);
    if (!session.token) return;
    session.pilot = pilot;summary.value = totals;documents.value = docs;
  } catch (e) { error.value = errorMessage(e); }
  finally { loading.value = false; }
}
async function changeRange(value:Range) {
  range.value = value;
  const id = ++requestId;
  chartLoading.value = true;chartError.value = '';
  try { const result = await api<Summary>(`/flight-hours/summary?range=${value}`);if (id===requestId) summary.value=result; }
  catch (e) { if (id===requestId) chartError.value=errorMessage(e); }
  finally { if (id===requestId) chartLoading.value=false; }
}
onMounted(load);
</script>
<template>
  <AppShell>
    <StatePanel v-if="loading || error" :loading="loading" :error="error" @retry="load" />
    <template v-else-if="session.pilot && summary && documents">
      <section class="home-intro"><div><div class="eyebrow intro-date">PILOT WORKSPACE <span /> {{ formatDate(session.pilot.today,{day:'numeric',month:'long',year:'numeric'}) }}</div><p class="greeting">Welcome back, Captain</p><h1>{{ session.pilot.name }}<span class="name-period">.</span></h1><p class="muted">Your day in focus. Your next flight in view.</p></div><div class="pilot-profile"><img :src="session.pilot.avatarUrl" :alt="session.pilot.name" class="avatar"><div><span class="small-label">TOTAL FLIGHT HOURS</span><div class="total-hours">{{ hours(session.pilot.totalFlightHours) }} <span>hrs</span></div><span class="profile-caption"><Clock3 :size="12" /> A lifetime in the skies</span></div></div></section>
      <div class="section-heading"><div><p class="eyebrow">FLIGHT READINESS</p><h2>Hours to limit</h2></div><span class="quiet-chip"><ShieldCheck :size="14" /> Rolling limits</span></div>
      <section class="limit-grid" aria-label="Current flight hour limits"><LimitCard v-for="card in summary.cards" :key="card.key" :card="card" /></section>
      <section class="surface chart-card"><div class="chart-heading"><div><h3>Flight hours trend</h3><p class="muted">Rolling totals, with today at the center</p></div><div class="range-toggle" aria-label="Rolling sum window"><button v-for="option in (['1w','1m','3m','6m','1y'] as Range[])" :key="option" :aria-pressed="range===option" :class="{active:range===option}" @click="changeRange(option)">{{ option }}</button></div></div><StatePanel v-if="chartError" :error="chartError" @retry="changeRange(range)" /><div v-else class="chart-container" :class="{ 'is-loading':chartLoading }" :aria-busy="chartLoading"><FlightChart :summary="summary" /></div></section>
      <div class="lower-grid"><section class="surface documents-card"><div class="card-title-row"><div><p class="eyebrow">KEEP YOURSELF FLIGHT-READY</p><h2>My documents</h2></div><span class="count-chip">{{ documents.documents.length }} documents</span></div><DocumentRow v-for="doc in documents.documents" :key="doc.id" :document="doc" /><p v-if="!documents.documents.length" class="muted">No pilot documents available.</p></section><section class="schedule-prompt"><div class="prompt-icon"><CalendarDays :size="24" /></div><p class="eyebrow light">PLAN YOUR NEXT MOVE</p><h2>Your schedule,<br>at a glance.</h2><p>See your duties, training, and time off in one place.</p><NuxtLink class="button prompt-button" to="/schedule">View schedule <ArrowUpRight :size="18" /></NuxtLink><span class="prompt-date">{{ formatDate(session.pilot.today,{month:'long',year:'numeric'}) }} · Duty calendar</span></section></div>
    </template>
  </AppShell>
</template>
