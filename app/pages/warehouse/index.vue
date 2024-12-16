<!-- pages/warehouse.vue -->
//\todo уведомления при добавлении продуктов на склад
<template>
  <div class="flex justify-between mb-4">
    <h2>Поступления</h2>
    <div class="flex justify-between items-center">
      <div class="flex gap-4">
        <Button label="Сформировать отчет" :plain="true" icon="pi pi-copy" class="p-button-info" @click="reportDialog = !reportDialog"/>
        <Button label="Добавить товар" icon="pi pi-plus" class="p-button-success" @click="showAddProductDialog"/>
        <Button label="Переместить товар" icon="pi pi-split" class="p-button-primary" @click="showMoveProductDialog"/>
      </div>
    </div>
    <Dialog v-model:visible="reportDialog" :modal="true" :closable="true" >
      <h2>Выберите даты</h2>
      <WarehouseTable :canEdit="false" @onAddToWarehouse="onAddToWarehouse" @onReport="onReport"/>
    </Dialog>
  </div>
  <StockLogsTable
      @onEditStockLogAdd="showEditProductDialog"
      @onEditStockLogTransfer="showEditMoveProductDialog"
      :managers="stockLogsStore.managers"
      :isForSales="false"
      :canEdit="false"
      :store="stockLogsStore"
  />
  <div class="p-m-4">

<!--    <ContextMenu ref="contextMenuWarehouse" :model="menuModelWarehouse"/>-->


    <!-- Add Product Dialog -->
    <Dialog v-model:visible="addProductDialog" :modal="true" :closable="true" style="width: 80vw;"
            pt:root:style="padding: 0; background-color: var(--surface-ground);"
    >
      <template #header>
        <div class="inline-flex items-center justify-center gap-2">
          <span id="pv_id_124_header" class="p-dialog-title"
                data-pc-section="title">{{ isEditDialog ? 'Изменить добавленный товар' : 'Добавить товар' }}</span>
          <form class='flex gap-4' @submit.prevent="addSelectedProduct">
            <InputText placeholder="Товар" v-model="productToAdd.name" disabled></InputText>
            <!--            <InputNumber v-model="productToAdd.count"></InputNumber>-->
            <InputNumber pt:pcInputText:root:class="w-100%" v-model="productToAdd.count" style="width: 4rem" :min="0">
            </InputNumber>
            <Select optionLabel="name" :options="settingsStore.warehouses" v-model="productToAdd.warehouse"></Select>
            <DatePicker style="max-width: 6rem" dateFormat="dd.mm.y" v-model="productToAdd.date"/>
            <Button icon="pi pi-plus" type="submit"/>
          </form>
        </div>
      </template>
      <UniversalProducts @clickOnPlusInWarehouseModal="onAddProductToWarehouse" :canEdit="false"/>
    </Dialog>

    <!-- Move Product Dialog -->
    <Dialog header="Переместить товар" v-model:visible="moveProductDialog" :modal="true" :closable="true"
            style="width: 80vw;"
            pt:root:style="padding: 0; background-color: var(--surface-ground);">
      <template #header>
        <div class="inline-flex items-center justify-center gap-2">
          <span id="pv_id_124_header" class="p-dialog-title"
                data-pc-section="title">{{ isEditDialog ? 'Изменить добавленный товар' : 'Добавить товар' }}</span>
          <form class='flex gap-4' @submit.prevent="addSelectedProductMove">
            <InputText placeholder="Товар" v-model="productToMove.name" disabled></InputText>
            <!--            <InputNumber v-model="productToAdd.count"></InputNumber>-->
            <InputNumber pt:pcInputText:root:class="w-100%" v-model="productToMove.count" style="width: 4rem"
                         :min="0"></InputNumber>
            <span>из </span>
            <Select optionLabel="name" :options="warehousesForSelectedProductOnMove"
                    v-model="productToMove.fromWarehouse"></Select>
            <span>перенести в </span>
            <Select optionLabel="name" :options="settingsStore.warehouses" v-model="productToMove.toWarehouse"></Select>
            <DatePicker style="max-width: 6rem" dateFormat="dd.mm.y" v-model="productToMove.date"/>
            <Button icon="pi pi-plus" type="submit"/>
          </form>
        </div>
      </template>
      <UniversalProducts @clickOnPlusInWarehouseModal="onAddProductToMoveWarehouse" :canEdit="false"
                         :with-stocks="false"/>

      <!--      <DataTable-->
      <!--          :value="productsWithStock"-->
      <!--          selectionMode="multiple"-->
      <!--          v-model:selection="selectedProductsToMove"-->
      <!--          dataKey="id"-->
      <!--          paginator-->
      <!--          :rows="10"-->
      <!--          :loading="productsLoading"-->
      <!--          scrollable-->
      <!--          style="height: 400px;"-->
      <!--      >-->
      <!--        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>-->
      <!--        <Column field="id" header="ID"></Column>-->
      <!--        <Column field="name" header="Название"></Column>-->
      <!--        <Column field="sku" header="SKU"></Column>-->
      <!--        <Column field="category.name" header="Категория"></Column>-->
      <!--        <Column header="Количество" :body="quantityBody"></Column>-->
      <!--      </DataTable>-->
      <!--      <div class="p-d-flex p-jc-between p-mt-3">-->
      <!--        <div>-->
      <!--          <label for="targetWarehouse">Целевой склад:</label>-->
      <!--          <Dropdown-->
      <!--              id="targetWarehouse"-->
      <!--              v-model="targetWarehouseId"-->
      <!--              :options="warehousesStore.warehouses"-->
      <!--              optionLabel="name"-->
      <!--              optionValue="id"-->
      <!--              placeholder="Выберите склад"-->
      <!--              class="p-mr-2"-->
      <!--          />-->
      <!--        </div>-->
      <!--        <div>-->
      <!--          <label for="moveCount">Количество:</label>-->
      <!--          <InputNumber id="moveCount" v-model="moveCount" :min="1" class="p-mr-2"/>-->
      <!--        </div>-->
      <!--        <div class="p-d-flex">-->
      <!--          <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="moveProductDialog = false"/>-->
      <!--          <Button label="Переместить" icon="pi pi-check" class="p-button-text" @click="moveSelectedProducts"/>-->
      <!--        </div>-->
      <!--      </div>-->
    </Dialog>
    <div class="flex justify-between mb-4">
      <h2>Продажи</h2>
    </div>
    <StockLogsTable
        @onEditStockLogAdd="showEditProductDialog"
        @onEditStockLogTransfer="showEditMoveProductDialog"
        :managers="stockLogsStore.managers"
        :isForSales="true"
        :canEdit="false"
        :store="salesStore"
    />
