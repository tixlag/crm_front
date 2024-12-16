<script setup lang="ts">
import {normalizePhoneNumber} from "~/pages/buyers/normalizePhone";
import {ref, watch} from "vue";
import BuyerProfile from "~/components/buyers/BuyerProfile.vue";

const emit = defineEmits(['close', "update:visible", 'update:buyer', 'update:buyerForEdit'])
const props = defineProps({
  buyer: Object, // Если есть, это редактирование
  buyerForEdit: Object, // Если есть, это редактирование
  isVisible: true
})

const buyersStore = useBuyersStore()
const authStore = useAuthStore()
const toast = useMessages()

const newBuyer = ref({
  name: '',
  nn: '',
  emails: [''],
  phones: [''],
  addresses: [''],
  comments: [{content: ''}],
})
watch(
    () => newBuyer.value.name,
    (newName) => {
      newBuyer.value.nn = newName;
    }
);
const selectedBuyer = ref()

const isEdit = computed(() => !!props.buyerForEdit)


watch(
    () => props.buyerForEdit,
    (buyerForEdit) => {
      selectedBuyer.value = buyerForEdit
    }
);

function handleClose() {
  emit('close')
  emit('update:visible', false);
}

const addField = (field: 'emails' | 'phones' | 'addresses' | 'comments', type: 'create' | 'update' = 'create') => {
  if (type === 'create') {
    if (field === "comments") newBuyer.value[field].push({ content: '' })
    else newBuyer.value[field].push(field === 'emails' ? '' : field === 'phones' ? '' : field === 'addresses' ? '' : '')
  } else {
    if (field === 'addresses') {
      selectedBuyer.value[field].push({ address: '' })
    } else if (field === 'emails') {
      selectedBuyer.value[field].push({ email: '' })
    } else if (field === 'phones') {
      selectedBuyer.value[field].push({ phone: '' })
    } else {
      selectedBuyer.value[field].push({ content: '' })
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
      toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Некоторые номера телефонов некорректны' })
      return
    }

    newBuyer.value.phones = phones as string[]

    newBuyer.value.phones = phones as string[];

    // Создание покупателя
    const createdBuyer = await buyersStore.createBuyer(newBuyer.value);
    if (!createdBuyer.managers[0]) toast.add({ severity: 'info', summary: 'Ошибка синхронизации', detail: 'Для синхронизации авторизуйтесь на Google странице' });

    toast.add({ severity: 'success', summary: 'Успех', detail: 'Покупатель создан' });
    // Отправка события с новым покупателем
    emit("update:buyer", createdBuyer);

    // Закрытие модального окна
    handleClose();

    // Сброс формы
    newBuyer.value = {
      name: '',
      emails: [''],
      phones: [''],
      addresses: [''],
      comments: [''],
    };
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Не удалось создать покупателя', detail: 'Подробнее в консоли' })
  }
}
</script>

