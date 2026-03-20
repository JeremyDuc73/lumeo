<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

const { isWide } = useLayout();

const price = ref(10);

const pricingData = [
    {
        badge: 'Pack Découverte',
        price: 10,
        coins: 200
    },
    {
        badge: 'Pack Classique',
        price: 30,
        coins: 700
    },
    {
        badge: 'Pack Expert',
        price: 60,
        coins: 1400
    }
];

const authStore = useAuthStore();

async function buyPack(amount: number, coins: number) {
    try {
        const response: any = await $fetch(`${useRuntimeConfig().public.apiBase}/payment/create`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authStore.cookies.get('token')}`
            },
            body: JSON.stringify({ amount, coins })
        });
        window.location.href = response.checkoutUrl;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
}
</script>

<template>
    <AnimatedContainer>
        <div :class="isWide ? 'bg-main-gradient shadow-black-card' : 'pt-6'">
            <div class="container">
                <div :class="isWide ? '' : 'rounded-3xl lg:rounded-4xl bg-main-gradient shadow-black-card'">
                    <div class="mt-18 pb-16 max-w-full mx-auto lg:max-w-none">
                        <h1 class="title text-4xl lg:text-6xl text-center mx-auto !leading-tight pt-10">
                            Découvrez
                            <br />
                            Nos packs de LumCoins
                        </h1>
                        <p class="description max-w-2xl text-center mx-auto mt-6">Grâce à ces packs vous pourrez découvrir et faire la rencontre de passionnés et gagner du temps au quotidien.</p>
                        <div class="mt-24 lg:mt-16 flex lg:flex-row flex-col max-w-xl lg:max-w-full mx-auto lg:gap-0 gap-16 lg:divide-x divide-white/12 divide-dashed border-b border-white/12 border-dashed">
                            <AnimatedContainer v-for="(item, index) in pricingData" :key="index" :delay="index * 100" className="lg:p-6 flex-1">
                                <div class="flex flex-col gap-8 pb-8">
                                    <div
                                        class="w-fit min-w-8 py-1 px-4 bg-white/16 backdrop-blur-[48px] border border-white/8 rounded-full flex items-center justify-center shadow-[0px-2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                                    >
                                        <span class="title text-base font-medium">{{ item.badge }}</span>
                                    </div>
                                    <div class="inline-flex items-end gap-3">
                                        <span class="title text-6xl font-semibold">{{ item.price }} €</span>
                                        <span class="py-2 text-2xl text-white/64">= {{ item.coins }} LumCoins</span>
                                    </div>
                                    <button class="button-regular" @click="buyPack(item.price, item.coins)">Acheter</button>
                                </div>
                            </AnimatedContainer>
                        </div>
                        <AnimatedContainer className="lg:p-6 flex-1">
                            <div class="flex flex-col m-auto gap-8 pb-8 border-b border-white/12 border-dashed w-[50%]">
                                <div
                                    class="w-fit min-w-8 py-1 px-4 bg-white/16 backdrop-blur-[48px] border border-white/8 rounded-full flex items-center justify-center shadow-[0px-2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                                >
                                    <span class="title text-base font-medium">Pack personnalisé</span>
                                </div>
                                <div class="inline-flex items-end gap-3">
                                    <span class="title text-6xl font-semibold">{{ price }} €</span>
                                    <span class="py-2 text-2xl text-white/64">= {{ price * 20 }} LumCoins</span>
                                </div>
                                <Slider
                                    v-model="price"
                                    :min="10"
                                    :max="300"
                                    :step="5"
                                    :pt="{
                                        root: 'bg-white/20 dark:bg-white/20',
                                        range: 'bg-blue-500',
                                        handle: 'bg-blue-600 border-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.25)] hover:shadow-[0_0_0_5px_rgba(59,130,246,0.25)]'
                                    }"
                                />
                                <button class="button-regular" @click="buyPack(price, price * 20)">Acheter</button>
                            </div>
                        </AnimatedContainer>
                    </div>
                </div>
            </div>
        </div>
    </AnimatedContainer>
</template>