<!--    <div class="flex justify-end mb-4">-->
<!--      <Calendar v-model="dateRange" selectionMode="range" :maxDate="new Date()" placeholder="Выберите диапазон дат"/>-->
<!--      <Button label="Показать" icon="pi pi-chart-bar" class="p-button-primary ml-2" @click="fetchStatistics"/>-->
<!--    </div>-->
<!--    <DataTable-->
<!--        :value="statistics"-->
<!--        paginator-->
<!--        :rows="10"-->
<!--        :totalRecords="statisticsTotal"-->
<!--        :loading="statisticsLoading"-->
<!--        scrollable-->
<!--    >-->
<!--      <Column field="productId" header="ID товара"></Column>-->
<!--      <Column field="productName" header="Название товара"></Column>-->
<!--      <Column field="totalSold" header="Всего продано"></Column>-->
<!--    </DataTable>-->
  </div>

</template>

<script setup lang="ts">

// Stores
import {debounce} from "@antfu/utils";
import UniversalProducts from "~/components/products/UniversalProducts.vue";
import WarehouseTable from "~/components/settings/Warehouse/WarehouseTable.vue";
import StockLogsTable from "~/components/warehouses/StockLogsTable.vue";
import WarehouseAddForm from "~/components/settings/Warehouse/WarehouseAddForm.vue";

const warehousesStore = useWarehousesStore()
const productsStore = useProductsStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const stockLogsStore = useStockLogsStore()
const salesStore = useSalesStore()

const toast = useMessages()

// Context Menu
const contextMenuWarehouse = ref()
const selectedWarehouse = ref<any>({})
// const menuModelWarehouse = ref([
//   {label: 'Редактировать', icon: 'pi pi-pencil', command: () => editWarehouse(selectedWarehouse.value)},
//   {label: 'Удалить', icon: 'pi pi-trash', command: () => deleteWarehouse(selectedWarehouse.value.id)},
//   {
//     label: 'Подтвердить',
//     icon: 'pi pi-check',
//     command: () => confirmWarehouse(selectedWarehouse.value.id),
//     visible: (data: any) => !data.isConfirmed && isAdmin
//   }
// ])

// Dialogs
const addProductDialog = ref(false)
const moveProductDialog = ref(false)
const reportDialog = ref(false)
const isEditDialog = ref(false)

// Add Product Modal Data
const allProducts = ref([])
const selectedProductsToAdd = ref([] as any[])

// Добавляем продукт на склад
const productToAdd = ref({
  id: 0,
  productId: 0,
  name: '',
  count: 0,
  warehouse: {},
  date: Date,
})

