<script setup lang="ts">
import { ArrowLeft, Plane } from 'lucide-vue-next';
defineProps<{title:string;description:string;back?:string}>();
</script>
<template><AppShell><section class="surface coming-soon"><div class="coming-icon"><Plane :size="32" /></div><p class="eyebrow">ON THE HORIZON</p><h1>{{ title }}</h1><p class="muted">{{ description }}</p><NuxtLink :to="back || '/'" class="button button-secondary"><ArrowLeft :size="17" /> {{ back? 'Back to schedule':'Back to home' }}</NuxtLink></section></AppShell></template>
