<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

definePageMeta({
    layout: 'account-details'
});

const config = useRuntimeConfig();
const auth = useAuthStore();
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const myServices = ref<any[]>([]);
const purchased = ref<any[]>([]);
const activeTab = ref<'purchased' | 'proposed'>('purchased');

auth.checkAuth?.();

async function loadData() {
    loading.value = true;
    errorMsg.value = null;
    try {
        const [servicesRes, convsRes]: any[] = await Promise.all([$fetch(`${config.public.apiBase}/services`), $fetch(`${config.public.apiBase}/conversations`, { headers: { Authorization: `Bearer ${auth.cookies.get('token')}` } })]);
        const servicesList = Array.isArray(servicesRes) ? servicesRes : [];
        const convs = Array.isArray(convsRes) ? convsRes : [];
        const myId = auth?.user?.id;
        myServices.value = servicesList.filter((s: any) => s?.byProfile?.id && myId && s.byProfile.id === myId);
        purchased.value = convs
            .filter((c: any) => c?.reservation && c?.buyer?.id === myId)
            .map((c: any) => ({
                conversationId: c.id,
                reservation: c.reservation,
                service: c.service
            }));
    } catch (e) {
        errorMsg.value = 'Impossible de charger les données';
        // eslint-disable-next-line no-console
        console.error(e);
    } finally {
        loading.value = false;
    }
}

onMounted(loadData);

function statusBadge(status?: string) {
    const s = (status || '').toLowerCase();
    if (s === 'reserved') return 'bg-blue-500/20 text-blue-300';
    if (s === 'completed') return 'bg-green-500/20 text-green-300';
    if (s === 'canceled' || s === 'cancelled') return 'bg-red-500/20 text-red-300';
    return 'bg-white/10 text-white/80';
}
</script>

<template>
    <div class="p-6 md:p-12 flex flex-col gap-10 rounded-2.5xl md:rounded-4xl bg-white/16 backdrop-blur-[48px] max-w-[calc(100%-3rem)] lg:max-w-none mx-auto shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]">
        <div class="flex md:flex-row justify-between flex-col items-start gap-8 pb-2">
            <div class="text-lg font-medium text-surface-0">Mes services</div>
            <div v-if="loading" class="text-white/70">Chargement…</div>
            <div v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</div>
        </div>

        <div class="flex items-center gap-2 p-1 rounded-full border border-white/12 bg-white/8 backdrop-blur-[48px] w-max">
            <button type="button" :class="['px-4 py-1 rounded-full text-sm', activeTab === 'purchased' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10']" @click="activeTab = 'purchased'">Achetés</button>
            <button type="button" :class="['px-4 py-1 rounded-full text-sm', activeTab === 'proposed' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10']" @click="activeTab = 'proposed'">Proposés</button>
        </div>

        <div v-if="activeTab === 'purchased'">
            <div class="flex flex-col divide-y divide-white/10">
                <div v-for="p in purchased" :key="p.reservation.id" class="py-4 flex items-start justify-between gap-4">
                    <div class="flex flex-col">
                        <div class="text-surface-0 font-medium">{{ p.service?.title || `Réservation #${p.reservation.id}` }}</div>
                        <div class="text-white/64 text-sm">{{ new Date(p.reservation.createdAt).toLocaleString('fr-FR') }}</div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span :class="['px-3 py-1 rounded-full text-xs', statusBadge(p.reservation.status)]">{{ p.reservation.status }}</span>
                        <NuxtLink :to="`/profile/conversations/${p.conversationId}`" class="button-blur h-auto px-3 py-1 text-sm">Ouvrir la conversation</NuxtLink>
                    </div>
                </div>
                <div v-if="!loading && purchased.length === 0" class="py-6 text-white/70">Aucun service acheté pour le moment.</div>
            </div>
        </div>

        <div v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="s in myServices" :key="s.id" class="bg-white/4 border border-white/8 backdrop-blur-[48px] rounded-3xl p-4">
                    <div class="flex items-start justify-between">
                        <div class="text-surface-0 text-xl font-semibold">{{ s.title }}</div>
                        <div class="text-surface-0 text-lg">{{ s.cost }} L</div>
                    </div>
                    <div class="text-white/70 mt-2 line-clamp-3">{{ s.description }}</div>
                    <div class="mt-4 text-sm text-white/60 flex items-center gap-3">
                        <i :class="['pi', s.isRemote ? 'pi-desktop' : 'pi-map-marker']" />
                        <span>{{ s.isRemote ? 'À distance' : 'Présentiel' }}</span>
                    </div>
                    <NuxtLink :to="`/services/${s.id}/edit`" class="button-blur mt-4 inline-flex items-center gap-2 h-auto px-3 py-1 text-sm"><i class="pi pi-pencil" /> Modifier</NuxtLink>
                </div>
            </div>
            <div v-if="!loading && myServices.length === 0" class="py-6 text-white/70">Aucun service publié pour le moment.</div>
        </div>
    </div>
</template>
