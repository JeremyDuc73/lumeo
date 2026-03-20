<script setup lang="ts">
import { updatePreset } from '@primevue/themes';
import { twMerge } from 'tailwind-merge';

defineProps<{
    className?: string;
}>();

const { layoutConfig } = useLayout();

const configTheme = ref(layoutConfig.darkTheme);

const themeOptions = ref([
    { name: 'Light', value: false },
    { name: 'Dark', value: true }
]);

// Keep only the "blue" palette to enforce brand color and generate the PrimeVue preset
const primaryColors = ref([{ name: 'blue', palette: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' } }]);

function getPresetExt() {
    const color = primaryColors.value.find((c) => c.name === layoutConfig.primary)!;

    return {
        semantic: {
            primary: color.palette,
            colorScheme: {
                light: {
                    primary: {
                        color: '{primary.500}',
                        contrastColor: '#ffffff',
                        hoverColor: '{primary.600}',
                        activeColor: '{primary.700}'
                    },
                    highlight: {
                        background: '{primary.50}',
                        focusBackground: '{primary.100}',
                        color: '{primary.700}',
                        focusColor: '{primary.800}'
                    }
                },
                dark: {
                    primary: {
                        color: '{primary.400}',
                        contrastColor: '{surface.900}',
                        hoverColor: '{primary.300}',
                        activeColor: '{primary.200}'
                    },
                    highlight: {
                        background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                        focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                        color: 'rgba(255,255,255,.87)',
                        focusColor: 'rgba(255,255,255,.87)'
                    }
                }
            }
        }
    };
}

function toggleDarkMode() {
    if (!document.startViewTransition) {
        executeDarkModeToggle();

        return;
    }

    document.startViewTransition(() => executeDarkModeToggle());
}

function executeDarkModeToggle() {
    layoutConfig.darkTheme = !layoutConfig.darkTheme;
    document.documentElement.classList.toggle('dark');
}

onMounted(() => {
    // Apply the blue preset and surface palette at startup
    updatePreset(getPresetExt());
    // Optionally sync initial dark class with config
    const hasDark = document.documentElement.classList.contains('dark');
    if (layoutConfig.darkTheme && !hasDark) {
        document.documentElement.classList.add('dark');
    }
    if (!layoutConfig.darkTheme && hasDark) {
        document.documentElement.classList.remove('dark');
    }
});
</script>

<template>
    <div :class="twMerge('fixed bottom-6 xl:bottom-auto xl:top-6 right-6 z-[4000]', className)">
        <button
            v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            class="config-button relative group rounded-lg w-10 h-10 flex items-center justify-center transition-all overflow-hidden"
        >
            <span :style="{ inset: '1px', borderRadius: '0.42rem' }" class="absolute z-2 bg-surface-0 dark:bg-surface-900 group-hover:bg-surface-100 dark:group-hover:bg-surface-800 transition-all"></span>
            <span class="relative z-10 text-surface-800 dark:text-surface-100 flex">
                <i :class="[layoutConfig.darkTheme ? 'pi pi-sun' : 'pi pi-moon', 'text-lg leading-none']"></i>
            </span>
        </button>

        <div
            :class="[
                'hidden flex flex-col gap-4 absolute bottom-[calc(100%+0.5rem)] xl:bottom-auto xl:top-[calc(100%+0.5rem)] right-0 w-[15.4rem] h-fit p-3 rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-sm transition-all ease-in-out'
            ]"
        >
            <div>
                <div class="flex flex-col gap-2">
                    <span class="text-lg font-semibold">Thème</span>
                    <SelectButton v-model="configTheme" :options="themeOptions" optionLabel="name" optionValue="value" :allowEmpty="false" @change="toggleDarkMode" />
                </div>
            </div>
        </div>
    </div>
</template>
