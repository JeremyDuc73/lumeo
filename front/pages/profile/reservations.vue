<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

definePageMeta({
    layout: 'account-details'
});

const config = useRuntimeConfig();
const auth = useAuthStore();
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const reservations = ref<any[]>([]);

auth.checkAuth?.();

async function loadReservations() {
    loading.value = true;
    errorMsg.value = null;
    try {
        // Le backend expose les réservations via les conversations (champ reservation)
        const res: any = await $fetch(`${config.public.apiBase}/conversations`, {
            headers: { Authorization: `Bearer ${auth.cookies.get('token')}` }
        });
        const list = Array.isArray(res) ? res : [];
        // On garde uniquement les conversations qui ont une réservation rattachée
        reservations.value = list
            .filter((c: any) => c?.reservation)
            .map((c: any) => ({
                ...c.reservation,
                service: c.service,
                conversation: { id: c.id }
            }));
    } catch (e) {
        errorMsg.value = 'Impossible de charger les réservations';
        // eslint-disable-next-line no-console
        console.error(e);
    } finally {
        loading.value = false;
    }
}

onMounted(loadReservations);

function statusBadge(status?: string) {
    const s = (status || '').toLowerCase();
    if (s === 'reserved') return 'bg-blue-500/20 text-blue-300';
    if (s === 'completed') return 'bg-green-500/20 text-green-300';
    if (s === 'canceled' || s === 'cancelled') return 'bg-red-500/20 text-red-300';
    return 'bg-white/10 text-white/80';
}

function formatDate(value?: string) {
    if (!value) return '';
    const d = new Date(value);
    return d.toLocaleString('fr-FR');
}
</script>

<template>
    <div class="p-6 md:p-12 flex flex-col gap-10 rounded-2.5xl md:rounded-4xl bg-white/16 backdrop-blur-[48px] max-w-[calc(100%-3rem)] lg:max-w-none mx-auto shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]">
        <div class="flex md:flex-row justify-between flex-col items-start gap-8 pb-2">
            <div class="text-lg font-medium text-surface-0">Mes réservations</div>
            <div v-if="loading" class="text-white/70">Chargement…</div>
            <div v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</div>
        </div>

        <div class="flex flex-col divide-y divide-white/10">
            <div v-for="r in reservations" :key="r.id" class="py-4 flex items-start justify-between gap-4">
                <div class="flex flex-col">
                    <div class="text-surface-0 font-medium">
                        {{ r?.service?.title || `Réservation #${r.id}` }}
                    </div>
                    <div class="text-white/64 text-sm">
                        {{ formatDate(r?.createdAt) }}
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span :class="['px-3 py-1 rounded-full text-xs', statusBadge(r?.status)]">{{ r?.status || '—' }}</span>
                    <NuxtLink v-if="r?.conversation?.id" :to="`/profile/conversations/${r.conversation.id}`" class="button-blur h-auto px-3 py-1 text-sm">Ouvrir la conversation</NuxtLink>
                </div>
            </div>
            <div v-if="!loading && reservations.length === 0" class="py-6 text-white/70">Aucune réservation.</div>
        </div>
    </div>
</template>
