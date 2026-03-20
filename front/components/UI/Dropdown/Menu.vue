<script setup lang="ts">
import { onBeforeUnmount, provide, ref, watch } from 'vue';
import { twMerge } from 'tailwind-merge';

defineProps<{
    className?: string;
    unstyled?: boolean;
}>();

const open = ref(false);
const dropdownMenuRef = ref<HTMLDivElement | null>(null);
const outsideClickListener = ref<((event: MouseEvent) => void) | null>(null);
provide('open', open);

watch(open, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

function toggleOpen(): void {
    open.value = !open.value;
}

function bindOutsideClickListener(): void {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event: MouseEvent) => {
            if (isOutsideClicked(event)) {
                toggleOpen();
            }
        };

        setTimeout(() => {
            document.addEventListener('click', outsideClickListener.value as EventListener);
        }, 0);
    }
}

function unbindOutsideClickListener(): void {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value as EventListener);
        outsideClickListener.value = null;
    }
}

function isOutsideClicked(event: MouseEvent): boolean {
    if (!dropdownMenuRef.value) return true;
    return !dropdownMenuRef.value.contains(event.target as Node);
}
</script>

<template>
    <div ref="dropdownMenuRef" :class="twMerge('relative z-50 group', className)" :data-open="open" @click="toggleOpen">
        <slot />
    </div>
</template>
