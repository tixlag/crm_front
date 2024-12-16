export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    if (!authStore.user?.roles.includes('ADMIN')) {
        to.path === '/settings'
        // Выводим уведомление (например, через toast) или другую информацию
        useNuxtApp().$toast.error('У вас нет доступа к этой странице.');
        return navigateTo('/');
    }
});
