import { defineStore } from 'pinia';
import type { Pilot } from '~/types/api';
export const useSessionStore = defineStore('session', () => {
  const token = ref('');
  const pilot = ref<Pilot|null>(null);
  const initialized = ref(false);
  function restore() {
    if (initialized.value) return;
    try { token.value = sessionStorage.getItem('susiair-token') || ''; } catch { token.value = ''; }
    initialized.value = true;
  }
  function setToken(value:string) {
    token.value = value;
    try { sessionStorage.setItem('susiair-token',value); } catch { /* In-memory session remains usable. */ }
  }
  function clear() {
    token.value = '';
    pilot.value = null;
    try { sessionStorage.removeItem('susiair-token'); } catch { /* Storage can be disabled. */ }
  }
  return { token,pilot,restore,setToken,clear };
});
