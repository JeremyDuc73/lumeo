<script setup lang="ts">
import { computed } from 'vue';
interface Props {
    className?: string;
    withText?: boolean;
    color?: 'light' | 'dark' | 'blue';
}

const props = withDefaults(defineProps<Props>(), {
    className: '',
    withText: true,
    color: 'light'
});

const textClass = computed(() => {
    if (props.color === 'dark') return 'text-gray-900 dark:text-white';
    if (props.color === 'blue') return 'text-blue-600 dark:text-white';
    return 'text-surface-0';
});
</script>

<template>
    <div :class="['flex gap-2 items-center', props.className]">
        <IconLogosLumeo :color="props.color" />
        <h1 v-if="props.withText" :class="['text-2xl lg:text-4xl font-semibold', textClass]">Lumeo</h1>
    </div>
</template>