const productToMove = ref({
  id: 0,
  productId: 0,
  name: '',
  count: 0,
  fromWarehouse: {},
  toWarehouse: {},
  date: Date,
})
const warehousesForSelectedProductOnMove = ref([])

// Move Product Modal Data
const selectedProductsToMove = ref([] as any[])
const targetWarehouseId = ref<number | null>(null)
const moveCount = ref<number>(1)

// Statistics
const dateRange = ref<[Date | null, Date | null]>([null, null])
const statistics = ref([])
const statisticsTotal = ref(0)
const statisticsLoading = ref(false)

// Filters
const warehouseFilter = ref('')
const globalFilter = ref('')
const filters = ref({
  global: {value: null},
  id: {value: null},
  name: {value: null},
  address: {value: null}
})

// Computed //todo избаиться от computed
const isAdmin = computed(() => authStore.user?.roles.includes('ADMIN'))
const warehouses = computed(() => settingsStore.warehouses)

// Fetch all products for Add Product Modal
const fetchAllProducts = async () => {
  // await productsStore.fetchAllProducts()
  // allProducts.value = productsStore.allProducts
  await productsStore.fetchProducts()
  allProducts.value = productsStore.products
}

// Show Add Product Dialog
const showAddProductDialog = async () => {
  productToAdd.value.date = new Date()
  addProductDialog.value = true
}

const showEditProductDialog = async (stockLog) => {
  isEditDialog.value = true
  productToAdd.value.id = stockLog.id
  productToAdd.value.date = new Date(stockLog.timestamp)
  productToAdd.value.productId = stockLog.productId
  productToAdd.value.name = stockLog.product.name
  productToAdd.value.warehouse = stockLog.toWarehouse
  productToAdd.value.count = stockLog.count
  addProductDialog.value = true
}
const showEditMoveProductDialog = async (stockLog) => {
  isEditDialog.value = true
  warehousesForSelectedProductOnMove.value = productsStore.products.find(p => p.id === stockLog.productId).warehouseProducts.map(wp => wp.warehouse)
  productToMove.value.id = stockLog.id
  productToMove.value.date = new Date(stockLog.timestamp)
  productToMove.value.productId = stockLog.productId
  productToMove.value.name = stockLog.product.name
  productToMove.value.toWarehouse = stockLog.toWarehouse
  productToMove.value.fromWarehouse = stockLog.fromWarehouse
  productToMove.value.count = stockLog.count
  moveProductDialog.value = true
}

// Add selected products to warehouse
const addSelectedProduct = async () => {
  if (!isEditDialog.value) {
    await stockLogsStore.addProductToStockLog({
      userId: authStore.user.id,
      productId: productToAdd.value.productId,
      toWarehouseId: productToAdd.value.warehouse.id,
      activityType: 'ADD',
      count: productToAdd.value.count,
      date: productToAdd.value.date
    })
  } else {
    await stockLogsStore.editAddProductToStockLog({
      id: productToAdd.value.id,
      userId: authStore.user.id,
      productId: productToAdd.value.productId,
      toWarehouseId: productToAdd.value.warehouse.id,
      activityType: 'ADD',
      count: productToAdd.value.count,
      date: productToAdd.value.date
    })
  }
}

const addSelectedProductMove = async () => {
  if (!isEditDialog.value) {
    await stockLogsStore.addProductToStockLog({
      userId: authStore.user.id,
      productId: productToMove.value.productId,
      toWarehouseId: productToMove.value.toWarehouse.id,
      fromWarehouseId: productToMove.value.fromWarehouse.id,
      activityType: 'TRANSFER',
      count: productToMove.value.count,
      date: productToMove.value.date
    })
  } else {
    await stockLogsStore.editAddProductToStockLog({
      id: productToMove.value.id,
      userId: authStore.user.id,
      productId: productToMove.value.productId,
      toWarehouseId: productToMove.value.warehouse.id,
      activityType: 'TRANSFER',
      count: productToMove.value.count,
      date: productToMove.value.date
    })
  }
}

// Show Move Product Dialog
const showMoveProductDialog = async () => {
  productToMove.value.date = new Date()
  moveProductDialog.value = true
}

// Move selected products
const moveSelectedProducts = async () => {
  if (!targetWarehouseId.value) {
    // Notify user to select target warehouse
    return
  }
  for (const product of selectedProductsToMove.value) {
    await warehousesStore.moveProduct({
      productId: product.id,
      sourceWarehouseId: selectedWarehouse.value.id,
      targetWarehouseId: targetWarehouseId.value,
      count: moveCount.value
    })
  }
  moveProductDialog.value = false
  warehousesStore.fetchWarehouses()
}

// Edit Warehouse
const editWarehouse = (warehouse: any) => {
  // Implement edit functionality (e.g., open edit dialog)
}

