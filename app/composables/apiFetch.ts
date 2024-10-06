import {useAuthStore} from "~/stores/auth";

export async function apiFetch(
    request: any,
    opts?: any
) {
    const config = useRuntimeConfig();
    const auth = useAuthStore();

    const makeRequest = async () => {
        return await $fetch('/api' + request, {
            baseURL: config.public.baseURL,
            headers: {
                Authorization: `Bearer ${auth.token?.accessToken}`,
                ContentType: "application/json;",
            },
            ...opts
        });
    }

    try {
        // Попытка выполнить запрос
        return await makeRequest();
    } catch (error: any) {
        if (error.response?.status === 401 ) {
            // Если ошибка 401 и токен истек, пытаемся обновить токен
            const tokenRefreshed = await auth.refreshToken();

            if (tokenRefreshed) {
                // Если обновление токена успешно, повторяем запрос
                return await makeRequest();
            } else {
                // Если обновить токен не удалось, выполняем выход
                // auth.logout();
                throw new Error('Сессия истекла, пожалуйста, войдите снова.');
            }
        } else {
            // Если ошибка другая, выбрасываем её
            throw error;
        }
    }
}
