<!-- /components/settings/StockLog/StockLogTable.vue -->
<template>
  <div class="orderStatus-section">

    <!--    <div v-if="error" class="p-mt-3">-->
    <!--      <p class="p-error">Ошибка: {{ error }}</p>-->
    <!--    </div>-->
    <ContextMenu v-if="canEdit" ref="contextMenu" :model="menuModel"/>
    <DataTable
        :value="store.stockLogs"
        paginator
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first} по {last} из {totalRecords}"
        :rowsPerPageOptions="[10, 1, 25, 50, 100]"
        :rows="store.limit"
        :totalRecords="store.total"
        :lazy="true"
        @page="handlePageChange"
        :loading="store.loading"
        scrollable
        contextMenu v-model:contextMenuSelection="selectedStockLog"
        @rowContextmenu="onRowContextMenu"
        :row-class="rowClass"
        @row-click="onRowClick"
        dataKey="id"
        :filters="filters"
        :filterDisplay="'row'"
        @filter="onFilter"
        v-model:expanded-rows="expandedRows"
    >
      <template #header>
        <div class="flex justify-between items-center gap-x-10">
          <div style="white-space: nowrap;">Всего: {{ store.total }}</div>
          <div  class=" flex gap-3 items-center">
            <div v-if="!props.isForSales" class="flex">
              <Checkbox v-model="searchOnlyConfirmed" @change="onIsConfirmedCheckbox()" inputId="isConfirmed"
                        :binary="true"/>
              <label for="isConfirmed" class="ml-2">Неподтвержденные</label></div>

            <IconField>
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText style="width: 100%" v-model="globalFilter" placeholder="по всем полям"
                         @input="onGlobalFilter"/>
            </IconField>
          </div>
        </div>
      </template>
      <Column expander style="width: 5rem" />
      <Column field="timestamp" header="Дата">
        <template #filter="{ filterModel, }">
          <FloatLabel variant="on">
            <DatePicker
                v-model="filterModel.value"
                selectionMode="range"
                dateFormat="dd.mm.y"
                @month-change="onMonthChange"
                @date-select="setDateToFilter"
            >
              <template #date="slotProps">
                <strong v-if="store.stockLogsDates.includes(slotProps.date.day)"
                        style="background-color: #0369a">{{ slotProps.date.day }}</strong>
                <template v-else>{{ slotProps.date.day }}</template>
              </template>
            </DatePicker>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
          <!--          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="pi" />-->
        </template>
        <template #body="{data}">
          <div class="flex gap-3">
            <div>
              <div>{{ formatDate(data.timestamp) }}</div>
              <small style="display: block; color: gray;">{{ formatTime(data.timestamp) }}</small>
            </div>
            <div
                v-if="(authStore.user.roles.includes('ADMIN') || authStore.user.settings.canApproveStockOperation)"
            >
              <Tag
                  v-if="!data.isConfirmed"
                  severity="info"
                  icon="pi pi-check"
                  value="Подтвердить"
                  style="cursor:pointer"
                  @click="onConfirm(data)"
              />
              <Tag
                  v-if="data.isConfirmed"
                  severity="success"
                  title="Подтвердил"
                  :value="getManagerName(data.confirmedById)"
                  style="cursor:pointer"
                  @click="onConfirm(data)"
              />
            </div>
          </div>
        </template>
      </Column>
      <Column field="managers" header="Менеджер">
        <template #filter="{ field, filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="managers" optionLabel="name" option-value="id" />
        </template>
        <template #body="{data}">
          {{ data.user.name }}
        </template>
      </Column>
      <Column field="productName" header="Название">
        <template #filter="{ filterModel, filterCallback }">
          <FloatLabel variant="on">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()"/>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
        </template>
        <template #body="{data}">
          {{ data.product.name }}
        </template>
      </Column>
      <Column field="sku" header="Артикул">
        <template #filter="{ filterModel, filterCallback }">
          <FloatLabel variant="on">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()"/>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
        </template>
        <template #body="{data}">
          {{ data.product.sku }}
        </template>
      </Column>
      <Column field="count" header="Количество">
        <template #body="{data}">
          {{ data.count }}
        </template>
      </Column>

      <Column field="activityType" header="Операция">
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="props.isForSales ? warehouseSalesShort :warehouseStockTypesShort" optionLabel="name" option-value="type" />
        </template>
        <template #body="{data}">
          <Tag :value="localeActivityType(data)" :severity="getSeverity(data)"/>
        </template>
      </Column>

      <Column field="warehouseIds" header="Склад">
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect :options="settingsStore.warehouses" v-model="filterModel.value" @change="filterCallback()" optionLabel="name" option-value="id" />
        </template>
        <template #body="{data}">
          <div>
            <div v-if="['ADD', 'TRANSFER'].includes(data.activityType)">{{data.toWarehouse.name }}</div>
            <div v-if="['REMOVE', 'SOLD'].includes(data.activityType)" style="color: red;">из {{ data.fromWarehouse.name }}</div>
            <small v-if="data.activityType === 'TRANSFER'" style="display: block; color: red;">из
              {{ data.fromWarehouse.name }}</small>
          </div>
        </template>
      </Column>

      <Column header="Действия" filter-field="isConfirmed" style="min-width: 6rem">
        <template #body="{ data }">
          <div class="flex space-x-2">
            <Button
                v-if="authStore.user.roles.includes('ADMIN')"
                icon="pi pi-pencil"
                class="p-button-text"
                @click="data.activityType !== 'TRANSFER' ? emits('onEditStockLogAdd',data) : emits('onEditStockLogTransfer',data)"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                @click="onDeleteStockLog(data.id)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-4">
          <h5>История изменения заказа {{slotProps.data.id}}</h5>
          <DataTable :value="slotProps.data.editedByUsers">

            <Column field="timestamp" header="Дата">
              <template #body="{data}">
                <div>
                  <div>{{ formatDate(data.timestamp) }}</div>
                  <small style="display: block; color: gray;">{{ formatTime(data.timestamp) }}</small>
                </div>
              </template>
            </Column>
            <Column field="user" header="Менеджер">
              <template #body="{data}">
                {{ data.user.name }}
              </template>
            </Column>
            <Column field="product.name" header="Название">
              <template #body="{data}">
                {{ data.product?.name }}
              </template>
            </Column>
            <Column field="sku" header="Артикул">
              <template #body="{data}">
                {{ data.product?.sku }}
              </template>
            </Column>
            <Column field="count" header="Количество">
              <template #body="{data}">
                {{ data.count }}
              </template>
            </Column>
            <Column field="activityType" header="Операция">
              <template #body="{data}">
                <Tag v-if="data.activityType" :value="localeActivityType(data)" :severity="getSeverity(data)"/>
              </template>
            </Column>
            <Column field="warehouseIds" header="Склад">
              <template #body="{data}">
                <div v-if="data.fromWarehouse || data.toWarehouse">
                  <div>{{ data.activityType === "REMOVE" ? data.fromWarehouse?.name : data.toWarehouse?.name }}</div>
                  <small v-if="data.activityType === 'TRANSFER'" style="display: block; color: red;">из
                    {{ data.fromWarehouse?.name }}</small>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>

    </DataTable>


  </div>

