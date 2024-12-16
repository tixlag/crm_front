<template>
  <div class="p-4">
    <div class="flex justify-between mb-4">
      <h2>Покупатели</h2>
      <Button label="Добавить" icon="pi pi-plus" @click="showCreateDialog = true"/>
    </div>
    <ContextMenu ref="contextMenu" :model="menuModel"/>
    <DataTable
        :value="buyersStore.buyers"
        paginator
        :rows="buyersStore.limit"
        :totalRecords="buyersStore.total"
        :lazy="true"
        @page="onPage"
        :loading="loading"
        :filters="filters"
        :filterDisplay="'row'"
        :globalFilterFields="['id', 'name', 'phones', 'emails', 'addresses', 'comments']"
        @filter="onFilter"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first} по {last} из {totalRecords}"
        contextMenu
        v-model:contextMenuSelection="selectedBuyer"
        @rowContextmenu="onRowContextMenu"
        scrollable
    >
      <template #header>
        <div class="flex justify-between items-center gap-x-10">
          <div style="white-space: nowrap;">Всего: {{ buyersStore.total }}</div>
          <IconField>
            <InputIcon>
              <i class="pi pi-search"/>
            </InputIcon>
            <InputText style="width: 100%" v-model="globalFilter" placeholder="по всем полям" @input="onGlobalFilter"/>
          </IconField>
        </div>
      </template>

      <template #empty>
        Нет покупателей.
      </template>

      <template #loading>
        Загрузка данных покупателей. Пожалуйста, подождите.
      </template>

      <Column field="id" header="NN">
        <template #body="{ data }">
          {{ data.numberName }}
        </template>
        <template #filter="{ field, filterModel, filterCallback }">

          <FloatLabel variant="on">
            <!--            <InputText v-model="filterModel.value" type="text" @input="filterCallback()"/>-->
            <InputText v-model="filters[field].value" type="text" style="max-width: 3rem"/>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
          <!--          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="pi" />-->
        </template>
      </Column>

      <Column field="name" header="Имя" frozen>
        <template #body="{ data }">
          {{ data.name }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <FloatLabel variant="on">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" style="max-width: 3rem"/>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
        </template>
      </Column>


      <Column header="Телефоны" filter-menu-style="color: red" field="phones">
        <template #body="{ data }">
          <div v-html="formatPhones(data)"></div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <FloatLabel variant="on">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" style="max-width: 3rem"/>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
        </template>
      </Column>

      <Column header="Email" field="emails" style="min-width: 12rem">
        <template #body="{ data }">
          <div v-html="formatEmails(data)"></div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <FloatLabel variant="on">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" style="max-width: 3rem"/>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
        </template>
      </Column>

      <Column header="Адреса" field="address" style="min-width: 12rem">
        <template #body="{ data }">
          <div v-html="formatAddresses(data)"></div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <FloatLabel variant="on">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" style="max-width: 3rem"/>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
        </template>
      </Column>

      <Column header="Комментарии" field="comments" style="min-width: 12rem">
        <template #body="{ data }">
          <div v-html="formatComments(data)"></div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <FloatLabel variant="on">
            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" style="max-width: 3rem"/>
            <label class="pi">&#xe908;</label>
          </FloatLabel>
        </template>
      </Column>

      <Column header="Действия" style="min-width: 6rem">
        <template #body="{ data }">
          <div class="flex space-x-2">
            <Button
                icon="pi pi-pencil"
                class="p-button-text"
                @click="editBuyer(data)"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                @click="handleDelete(data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Диалог Создания Покупателя -->
    <BuyerModal
        :isVisible="showCreateDialog"
        :buyer="newBuyer"
        @update:isVisible="value => showCreateDialog = value"
        @close="() => showCreateDialog = false"
    />
    <BuyerModal
        :isVisible="showEditDialog"
        :buyerForEdit="selectedBuyer"
        @update:isVisible="value => showEditDialog = value"
        @close="() => showEditDialog = false"
        @update:buyerForEdit="handleUpdate"
    />
<!--    <Dialog header="Данные Покупателя" v-model:visible="showEditDialog" modal class="w-4/5">-->
<!--      <div class="flex flex-col">-->
<!--        <form @submit.prevent="handleUpdate">-->
<!--          <div class="card flex flex-col gap-4">-->
<!--            <FloatLabel variant="on">-->
<!--              <label for="edit-name">Имя</label>-->
<!--              <InputText-->
<!--                  id="edit-name"-->
<!--                  v-model="selectedBuyer.name"-->
<!--                  required-->
<!--                  minlength="3"-->
<!--              />-->
<!--            </FloatLabel>-->

<!--            <FloatLabel variant="on">-->
<!--              <label for="name">NN</label>-->
<!--              <InputText-->
<!--                  id="name"-->
<!--                  v-model="selectedBuyer.numberName"-->
<!--                  required-->
<!--                  minlength="3"-->
<!--              />-->
<!--            </FloatLabel>-->


<!--            &lt;!&ndash; Emails &ndash;&gt;-->

<!--            <div class="flex gap-4 mb-4">-->
<!--              <div v-for="(email, index) in selectedBuyer.emails" :key="index" class=" flex ">-->
<!--                <FloatLabel variant="on">-->
<!--                  <label :for="`email-${index}`">Email</label>-->
<!--                  <InputText-->
<!--                      :id="`email-${index}`"-->
<!--                      v-model="selectedBuyer.emails[index].email"-->
<!--                      type="email"-->
<!--                      required-->

<!--                  />-->
<!--                </FloatLabel>-->
<!--                <Button-->
<!--                    icon="pi pi-trash"-->
<!--                    class="p-button-text p-button-danger ml-2"-->
<!--                    v-if="selectedBuyer.emails.length > 1"-->
<!--                    @click="removeField('emails', index, 'update')"-->
<!--                />-->
<!--              </div>-->
<!--              <Button-->
<!--                  type="button"-->
<!--                  label="Добавить Email"-->
<!--                  icon="pi pi-plus"-->
<!--                  class="p-button-text"-->
<!--                  :class="selectedBuyer.emails.length === 1 ? 'ml-8' : ''"-->
<!--                  @click="addField('emails', 'update')"-->
<!--              />-->
<!--            </div>-->

<!--            &lt;!&ndash; Phones &ndash;&gt;-->
<!--            <div class="flex gap-4 mb-4">-->
<!--              <div v-for="(phone, index) in selectedBuyer.phones" :key="index" class="flex">-->
<!--                <FloatLabel variant="over">-->
<!--                  <label :for="`phone-${index}`">Телефон</label>-->
<!--                  <InputMask-->
<!--                      :id="`phone-${index}`"-->
<!--                      v-model="selectedBuyer.phones[index].phone"-->
<!--                      mask="+9 (999) 999-99-99"-->
<!--                      required-->
<!--                  />-->
<!--                </FloatLabel>-->
<!--                <Button-->
<!--                    icon="pi pi-trash"-->
<!--                    class="p-button-text p-button-danger ml-2"-->
<!--                    v-if="selectedBuyer.phones.length > 1"-->
<!--                    @click="removeField('phones', index, 'update')"-->
<!--                />-->
<!--              </div>-->
<!--              <Button-->
<!--                  type="button"-->
<!--                  label="Добавить Телефон"-->
<!--                  icon="pi pi-plus"-->
<!--                  class="p-button-text"-->
<!--                  :class="selectedBuyer.phones.length === 1 ? 'ml-8' : ''"-->
<!--                  @click="addField('phones', 'update')"-->
<!--              />-->
<!--            </div>-->

<!--            &lt;!&ndash; Addresses &ndash;&gt;-->
<!--            <div class="flex gap-4 mb-4">-->
<!--              <div v-for="(address, index) in selectedBuyer.addresses" :key="index" class="flex">-->
<!--                <FloatLabel variant="over">-->
<!--                  <label :for="`address-${index}`">Адрес</label>-->
<!--                  <InputText-->
<!--                      :id="`address-${index}`"-->
<!--                      v-model="selectedBuyer.addresses[index].address"-->
<!--                  />-->
<!--                </FloatLabel>-->
<!--                <Button-->
<!--                    icon="pi pi-trash"-->
<!--                    class="p-button-text p-button-danger ml-2"-->
<!--                    v-if="selectedBuyer.addresses.length > 1"-->
<!--                    @click="removeField('addresses', index, 'update')"-->
<!--                />-->
<!--              </div>-->
<!--              <Button-->
<!--                  type="button"-->
<!--                  label="Добавить Адрес"-->
<!--                  icon="pi pi-plus"-->
<!--                  class="p-button-text"-->
<!--                  :class="selectedBuyer.addresses.length === 1 ? 'ml-8' : ''"-->
<!--                  @click="addField('addresses', 'update')"-->
<!--              />-->
<!--            </div>-->

<!--            &lt;!&ndash; Comments &ndash;&gt;-->
<!--            <div class="flex flex-col gap-4 items-start">-->
<!--              <div v-for="(comment, index) in selectedBuyer.comments" :key="index" class="field flex items-center">-->
<!--                <div class="flex flex-col">-->
<!--                  <label :for="`comment-${index}`">Комментарий</label>-->
<!--                  <Editor-->
<!--                      :id="`comment-${index}`"-->
<!--                      v-model="selectedBuyer.comments[index].content"-->
<!--                      :modules="editorModule"-->
<!--                  >-->
<!--                    <template v-slot:toolbar>-->

<!--                    </template>-->
<!--                  </Editor>-->
<!--                </div>-->
<!--                <Button-->
<!--                    icon="pi pi-trash"-->
<!--                    class="p-button-text p-button-danger ml-2"-->
<!--                    v-if="selectedBuyer.comments.length > 1"-->
<!--                    @click="removeField('comments', index, 'update')"-->
<!--                />-->
<!--              </div>-->
<!--              <Button-->
<!--                  type="button"-->
<!--                  label="Добавить Комментарий"-->
<!--                  icon="pi pi-plus"-->
<!--                  class="p-button-text"-->
<!--                  :class="selectedBuyer.emails.length === 1 ? 'ml-8' : ''"-->
<!--                  @click="addField('comments', 'update')"-->
<!--              />-->
<!--            </div>-->
<!--          </div>-->

<!--          <Button type="submit" label="Изменить" class="mt-4"/>-->
<!--        </form>-->
<!--        <BuyerProfile :buyer="selectedBuyer"/>-->
<!--      </div>-->
<!--    </Dialog>-->
<!--    <Dialog header="Добавить Покупателя" v-model:visible="showCreateDialog" modal class="w-4/5">-->
<!--      <form @submit.prevent="handleCreate">-->
<!--        <div class="card flex flex-col gap-4">-->
<!--          <FloatLabel variant="on">-->
<!--            <label for="name">Имя</label>-->
<!--            <InputText-->
<!--                id="name"-->
<!--                v-model="newBuyer.name"-->
<!--                required-->
<!--                minlength="3"-->
<!--            />-->
<!--          </FloatLabel>-->

<!--          <FloatLabel variant="on">-->
<!--            <label for="name">NN</label>-->
<!--            <InputText-->
<!--                id="name"-->
<!--                v-model="newBuyer.nn"-->
<!--                required-->
<!--                minlength="3"-->
<!--            />-->
<!--          </FloatLabel>-->


<!--          &lt;!&ndash; Emails &ndash;&gt;-->

<!--          <div class="flex gap-4 mb-4">-->
<!--            <div v-for="(email, index) in newBuyer.emails" :key="index" class=" flex ">-->
<!--              <FloatLabel variant="on">-->
<!--                <label :for="`email-${index}`">Email</label>-->
<!--                <InputText-->
<!--                    :id="`email-${index}`"-->
<!--                    v-model="newBuyer.emails[index]"-->
<!--                    type="email"-->
<!--                    required-->

<!--                />-->
<!--              </FloatLabel>-->
<!--              <Button-->
<!--                  icon="pi pi-trash"-->
<!--                  class="p-button-text p-button-danger ml-2"-->
<!--                  v-if="newBuyer.emails.length > 1"-->
<!--                  @click="removeField('emails', index)"-->
<!--              />-->
<!--            </div>-->
<!--            <Button-->
<!--                type="button"-->
<!--                label="Добавить Email"-->
<!--                icon="pi pi-plus"-->
<!--                class="p-button-text"-->
<!--                :class="newBuyer.emails.length === 1 ? 'ml-8' : ''"-->
<!--                @click="addField('emails')"-->
<!--            />-->
<!--          </div>-->


<!--          &lt;!&ndash; Phones &ndash;&gt;-->
<!--          <div class="flex gap-4 mb-4">-->
<!--            <div v-for="(phone, index) in newBuyer.phones" :key="index" class="flex">-->
<!--              <FloatLabel variant="over">-->
<!--                <label :for="`phone-${index}`">Телефон</label>-->
<!--                <InputMask-->
<!--                    :id="`phone-${index}`"-->
<!--                    v-model="newBuyer.phones[index]"-->
<!--                    mask="+9 (999) 999-99-99"-->
<!--                    required-->
<!--                />-->
<!--              </FloatLabel>-->
<!--              <Button-->
<!--                  icon="pi pi-trash"-->
<!--                  class="p-button-text p-button-danger ml-2"-->
<!--                  v-if="newBuyer.phones.length > 1"-->
<!--                  @click="removeField('phones', index)"-->
<!--              />-->
<!--            </div>-->
<!--            <Button-->
<!--                type="button"-->
<!--                label="Добавить Телефон"-->
<!--                icon="pi pi-plus"-->
<!--                class="p-button-text"-->
<!--                :class="newBuyer.phones.length === 1 ? 'ml-8' : ''"-->
<!--                @click="addField('phones')"-->
<!--            />-->
<!--          </div>-->


<!--          &lt;!&ndash; Addresses &ndash;&gt;-->
<!--          <div class="flex gap-4 mb-4">-->
<!--            <div v-for="(address, index) in newBuyer.addresses" :key="index" class="flex">-->
<!--              <FloatLabel variant="over">-->
<!--                <label :for="`address-${index}`">Адрес</label>-->
<!--                <InputText-->
<!--                    :id="`address-${index}`"-->
<!--                    v-model="newBuyer.addresses[index]"-->
<!--                />-->
<!--              </FloatLabel>-->
<!--              <Button-->
<!--                  icon="pi pi-trash"-->
<!--                  class="p-button-text p-button-danger ml-2"-->
<!--                  v-if="newBuyer.addresses.length > 1"-->
<!--                  @click="removeField('addresses', index)"-->
<!--              />-->
<!--            </div>-->
<!--            <Button-->
<!--                type="button"-->
<!--                label="Добавить Адрес"-->
<!--                icon="pi pi-plus"-->
<!--                class="p-button-text"-->
<!--                :class="newBuyer.addresses.length === 1 ? 'ml-8' : ''"-->
<!--                @click="addField('addresses')"-->
<!--            />-->
<!--          </div>-->

<!--          &lt;!&ndash; Comments &ndash;&gt;-->
<!--          <div class="flex flex-col gap-4 items-start">-->
<!--            <div v-for="(comment, index) in newBuyer.comments" :key="index" class="field flex items-center">-->
<!--              <div class="flex flex-col">-->
<!--                <label :for="`comment-${index}`">Комментарий</label>-->
<!--                <Editor-->
<!--                    :id="`comment-${index}`"-->
<!--                    v-model="newBuyer.comments[index]"-->
<!--                    :modules="editorModule"-->
<!--                >-->
<!--                  <template v-slot:toolbar>-->

<!--                  </template>-->
<!--                </Editor>-->
<!--              </div>-->
<!--              <Button-->
<!--                  icon="pi pi-trash"-->
<!--                  class="p-button-text p-button-danger ml-2"-->
<!--                  v-if="newBuyer.comments.length > 1"-->
<!--                  @click="removeField('comments', index)"-->
<!--              />-->
<!--            </div>-->
<!--            <Button-->
<!--                type="button"-->
<!--                label="Добавить Комментарий"-->
<!--                icon="pi pi-plus"-->
<!--                class="p-button-text"-->
<!--                :class="newBuyer.emails.length === 1 ? 'ml-8' : ''"-->
<!--                @click="addField('comments')"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->

<!--        <Button type="submit" label="Создать" class="mt-4"/>-->
<!--      </form>-->
<!--    </Dialog>-->

    <!-- Диалог Редактирования Покупателя -->

  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {Buyer, useBuyersStore} from '~/stores/buyers'
import {normalizePhoneNumber} from "~/pages/buyers/normalizePhone";
import {debounce} from "@antfu/utils";
import BuyerProfile from "~/components/buyers/BuyerProfile.vue";
import BuyerModal from "~/components/buyers/BuyerModal.vue";
// Импортируйте другие необходимые компоненты и утилиты

const buyersStore = useBuyersStore()
const toast = useMessages()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)

