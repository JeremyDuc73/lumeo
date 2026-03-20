import { defineStore } from 'pinia';
import Cookies from 'universal-cookie';

export const useAuthStore = defineStore(
    'auth',
    () => {
        const cookies = new Cookies(null, { path: '/' });
        const user: any = ref(null);
        const config = useRuntimeConfig();

        async function fetchUser() {
            if (!cookies.get('token')) return null;

            try {
                const data: any = await $fetch(`${config.public.apiBase}/myprofile`, {
                    headers: {
                        Authorization: `Bearer ${cookies.get('token')}`
                    }
                });
                if (data?.ofUser) {
                    user.value = data;
                } else {
                    user.value = null;
                }
            } catch (error) {
                console.error("Impossible de récupérer le profil de l'utilisateur");
                logout();
            }
        }
        useRouter();

        function hasToken() {
            return !!cookies.get('token');
        }

        function setToken(newToken: string) {
            cookies.set('token', newToken);
        }

        function logout(redirect: boolean = true) {
            cookies.remove('token');
            user.value = null;
            if (redirect) {
                navigateTo('/login');
            }
        }

        function checkAuth() {
            if (cookies.get('token') === null) {
                return navigateTo('/login');
            }
        }

        return { user, cookies, fetchUser, setToken, logout, checkAuth, hasToken };
    },
    { persist: true }
);
