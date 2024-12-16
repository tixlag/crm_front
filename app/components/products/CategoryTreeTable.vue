<template>
  <div :class="containerClass">
    <div class="category-section">
      <h2>Категории</h2>

      <!-- Контекстное меню для категорий -->
      <ContextMenu ref="contextMenuCategory" :model="menuModel" v-if="canEdit" />

      <!-- Дерево категорий -->
      <TreeTable
        :selectionKeys="selectedKey"
        @update:selectionKeys="val => emit('update:selectedKey', val)"
          @rowContextmenu="handleRowContextMenu"
          contextMenu
        :contextMenuSelection="selectedCategory"
        @update:contextMenuSelection="val => emit('update:contextMenuSelection', val)"
          :metaKeySelection="false"
          :value="categoryTree.roots"
          :filters="categoryFilter"
          selectionMode="single"
          scrollable
          scrollHeight="flex"
          @nodeUnselect="onCategoryUnselect"
          @nodeSelect="onCategorySelect"
      >
        <template #header>
          <div class="flex flex-col gap-2 justify-end">
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText v-model="categoryFilter['global']" placeholder="Фильтр категорий" />
            </IconField>
            <Button
                v-if="canAdd"
                label="Добавить категорию"
                icon="pi pi-plus"
                class="p-mb-2"
                @click="handleAddCategory"
            />
          </div>
        </template>

        <Column field="name" expander style="width: 34%"></Column>

        <Column>
          <template #body="{ data, node }">
            <div class="flex gap-2" v-if="canEdit">
              <Button
                  icon="pi pi-pencil"
                  class="p-button-text"
                  style="width:1.15rem"
                  @click="() => handleEditCategory(data)"
              />
              <Button
                  icon="pi pi-plus"
                  class="p-button-text color-blue"
                  style="width:1.15rem"
                  @click="() => handleAddCategory(data.id)"
              />
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger"
                  style="width:1.15rem"
                  @click="() => handleDeleteCategory(data.id)"
              />
            </div>
          </template>
        </Column>
      </TreeTable>

      <!-- Диалоги для добавления и редактирования категорий -->
      <Dialog
          v-if="canEdit"
          header="Создать категорию"
          v-model:visible="addCategoryDialog"
          :modal="true"
          :closable="true"
      >
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
                  :options="categories"
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

      <Dialog
          v-if="canEdit"
          header="Изменить категорию"
          v-model:visible="editCategoryDialog"
          :modal="true"
          :closable="true"
      >
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { debounce } from '@antfu/utils'

// Определение свойств компонента
const props = defineProps({
  categories: { type: Array, required: true },
  categoryTree: { type: Object, required: true },
  selectedCategory: { type: Object, default: () => ({}) },
  selectedKey: { type: Object, default: () => ({}) },
  canEdit: { type: Boolean, default: true },
  canAdd: { type: Boolean, default: true },
  onEdit: { type: Function, required: false },
  onAdd: { type: Function, required: false },
  onDelete: { type: Function, required: false },
  onSelect: { type: Function, required: false },
  onUnselect: { type: Function, required: false },
})

// Определение событий
const emits = defineEmits(['edit', 'add', 'delete', 'select', 'unselect', 'update:selectedKey', 'update:contextMenuSelection'])

const themeStore = useThemeStore()
const { confirmDelete } = useConfirmation()
const toast = useMessages()

// Локальные состояния
const addCategoryDialog = ref(false)
const editCategoryDialog = ref(false)
const newCategory = ref({ name: '', parentId: undefined })
const categoryFilter = ref({})
const contextMenuCategory = ref()

// Контекстное меню
const menuModel = computed(() => {
  if (!props.canEdit) return []
  return [
    {
      label: 'Изменить',
      icon: 'pi pi-fw pi-pencil',
      command: () => props.onEdit && props.onEdit(props.selectedCategory.data),
    },
    {
      label: 'Добавить',
      icon: 'pi pi-fw pi-plus',
      command: () => props.onAdd && props.onAdd(props.selectedCategory.data.id),
    },
    {
      label: 'Удалить',
      icon: 'pi pi-fw pi-trash',
      command: () => handleDeleteCategory(props.selectedCategory.data.id),
    },
  ]
})

// Обработчики событий
const handleRowContextMenu = (event) => {
  if (props.canEdit) {
    contextMenuCategory.value.show(event.originalEvent)
  }
}

const handleAddCategory = (parentId) => {
  newCategory.value = { name: '', parentId: parentId || undefined }
  addCategoryDialog.value = true
}

const handleEditCategory = (category) => {
  emits('edit', category)
  editCategoryDialog.value = true
}

const handleDeleteCategory = (id) => {
  confirmDelete(id, () => {
    emits('delete', id)
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория удалена' })
  }, 'Удаляются также все подкатегории и продукты в них')
}

const addCategory = async () => {
  await props.onAdd && props.onAdd(newCategory.value)
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория создана' })
  addCategoryDialog.value = false
}

const updateCategory = async () => {
  await props.onEdit && props.onEdit(props.selectedCategory.value.id, props.selectedCategory.value)
  toast.add({ severity: 'success', summary: 'Успех', detail: 'Категория изменена' })
  editCategoryDialog.value = false
}

// Функции фильтрации
const getDescendantIds = (categories, currentId) => {
  const map = new Map()
  categories.forEach(cat => {
    if (cat.parentId !== undefined) {
      if (!map.has(cat.parentId)) {
        map.set(cat.parentId, [])
      }
      map.get(cat.parentId).push(cat.id)
    }
  })

  const descendants = new Set()
  const traverse = (id) => {
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

const getCategoriesWithoutDescendant = (currentId) => {
  const descendants = getDescendantIds(props.categories, currentId)
  descendants.add(currentId)
  return props.categories.filter(cat => !descendants.has(cat.id))
}
</script>

<style scoped>
.category-section {
  /* Ваши стили */
}
</style>
