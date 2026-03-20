<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

const route = useRoute();
const router = useRouter();
const sessionId = route.query.session_id;
const infos = reactive({
    title: '',
    text: ''
});

async function confirmPayment() {
    if (!sessionId) {
        alert('Aucune session trouvéé');
        router.push('/profile');
        return;
    }
    const response: any = await $fetch(`${useRuntimeConfig().public.apiBase}/payment/confirm-checkout`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${useAuthStore().cookies.get('token')}`
        },
        body: JSON.stringify({ session_id: sessionId })
    });
    if (response.success) {
        await useAuthStore().fetchUser();
        infos.title = 'Merci pour votre achat !';
        infos.text = 'Vous allez à présent être redirigé vers la page de votre profil';
    } else {
        infos.title = 'Erreur lors du paiement';
        infos.text = 'Il y a eu une erreur lors de votre paiement, vous allez à présent être redirigé vers votre page profil';
    }
    setTimeout(() => router.push('/profile'), 2000);
}

confirmPayment();
</script>

<template>
    <AnimatedContainer class="bg-main-gradient h-screen">
        <div class="p-10">
            <Logo />
            <h1 class="text-3xl lg:text-6xl font-semibold text-surface-0 text-center">{{ infos.title }}</h1>
            <p class="text-xl font-semibold text-surface-0 text-center mt-10">{{ infos.text }}</p>
        </div>
    </AnimatedContainer>
</template>
