<script setup lang="ts">
import { AlertCircle, LoaderCircle } from 'lucide-vue-next';
defineProps<{ loading?:boolean;error?:string;empty?:string }>();
defineEmits<{ retry:[] }>();
</script>
<template>
  <div v-if="loading" class="state-panel" role="status"><LoaderCircle class="spin" :size="28" /><p>Loading your operations…</p></div>
  <div v-else-if="error" class="state-panel error-panel" role="alert"><AlertCircle :size="28" /><p>{{ error }}</p><button class="button button-secondary" @click="$emit('retry')">Try again</button></div>
  <div v-else-if="empty" class="state-panel"><p>{{ empty }}</p></div>
</template>
