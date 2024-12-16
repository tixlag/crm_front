<!-- pages/products.vue -->
<template>
  <div :class="{'p-m-4 flex': !themeStore.isOnMobile, 'gap-x-0': canEdit}" :style="!themeStore.isOnMobile ? 'grid-template-columns: repeat(auto-fit, minmax(128px, auto))' : ''">
    <div :class="{'md-4 mb-4': true, 'w-18.5%': !themeStore.isOnMobile}">
      <div class="flex gap-x-5 mb-2"><h2 v-if="canEdit">Категории</h2>
        <Button v-if="canEdit" label="Добавить" icon="pi pi-plus" class="p-mb-2"
                @click="showAddCategoryDialog"/>
      </div>

      <ContextMenu v-if="canEdit" ref="contextMenuCategory" :model="menuModelCategory"/>
      <TreeTable
          v-model:selectionKeys="selectedKey"
          v-model:expandedKeys="expandedCategory"
          @rowContextmenu="onRowContextMenuCategory"
          contextMenu v-model:contextMenuSelection="selectedCategory"
          :metaKeySelection="false"
          :value="categoryTree.roots"
          :filters="categoryFilter"
          selectionMode="single"
          scrollable
          scrollHeight="flex"
          @nodeUnselect="onCategoryUnselect" @nodeSelect="onCategorySelect"
          pt:thead:style="display:none"
          pt:row:row:style="padding-left:0"
          :class="{'border-t-solid border-primary-200': !themeStore.isOnMobile}"
      >


        <template #header>

            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="categoryFilter['global']" placeholder="Фильтр категорий" />
            </IconField>

        </template>
        <Column field="name" expander style="width: 34%" >
          <template #body="slotProps">
            <div
                draggable="true"
                @dragstart="(event) => onDragStart(event, slotProps.node)"
                @dragover="onDragOver"
                @drop="(event) => onDrop(event, slotProps.node)"
            >
              {{ slotProps.node.data["name"] }}
            </div>
          </template>
        </Column>
        <Column v-if="canEdit">
          <template #body="{ data, node }">
            <div class="flex gap-2">
              <Tag severity="info" :value="node.data._count.products" />
              <Button
                  icon="pi pi-pencil"
                  class="p-button-text"
                  style="width:1.15rem"
                  @click="onEditCategory(node.data)"
              />
              <Button
                  icon="pi pi-plus"
                  class="p-button-text color-blue"
                  style="width:1.15rem"

                  @click="showAddCategoryDialog(node.data.id)"
              />
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger"
                  style="width:1.15rem"

                  @click="onDeleteCategory(node.data.id)"
              />
            </div>
          </template>
        </Column>


      </TreeTable>

      <Dialog v-if="canEdit" header="Создать картегорию" v-model:visible="addCategoryDialog" :modal="true" :closable="true">
        <form @submit.prevent="addCategory">
          <div class="p-fluid">
            <div class="p-field">
              <label for="categoryName">Название</label>
              <InputText id="categoryName" v-model="newCategory.name" autofocus required />
            </div>
            <div class="p-field">
              <label for="parentCategory">Родительская категория</label>
              <Select
                  id="parentCategory"
                  v-model="newCategory.parentId"
                  :options="productsStore.categories"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Укажите родительскую категорию"
                  showClear
              />
            </div>
          </div>
          <div class="p-d-flex p-jc-end">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="addCategoryDialog = false" />
            <Button label="Add" icon="pi pi-check" type="submit" />
          </div>
        </form>
      </Dialog>

      <Dialog v-if="canEdit" header="Изменить категорию" v-model:visible="editCategoryDialog" :modal="true" :closable="true">
        <form @submit.prevent="updateCategory">
          <div class="p-fluid">
            <div class="p-field">
              <label for="editCategoryName">Название</label>
              <InputText id="editCategoryName" v-model="selectedCategory.name" autofocus required />
            </div>
            <div class="p-field">
              <label for="editParentCategory">Родительская категория</label>
              <Select
                  id="editParentCategory"
                  v-model="selectedCategory.parentId"
                  :options="getCategoriesWithoutDescendant(selectedCategory.id)"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Укажите родительскую категорию"
                  showClear
              />
            </div>
          </div>
          <div class="p-d-flex p-jc-end">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="editCategoryDialog = false" />
            <Button label="Save" icon="pi pi-check" type="submit" />
          </div>
        </form>
      </Dialog>
    </div>

    <div class="w-100% p-col-12 p-md-8">
      <div class="flex gap-x-5 mb-2 ml-3">
        <h2 v-if="canEdit">Продукты</h2>
        <Button v-if="canEdit" label="Добавить" icon="pi pi-plus" @click="showAddProductDialog" />
      </div>
      <ContextMenu v-if="canEdit" ref="contextMenuProducts" :model="menuModelProducts" />
      <DataTable
          :value="productsStore.products"
          paginator
          :rows="productsStore.limit"
          :totalRecords="productsStore.total"
          :lazy="true"
          @page="onPage"
          :loading="productsStore.loading"
          :filters="filters"
          :filterDisplay="'row'"
          v-model:expandedRows="expandedRows"
          class="products-table"
          @filter="onFilter"
          :globalFilterFields="['id', 'name', 'sku', 'comment', 'purchasePrice', 'recommendedPrice']"
          :rowsPerPageOptions="[10, 25, 50, 100]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} по {last} из {totalRecords}"
          contextMenu v-model:contextMenuSelection="selectedProduct"
          @rowContextmenu="onRowContextMenuProducts"
          scrollable
          :class="{'border-l-solid border-t-solid border-primary-200': !themeStore.isOnMobile}"
          :rowClass="rowClass"
          @rowReorder="onProductReorder"
      >
        <template #header>
          <div class="flex justify-between items-center gap-x-10">
            <div v-ripple style="white-space: nowrap;">Всего: {{productsStore.total}}</div>
            <div class="flex gap-6">
              <Tag severity="secondary" class="cursor-pointer" value="Показать цену" :icon="`pi !font-size-1rem !w-auto !h-auto ${showPriceColumn ? 'pi-eye-slash' : 'pi-eye'}`"
                @click="showPriceColumn = !showPriceColumn"
              />
              <IconField>
                <InputIcon>
                  <i class="pi pi-search"/>
                </InputIcon>
                <MultiSelect filter style="width: 100%" v-model="filters.warehouses.value" placeholder="Склады"
                             :options="settingsStore.warehouses" optionLabel="name" option-value="id"
                />
              </IconField>
              <IconField>
                <InputIcon>
                  <i class="pi pi-search"/>
                </InputIcon>
                <InputText style="width: 100%" v-model="productsStore.searchQuery" placeholder="по всем полям"
                           @input="onGlobalFilter"/>
              </IconField>
            </div>
          </div>
        </template>
        <template #empty>
          Нет товаров.
        </template>
        <template #loading>
          Загрузка данных товаров. Пожалуйста, подождите.
        </template>
        <!--        Для складов-->
        <Column expander style="width: 3em" class="expander-cell"></Column>
        <Column v-if="!canEdit" :frozen="true">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button
                  icon="pi pi-plus"
                  class="p-button-text"
                  @click="emits('clickOnPlusInWarehouseModal', data)"
              />
            </div>
          </template>
        </Column>
        <Column rowReorder v-if="canEdit && Object.keys(selectedCategory).length !== 0 && isEmptyFilters && authStore.user.roles.includes('ADMIN')" />
        <Column field="id" key="" header="ID" style="min-width: 6rem; max-width: 6rem">
          <template #body="{ data }">
            {{ data.id }}
          </template>
          <template #filter="{ field, filterModel, filterCallback }">

            <FloatLabel variant="on">
