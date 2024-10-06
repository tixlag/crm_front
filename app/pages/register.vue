<template>
  <div class="flex justify-center items-center min-h-screen">
    <Card class="w-96">
      <template #title>
        <h2 class="mb-1"> Регистрация </h2>
      </template>
      <template #content>

        <FormKit
            type="form"
            :actions="false"
            @submit="handleSubmit"
        >
          <FormKit
              type="primeInputText"
              label="Имя"
              name="name"
              id="name"
              validation="required|length:3"
              v-model="form.name"
          />


          <FormKit
              type="primeInputText"
              label="Email"
              name="email"
              id="email"
              iconPrefix="pi pi-email"
              validation="required|email"
              v-model="form.email"
          />

          <FormKit
              type="primeInputText"
              label="Username"
              name="username"
              iconPrefix="pi pi-user"
              id="username"
              validation="required|length:3"
              v-model="form.username"
          />

          <FormKit
              type="primeInputText"
              label="Пароль"
              name="password"
              id="password"
              iconPrefix="pi pi-lock"
              validation="required|length:6"
              pt:root:type="password"
              v-model="form.password"
          />
          <FormKit
              type="primeMultiSelect"
              label="Роли"
              name="roles"
              id="roles"
              validation="required"
              optionLabel="label"
              optionValue="value"
              placeholder="Выберите роли"
              :options=roles
              :v-model="form.roles"
          />

          <Button type="submit" label="Зарегистрироваться" class="mt-4"/>
        </FormKit>
        <p class="mt-4 text-center">
          Уже есть аккаунт?
          <NuxtLink to="/login">Войти</NuxtLink>
        </p>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useAuthStore} from '~/stores/auth'
import {useRouter} from 'vue-router'
import {useToast} from 'primevue/usetoast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  roles: ['MANAGER'], // Можно установить по умолчанию или выбрать на странице
})

const roles = ref([{label: 'Админ', value: 'ADMIN'}, {label: 'Менеджер', value: 'MANAGER'}, {
  label: 'Курьер',
  value: 'DELIVERYMAN'
}])


const handleSubmit = async () => {
  try {
    const data = await auth.register(form.value)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Регистрация прошла успешно'})
    router.push('/login')
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Регистрация не удалась'})
  }
}
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
