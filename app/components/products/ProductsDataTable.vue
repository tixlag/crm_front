<template>
  <div class="products-section">
    <div class="flex justify-between mb-4">
      <h2>Продукты</h2>
      <Button v-if="canAdd" label="Добавить" icon="pi pi-plus" @click="handleAddProduct" />
    </div>

    <!-- Контекстное меню для продуктов -->
    <ContextMenu ref="contextMenuProducts" :model="menuModel" v-if="canEdit" />

    <!-- Таблица продуктов -->
    <DataTable
        :value="products"
        paginator
        :rows="limit"
        :totalRecords="total"
        :lazy="true"
        @page="onPage"
        :loading="loading"
        :filters="filters"
        :filterDisplay="'row'"
        :globalFilterFields="globalFilterFields"
        @filter="onFilter"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first} по {last} из {totalRecords}"
        contextMenu
        v-model:contextMenuSelection="selectedProduct"
        @rowContextmenu="handleRowContextMenu"
        scrollable
    >
      <template #header>
        <div class="flex justify-between items-center gap-x-10">
          <div style="white-space: nowrap;">Всего: {{ total }}</div>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
                style="width: 100%"
                v-model="searchQuery"
                placeholder="по всем полям"
                @input="onGlobalFilter"
            />
          </IconField>
        </div>
      </template>

      <template #empty>
        Нет продуктов.
      </template>

      <template #loading>
        Загрузка данных продуктов. Пожалуйста, подождите.
      </template>

      <!-- Определение колонок динамически через слот -->
      <slot name="columns" :dynamicWarehouses="dynamicWarehouses" />

      <Column v-if="canEdit" header="Действия" style="min-width: 6rem">
        <template #body="{ data }">
          <div class="flex space-x-2">
            <Button
                icon="pi pi-pencil"
                class="p-button-text"
                @click="() => handleEditProduct(data)"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                @click="() => handleDeleteProduct(data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Диалоги для добавления и редактирования продуктов -->
    <Dialog
        v-if="canAdd"
        header="Добавить товар"
        v-model:visible="addProductDialog"
        :modal="true"
        :closable="true"
    >
      <form @submit.prevent="addProduct">
        <div class="p-fluid">
          <div class="p-field">
            <label for="name">Название</label>
            <InputText id="name" v-model="newProduct.name" autofocus required />
          </div>
          <div class="p-field">
            <label for="sku">Артикул</label>
            <InputText id="sku" v-model="newProduct.sku" required/>
          </div>
          <div class="p-field">
            <label>Комментарии</label>
            <div v-for="(comment, index) in newProduct.comments" :key="index" class="mb-2">
              <InputText
                  label="Комментарий"
                  name="comment"
                  :id="`comment-${index}`"
                  v-model="newProduct.comments[index].content"
                  required
              />
              <Button
                  v-if="newProduct.comments.length > 1"
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger"
                  @click="() => removeField('comments', index, 'create')"
              />
            </div>
            <Button
                type="button"
                label="Добавить комментарий"
                icon="pi pi-plus"
                class="p-button-text"
                @click="() => addField('comments', 'create')"
            />
          </div>
          <!-- Другие поля формы -->
        </div>
        <div class="p-d-flex p-jc-end">
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="addProductDialog = false" />
          <Button label="Add" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </Dialog>

    <Dialog
        v-if="canEdit"
        header="Редактировать товар"
        v-model:visible="editProductDialog"
        :modal="true"
        :closable="true"
    >
      <form @submit.prevent="updateProduct">
        <div class="p-fluid">
          <!-- Поля для редактирования товара -->
        </div>
        <div class="p-d-flex p-jc-end">
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="editProductDialog = false" />
          <Button label="Save" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from '@antfu/utils'

// Определение свойств компонента
const props = defineProps({
  products: { type: Array, required: true },
  limit: { type: Number, required: true },
  total: { type: Number, required: true },
  loading: { type: Boolean, required: true },
  canEdit: { type: Boolean, default: true },
  canAdd: { type: Boolean, default: true },
  onAdd: { type: Function, required: false },
  onEdit: { type: Function, required: false },
  onDelete: { type: Function, required: false },
  onPageChange: { type: Function, required: false },
  onFilterChange: { type: Function, required: false },
  onGlobalSearch: { type: Function, required: false },
  globalFilterFields: { type: Array, default: () => ['id', 'name', 'sku', 'comment', 'purchasePrice', 'recommendedPrice'] },
})

// Определение событий
const emits = defineEmits(['add', 'edit', 'delete', 'pageChange', 'filterChange', 'globalSearch'])

const { confirmDelete } = useConfirmation()
const toast = useMessages()

// Локальные состояния
const addProductDialog = ref(false)
const editProductDialog = ref(false)
const newProduct = ref({
  name: '',
  sku: '',
  categoryId: null,
  purchasePrice: 0,
  recommendedPrice: 0,
  comments: [{content: ''}],
})
const selectedProduct = ref(null)
const selectedKey = ref({})
const categoryFilter = ref({})
const searchQuery = ref('')
const contextMenuProducts = ref()

// Контекстное меню
const menuModel = computed(() => {
  if (!props.canEdit) return []
  return [
    {
      label: 'View',
      icon: 'pi pi-fw pi-search',
      command: () => handleEditProduct(selectedProduct.value),
    },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-times',
      command: () => handleDeleteProduct(selectedProduct.value.id),
    },
  ]
})

// Обработчики событий
const handleRowContextMenu = (event) => {
  if (props.canEdit) {
    contextMenuProducts.value.show(event.originalEvent)
  }
}

const handleAddProduct = () => {
  newProduct.value = {
    name: '',
    sku: '',
    categoryId: null,
    purchasePrice: 0,
    recommendedPrice: 0,
    comments: [{content: ''}],
  }
  addProductDialog.value = true
}

const handleEditProduct = (product) => {
  selectedProduct.value = { ...product }
  editProductDialog.value = true
}

const handleDeleteProduct = (id) => {
  confirmDelete(id, () => {
    emits('delete', id)
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Продукт удален' })
  })
}

const addProduct = async () => {
  await props.onAdd && props.onAdd(newProduct.value)
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Товар создан' })
  addProductDialog.value = false
}

const updateProduct = async () => {
  await props.onEdit && props.onEdit(selectedProduct.value.id, selectedProduct.value)
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Товар изменен' })
  editProductDialog.value = false
}

// Функции фильтрации
const onPage = (event) => {
  emits('pageChange', event)
}

const onFilter = (event) => {
  emits('filterChange', event)
}

const onGlobalFilter = debounce(300, () => {
  emits('globalSearch', searchQuery.value)
})

const addField = (field, type = 'create') => {
  if (type === 'create') {
    newProduct.value[field].push({ content: '' })
  } else {
    selectedProduct.value[field].push({ content: '' })
  }
}

const removeField = (field, index, type = 'create') => {
  if (type === 'create') {
    newProduct.value[field].splice(index, 1)
  } else {
    selectedProduct.value[field].splice(index, 1)
  }
}

const dynamicWarehouses = computed(() => {
  const warehousesSet = new Set()
  props.products.forEach(product => {
    product.warehouseProducts.forEach(stock => {
      if (stock.count > 0) {
        warehousesSet.add(JSON.stringify(stock.warehouse))
      }
    })
  })
  return Array.from(warehousesSet).map(w => JSON.parse(w))
})
</script>

<style scoped>
.products-section {
  /* Ваши стили */
}
</style>
