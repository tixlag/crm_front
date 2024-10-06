// middleware/auth.ts

import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuthStore()

    if (!auth.isAuthenticated()) {
        return navigateTo('/login')
    }
})
