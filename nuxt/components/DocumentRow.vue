<script setup lang="ts">
import { FileBadge, FileCheck, HeartPulse, ShieldCheck, GraduationCap } from 'lucide-vue-next';
import type { PilotDocument } from '~/types/api';
import { formatDate } from '~/utils/format';
const props = defineProps<{document:PilotDocument}>();
const icons:Record<string,typeof FileBadge> = {doc_recurrent:GraduationCap,doc_ppc:FileCheck,doc_license:FileBadge,doc_medical:HeartPulse,doc_security:ShieldCheck};
const icon = computed(() => icons[props.document.id] || FileBadge);
const labels = {safe:'Valid',soon:'Expiring soon',expired:'Expired'};
</script>
<template>
  <div class="document-row"><div class="document-icon"><component :is="icon" :size="20" /></div><div class="document-info"><h3>{{ document.label }}</h3><p>{{ formatDate(document.expiryDate) }}<span> · {{ document.daysRemaining>0 ? `${document.daysRemaining} days left` : document.daysRemaining===0 ? 'Expires today' : `${Math.abs(document.daysRemaining)} days overdue` }}</span></p></div><span class="expiry-badge" :class="document.status"><i />{{ labels[document.status] }}</span></div>
</template>