</template>

<script setup lang="ts">

import {type PropType, ref} from "vue";
import {debounce} from "@antfu/utils";
import {useSettingsStore} from "~/stores/settings";
import {type StockLog, warehouseStockTypesShort} from "~/stores/stock";
import {cursor} from "sisteransi";
import {formatDate, formatTime} from "~/utils/date-utils";
import {warehouseSalesShort} from "~/stores/sales";
// import StockLogAddForm from "~/components/settings/StockLog/StockLogAddForm.vue";


// const {canEdit, stockLogs, stockLogsDates, managers, limit, total, loading, isForSales} = defineProps<{
//   canEdit: boolean,
//   stockLogs: StockLog[],
//   stockLogsDates: any,
//   managers: any,
//   limit: number,
//   total: number,
//   loading: boolean,
//   isForSales: boolean
// }>()
// const stockLogs = computed(() => stockLogsStore.stockLogs)

const props = defineProps({
  canEdit: Boolean,
  managers: {
    type: Array,
    required: true
  },
  isForSales: Boolean,
  store: Object,
})

const emits = defineEmits(['onEditStockLogAdd', 'onEditStockLogTransfer'])
// const stockLogsStore = useStockLogsStore()
const toast = useMessages()
const {confirmDelete, confirmAction} = useConfirmation()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const settingsStore = useSettingsStore()
const selectedStockLog = ref(null) // null для создания, объект для редактирования
const coloredRow = ref(0);
const editingRows = ref([])
const expandedRows = ref({})

const searchOnlyConfirmed = ref(false)
// const stockLogsDates = computed(() => stockLogsStore.stockLogsDates)
// const pagination = computed(() => stockLogsStore.pagination)
// const error = computed(() => stockLogsStore.error.stockLogs)
const globalFilter = computed(() => props.store.filters.global)
const isDarkTheme = computed(() => themeStore.isDarkTheme)
// const managers = computed(() => stockLogsStore.managers)