<!--              <InputText v-model="filters[field].value" fluid type="text" />-->
              <InputText v-model="filterModel.value" @change="filterCallback" fluid type="text" />
              <label class="pi">&#xe908;</label>
            </FloatLabel>
            <!--          <InputText v-model="filters[field].value" type="text"  class="pi" />-->
          </template>
        </Column>

        <Column field="name" header="Название" :key="'name'" frozen>
          <template #body="{ data }">
            {{ data.name }}
          </template>
          <template #filter="{ field, filterModel, filterCallback }">
            <FloatLabel variant="on">
              <InputText v-model="filterModel.value" @change="filterCallback" type="text" />
              <label class="pi">&#xe908;</label>
            </FloatLabel>
          </template>
        </Column>

        <Column header="Артикул" field="sku" >
          <template #body="{ data }">
            {{ data.sku }}
          </template>
          <template #filter="{ field, filterModel, filterCallback}">
            <FloatLabel variant="on">
              <InputText v-model="filterModel.value" @change="filterCallback" type="text" />
              <label class="pi">&#xe908;</label>
            </FloatLabel>
          </template>
        </Column>

        <template #expansion="{data}">
          <div class="flex items-center gap-2 border-0 border-solid border-r-1.5 pr-4"
               v-if="data.comments?.length > 0" v-for="(comment, index) in data.comments">
            <div class="flex flex-col">Комментарий {{ data.comments.length > 1 ? index + 1 : '' }}:
              <small title="Добавил" style="display: block; color: gray;">{{
                  settingsStore.getField('managers', 'name', comment.userId)
                }}</small>
            </div>
            <div v-html="comment.content"></div>
          </div>
        </template>
