<!-- /components/settings/OrderStatus/OrderStatusModal.vue -->
<template>
  <Dialog :header="isEdit ? 'Редактировать Курьера' : 'Создать Курьера'" :visible="true" :modal="true" :closable="true" :style="{ width: '600px' }">
    <form @submit.prevent="submitForm">
      <div class="flex flex-col flex-wrap ">
        <div class="p-field w-100 justify-between">
          <label for="name">Название</label>
          <InputText id="name" v-model="form.name" required/>
        </div>

        <div class="p-field w-100 justify-between">
          <label for="email">Цвет</label>
          <InputText id="email" v-model="form.email" type="email" required/>
        </div>

        <div class="p-field w-100 justify-between">
          <label for="username">Оплачен?</label>
          <Checkbox binary id="username" v-model="form.username" />
        </div>

        <div class="p-field w-100 justify-between">
          <label for="password">Пароль</label>
          <Password
              id="password"
              v-model="form.password"
              :toggleMask="true"
              :feedback="false"
              :required="!isEdit"
          />
        </div>
      </div>


      <div class="p-d-flex p-jc-end">
        <Button label="Отмена" class="p-button-text" @click="emitClose" />
        <Button label="Сохранить" type="submit" :disabled="!isValid" />
      </div>
    </form>
  </Dialog>
</template>

<script setup>

const props = defineProps({
  orderStatus: Object, // Если есть, это редактирование
})

const emit = defineEmits(['close', 'save'])

const isEdit = computed(() => !!props.orderStatus)

const form = ref({
  name: '',
  email: '',
  username: '',
  password: '',
  roles: ['DELIVERYMAN'],
  isAccountDisabled: false,
  settings: {
    startTime: '',
    endTime: '',
    workDays: [],
    allowIps: [],
  },
  orderStatusCanSee_deliveryType: [],
  orderStatusCanSee_orderStatus: [],
})

const ipInput = ref('')

// Демонстрация рабочих дней недели
const weekDays = ref([
  { label: 'Понедельник', value: '1' },
  { label: 'Вторник', value: '2' },
  { label: 'Среда', value: '3' },
  { label: 'Четверг', value: '4' },
  { label: 'Пятница', value: '5' },
  { label: 'Суббота', value: '6' },
  { label: 'Воскресенье', value: '7' },
])

const settingsStore = useSettingsStore()

if (isEdit.value && props.orderStatus) {
  let {workHours, userId, ...rawSetting} = { ...props.orderStatus.settings }

  const workDays = [];
  let startTime = null;
  let endTime = null;
  if (workHours && workHours.length) {
    workHours.forEach(item => {
      const day = Object.keys(item)[0]; // Получаем ключ, который является днем недели
      workDays.push(day); // Добавляем день в массив workDays

      // Извлекаем startTime и endTime, если они еще не установлены
      if (!startTime) {
        startTime = item[day].startTime;
      }
      if (!endTime) {
        endTime = item[day].endTime;
      }
    });
    rawSetting.workDays = workDays;
    rawSetting.startTime = new Date(startTime);
    rawSetting.endTime = new Date(endTime);
  }
  watch(() => {

  })

  form.value = {
    name: props.orderStatus.name,
    email: props.orderStatus.email,
    username: props.orderStatus.username,
    password: '',
    roles: props.orderStatus.roles,
    isAccountDisabled: props.orderStatus.isAccountDisabled,
    settings: rawSetting,
    orderStatusCanSee_deliveryType: props.orderStatus.orderStatusCanSee_deliveryType,
    orderStatusCanSee_orderStatus: props.orderStatus.orderStatusCanSee_orderStatus,

  }
}

const addIp = () => {
  const ip = ipInput.value.trim()
  if (ip && !form.value.settings.allowIps.includes(ip)) {
    form.value.settings.allowIps.push(ip)
    ipInput.value = ''
  }
}

const removeIp = (index) => {
  form.value.settings.allowIps.splice(index, 1)
}

const isValid = computed(() => {
  return form.value.name && form.value.email && form.value.username && (isEdit.value || form.value.password)
})

const submitForm = () => {
  const payload = { ...form.value }
  if (!payload.password) {
    delete payload.password
  }
  if (payload.canAccessManagers)  payload.canAccessManagers = payload.canAccessManagers.map(orderStatus =>{
    return {
      accessibleToId: orderStatus.id,
      canEdit: orderStatus.canEdit ?? false,
    }
  })


  emit('save', payload)
}

const emitClose = () => {
  emit('close')
}
</script>

<style scoped>
.p-field {
  margin-bottom: 1rem;
}
label {
  margin: 5px
}

.p-field-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.p-field-checkbox label {
  margin-left: 0.5rem;
}

.p-d-flex {
  display: flex;
}

.p-jc-end {
  justify-content: flex-end;
}
</style>