const contextMenu = ref();

const menuModel = ref([
  {label: 'View', icon: 'pi pi-fw pi-search', command: () => editRow()},
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => deleteRow(selectedBuyer)}
]);

const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent);
};

const editRow = () => {
  showEditDialog.value = true
}

const deleteRow = (row) => {
  handleDelete(row.id)
}

const newBuyer = ref({
  name: '',
  nn: '',
  emails: [''],
  phones: [''],
  addresses: [''],
  comments: [''],
})
watch(
    () => newBuyer.value.name,
    (newName) => {
      newBuyer.value.nn = newName;
    }
);


const selectedBuyer = ref<Buyer>()

const loading = ref(false)

const filters = ref({})
const initFilters = () => {
  filters.value = {
    global: {value: null},
    name: {value: null},
    id: {value: null},
    phones: {value: null},
    emails: {value: null},
    address: {value: null},
    comments: {value: null},
  }
}
initFilters()
const globalFilter = ref(null)

const onPage = async (event: any) => {
  buyersStore.limit = event.rows
  buyersStore.currentPage = event.page + 1
  loading.value = true
  await buyersStore.fetchBuyers()
  loading.value = false
}

const onFilterDebounced = debounce(300, async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    globalFilter.value = null
  }
  loading.value = true
  await buyersStore.searchBuyersByForm(event?.filters ?? filters.value)
  loading.value = false
})

