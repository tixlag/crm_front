<!-- /components/settings/Cheque/ChequeForm.vue -->
<template>
  <div class="p-card p-p-4">
    <!--    <h3 class="self-end">Добавить Новый Статус Заказа</h3>-->
    <form class="flex flex-col gap-6" @submit.prevent="submitForm">
      <div class="flex gap-6" v-bind:class="(themeStore.isOnMobile)?'justify-center':'justify-end'">
        <div class="p-field">
          <label for="chequeName">Название</label>
          <InputText id="chequeName" v-model="newCheque.name" required/>
        </div>
        <div class="p-field items-center">
          <label for="colorPicker">Цвет</label>
          <ColorPicker
              :pt:preview:style="`border: 1px solid var(--p-focus-ring-color)`"
              id="colorPicker" v-model="newCheque.color"/>
        </div>
        <Button v-if="!themeStore.isOnMobile" label="Добавить источник" type="submit" :loading="loading"/>
      </div>
      <Button v-if="themeStore.isOnMobile" label="Добавить источник" type="submit" :loading="loading"/>

    </form>
  </div>
</template>

<script setup>


const settingsStore = useSettingsStore()
const toast = useMessages()
const themeStore = useThemeStore()

const newCheque = ref({
  name: '',
  color: '#FFFFFF',
})

const loading = computed(() => settingsStore.loading.cheques)

const submitForm = async () => {
  try {
    await settingsStore.createEntity("cheques", newCheque.value)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Добавлен новый источник', life: 3000})
    newCheque.value = {
      name: '',
      color: '#FFFFFF',
    }
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось добавить источник', life: 3000})
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

</style>
