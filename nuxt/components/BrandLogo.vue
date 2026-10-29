<script setup lang="ts">
const config = useRuntimeConfig();
const failed = ref(false);
</script>
<template>
  <span class="brand-logo" aria-label="Susi Air">
    <img v-if="!failed" :src="config.public.logoUrl || '/susiair-logo.png'" alt="Susi Air" @error="failed = true">
    <span v-else class="brand-wordmark">SUSI<span>AIR</span><i /></span>
  </span>
</template>
