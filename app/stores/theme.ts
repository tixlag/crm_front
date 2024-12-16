// stores/themeStore.js
import {$t, updatePreset, updateSurfacePalette} from "@primevue/themes";
import {ref} from "vue";
export const useThemeStore = defineStore('theme', () => {
    const toast = useMessages()
    // Получение предустановок тем
    const { presets, presetOptions, primaryColors, surfaces } = useThemesPresets();

    // Состояние хранилища
    const preset = ref('Aura');
    const primary = ref('blue');
    const surface = ref({
        name: "neutral",
        palette: {
            "0": "#ffffff",
            "50": "#fafafa",
            "100": "#f5f5f5",
            "200": "#e5e5e5",
            "300": "#d4d4d4",
            "400": "#a3a3a3",
            "500": "#737373",
            "600": "#525252",
            "700": "#404040",
            "800": "#262626",
            "900": "#171717",
            "950": "#0a0a0a"
        }
    });
    const darkTheme = ref(false);
    const collapsed = ref(false);
    const isMobile = ref(false);

    // Геттеры
    const isDarkTheme = computed(() => darkTheme.value);
    const isOnMobile = computed(() => isMobile.value);

    // Действия

    /**
     * Устанавливает предустановку темы
     * @param {string} value
     */
    function setPreset(value) {
        preset.value = value;
    }

    /**
     * Устанавливает основной цвет
     * @param {string} value
     */
    function setPrimary(value) {
        primary.value = value;
    }

    /**
     * Устанавливает поверхность
     * @param {object} value
     */
    function setSurface(value) {
        surface.value = value;
    }

    /**
     * Переключает тёмный режим
     */
    function toggleDarkMode() {
        darkTheme.value = !darkTheme.value;
        if (darkTheme.value) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
        persistState();
    }

    /**
     * Загружает сохранённое состояние из localStorage
     */
    function loadPersistedState() {
        const persisted = localStorage.getItem('themeStore');
        if (persisted) {
            const themeFromStorage = JSON.parse(persisted);
            preset.value = themeFromStorage.preset || preset.value;
            primary.value = themeFromStorage.primary || primary.value;
            surface.value = themeFromStorage.surface || surface.value;
            darkTheme.value = themeFromStorage.darkTheme ?? darkTheme.value;

            if (darkTheme.value) {
                document.documentElement.classList.add('app-dark');
            }

            if (themeFromStorage.primary) {
                applyTheme("primary", themeFromStorage.primary, themeFromStorage.primary);
            }
            if (themeFromStorage.surface) {
                applyTheme("surface", themeFromStorage.surface);
            }

            onPresetChange(themeFromStorage.primary);

            if (surface.value) {
                applyTheme("surface", surface.value);
            }
        }
    }

    /**
     * Сохраняет текущее состояние в localStorage
     */
    function persistState() {
        const stateToPersist = {
            preset: preset.value,
            primary: primary.value,
            surface: surface.value,
            darkTheme: darkTheme.value,
        };
        localStorage.setItem('themeStore', JSON.stringify(stateToPersist));
    }

    /**
     * Обновляет цвета в зависимости от типа
     * @param {string} type
     * @param {object} color
     * @param {string} [nColor]
     */
    function updateColors(type, color, nColor) {
        if (type === 'primary') {
            setPrimary(color.name);
        } else if (type === 'surface') {
            setSurface(color);
        }
        applyTheme(type, color, nColor);
        persistState();
    }

    /**
     * Применяет тему в зависимости от типа
     * @param {string} type
     * @param {object|string} color
     * @param {string} [nColor]
     */
    function applyTheme(type, color, nColor) {
        if (type === 'primary') {
            updatePreset(getPresetExt(nColor));
        } else if (type === 'surface') {
            updateSurfacePalette(color.palette);
        }
    }

    /**
     * Обрабатывает изменение предустановки
     * @param {string} [nColor]
     */
    function onPresetChange(nColor) {
        $t()
            .preset(presets[preset.value])
            .preset(getPresetExt(nColor))
            .surfacePalette(surface.value)
            .use({ useDefaultOptions: true });

        if (surface.value) {
            updateColors("surface", surface.value);
        }
    }

    /**
     * Возвращает расширенные настройки предустановки
     * @param {string} [nColor]
     * @returns {object}
     */
    function getPresetExt(nColor) {
        const color = primaryColors.value.find(c => c.name === (primary.value ?? nColor));

        if ((nColor ?? color.name) === 'noir') {
            return {
                semantic: {
                    primary: {
                        50: '{surface.50}',
                        100: '{surface.100}',
                        200: '{surface.200}',
                        300: '{surface.300}',
                        400: '{surface.400}',
                        500: '{surface.500}',
                        600: '{surface.600}',
                        700: '{surface.700}',
                        800: '{surface.800}',
                        900: '{surface.900}',
                        950: '{surface.950}'
                    },
                    colorScheme: {
                        light: {
                            primary: {
                                color: '{primary.950}',
                                contrastColor: '#ffffff',
                                hoverColor: '{primary.800}',
                                activeColor: '{primary.700}'
                            },
                            highlight: {
                                background: '{primary.950}',
                                focusBackground: '{primary.700}',
                                color: '#ffffff',
                                focusColor: '#ffffff'
                            }
                        },
                        dark: {
                            primary: {
                                color: '{primary.50}',
                                contrastColor: '{primary.950}',
                                hoverColor: '{primary.200}',
                                activeColor: '{primary.300}'
                            },
                            highlight: {
                                background: '{primary.50}',
                                focusBackground: '{primary.300}',
                                color: '{primary.950}',
                                focusColor: '{primary.950}'
                            }
                        }
                    }
                }
            };
        } else {
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
    }

    // Автоматическая загрузка сохранённого состояния при инициализации хранилища
    loadPersistedState();

    // Отслеживание изменений и сохранение состояния
    // watch([preset, primary, surface, darkTheme], () => {
    //     persistState();
    // }, { deep: true });

    const hasErrorToast = ref<Boolean>()
    const setHasErrorToast= (val: boolean) => hasErrorToast.value = val

    const errorToastMessage = ref<any>()
    const errorToastHeader = ref<String>()
    const showErrorToast = (message: string, header: string) => {
        hasErrorToast.value = true
        errorToastMessage.value = {severity: 'error', summary: 'Ошибка', detail: message, life: 5000}
        errorToastHeader.value = header
        toast.showErrorMessage('Ошибка', message)
    }


    function init() {
        console.log('Inited themeStore')
        onResize()
        window.addEventListener('resize', onResize)

        function onResize() {
            if (window.innerWidth <= 980) {
                collapsed.value = true
                isMobile.value = true
            }
            else {
                collapsed.value = true
                isMobile.value = false
            }
        }
    }
    init()

    return {
        // Состояние
        preset,
        primary,
        surface,
        darkTheme,
        collapsed,
        isOnMobile,

        // Геттеры
        isDarkTheme,

        // Действия
        setPreset,
        setPrimary,
        setSurface,
        toggleDarkMode,
        loadPersistedState,
        updateColors,
        applyTheme,
        onPresetChange,
        getPresetExt,

        hasErrorToast,
        setHasErrorToast,
        confirmMessage: errorToastMessage,
        confirmHeader: errorToastHeader,
        showErrorToast,
    };
});
