import { defineNuxtPlugin } from '#app';
import { ofetch } from 'ofetch';
import { useAuthStore } from '~/store/auth';

export default defineNuxtPlugin((nuxtApp) => {
    const auth = useAuthStore();

    const authedFetch = ofetch.create({
        onRequest({ options }) {
            try {
                const token = auth.cookies.get('token');
                if (token) {
                    const hdrs = options.headers instanceof Headers ? options.headers : new Headers((options.headers as HeadersInit) || undefined);
                    hdrs.set('Authorization', `Bearer ${token}`);
                    options.headers = hdrs;
                }
            } catch (e) {
                /* noop */
            }
        },
        onResponseError({ response }) {
            try {
                if (response?.status === 401) {
                    auth.logout();
                }
            } catch (e) {
                /* noop */
            }
        }
    });

    // Override global $fetch used in the app
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    nuxtApp.$fetch = authedFetch;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.$fetch = authedFetch;
});
