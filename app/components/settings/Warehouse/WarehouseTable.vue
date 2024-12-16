<!-- /components/settings/Warehouse/WarehouseTable.vue -->
<template>
  <div class="orderStatus-section" :class="{'flex gap-6': !canEdit}">
    <div v-if="canEdit" class="flex justify-between mb-4">
      <h2>Склады</h2>
    </div>
    <div v-if="error" class="p-mt-3">
      <p class="p-error">Ошибка: {{ error }}</p>
    </div>

      <DatePicker
          v-if="!canEdit"
          v-model="datesForReport"
          selectionMode="range"
          dateFormat="dd.mm.y"
          @month-change="onMonthChange"
          inline
      >
        <template #date="slotProps">
          <strong v-if="stockLogsStore.datesWithSoled.includes(slotProps.date.day)"
                  style="color: red; border-radius: 50%; scale: 1.1">{{ slotProps.date.day }}</strong>
          <template v-else>{{ slotProps.date.day }}</template>
        </template>
      </DatePicker>

    <ContextMenu v-if="canEdit" ref="contextMenu" :model="menuModel"/>
    <DataTable
        :value="warehouses"
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
        contextMenu v-model:contextMenuSelection="selectedWarehouse"
        @rowContextmenu="onRowContextMenu"
        :row-class="rowClass"
        editMode="row"
        @row-click="onRowClick"
        @row-edit-save="onRowEditSave"
        dataKey="id"
    >
      <template #header>
        <div class="flex justify-between items-center gap-x-10">
          <div style="white-space: nowrap;">Всего: {{ pagination.total }}</div>
          <IconField v-if="canEdit">
            <InputIcon>
              <i class="pi pi-search"/>
            </InputIcon>
            <InputText style="width: 100%" v-model="globalFilter" placeholder="по всем полям" @input="onGlobalFilter"/>
          </IconField>
        </div>
      </template>
      <Column field="id" header="ID"v-if="canEdit"></Column>
      <Column field="name" header="Название"class="min-w-50 max-w-50">
        <template #editor="{data, field}">
          <InputText v-model="data[field]" />
        </template>
      </Column>
      <Column field="color" header="Цвет" v-if="canEdit" >
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
      <Column v-if="canEdit" :rowEditor="true" class="w-30 max-w-30 flex flex-row-reverse"></Column>
      <Column v-if="canEdit">
        <template #editor></template>
        <template #body="{data}">

          <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger"
              @click="handleDelete(data.id)"
          />
        </template>
      </Column>
      <Column v-if="!canEdit">
        <template #editor></template>
        <template #body="{data}">

          <Button
              icon="pi pi-plus"
              class="p-button-text"
              title="Добавить продкут на склад"
              @click="emits('onAddToWarehouse',data)"
          /><Button
              icon="pi pi-file-pdf"
              class="p-button-text"
              title="Создать отчет за выбранные даты"
              style="color:deepskyblue"
              @click="emits('onReport',data, datesForReport)"
          />
        </template>
      </Column>

    </DataTable>
    <WarehouseAddForm v-if="canEdit"/>


  </div>
</template>

<script setup>

import {ref} from "vue";
import {debounce} from "@antfu/utils";
import WarehouseAddForm from "~/components/settings/Warehouse/WarehouseAddForm.vue";

const props = defineProps({
  canEdit: {Boolean, required: false}
})
const emits = defineEmits(['onAddToWarehouse', 'onReport'])


const settingsStore = useSettingsStore()
const toast = useMessages()
const {confirmDelete, confirmAction} = useConfirmation()
const themeStore = useThemeStore()
const stockLogsStore = useStockLogsStore()
const isDarkTheme = computed(() => themeStore.isDarkTheme)


const selectedWarehouse = ref(null) // null для создания, объект для редактирования
const coloredRow = ref(0);
const editingRows = ref([])
const datesForReport = ref([])


const warehouses = computed(() => settingsStore.warehouses)
const pagination = computed(() => settingsStore.pagination.warehouses)
const loading = computed(() => settingsStore.loading.warehouses)
const error = computed(() => settingsStore.error.warehouses)
const globalFilter = computed(() => settingsStore.filters.warehouses)


const contextMenu = ref();
const menuModel = ref([
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => handleDelete(selectedWarehouse.id)}
]);

const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent);
};
const onRowClick = (event) => {
  coloredRow.value = event.data.id;
}

const onRowEditSave = async (event) => {
  try {
    await settingsStore.updateEntity("warehouses", event.data.id, event.newData)
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

// const fetchWarehouses = () => {
//   settingsStore.fetchEntity('warehouses', pagination.value.page, pagination.value.limit, globalFilter.value)
// }
//
// onMounted(() => {
//   fetchWarehouses()
// })

const handleDelete = async (id) => {
  confirmDelete(id, async () => {
    await settingsStore.deleteEntity('warehouses', id)
  })
}

const handlePageChange = (event) => {
  settingsStore.fetchEntity('warehouses', event.page + 1, event.rows, globalFilter.value)
}

const onGlobalDebounced = debounce(300, async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    settingsStore.fetchEntity('warehouses', pagination.value.page, pagination.value.limit, globalFilter.value)
  }
})


const onGlobalFilter = async (event) => {
  onGlobalDebounced(event)
}

const onMonthChange = (event) => {
  const {month, year} = {...event}
  stockLogsStore.fetchDatesWithSoled(month, year)
}

// const setDateToFilter = async (date: any) => {
//   console.log(date)
//   const startDateInited = datesForReport[0]
//   const endDateInited = datesForReport[1]
//   if (startDateInited && startDateInited.value
//       && !endDateInited.value) {
//     if (startDateInited.value > date) {
//       await stockLogsStore.setFilter('startDate', date)
//     } else {
//       await stockLogsStore.setFilter('endDate', date)
//     }
//   } else {
//     await stockLogsStore.setFilter('startDate', date)
//     await stockLogsStore.setFilter('endDate', null)
//   }
//   // await stockLogsStore.setFilters(filters.value)
//   await stockLogsStore.fetchStockLogs()
// }

</script>

<style scoped>
.orderStatus-section {
  margin-bottom: 2rem;
}

.header h3 {
  margin: 0;
}

</style>
