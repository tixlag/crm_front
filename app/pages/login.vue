<template>
  <div class="flex justify-center items-center min-h-screen">
    <Card class="w-96">
      <template #title>
        <h2 class="mb-1"> Вход </h2>
      </template>
      <template #content>
      <FormKit
          type="form"
          :actions="false"
          @submit="handleSubmit"
      >
          <FormKit
              type="primeInputText"
              name="username"
              id="username"
              iconPrefix="pi pi-user"
              validation="required|length:3"
              v-model="form.username"
          />
          <FormKit
              type="primeInputText"
              pt:root:type="password"
              name="password"
              iconPrefix="pi pi-lock"
              id="password"
              validation="required|length:6"
              v-model="form.password"
          />
        <Button type="submit" label="Войти" class="mt-4" />
      </FormKit>
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
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = ref({
  username: '',
  password: '',
});

const handleSubmit = async () => {
  const success = await auth.login(form.value.username, form.value.password)
  if (success) {
    router.push('/')
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Вход выполнен' })
  } else {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Неверные учетные данные' })
  }
}


</script>

<style scoped>

</style>
