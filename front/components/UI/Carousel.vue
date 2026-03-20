<script setup lang="ts">
import type { EmblaOptionsType } from 'embla-carousel';
import emblaCarouselVue from 'embla-carousel-vue';
import { twMerge } from 'tailwind-merge';

const props = defineProps({
    className: {
        type: String,
        default: ''
    },
    scaled: {
        type: Boolean,
        default: false
    },
    scale: {
        type: Number,
        default: 0.36
    },
    height: {
        type: String,
        default: '25rem'
    },
    spacing: {
        type: String,
        default: '1rem'
    },
    size: {
        type: String,
        default: '20%'
    },
    hideMask: {
        type: Boolean,
        default: false
    },
    hideButtons: {
        type: Boolean,
        default: false
    },
    refContainerClass: {
        type: String,
        default: ''
    },
    options: {
        type: Object as PropType<EmblaOptionsType>,
        default: () => ({})
    }
});

const [emblaRef, emblaApi] = emblaCarouselVue(props.options);
const TWEEN_FACTOR_BASE = props.scale ?? 0.36;
const tweenFactor = ref(0);
const tweenNodes = ref<HTMLElement[]>([]);

const prevBtnDisabled = ref(false);
const nextBtnDisabled = ref(false);

const scrollPrev = () => {
    if (emblaApi.value) emblaApi.value.scrollPrev();
};

const scrollNext = () => {
    if (emblaApi.value) emblaApi.value.scrollNext();
};

defineExpose({
    scrollPrev,
    scrollNext
});

const updateButtonStates = () => {
    if (!emblaApi.value) return;

    prevBtnDisabled.value = !emblaApi.value.canScrollPrev();
    nextBtnDisabled.value = !emblaApi.value.canScrollNext();
};

const setTweenNodes = () => {
    if (!emblaApi.value || !props.scaled) return;

    tweenNodes.value = emblaApi.value
        .slideNodes()
        .map((slideNode) => slideNode.querySelector('.embla__slide__item'))
        .filter((node): node is HTMLElement => node !== null);
};

const setTweenFactor = () => {
    if (!emblaApi.value || !props.scaled) return;

    tweenFactor.value = TWEEN_FACTOR_BASE * emblaApi.value.scrollSnapList().length;
};

const numberWithinRange = (number: number, min: number, max: number) => Math.min(Math.max(number, min), max);

const tweenScale = (eventName?: string) => {
    if (!emblaApi.value || !props.scaled) return;

    const engine = emblaApi.value.internalEngine();
    const scrollProgress = emblaApi.value.scrollProgress();
    const slidesInView = emblaApi.value.slidesInView();
    const isScrollEvent = eventName === 'scroll';

    emblaApi.value.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
            if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

            if (engine.options.loop) {
                engine.slideLooper.loopPoints.forEach((loopItem) => {
                    const target = loopItem.target();

                    if (slideIndex === loopItem.index && target !== 0) {
                        const sign = Math.sign(target);

                        if (sign === -1) {
                            diffToTarget = scrollSnap - (1 + scrollProgress);
                        }
                        if (sign === 1) {
                            diffToTarget = scrollSnap + (1 - scrollProgress);
                        }
                    }
                });
            }

            const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.value);
            const scale = numberWithinRange(tweenValue, 0, 1).toString();
            const tweenNode = tweenNodes.value[slideIndex];

            if (tweenNode) {
                tweenNode.style.transform = `scale(${scale})`;
            }
        });
    });
};

watch(
    () => emblaApi.value,
    (api) => {
        if (!api) return;

        updateButtonStates();

        if (props.scaled) {
            setTweenNodes();
            setTweenFactor();
            tweenScale();
        }

        api.on('reInit', () => {
            updateButtonStates();

            if (props.scaled) {
                setTweenNodes();
                setTweenFactor();
                tweenScale();
            }
        });

        api.on('scroll', () => {
            updateButtonStates();

            if (props.scaled) {
                tweenScale('scroll');
            }
        });

        api.on('slideFocus', () => {
            updateButtonStates();

            if (props.scaled) {
                tweenScale();
            }
        });
    },
    { immediate: true }
);

watch(
    () => props.scaled,
    (newScaled) => {
        if (!emblaApi.value) return;

        if (newScaled) {
            setTweenNodes();
            setTweenFactor();
            tweenScale();
        } else {
            tweenNodes.value.forEach((node) => {
                if (node) {
                    node.style.transform = '';
                }
            });
        }
    }
);

onUnmounted(() => {
    if (emblaApi.value) {
        emblaApi.value.destroy();
    }
});
</script>

<template>
    <section
        :class="twMerge('relative mx-auto', props.scaled ? 'max-w-[102rem]' : 'max-w-[88rem]', props.className)"
        :style="{
            '--slide-height': props.height,
            '--slide-spacing': props.spacing,
            '--slide-size': props.size
        }"
    >
        <template v-if="!props.hideMask">
            <div class="absolute h-full w-[25%] bg-[linear-gradient(to_right,white_12%,transparent_100%)] dark:bg-[linear-gradient(to_right,var(--p-surface-950)_12%,transparent_100%)] left-0 z-10 pointer-events-none"></div>
            <div class="absolute h-full w-[25%] bg-[linear-gradient(to_left,white_12%,transparent_100%)] dark:bg-[linear-gradient(to_left,var(--p-surface-950)_12%,transparent_100%)] right-0 z-10 pointer-events-none"></div>
        </template>

        <div ref="emblaRef" :class="twMerge(`overflow-hidden ${!props.scaled ? 'block' : ''}`, props.refContainerClass)">
            <div
                :class="[
                    {
                        'embla__container py-4 flex touch-pan-y touch-pinch-zoom ml-[calc(var(--slide-spacing)*-1)] [backface-visibility:hidden]': !props.scaled,
                        'flex ml-[calc(var(--slide-spacing)*-1)] py-8 touch-pan-y touch-pinch-zoom': props.scaled
                    }
                ]"
            >
                <slot />
            </div>
        </div>

        <div v-if="!props.hideButtons" class="mt-8 mx-auto w-fit flex items-center gap-6">
            <button class="w-32 h-12 rounded-full flex items-center justify-center shadow-stroke dark:shadow-black-card border-0 dark:border border-white/12" type="button" :disabled="prevBtnDisabled" @click="scrollPrev">
                <i class="pi pi-arrow-left !text-xl"></i>
            </button>
            <button class="w-32 h-12 rounded-full flex items-center justify-center shadow-stroke dark:shadow-black-card border-0 dark:border border-white/12" type="button" :disabled="nextBtnDisabled" @click="scrollNext">
                <i class="pi pi-arrow-right !text-xl"></i>
            </button>
        </div>
    </section>
</template>
