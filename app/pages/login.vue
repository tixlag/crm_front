<template>
  <div class="flex justify-center items-center min-h-screen">
    <Card class="w-96">
      <template #title>
        <h2 class="mb-1"> Вход </h2>
      </template>
      <template #content>
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label for="username" class="block mb-2">Имя пользователя</label>
            <InputText
                v-model="form.username"
                id="username"
                placeholder="Введите имя пользователя"
                class="w-full"
                :class="{ 'p-invalid': !form.username || form.username.length < 3 }"
            />
<!--            <small v-if="!form.username || form.username.length < 3" class="p-error">-->
<!--              Имя пользователя должно содержать не менее 3 символов-->
<!--            </small>-->
          </div>

          <div class="mb-4">
            <label for="password" class="block mb-2">Пароль</label>
            <Password
                v-model="form.password"
                id="password"
                :feedback="false"
                placeholder="Введите пароль"
                toggleMask
                class="w-full"
                :class="{ 'p-invalid': !form.password || form.password.length < 6 }"
            />
<!--            <small v-if="!form.password || form.password.length < 6" class="p-error">-->
<!--              Пароль должен содержать не менее 6 символов-->
<!--            </small>-->
          </div>

          <Button type="submit" label="Войти" class="w-full mt-4" />
        </form>

        <p class="mt-4 text-center">
          Нет аккаунта? <NuxtLink to="/register">Регистрация</NuxtLink>
        </p>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
// import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useMessages } from '~/composables/messages'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Card from 'primevue/card'

const auth = useAuthStore()
// const router = useRouter()
const toast = useMessages()
const settingsStore = useSettingsStore()

const form = ref({
  username: '',
  password: '',
})

const handleSubmit = async () => {
  if (!form.value.username || form.value.username.length < 3) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Введите корректное имя пользователя' })
    return
  }

  if (!form.value.password || form.value.password.length < 6) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Введите корректный пароль' })
    return
  }

  const success = await auth.login(form.value.username, form.value.password)
  if (success) {
    await settingsStore.fetchAllEntity()
    navigateTo('/')
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Вход выполнен' })
  } else {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Неверные учетные данные' })
  }
}
</script>

<style scoped>
.p-invalid {
  border-color: var(--red-500);
}
</style>
