<!-- /components/settings/Manager/ManagerModal.vue -->
<template>
  <Dialog
      :header="isEdit ? 'Редактировать Менеджера' : 'Создать Менеджера'"
      :visible="isVisible"
      @update:visible="handleClose"
      modal
      :style="{ width: '600px' }"
  >
    <form @submit.prevent="submitForm">
      <div class="p-field">
        <label for="name">Имя</label>
        <InputText id="name" v-model="form.name" required/>
      </div>

      <div class="p-field">
        <label for="email">Email</label>
        <InputText id="email" v-model="form.email" type="email" required/>
      </div>

      <div class="p-field">
        <label for="username">Username</label>
        <InputText id="username" v-model="form.username" required/>
      </div>

      <div class="p-field">
        <label for="password">Пароль</label>
        <Password
            id="password"
            v-model="form.password"
            :toggleMask="true"
            :feedback="false"
            :required="!isEdit"
        />
      </div>

      <div class="p-field">
        <label>Рабочие часы</label>
        <!-- Реализуйте компонент для выбора рабочих часов -->
        <!-- Для примера используем MultiSelect для дней недели -->
        <div class="flex">
          <DatePicker placeholder="c" v-model="form.settings.startTime" showIcon fluid iconDisplay="input" timeOnly>
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback"/>
            </template>
          </DatePicker>
          <DatePicker placeholder="до" v-model="form.settings.endTime" showIcon fluid iconDisplay="input" timeOnly>
            <template #inputicon="slotProps">
              <i class="pi pi-clock" @click="slotProps.clickCallback"/>
            </template>
          </DatePicker>
        </div>
        <MultiSelect
            v-model="form.settings.workDays"
            :options="weekDays"
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

      <div class="p-field-checkbox">
        <Checkbox v-model="form.settings.canApproveStockOperation" binary/>
        <label>Может подтверждать операции на складе</label>
      </div>
      <div class="p-field-checkbox">
        <Checkbox v-model="form.settings.canSeeHistory_change" binary/>
        <label>Может видеть историю изменений заказов</label>
      </div>

      <div class="p-field-checkbox">
        <Checkbox v-model="form.settings.canSeeHistory_order" binary/>
        <label>Может видеть историю заказов</label>
      </div>

      <div class="p-field-checkbox">
        <Checkbox v-model="form.settings.canSeeHistory_statistic" binary/>
        <label>Может видеть статистику</label>
      </div>

      <div class="p-field">
        <label for="accessibleManagers">Доступ к менеджерам</label>
        <MultiSelect
            id="accessibleManagers"
            v-model="form.canAccessManagers"
            :options="availableManagers"
            optionLabel="name"
            placeholder="Выберите менеджеров"
            multiple
        />
        <div v-for="manager in form.canAccessManagers" :key="manager.managerId ?? manager" class="manager-access">
          <span>{{ manager.name }}</span>
          <label>
            <Checkbox binary v-model="availableManagers.find(m => m.id === manager.id).canEdit"/>
            Can Edit
          </label>
        </div>
      </div>

      <div class="p-d-flex p-jc-end">
        <Button label="Отмена" class="p-button-text" @click="emitClose"/>
        <Button label="Сохранить" type="submit" :disabled="!isValid"/>
      </div>
    </form>
  </Dialog>
</template>

<script setup>

const props = defineProps({
  manager: Object, // Если есть, это редактирование
  isVisible: true
})

function handleClose() {
  emit('close')
  emit('update:visible', false);
}

const emit = defineEmits(['close', 'save', 'update:visible'])

const isEdit = computed(() => !!props.manager)

const form = ref({
  name: '',
  email: '',
  username: '',
  password: '',
  roles: ['MANAGER'],
  isAccountDisabled: false,
  settings: {
    startTime: '',
    endTime: '',
    workDays: [],
    allowIps: [],
    canApproveStockOperation: false,
    canSeeHistory_change: false,
    canSeeHistory_order: false,
    canSeeHistory_statistic: false,
  },
  canAccessManagers: [],
})

const ipInput = ref('')

// Демонстрация рабочих дней недели
const weekDays = ref([
  {label: 'Понедельник', value: '1'},
  {label: 'Вторник', value: '2'},
  {label: 'Среда', value: '3'},
  {label: 'Четверг', value: '4'},
  {label: 'Пятница', value: '5'},
  {label: 'Суббота', value: '6'},
  {label: 'Воскресенье', value: '7'},
])

const settingsStore = useSettingsStore()

const availableManagers = computed(() => {
  if (isEdit.value) {
    return settingsStore.managers.filter(m => m.id !== props.manager.id)
  }
  return settingsStore.managers
})
watch(isEdit, () => {
  if (isEdit.value && props.manager) {
    let {workHours, userId, ...rawSetting} = {...props.manager.settings}

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
      name: props.manager.name,
      email: props.manager.email,
      username: props.manager.username,
      password: '',
      roles: props.manager.roles,
      isAccountDisabled: props.manager.isAccountDisabled,
      settings: rawSetting,
      canAccessManagers: props.manager.canAccessManagers?.map(access => {
            const manager = availableManagers.value.find(m => m.id === access.accessibleToId)
            manager.canEdit = access.canEdit
            return manager;
          }
      ),
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
  const payload = {...form.value}
  if (!payload.password) {
    delete payload.password
  }
  if (payload.canAccessManagers) payload.canAccessManagers = payload.canAccessManagers.map(manager => {
    return {
      accessibleToId: manager.id,
      canEdit: manager.canEdit ?? false,
    }
  })


  emit('save', payload)
}

const emitClose = () => {
  emit('close')
}
</script>

<style scoped>
label {
  margin: 1rem
}

.p-field {
  margin-bottom: 1rem;
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
