<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
    <footer class="border-t border-gray-200 dark:border-white/12 bg-white dark:bg-surface-900">
        <div class="container py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <NuxtLink to="/" class="inline-flex items-center gap-2">
                        <span class="sr-only">Lumeo</span>
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_2px_8px_rgba(59,130,246,0.25)]">
                                <IconLogosLumeo class="block w-5 h-5" />
                            </div>
                            <span class="text-blue-600 dark:text-white text-xl font-semibold">Lumeo</span>
                        </div>
                    </NuxtLink>
                    <p class="mt-4 text-gray-600 dark:text-white/72 max-w-xs">Marketplace de micro‑services. Réserve en quelques clics, discute en temps réel, sois notifié instantanément.</p>
                </div>
                <div>
                    <h4 class="text-gray-900 dark:text-white font-semibold">Produit</h4>
                    <ul class="mt-3 space-y-2 text-gray-600 dark:text-white/72">
                        <li><NuxtLink to="/services" class="hover:text-blue-600 dark:hover:text-white">Services</NuxtLink></li>
                        <li><NuxtLink to="/services/create" class="hover:text-blue-600 dark:hover:text-white">Publier un service</NuxtLink></li>
                        <li><NuxtLink to="/profile" class="hover:text-blue-600 dark:hover:text-white">Mon profil</NuxtLink></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-gray-900 dark:text-white font-semibold">Ressources</h4>
                    <ul class="mt-3 space-y-2 text-gray-600 dark:text-white/72">
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-white">Centre d'aide</a></li>
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-white">FAQ</a></li>
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-white">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-gray-900 dark:text-white font-semibold">Légal</h4>
                    <ul class="mt-3 space-y-2 text-gray-600 dark:text-white/72">
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-white">Conditions d'utilisation</a></li>
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-white">Politique de confidentialité</a></li>
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-white">Cookies</a></li>
                    </ul>
                </div>
            </div>

            <div class="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <p class="text-sm text-gray-500 dark:text-white/60">© {{ year }} Lumeo. Tous droits réservés.</p>
                <div class="flex items-center gap-3">
                    <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/16">
                        <i class="pi pi-twitter" />
                    </a>
                    <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/16">
                        <i class="pi pi-github" />
                    </a>
                    <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/16">
                        <i class="pi pi-linkedin" />
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>
