<script setup lang="ts">
import { useRouter } from '#vue-router';
import { useAuthStore } from '~/store/auth';

const { isWide } = useLayout();

const config = useRuntimeConfig();
const authStore = useAuthStore();

const credentials = reactive({
    email: '',
    password: '',
    confirmPassword: ''
});

useRouter();

if (authStore.hasToken()) {
    navigateTo('/');
}

async function register() {
    try {
        const response: any = await $fetch(`${config.public.apiBase}/register_check`, {
            method: 'POST',
            body: credentials
        });
        console.log('Utilisateur créé : ', response);
        await navigateTo('/login');
    } catch (error) {
        console.error('Erreur lors de la création : ', error);
    }
}

const passwordError = ref(false);
const passwordMatch = ref(false);

const validatePassword = () => {
    passwordError.value = credentials.password.length < 6;
    passwordMatch.value = credentials.confirmPassword !== credentials.password && credentials.password.length > 0 && credentials.confirmPassword.length > 0;
};

const checked = ref(false);
</script>

<template>
    <AnimatedContainer :className="isWide ? 'bg-main-gradient shadow-black-card' : 'pt-6'">
        <div class="container">
            <div :class="`relative overflow-hidden ${isWide ? '' : 'bg-main-gradient rounded-3xl lg:rounded-4xl shadow-black-card'}`">
                <CirclePattern class="w-[82rem] absolute -bottom-1/2 translate-y-24 left-1/2 -translate-x-1/2 lg:block hidden" />
                <div class="relative z-20 px-6">
                    <Navbar />
                    <div class="pb-6 pt-10 lg:py-24 max-w-[48rem] mx-auto">
                        <form
                            class="bg-white/4 px-6 md:px-8 pt-16 pb-12 border border-white/8 backdrop-blur-[48px] rounded-2.5xl lg:rounded-4xl shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                            @submit.prevent="register"
                        >
                            <div
                                class="flex items-center justify-center border border-white/8 w-[5.5rem] h-[5.5rem] mx-auto rounded-3xl bg-white/8 backdrop-blur-[48px] shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                            >
                                <IconLogosLumeo class="w-30 h-30" />
                            </div>
                            <h1 class="text-3xl lg:text-6xl font-semibold text-surface-0 text-center mt-8">S'inscrire</h1>
                            <p class="text-xl text-white/64 text-center mt-6">Entrez vos informations pour créer un nouveau compte</p>
                            <div class="flex flex-col gap-8 mt-16">
                                <div class="flex flex-col gap-2">
                                    <label for="signup_email" class="text-surface-0"> Adresse mail </label>
                                    <InputText
                                        id="signup_email"
                                        v-model="credentials.email"
                                        class="!bg-white/16 !rounded-full !py-2 !px-4 outline-none !text-white/90 backdrop-blur-[48px] !border-white/12 placeholder:!text-surface-0/60 !shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                                    />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="signup_password" class="text-surface-0"> Mot de passe </label>
                                    <InputText
                                        id="signup_password"
                                        v-model="credentials.password"
                                        type="password"
                                        class="!bg-white/16 !rounded-full !py-2 !px-4 outline-none !text-white/90 backdrop-blur-[48px] !border-white/12 placeholder:!text-surface-0/60 !shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                                        @input="validatePassword"
                                    />
                                    <p v-if="passwordError" class="text-red-400 text-md mt-1">Le mot de passe doit contenir au moins 6 caractères.</p>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label for="signup_confirm" class="text-surface-0"> Confirmez votre mot de passe </label>
                                    <InputText
                                        id="signup_confirm"
                                        v-model="credentials.confirmPassword"
                                        type="password"
                                        class="!bg-white/16 !rounded-full !py-2 !px-4 outline-none !text-white/90 backdrop-blur-[48px] !border-white/12 placeholder:!text-surface-0/60 !shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                                        @input="validatePassword"
                                    />
                                    <p v-if="passwordMatch" class="text-red-400 text-md mt-1">Le mot de passe ne correspond pas.</p>
                                </div>
                                <div class="flex items-center justify-between gap-2">
                                    <div>
                                        <label class="flex items-center gap-2">
                                            <Checkbox
                                                v-model="checked"
                                                binary
                                                :pt="{
                                                    root: '!w-6 !h-6',
                                                    box: '!w-6 !h-6 !rounded-lg !bg-white/16 !border-white/12 text-white/90 backdrop-blur-[48px] !shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]',
                                                    icon: '!text-white !text-xs !leading-none'
                                                }"
                                            />
                                            <span class="font-semibold text-surface-0">J'accepte les </span>
                                            <a href="#" class="text-white/64">Termes et Conditions</a>
                                        </label>
                                    </div>
                                    <NuxtLink to="/" class="font-semibold text-white/64 hover:text-white/90 transition-all"> Mot de passe oublié ? </NuxtLink>
                                </div>
                                <button type="submit" class="button-regular w-full py-3">S'inscrire</button>
                                <div class="text-center">
                                    <span class="text-white/64">Vous avez déjà un compte ? </span>
                                    <NuxtLink to="/login" class="text-surface-0 font-semibold hover:opacity-90 transition-opacity"> Se connecter </NuxtLink>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </AnimatedContainer>
</template>
