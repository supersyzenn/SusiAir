<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound, ShieldCheck, Plane, LoaderCircle } from 'lucide-vue-next';
import { errorMessage } from '~/utils/format';
const username = ref('');
const password = ref('');
const visible = ref(false);
const busy = ref(false);
const error = ref('');
const api = useApi();
const session = useSessionStore();
const route = useRoute();
useHead({ title:'Sign in · Susi Air' });
async function signIn() {
  if (busy.value) return;
  busy.value = true;error.value = '';
  try {
    const result = await api<{accessToken:string}>('/auth/login',{ method:'POST',body:{ username:username.value,password:password.value } });
    session.setToken(result.accessToken);
    await navigateTo('/');
  } catch (e) { error.value = errorMessage(e); }
  finally { busy.value = false; }
}
</script>
<template>
  <div class="sign-in-page">
    <aside class="sign-in-art" aria-hidden="true"><div class="art-grid" /><span class="art-kicker">SUSI AIR / PILOT OPERATIONS</span><div class="orbit orbit-one" /><div class="orbit orbit-two" /><Plane class="art-plane" :stroke-width="0.7" /><div class="art-copy"><span class="eyebrow light">YOUR NEXT FLIGHT STARTS HERE</span><h2>Connected to<br>every horizon.</h2><p>One workspace for your schedule, flight hours, and the details that keep you ready to fly.</p><div class="art-rule" /><span>Connecting the archipelago. Since 2004.</span></div><div class="art-coordinates">07°42′ S &nbsp; 108°29′ E <span>PANGANDARAN, INDONESIA</span></div></aside>
    <main class="sign-in-main"><div class="sign-in-top"><BrandLogo /><span class="small-label">PILOT PORTAL</span></div><section class="sign-in-form"><div class="section-mark"><Plane :size="23" /></div><p class="eyebrow">WELCOME ABOARD</p><h1>Ready for your<br>next flight?</h1><p class="muted intro">Sign in to your pilot workspace.</p>
      <p v-if="route.query.session === 'expired'" class="session-notice" role="status">Your session has expired. Please sign in again.</p>
      <form @submit.prevent="signIn"><label for="username">Username</label><div class="input-wrap"><UserRound :size="18" /><input id="username" v-model="username" name="username" autocomplete="username" placeholder="Enter your username" required maxlength="100"></div><label for="password">Password</label><div class="input-wrap"><LockKeyhole :size="18" /><input id="password" v-model="password" name="password" :type="visible?'text':'password'" autocomplete="current-password" placeholder="Enter your password" required maxlength="200"><button type="button" :aria-label="visible?'Hide password':'Show password'" @click="visible=!visible"><EyeOff v-if="visible" :size="18" /><Eye v-else :size="18" /></button></div><p v-if="error" class="form-error" role="alert">{{ error }}</p><button class="button sign-in-button" type="submit" :disabled="busy"><span>{{ busy?'Signing in…':'Sign in' }}</span><LoaderCircle v-if="busy" class="spin" :size="19" /><ArrowRight v-else :size="19" /></button></form>
      <div class="secure-note"><ShieldCheck :size="16" /><span>Secure access for Susi Air flight crew</span></div>
    </section><footer class="sign-in-footer">© PT. ASI Pudjiastuti Aviation<span>Fly safe. Stay connected.</span></footer></main>
  </div>
</template>
