<!-- /components/settings/DeliveryType/DeliveryTypeForm.vue -->
<template>
  <div class="p-card p-p-4">
    <!--    <h3 class="self-end">Добавить Новый Статус Заказа</h3>-->
    <form class="flex flex-col gap-6" @submit.prevent="submitForm">
      <div class="flex gap-6" v-bind:class="(themeStore.isOnMobile)?'justify-center':'justify-end'">
        <div class="p-field">
          <label for="deliveryTypeName">Название</label>
          <InputText id="deliveryTypeName" v-model="newDeliveryType.name" required/>
        </div>
        <div class="p-field items-center">
          <label for="colorPicker">Цвет</label>
          <ColorPicker
              :pt:preview:style="`border: 1px solid var(--p-focus-ring-color)`"
              id="colorPicker" v-model="newDeliveryType.color"/>
        </div>
        <Button v-if="!themeStore.isOnMobile" icon="pi pi-plus" label="Добавить тип доставки" type="submit" :loading="loading"/>
      </div>
      <Button v-if="themeStore.isOnMobile" icon="pi pi-plus" label="Добавить тип доставки" type="submit" :loading="loading"/>

    </form>
  </div>
</template>

<script setup>


const settingsStore = useSettingsStore()
const toast = useMessages()
const themeStore = useThemeStore()

const newDeliveryType = ref({
  name: '',
  color: '#FFFFFF',
})

const loading = computed(() => settingsStore.loading.deliveryTypes)

const submitForm = async () => {
  try {
    await settingsStore.createEntity("deliveryTypes", newDeliveryType.value)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Тип доставки добавлен', life: 3000})
    newDeliveryType.value = {
      name: '',
      color: '#FFFFFF',
    }
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось добавить тип доставки', life: 3000})
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
