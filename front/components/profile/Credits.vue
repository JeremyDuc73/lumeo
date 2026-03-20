<script setup lang="ts">
import BrainBoxIcon from '../icon/Brain-Box.vue';
import ServerBoxIcon from '../icon/Server-Box.vue';
import { useAuthStore } from '~/store/auth';
import Euro from '~/components/icon/Euro.vue';

const authStore = useAuthStore();

const enterpriseFeaturesData = [
    {
        icon: ServerBoxIcon,
        title: 'Gagner des LumCoins',
        description: "En réalisant des services pour d'autres utilisateurs vous pouvez gagner des crédits que vous pourrez à votre tour utiliser."
    },
    {
        icon: Euro,
        title: 'Acheter des LumCoins',
        description: "Lumeo poropose plusieurs packs qui permettent d'acquérir des crédits afin d'avoir accès aux services de vos rêves plus simplement."
    },
    {
        icon: BrainBoxIcon,
        title: 'Utiliser vos LumCoins',
        description: "Sur Lumeo, il n'y a qu'une seule monnaie possible pour échanger des services et des suppléments, les LumCoins. Que vous les ayez obtenus en délivrant un service ou avec l'un de nos packs, ils sont similaires"
    }
];
</script>

<template>
    <div class="container lg:mt-40 mt-24">
        <div class="icon-box">
            <IconLogosLumeo />
        </div>
        <h1 class="text-3xl lg:text-5xl text-surface-950 dark:text-surface-0 font-semibold max-w-xs lg:max-w-lg text-center mx-auto mt-10">Vos LumCoins : {{ authStore.user.credits }}</h1>
        <p class="mt-6 mx-auto max-w-md text-center text-lg lg:text-xl text-surface-500 dark:text-white/64">Il existe plusieurs façons d'obtenir et d'utiliser des crédits dans l'application, découvrez-les</p>
        <div class="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatedContainer v-for="(item, index) in enterpriseFeaturesData" :key="index" :delay="index * 200" className="p-8 border-0 dark:border border-white/12 shadow-stroke dark:shadow-none rounded-4xl">
                <div class="icon-box ml-0">
                    <component :is="item.icon" />
                </div>
                <h5 class="text-2xl text-surface-950 dark:text-surface-0 font-semibold mt-10">{{ item.title }}</h5>
                <p class="mt-6 text-lg text-surface-500">{{ item.description }}</p>
            </AnimatedContainer>
        </div>
    </div>
</template>