<!--        <Column header="Комментарий" field="comments" style="min-width: 12rem">-->
<!--          <template #body="{ data }">-->
<!--            <div v-html="formatComments(data)"></div>-->
<!--          </template>-->
<!--          <template #filter="{ field, filterModel, filterCallback }">-->
<!--            <FloatLabel variant="on">-->
<!--              <InputText v-model="filters[field].value" type="text" />-->
<!--              <label class="pi">&#xe908;</label>-->
<!--            </FloatLabel>-->
<!--          </template>-->
<!--        </Column>-->

        <Column header="Рекомендованная цена" field="recommendedPrice" style="min-width: 12rem">
          <template #body="{ data, field }">
            {{data[field].toLocaleString('ru-RU', {maximumFractionDigits: 2}) }}
          </template>
          <template #filter="{ field, filterModel,  filterCallback }">
            <FloatLabel variant="on">
              <InputText v-model="filterModel.value" @change="filterCallback" type="text" />
              <label class="pi">&#xe908;</label>
            </FloatLabel>
          </template>
        </Column>

        <Column v-if="showPriceColumn" header="Цена закупки" field="purchasePrice" style="min-width: 12rem">
          <template #body="{ data, field }">
            {{data[field].toLocaleString('ru-RU', {maximumFractionDigits: 2}) }}
          </template>
          <template #filter="{field, filterModel,  filterCallback }">
            <FloatLabel variant="on">
              <InputText v-model="filterModel.value" @change="filterCallback" type="text" />
              <label class="pi">&#xe908;</label>
            </FloatLabel>
          </template>
        </Column>


        <Column v-for="warehouse in dynamicWarehouses" :key="warehouse.id" :header="warehouse.name" :field="`warehouse_${warehouse.id}`" :filter="false">
          <template #body="{ data }">
            {{ getStockCount(data, warehouse.id) }}
          </template>
        </Column>
<!--        Для общей страницы-->
        <Column v-if="canEdit" header="Действия" :frozen="true" style="min-width: 6rem">
          <template #body="{ data }">
            <div class="flex space-x-2">
              <Button
                  icon="pi pi-pencil"
                  class="p-button-text"
                  @click="editProduct(data)"
              />
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger"
                  @click="onDeleteProduct(data.id)"
              />
            </div>
          </template>
        </Column>


      </DataTable>

      <Dialog v-if="canEdit" v-model:visible="addProductDialog" :modal="true" :closable="true" class="w-4/5">
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
            <div>
              <label>Комментарии</label>
              <div class="flex gap-6 flex-wrap">
                <div v-for="(comment, index) in newProduct.comments" :key="index" class="mb-2">
