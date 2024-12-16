// stores/auth.ts

import {defineStore} from 'pinia'
import {ref} from 'vue'
import {apiFetch} from "~/composables/apiFetch";

interface AuthToken {
    accessToken: string
    refreshToken: string
}

interface User {
    id: number
    name: string
    username: string
    email: string
    roles: string[] // Используйте enum, если необходимо
    isAccountDisabled: boolean
    createdAt: string
    updatedAt: string
    settings: {},
    deliverymanCanSee_deliveryType: [],
    deliverymanCanSee_orderStatus: [],
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<AuthToken | null>(null)
    const user = ref<User | null>(null)


    const setToken = (newToken: AuthToken) => {
        token.value = newToken
        // Сохранение токенов в LocalStorage
        localStorage.setItem('accessToken', newToken.accessToken)
        localStorage.setItem('refreshToken', newToken.refreshToken)
    }

    const setUser = (userData: User) => {
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const login = async (username: string, password: string) => {
        try {
            const response = await apiFetch('/auth/login', {
                method: 'POST',
                body: {username, password},
            })
            console.log('Response data:', response);
            console.log('Response data:', response.data);
            setToken(response.data)
            // Получение профиля пользователя
            const profile = await apiFetch('/users/me', {
                headers: {
                    Authorization: `Bearer ${response.data.accessToken}`,
                },
            })
            setUser(profile.data)
            return true
        } catch (error) {
            console.error('Ошибка при входе:', error)
            return false
        }
    }

    const register = async (registrationData: any) => {
        try {
            const response = await apiFetch('/auth/register', {
                method: 'POST',
                body: registrationData,
            })
            // Опционально: автоматический вход после регистрации
            return response.data
        } catch (error) {
            console.error('Ошибка при регистрации:', error)
            throw error
        }
    }

    const logout = async () => {
        // Очистка токенов и данных пользователя
        token.value = null
        user.value = null
        pageIsBlock.value = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
    }

    const refreshToken = async () => {
        if (!token.value?.refreshToken) return false
        const config = useRuntimeConfig();
        try {
            const response = await $fetch(`${config.public.apiBase}` + '/auth/refresh-token', {
                method: 'POST',
                body: {refreshToken: token.value.refreshToken},
            })
            setToken(response.data)
            return true
        } catch (error) {
            console.error('Ошибка обновления токена:', error)
            // logout()
            return false
        }
    }

    const isAuthenticated = () => !!token.value?.accessToken

    const pageIsBlock = ref<Boolean>()
    const setPageIsBlock = (val: boolean) => pageIsBlock.value = val

    const confirmMessage = ref<String>()
    const confirmHeader = ref<String>()
    const inviteToLogin = (message: string, header: string) => {
        pageIsBlock.value = true
        confirmMessage.value = message
        confirmHeader.value = header
    }

    return {
        token,
        user,
        pageIsBlock,

        //показываем сообщение про проблемах с логином
        setPageIsBlock,
        confirmMessage,
        confirmHeader,
        inviteToLogin,

        setToken,
        setUser,
        login,
        register,
        logout,
        refreshToken,
        isAuthenticated,

    }
})
