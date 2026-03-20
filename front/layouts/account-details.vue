<script setup lang="ts">
import AppConfig from './AppConfig.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const { isWide } = useLayout();
</script>

<template>
    <AnimatedContainer :className="isWide ? 'bg-main-gradient' : 'pt-6'">
        <div class="container">
            <div :class="isWide ? '' : 'bg-main-gradient rounded-3xl lg:rounded-4xl'">
                <Navbar />
                <div class="pt-16 pb-6 lg:pb-52 max-w-[55rem] mx-auto">
                    <AccountNavbar />
                    <div class="mt-12">
                        <slot />
                    </div>
                </div>
            </div>
        </div>
    </AnimatedContainer>
    <Toast appendTo="body" position="top-right" :pt="{ root: { class: 'z-[2147483647]' } }" />
    <ConfirmDialog appendTo="body" group="global" :pt="{ root: { class: 'z-[2147483600]' }, mask: { class: 'z-[2147483590]' } }" />
    <Footer />
    <AppConfig />
</template>
