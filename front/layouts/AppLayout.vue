<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import AppConfig from './AppConfig.vue';
</script>

<template>
    <div>
        <AppConfig />
        <NuxtPage />
        <Toast appendTo="body" position="top-right" :pt="{ root: { class: 'z-[2147483647]' } }" />
        <ConfirmDialog appendTo="body" group="global" :pt="{ root: { class: 'z-[2147483600]' }, mask: { class: 'z-[2147483590]' } }" />
        <Footer />
    </div>
</template>
