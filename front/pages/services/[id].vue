<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { nextTick } from 'vue';
import { useAuthStore } from '~/store/auth';

const { isWide } = useLayout();
const config = useRuntimeConfig();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const confirm = useConfirm();

const id = computed(() => Number(route.params.id));
const service = ref<any | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

const purchaseMessage = ref('');
const purchasing = ref(false);

const isOwner = computed(() => {
    try {
        return !!(service.value && auth?.user && service.value.byProfile && service.value.byProfile.id === auth.user.id);
    } catch {
        return false;
    }
});

const isAvailable = computed(() => {
    try {
        return service.value?.isAvailable !== false;
    } catch {
        return true;
    }
});

async function loadService() {
    loading.value = true;
    errorMsg.value = null;
    try {
        const res: any = await $fetch(`${config.public.apiBase}/services/${id.value}`);
        service.value = res;
    } catch (e) {
        errorMsg.value = 'Impossible de charger le service';
        console.error(e);
    } finally {
        loading.value = false;
    }
}

async function doPurchase() {
    purchasing.value = true;
    try {
        const res: any = await $fetch(`${config.public.apiBase}/services/${id.value}/purchase`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.cookies.get('token')}` },
            body: { message: purchaseMessage.value }
        });
        const convId = res?.conversation?.id;
        toast.add({ severity: 'success', summary: 'Réservation confirmée', detail: convId ? `Conversation #${convId} créée` : 'Réservation effectuée', life: 5000 });
        if (convId) {
            router.push({ path: `/profile/conversations/${convId}`, query: { created: '1' } });
        }
    } catch (e: any) {
        const status = e?.status || e?.response?.status;
        const raw = (e?.data?.error || e?.message || '').toString();
        let detail = 'Réservation impossible';
        const lower = raw.toLowerCase();
        if (status === 409 || lower.includes('not available')) detail = 'Ce service est actuellement indisponible.';
        else if (lower.includes('you cannot purchase your own service')) detail = 'Vous ne pouvez pas réserver votre propre service.';
        else if (lower.includes('insufficient credits')) detail = 'Crédits insuffisants pour réserver ce service.';
        else if (lower.includes('not published')) detail = "Ce service n'est pas publié.";
        else if (raw) detail = raw;
        toast.add({ severity: 'error', summary: 'Erreur', detail, life: 6000 });
    } finally {
        // Toujours rafraîchir pour refléter disponibilité/crédits
        await loadService();
        purchasing.value = false;
    }
}

async function purchase() {
    if (!auth.hasToken()) {
        toast.add({ severity: 'warn', summary: 'Connexion requise', detail: 'Veuillez vous connecter pour réserver.', life: 4000 });
        return navigateTo('/login');
    }
    confirm.require({
        group: 'global',
        message: 'Confirmer la réservation de ce service ?',
        header: 'Confirmation',
        icon: 'pi pi-question-circle',
        rejectLabel: 'Annuler',
        acceptLabel: 'Continuer',
        accept: () => {
            confirm.close();
            nextTick(() => {
                confirm.require({
                    group: 'global',
                    message: 'Êtes-vous sûr de vouloir réserver ce service ? Cette action débitera vos LumCoins.',
                    header: 'Dernière vérification',
                    icon: 'pi pi-exclamation-triangle',
                    rejectLabel: 'Non',
                    acceptLabel: 'Oui, réserver',
                    accept: () => doPurchase()
                });
            });
        }
    });
}

function goEdit() {
    router.push(`/services/${id.value}/edit`);
}

async function removeService() {
    if (!auth.hasToken()) {
        return navigateTo('/login');
    }
    confirm.require({
        group: 'global',
        message: 'Supprimer ce service ? Cette action est irréversible.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Annuler',
        acceptLabel: 'Oui, supprimer',
        accept: async () => {
            try {
                await $fetch(`${config.public.apiBase}/services/${id.value}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${auth.cookies.get('token')}` }
                });
                toast.add({ severity: 'success', summary: 'Supprimé', detail: 'Le service a été supprimé.', life: 4000 });
                router.push('/services');
            } catch (e: any) {
                const detail = e?.data?.error || 'Suppression impossible';
                toast.add({ severity: 'error', summary: 'Erreur', detail, life: 5000 });
            }
        }
    });
}

onMounted(loadService);
</script>

<template>
    <AnimatedContainer :className="isWide ? 'bg-main-gradient shadow-black-card' : 'pt-6'">
        <div class="container">
            <div :class="`relative ${isWide ? '' : 'bg-main-gradient rounded-3xl lg:rounded-4xl shadow-black-card'}`">
                <div class="relative z-20 px-6">
                    <Navbar />

                    <div class="py-10 lg:py-16 max-w-[60rem] mx-auto">
                        <div v-if="loading" class="text-white/80">Chargement...</div>
                        <div v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</div>
                        <div v-else-if="service" class="bg-white/4 border border-white/8 backdrop-blur-[48px] rounded-3xl p-6">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <h1 class="text-3xl lg:text-5xl font-semibold text-surface-0">{{ service.title }}</h1>
                                    <div class="text-white/70 mt-2">{{ service.description }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-surface-0 text-2xl font-semibold">{{ service.cost }} L</div>
                                    <div class="text-white/70 mt-1 flex items-center justify-end gap-2">
                                        <i :class="['pi', service.isRemote ? 'pi-desktop' : 'pi-map-marker']" />
                                        <span>{{ service.isRemote ? 'À distance' : 'Présentiel' }}</span>
                                    </div>
                                    <div class="mt-2">
                                        <span v-if="!isAvailable" class="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300">Indisponible</span>
                                        <span v-else class="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300">Disponible</span>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div v-if="!isOwner" class="flex flex-col gap-3">
                                    <label class="text-surface-0">Message au vendeur (optionnel)</label>
                                    <Textarea v-model="purchaseMessage" rows="4" autoResize class="!bg-white/16 !border-white/20 !text-white placeholder:!text-white/80" />
                                    <button class="button-regular mt-2" :disabled="purchasing || !isAvailable" @click="purchase"><i v-if="purchasing" class="pi pi-spin pi-spinner mr-2" /> Réserver ce service</button>
                                </div>
                                <div class="flex flex-col gap-3 items-end">
                                    <div class="flex items-center gap-2">
                                        <button v-if="isOwner" class="button-blur" @click="goEdit"><i class="pi pi-pencil mr-2" /> Modifier</button>
                                        <button v-if="isOwner" class="button-blur !bg-red-500/30 hover:!bg-red-500/40" @click="removeService"><i class="pi pi-trash mr-2" /> Supprimer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AnimatedContainer>
</template>
