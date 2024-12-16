
export default defineNuxtPlugin((nuxtApp) => {
    const themeStore = useThemeStore()
    themeStore.loadPersistedState()

    watch(
        () => themeStore.$state,
        (state) => {
            localStorage.setItem('themeStore', JSON.stringify(state))
        },
        { deep: true }
    )
})