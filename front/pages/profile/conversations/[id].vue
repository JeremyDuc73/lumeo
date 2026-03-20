<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { nextTick } from 'vue';
import { useAuthStore } from '~/store/auth';
import { useMercure } from '~/composables/useMercure';

definePageMeta({
    layout: 'account-details'
});

const config = useRuntimeConfig();
const route = useRoute();
const auth = useAuthStore();
const toast = useToast();
const confirm = useConfirm();

const id = computed(() => String(route.params.id));
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const conversation = ref<any | null>(null);
const messages = ref<any[]>([]);

const newMessage = ref('');
const sending = ref(false);
let poller: any = null;
let unsubscribe: (() => void) | null = null;

const isSeller = computed(() => {
    try {
        return conversation.value?.seller?.id === auth?.user?.id;
    } catch {
        return false;
    }
});

const isArchived = computed(() => {
    const status = conversation.value?.reservation?.status;
    return status && status !== 'reserved';
});

auth.checkAuth?.();

async function loadConversation() {
    loading.value = true;
    errorMsg.value = null;
    try {
        const res: any = await $fetch(`${config.public.apiBase}/conversations/${id.value}`, {
            headers: { Authorization: `Bearer ${auth.cookies.get('token')}` }
        });
        conversation.value = res || null;
        messages.value = Array.isArray(res?.messages) ? res.messages : [];
    } catch (e) {
        errorMsg.value = 'Impossible de charger la conversation';
        // eslint-disable-next-line no-console
        console.error(e);
    } finally {
        loading.value = false;
    }
}

async function sendMessage() {
    const content = newMessage.value.trim();
    if (!content) return;
    sending.value = true;
    try {
        const res: any = await $fetch(`${config.public.apiBase}/conversations/${id.value}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.cookies.get('token')}` },
            body: { content }
        });
        if (res?.id) messages.value.push(res);
        newMessage.value = '';
        nextTick(() => scrollToBottom());
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    } finally {
        sending.value = false;
    }
}

function isMine(m: any) {
    try {
        return m?.sender?.id === auth?.user?.id;
    } catch {
        return false;
    }
}

function otherName() {
    const meId = auth?.user?.id;
    const buyer = conversation.value?.buyer;
    const seller = conversation.value?.seller;
    const other = buyer?.id === meId ? seller : buyer;
    return other?.username || other?.name || '—';
}

