<script setup lang="ts">
import { Sun, CalendarRange, CalendarDays, Plane, TriangleAlert } from 'lucide-vue-next';
import type { LimitCard } from '~/types/api';
import { hours } from '~/utils/format';
const props = defineProps<{card:LimitCard}>();
const icons:Record<string,typeof Sun> = { daily:Sun,weekly:CalendarRange,monthly:CalendarDays,annual:Plane };
const percent = computed(() => props.card.hours / props.card.limit * 100);
const state = computed(() => percent.value>=100 ? 'danger' : percent.value>=80 ? 'warning' : 'safe');
</script>
<template>
  <article class="surface limit-card" :class="state"><div class="limit-card-top"><span>{{ card.label }}</span><component :is="icons[card.key] || Plane" :size="18" /></div><div class="limit-value">{{ hours(card.hours) }}<span>/ {{ hours(card.limit) }} <small>h</small></span></div><div class="progress-track" role="progressbar" :aria-label="`${card.label} flight hours`" :aria-valuemin="0" :aria-valuemax="card.limit" :aria-valuenow="Math.min(card.hours,card.limit)" :aria-valuetext="`${hours(card.hours)} of ${hours(card.limit)} hours`"><div :style="{width:`${Math.min(100,percent)}%`}" /></div><p class="limit-caption"><template v-if="card.hours>card.limit"><TriangleAlert :size="12" /> {{ hours(card.hours-card.limit) }} h over limit</template><template v-else>{{ hours(card.limit-card.hours) }} h remaining</template><span>{{ card.windowDays===1?'Today':`Last ${card.windowDays} days` }}</span></p></article>
</template>
