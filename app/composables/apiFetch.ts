import {useAuthStore} from "~/stores/auth";

export async function apiFetch<T>(
    request: any,
    opts?: any
): Promise<T | undefined> {
    const config = useRuntimeConfig();
    const auth = useAuthStore();
    const themeStore = useThemeStore();

    const {vueApp} = useNuxtApp()
    const confirm = vueApp.config.globalProperties.$confirm

    let headers;
    if (!opts || opts?.method !== 'GET') {
        headers = {
            Authorization: `Bearer ${auth.token?.accessToken}`,
            ContentType: "application/json;",
        }
    } else {
        headers = {
            Authorization: `Bearer ${auth.token?.accessToken}`
        }
    }


    const makeRequest = async (): Promise<T> => {
        return await $fetch(`${config.public.apiBase}` + request, {
            headers,
            ...opts
        });
    }

    try {
        // Попытка выполнить запрос
        return await makeRequest();
    } catch (error: any) {
        if (error.response?.status === 401 && (error.data?.message == 'TokenExpiredError: jwt expired' || error.data?.message == 'JsonWebTokenError: jwt malformed')
        ) {
            // Если ошибка 401 и токен истек, пытаемся обновить токен
            const tokenRefreshed = await auth.refreshToken();

            if (tokenRefreshed) {
                // Если обновление токена успешно, повторяем запрос
                return await makeRequest();
            } else {
                // Если обновить токен не удалось, выполняем выход
                // auth.logout();
                // throw new Error('Сессия истекла, пожалуйста, войдите снова.');

                sendConfirm('Перейти к странице входа?', 'Требуется авторизация')
            }
        }
        if (error.response?.status === 403 && error.data?.badTime) {
            sendConfirm('Перейти к странице входа?', error.data?.badTime)
        }
        if (error.data) {
            themeStore.showErrorToast(error.data?.message, error.data?.error )
        } else {
            // Если ошибка другая, выбрасываем её
            throw error;
        }
    }

    function sendConfirm(message: string, header: string) {
        auth.inviteToLogin(message, header)

        // confirm.require({
        //     message: message,
        //     header: header,
        //     icon: 'pi pi-info-circle',
        //     rejectLabel: 'Нет',
        //     acceptLabel: 'Да',
        //     rejectClass: 'p-button-secondary p-button-outlined',
        //     acceptClass: 'p-button-success',
        //     accept: async () => {
        //         await navigateTo('/login')
        //
        //     },
        //     reject: () => {
        //         return;
        //     },
        // })
    }
}
