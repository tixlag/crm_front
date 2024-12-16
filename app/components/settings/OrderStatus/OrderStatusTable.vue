<!-- /components/settings/OrderStatus/OrderStatusTable.vue -->
<template>
  <div class="orderStatus-section">
    <div class="flex justify-between mb-4">
      <h2>Статусы заказов</h2>
    </div>
    <ContextMenu ref="contextMenu" :model="menuModel"/>
    <DataTable
        :value="orderStatuses"
        v-model:editing-rows="editingRows"
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
        contextMenu v-model:contextMenuSelection="selectedOrderStatus"
        @rowContextmenu="onRowContextMenu"
        :row-class="rowClass"
        editMode="row"
        @row-click="onRowClick"
        @row-edit-save="onRowEditSave"
        @row-edit-init="onRowEditInit"
        dataKey="id"
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
      <Column field="color" header="Цвет" >
        <template #editor="{data, field}">
          <ColorPicker
              :pt:preview:style="`border: 1px solid var(--p-focus-ring-color)`"
              v-model="data[field]"
          />
        </template>
        <template #body="{data, field}">

          <ColorPicker
              :pt:preview:style="`border: 1px solid var(--p-focus-ring-color)`"
              v-model="data[field]"
              disabled
          />
        </template>

      </Column>
      <Column
          field="alwaysVisible"
          header="Всегда виден"
          sortable
      >
        <template #editor="{data, field}">
          <Checkbox v-model="data[field]" binary/>
        </template>
        <template #body="{data, field}">
          <Checkbox v-model="data[field]" binary disabled/>
        </template>
      </Column>
<!--      <Column-->
<!--          field="markAsCompleted"-->
<!--          header="Завершен"-->
<!--          sortable-->
<!--      >-->
<!--        <template #editor="{data, field}">-->
<!--          <Checkbox v-model="data[field]" binary/>-->
<!--        </template>-->
<!--        <template #body="{data, field}">-->
<!--          <Checkbox v-model="data[field]" binary disabled/>-->
<!--        </template>-->
<!--      </Column>-->
<!--      <Column-->
<!--          field="alwaysVisible"-->
<!--          header="Всегда виден"-->
<!--          sortable-->
<!--      >-->
<!--        <template #editor="{data, field}">-->
<!--          <Checkbox v-model="data[field]" binary/>-->
<!--        </template>-->
<!--        <template #body="{data, field}">-->
<!--          <Checkbox v-model="data[field]" binary disabled/>-->
<!--        </template>-->
<!--      </Column>-->
      <Column :rowEditor="true" class="w-30 max-w-30 flex flex-row-reverse"></Column>
      <Column>
        <template #editor></template>
        <template #body="{data}">

          <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger"
              @click="handleDelete(data.id)"
          />
        </template>
      </Column>

    </DataTable>
    <OrderStatusAddForm/>


  </div>
</template>

<script setup>

import {ref} from "vue";
import {debounce} from "@antfu/utils";
import OrderStatusAddForm from "~/components/settings/OrderStatus/OrderStatusAddForm.vue";


const settingsStore = useSettingsStore()
const toast = useMessages()
const {confirmDelete, confirmAction} = useConfirmation()
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.isDarkTheme)


const isModalVisible = ref(false)
const selectedOrderStatus = ref(null) // null для создания, объект для редактирования
const coloredRow = ref(0);
const editingRows = ref([])

const orderStatuses = computed(() => settingsStore.orderStatuses)
const pagination = computed(() => settingsStore.pagination.orderStatuses)
const loading = computed(() => settingsStore.loading.orderStatuses)
const error = computed(() => settingsStore.error.orderStatuses)
const globalFilter = computed(() => settingsStore.filters.orderStatuses)


const contextMenu = ref();
const menuModel = ref([
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => handleDelete(selectedOrderStatus.id)}
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
const onRowEdit = (data) => {
  editingRows.value.push(data);
}
// Функции для инициализации, сохранения и отмены редактирования
const onRowEditInit = (event) => {
  let _editingRows = editingRows.value ? [...editingRows.value] : [];

  editingRows.value.push(event);
  // this.$emit('update:editingRows', editingRows);
  // this.$emit('row-edit-init', event);
}


const onRowEditSave = async (event) => {
  try {
    await settingsStore.updateEntity("orderStatuses", event.data.id, event.newData)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Статус обновлен', life: 3000})
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

// const fetchOrderStatuses = () => {
//   settingsStore.fetchEntity('orderStatuses', pagination.value.page, pagination.value.limit, globalFilter.value)
// }
//
// onMounted(() => {
//   fetchOrderStatuses()
// })

const closeModal = () => {

  selectedOrderStatus.value = null
  isModalVisible.value = false
}

const handleSave = async (orderStatusData) => {
  try {
    if (selectedOrderStatus.value) {
      // Редактирование
      await settingsStore.updateEntity('orderStatuses', selectedOrderStatus.value.id, orderStatusData)
      toast.add({severity: 'success', summary: 'Успех', detail: 'Менеджер обновлен', life: 3000})
      isModalVisible.value = false

    } else {
      // Создание
      await settingsStore.createEntity('orderStatuses', orderStatusData)
      coloredRow.value = settingsStore["orderStatuses"][0].id

      toast.add({severity: 'success', summary: 'Успех', detail: 'Менеджер добавлен', life: 3000})
      isModalVisible.value = false

    }
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить данные', life: 3000})
  }
}

const handleDelete = async (id) => {
  confirmDelete(id, async () => {
    await settingsStore.deleteEntity('orderStatuses', id)
  })
}

const handlePageChange = (event) => {
  settingsStore.fetchEntity('orderStatuses', event.page + 1, event.rows, globalFilter.value)
}

const activeTemplate = (rowData) => {
  return rowData.isAccountDisabled ? 'Нет' : 'Да'
}

const onGlobalDebounced = debounce(300, async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    settingsStore.fetchEntity('orderStatuses', pagination.value.page, pagination.value.limit, globalFilter.value)
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

.paginator {
  margin-top: 1rem;
}
</style>
