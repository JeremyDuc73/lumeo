<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

definePageMeta({
    layout: 'account-details'
});

const config = useRuntimeConfig();
const authStore = useAuthStore();
const orders = reactive<{ id: number; amount: number; coins: number; createdAt: string }[]>([]);

authStore.checkAuth();

async function getOrders() {
    try {
        const response: any = await $fetch(`${config.public.apiBase}/myorders`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authStore.cookies.get('token')}`
            }
        });
        orders.splice(0, orders.length, ...response);
    } catch (error) {
        console.error('Erreur :', error);
    }
}

onMounted(() => {
    getOrders();
});

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
};
</script>

<template>
    <div class="p-6 md:p-12 flex flex-col gap-10 rounded-2.5xl md:rounded-4xl bg-white/16 backdrop-blur-[48px] max-w-[calc(100%-3rem)] lg:max-w-none mx-auto shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]">
        <div class="flex md:flex-row justify-between flex-col items-start gap-8 pb-8">
            <div class="text-lg font-medium text-surface-0">Historique des paiements</div>
            <ScrollPanel style="height: 200px">
                <div class="w-full md:flex-[0.55] flex flex-col gap-6">
                    <div v-for="order in orders.slice().reverse()" :key="order.id" class="flex flex-wrap gap-2 items-center justify-between pr-4">
                        <div class="text-surface-0">{{ formatDate(order.createdAt) }} - {{ order.amount }} € = {{ order.coins }} LumCoins</div>
                        <button class="button-blur h-auto py-1 px-3 text-sm">
                            Télécharger
                            <i class="pi pi-cloud-download leading-none !text-base"></i>
                        </button>
                    </div>
                </div>
            </ScrollPanel>
        </div>
    </div>
</template>
