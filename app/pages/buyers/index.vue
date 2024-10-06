<template>
  <div class="p-4">
    <div class="flex justify-between mb-4">
      <h2>Покупатели</h2>
      <Button label="Добавить" icon="pi pi-plus" @click="showCreateDialog = true" />
    </div>
    <SearchForm
        :fields="buyersFields"
        :validation-schema="validationSchema"
        :current-page="buyersStore.currentPage"
        :total-items="buyersStore.total"
        :items-per-page="buyersStore.limit"
        @page-changed="formHandlers.handlePageChange"
        @search-form="formHandlers.handleSearchForm"
        @search-string="formHandlers.handleSearchString"
    />
    <DataTable v-if="buyersStore.buyers.length > 0" stripedRows :value="buyersStore.buyers" paginator :rows="buyersStore.limit" :rowsPerPageOptions="[10, 25, 100]" :totalRecords="buyersStore.total" @page="onPage">
      <Column field="id" header="ID" sortable></Column>
      <Column field="name" header="Имя" sortable></Column>
      <Column field="emails" header="Email" :body="formatEmails"></Column>
      <Column field="phones" header="Телефоны" :body="formatPhones"></Column>
      <Column field="comments" header="Комментарии" :body="formatComments"></Column>
      <Column header="Действия" :body="actionBody" style="width: 150px;"></Column>
    </DataTable>

    <div v-else>
      Пока пусто
    </div>

    <!-- Диалог Создания Покупателя -->
    <Dialog header="Добавить Покупателя" v-model:visible="showCreateDialog" modal class="w-4/5">
      <FormKit
          type="form"
          @submit="handleCreate"
          :actions="false"
      >
        <FormKit
            type="primeInputText"
            style="width: 200px"
            name="name"
            label="Имя"
            id="name"
            validation="required|length:3"
            v-model="newBuyer.name"
        />

        <!-- Emails -->
        <div class="card flex flex-col md:flex-row gap-4">
          <div v-for="(email, index) in newBuyer.emails" :key="index" class="field">
            <FormKit
                label="Email"
                type="primeInputText"
                name="emails"
                id="emails"
                validation="required|email"
                v-model="newBuyer.emails[index]"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                v-if="newBuyer.emails.length > 1"
                @click="removeField('emails', index)"
            />
          </div>
          <Button
              type="button"
              label="Добавить Email"
              icon="pi pi-plus"
              class="p-button-text"
              @click="addField('emails')"
          />
        </div>

        <!-- Phones -->
        <div class="card flex flex-col md:flex-row gap-4">
          <div v-for="(phone, index) in newBuyer.phones" :key="index" class="field">
            <FormKit
                type="primeInputMask"
                mask="+7 (999) 999-99-99"
                label="Телефон"
                name="phones"
                id="phones"
                validation="required"
                v-model="newBuyer.phones[index]"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                v-if="newBuyer.phones.length > 1"
                @click="removeField('phones', index)"
            />
          </div>
          <Button
              type="button"
              label="Добавить Телефон"
              icon="pi pi-plus"
              class="p-button-text"
              @click="addField('phones')"
          />
        </div>

        <!-- Addresses -->
        <div class="card flex flex-col md:flex-row gap-4">
          <div v-for="(address, index) in newBuyer.address" :key="index" class="field">
            <FormKit
                label="Адрес"
                type="primeInputText"
                name="address"
                id="address"
                v-model="newBuyer.address[index]"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                v-if="newBuyer.address.length > 1"
                @click="removeField('address', index)"
            />
          </div>
          <Button
              type="button"
              label="Добавить Адрес"
              icon="pi pi-plus"
              class="p-button-text"
              @click="addField('address')"
          />
        </div>

        <!-- Comments -->
        <div class="card flex flex-col md:flex-row gap-4">
          <div v-for="(comment, index) in newBuyer.comments" :key="index" class="field">
            <FormKit
                label="Комментарий"
                type="primeInputText"
                name="comments"
                id="comment"
                v-model="newBuyer.comments[index]"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                v-if="newBuyer.comments.length > 1"
                @click="removeField('comments', index)"
            />
          </div>
          <Button
              type="button"
              label="Добавить Комментарий"
              icon="pi pi-plus"
              class="p-button-text"
              @click="addField('comments')"
          />
        </div>

        <Button type="submit" label="Создать" class="mt-4" />
      </FormKit>
    </Dialog>

    <!-- Диалог Редактирования Покупателя -->
    <Dialog header="Редактировать Покупателя" v-model:visible="showEditDialog" modal>
      <FormKit
          type="form"
          @submit="handleUpdate"
      >
        <div class="field">
          <label for="editName">Имя</label>
          <FormKit
              type="text"
              name="editName"
              id="editName"
              validation="required|min:3"
              v-model="selectedBuyer.name"
          />
        </div>
        <div class="field">
          <label for="editNumberName">Номер</label>
          <FormKit
              type="text"
              name="editNumberName"
              id="editNumberName"
              validation="required"
              v-model="selectedBuyer.numberName"
          />
        </div>
        <div class="field">
          <label for="editEmails">Email</label>
          <FormKit
              type="email"
              name="editEmails"
              id="editEmails"
              validation="required|email"
              v-model="selectedBuyer.emails"
              multiple
          />
        </div>
        <div class="field">
          <label for="editPhones">Телефоны</label>
          <FormKit
              type="tel"
              name="editPhones"
              id="editPhones"
              validation="required"
              v-model="selectedBuyer.phones"
              multiple
          />
        </div>
        <div class="field">
          <label for="editAddress">Адрес</label>
          <FormKit
              type="text"
              name="editAddress"
              id="editAddress"
              v-model="selectedBuyer.address"
              multiple
          />
        </div>
        <Button type="submit" label="Сохранить" class="mt-4" />
      </FormKit>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {type Buyer, useBuyersStore} from '~/stores/buyers'
