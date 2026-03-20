<script setup lang="ts">
import { useAuthStore } from '~/store/auth';
const authStore = useAuthStore();
authStore.checkAuth();
</script>

<template>
    <ProfileHero />
    <ProfileCredits />
    <ProfilePricing />
</template>
