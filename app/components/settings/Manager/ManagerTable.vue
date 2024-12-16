<!-- /components/settings/Manager/ManagerTable.vue -->
<template>
  <div class="manager-section">
    <div class="flex justify-end mb-4">
      <h2>Менеджеры</h2>
    </div>
    <ContextMenu ref="contextMenu" :model="menuModel" />
    <DataTable
        :value="managers"
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
        contextMenu v-model:contextMenuSelection="selectedManager"
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
      <Column field="googleTokenExpiry" header="Google">
        <template #body="{ data, field }">
          <span v-if="data[field]" class="pi pi-check-circle color-green"></span>
          <span v-else class="pi pi-times-circle color-red"></span>
        </template>
      </Column>
      <Column header="Активен" :body="activeTemplate"></Column>
      <Column class="flex justify-end"  header="Действия" :style="{ minWidth: '150px' }">
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
          <Button label="Добавить менеджера" icon="pi pi-plus" @click="openCreateModal" />

        </template>
      </Column>
    </DataTable>
    <div v-if="error" class="p-mt-3">
      <p class="p-error">Ошибка: {{ error }}</p>
    </div>


    <!-- Модальное окно для создания/редактирования -->
    <ManagerModal
        :manager="selectedManager"
        :isVisible="isModalVisible"
        @update:isVisible="value => isModalVisible = value"
        @close="closeModal"
        @save="handleSave"
    />


  </div>
</template>

<script setup>

import ManagerModal from "~/components/settings/Manager/ManagerModal.vue";
import {ref} from "vue";
import {debounce} from "@antfu/utils";

const settingsStore = useSettingsStore()
const toast = useMessages()
const {confirmDelete, confirmAction} = useConfirmation()
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.isDarkTheme)

const isModalVisible = ref(false)
const selectedManager = ref(null) // null для создания, объект для редактирования
const coloredRow = ref(0);

const managers = computed(() => settingsStore.managers)
const pagination = computed(() => settingsStore.pagination.managers)
const loading = computed(() => settingsStore.loading.managers)
const error = computed(() => settingsStore.error.managers)
const globalFilter = computed(() => settingsStore.filters.managers)


const contextMenu = ref();
const menuModel = ref([
  {label: 'View', icon: 'pi pi-fw pi-search', command: () => openEditModal(selectedManager)},
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => handleDelete(selectedManager.id)}
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

// const fetchManagers = () => {
//   settingsStore.fetchEntity('managers', pagination.value.page, pagination.value.limit, globalFilter.value)
// }
//
// onMounted(() => {
//   fetchManagers()
// })

const openCreateModal = () => {
  selectedManager.value = null
  isModalVisible.value = true
}

const openEditModal = (manager) => {
  selectedManager.value = selectedManager.value ?? manager
  coloredRow.value = selectedManager.value.id
  isModalVisible.value = true
}

const closeModal = () => {

  selectedManager.value = null
  isModalVisible.value = false
}

const handleSave = async (managerData) => {
  try {
    if (selectedManager.value) {
      // Редактирование
      await settingsStore.updateEntity('managers', selectedManager.value.id, managerData)
      toast.add({ severity: 'success', summary: 'Успех', detail: 'Менеджер обновлен', life: 3000 })
      isModalVisible.value = false

    } else {
      // Создание
      await settingsStore.createEntity('managers', managerData)
     coloredRow.value = settingsStore["managers"][0].id

      toast.add({ severity: 'success', summary: 'Успех', detail: 'Менеджер добавлен', life: 3000 })
      isModalVisible.value = false

    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить данные', life: 3000 })
  }
}

const handleDelete = async (id) => {
  confirmDelete(id, async () => {
    await settingsStore.deleteEntity('managers', id)
  })
}

const handlePageChange = (event) => {
  settingsStore.fetchEntity('managers', event.page + 1, event.rows, globalFilter.value)
}

const activeTemplate = (rowData) => {
  return rowData.isAccountDisabled ? 'Нет' : 'Да'
}

const onGlobalDebounced = debounce(300,async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    settingsStore.fetchEntity('managers', pagination.value.page, pagination.value.limit, globalFilter.value)
  }
})


const onGlobalFilter = async (event) => {
  onGlobalDebounced(event)
}


</script>

<style scoped>
.manager-section {
  margin-bottom: 2rem;
}

.header h3 {
  margin: 0;
}

.paginator {
  margin-top: 1rem;
}
</style>
