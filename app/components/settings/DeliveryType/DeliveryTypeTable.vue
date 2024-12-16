<!-- /components/settings/DeliveryType/DeliveryTypeTable.vue -->
<template>
  <div class="orderStatus-section">
    <div class="flex justify-between mb-4">
      <h2>Типы доставки</h2>
    </div>
    <ContextMenu ref="contextMenu" :model="menuModel"/>
    <DataTable
        :value="deliveryTypes"
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
        contextMenu v-model:contextMenuSelection="selectedDeliveryType"
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
    <DeliveryTypeAddForm/>


  </div>
</template>

<script setup>

import {ref} from "vue";
import {debounce} from "@antfu/utils";
import DeliveryTypeAddForm from "~/components/settings/DeliveryType/DeliveryTypeAddForm.vue";


const settingsStore = useSettingsStore()
const toast = useMessages()
const {confirmDelete, confirmAction} = useConfirmation()
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.isDarkTheme)


const isModalVisible = ref(false)
const selectedDeliveryType = ref(null) // null для создания, объект для редактирования
const coloredRow = ref(0);
const editingRows = ref([])

const deliveryTypes = computed(() => settingsStore.deliveryTypes)
const pagination = computed(() => settingsStore.pagination.deliveryTypes)
const loading = computed(() => settingsStore.loading.deliveryTypes)
const error = computed(() => settingsStore.error.deliveryTypes)
const globalFilter = computed(() => settingsStore.filters.deliveryTypes)


const contextMenu = ref();
const menuModel = ref([
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => handleDelete(selectedDeliveryType.id)}
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
    await settingsStore.updateEntity("deliveryTypes", event.data.id, event.newData)
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

// const fetchDeliveryTypes = () => {
//   settingsStore.fetchEntity('deliveryTypes', pagination.value.page, pagination.value.limit, globalFilter.value)
// }
//
// onMounted(() => {
//   fetchDeliveryTypes()
// })

const closeModal = () => {

  selectedDeliveryType.value = null
  isModalVisible.value = false
}

const handleSave = async (orderStatusData) => {
  try {
    if (selectedDeliveryType.value) {
      // Редактирование
      await settingsStore.updateEntity('deliveryTypes', selectedDeliveryType.value.id, orderStatusData)
      toast.add({severity: 'success', summary: 'Успех', detail: 'Менеджер обновлен', life: 3000})
      isModalVisible.value = false

    } else {
      // Создание
      await settingsStore.createEntity('deliveryTypes', orderStatusData)
      coloredRow.value = settingsStore["deliveryTypes"][0].id

      toast.add({severity: 'success', summary: 'Успех', detail: 'Менеджер добавлен', life: 3000})
      isModalVisible.value = false

    }
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось сохранить данные', life: 3000})
  }
}

const handleDelete = async (id) => {
  confirmDelete(id, async () => {
    await settingsStore.deleteEntity('deliveryTypes', id)
  })
}

const handlePageChange = (event) => {
  settingsStore.fetchEntity('deliveryTypes', event.page + 1, event.rows, globalFilter.value)
}

const activeTemplate = (rowData) => {
  return rowData.isAccountDisabled ? 'Нет' : 'Да'
}

const onGlobalDebounced = debounce(300, async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    settingsStore.fetchEntity('deliveryTypes', pagination.value.page, pagination.value.limit, globalFilter.value)
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
