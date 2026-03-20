<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'vue-router';

const router = useRouter();
const pathname = computed(() => router.currentRoute.value.path);

const accountNavData = [
    {
        label: 'Compte',
        to: '/profile/details'
    },
    {
        label: 'Paiements & Factures',
        to: '/profile/orders'
    },
    {
        label: 'Mes services',
        to: '/profile/services'
    },
    {
        label: 'Réservations',
        to: '/profile/reservations'
    }
];
</script>

<template>
    <div
        class="w-full flex md:flex-row flex-col items-center gap-2 p-2 max-w-[calc(100%-3rem)] lg:max-w-none mx-auto rounded-3xl md:rounded-full bg-white/16 backdrop-blur-[48px] shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
    >
        <NuxtLink
            v-for="(item, index) in accountNavData"
            :key="index"
            :to="item.to"
            :class="
                twMerge(
                    'md:flex-1 w-full h-10 flex items-center justify-center rounded-full backdrop-blur-[48px] transition-all select-none',
                    pathname === item.to ? 'bg-white/16 text-white shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]' : 'text-white/64 hover:bg-white/10'
                )
            "
        >
            <span class="font-medium">{{ item.label }}</span>
        </NuxtLink>
    </div>
</template>