import { useToast } from 'primevue/usetoast'
import { normalizePhoneNumber } from "~/pages/buyers/normalizePhone"
import {buyersFields, formHandlers} from "~/pages/buyers/searchBuyers" // Предполагается, что у вас есть файл, экспортирующий buyersFields
import SearchForm from '~/components/SearchForm.vue' // Путь к вашему универсальному SearchForm
import Pagination from '~/components/Pagination.vue' // Путь к вашему компоненту Pagination

const buyersStore = useBuyersStore()
const toast = useToast()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)

const newBuyer = ref({
  name: '',
  emails: [''],
  phones: [''],
  address: [''],
  comments: [''],
})

const selectedBuyer = ref<Buyer>({
      id: 0,
      name: '',
      emails: [''],
      phones: [''],
      address: [''],
      comments: [''],
    })

const onPage = (event: any) => {
  buyersStore.limit = event.rows
  buyersStore.currentPage = event.page + 1
}



const addField = (field: 'emails' | 'phones' | 'address' | 'comments') => {
  newBuyer.value[field].push('')
}

const removeField = (field: 'emails' | 'phones' | 'address' | 'comments', index: number) => {
  newBuyer.value[field].splice(index, 1)
}

const handleCreate = async () => {
  try {
    // Нормализуем каждый телефон перед отправкой
    const phones = newBuyer.value.phones
        .map(phone => normalizePhoneNumber(phone))
        .filter(phone => phone !== null)

    if (phones.length !== newBuyer.value.phones.length) {
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Некоторые номера телефонов некорректны' })
      return
    }

    newBuyer.value.phones = phones as string[]

    await buyersStore.createBuyer(newBuyer.value)
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Покупатель создан' })
    showCreateDialog.value = false
    newBuyer.value = {
      name: '',
      emails: [''],
      phones: [''],
      address: [''],
      comments: [''],
    }
    await buyersStore.fetchBuyers(buyersStore.currentPage, buyersStore.limit)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать покупателя' })
  }
}

const handleUpdate = async () => {
  if (!selectedBuyer.value) return
  try {
    await buyersStore.updateBuyer(selectedBuyer.value.id, selectedBuyer.value)
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Покупатель обновлен' })
    showEditDialog.value = false
    await buyersStore.fetchBuyers(buyersStore.currentPage, buyersStore.limit)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить покупателя' })
  }
}

const handleDelete = async (id: number) => {
  try {
    await buyersStore.deleteBuyer(id)
    toast.add({ severity: 'success', summary: 'Успех', detail: 'Покупатель удален' })
    await buyersStore.fetchBuyers(buyersStore.currentPage, buyersStore.limit)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить покупателя' })
  }
}

const formatEmails = (row: Buyer) =>
    row.emails.map(
        email => {
          return email.email
        }).join(', ')
const formatPhones = (row: Buyer) => row.phones.map(phone => {return phone}).join(', ')
const formatComments = (row: Buyer) => row.comments.map(comment => {return comment}).join(', ')

const actionBody = (row: Buyer) => {
  return `
      <div class="flex space-x-2">
      <Button
          icon="pi pi-pencil"
  class="p-button-text"
  onClick={() => {
    selectedBuyer.value = { ...row }
    showEditDialog.value = true
  }}
  />
  <Button
  icon="pi pi-trash"
  class="p-button-text p-button-danger"
  onClick={() => handleDelete(row.id)}
  />
  </div>
  `

}



onMounted(async () => {
  await buyersStore.fetchBuyers(buyersStore.currentPage, buyersStore.limit)
})

// Слежение за изменениями в store для обновления локальных данных
watch(
    () => [buyersStore.buyers, buyersStore.total, buyersStore.currentPage, buyersStore.limit],
    () => {
      // Если необходимо, можно выполнить дополнительные действия при изменении данных
    }
)

// Валидационная схема для SearchForm если требуется (например, для поиска по форме)
const validationSchema = {
  // Определите схему валидации по необходимости
}
</script>

<style scoped>
.field {
  display: flex;
  align-items: center;
}
</style>
