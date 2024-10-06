export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    nuxtApp.provide('apiFetch', (path: string, options: any = {}) => {
        return $fetch(`${config.public.apiBase}${path}`, options)
    })
})