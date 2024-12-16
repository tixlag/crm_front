<template>
  <div :class="{'p-m-4 grid grid-cols-[1fr_5fr] gap-x-5': !themeStore.isOnMobile}">

    <!-- Компонент для категорий -->
    <CategoryTreeTable
        :categories="productsStore.categories"
        :categoryTree="categoryTree"
        :selectedCategory="selectedCategory"
        :selectedKey="selectedKey"
        :canEdit="true"
    :canAdd="true"
    @edit="onEditCategory"
    @add="showAddCategoryDialog"
    @delete="onDeleteCategory"
    @select="onCategorySelect"
    @unselect="onCategoryUnselect"
    @update:selectedKey="onCategorySelect"
    />

    <!-- Компонент для продуктов -->
    <ProductsDataTable
        :products="productsStore.products"
        :limit="productsStore.limit"
        :total="productsStore.total"
        :loading="productsStore.loading"
        :canEdit="true"
    :canAdd="true"
    @add="addProduct"
    @edit="editProduct"
    @delete="onDeleteProduct"
    @pageChange="onPage"
    @filterChange="onFilter"
    @globalSearch="onGlobalFilter"
    :globalFilterFields="['id', 'name', 'sku', 'comment', 'purchasePrice', 'recommendedPrice']"
    >
    <!-- Определение динамических колонок для складов -->
    <template #columns="{ dynamicWarehouses }">
      <Column field="id" header="ID">
<!--        <template #body="{ data }">{{ data.id }}</template>-->
<!--        <template #filter="{ filterModel, filterCallback }">-->
<!--          <FloatLabel variant="on">-->
<!--            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" />-->
<!--            <label class="pi">&#xe908;</label>-->
<!--          </FloatLabel>-->
<!--        </template>-->
      </Column>
      <Column field="name" header="Название" frozen>
        <template #body="{ data }">{{ data.name }}</template>
<!--        <template #filter="{ filterModel, filterCallback }">-->
<!--          <FloatLabel variant="on">-->
<!--            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" />-->
<!--            <label class="pi">&#xe908;</label>-->
<!--          </FloatLabel>-->
<!--        </template>-->
      </Column>
      <!-- Другие стандартные колонки -->

      <!-- Динамические колонки для складов -->
      <Column
          v-for="warehouse in dynamicWarehouses"
          :key="warehouse.id"
          :header="warehouse.name"
      >
        <template #body="{ data }">
          {{ getStockCount(data, warehouse.id) }}
        </template>
      </Column>
    </template>
    </ProductsDataTable>

  </div>
</template>

<script setup lang="ts">

// Инициализация хранилища и других зависимостей
import CategoryTreeTable from "~/components/products/CategoryTreeTable.vue";
import ProductsDataTable from "~/components/products/ProductsDataTable.vue";

const productsStore = useProductsStore()
const themeStore = useThemeStore()
const { confirmDelete } = useConfirmation()
const toast = useMessages()

// Локальные состояния и переменные
const addCategoryDialog = ref(false)
const editCategoryDialog = ref(false)

const selectedCategory = ref({})
const selectedKey = ref({})

// Вычисляемое дерево категорий
const categoryTree = computed(() => {
  const map = {}
  let roots = []
  productsStore.categories.forEach(cat => {
    map[cat.id] = { data: cat, children: [] }
  })
  productsStore.categories.forEach(cat => {
    if (cat.parentId) {
      map[cat.parentId].children.push(map[cat.id])
    } else {
      roots.push(map[cat.id])
    }
  })

  function addKeys(items, parentKey = '') {
    return items.map((item, index) => {
      const key = parentKey === '' ? `${index}` : `${parentKey}-${index}`

      return {
        ...item,
        key,
        children: item.children.length > 0 ? addKeys(item.children, key) : [],
      }
    })
  }

  roots = addKeys(roots)
  return { roots, map }
})

// Функции обработки событий для категорий
const onEditCategory = (category) => {
  selectedCategory.value = { ...category }
  editCategoryDialog.value = true
}

const showAddCategoryDialog = (parentId) => {
  // Логика для отображения диалога добавления категории
}

const onDeleteCategory = (id) => {
  confirmDelete(id, () => {
    productsStore.deleteCategory(id)
    productsStore.fetchCategories()
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория удалена' })
  }, 'Удаляются также все подкатегории и продукты в них')
}

const onCategorySelect = async (category) => {
  selectedCategory.value = category
  await productsStore.fetchProductsByCategoryId(category.id)
}

const onCategoryUnselect = async () => {
  selectedCategory.value = {}
  await productsStore.fetchProducts()
}

// Функции обработки событий для продуктов
const addProduct = async (product) => {
  await productsStore.createProduct(product)
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Товар создан' })
  await productsStore.fetchProducts()
}

const editProduct = async (id, updatedProduct) => {
  await productsStore.updateProduct(id, updatedProduct)
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Товар изменен' })
  await productsStore.fetchProducts()
}

const onDeleteProduct = (id) => {
  confirmDelete(id, () => {
    productsStore.deleteProduct(id)
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Продукт удален' })
    productsStore.fetchProducts()
  })
}

const onPage = async (event) => {
  productsStore.limit = event.rows
  productsStore.currentPage = event.page + 1
  productsStore.loading = true
  if (selectedCategory.value?.id) {
    await productsStore.fetchProductsByCategoryId(selectedCategory.value.id)
  } else {
    await productsStore.fetchProducts()
  }
  productsStore.loading = false
}

const onFilter = async (filters) => {
  await productsStore.searchProductsByForm(filters, selectedCategory.value.id ?? undefined)
}

const onGlobalFilter = async (query) => {
  if (query) {
    await productsStore.searchProductsByString(query, selectedCategory.value.id ?? undefined)
  } else {
    await productsStore.fetchProducts()
  }
}

// Функция для получения количества на складе
const getStockCount = (product, warehouseId) => {
  const stock = product.warehouseProducts.find(s => s.warehouse.id === warehouseId)
  return stock ? stock.count : 0
}

// Загрузка данных при монтировании
onMounted(() => {
  productsStore.fetchCategories()
  productsStore.fetchProducts()
})
</script>

<style scoped>
/* Ваши стили */
</style>
