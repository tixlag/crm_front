<!-- /components/settings/Deliveryman/DeliverymanTable.vue -->
<template>
  <div class="deliveryman-section">
    <div class="flex justify-between mb-4">
      <h2>Курьеры</h2>
    </div>
    <ContextMenu ref="contextMenu" :model="menuModel" />
    <DataTable
        :value="deliverymans"
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
        contextMenu v-model:contextMenuSelection="selectedDeliveryman"
        @rowContextmenu="onRowContextMenu"
        :row-class="rowClass"
        @row-click="onRowClick"
        @row-dblclick="onRowDblClick"
    >
      <template #header>
        <div class="flex justify-between items-center gap-x-10">
          <div style="white-space: nowrap;">Всего: {{pagination.total}}</div>
          <IconField >
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText style="width: 100%" v-model="globalFilter" placeholder="по всем полям" @input="onGlobalFilter" />
          </IconField>
        </div>
      </template>
      <Column field="id" header="ID"></Column>
      <Column field="name" header="Имя"></Column>
      <Column field="email" header="Email"></Column>
      <Column field="username" header="Username"></Column>
      <Column header="Активен" :body="activeTemplate"></Column>
      <Column class="flex justify-end" header="Действия" :style="{ minWidth: '150px' }">
        <template #body="{ data }">
          <div>
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
          </div>
        </template>
        <template #footer>
          <Button label="Добавить курьера" icon="pi pi-plus" @click="openCreateModal" />

        </template>
      </Column>
    </DataTable>

    <div v-if="error" class="p-mt-3">
      <p class="p-error">Ошибка: {{ error }}</p>
    </div>


    <!-- Модальное окно для создания/редактирования -->
    <DeliverymanModal
        :isVisible="isModalVisible"
        :deliveryman="selectedDeliveryman"
        @update:isVisible="value => isModalVisible = value"
        @close="closeModal"
        @save="handleSave"
    />


  </div>
</template>

<script setup>

import DeliverymanModal from "~/components/settings/Deliveryman/DeliverymanModal.vue";
import {ref} from "vue";
import {debounce} from "@antfu/utils";

const settingsStore = useSettingsStore()
const toast = useMessages()
const {confirmDelete, confirmAction} = useConfirmation()
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.isDarkTheme)


const isModalVisible = ref(false)
const selectedDeliveryman = ref(null) // null для создания, объект для редактирования
const coloredRow = ref(0);

const deliverymans = computed(() => settingsStore.deliverymans)
const pagination = computed(() => settingsStore.pagination.deliverymans)
const loading = computed(() => settingsStore.loading.deliverymans)
const error = computed(() => settingsStore.error.deliverymans)
const globalFilter = computed(() => settingsStore.filters.deliverymans)


const contextMenu = ref();
const menuModel = ref([
  {label: 'View', icon: 'pi pi-fw pi-search', command: () => openEditModal(selectedDeliveryman)},
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => handleDelete(selectedDeliveryman.id)}
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

const rowClass = (data) => {
  return [
    {'!bg-[var(--p-surface-100)]': data.id === coloredRow.value && !isDarkTheme.value},
    {'!bg-[var(--p-surface-800)]': data.id === coloredRow.value && isDarkTheme.value},
    {"transaction-none": true}];
}

// const fetchDeliverymans = () => {
//   settingsStore.fetchEntity('deliverymans', pagination.value.page, pagination.value.limit, globalFilter.value)
// }
//
// onMounted(() => {
//   fetchDeliverymans()
// })

const openCreateModal = () => {
  selectedDeliveryman.value = null
  isModalVisible.value = true
}

const openEditModal = (deliveryman) => {
  selectedDeliveryman.value = selectedDeliveryman.value ?? deliveryman
  coloredRow.value = selectedDeliveryman.value.id
  isModalVisible.value = true
}

const closeModal = () => {

  selectedDeliveryman.value = null
  isModalVisible.value = false
}

const handleSave = async (deliverymanData) => {
  try {
    if (selectedDeliveryman.value) {
      // Редактирование
      await settingsStore.updateEntity('deliverymans', selectedDeliveryman.value.id, deliverymanData)
      toast.add({ severity: 'success', summary: 'Успех', detail: 'Менеджер обновлен', life: 3000 })
      isModalVisible.value = false

    } else {
      // Создание
      await settingsStore.createEntity('deliverymans', deliverymanData)
      coloredRow.value = settingsStore["deliverymans"][0].id

      toast.add({ severity: 'success', summary: 'Успех', detail: 'Менеджер добавлен', life: 3000 })
      isModalVisible.value = false

    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить данные', life: 3000 })
  }
}

const handleDelete = async (id) => {
  confirmDelete(id, async () => {
    await settingsStore.deleteEntity('deliverymans', id)
  })
}

const handlePageChange = (event) => {
  settingsStore.fetchEntity('deliverymans', event.page + 1, event.rows, globalFilter.value)
}

const activeTemplate = (rowData) => {
  return rowData.isAccountDisabled ? 'Нет' : 'Да'
}

const onGlobalDebounced = debounce(300,async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    settingsStore.fetchEntity('deliverymans', pagination.value.page, pagination.value.limit, globalFilter.value)
  }
})


const onGlobalFilter = async (event) => {
  onGlobalDebounced(event)
}


</script>

<style scoped>
.deliveryman-section {
  margin-bottom: 2rem;
}

.header h3 {
  margin: 0;
}

.paginator {
  margin-top: 1rem;
}
</style>
