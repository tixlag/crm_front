// plugins/auth.ts

import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
    const auth = useAuthStore()

    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const userData = localStorage.getItem('user')

    if (accessToken && refreshToken && userData) {
        auth.setToken({ accessToken, refreshToken })
        auth.setUser(JSON.parse(userData))
    }
})