<!--                  <Editor-->
<!--                      editorStyle="min-height: 100px"-->
<!--                      label="Комментарий"-->
<!--                      name="comment"-->
<!--                      id="comment-{{index}}"-->
<!--                      validation="required"-->
<!--                      v-model="newProduct.comments[index].content"-->
<!--                  />-->
                  <TipTap
                      editorStyle="min-height: 100px"
                      label="Комментарий"
                      name="comment"
                      id="comment-{{index}}"
                      validation="required"
                      v-model="newProduct.comments[index].content"
                  />
                  <Button
                      icon="pi pi-trash"
                      class="p-button-text p-button-danger"
                      v-if="newProduct.comments.length > 0"
                      @click="removeField('comments', index, 'create')"
                  />
                </div>
                <Button
                    type="button"
                    label="Добавить комментарий"
                    icon="pi pi-plus"
                    class="p-button-text"
                    @click="addField('comments', 'create')"
                />
              </div>
            </div>
          </div>
          <div class="p-field">
            <label for="category">Категория</label>
            <CascadeSelect v-model="newProduct.categoryId" :options="categoryTree.roots" :optionLabel="(el) => el.data.name" :optionGroupLabel="(el) =>el.data.name"
                           :optionGroupChildren="['children']" :optionValue="(el) => el.data.id" class="w-56" placeholder="Select a City" />
          </div>

          <div class="p-field">
            <label for="purchasePrice">Цена покупки</label>
            <InputNumber id="purchasePrice" v-model="newProduct.purchasePrice" mode="currency" currency="RUB" />
          </div>
          <div class="p-field">
            <label for="recommendedPrice">Рекомендованная цена</label>
            <InputNumber id="recommendedPrice" v-model="newProduct.recommendedPrice" mode="currency" currency="RUB" />
          </div>

          <div class="p-d-flex p-jc-end">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="addProductDialog = false" />
            <Button label="Add" icon="pi pi-check" type="submit" />
          </div>
        </form>
      </Dialog>

      <Dialog v-if="canEdit" header="Редактировать товар" v-model:visible="editProductDialog" :modal="true" :closable="true" class="w-4/5">
        <form @submit.prevent="updateProduct">
          <div class="p-fluid">
            <div class="p-field">
              <label for="editName">Название</label>
              <InputText id="editName" v-model="selectedProduct.name" autofocus required />
            </div>
            <div class="p-field">
              <label for="editSku">Артикул</label>
              <InputText id="editSku" v-model="selectedProduct.sku" required />
            </div>
            <div>
              <label>Комментарии</label>
              <div class="flex gap-6 flex-wrap">
                <div v-for="(comment, index) in selectedProduct.comments" :key="index" class="mb-2">
                  <Editor
                      editorStyle="min-height: 100px"
                      label="Комментарий"
                      name="comment"
                      id="comment-{{index}}"
                      validation="required"
                      v-model="selectedProduct.comments[index].content"
                  />
                  <Button
                      icon="pi pi-trash"
                      class="p-button-text p-button-danger"
                      v-if="selectedProduct.comments.length > 0"
                      @click="removeField('comments', index, 'update')"
                  />
                </div>
                <Button
                    type="button"
                    label="Добавить комментарий"
                    icon="pi pi-plus"
                    class="p-button-text"
                    @click="addField('comments', 'update')"
                />
            </div>
            </div>
          </div>
          <div class="p-field">
            <label for="category">Категория</label>
<!--            <Select-->
<!--                id="editCategory"-->
<!--                v-model="selectedProduct.categoryId"-->
<!--                :options="productsStore.categories"-->
<!--                optionLabel="name"-->
<!--                optionValue="id"-->
<!--                placeholder="Выберите категорию"-->
<!--                required-->
<!--            />-->
            <CascadeSelect v-model="selectedProduct.categoryId" :options="categoryTree.roots" :optionLabel="(el) => el.data.name" :optionGroupLabel="(el) =>el.data.name"
                           :optionGroupChildren="['children']" :optionValue="(el) => el.data.id" class="w-56" placeholder="Select a City" />

          </div>
          <div class="p-field">
            <label for="purchasePrice">Цена покупки</label>
            <InputNumber id="editPurchasePrice" v-model="selectedProduct.purchasePrice" mode="currency" currency="RUB" />
          </div>
          <div class="p-field">
            <label for="recommendedPrice">Рекомендованная цена</label>
            <InputNumber id="editRecommendedPrice" v-model="selectedProduct.recommendedPrice" mode="currency" currency="RUB" />
          </div>

          <div class="p-d-flex p-jc-end">
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="editProductDialog = false" />
            <Button label="Save" icon="pi pi-check" type="submit" />
          </div>
        </form>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import {debounce} from "@antfu/utils";
