<script setup lang="ts">
const { isWide } = useLayout();
const config = useRuntimeConfig();
const latest = ref<any[]>([]);
const loadingLatest = ref(false);
const latestError = ref<string | null>(null);

async function loadLatest() {
    loadingLatest.value = true;
    latestError.value = null;
    try {
        const res: any = await $fetch(`${config.public.apiBase}/services`);
        const list = Array.isArray(res) ? res : [];
        latest.value = list
            .filter((s: any) => s?.isAvailable !== false)
            .sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1))
            .slice(0, 6);
    } catch (e) {
        latestError.value = 'Impossible de charger les derniers services';
    } finally {
        loadingLatest.value = false;
    }
}

onMounted(loadLatest);
</script>

<template>
    <div :class="isWide ? '' : 'pt-6'">
        <div class="container">
            <div class="relative">
                <div class="relative z-20 px-6">
                    <div class="absolute left-0 right-0 top-0 h-[75px] bg-blue-600/95 dark:bg-surface-900/90 rounded-b-2xl z-10"></div>
                    <div class="relative z-20">
                        <Navbar />
                    </div>

                    <!-- HERO -->
                    <section class="pt-28 lg:pt-36 pb-6">
                        <AnimatedContainer enterClass="animate-zoomfadein">
                            <div class="max-w-5xl mx-auto text-center">
                                <h1 class="text-4xl lg:text-7xl font-semibold !leading-tight text-gray-900 dark:text-white">Des micro‑services instantanés, simples et accessibles</h1>
                                <p class="mt-6 text-gray-600 dark:text-white/72 text-lg lg:text-xl">Crée, découvre et réserve des services en quelques secondes. Paiement intégré, conversation en temps réel, notifications instantanées.</p>
                                <div class="mt-10 flex items-center justify-center gap-4">
                                    <NuxtLink to="/services" class="button-regular">Découvrir les services</NuxtLink>
                                    <NuxtLink to="/register" class="button-blur">Créer un compte</NuxtLink>
                                </div>
                            </div>
                        </AnimatedContainer>
                    </section>

                    <!-- LATEST SERVICES -->
                    <section class="py-8">
                        <AnimatedContainer enterClass="animate-slidefadein" :delay="120">
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">Derniers services</h2>
                                <NuxtLink to="/services" class="button-regular">Voir tous</NuxtLink>
                            </div>
                            <div v-if="loadingLatest" class="text-gray-600 dark:text-white/72">Chargement...</div>
                            <div v-else-if="latestError" class="text-red-500">{{ latestError }}</div>
                            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <NuxtLink v-for="s in latest" :key="s.id" :to="`/services/${s.id}`" class="p-5 rounded-2xl bg-white border border-gray-200 dark:bg-white/10 dark:border-white/12 block hover:shadow-sm transition">
                                    <div class="flex items-start justify-between">
                                        <div class="text-gray-900 dark:text-white text-lg font-semibold">{{ s.title }}</div>
                                        <div class="text-gray-900 dark:text-white text-base">{{ s.cost }} L</div>
                                    </div>
                                    <p class="mt-2 text-gray-600 dark:text-white/72 line-clamp-3">{{ s.description }}</p>
                                    <div class="mt-4 text-sm text-gray-500 dark:text-white/60 flex items-center gap-2">
                                        <i :class="['pi', s.isRemote ? 'pi-desktop' : 'pi-map-marker']" />
                                        <span>{{ s.isRemote ? 'À distance' : 'Présentiel' }}</span>
                                    </div>
                                </NuxtLink>
                            </div>
                        </AnimatedContainer>
                    </section>

                    <!-- FEATURES GRID -->
                    <section class="py-8">
                        <AnimatedContainer enterClass="animate-slidefadein" :delay="100">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="p-6 rounded-3xl bg-white border border-gray-200 dark:bg-white/10 dark:border-white/12">
                                    <div class="flex items-center gap-3 text-gray-900 dark:text-white">
                                        <i class="pi pi-bolt text-xl" />
                                        <h3 class="text-xl font-semibold">Réservation immédiate</h3>
                                    </div>
                                    <p class="mt-3 text-gray-600 dark:text-white/72">Publie ou réserve un service en quelques clics. Un flux clair et rapide, sans friction.</p>
                                </div>
                                <div class="p-6 rounded-3xl bg-white border border-gray-200 dark:bg-white/10 dark:border-white/12">
                                    <div class="flex items-center gap-3 text-gray-900 dark:text-white">
                                        <i class="pi pi-comments text-xl" />
                                        <h3 class="text-xl font-semibold">Chat en temps réel</h3>
                                    </div>
                                    <p class="mt-3 text-gray-600 dark:text-white/72">Discute en direct avec le vendeur ou l’acheteur. Les nouveaux messages arrivent instantanément.</p>
                                </div>
                                <div class="p-6 rounded-3xl bg-white border border-gray-200 dark:bg-white/10 dark:border-white/12">
                                    <div class="flex items-center gap-3 text-gray-900 dark:text-white">
                                        <i class="pi pi-bell text-xl" />
                                        <h3 class="text-xl font-semibold">Notifications live</h3>
                                    </div>
                                    <p class="mt-3 text-gray-600 dark:text-white/72">Sois notifié dès qu’une réservation est créée ou qu’un message arrive. Basé sur Mercure (SSE).</p>
                                </div>
                            </div>
                        </AnimatedContainer>
                    </section>

                    <!-- HOW IT WORKS -->
                    <section class="py-8">
                        <AnimatedContainer enterClass="animate-slidefadeinright" :delay="150">
                            <div class="bg-white border border-gray-200 dark:bg-white/10 dark:border-white/12 rounded-3xl p-6 lg:p-10">
                                <h2 class="text-2xl lg:text-4xl font-semibold text-gray-900 dark:text-white text-center">Comment ça marche ?</h2>
                                <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div class="p-5 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-white/6 dark:border-white/10">
                                        <div class="flex items-center gap-3 text-gray-900 dark:text-white">
                                            <i class="pi pi-search text-lg" />
                                            <h3 class="text-lg font-semibold">1. Explore</h3>
                                        </div>
                                        <p class="mt-2 text-gray-600 dark:text-white/72">Parcours les services publiés, filtre par type et prix.</p>
                                    </div>
                                    <div class="p-5 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-white/6 dark:border-white/10">
                                        <div class="flex items-center gap-3 text-gray-900 dark:text-white">
                                            <i class="pi pi-shopping-bag text-lg" />
                                            <h3 class="text-lg font-semibold">2. Réserve</h3>
                                        </div>
                                        <p class="mt-2 text-gray-600 dark:text-white/72">Confirme en un clic. Une conversation est créée automatiquement.</p>
                                    </div>
                                    <div class="p-5 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-white/6 dark:border-white/10">
                                        <div class="flex items-center gap-3 text-gray-900 dark:text-white">
                                            <i class="pi pi-send text-lg" />
                                            <h3 class="text-lg font-semibold">3. Échange</h3>
                                        </div>
                                        <p class="mt-2 text-gray-600 dark:text-white/72">Discute en temps réel et reçois des mises à jour instantanées.</p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedContainer>
                    </section>

                    <!-- CTA -->
                    <section class="py-14">
                        <AnimatedContainer enterClass="animate-slidefadeinleft" :delay="200">
                            <div class="text-center">
                                <h3 class="text-2xl lg:text-4xl font-semibold text-gray-900 dark:text-white">Prêt à commencer ?</h3>
                                <p class="mt-3 text-gray-600 dark:text-white/72">Découvre les services disponibles ou crée le tien dès maintenant.</p>
                                <div class="mt-8 flex items-center justify-center gap-4">
                                    <NuxtLink to="/services" class="button-regular">Explorer les services</NuxtLink>
                                    <NuxtLink to="/services/create" class="button-blur">Publier un service</NuxtLink>
                                </div>
                            </div>
                        </AnimatedContainer>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>