function scrollToBottom() {
    const el = document.getElementById('messagesEnd');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

onMounted(async () => {
    await loadConversation();
    scrollToBottom();
    poller = setInterval(loadConversation, 5000);
    // Show validation toast if redirected after purchase
    try {
        const created = route.query.created;
        if (created) {
            toast.add({ severity: 'success', summary: 'Conversation créée', detail: 'Votre réservation est confirmée. Vous pouvez discuter maintenant.', life: 5000 });
        }
    } catch {}
    // Mercure live updates
    try {
        const { subscribe } = useMercure();
        const topic = `https://lumeo.app/conversations/${id.value}`;
        const token = auth.cookies.get('token');
        unsubscribe = subscribe(
            [topic],
            (data: any) => {
                if (data?.type === 'message.created' && data?.conversationId === id.value && data?.message) {
                    const m = data.message;
                    messages.value.push({
                        id: m.id,
                        content: m.content,
                        sender: { id: m.senderProfileId },
                        createdAt: m.createdAt
                    });
                    nextTick(() => scrollToBottom());
                }
            },
            { withCredentials: false, accessToken: token }
        );
    } catch {}
});

onBeforeUnmount(() => {
    if (poller) clearInterval(poller);
    if (unsubscribe) unsubscribe();
});

async function completeReservation() {
    try {
        const reservationId = conversation.value?.reservation?.id;
        if (!reservationId) return;
        confirm.require({
            group: 'global',
            message: 'Confirmer la fin de réalisation de ce service ?',
            header: 'Confirmation',
            icon: 'pi pi-question-circle',
            rejectLabel: 'Annuler',
            acceptLabel: 'Continuer',
            accept: () => {
                confirm.close();
                nextTick(() =>
                    confirm.require({
                        group: 'global',
                        message: 'Êtes-vous sûr de vouloir terminer ce service ? Il sera archivé et redeviendra disponible.',
                        header: 'Dernière vérification',
                        icon: 'pi pi-exclamation-triangle',
                        rejectLabel: 'Non',
                        acceptLabel: 'Oui, terminer',
                        accept: async () => {
                            try {
                                await $fetch(`${config.public.apiBase}/reservations/${reservationId}/complete`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${auth.cookies.get('token')}` }
                            });
                            toast.add({ severity: 'success', summary: 'Service terminé', detail: 'La conversation est archivée et le service redevient disponible.', life: 5000 });
                            await loadConversation();
                        } catch (e: any) {
                            const status = e?.status || e?.response?.status;
                            if (status === 404 || status === 405) {
                                try {
                                    await $fetch(`${config.public.apiBase}/conversations/${id.value}/complete`, {
                                        method: 'POST',
                                        headers: { Authorization: `Bearer ${auth.cookies.get('token')}` }
                                    });
                                    toast.add({ severity: 'success', summary: 'Service terminé', detail: 'La conversation est archivée et le service redevient disponible.', life: 5000 });
                                    await loadConversation();
                                } catch (err: any) {
                                    const msg = err?.data?.error || err?.message || 'Impossible de terminer le service.';
                                    toast.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 6000 });
                                }
                            } else {
                                const msg = e?.data?.error || e?.message || 'Impossible de terminer le service.';
                                toast.add({ severity: 'error', summary: 'Erreur', detail: msg, life: 6000 });
                            }
                        }
                    }
                }));
            }
        });
    } catch (e: any) {
        if (!conversation.value?.reservation?.id) {
            toast.add({ severity: 'warn', summary: 'Aucune réservation active', detail: 'Impossible de terminer: aucune réservation associée à cette conversation.', life: 6000 });
            return;
        }
        const msg = e?.data?.error || e?.message || 'Action non disponible pour le moment.';
        toast.add({ severity: 'warn', summary: 'Impossible de terminer', detail: msg, life: 5000 });
    }
}
</script>

<template>
    <div class="p-6 md:p-12 flex flex-col gap-6 rounded-2.5xl md:rounded-4xl bg-white/16 backdrop-blur-[48px] max-w-[calc(100%-3rem)] lg:max-w-none mx-auto shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]">
        <div class="flex items-center justify-between gap-3">
            <div>
                <div class="text-lg font-medium text-surface-0">{{ conversation?.service?.title || 'Conversation' }}</div>
                <div class="text-white/60 text-sm">avec {{ otherName() }}</div>
            </div>
            <div class="flex items-center gap-2">
                <button v-if="isSeller && !isArchived" class="button-blur !bg-green-500/30 hover:!bg-green-500/40 h-auto px-3 py-1 text-sm" @click="completeReservation"><i class="pi pi-check mr-2" /> Terminer le service</button>
                <NuxtLink to="/profile/conversations" class="button-blur h-auto px-3 py-1 text-sm">Retour</NuxtLink>
            </div>
        </div>

        <div class="rounded-2xl border border-white/8 bg-white/6 h-[55vh] overflow-y-auto p-4 space-y-3">
            <div v-for="m in messages" :key="m.id" :class="['flex', isMine(m) ? 'justify-end' : 'justify-start']">
                <div :class="['max-w-[80%] px-3 py-2 rounded-2xl text-sm', isMine(m) ? 'bg-blue-500/30 text-white' : 'bg-white/10 text-white/90']">
                    <div class="whitespace-pre-wrap break-words">{{ m.content }}</div>
                    <div class="text-[10px] text-white/60 mt-1 text-right">{{ new Date(m.createdAt).toLocaleString('fr-FR') }}</div>
                </div>
            </div>
            <div id="messagesEnd"></div>
        </div>

        <div class="flex items-center gap-2">
            <InputText v-model="newMessage" placeholder="Écrire un message…" class="!bg-white/16 !border-white/20 !text-white placeholder:!text-white/80 flex-1" :disabled="isArchived" @keyup.enter="sendMessage" />
            <button class="button-regular" :disabled="sending || !newMessage.trim() || isArchived" @click="sendMessage"><i v-if="sending" class="pi pi-spin pi-spinner mr-2" /> Envoyer</button>
        </div>
    </div>
</template>
