<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { inject } from 'vue';

const isOpen = inject('open');

defineProps<{
    className?: string;
    unstyled?: boolean;
}>();
</script>

<template>
    <div
        :class="
            twMerge(
                'absolute top-[calc(100%+1rem)] z-[999999] min-w-full w-full left-0 flex flex-col transition-all ease-in-out duration-100 bg-surface-0 dark:bg-surface-950',
                unstyled ? '' : 'p-1 rounded-lg shadow-stroke dark:shadow-none border-0 dark:border border-white/12',
                isOpen ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-95',
                className
            )
        "
    >
        <slot />
    </div>
</template>