const onFilter = async (event: any) => {
  onFilterDebounced(event)
}

const onGlobalDebounced = debounce(300, async () => {
  if (globalFilter.value && globalFilter.value !== '') {
    loading.value = true
    initFilters()
    await buyersStore.searchBuyersByString(globalFilter.value)
    loading.value = false
  } else {
    loading.value = true
    await buyersStore.fetchBuyers()
    loading.value = false
  }
})

const onGlobalFilter = async () => {
  onGlobalDebounced()
}

const editBuyer = (buyer: Buyer) => {
  selectedBuyer.value = {...buyer}
  showEditDialog.value = true
}

const {confirmDelete} = useConfirmation()

const handleDelete = async (id: number) => {
  confirmDelete(
      id,
      async () => {
        await buyersStore.deleteBuyer(id)
        // toast.add({ severity: 'success', summary: 'Успех', detail: 'Покупатель удален' })
        // await buyersStore.fetchBuyers()
      },
  )
}

const addField = (field: 'emails' | 'phones' | 'addresses' | 'comments', type: 'create' | 'update' = 'create') => {
  if (type === 'create') {
    newBuyer.value[field].push(field === 'emails' ? '' : field === 'phones' ? '' : field === 'addresses' ? '' : '')
  } else {
    if (field === 'addresses') {
      selectedBuyer.value[field].push({address: ''})
    } else if (field === 'emails') {
      selectedBuyer.value[field].push({email: ''})
    } else if (field === 'phones') {
      selectedBuyer.value[field].push({phone: ''})
    } else {
      selectedBuyer.value[field].push({content: ''})
    }
  }
}

