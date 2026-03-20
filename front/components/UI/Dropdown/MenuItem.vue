<script setup lang="ts">
import { twMerge } from 'tailwind-merge';

defineProps<{
    className?: string;
    unstyled?: boolean;
}>();
</script>

<template>
    <button :class="twMerge(unstyled ? '' : 'py-2 px-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer flex items-center text-left gap-2 [&>span]:truncate', className)">
        <slot />
    </button>
</template>
