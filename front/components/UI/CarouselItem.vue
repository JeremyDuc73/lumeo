<script setup lang="ts">
import { twMerge } from 'tailwind-merge';
import { computed } from 'vue';

const props = defineProps({
    className: {
        type: String,
        default: ''
    },
    scaled: {
        type: Boolean,
        default: false
    }
});

const containerClass = computed(() => twMerge('min-w-0 pl-[var(--slide-spacing)] flex-[0_0_var(--slide-size)]', props.scaled ? 'embla__slide [transform:translate3d(0,0,0)]' : '', props.className));

const itemClass = computed(() => twMerge('flex items-center justify-center h-[var(--slide-height)] select-none', props.scaled ? 'embla__slide__item' : ''));
</script>

<template>
    <div :class="containerClass">
        <div :class="itemClass">
            <slot />
        </div>
    </div>
</template>
