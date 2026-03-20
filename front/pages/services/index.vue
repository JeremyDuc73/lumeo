<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

const { isWide } = useLayout();
const config = useRuntimeConfig();
const toast = useToast();
const router = useRouter();
const auth = useAuthStore();

const services = ref<any[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

// Filters
const q = ref('');
const filterRemote = ref<'all' | 'remote' | 'inPerson'>('all');
const maxPrice = ref<number>(0);

const maxDetectedPrice = computed(() => {
    if (!services.value.length) return 0;
    return services.value.reduce((max, s) => Math.max(max, Number(s.cost ?? 0)), 0);
});

// Initialize slider to the detected maximum ONCE after services load
const initializedMaxPrice = ref(false);
watch(
    () => services.value,
    (list) => {
        if (!initializedMaxPrice.value && Array.isArray(list) && list.length) {
            maxPrice.value = maxDetectedPrice.value;
            initializedMaxPrice.value = true;
        }
    },
    { immediate: false }
);

const filtered = computed(() => {
    const term = q.value.trim().toLowerCase();
    return services.value
        .filter((s) => {
            // Exclude own services from the public list
            try {
                const myId = auth?.user?.id;
                const ownerId = s?.byProfile?.id;
                if (myId && ownerId && myId === ownerId) return false;
            } catch {}
            // Exclude reserved (unavailable) services
            if (s?.isAvailable === false) return false;
            if (term) {
                const inTitle = (s.title || '').toLowerCase().includes(term);
                const inDesc = (s.description || '').toLowerCase().includes(term);
                if (!inTitle && !inDesc) return false;
            }
            if (filterRemote.value !== 'all') {
                const isRemote = !!s.isRemote;
                if (filterRemote.value === 'remote' && !isRemote) return false;
                if (filterRemote.value === 'inPerson' && isRemote) return false;
            }
            const cost = Number(s.cost ?? 0);
            if (!Number.isNaN(cost) && cost > maxPrice.value) return false;
            return true;
        })
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
});

function typeClass(key: 'all' | 'remote' | 'inPerson') {
    return ['px-4 py-1 rounded-full text-sm transition', filterRemote.value === key ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'];
}

async function loadServices() {
    loading.value = true;
    errorMsg.value = null;
    try {
        const res: any = await $fetch(`${config.public.apiBase}/services`);
        services.value = Array.isArray(res) ? res : [];
    } catch (e) {
        errorMsg.value = 'Impossible de charger les services';
        console.error(e);
        toast.add({ severity: 'error', summary: 'Erreur', detail: errorMsg.value, life: 5000 });
    } finally {
        loading.value = false;
    }
}

function gotoDetail(id: number) {
    router.push(`/services/${id}`);
}

function gotoCreate() {
    router.push('/services/create');
}

onMounted(loadServices);
</script>

<template>
    <AnimatedContainer :className="isWide ? 'bg-main-gradient shadow-black-card' : 'pt-6'">
        <div class="container">
            <div :class="`relative ${isWide ? '' : 'bg-main-gradient rounded-3xl lg:rounded-4xl shadow-black-card'}`">
                <div class="relative z-20 px-6">
                    <Navbar />

                    <div class="py-10 lg:py-16 max-w-[80rem] mx-auto">
                        <div class="flex items-start gap-4 justify-between mb-6">
                            <div>
                                <h1 class="text-3xl lg:text-5xl font-semibold text-surface-0">Services</h1>
                                <p class="text-white/64 mt-2">Parcourez les services publiés et réservez en un clic.</p>
                            </div>
                            <div v-if="auth.hasToken()" class="flex items-center gap-3">
                                <button class="button-regular" @click="gotoCreate"><i class="pi pi-plus mr-2" /> Créer un service</button>
                            </div>
                        </div>

                        <div class="bg-white/4 border border-white/8 backdrop-blur-[48px] rounded-2.5xl lg:rounded-4xl p-4 md:p-6 mb-8">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div class="flex flex-col gap-2">
                                    <label class="text-surface-0">Recherche</label>
                                    <InputText v-model="q" placeholder="Titre, description..." class="!bg-white/16 !rounded-full !py-2 !px-4 !text-white/90 !border-white/12 placeholder:!text-white/90" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-surface-0">Type</label>
                                    <div class="flex items-center gap-2 p-1 rounded-full border border-white/12 bg-white/8 backdrop-blur-[48px]">
                                        <button type="button" :class="typeClass('all')" @click="filterRemote = 'all'">Tous</button>
                                        <button type="button" :class="typeClass('remote')" @click="filterRemote = 'remote'">À distance</button>
                                        <button type="button" :class="typeClass('inPerson')" @click="filterRemote = 'inPerson'">Présentiel</button>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-2 md:col-span-2">
                                    <div class="text-surface-0 flex items-center justify-between">
                                        <span class="text-surface-0">Prix max (L)</span>
                                        <span class="text-white/64">{{ maxPrice }} L</span>
                                    </div>
                                    <Slider
                                        v-model="maxPrice"
                                        :min="0"
                                        :max="maxDetectedPrice || 100"
                                        :step="5"
                                        :pt="{
                                            root: 'bg-white/20 dark:bg-white/20',
                                            range: 'bg-blue-500',
                                            handle: 'bg-blue-600 border-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.25)] hover:shadow-[0_0_0_5px_rgba(59,130,246,0.25)]'
                                        }"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div v-if="loading" class="text-white/80">Chargement...</div>
                            <div v-else>
                                <div v-if="errorMsg" class="text-red-400">{{ errorMsg }}</div>
                                <div v-else>
                                    <div v-if="filtered.length === 0" class="text-white/70">Aucun service trouvé.</div>
                                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div v-for="s in filtered" :key="s.id" class="bg-white/4 border border-white/8 backdrop-blur-[48px] rounded-3xl p-4 cursor-pointer hover:border-white/20 transition" @click="gotoDetail(s.id)">
                                            <div class="flex items-start justify-between">
                                                <div class="text-surface-0 text-xl font-semibold">{{ s.title }}</div>
                                                <div class="text-surface-0 text-lg">{{ s.cost }} L</div>
                                            </div>
                                            <div class="text-white/70 mt-2 line-clamp-3">{{ s.description }}</div>
                                            <div class="mt-4 text-sm text-white/60 flex items-center gap-3">
                                                <i :class="['pi', s.isRemote ? 'pi-desktop' : 'pi-map-marker']" />
                                                <span>{{ s.isRemote ? 'À distance' : 'Présentiel' }}</span>
                                            </div>
                                        </div>
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
