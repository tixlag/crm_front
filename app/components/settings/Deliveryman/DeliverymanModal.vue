<!-- /components/settings/Deliveryman/DeliverymanModal.vue -->
<template>
  <Dialog
      :header="isEdit ? 'Редактировать Курьера' : 'Создать Курьера'"
      :visible="isVisible"
      @update:visible="handleClose"
      modal
      :style="{ width: '600px' }">
    <form @submit.prevent="submitForm">
      <div class="flex flex-col flex-wrap ">
        <div class="p-field w-100 justify-between">
          <label for="name">Имя</label>
          <InputText id="name" v-model="form.name" required/>
        </div>

        <div class="p-field w-100 justify-between">
          <label for="email">Email</label>
          <InputText id="email" v-model="form.email" type="email" required/>
        </div>

        <div class="p-field w-100 justify-between">
          <label for="username">Username</label>
          <InputText id="username" v-model="form.username" required/>
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
<hr />
      <div class="p-field">
        <label>Рабочие часы</label>
        <div class="flex gap-5 width-5/4 m-2">
          <DatePicker placeholder="c" v-model="form.settings.startTime" showIcon fluid iconDisplay="input" timeOnly>
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback" />
            </template>
          </DatePicker>
          <DatePicker placeholder="до" v-model="form.settings.endTime" showIcon fluid iconDisplay="input" timeOnly>
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback" />
            </template>
          </DatePicker>
        </div>
        <MultiSelect
            v-model="form.settings.workDays"
            :options="weekDays"
            class="ml-2"
            optionLabel="label"
            optionValue="value"
            placeholder="Выберите дни"
            multiple
        />
      </div>

      <div class="p-field">
        <label for="allowIps">Разрешенные IP</label>
        <InputText
            id="allowIps"
            v-model="ipInput"
            @keydown.enter.prevent="addIp"
            placeholder="Введите IP и нажмите Enter"
        />
        <div class="p-mt-2">
          <Tag
              v-for="(ip, index) in form.settings.allowIps"
              :key="index"
              :value="ip"
              removable
              @remove="removeIp(index)"
              class="p-mr-2 p-mb-2"
          />
        </div>
      </div>

      <div class="p-field">
        <label for="deliverymanCanSee_deliveryTypes">Типы доставки</label>
        <MultiSelect
            id="deliverymanCanSee_deliveryTypes"
            v-model="form.deliverymanCanSee_deliveryType"
            :options="settingsStore.deliveryTypes"
            optionLabel="name"
            placeholder="Выберите типы доставки"
            multiple
        />
      </div>

      <div class="p-field">
        <label for="deliverymanCanSee_orderStatuses">Статусы заказов</label>
        <MultiSelect
            id="deliverymanCanSee_orderStatuses"
            v-model="form.deliverymanCanSee_orderStatus"
            :options="settingsStore.orderStatuses"
            optionLabel="name"
            placeholder="Выберите статусы заказов"
            multiple
        />
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
  deliveryman: Object, // Если есть, это редактирование
  isVisible: true
})

function handleClose() {
  emit('close')
  emit('update:visible', false);
}

const emit = defineEmits(['close', 'save', "update:visible"])

const isEdit = computed(() => !!props.deliveryman)

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
  deliverymanCanSee_deliveryType: [],
  deliverymanCanSee_orderStatus: [],
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

watch(isEdit, () => {
  if (isEdit.value && props.deliveryman) {
    let {workHours, userId, ...rawSetting} = { ...props.deliveryman.settings }

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

    form.value = {
      name: props.deliveryman.name,
      email: props.deliveryman.email,
      username: props.deliveryman.username,
      password: '',
      roles: props.deliveryman.roles,
      isAccountDisabled: props.deliveryman.isAccountDisabled,
      settings: rawSetting,
      deliverymanCanSee_deliveryType: props.deliveryman.deliverymanCanSee_deliveryType.map(v=>settingsStore['deliveryTypes'].find(dt => dt.id === v.deliveryTypeId)),
      deliverymanCanSee_orderStatus: props.deliveryman.deliverymanCanSee_orderStatus.map(v=>settingsStore['orderStatuses'].find(os => os.id === v.orderStatusId)),

    }
  }
})
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
  if (payload.deliverymanCanSee_orderStatus)  payload.deliverymanCanSee_orderStatus = payload.deliverymanCanSee_orderStatus.map(status =>{
    return {
      userId: payload.id,
      orderStatusId: status.id,
    }
  })
  if (payload.deliverymanCanSee_deliveryType)  payload.deliverymanCanSee_deliveryType = payload.deliverymanCanSee_deliveryType.map(dt =>{
    return {
      userId: payload.id,
      deliveryTypeId: dt.id,
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
