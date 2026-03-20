<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

const { isWide } = useLayout();
const config = useRuntimeConfig();
const toast = useToast();
const router = useRouter();
const auth = useAuthStore();

if (!auth.hasToken()) {
    navigateTo('/login');
}

const form = reactive({
    title: '',
    cost: 0,
    description: '',
    isRemote: true,
    location: ''
});

const submitting = ref(false);

const eurosApprox = computed(() => {
    const n = Number(form.cost || 0);
    return (n / 20).toFixed(2);
});

function validate() {
    if (!form.title.trim()) {
        toast.add({ severity: 'warn', summary: 'Titre requis', detail: 'Veuillez saisir un titre.', life: 4000 });
        return false;
    }
    if (form.cost < 0) {
        toast.add({ severity: 'warn', summary: 'Prix invalide', detail: 'Le prix doit être positif.', life: 4000 });
        return false;
    }
    return true;
}

watch(
    () => form.isRemote,
    (val) => {
        if (val) {
            // If switched to remote, clear location
            form.location = '';
        }
    }
);

async function submit() {
    if (!validate()) return;
    submitting.value = true;
    try {
        const res: any = await $fetch(`${config.public.apiBase}/services`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.cookies.get('token')}` },
            body: {
                title: form.title,
                cost: Number(form.cost),
                description: form.description,
                isRemote: !!form.isRemote,
                location: form.location || null
            }
        });
        toast.add({ severity: 'success', summary: 'Créé', detail: 'Service créé avec succès.', life: 4000 });
        router.push(`/services/${res.id}`);
    } catch (e: any) {
        const detail = e?.data || 'Création impossible';
        toast.add({ severity: 'error', summary: 'Erreur', detail: typeof detail === 'string' ? detail : 'Création impossible', life: 5000 });
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <AnimatedContainer :className="isWide ? 'bg-main-gradient shadow-black-card' : 'pt-6'">
        <div class="container">
            <div :class="`relative ${isWide ? '' : 'bg-main-gradient rounded-3xl lg:rounded-4xl shadow-black-card'}`">
                <div class="relative z-20 px-6">
                    <Navbar />

                    <div class="py-10 lg:py-16 max-w-[60rem] mx-auto">
                        <h1 class="text-3xl lg:text-5xl font-semibold text-surface-0 mb-6">Créer un service</h1>

                        <div class="bg-white/4 border border-white/8 backdrop-blur-[48px] rounded-3xl p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="flex flex-col gap-2">
                                    <label class="text-surface-0">Titre</label>
                                    <InputText v-model="form.title" class="!bg-white/16 !rounded-full !py-2 !px-4 !text-white/90 !border-white/12" />
                                </div>
                                <div class="flex flex-col gap-2">
                                    <label class="text-surface-0">Prix (L)</label>
                                    <InputNumber v-model="form.cost" :min="0" inputClass="!bg-white/16 !rounded-full !py-2 !px-4 !text-white/90 !border-white/12" />
                                    <div class="text-white/60 text-xs">1 € = 20 L • ≈ {{ eurosApprox }} €</div>
                                </div>
                                <div class="md:col-span-2 flex flex-col gap-2">
                                    <label class="text-surface-0">Description</label>
                                    <Textarea v-model="form.description" rows="5" autoResize class="!bg-white/10 !border-white/12" />
                                </div>
                                <div class="flex items-center gap-3">
                                    <label class="text-surface-0">À distance</label>
                                    <InputSwitch
                                        v-model="form.isRemote"
                                        :pt="{
                                            root: '',
                                            slider: 'bg-blue-500/50 dark:bg-blue-400/40 rounded-full transition-colors',
                                            handle: 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                                        }"
                                    />
                                </div>
                                <div v-if="!form.isRemote" class="flex flex-col gap-2">
                                    <label class="text-surface-0">Lieu (si présentiel)</label>
                                    <InputText v-model="form.location" placeholder="Ville / adresse courte" class="!bg-white/16 !rounded-full !py-2 !px-4 !text-white/90 !border-white/12 placeholder:!text-white/80" />
                                </div>
                            </div>

                            <div class="mt-8 flex items-center justify-end gap-3">
                                <NuxtLink to="/services" class="button-blur">Annuler</NuxtLink>
                                <button class="button-regular" :disabled="submitting" @click="submit"><i v-if="submitting" class="pi pi-spin pi-spinner mr-2" /> Créer</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AnimatedContainer>
</template>
