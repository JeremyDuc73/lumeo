<script setup lang="ts">
import { useAuthStore } from '~/store/auth';
import { useMercure } from '~/composables/useMercure';

definePageMeta({
    layout: 'account-details'
});

const config = useRuntimeConfig();
const auth = useAuthStore();
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const conversations = ref<any[]>([]);
const activeTab = ref<'active' | 'archived'>('active');

auth.checkAuth?.();

async function loadConversations() {
    loading.value = true;
    errorMsg.value = null;
    try {
        const res: any = await $fetch(`${config.public.apiBase}/conversations`, {
            headers: { Authorization: `Bearer ${auth.cookies.get('token')}` }
        });
        conversations.value = Array.isArray(res) ? res : [];
    } catch (e) {
        errorMsg.value = 'Impossible de charger les conversations';
    } finally {
        loading.value = false;
    }
}

onMounted(loadConversations);

let unsubscribe: (() => void) | null = null;
onMounted(() => {
    try {
        const { subscribe } = useMercure();
        const meId = auth?.user?.id;
        if (meId) {
            const topic = `https://lumeo.app/profiles/${meId}/notifications`;
            unsubscribe = subscribe(
                [topic],
                (data: any) => {
                    if (data?.type === 'notification' && (data?.event === 'message.created' || data?.event === 'reservation.created')) {
                        loadConversations();
                    }
                },
                { withCredentials: true }
            );
        }
    } catch {}
});

onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe();
});

function otherParticipant(conv: any) {
    const meId = auth?.user?.id;
    const buyer = conv?.buyer;
    const seller = conv?.seller;
    const other = buyer?.id === meId ? seller : buyer;
    return other?.username || other?.name || 'Conversation';
}

function lastMessagePreview(conv: any) {
    const m = conv?.lastMessage || conv?.messages?.[conv.messages.length - 1] || null;
    if (!m) return '';
    const text: string = (m.content || '').toString();
    return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

const activeConversations = computed(() => (conversations.value || []).filter((c: any) => (c?.reservation?.status || 'reserved') === 'reserved'));
const archivedConversations = computed(() => (conversations.value || []).filter((c: any) => (c?.reservation?.status || 'reserved') !== 'reserved'));
</script>

<template>
    <div class="p-6 md:p-12 flex flex-col gap-10 rounded-2.5xl md:rounded-4xl bg-white/16 backdrop-blur-[48px] max-w-[calc(100%-3rem)] lg:max-w-none mx-auto shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]">
        <div class="flex md:flex-row justify-between flex-col items-start gap-8 pb-2">
            <div class="text-lg font-medium text-surface-0">Mes conversations</div>
            <div v-if="loading" class="text-white/70">Chargement…</div>
            <div v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</div>
        </div>

        <div class="flex items-center gap-2 p-1 rounded-full border border-white/12 bg-white/8 backdrop-blur-[48px] w-max">
            <button type="button" :class="['px-4 py-1 rounded-full text-sm', activeTab === 'active' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10']" @click="activeTab = 'active'">Actives</button>
            <button type="button" :class="['px-4 py-1 rounded-full text-sm', activeTab === 'archived' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10']" @click="activeTab = 'archived'">Archivées</button>
        </div>

        <div class="flex flex-col divide-y divide-white/10">
            <NuxtLink v-for="c in activeTab === 'active' ? activeConversations : archivedConversations" :key="c.id" :to="`/profile/conversations/${c.id}`" class="py-4 flex items-center justify-between gap-4 hover:bg-white/6 rounded-xl px-2">
                <div class="flex flex-col">
                    <div class="text-surface-0 font-medium">{{ c?.service?.title || 'Conversation' }}</div>
                    <div class="text-white/64 text-sm">avec {{ otherParticipant(c) }} — {{ lastMessagePreview(c) }}</div>
                </div>
                <i class="pi pi-angle-right text-white/60" />
            </NuxtLink>
            <div v-if="!loading && (activeTab === 'active' ? activeConversations.length === 0 : archivedConversations.length === 0)" class="py-6 text-white/70">Aucune conversation {{ activeTab === 'active' ? 'active' : 'archivée' }}.</div>
        </div>
    </div>
</template>
