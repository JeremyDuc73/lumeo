<script setup lang="ts">
import { twMerge } from 'tailwind-merge';

const props = defineProps({
    enterClass: {
        type: String,
        default: 'animate-slidefadein'
    },
    className: {
        type: String,
        default: ''
    },
    delay: {
        type: Number,
        default: 0
    }
});

const isVisible = ref(false);

const computedClass = computed(() => {
    let baseClass = '';

    if (isVisible.value) {
        baseClass = twMerge('animate-duration-500', props.enterClass);
    } else {
        baseClass = twMerge('opacity-0');
    }

    return twMerge(baseClass, props.className);
});

const containerRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
    if (containerRef.value) {
        const observer = new IntersectionObserver(
            (entries, observerInstance) => {
                if (entries[0].isIntersecting) {
                    setTimeout(() => {
                        isVisible.value = true;
                        observerInstance.unobserve(containerRef.value!);
                    }, props.delay);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(containerRef.value);
    }
});
</script>

<template>
    <div ref="containerRef" :class="computedClass">
        <slot />
    </div>
</template>
