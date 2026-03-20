<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/store/auth';
import { useNotificationsStore } from '~/store/notifications';
import { useMercure } from '~/composables/useMercure';

const authStore = useAuthStore();
const notifStore = useNotificationsStore();
const toast = useToast();

defineProps<{
    className?: string;
}>();

const router = useRouter();
const pathname = computed(() => router.currentRoute.value.path);

// Simple navigation

const navLinkBase = 'inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-3 transition-all text-white/90 hover:text-white hover:bg-white/10';

const config = useRuntimeConfig();
const url = computed(() => {
    const imageName = authStore.user?.image?.imageName;
    if (!imageName) return '/profile.webp';
    const base = config.public.serverBase || '';
    return `${base}/images/${imageName}`;
});

function extractMessageText(data: any): string {
    if (!data) return '';
    // Common structures
    const candidates = [
        data?.message?.content,
        data?.message?.body,
        data?.message?.text,
        data?.payload?.message?.content,
        data?.payload?.message?.body,
        data?.payload?.message?.text,
        data?.payload?.content,
        data?.payload?.body,
        data?.content,
        data?.body,
        data?.lastMessage?.content,
        data?.lastMessage?.body,
        data?.text,
        data?.preview,
        typeof data?.message === 'string' ? data.message : undefined
    ];
    const found = candidates.find((v) => typeof v === 'string' && v.trim().length > 0) as string | undefined;
    if (!found) return '';
    return found.length > 140 ? `${found.slice(0, 140)}…` : found;
}

// Notifications via Mercure
let unsubscribe: (() => void) | null = null;
function startNotifSubscription() {
    try {
        if (unsubscribe) {
            try {
                unsubscribe();
            } catch {}
            unsubscribe = null;
        }
        if (!authStore.hasToken()) return;
        const meId = authStore?.user?.id;
        if (!meId) return;
        const { subscribe } = useMercure();
        const topic = `https://lumeo.app/profiles/${meId}/notifications`;
        const token = authStore.cookies.get('token');
        unsubscribe = subscribe(
            [topic],
            async (data: any) => {
                try {
                    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                    const type = data?.event || data?.type || 'notification';
                    const link = data?.conversationId ? `/profile/conversations/${data.conversationId}` : undefined;
                    const title =
                        type === 'message.created'
                            ? 'Nouveau message'
                            : type === 'reservation.created'
                              ? 'Nouvelle réservation'
                              : type === 'reservation.completed'
                                ? 'Service terminé'
                                : 'Notification';
                    let detail = extractMessageText(data);
                    if (type === 'message.created') {
                        // Always fetch conversation to ensure we show the newest message content
                        try {
                            const convId = data?.conversationId || data?.payload?.conversationId || data?.conversation?.id || data?.message?.conversationId;
                            if (convId) {
                                const conv: any = await $fetch(`${config.public.apiBase}/conversations/${convId}`);
                                const msgs = Array.isArray(conv?.messages) ? conv.messages : [];
                                const last = msgs.length > 0 ? msgs[msgs.length - 1] : null;
                                const content = last?.content || last?.body || last?.text || '';
                                if (content) {
                                    detail = content.length > 140 ? `${content.slice(0, 140)}…` : content;
                                }
                            }
                        } catch {
                            // fallback to current extraction if fetch fails
                        }
                    } else if (type === 'reservation.created') {
                        detail = data?.serviceTitle ? `Réservation pour ${data.serviceTitle}` : detail;
                    } else if (type === 'reservation.completed') {
                        detail = data?.serviceTitle ? `Service terminé: ${data.serviceTitle}` : detail;
                    }
                    notifStore.add({ id, type, title, detail, createdAt: new Date().toISOString(), link, raw: data });
                    toast.add({ severity: 'info', summary: title, detail: detail || '—', life: 5000 });
                } catch {}
            },
            { withCredentials: false, accessToken: token }
        );
    } catch {}
}

onMounted(async () => {
    try {
        if (authStore.hasToken() && !authStore.user?.id) {
            await authStore.fetchUser();
        }
        startNotifSubscription();
    } catch {}
});

watch(
    () => authStore.user?.id,
    () => {
        startNotifSubscription();
    }
);

onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe();
});

const showNotifs = ref(false);
function toggleNotifs() {
    showNotifs.value = !showNotifs.value;
    if (showNotifs.value) notifStore.markAllRead();
}
</script>

