<!-- components/ServerSideDataTable.vue -->

<template>

    <DataTable
        :value="data"
        paginator
        :rows="limit"
        :rowsPerPageOptions="rowsPerPageOptions"
        :totalRecords="total"
        @page="handlePageChange"
        :loading="loading"
        :filterDisplay="'row'"
        :responsiveLayout="'scroll'"
        :globalFilterFields="globalFilterFields"
        :v-model:filters="filters"
    >
      <template #header>
        <div class="flex justify-between">
          <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilters()" />
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="localFilters.global.value"
                       placeholder="Keyword Search"
                       @input="onGlobalFilter"
            />
          </IconField>
        </div>
      </template>
      <template #empty>
        <div>Записей не найдено.</div>
      </template>
      <template #loading>
        <div>Загрузка данных. Пожалуйста, подождите.</div>
      </template>

      <!-- Генерация столбцов на основе конфигурации -->
      <template v-for="column in columns" :key="column.field">


        <Column
            :field="column.field"
            :header="column.header"
            :sortable="column.sortable"
            :style="column.style"
            :filter="column.filter"
            :filterField="column.filterField || column.field"
          :filterMatchMode="column.filterMatchMode || 'contains'"
        >
          <!-- Слот для тела столбца -->
          <template #body="{ data }">
            <slot :name="`body-${column.field}`" :data="data" />
          </template>

          <!-- Слот для фильтра столбца -->
          <template #filter="{ filterModel, filterCallback }">
            <slot
              :name="`filter-${column.field}`"
              :filterModel="filters[column.field]"
              :filterCallback="filterCallback"
            />
          </template>

        </Column>
      </template>
    </DataTable>

</template>

<script setup lang="ts">

// Определение свойств, которые принимает компонент
import {debounce} from "@antfu/utils";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  columns: {
    type: Array,
    required: true,
  },
  globalFilterFields: {
    type: Array,
    default: () => [],
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50],
  },
  limit: {
    type: Number,
    default: 10,
  },
  page: {
    type: Number,
    default: 1,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Объявление событий, которые компонент будет эмитировать
const emit = defineEmits([
  'update:page',
  'update:limit',
  'update:filters',
  'clear:filters',
])

// Локальные фильтры для обработки внутри компонента
const localFilters = ref({
  global: { value: '', matchMode: 'contains' },
})

// Watch для синхронизации локального глобального фильтра с пропсами
watch(
  () => props.filters.global,
  (newVal) => {
    localFilters.value.global.value = newVal.value || ''
  },
  { immediate: true }
)

// Дебаунс для уменьшения количества запросов при вводе
const debouncedFilterUpdate = debounce(300, () => {
  emit('update:filters', { ...props.filters, global: { ...localFilters.value.global } })
  emit('update:page', 1) // Сброс на первую страницу при изменении фильтров
})

// Обработчик глобального фильтра
const onGlobalFilter = () => {
  debouncedFilterUpdate()
}

// Обработчик изменения страницы или количества записей
const handlePageChange = (event: any) => {
  emit('update:page', event.page + 1)
  emit('update:limit', event.rows)
}

// Метод для очистки фильтров
const clearFilters = () => {
  emit('clear:filters')
}
</script>

<style scoped>
/* Стили по необходимости */
</style>
