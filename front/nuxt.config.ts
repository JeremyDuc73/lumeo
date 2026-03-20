// https://nuxt.com/docs/api/configuration/nuxt-config
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import type { NuxtPage } from 'nuxt/schema';

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                }
            },
            dark: {
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                }
            }
        }
    }
});

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: false },
    runtimeConfig: {
        public: {
            // Defaults for local dev; override in prod via env vars:
            // NUXT_PUBLIC_API_BASE, NUXT_PUBLIC_MERCURE_HUB, NUXT_PUBLIC_STRIPE_PUBLIC_KEY
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://localhost:8000/api',
            mercureHub: process.env.NUXT_PUBLIC_MERCURE_HUB || 'http://localhost:9090/.well-known/mercure',
            serverBase: '',
            stripePublicKey: process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY || ''
        }
    },
    app: {
        head: {
            title: 'Lumeo',
            meta: [
                { name: 'description', content: 'Lumeo est une application de micro-services instantanés, conçue pour offrir une plateforme où les utilisateurs peuvent échanger leurs compétences et services facilement.' },
                { property: 'og:title', content: 'Lumeo' },
                { property: 'og:description', content: 'Lumeo est une application de micro-services instantanés, conçue pour offrir une plateforme où les utilisateurs peuvent échanger leurs compétences et services facilement. ' },
                { property: 'og:image', content: 'lien image' }
            ],
            bodyAttrs: {
                class: 'relative'
            }
        }
    },
    modules: ['@primevue/nuxt-module', '@nuxt/image', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],
    primevue: {
        autoImport: true,
        options: {
            theme: {
                preset: MyPreset,
                options: {
                    darkModeSelector: '.dark'
                }
            }
        }
    },
    image: {
        provider: 'primefaces',
        providers: {
            primefaces: {
                name: 'primefaces',
                provider: '~/providers/primefaces.ts',
                options: {
                    baseURL: 'https://primefaces.org/cdn/templates/genesis'
                }
            }
        }
    },
    // Static generation: only prerender safe public routes and do not crawl links to private pages
    nitro: {
        prerender: {
            crawlLinks: false,
            routes: ['/', '/services', '/login', '/register']
        }
    },
    routeRules: {
        '/profile': { prerender: false },
        '/profile/**': { prerender: false },
        '/payment-success': { prerender: false },
        '/services/**': { prerender: false }
    },
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {}
        }
    },
    css: ['@/assets/layout/layout.css', '@/assets/tailwind.css', '@/assets/main.css'],
    vite: {
        optimizeDeps: {
            noDiscovery: true
        }
    },
    hooks: {
        'pages:extend': (routes: NuxtPage[]) => {
            routes.push({
                name: '404',
                path: '/404',
                file: '@/error.vue'
            });
        }
    }
});
