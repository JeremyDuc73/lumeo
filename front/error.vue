<script setup lang="ts">
import AppConfig from './layouts/AppConfig.vue';

const { isWide } = useLayout();
</script>

<template>
    <AnimatedContainer :className="isWide ? 'shadow-black-card bg-main-gradient' : 'pt-6'">
        <div class="container">
            <div :class="`min-h-[47rem] lg:h-[84rem] relative ${isWide ? '' : 'rounded-3xl lg:rounded-4xl shadow-black-card bg-main-gradient'}`">
                <div class="relative z-20">
                    <Navbar />
                    <div class="mt-8 lg:mt-24 flex flex-col items-center pb-20 px-4">
                        <IconLogosLumeo class="w-1/2 sm:w-1/4 lg:w-[396px]" />
                        <h1 class="mt-4 lg:mt-16 text-4xl lg:text-6xl font-semibold title !leading-normal text-center">Something gone wrong!</h1>
                        <p class="mt-4 text-base lg:text-xl text-white/64 text-center">The page you were looking for doesn’t exist.</p>
                        <NuxtLink to="/" class="button-regular mt-8 px-8"> Go to home </NuxtLink>
                    </div>
                </div>
                <div class="absolute inset-0 overflow-hidden">
                    <CirclePattern class="w-full lg:w-[82rem] absolute left-1/2 -translate-x-1/2 top-[36rem] lg:top-[calc(100%-30rem)]" />
                </div>
            </div>
        </div>
    </AnimatedContainer>
    <AppConfig />
</template>