import type {CategoryProduct} from "~/stores/products";
import TipTap from "~/components/tiptap/TipTap.vue";

const props = defineProps({
  canEdit: Boolean,
  withStocks: Boolean,
  warehouseId: Number,
})
const emits = defineEmits(['clickOnPlusInWarehouseModal'])


const productsStore = useProductsStore()
const settingsStore = useSettingsStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const {confirmAction, confirmDelete} = useConfirmation()
const toast = useMessages()

const addProductDialog = ref(false)
const editProductDialog = ref(false)

const addCategoryDialog = ref(false)
const editCategoryDialog = ref(false)
const categoryFilter = ref({})
const selectedKey = ref({})
const selectedKeyHelp = ref({})
const expandedCategory = ref({})
const expandedCategoryHelp = ref({})
const showPriceColumn = ref(false)

const contextMenuCategory = ref();
const expandedRows = ref();

const menuModelCategory = ref([
  {label: 'Изменить', icon: 'pi pi-fw pi-pencil', command: () => onEditCategory(selectedCategory.value.data)},
  {label: 'Добавить', icon: 'pi pi-fw pi-plus', command: () => showAddCategoryDialog(selectedCategory.value.data.id)},
  {label: 'Удалить', icon: 'pi pi-fw pi-trash', command: () => onDeleteCategory(selectedCategory.value.data.id)}
]);
const onRowContextMenuCategory = (event) => {
  contextMenuCategory.value.show(event.originalEvent);
};
const contextMenuProducts = ref();

const menuModelProducts = ref([
  {label: 'View', icon: 'pi pi-fw pi-search', command: () => editRow()},
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => deleteRow(selectedBuyer)}
]);

const onRowContextMenuProducts = (event) => {
  contextMenuProducts.value.show(event.originalEvent);
};

const newProduct = ref({
  name: '',
  sku: '',
  categoryId: null as number | null,
  purchasePrice: 0,
  recommendedPrice: 0,
  comments: [{content: ''}],
})

const selectedProduct = ref<any>({
  name: '',
  sku: '',
  categoryId: null as number | null,
  purchasePrice: 0,
  recommendedPrice: 0,
  comments: [{content: ''}],
})

const newCategory = ref({
  name: '',
  parentId: undefined,
})

const selectedCategory = ref<any>({})

// Categories
const categories = productsStore.categories

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

function getDescendantIds(categories: CategoryProduct[], currentId: number): Set<number> {
  const map = new Map<number, number[]>()
  categories.forEach(cat => {
    if (cat.parentId !== undefined) {
      if (!map.has(cat.parentId)) {
        map.set(cat.parentId, [])
      }
      map.get(cat.parentId)!.push(cat.id)
    }
  })

  const descendants = new Set<number>()

  function traverse(id: number) {
    const children = map.get(id)
    if (children) {
      children.forEach(childId => {
        descendants.add(childId)
        traverse(childId)
      })
    }
  }

  traverse(currentId)
  return descendants
}

function getCategoriesWithoutDescendant(currentId: number): CategoryProduct[] {
  const descendants = getDescendantIds(productsStore.categories, currentId).add(currentId).add(1)
  return productsStore.categories.filter(cat => !descendants.has(cat.id))
}

const showAddCategoryDialog = (parentId?) => {
  if (parentId instanceof PointerEvent) parentId = undefined;
  newCategory.value = { name: '', parentId: parentId  }
  addCategoryDialog.value = true
}