<template>
    <nav :class="twMerge('flex items-center relative z-[99999] justify-between py-6 w-[calc(100%-3rem)] max-h-[75px] mx-auto border-b border-white/10 border-dashed', className)">
        <NuxtLink to="/">
            <Logo />
        </NuxtLink>
        <ul class="hidden lg:flex items-center gap-2">
            <li>
                <NuxtLink :to="'/'" :class="twMerge(navLinkBase, pathname === '/' ? 'bg-white/16 text-white' : '')">Accueil</NuxtLink>
            </li>
            <li>
                <NuxtLink :to="'/services'" :class="twMerge(navLinkBase, pathname === '/services' ? 'bg-white/16 text-white' : '')">Services</NuxtLink>
            </li>
        </ul>
        <ul class="hidden lg:flex items-center">
            <ClientOnly>
                <li v-if="authStore.hasToken()" class="relative mr-2">
                    <button type="button" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/16 hover:bg-white/24 text-white/90" @click="toggleNotifs">
                        <i class="pi pi-bell" />
                        <span v-if="notifStore.unread > 0" class="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full h-4 min-w-4 flex items-center justify-center px-1">{{ notifStore.unread }}</span>
                    </button>
                    <div v-if="showNotifs" class="absolute right-0 mt-2 w-80 max-h-96 overflow-auto p-2 rounded-2xl shadow-blue-card bg-surface-0 border border-white/12 z-[999]">
                        <div class="flex items-center justify-between px-2 py-1">
                            <div class="text-surface-500 font-medium">Notifications</div>
                            <button class="text-xs text-surface-500 hover:text-surface-950" @click="notifStore.clear()">Vider</button>
                        </div>
                        <div v-if="notifStore.items.length === 0" class="text-surface-400 text-sm px-2 py-3">Aucune notification</div>
                        <div v-for="n in notifStore.items" :key="n.id" class="px-2 py-2 rounded-xl hover:bg-surface-100/60">
                            <div class="text-surface-950 font-medium text-sm">{{ n.title }}</div>
                            <div class="text-surface-500 text-xs">{{ new Date(n.createdAt).toLocaleString('fr-FR') }}</div>
                            <div class="text-surface-600 text-sm mt-1">{{ n.detail }}</div>
                            <NuxtLink v-if="n.link" :to="n.link" class="text-xs text-blue-500 hover:underline">Ouvrir</NuxtLink>
                        </div>
                    </div>
                </li>
                <li v-if="authStore.hasToken()">
                    <NuxtLink to="/profile/conversations" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/16 hover:bg-white/24 text-white/90 mr-2">
                        <i class="pi pi-comments" />
                    </NuxtLink>
                </li>
                <li v-if="authStore.hasToken()">
                    <NuxtLink to="/profile" class="button-regular">
                        <div class="w-8 h-8 flex items-center justify-center rounded-full bg-white/16 shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]">
                            <img :src="url" alt="Image du profil" class="w-full h-full object-cover object-center rounded-full" />
                        </div>
                        Profil
                    </NuxtLink>
                </li>
                <li v-if="!authStore.hasToken()">
                    <NuxtLink to="/login" class="button-regular lg:me-3"> Se connecter </NuxtLink>
                </li>
                <li v-if="!authStore.hasToken()">
                    <NuxtLink to="/register" class="button-blur"> S'inscrire </NuxtLink>
                </li>
            </ClientOnly>
        </ul>
        <div class="relative lg:hidden block">
            <a
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveActiveClass: 'animate-fadeout', leaveToClass: 'hidden', hideOnOutsideClick: true }"
                class="w-10 h-10 cursor-pointer inline-flex items-center justify-center rounded-full bg-surface-0 text-surface-950 hover:bg-surface-200"
            >
                <i class="pi pi-bars"></i>
            </a>
            <div class="hidden absolute top-[calc(100%+0.5rem)] max-h-96 overflow-auto left-auto !right-0 w-60 p-2 rounded-2xl shadow-blue-card flex flex-col bg-surface-0">
                <NuxtLink to="/" class="py-2 px-3 rounded-lg hover:bg-surface-200 font-medium text-surface-500 hover:text-surface-950">Accueil</NuxtLink>
                <NuxtLink to="/services" class="py-2 px-3 rounded-lg hover:bg-surface-200 font-medium text-surface-500 hover:text-surface-950">Services</NuxtLink>
                <ClientOnly>
                    <NuxtLink v-if="authStore.hasToken()" to="/profile/conversations" class="py-2 px-3 rounded-lg hover:bg-surface-200 font-medium text-surface-500 hover:text-surface-950">Conversations</NuxtLink>
                </ClientOnly>
            </div>
        </div>
    </nav>
</template>
