<script setup lang="ts">

const themeStore = useThemeStore()
const authStore = useAuthStore()

const loginWithGoogle = async () => {
  // Переход на серверный маршрут
  // @ts-ignore
  console.log(authStore.auth)
  const google = await apiFetch('/auth/google');
  navigateTo(google.url, {
    external: true,
    open: {
      target: "_blank",
    },
  })

}
const isConnected = ref()
onMounted(async () => {
  const res = await apiFetch('/google/check', {
    params: {
      userId: authStore.user?.id,
    }
  })
  isConnected.value = !(!res || res === 'false');

  await nextTick()
})

</script>

<template>
  <Panel>
    <div class="flex flex-col items-center justify-center h-[80vh]">
      <div v-if="!isConnected">
        <p>Убедитесь, что Администратор добавил ваш аккаунт в приложение, после чего, авторизуйтесь по кнопке ниже.</p>
        <p>Контакты будут синхронизированы при добавлении новых покупателей или изменении существующих</p>
        <Button @click="loginWithGoogle">
          Подключить Google Contacts
        </Button>
      </div>
      <div v-else>Google аккаунт успешно подключен!</div>
    </div>
  </Panel>
</template>

<style scoped lang="scss">
p {
  margin-bottom: 0.5rem;
}
</style>
