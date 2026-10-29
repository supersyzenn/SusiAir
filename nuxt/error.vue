<script setup lang="ts">
defineProps<{error:{statusCode:number;message:string}}>();
</script>
<template><main class="error-page"><BrandLogo /><h1>{{ error.statusCode===404?'Page not found':'Something went wrong' }}</h1><p class="muted">{{ error.statusCode===404?'This page is not in your flight plan.':'Please return to your workspace and try again.' }}</p><button class="button" @click="clearError({redirect:'/'})">Back to home</button></main></template>