const addCategory = async () => {
  await productsStore.createCategory(newCategory.value)
  addCategoryDialog.value = false
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория создана' })

  // addCategoryDialog.value = false
  await productsStore.fetchCategories()
}

const onCategorySelect = async (node) => {
  // await productStore.
  // console.log(clickedCategory.value)
  selectedCategory.value = node.data
  newProduct.value.categoryId = node.data.id
  await productsStore.fetchProductsByCategoryId(node.data.id)
}
const onCategoryUnselect = async (node) => {
  // await productStore.
  // console.log(clickedCategory.value)
  selectedCategory.value = {}
  newProduct.value.categoryId = null
  await productsStore.fetchProducts()
}


const onCategorySelectHelp = async (node) => {
  // await productStore.
  // console.log(clickedCategory.value)
  // selectedCategory.value = node.data
  newProduct.value.categoryId = node.data.id
  // await productsStore.fetchProductsByCategoryId(node.data.id)
}
const onCategoryUnselectHelp = async (node) => {
  // await productStore.
  // console.log(clickedCategory.value)
  // selectedCategory.value = {}
  newProduct.value.categoryId = null
  // await productsStore.fetchProducts()
}
const showEditCategoryDialog = () => {
  if (!selectedCategory.value) return
  editCategoryDialog.value = true
}

const updateCategory = async () => {
  await productsStore.updateCategory(selectedCategory.value.id, {
    name: selectedCategory.value.name,
    parentId: selectedCategory.value.parentId,
  })
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория изменена' })

  editCategoryDialog.value = false
  productsStore.fetchCategories()
}

const deleteCategory = async (id: number) => {
  await productsStore.deleteCategory(id)
  productsStore.fetchCategories()
}

const onEditCategory = (category: any) => {
  selectedCategory.value = { ...category }
  editCategoryDialog.value = true
}


const showAddProductDialog = () => {
  newProduct.value = {
    name: '',
    sku: '',
    categoryId: selectedCategory.value.id ?? 1,
    purchasePrice: 0,
    recommendedPrice: 0,
    comments: [],
  }
  addProductDialog.value = true
}

const addProduct = async () => {
  await productsStore.createProduct(newProduct.value)
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Товар создан' })
  addProductDialog.value = false
  // productsStore.fetchProducts()
}

const editProduct = (product: any) => {
  try {
    selectedProduct.value = {...product}
    editProductDialog.value = true
  } catch (e) {
    console.log(e)
  }
}

const updateProduct = async () => {
  // if (selectedProduct.value.)
  await productsStore.updateProduct(selectedProduct.value.id, selectedProduct.value)
  editProductDialog.value = false
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Товар изменен' })

  // productsStore.fetchProducts()
}

const onDeleteProduct = (id: number) => {
  confirmDelete(id, () =>  productsStore.deleteProduct(id),
  )
}
const onDeleteCategory = (id: number) => {
  confirmDelete(id, () =>  productsStore.deleteCategory(id),  "Продукты категории и подкатегорий остануться без категории",
  )
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория удалена' })

}

const stockBody = (rowData: any) => {
  return rowData.stock.map((s: any) => `${s.warehouse}: ${s.count}`).join(', ')
}

const dynamicWarehouses = computed(() => {
  const warehousesSet = new Set<string>()
  productsStore.products.forEach(product => {
    product.warehouseProducts.forEach(stock => {
      if (stock.count > 0) {
        warehousesSet.add(JSON.stringify(stock.warehouse))
      }
    })
  })
  const warehouses = Array.from(warehousesSet).map(w => JSON.parse(w))
  return warehouses
})

const getStockCount = (product: Product, warehouseId: number) => {
  const stock = product.warehouseProducts.find(s => s.warehouse.id === warehouseId)
  return stock ? stock.count : 0
}

const filteredProducts = computed(() => {
  // Implement filtering based on selected category if needed
  return productsStore.products
})

