
<template>
  <UniversalProducts :canEdit="true" />
</template>


<script setup lang="ts">
// import { ref, onMounted } from 'vue'
// import {debounce} from "@antfu/utils";
import UniversalProducts from "~/components/products/UniversalProducts.vue";
import {onMounted} from "vue";

//
//

// const themeStore = useThemeStore()
// const {confirmAction, confirmDelete} = useConfirmation()
// const toast = useMessages()
//
// const addProductDialog = ref(false)
// const editProductDialog = ref(false)
//
// const addCategoryDialog = ref(false)
// const editCategoryDialog = ref(false)
// const categoryFilter = ref({})
// const selectedKey = ref({})
//
// const contextMenuCategory = ref();
// const menuModelCategory = ref([
//   {label: 'Изменить', icon: 'pi pi-fw pi-pencil', command: () => onEditCategory(selectedCategory.value.data)},
//   {label: 'Добавить', icon: 'pi pi-fw pi-plus', command: () => showAddCategoryDialog(selectedCategory.value.data.id)},
//   {label: 'Удалить', icon: 'pi pi-fw pi-trash', command: () => onDeleteCategory(selectedCategory.value.data.id)}
// ]);
// const onRowContextMenuCategory = (event) => {
//   contextMenuCategory.value.show(event.originalEvent);
// };
// const contextMenuProducts = ref();
//
// const menuModelProducts = ref([
//   {label: 'View', icon: 'pi pi-fw pi-search', command: () => editRow()},
//   {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => deleteRow(selectedBuyer)}
// ]);
//
// const onRowContextMenuProducts = (event) => {
//   contextMenuProducts.value.show(event.originalEvent);
// };
//
// const newProduct = ref({
//   name: '',
//   sku: '',
//   categoryId: null as number | null,
//   purchasePrice: 0,
//   recommendedPrice: 0,
//   comments: [{content: ''}],
// })
//
// const selectedProduct = ref<any>({
//   name: '',
//   sku: '',
//   categoryId: null as number | null,
//   purchasePrice: 0,
//   recommendedPrice: 0,
//   comments: [{content: ''}],
// })
//
// const newCategory = ref({
//   name: '',
//   parentId: undefined,
// })
//
// const selectedCategory = ref<any>({})
//
// // Categories
// const categories = computed(() => productsStore.categories)
//
// const categoryTree = computed(() => {
//   const map: Record<number, {children: [any]}> = {}
//   let roots: any[] = []
//   productsStore.categories.forEach(data => {
//
//     map[data.id] = { data, children: [] }
//   })
//   productsStore.categories.forEach(cat => {
//     if (cat.parentId) {
//       map[cat.parentId].children.push(map[cat.id])
//     } else {
//       roots.push(map[cat.id])
//     }
//   })
//
//   function addKeys(items, parentKey = '') {
//     return items.map((item, index) => {
//       const key = parentKey === '' ? `${index}` : `${parentKey}-${index}`;
//
//       return {
//         ...item,
//         key,
//         children: item.children.length > 0 ? addKeys(item.children, key) : []
//       };
//     });
//   }
//
//   roots = addKeys(roots)
//   return {roots, map}
// })
//
// function getDescendantIds(categories: CategoryProduct[], currentId: number): Set<number> {
//   const map = new Map<number, number[]>()
//   categories.forEach(cat => {
//     if (cat.parentId !== undefined) {
//       if (!map.has(cat.parentId)) {
//         map.set(cat.parentId, [])
//       }
//       map.get(cat.parentId)!.push(cat.id)
//     }
//   })
//
//   const descendants = new Set<number>()
//
//   function traverse(id: number) {
//     const children = map.get(id)
//     if (children) {
//       children.forEach(childId => {
//         descendants.add(childId)
//         traverse(childId)
//       })
//     }
//   }
//
//   traverse(currentId)
//   return descendants
// }
//
// function getCategoriesWithoutDescendant(currentId: number): CategoryProduct[] {
//   const descendants = getDescendantIds(categories.value, currentId).add(currentId)
//   return categories.value.filter(cat => !descendants.has(cat.id))
// }
//
// const showAddCategoryDialog = (parentId?) => {
//   if (parentId instanceof PointerEvent) parentId = undefined;
//   newCategory.value = { name: '', parentId: parentId  }
//   addCategoryDialog.value = true
// }
//
// const addCategory = async () => {
//   await productsStore.createCategory(newCategory.value)
//   toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория создана' })
//
//   // addCategoryDialog.value = false
//   await productsStore.fetchCategories()
// }
//
// const onCategorySelect = async (node) => {
//   // await productStore.
//   // console.log(clickedCategory.value)
//   selectedCategory.value = node.data
//   newProduct.value.categoryId = node.data.id
//   await productsStore.fetchProductsByCategoryId(node.data.id)
// }
// const onCategoryUnselect = async (node) => {
//   // await productStore.
//   // console.log(clickedCategory.value)
//   selectedCategory.value = {}
//   newProduct.value.categoryId = null
//   await productsStore.fetchProducts()
// }
//
// const showEditCategoryDialog = () => {
//   if (!selectedCategory.value) return
//   editCategoryDialog.value = true
// }
//
// const updateCategory = async () => {
//   await productsStore.updateCategory(selectedCategory.value.id, {
//     name: selectedCategory.value.name,
//     parentId: selectedCategory.value.parentId,
//   })
//   toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория изменена' })
//
//   editCategoryDialog.value = false
//   productsStore.fetchCategories()
// }
//
// const deleteCategory = async (id: number) => {
//   await productsStore.deleteCategory(id)
//   productsStore.fetchCategories()
// }
//
// const onEditCategory = (category: any) => {
//   selectedCategory.value = { ...category }
//   editCategoryDialog.value = true
// }
//
//
// const showAddProductDialog = () => {
//   newProduct.value = {
//     name: '',
//     sku: '',
//     categoryId: null,
//     purchasePrice: 0,
//     recommendedPrice: 0,
//     comments: [],
//   }
//   addProductDialog.value = true
// }
//
// const addProduct = async () => {
//   await productsStore.createProduct(newProduct.value)
//   toast.add({ severity: 'success', summary: 'Успех', detail: 'Товар создан' })
//   // addProductDialog.value = false
//   // productsStore.fetchProducts()
// }
//
// const editProduct = (product: any) => {
//   try {
//     selectedProduct.value = {...product}
//     editProductDialog.value = true
//   } catch (e) {
//     console.log(e)
//   }
// }
//
// const updateProduct = async () => {
//   await productsStore.updateProduct(selectedProduct.value.id, selectedProduct.value)
//   editProductDialog.value = false
//   toast.add({ severity: 'success', summary: 'Успех', detail: 'Товар изменен' })
//
//   // productsStore.fetchProducts()
// }
//
// const onDeleteProduct = (id: number) => {
//   confirmDelete(id, () =>  productsStore.deleteProduct(id),
//   )
// }
// const onDeleteCategory = (id: number) => {
//   confirmDelete(id, () =>  productsStore.deleteCategory(id),  "Удаляться также все подкатегории и продукты в  них",
//   )
//   toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория удалена' })
//
// }
//
// const stockBody = (rowData: any) => {
//   return rowData.stock.map((s: any) => `${s.warehouse}: ${s.count}`).join(', ')
// }
//
// const dynamicWarehouses = computed(() => {
//   const warehousesSet = new Set<string>()
//   productsStore.products.forEach(product => {
//     product.warehouseProducts.forEach(stock => {
//       if (stock.count > 0) {
//         warehousesSet.add(JSON.stringify(stock.warehouse))
//       }
//     })
//   })
//   const warehouses = Array.from(warehousesSet).map(w => JSON.parse(w))
//   return warehouses
// })
//
// const getStockCount = (product: Product, warehouseId: number) => {
//   const stock = product.warehouseProducts.find(s => s.warehouse.id === warehouseId)
//   return stock ? stock.count : 0
// }
//
// const filteredProducts = computed(() => {
//   // Implement filtering based on selected category if needed
//   return productsStore.products
// })
//
// const onPage = async (event: any) => {
//   productsStore.limit = event.rows
//   productsStore.currentPage = event.page + 1
//   productsStore.loading = true
//   if (selectedCategory.value?.id) {
//     await productsStore.fetchProductsByCategoryId(selectedCategory.value.id)
//   } else {
//   await productsStore.fetchProducts()
//     }
//   productsStore.loading = false
// }
// const filters = ref({})
// const initFilters = () => {
//   filters.value = {
//     global: { value: null },
//     id: { value: null },
//     name: { value: null },
//     sku: { value: null },
//     comments: { value: null},
//     purchasePrice: { value: null },
//     recommendedPrice: { value: null },
//     // categoryId: { value: null },
//     // stock: { value: null },
//   }
// }
// initFilters()
// const globalFilter = ref(null)
//
// const onFilterDebounced = debounce(300, async (event) => {
//
//
//   // Явный сброс глобального фильтра
//   if (globalFilter.value || globalFilter.value !== '') {
//     globalFilter.value = null;
//   }
//
//   // Если есть примененные фильтры, вызываем поиск, иначе сбрасываем фильтры
//   // productsStore.loading = true;
//   await productsStore.searchProductsByForm(event.filters, selectedCategory.value.id ?? undefined);
//   // productsStore.loading = false;
//
// });
//
// const onFilter = async (event: any) => {
//   onFilterDebounced(event);
// };
//
// const onGlobalDebounced = debounce(300,async (event) => {
//   if (productsStore.searchQuery || productsStore.searchQuery !== '') {
//     productsStore.loading = true
//     initFilters()
//     await productsStore.searchProductsByString(productsStore.searchQuery, selectedCategory.value.id ?? undefined)
//     productsStore.loading = false
//   } else {
//     productsStore.loading = true
//     await productsStore.fetchProducts()
//     productsStore.loading = false
//   }
// })
//
//
// const onGlobalFilter = async (event: any) => {
//   onGlobalDebounced(event)
// }
//
// onMounted(() => {
//   productsStore.fetchCategories()
//   productsStore.fetchProducts()
// })
//
// const addField = (field:  'comments', type: 'create' | 'update' = 'create') => {
//
//   if (type == 'create') {
//     newProduct.value[field].push({content: ''})
//   } else {
//     selectedProduct.value[field].push({content: ''})
//   }
// }
//
// const removeField = (field:  'comments', index: number, type: 'create' | 'update' = 'create') => {
//   if (type == 'create') {
//     newProduct.value[field].splice(index, 1)
//   } else {
//     selectedProduct.value[field].splice(index, 1)
//
//   }
// }
//
// const formatComments = (row: any) =>
//     row.comments?.map(item => item.content).join('<br>') || ''
//
// watch(() => productsStore.products, () => {
//   // Additional logic if needed when products change
// })
</script>

<style lang="scss" scoped>
.p-field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  max-width: 20rem;
}
.p-treetable-body-cell-content:has(.flex){
  align-items: end !important;
}
</style>
