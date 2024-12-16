<!-- /components/settings/Cheque/ChequeTable.vue -->
<template>
  <div class="orderStatus-section">
    <div class="flex justify-between mb-4">
      <h2>Чеки</h2>

    </div>
    <div v-if="error" class="p-mt-3">
      <p class="p-error">Ошибка: {{ error }}</p>
    </div>
    <ContextMenu ref="contextMenu" :model="menuModel"/>
    <DataTable
        :value="cheques"
        paginator
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first} по {last} из {totalRecords}"
        :rowsPerPageOptions="[10, 1, 25, 50, 100]"
        :rows="pagination.limit"
        :totalRecords="pagination.total"
        :lazy="true"
        @page="handlePageChange"
        :loading="loading"
        scrollable
        contextMenu v-model:contextMenuSelection="selectedCheque"
        @rowContextmenu="onRowContextMenu"
        :row-class="rowClass"
        @row-click="onRowClick"
        @row-dblclick="onRowDblClick"
    >
      <template #header>
        <div class="flex justify-between items-center gap-x-10">
          <div style="white-space: nowrap;">Всего: {{ pagination.total }}</div>
          <IconField>
            <InputIcon>
              <i class="pi pi-search"/>
            </InputIcon>
            <InputText style="width: 100%" v-model="globalFilter" placeholder="по всем полям" @input="onGlobalFilter"/>
          </IconField>
        </div>
      </template>
      <Column field="id" header="ID"></Column>
      <Column field="name" header="Название"class="min-w-50 max-w-50">
        <template #editor="{data, field}">
          <InputText v-model="data[field]" />
        </template>
      </Column>

      <Column class="flex justify-end" header="Действия" :style="{ minWidth: '150px' }">
        <template #body="{ data }">

            <Button
                icon="pi pi-pencil"
                class="p-button-text"
                @click="openEditModal(data)"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                @click="handleDelete(data.id)"
            />

        </template>
        <template #footer>
          <Button label="Добавить чек" icon="pi pi-plus" @click="openCreateModal" />

        </template>
      </Column>

    </DataTable>

    <div v-if="error" class="p-mt-3">
      <p class="p-error">Ошибка: {{ error }}</p>
    </div>


    <!-- Модальное окно для создания/редактирования -->
    <ChequeModal
        :isVisible="isModalVisible"
        :cheque="selectedCheque"
        @update:isVisible="value => isModalVisible = value"
        @close="closeModal"
        @save="handleSave"
    />


  </div>
</template>

<script setup>

import {ref} from "vue";
import {debounce} from "@antfu/utils";
import ChequeAddForm from "~/components/settings/Cheque/ChequeAddForm.vue";
import DeliverymanModal from "~/components/settings/Deliveryman/DeliverymanModal.vue";
import ChequeModal from "~/components/settings/Cheque/ChequeModal.vue";


const settingsStore = useSettingsStore()
const toast = useMessages()
const {confirmDelete, confirmAction} = useConfirmation()
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.isDarkTheme)

const isModalVisible = ref(false)
const selectedCheque = ref(null) // null для создания, объект для редактирования
const coloredRow = ref(0);

const cheques = computed(() => settingsStore.cheques)
const pagination = computed(() => settingsStore.pagination.cheques)
const loading = computed(() => settingsStore.loading.cheques)
const error = computed(() => settingsStore.error.cheques)
const globalFilter = computed(() => settingsStore.filters.cheques)


const contextMenu = ref();
const menuModel = ref([
  {label: 'View', icon: 'pi pi-fw pi-search', command: () => openEditModal(selectedCheque)},
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => handleDelete(selectedCheque.id)}
]);

const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent);
};
const onRowClick = (event) => {
  coloredRow.value = event.data.id;
}
const onRowDblClick = (event) => {
  openEditModal(event.data)
}

const onRowEditSave = async (event) => {
  try {
    await settingsStore.updateEntity("cheques", event.data.id, event.newData)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Тип доставки обновлен', life: 3000})
    // editingRowKey.value = null
  } catch (err) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить статус', life: 3000})
  }
}

const rowClass = (data) => {
  return [
      {'!bg-[var(--p-surface-100)]': data.id === coloredRow.value && !isDarkTheme.value},
      {'!bg-[var(--p-surface-800)]': data.id === coloredRow.value && isDarkTheme.value},
    {"transaction-none": true}];
}

// const fetchCheques = () => {
//   settingsStore.fetchEntity('cheques', pagination.value.page, pagination.value.limit, globalFilter.value)
// }
//
// onMounted(() => {
//   fetchCheques()
// })

const openCreateModal = () => {
  selectedCheque.value = null
  isModalVisible.value = true
}

const openEditModal = (cheque) => {
  selectedCheque.value = selectedCheque.value ?? cheque
  coloredRow.value = selectedCheque.value.id
  isModalVisible.value = true
}

const closeModal = () => {

  selectedCheque.value = null
  isModalVisible.value = false
}

const handleSave = async (chequeData) => {
  try {
    if (selectedCheque.value) {
      // Редактирование
      await settingsStore.updateEntity('cheques', selectedCheque.value.id, chequeData)
      toast.add({ severity: 'success', summary: 'Успех', detail: 'Чек обновлен', life: 3000 })
      isModalVisible.value = false

    } else {
      // Создание
      await settingsStore.createEntity('cheques', chequeData)
      coloredRow.value = settingsStore["cheques"][0].id

      toast.add({ severity: 'success', summary: 'Успех', detail: 'Чек добавлен', life: 3000 })
      isModalVisible.value = false

    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить данные', life: 3000 })
  }
}


const handleDelete = async (id) => {
  confirmDelete(id, async () => {
    await settingsStore.deleteEntity('cheques', id)
  })
}

const handlePageChange = (event) => {
  settingsStore.fetchEntity('cheques', event.page + 1, event.rows, globalFilter.value)
}

const onGlobalDebounced = debounce(300, async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    settingsStore.fetchEntity('cheques', pagination.value.page, pagination.value.limit, globalFilter.value)
  }
})


const onGlobalFilter = async (event) => {
  onGlobalDebounced(event)
}


</script>

<style scoped>
.orderStatus-section {
  margin-bottom: 2rem;
}

.header h3 {
  margin: 0;
}

</style>
