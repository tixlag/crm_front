// /composables/api.ts

import {useAuthStore} from "~/stores/auth";

export function apiFetch<T>(
    request: any,
    opts?: any
) {
    const config = useRuntimeConfig();
    const auth = useAuthStore()
    console.log(auth.token?.accessToken)

    return $fetch('/api' + request,
        {
            baseURL: config.public.baseURL,
            headers: {
                Authorization: `Bearer ${auth.token?.accessToken}`,
                ContentType: "application/json;",
            },
            ...opts
        });

}