// Delete Warehouse
const deleteWarehouse = async (id: number) => {
  await warehousesStore.deleteWarehouse(id)
  warehousesStore.fetchWarehouses()
}

// Confirm Warehouse Operation
const confirmWarehouse = async (id: number) => {
  await warehousesStore.confirmWarehouseOperation(id)
  warehousesStore.fetchWarehouses()
}

// Context Menu Handler
const onRowContextMenuWarehouse = (event: any) => {
  selectedWarehouse.value = event.data
  contextMenuWarehouse.value.show(event.originalEvent)
}

// Filter Handlers
const onFilter = debounce(300, async () => {
  warehousesStore.setFilter(warehouseFilter.value)
  await warehousesStore.fetchWarehouses()
})

const onFilterEvent = debounce(300, async (event: any) => {
  warehousesStore.setFilters(event.filters)
  await warehousesStore.fetchWarehouses()
})

const onGlobalFilter = debounce(300, async () => {
  if (globalFilter.value) {
    warehousesStore.setGlobalFilter(globalFilter.value)
    await warehousesStore.searchWarehousesByString(globalFilter.value)
  } else {
    warehousesStore.resetFilters()
    await warehousesStore.fetchWarehouses()
  }
})

// Statistics
const fetchStatistics = async () => {
  if (dateRange.value[0] && dateRange.value[1]) {
    statisticsLoading.value = true
    const stats = await warehousesStore.fetchSalesStatistics(dateRange.value[0], dateRange.value[1])
    statistics.value = stats
    statisticsTotal.value = stats.length
    statisticsLoading.value = false
  }
}

const onAddProductToWarehouse = async (product) => {
  productToAdd.value.productId = product.id
  productToAdd.value.name = product.name
}

const onAddProductToMoveWarehouse = async (product) => {
  productToMove.value.productId = product.id
  productToMove.value.name = product.name
  warehousesForSelectedProductOnMove.value = product.warehouseProducts.map(wp => wp.warehouse)
  productToMove.value.fromWarehouse = product.warehouseProducts[0].warehouse
  console.log(productToMove.value.fromWarehouse)
}

const onAddToWarehouse = async (warehouse) => {
  productToAdd.value.warehouse = warehouse
  productToAdd.value.date = new Date()
  addProductDialog.value = true

}

const onReport = async (warehouse, dates) => {
  if (dates.length === 0) {
    toast.showErrorMessage('Ошибка', "Сперва выберите даты")
  }
  let [dateStart, dateEnd] = dates.map(date => {
    return {
      day: date?.getDate(),
      month: date ? date.getMonth() + 1 : undefined,
      year: date?.getFullYear(),
    }
  })
  if (!dateStart) {
    const today = new Date()
    dateStart = {
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    }
  }
  const products = await apiFetch('/products/warehouse-report/' + warehouse.id, {
    params:
        {dateStart, dateEnd}
  })
  const productsHtml = products.map(product => `
  <tr>
    <td>${product.name}</td>
    <td>${product.orderProducts.reduce((acc, orderProduct) => acc + orderProduct.count, 0)}</td>
    <td>${product.warehouseProducts.reduce((acc, orderProduct) => acc + orderProduct.count, 0)}</td>
    <td></td>
  </tr>
  `).join('')
  const htmlContent = `
  <html><head><style>
  table{
    max-width: 700px;
    width:100%;
    border-collapse: collapse;
  }
  table td{
    width: auto;
    overflow: hidden;
    word-wrap: break-word;
  }
</style>

</head><body><span style="color:#0000FF; font-weight:bold;">Склад ${warehouse.name}. Дата: ${dateStart.day}.${dateStart.month}.${dateStart.year} - ${dateEnd.day}.${dateEnd.month}.${dateEnd.year}</span><br>

<table border="1" style="font-size:12px;">
    <tbody>
    <tr>
    <th>Товар</th>
    <th>Продажи</th>
    <th>Остаток</th>
    <th>Остаток по факту</th>
</tr>
${productsHtml}
</tbody></table></body></html>
  `

  const newWindow = window.open('', '_blank');
  newWindow.document.open();
  newWindow.document.write(htmlContent);
  newWindow.document.close();
}

// On Mounted
onMounted(async () => {
  await warehousesStore.fetchWarehouses()
  await stockLogsStore.fetchManagers()
  // await stockLogsStore.fetchStockLogs()
  // const today = new Date()
  // await stockLogsStore.fetchStockDates(today.getMonth() + 1, today.getFullYear())
  // await settingsStore.fetchEntity('warehouses', 1, 100)
})
</script>

<style scoped>
.p-field {
  margin-bottom: 1rem;
}
</style>
