<script setup lang="ts">
import { House, CalendarDays, BookOpen, Ellipsis, LogOut, Plane } from 'lucide-vue-next';
const session = useSessionStore();
const route = useRoute();
const links = [{ to:'/',label:'Home',icon:House },{ to:'/schedule',label:'Schedule',icon:CalendarDays },{ to:'/logbook',label:'Logbook',icon:BookOpen },{ to:'/more',label:'More',icon:Ellipsis }];
function active(to:string) { return to === '/' ? route.path === '/' : route.path.startsWith(to); }
async function signOut() { session.clear();await navigateTo('/sign-in'); }
</script>
<template>
  <div class="operations-app">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="app-header">
      <NuxtLink to="/" class="brand-link" aria-label="Susi Air home"><BrandLogo /><span class="brand-divider" /><span class="product-name">PILOT OPERATIONS</span></NuxtLink>
      <div class="header-right"><span class="workspace-label"><span class="status-dot" /> Pilot workspace</span><button class="icon-button" aria-label="Sign out" title="Sign out" @click="signOut"><LogOut :size="19" /></button></div>
    </header>
    <main id="main-content" class="main-content"><slot /></main>
    <footer class="workspace-footer"><Plane :size="13" /><span>PT. ASI Pudjiastuti Aviation</span><span>Safe flights. Every day.</span></footer>
    <nav class="bottom-nav" aria-label="Main navigation"><NuxtLink v-for="link in links" :key="link.to" :to="link.to" :class="{active:active(link.to)}" :aria-current="active(link.to) ? 'page' : undefined"><component :is="link.icon" :size="21" :stroke-width="active(link.to)?2.3:1.7" /><span>{{ link.label }}</span></NuxtLink></nav>
  </div>
</template>
