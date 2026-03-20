<script setup lang="ts">
import { useAuthStore } from '~/store/auth';

const toast = useToast();
const authStore = useAuthStore();
const config = useRuntimeConfig();

authStore.checkAuth();

definePageMeta({
    layout: 'account-details'
});

const url = computed(() => {
    if (!authStore.user.image) {
        return '/profile.webp';
    } else {
        return `${config.public.serverBase}/images/${authStore.user.image.imageName}`;
    }
});

const isVisible = ref(false);

function openDialog() {
    isVisible.value = true;
}

const file = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const onFileSelect = (event: any) => {
    const selectedFile = event.files[0];
    if (selectedFile) {
        file.value = selectedFile;
        previewUrl.value = URL.createObjectURL(selectedFile);
    }
};

const onUpload = async () => {
    if (!file.value) {
        console.error('Aucun fichier sélectionné');
        return;
    }
    const body = new FormData();
    body.append('imageFile', file.value);
    try {
        const response = await $fetch(`${config.public.apiBase}/profile/edit-image`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authStore.cookies.get('token')}`
            },
            body
        });
        console.log('Upload réussi : ', response);
        await authStore.fetchUser();
        file.value = null;
        previewUrl.value = null;
        isVisible.value = false;
    } catch (error) {
        console.error('Erreur :', error);
    }
};

async function removeImage() {
    try {
        const response = await $fetch(`${config.public.apiBase}/profile/edit-image`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authStore.cookies.get('token')}`
            }
        });
        console.log('Image supprimée : ', response);
        await authStore.fetchUser();
        authStore.user.images.imageName = null;
    } catch (error) {
        console.error('Erreur :', error);
    }
}

const datas = reactive({
    username: '',
    description: ''
});

watchEffect(() => {
    if (authStore.user) {
        datas.username = authStore.user.username || '';
        datas.description = authStore.user.description || '';
    }
});
async function updateProfile() {
    try {
        const response = await $fetch(`${config.public.apiBase}/profile/edit`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authStore.cookies.get('token')}`
            },
            body: datas
        });
        console.log('Profil mis à jour : ', response);
        await authStore.fetchUser();
        toast.add({ severity: 'success', summary: 'Profil mis à jour', life: 3000 });
    } catch (error) {
        console.error('Erreur :', error);
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'La mise à jour du profil a échoué', life: 3000 });
    }
}
</script>

<template>
    <Toast class="!top-20" />
    <div class="p-6 md:p-12 rounded-2.5xl lg:rounded-4xl bg-white/16 backdrop-blur-[48px] max-w-[calc(100%-3rem)] lg:max-w-none mx-auto shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]">
        <div class="pb-10 border-b border-white/12 flex md:flex-row flex-col items-start gap-4">
            <div class="md:flex-[0.45] flex flex-col gap-1">
                <span class="text-xl font-medium text-surface-0">Votre Photo</span>
                <span class="text-white/64">Cette dernière sera affichée sur votre profil</span>
            </div>
            <div class="md:flex-[0.55] flex items-center gap-4">
                <div class="w-16 h-16 flex items-center justify-center rounded-full bg-white/16 shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]">
                    <img :src="url" alt="Image du profil" class="w-full h-full object-cover object-center rounded-full" />
                </div>
                <button class="text-surface-0 hover:text-surface-200" @click="openDialog">Mettre à jour</button>
                <button class="text-red-400 hover:text-red-500" @click="removeImage">Supprimer</button>
            </div>

            <Dialog
                v-model:visible="isVisible"
                modal
                header="Mettre à jour l'image du profil"
                :pt="{
                    root: 'lg:w-1/2 sm:w-11/12',
                    pcCloseButton: {
                        root: '!rounded-lg !w-8 !h-8'
                    }
                }"
            >
                <FileUpload customUpload auto mode="basic" accept="image/*" :maxFileSize="1000000" chooseLabel="Parcourir les fichiers" @select="onFileSelect" />
                <img v-if="previewUrl" :src="previewUrl" alt="Image uploadée" class="shadow-md rounded-xl w-full sm:w-64 m-auto mt-5" />
                <Button class="px-4 py-2 !block ml-auto" @click="onUpload">Changer l'image</Button>
            </Dialog>
        </div>
        <form class="flex pt-10 flex-col gap-10" @submit.prevent="updateProfile">
            <div class="flex flex-col sm:flex-row gap-2 items-start">
                <div class="sm:flex-[0.45] text-lg text-surface-0 font-medium">Nom d'utilisateur</div>
                <div class="sm:flex-[0.55] w-full">
                    <InputText
                        v-model="datas.username"
                        fluid
                        class="!px-5 !py-3 !bg-white/16 !rounded-full outline-none !text-white/90 backdrop-blur-[48px] !border-white/12 placeholder:!text-surface-0/60 !shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                        placeholder="Saisir ici"
                    />
                </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 items-start border-b border-white/12 pb-10">
                <div class="sm:flex-[0.45] text-lg text-surface-0 font-medium">Description du profil</div>
                <div class="sm:flex-[0.55] w-full">
                    <Textarea
                        v-model="datas.description"
                        fluid
                        class="!px-5 !py-3 !rounded-xl sm:!rounded-3xl !bg-white/16 outline-none !text-white/90 placeholder:!text-surface-0/60 backdrop-blur-[48px] !border-white/12 !shadow-[0px_2px_5px_0px_rgba(255,255,255,0.06)_inset,0px_12px_20px_0px_rgba(0,0,0,0.06)]"
                        placeholder="Saisir ici"
                    />
                </div>
            </div>
            <div class="pt-3 flex justify-end">
                <button type="submit" class="button-regular px-5 py-3 min-w-40">Mettre à jour</button>
            </div>
        </form>
    </div>
</template>
