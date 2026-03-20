<script setup lang="ts">
import { twMerge } from 'tailwind-merge';

const props = defineProps<{
    className?: string;
    unstyled?: boolean;
}>();

const emit = defineEmits(['click']);

const toggleMenu = () => {
    emit('click');
};

const containerClass = computed(() => {
    let baseClass = '';

    if (!props.unstyled) {
        baseClass =
            'w-full [&>span]:truncate flex items-center gap-2 px-4 py-3 rounded-full transition-all border-0 dark:border hover:bg-surface-100 dark:hover:bg-surface-800  shadow-stroke dark:shadow-none group-data-[open=true]:bg-surface-100/75 dark:group-data-[open=true]:bg-surface-800/75';
    }

    return twMerge(baseClass, props.className);
});
</script>

<template>
    <button :class="containerClass" @click="toggleMenu">
        <slot />
    </button>
</template>