const onPage = async (event: any) => {
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
const filters = ref({
  global: { value: null },
  id: { value: null },
  name: { value: null },
  sku: { value: null },
  comments: { value: null},
  purchasePrice: { value: null },
  recommendedPrice: { value: null },
  warehouses: {value: null},
})
const initFilters = () => {
  filters.value = {
    global: { value: null },
    id: { value: null },
    name: { value: null },
    sku: { value: null },
    comments: { value: null},
    purchasePrice: { value: null },
    recommendedPrice: { value: null },
    warehouses: {value: null},
  }
}
initFilters()
const globalFilter = ref(null)
const isEmptyFilters = computed(() =>{
 for(const key of Object.getOwnPropertyNames(filters.value)) {
   if (filters.value[key].value) return false
 }
 return true
})

const onFilterDebounced = debounce(300, async (event) => {


  // Явный сброс глобального фильтра
  if (globalFilter.value || globalFilter.value !== '') {
    globalFilter.value = null;
  }

  // Если есть примененные фильтры, вызываем поиск, иначе сбрасываем фильтры
  // productsStore.loading = true;
  await productsStore.searchProductsByForm(event.filters ?? filters.value, selectedCategory.value.id ?? undefined);
  // await nextTick()
  // productsStore.loading = false;

});

const onFilter = async (event: any) => {
  onFilterDebounced(event);
};

const newOnFilter = async (field: any, val) => {
  filters.value[field] = val
};


const onGlobalDebounced = debounce(300,async (event) => {
  if (productsStore.searchQuery || productsStore.searchQuery !== '') {
    productsStore.loading = true
    initFilters()
    await productsStore.searchProductsByString(productsStore.searchQuery, selectedCategory.value.id ?? undefined)
    productsStore.loading = false
  } else {
    productsStore.loading = true
    await productsStore.fetchProducts(!!props.withStocks)
    productsStore.loading = false
  }
})


const onGlobalFilter = async (event: any) => {
  onGlobalDebounced(event)
}

onMounted(() => {
  productsStore.withStocks = !!props.withStocks;
  productsStore.warehouseId = props.warehouseId;
  productsStore.fetchCategories()
  initializeCategoryTree()
  productsStore.fetchProducts()

})

const addField = (field:  'comments', type: 'create' | 'update' = 'create') => {

  if (type == 'create') {
    newProduct.value[field].push({content: ''})
  } else {
    selectedProduct.value[field].push({content: ''})
  }
}

const removeField = (field:  'comments', index: number, type: 'create' | 'update' = 'create') => {
  if (type == 'create') {
    newProduct.value[field].splice(index, 1)
  } else {
    selectedProduct.value[field].splice(index, 1)

  }
}

const formatComments = (row: any) =>
    row.comments?.map(item => item.content).join('<br>') || ''

watch(filters, () => {
  if (productsStore.searchQuery) return
  onFilter();
}, { deep: true });



// Drag-and-drop handlers
const draggedNode = ref(null);

const onDragStart = (event, node) => {
  draggedNode.value = node;
  event.dataTransfer.effectAllowed = 'move';
};

const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const onDrop = (event, dropNode) => {
  event.preventDefault();

  if (draggedNode.value && draggedNode.value !== dropNode) {

    if (getDescendantIds(productsStore.categories, dropNode.data.id).has(draggedNode.value.data.id) ||
        getDescendantIds(productsStore.categories, draggedNode.value.data.id).has(dropNode.data.id)
    ) {
      toast.showErrorMessage('Ошибка', "Нельзя менять потомка с родителем")
      return
    }

    // Функция для поиска родительского массива и индекса целевой ноды
    const findParentAndIndex = (nodes, targetNode, parent = null) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i] === targetNode) {
          return { parent: nodes, index: i };
        }
        if (nodes[i].children) {
          const result = findParentAndIndex(nodes[i].children, targetNode, nodes[i]);
          if (result) return result;
        }
      }
      return null;
    };

    // Поиск местоположений перетаскиваемой и целевой нод
    const draggedInfo = findParentAndIndex(categoryTree.value.roots, draggedNode.value);
    const dropInfo = findParentAndIndex(categoryTree.value.roots, dropNode);


    if (draggedInfo && dropInfo) {
      if (draggedInfo.parent[draggedInfo.index].data.id === dropInfo.parent[dropInfo.index].parentId || draggedInfo.parent[draggedInfo.index].data.parentId === dropInfo.parent[dropInfo.index].data.id) {
        toast.showErrorMessage('Ошибка', "Нельзя менять потомка с родителем")
        return;
      }
      // Обмен нодами в их родительских массивах
      const temp = draggedInfo.parent[draggedInfo.index];
      const draggedMeta = {parentId: temp.data.parentId, key: temp.key};
      const dropMeta = {parentId: dropInfo.parent[dropInfo.index].data.parentId, key: dropInfo.parent[dropInfo.index].key};
      draggedInfo.parent[draggedInfo.index] = dropInfo.parent[dropInfo.index];

      dropInfo.parent[dropInfo.index] = temp;
      draggedInfo.parent[draggedInfo.index].data.parentId = draggedMeta.parentId;
      dropInfo.parent[dropInfo.index].data.parentId = dropMeta.parentId;

      draggedInfo.parent[draggedInfo.index].key = draggedMeta.key;
      dropInfo.parent[dropInfo.index].key = dropMeta.key;

      if (expandedCategory.value[draggedMeta.key] ^ expandedCategory.value[dropMeta.key]) {
        if (expandedCategory.value[draggedMeta.key]) {
          expandedCategory.value[draggedMeta.key] = false
          expandedCategory.value[dropMeta.key] = true
        } else if (expandedCategory.value[dropMeta.key]) {
          expandedCategory.value[dropMeta.key] = false
          expandedCategory.value[draggedMeta.key] = true
        }
      }




      // Если необходимо обновить порядок дочерних элементов (реактивность)
      // Можно использовать методы фреймворка (например, Vue.set) в зависимости от используемой библиотеки
    }
    // Это добавит перетаскиваемую ноду в детей
    // const removeNode = (nodes, node) => {
    //   for (let i = 0; i < nodes.length; i++) {
    //     if (nodes[i] === node) {
    //       return nodes.splice(i, 1)[0];
    //     }
    //     if (nodes[i].children) {
    //       const result = removeNode(nodes[i].children, node);
    //       if (result) return result;
    //     }
    //   }
    // };
    // const dragged = removeNode(categoryTree.value.roots, draggedNode.value);
    //
    // // Find the drop node and insert the dragged node
    // const insertNode = (nodes, node, dragged) => {
    //   for (let i = 0; i < nodes.length; i++) {
    //     if (nodes[i] === node) {
    //       if (!nodes[i].children) nodes[i].children = [];
    //       nodes[i].children.push(dragged);
    //       return;
    //     }
    //     if (nodes[i].children) {
    //       insertNode(nodes[i].children, node, dragged);
    //     }
    //   }
    // };
    // insertNode(categoryTree.value.roots, dropNode, dragged);

    apiFetch('/products/category/order', {
      method: 'POST',
      body: JSON.stringify(categoryTree.value.roots)
    })
  }
  draggedNode.value = null;
};

const categoryTree = ref({
  roots: [],
  map: {}
})

function initializeCategoryTree() {
  const map = {}
  let roots = []

  productsStore.categories.forEach(data => {
    map[data.id] = { data, children: [] }
  })

  productsStore.categories.forEach(cat => {
    if (cat.parentId) {
      if (map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id])
      }
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
        children: item.children.length > 0 ? addKeys(item.children, key) : []
      }
    })
  }

  roots = addKeys(roots)
  categoryTree.value.roots = roots
  categoryTree.value.map = map
}

watch(
    () => productsStore.categories,
    () => {
      initializeCategoryTree()
    },
    { deep: true })


const rowClass = (data) => {
  return [{ '!bg-[#ff0b0b70] !text-primary-contrast': !dynamicWarehouses.value.find(w => data.warehouseProducts.find(wp => wp.warehouseId === w.id &&  wp.count > 0) ) }];
};

const onProductReorder = async (event) => {
  await productsStore.reorder(event.value, selectedCategory.value.id, event.dragIndex, event.dropIndex)
}
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

<style>
.products-table .p-datatable-column-filter-clear-button {
  display: none !important;
}
</style>