const removeField = (field: 'emails' | 'phones' | 'addresses' | 'comments', index: number, type: 'create' | 'update' = 'create') => {
  if (type === 'create') {
    newBuyer.value[field].splice(index, 1)
  } else {
    selectedBuyer.value[field].splice(index, 1)
  }
}

const handleCreate = async () => {
  try {
    const phones = newBuyer.value.phones
        .map(phone => normalizePhoneNumber(phone))
        .filter(phone => phone !== null)

    if (phones.length !== newBuyer.value.phones.length) {
      toast.add({severity: 'error', summary: 'Ошибка', detail: 'Некоторые номера телефонов некорректны'})
      return
    }

    newBuyer.value.phones = phones as string[]

    await buyersStore.createBuyer(newBuyer.value)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Покупатель создан'})
    newBuyer.value = {
      name: '',
      emails: [''],
      phones: [''],
      address: [''],
      comments: [''],
    }
    showCreateDialog.value = false
    // await buyersStore.fetchBuyers()
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать покупателя'})
  }
}

const handleUpdate = async (editedBuyer?: Buyer) => {
  if (editedBuyer) selectedBuyer.value = editedBuyer
  if (!selectedBuyer.value) return
  try {

    const phones = selectedBuyer.value.phones.map(phone => ({
      phone: normalizePhoneNumber(phone.phone)
    })).filter(el => el.phone !== null)

    if (phones.length !== selectedBuyer.value.phones.length) {
      toast.add({severity: 'error', summary: 'Ошибка', detail: 'Некоторые номера телефонов некорректны'})
      return
    }
    selectedBuyer.value.phones = phones


    const updatedBuyer = await buyersStore.updateBuyer(selectedBuyer.value.id, selectedBuyer.value)
    if (!updatedBuyer.managers[0]) toast.add({ severity: 'info', summary: 'Ошибка синхронизации', detail: 'Для синхронизации авторизуйтесь на Google странице' });
    toast.add({severity: 'success', summary: 'Успех', detail: 'Покупатель обновлен'})

    showEditDialog.value = false
    // await buyersStore.fetchBuyers()
  } catch (error) {
    if (error.data.managers) {
      toast.add({severity: 'error', summary: 'Ошибка', detail: `Обратитесь к ${error.data.managers.join(', ')}`})
    } else if (error.data.message.some(a => a.includes('phones'))) {
      const phoneErrors = error.data.message
          .filter(a => a.includes('phones'))
          .map(a => parseInt(a.match(/\d+/)?.[0] || '0') + 1)
          .join(', ')
      toast.add({severity: 'error', summary: 'Ошибка', detail: `Проверьте телефоны: ${phoneErrors}`})
    } else {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: `Не удалось обновить покупателя: ${JSON.stringify(error.data)}`
      })
    }
  }
}

const formatEmails = (row: any) =>
    row.emails?.map(item => item.email).join('<br>') || ''

const formatPhones = (row: Buyer) =>
    row.phones?.map(item => item.phone).join('<br>') || ''

const formatAddresses = (row: any) =>
    row.addresses?.map(item => item.address).join('<br>') || ''

const formatComments = (row: any) =>
    row.comments?.map(item => item.content).join('<br>') || ''

onMounted(async () => {
  loading.value = true
  buyersStore.resetFilters()
  await buyersStore.fetchBuyers()
  loading.value = false
})

watch(filters, () => {
  console.time('watch callback'); // Для мониторинга времени срабатывания
  onFilter();
  console.timeEnd('watch callback');
}, {deep: true});




</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
}

.field label {
  margin-bottom: 0.5rem;
}


</style>

<style>
.p-datatable-column-filter-clear-button {
  display: block;
}

.p-floatlabel, .p-datatable-filter-element-container, .p-datatable-filter-element-container .p-inputtext  {
  max-width: 12rem !important;
}



</style>
