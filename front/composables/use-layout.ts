import { reactive } from 'vue';

const layoutConfig = reactive({
    primary: 'blue',
    surface: 'slate',
    darkTheme: false,
    heroContainerType: 'wide'
});

export function useLayout() {
    const isMobile = ref<boolean | null>(null);

    onMounted(() => {
        const checkMobile = () => {
            isMobile.value = window.innerWidth < 1024;
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
    });

    const isWide = computed(() => layoutConfig.heroContainerType === 'wide');

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    return {
        layoutConfig,
        isWide,
        isDarkTheme,
        isMobile
    };
}