const contextMenu = ref();
const menuModel = ref([
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => handleDelete(selectedStockLog.id)}
]);

const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent);
};
const onRowClick = (event) => {
  coloredRow.value = event.data.id;
}

const onRowEditSave = async (event) => {
  try {
    await props.store.updateStockLog(event.data.id, event.newData)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Тип доставки обновлен', life: 3000})
    // editingRowKey.value = null
  } catch (err) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить статус', life: 3000})
  }
}

const onDeleteStockLog = async (id) => {
  props.store.deleteStockLog(id)
}

const rowClass = (data) => {
  return [
    {'!bg-[var(--p-surface-100)]': data.id === coloredRow.value && !isDarkTheme.value},
    {'!bg-[var(--p-surface-800)]': data.id === coloredRow.value && isDarkTheme.value},
    {"transaction-none": true}];
}

const filters = ref({
  name: {value: null},
  productName: {value: null},
  sku: {value: null},
  managers: {value: null},
  timestamp: {value: null},
  startDate: {value: null},
  endDate: {value: null},
  activityType: {value: null},
  warehouseIds: {value: null}
})
const initFilters = () => {
  filters.value = {
    name: {value: null},
    productName: {value: null},
    sku: {value: null},
    managers: {value: null},
    timestamp: {value: null},
    startDate: {value: null},
    endDate: {value: null},
    activityType: {value: null },
    warehouseIds: {value: null}

  }
}
// initFilters()

const fetchStockLogs = () => {
  props.store.fetchStockLogs()
}

onMounted(() => {
  fetchStockLogs()
  const today = new Date()
  props.store.fetchStockDates(today.getMonth() + 1, today.getFullYear())
  // props.store.fetchManagers()
  settingsStore.fetchEntity('warehouses', 1, 100)
})

const handleDelete = async (id) => {
  confirmDelete(id, async () => {
    await props.store.deleteEntity('stockLogs', id)
  })
}

const handlePageChange = (event) => {
  props.store.fetchStockLogs(event.page + 1, event.rows)
}

const onGlobalDebounced = debounce(300, async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    props.store.fetchStockLogs(props.store.currentPage, store.limit, globalFilter.value)
  }
})


const onGlobalFilter = async (event) => {
  onGlobalDebounced(event)
}

const getSeverity = (stockLog) => {
  switch (stockLog.activityType) {
    case 'ADD':
      return 'success';

    case 'TRANSFER':
      return 'warn';

    case 'SOLD':
      return 'info';

    default:
      return 'danger';
  }
};

const localeActivityType = (stockLog) => {
  switch (stockLog.activityType) {
    case 'ADD':
      return 'Добавил';

    case 'TRANSFER':
      return 'Переместил';

    case 'SOLD':
      return 'Продано';

    default:
      return 'Неизвестно';
  }
};


const onMonthChange = (event) => {
  const {month, year} = {...event}
  props.store.fetchStockDates(month, year)
}

const onFilterDebounced = debounce(300, async (event) => {

  await props.store.setFilters(event.filters)
  // Явный сброс глобального фильтра
  // if (globalFilter.value || globalFilter.value !== '') {
  //   globalFilter.value = null;
  // }

  // Если есть примененные фильтры, вызываем поиск, иначе сбрасываем фильтры
  props.store.loading = true;
  await props.store.fetchStockLogs();
  props.store.loading = false;

});

const onFilter = async (event: any) => {
  onFilterDebounced(event);
};

const onIsConfirmedCheckbox = async () => {
  await props.store.setFilter('isConfirmed', searchOnlyConfirmed.value);
  props.store.loading = true;
  await props.store.fetchStockLogs(); //todo избавиться от лишнего вызова, а меня данные в хранилище
  props.store.loading = false;
}



const setDateToFilter = async (date: any) => {
 console.log(date)
  const startDateInited = props.store.filters.startDate
  const endDateInited = props.store.filters.endDate
  if (startDateInited && startDateInited.value
      && !endDateInited.value) {
    if (startDateInited.value > date) {
      await props.store.setFilter('startDate', date)
    } else {
      await props.store.setFilter('endDate', date)
    }
  } else {
    await props.store.setFilter('startDate', date)
    await props.store.setFilter('endDate', null)
  }
  // await stockLogsStore.setFilters(filters.value)
  await props.store.fetchStockLogs()
}

const onConfirm = async (stockLog) =>{
await props.store.confirmStockLogOperation(stockLog.id)
}

const getManagerName = (id) => {
  return props.managers.find(m => m.id == id)?.name
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
