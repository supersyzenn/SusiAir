<script setup lang="ts">
import { formatDate } from '~/utils/format';
import { isScheduleDate, scheduleMonth } from '~/utils/calendar';
definePageMeta({validate:route=>isScheduleDate(route.params.date)});
const route=useRoute();
const date=computed(()=>String(route.params.date));
const description=computed(()=>`Duty details for ${formatDate(date.value)} will be available here.`);
const back=computed(()=>{
  const context=scheduleMonth(route.query.month);
  const month=context?`${context.year}-${String(context.month).padStart(2,'0')}`:date.value.slice(0,7);
  return `/schedule?month=${month}`;
});
useHead({title:'Duty details · Susi Air'});
</script>
<template><ComingSoon title="Detail page coming soon" :description="description" :back="back" /></template>
