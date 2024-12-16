<!-- /components/settings/OrderStatus/OrderStatusForm.vue -->
<template>
  <div class="p-card p-p-4">
<!--    <h3 class="self-end">Добавить Новый Статус Заказа</h3>-->
    <form class="flex gap-6" @submit.prevent="submitForm" v-bind:class="(themeStore.isOnMobile)?'flex-wrap justify-center':'justify-end'">
      <div class="p-field">
        <label for="statusName">Название</label>
        <InputText id="statusName" v-model="newOrderStatus.name" required />
      </div>
      <div class="p-field items-center">
        <label for="colorPicker">Цвет</label>
        <ColorPicker
            :pt:preview:style="`border: 1px solid var(--p-focus-ring-color)`"
            id="colorPicker" v-model="newOrderStatus.color"/>
      </div>
<!--      <div v-bind:class = "(themeStore.isOnMobile)?'flex':'flex flex-col justify-center'">-->

<!--        <div class="p-field-checkbox">-->
<!--          <Checkbox inputId="markAsPaid" v-model="newOrderStatus.markAsPaid" binary/>-->
<!--          <label for="markAsPaid">Оплачен</label>-->
<!--        </div>-->
<!--        <div class="p-field-checkbox">-->
<!--          <Checkbox inputId="markAsCompleted" v-model="newOrderStatus.markAsCompleted" binary/>-->
<!--          <label for="markAsCompleted">Завершен</label>-->
<!--        </div>-->
<!--        <div class="p-field-checkbox !m-0">-->
<!--          <Checkbox inputId="alwaysVisible" v-model="newOrderStatus.alwaysVisible" binary/>-->
<!--          <label for="alwaysVisible">Всегда виден</label>-->
<!--        </div>-->
        <Button v-if="themeStore.isOnMobile" icon="pi pi-plus" label="Добавить статус" type="submit" :loading="loading" />
<!--      </div>-->
      <div class="p-field items-center">
        <label for="alwaysVisible">Всегда виден</label>
        <Checkbox inputId="alwaysVisible" v-model="newOrderStatus.alwaysVisible" binary/>
      </div>
      <Button v-if="!themeStore.isOnMobile" icon="pi pi-plus" label="Добавить статус" type="submit" :loading="loading" />

    </form>
  </div>
</template>

<script setup>


const settingsStore = useSettingsStore()
const toast = useMessages()
const themeStore = useThemeStore()

const newOrderStatus = ref({
  name: '',
  color: '#FFFFFF',
  markAsPaid: false,
  markAsCompleted: false,
  alwaysVisible: false,
})

const loading = computed(() => settingsStore.loading.orderStatuses)

const submitForm = async () => {
  try {
    await settingsStore.createEntity("orderStatuses",newOrderStatus.value)
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Статус заказа добавлен', life: 3000 })
    newOrderStatus.value = {
      name: '',
      color: '#FFFFFF',
      markAsPaid: false,
      markAsCompleted: false,
      alwaysVisible: false,
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось добавить статус заказа', life: 3000 })
  }
}
</script>

<style lang="scss" scoped>

.p-card {
  padding: 2rem;
}
.p-field {
  display: flex;
  flex-direction: column;
  label {
    margin-bottom: 0.5rem;
  }
  &-checkbox {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.5rem;
    margin-inline: 0.5rem;
  }
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

.p-colorpicker {
  //border: 1px solid black
}
</style>