<template>
  <Dialog v-if="!buyerForEdit" header="Добавить Покупателя" modal :visible="isVisible" @update:visible="handleClose" class="w-4/5">
    <form @submit.prevent="handleCreate">
        <div class="card flex flex-col gap-4">
          <FloatLabel variant="on">
          <label for="name">Имя</label>
          <InputText
              id="name"
              v-model="newBuyer.name"
              required
              minlength="3"
          />
          </FloatLabel>

          <FloatLabel variant="on">
          <label for="name">NN</label>
          <InputText
              id="name"
              v-model="newBuyer.nn"
              required
              minlength="3"
          />
          </FloatLabel>


      <!-- Emails -->

          <div class="flex gap-4 mb-4 flex-wrap">
            <div v-for="(email, index) in newBuyer.emails" :key="index" class=" flex ">
              <FloatLabel variant="on">
            <label :for="`email-${index}`">Email</label>
            <InputText
                :id="`email-${index}`"
                v-model="newBuyer.emails[index]"
                type="email"
                required

            />
              </FloatLabel>
          <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger ml-2"
              v-if="newBuyer.emails.length > 1"
              @click="removeField('emails', index)"
          />
        </div>
        <Button
            type="button"
            label="Добавить Email"
            icon="pi pi-plus"
            class="p-button-text"
                :class="newBuyer.emails.length === 1 ? 'ml-8' : ''"
            @click="addField('emails')"
        />
      </div>

      <!-- Phones -->
          <div class="flex gap-4 mb-4 flex-wrap">
            <div v-for="(phone, index) in newBuyer.phones" :key="index" class="flex">
              <FloatLabel variant="over">
            <label :for="`phone-${index}`">Телефон</label>
            <InputMask
                :id="`phone-${index}`"
                v-model="newBuyer.phones[index]"
                    mask="+9 (999) 999-99-99"
                required
            />
              </FloatLabel>
          <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger ml-2"
              v-if="newBuyer.phones.length > 1"
              @click="removeField('phones', index)"
          />
        </div>
        <Button
            type="button"
            label="Добавить Телефон"
            icon="pi pi-plus"
            class="p-button-text"
                :class="newBuyer.phones.length === 1 ? 'ml-8' : ''"
            @click="addField('phones')"
        />
      </div>

      <!-- Addresses -->
          <div class="flex gap-4 mb-4 flex-wrap">
            <div v-for="(address, index) in newBuyer.addresses" :key="index" class="flex">
              <FloatLabel variant="over">
            <label :for="`address-${index}`">Адрес</label>
            <InputText
                :id="`address-${index}`"
                v-model="newBuyer.addresses[index]"
            />
              </FloatLabel>
          <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger ml-2"
              v-if="newBuyer.addresses.length > 1"
              @click="removeField('addresses', index)"
          />
        </div>
        <Button
            type="button"
            label="Добавить Адрес"
            icon="pi pi-plus"
            class="p-button-text"
                :class="newBuyer.addresses.length === 1 ? 'ml-8' : ''"
            @click="addField('addresses')"
        />
      </div>

      <!-- Comments -->
          <div class="flex flex-col gap-4 items-start">
        <div v-for="(comment, index) in newBuyer.comments" :key="index" class="field flex items-center">
              <div class="flex flex-col">
            <label :for="`comment-${index}`">Комментарий</label>
                <Editor
                :id="`comment-${index}`"
                v-model="newBuyer.comments[index].content"
                    :modules="editorModule"
                >
                  <template v-slot:toolbar>

                  </template>
                </Editor>
          </div>
          <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger ml-2"
              v-if="newBuyer.comments.length > 1"
              @click="removeField('comments', index)"
          />
        </div>
        <Button
            type="button"
            label="Добавить Комментарий"
            icon="pi pi-plus"
            class="p-button-text"
                :class="newBuyer.emails.length === 1 ? 'ml-8' : ''"
            @click="addField('comments')"
        />
      </div>
        </div>

      <Button type="submit" label="Создать" class="mt-4" />
    </form>
  </Dialog>
  <Dialog v-if="buyerForEdit" header="Данные Покупателя" :visible="isVisible" @update:visible="handleClose" modal class="w-4/5">
    <div class="flex flex-col">
      <form @submit.prevent="emit('update:buyerForEdit')">
        <div class="card flex flex-col gap-4">
          <FloatLabel variant="on">
            <label for="edit-name">Имя</label>
            <InputText
                id="edit-name"
                v-model="selectedBuyer.name"
                required
                minlength="3"
            />
          </FloatLabel>

          <FloatLabel variant="on">
            <label for="name">NN</label>
            <InputText
                id="name"
                v-model="selectedBuyer.numberName"
                required
                minlength="3"
            />
          </FloatLabel>


          <!-- Emails -->

          <div class="flex gap-4 mb-4 flex-wrap">
            <div v-for="(email, index) in selectedBuyer.emails" :key="index" class=" flex ">
              <FloatLabel variant="on">
                <label :for="`email-${index}`">Email</label>
                <InputText
                    :id="`email-${index}`"
                    v-model="selectedBuyer.emails[index].email"
                    type="email"
                    required

                />
              </FloatLabel>
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger ml-2"
                  v-if="selectedBuyer.emails.length > 1"
                  @click="removeField('emails', index, 'update')"
              />
            </div>
            <Button
                type="button"
                label="Добавить Email"
                icon="pi pi-plus"
                class="p-button-text"
                :class="selectedBuyer.emails.length === 1 ? 'ml-8' : ''"
                @click="addField('emails', 'update')"
            />
          </div>

          <!-- Phones -->
          <div class="flex gap-4 mb-4 flex-wrap">
            <div v-for="(phone, index) in selectedBuyer.phones" :key="index" class="flex">
              <FloatLabel variant="over">
                <label :for="`phone-${index}`">Телефон</label>
                <InputMask
                    :id="`phone-${index}`"
                    v-model="selectedBuyer.phones[index].phone"
                    mask="+9 (999) 999-99-99"
                    required
                />
              </FloatLabel>
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger ml-2"
                  v-if="selectedBuyer.phones.length > 1"
                  @click="removeField('phones', index, 'update')"
              />
            </div>
            <Button
                type="button"
                label="Добавить Телефон"
                icon="pi pi-plus"
                class="p-button-text"
                :class="selectedBuyer.phones.length === 1 ? 'ml-8' : ''"
                @click="addField('phones', 'update')"
            />
          </div>

          <!-- Addresses -->
          <div class="flex gap-4 mb-4 flex-wrap">
            <div v-for="(address, index) in selectedBuyer.addresses" :key="index" class="flex">
              <FloatLabel variant="over">
                <label :for="`address-${index}`">Адрес</label>
                <InputText
                    :id="`address-${index}`"
                    v-model="selectedBuyer.addresses[index].address"
                />
              </FloatLabel>
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger ml-2"
                  v-if="selectedBuyer.addresses.length > 1"
                  @click="removeField('addresses', index, 'update')"
              />
            </div>
            <Button
                type="button"
                label="Добавить Адрес"
                icon="pi pi-plus"
                class="p-button-text"
                :class="selectedBuyer.addresses.length === 1 ? 'ml-8' : ''"
                @click="addField('addresses', 'update')"
            />
          </div>

          <!-- Comments -->
          <div class="flex flex-col gap-4 items-start">
            <div v-for="(comment, index) in selectedBuyer.comments" :key="index" class="field flex items-center">
              <div class="flex flex-col">
                <label :for="`comment-${index}`">Комментарий</label>
                <Editor
                    :id="`comment-${index}`"
                    v-model="selectedBuyer.comments[index].content"
                    :modules="editorModule"
                >
                  <template v-slot:toolbar>

                  </template>
                </Editor>
              </div>
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger ml-2"
                  v-if="selectedBuyer.comments.length > 1"
                  @click="removeField('comments', index, 'update')"
              />
            </div>
            <Button
                type="button"
                label="Добавить Комментарий"
                icon="pi pi-plus"
                class="p-button-text"
                :class="selectedBuyer.emails.length === 1 ? 'ml-8' : ''"
                @click="addField('comments', 'update')"
            />
          </div>
          <Button type="submit" label="Изменить" class="mt-4"/>
        </div>


      </form>
      <BuyerProfile
          v-if="(authStore.user.roles.includes('ADMIN') || authStore.user.settings.canSeeHistory_order)"
          :buyer="selectedBuyer"/>
    </div>
  </Dialog>
</template>

<style scoped>

</style>
