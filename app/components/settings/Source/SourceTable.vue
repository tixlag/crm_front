<!-- /components/settings/Source/SourceTable.vue -->
<template>
  <div class="orderStatus-section">
    <div class="flex justify-between mb-4">
      <h2>Источники заказов</h2>
    </div>
    <div v-if="error" class="p-mt-3">
      <p class="p-error">Ошибка: {{ error }}</p>
    </div>
    <ContextMenu ref="contextMenu" :model="menuModel"/>
    <DataTable
        :value="sources"
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
        contextMenu v-model:contextMenuSelection="selectedSource"
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
    <SourceAddForm/>


  </div>
</template>

<script setup>

import {ref} from "vue";
import {debounce} from "@antfu/utils";
import SourceAddForm from "~/components/settings/Source/SourceAddForm.vue";


const settingsStore = useSettingsStore()
const toast = useMessages()
const {confirmDelete, confirmAction} = useConfirmation()
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.isDarkTheme)

const selectedSource = ref(null) // null для создания, объект для редактирования
const coloredRow = ref(0);
const editingRows = ref([])

const sources = computed(() => settingsStore.sources)
const pagination = computed(() => settingsStore.pagination.sources)
const loading = computed(() => settingsStore.loading.sources)
const error = computed(() => settingsStore.error.sources)
const globalFilter = computed(() => settingsStore.filters.sources)


const contextMenu = ref();
const menuModel = ref([
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => handleDelete(selectedSource.id)}
]);

const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent);
};
const onRowClick = (event) => {
  coloredRow.value = event.data.id;
}

const onRowEditSave = async (event) => {
  try {
    await settingsStore.updateEntity("sources", event.data.id, event.newData)
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

// const fetchSources = () => {
//   settingsStore.fetchEntity('sources', pagination.value.page, pagination.value.limit, globalFilter.value)
// }
//
// onMounted(() => {
//   fetchSources()
// })

const handleDelete = async (id) => {
  confirmDelete(id, async () => {
    await settingsStore.deleteEntity('sources', id)
  })
}

const handlePageChange = (event) => {
  settingsStore.fetchEntity('sources', event.page + 1, event.rows, globalFilter.value)
}

const onGlobalDebounced = debounce(300, async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    settingsStore.fetchEntity('sources', pagination.value.page, pagination.value.limit, globalFilter.value)
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
