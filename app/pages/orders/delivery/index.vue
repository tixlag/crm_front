<template>
  <div class="p-4">
    <div class="flex justify-left items-center gap-4 mb-4">
      <h2>Заказы</h2>
<!--      <Button label="Добавить" icon="pi pi-plus" @click="showCreateDialog = true"/>-->

      <MultiSelect filter v-model="filters['deliveryTypes'].value"  display="chip"
                   :options="getDeliveryTypesForUser" optionLabel="name" option-value="id"
                   :placeholder="'Логистика'">
        <template #option="slotProps">
          <div class="flex items-center w-100% gap-5">
            <div>{{ slotProps.option.name }}</div>
            <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
          </div>
        </template>
      </MultiSelect>
    </div>
<!--    <div class="flex flex-col gap-4 mb-4">-->
<!--      <div class="flex justify-center gap-4">-->
<!--        <MultiSelect v-for="filter in globalFiltersMulti" filter v-model="filters[filter.filter].value"-->
<!--                     :options="settingsStore[filter.filter]" optionLabel="name" option-value="id"-->
<!--                     :placeholder="filter.placeholder">-->
<!--          <template #option="slotProps">-->
<!--            <div class="flex items-center w-100% gap-5">-->
<!--              <div>{{ slotProps.option.name }}</div>-->
<!--              <div class="h-1rem w-100%" :style="getColorByField(slotProps.option)"></div>-->
<!--            </div>-->
<!--          </template>-->
<!--        </MultiSelect>-->


<!--      </div>-->
<!--      <div class="flex justify-center gap-4">-->
<!--        <InputText v-model="filters.comments.value" type="text"  placeholder="Комментарий"/>-->
<!--        <InputText v-model="filters.product.value" type="text"  placeholder="Товар"/>-->

<!--        <DatePicker-->
<!--            v-model="filters.createdAt.value"-->
<!--            selectionMode="range"-->
<!--            dateFormat="dd.mm.y"-->
<!--            @date-select="setDateToFilter"-->
<!--            placeholder="Дата"-->
<!--        >-->
<!--        </DatePicker>-->
<!--      </div>-->
<!--      <div class="flex justify-center gap-4">-->
<!--        <InputText v-for="filter in globalFiltersBuyer" v-model="filters[filter.filter].value" type="text"-->
<!--                   :placeholder="filter.placeholder"/>-->

      <div class="flex gap-4 mb-4 flex-wrap">
        <Button severity="info"  label="Позавчера" @click="getOrdersByDay(2, false)" />
        <Button severity="info" label="Вчера" @click="getOrdersByDay(1, false)" />
        <Button severity="info" outlined label="Сегодня" @click="getOrdersByDay(0, true)" />
        <Button severity="info" label="Завтра" @click="getOrdersByDay(1, true)" />
        <Button severity="info" label="Будущие" @click="getFutureOrders" />
      </div>



    <ContextMenu ref="contextMenu" :model="menuModel"/>
    <DataTable
        class="dt-color-cell"
        :value="orders"
        paginator
        :rows="ordersStore.limit"
        :totalRecords="ordersStore.total"
        :lazy="true"
        @page="onPage"
        :loading="loading"
        :filters="filters"
        :filterDisplay="'row'"
        :globalFilterFields="['id', 'name', 'phones', 'emails', 'addresses', 'comments']"
        @filter="onFilterDebounced"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first} по {last} из {totalRecords}"
        contextMenu v-model:contextMenuSelection="selectedOrder"
        @rowContextmenu="onRowContextMenu"
        scrollable
        editMode="cell" @cell-edit-complete="onCellEditComplete"
        :pt="{
            table: { style: 'min-width: 50rem' },
            column: {
                bodycell: ({ state }) => ({
                    class: [{ '!py-0': state['d_editing'] }]
                })
            },

        }"
        dataKey="id"
        v-model:expandedRows="expandedRows"
        stateStorage="session" stateKey="delivery-table-setting"
    >
      <template #header>
        <div class="flex justify-between items-center gap-x-10">
          <div style="white-space: nowrap;">Всего: {{ ordersStore.total }}</div>
          <div class="flex gap-4">
            <Button type="button" severity="secondary" icon="pi pi-filter-slash" label="Очистить" outlined
                    @click="clearFilter()"/>
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

      <template #empty>
        Нет заказов.
      </template>

      <template #loading>
        Загрузка данных заказов. Пожалуйста, подождите.
      </template>
      <Column expander style="width: 3em" class="expander-cell"></Column>
      <template #expansion="{ data }">

        <div class="expansion-content">
          <div class="flex flex-col gap-2 text-center text-wrap w-full bg-[#d9edf7]">
            <b>Комментарии к заказу</b>
            <div v-for="(comment, index) in data.comments">
              <div class="flex flex-col"><span v-if="data.comments.length > 1">Комментарий {{ data.comments.length > 1 ? index + 1 : '' }}: </span>
                <div v-html="comment.content"></div>
<!--                <small title="Добавил" style="display: block; color: gray;">{{-->
<!--                    settingsStore.getField('managers', 'name', comment.userId)-->
<!--                  }}</small>-->
              </div>

            </div>
          </div>
<!--          <div class="p-4 flex gap-2" :class="classForExpand">-->
<!--            <div v-if="data.buyer.phones?.length > 0" v-for="(phone, index) in data.buyer.phones">-->
<!--              <div class="border-0 border-solid border-r-1.5 pr-4">Телефон {{ index + 1 }}: <b>{{ phone.phone }}</b>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="p-4 flex gap-2" :class="classForExpand">-->
<!--            <div v-if="data.buyer.addresses?.length > 0" v-for="(address, index) in data.buyer.addresses">-->
<!--              <div class="border-0 border-solid border-r-1.5 pr-4">Адрес {{ index + 1 }}: <b>{{ address.address }}</b>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="p-4 flex gap-2" :class="classForExpand">-->
<!--            <div class="flex items-center gap-2 border-0 border-solid border-r-1.5 pr-4"-->
<!--                 v-if="data.buyer.comments?.length > 0" v-for="(comment, index) in data.buyer.comments">-->
<!--              <div class="flex flex-col">Комментарий {{ data.buyer.comments.length > 1 ? index + 1 : '' }}:-->
<!--              </div>-->
<!--              <div v-html="comment.content"></div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="p-4 flex gap-2" :class="classForExpand">-->
<!--            <div>Доставка: <b>{{ settingsStore.getField('deliveryTypes', 'name', data.deliveryTypeId) }}-->
<!--              ({{ data.deliveryPrice }})</b>-->
<!--            </div>-->
<!--          </div>-->
          <!--        todo может вынести в отдельный компонент и там делать запрос на сервер?-->
<!--          <div class="flex">-->
<!--            <div class="flex flex-col gap-2 text-center text-wrap w-full bg-[#d9edf7]">-->
<!--              <b>Комментарии к заказу</b>-->
<!--              <div v-for="(comment, index) in data.comments">-->
<!--                <div class="flex flex-col"><span v-if="data.comments.length > 1">Комментарий {{ data.comments.length > 1 ? index + 1 : '' }}: </span>-->
<!--                  <div v-html="comment.content"></div>-->

<!--                </div>-->

<!--              </div>-->
<!--            </div>-->

<!--          </div>-->
<!--          <Toolbar class="bg-[#d9edf7] ">-->
<!--&lt;!&ndash;            <template #start>&ndash;&gt;-->
<!--&lt;!&ndash;              <Button label="Удалить заказ" icon="pi pi-trash" class="mr-2" severity="danger"/>&ndash;&gt;-->
<!--&lt;!&ndash;              <Button label="Дубликат" icon="pi pi-copy" class="mr-2" severity="info" @click="onDuplicate(data)"/>&ndash;&gt;-->
<!--&lt;!&ndash;            </template>&ndash;&gt;-->

<!--            <template #center>-->
<!--              <SplitButton label="Печать чека" icon="pi pi-print" class="mr-2" raized-->
<!--                           @click="printCheque(data, data.chequeId)"-->
<!--                           :model="settingsStore.cheques.map(c => {return {label: c.name, command: () => printCheque(data, c.id)}})" />-->
<!--&lt;!&ndash;              <Button label="Редактировать заказ" icon="pi pi-pen-to-square" class="mr-2"&ndash;&gt;-->
<!--&lt;!&ndash;                      severity="warn" @click="editOrder(data)"/>&ndash;&gt;-->
<!--            </template>-->

<!--            <template #end>-->
<!--&lt;!&ndash;              <Button label="История изменений" icon="pi pi-history" class="mr-2" severity="help"&ndash;&gt;-->
<!--&lt;!&ndash;                      @click="visibleHistory[data.id] = !visibleHistory[data.id]"/>&ndash;&gt;-->
<!--              <Button label="Закрыть" icon="pi pi-times" class="mr-2" severity="danger"/>-->
<!--            </template>-->
<!--          </Toolbar>-->
<!--          <OrderChangeLog v-if="visibleHistory[data.id]" :orderId="data.id"/>-->
        </div>
      </template>


      <Column v-for="col of columnsForAutoRender" :key="col.field" :field="col.field"
              >
        <template #header>
          <template v-for="head in col.header.split(';')">
            {{ head }}<br>
          </template>
        </template>
        <template #body="{ data, field }">
          <div v-if="field==='managers'" class="flex flex-col">
            <div >{{ getNameByField(data, "managers") }} /</div>
            <div >{{ getNameByField(data, "managerLastEdit") }}</div>
          </div>
          <div v-if="columnsWithColor.includes(col.field)" :data-style="getColorByField(data, field)"
               class="flex flex-col with-bg-color"
          >

            <div>{{ getNameByField(data, field) }}</div>
          </div>
          <div v-if="field==='price' && data.payType.canSeeByDeliveryman" class="flex flex-col ">
            <div>{{ data.totalAmount }}/</div>
            <div>{{ data.deliveryPrice }}</div>
            <div>{{ getNameByField(data, "payTypes") }}</div>
          </div>
          <div v-if="field==='createdAt'" class="flex flex-col ">
            <div>{{ formatDate(data.createdAt) }}</div>
            <small style="display: block; color: gray;">{{ formatTime(data.createdAt) }}</small>
          </div>
          <div v-if="field === 'comments'"
               class="flex flex-col text-wrap max-h-5rem overflow-hidden"
               v-html="formatComments(data)"></div>
        </template>
        <template #editor="{data, field}"
                  v-if="['orderStatuses', 'deliveryTypes'].includes(col.field)"
        >
          <MultiSelect @update:model-value="value => onMultiselectCellChange(data, field, value)"
                       :model-value="[data[extractOrderField(field, true)]]" :options="settingsStore[field]"
                       optionLabel="name">
            <template #option="slotProps">
              <div class="flex items-center w-100% gap-5">
                <div>{{ slotProps.option.name }}</div>
                <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
              </div>
            </template>
          </MultiSelect>
        </template>
        <!--          <template #filter="{ field}">-->
        <!--            <template v-if="!['price', 'buyer'].includes(col.field)">-->
        <!--              <MultiSelect v-if="col.field !== 'createdAt' && col.field !== 'comments'" filter-->
        <!--                           v-model="filters[field].value"-->
        <!--                           :options="settingsStore[field]"-->
        <!--                           optionLabel="name" option-value="id">-->
        <!--                <template #option="slotProps">-->
        <!--                  <div class="flex items-center w-100% gap-5">-->
        <!--                    <div>{{ slotProps.option.name }}</div>-->
        <!--                    <div class="h-1rem w-100%" :style="getColorByField(slotProps.option)"></div>-->
        <!--                  </div>-->
        <!--                </template>-->
        <!--              </MultiSelect>-->
        <!--              <FloatLabel v-if="col.field === 'createdAt'" variant="on">-->
        <!--                <DatePicker-->
        <!--                    v-model="filters.createdAt.value"-->
        <!--                    selectionMode="range"-->
        <!--                    dateFormat="dd.mm.y"-->
        <!--                    @date-select="setDateToFilter"-->
        <!--                >-->
        <!--                </DatePicker>-->
        <!--                <label class="pi">&#xe908;</label>-->
        <!--              </FloatLabel>-->
        <!--              <FloatLabel v-if="col.field === 'comments'" variant="on">-->
        <!--                <InputText v-model="filters.comments.value" type="text""/>-->
        <!--                <label class="pi">&#xe908;</label>-->
        <!--              </FloatLabel>-->
        <!--            </template>-->
        <!--            <template v-if="col.field === 'buyer'">-->
        <!--              <FloatLabel variant="on">-->
        <!--                <InputText v-model="filters.buyer.value" type="text""/>-->
        <!--                <label class="pi">&#xe908;</label>-->
        <!--              </FloatLabel>-->
        <!--            </template>-->
        <!--          </template>-->
      </Column>


<!--      <Column header="Действия" style="min-width: 6rem">-->
<!--        <template #body="{ data }">-->
<!--          <div class="flex space-x-2">-->
<!--            <Button-->
<!--                icon="pi pi-pencil"-->
<!--                class="p-button-text"-->
<!--                @click="editOrder(data)"-->
<!--            />-->
<!--            <Button-->
<!--                icon="pi pi-trash"-->
<!--                class="p-button-text p-button-danger"-->
<!--                @click="handleDelete(data.id)"-->
<!--            />-->
<!--          </div>-->
<!--        </template>-->
<!--      </Column>-->
    </DataTable>

    <!-- Диалог Создания Покупателя -->


    <!-- Диалог Редактирования Покупателя -->
    <!--      <Dialog header="Редактировать Покупателя" v-model:visible="showEditDialog" modal class="w-4/5">-->
    <!--        <form @submit.prevent="handleUpdate">-->
    <!--          <div class="card flex flex-col md:flex-row gap-4">-->
    <!--            <div class="field">-->
    <!--              <label for="edit-name">Имя</label>-->
    <!--              <InputText-->
    <!--                  id="edit-name"-->
    <!--                  v-model="selectedOrder.name"-->
    <!--                  required-->
    <!--                  minlength="3"-->
    <!--                  class="w-full"-->
    <!--                  placeholder="Имя"-->
    <!--              />-->
    <!--            </div>-->
    <!--          </div>-->

    <!--          &lt;!&ndash; Emails &ndash;&gt;-->
    <!--          <div class="card flex flex-col md:flex-row gap-4">-->
    <!--            <div v-for="(email, index) in selectedOrder.emails" :key="index" class="field flex items-center">-->
    <!--              <div class="w-full">-->
    <!--                <label :for="`email-edit-${index}`">Email</label>-->
    <!--                <InputText-->
    <!--                    :id="`email-edit-${index}`"-->
    <!--                    v-model="selectedOrder.emails[index].email"-->
    <!--                    type="email"-->
    <!--                    class="w-full"-->
    <!--                    placeholder="Email"-->
    <!--                />-->
    <!--              </div>-->
    <!--              <Button-->
    <!--                  icon="pi pi-trash"-->
    <!--                  class="p-button-text p-button-danger ml-2"-->
    <!--                  v-if="selectedOrder.emails.length > 1"-->
    <!--                  @click="removeField('emails', index, 'update')"-->
    <!--              />-->
    <!--            </div>-->
    <!--            <Button-->
    <!--                type="button"-->
    <!--                label="Добавить Email"-->
    <!--                icon="pi pi-plus"-->
    <!--                class="p-button-text"-->
    <!--                @click="addField('emails', 'update')"-->
    <!--            />-->
    <!--          </div>-->

    <!--          &lt;!&ndash; Phones &ndash;&gt;-->
    <!--          <div class="card flex flex-col md:flex-row gap-4">-->
    <!--            <div v-for="(phone, index) in selectedOrder.phones" :key="index" class="field flex items-center">-->
    <!--              <div class="w-full">-->
    <!--                <label :for="`phone-edit-${index}`">Телефон</label>-->
    <!--                <InputMask-->
    <!--                    :id="`phone-edit-${index}`"-->
    <!--                    v-model="selectedOrder.phones[index].phone"-->
    <!--                    mask="+7 (999) 999-99-99"-->
    <!--                    required-->
    <!--                    class="w-full"-->
    <!--                    placeholder="+7 (___) ___-__-__"-->
    <!--                />-->
    <!--              </div>-->
    <!--              <Button-->
    <!--                  icon="pi pi-trash"-->
    <!--                  class="p-button-text p-button-danger ml-2"-->
    <!--                  v-if="selectedOrder.phones.length > 1"-->
    <!--                  @click="removeField('phones', index, 'update')"-->
    <!--              />-->
    <!--            </div>-->
    <!--            <Button-->
    <!--                type="button"-->
    <!--                label="Добавить Телефон"-->
    <!--                icon="pi pi-plus"-->
    <!--                class="p-button-text"-->
    <!--                @click="addField('phones', 'update')"-->
    <!--            />-->
    <!--          </div>-->

    <!--          &lt;!&ndash; Addresses &ndash;&gt;-->
    <!--          <div class="card flex flex-col md:flex-row gap-4">-->
    <!--            <div v-for="(address, index) in selectedOrder.addresses" :key="index" class="field flex items-center">-->
    <!--              <div class="w-full">-->
    <!--                <label :for="`address-edit-${index}`">Адрес</label>-->
    <!--                <InputText-->
    <!--                    :id="`address-edit-${index}`"-->
    <!--                    v-model="selectedOrder.addresses[index].address"-->
    <!--                    class="w-full"-->
    <!--                    placeholder="Адрес"-->
    <!--                />-->
    <!--              </div>-->
    <!--              <Button-->
    <!--                  icon="pi pi-trash"-->
    <!--                  class="p-button-text p-button-danger ml-2"-->
    <!--                  v-if="selectedOrder.addresses.length > 1"-->
    <!--                  @click="removeField('addresses', index, 'update')"-->
    <!--              />-->
    <!--            </div>-->
    <!--            <Button-->
    <!--                type="button"-->
    <!--                label="Добавить Адрес"-->
    <!--                icon="pi pi-plus"-->
    <!--                class="p-button-text"-->
    <!--                @click="addField('addresses', 'update')"-->
    <!--            />-->
    <!--          </div>-->

    <!--          &lt;!&ndash; Comments &ndash;&gt;-->
    <!--          <div class="card flex flex-col md:flex-row gap-4">-->
    <!--            <div v-for="(comment, index) in selectedOrder.comments" :key="index" class="field flex items-center">-->
    <!--              <div class="w-full">-->
    <!--                <label :for="`comment-edit-${index}`">Комментарий</label>-->
    <!--                <InputText-->
    <!--                    :id="`comment-edit-${index}`"-->
    <!--                    v-model="selectedOrder.comments[index].content"-->
    <!--                    class="w-full"-->
    <!--                    placeholder="Комментарий"-->
    <!--                />-->
    <!--              </div>-->
    <!--              <Button-->
    <!--                  icon="pi pi-trash"-->
    <!--                  class="p-button-text p-button-danger ml-2"-->
    <!--                  v-if="selectedOrder.comments.length > 1"-->
    <!--                  @click="removeField('comments', index, 'update')"-->
    <!--              />-->
    <!--            </div>-->
    <!--            <Button-->
    <!--                type="button"-->
    <!--                label="Добавить Комментарий"-->
    <!--                icon="pi pi-plus"-->
    <!--                class="p-button-text"-->
    <!--                @click="addField('comments', 'update')"-->
    <!--            />-->
    <!--          </div>-->

    <!--          <Button type="submit" label="Изменить" class="mt-4"/>-->
    <!--        </form>-->
    <!--      </Dialog>-->


  </div>

<!--  <BuyerModal-->
<!--      :isVisible="isCreateBuyerModalVisible"-->
<!--      :buyer="newBuyer"-->
<!--      @update:isVisible="value => isCreateBuyerModalVisible = value"-->
<!--      @update:buyer="value => handleNewBuyer(value)"-->
<!--      @close="() => isCreateBuyerModalVisible = false"-->
<!--  />-->
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {Order, useOrdersStore} from '~/stores/orders'
import {debounce} from "@antfu/utils";
import OrderChangeLog from "~/components/orders/OrderChangeLog.vue";
import {formatDate, formatTime} from "~/utils/date-utils";
import moment from "moment";
import Handlebars from 'handlebars';
import UniversalProducts from "~/components/products/UniversalProducts.vue";
import {FilterOperator} from "@primevue/core";
import {FilterMatchMode} from "@primevue/core/api";
import {normalizePhoneNumber} from "~/pages/buyers/normalizePhone";
// Импортируйте другие необходимые компоненты и утилиты

const ordersStore = useOrdersStore()
const buyersStore = useBuyersStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const toast = useMessages()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showAddProductDialog = ref(false)

const contextMenu = ref();

const menuModel = ref([
  {label: 'View', icon: 'pi pi-fw pi-search', command: () => editRow()},
  {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => deleteRow(selectedOrder)}
]);
const visibleHistory = ref({})
const classForExpand = ref('bg-[#d9edf7] border-b border-white border-b-solid border-opacity-90')
const isCreateBuyerModalVisible = ref(false)
const newBuyer = ref(null)
const orders = computed(() => ordersStore.orders)

const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent);
};

const editRow = () => {
  showEditDialog.value = true
};
const deleteRow = (row) => {
  handleDelete(row.value.id)
};


// const newOrder = ref({
//   name: '',
//   emails: [''],
//   phones: [''],
//   addresses: [''],
//   comments: [''],
//   products: [],
// })
const newOrder = ref({createdAt: new Date(), products: []})

const productToAdd = ref({})

const filteredCustomers = ref([]);

const searchCustomer = async (event) => {
  const query = event.query;
  // Запрос на сервер для поиска покупателей
  const response = await buyersStore.searchBuyersList(query); // Реализация запроса в хранилище Pinia
  filteredCustomers.value = response;
};

const selectedOrder = ref<any>({
  id: 0,
  name: '',
  emails: [''],
  phones: [''],
  addresses: [''],
  comments: [''],
})

// const selectedOrders = ref<any>([{
//   id: 0,
//   name: '',
//   emails: [''],
//   phones: [''],
//   address: [''],
//   comments: [''],
// }])

const loading = ref(false)

const columnsForAutoRender = ref([
  {field: 'managers', header: 'Менеджеры'},
  {field: 'orderStatuses', header: 'Статус'},
  // {field: 'sources', header: 'Источник;Менеджер'},
  // {field: 'payTypes', header: 'Форма оплаты'},
  // {field: 'warehouses', header: 'Склад'},
  {field: 'price', header: 'Заказ;Доставка'},
  {field: 'deliveryTypes', header: 'Логистика'},
  {field: 'createdAt', header: 'Дата'},
  {field: 'comments', header: 'Комментарии'},
])
const columnsWithColor = ref([
  'orderStatuses',
  'sources',
  // 'payTypes',
  // 'warehouses',
  'deliveryTypes',
])

const globalFiltersMulti = ref([
  {filter: 'orderStatuses', placeholder: 'Статус'},
  {filter: 'sources', placeholder: 'Источник'},
  {filter: 'payTypes', placeholder: 'Форма оплаты'},
  {filter: 'warehouses', placeholder: 'Склад'},
  {filter: 'deliveryTypes', placeholder: 'Логистика'},
  {filter: 'managers', placeholder: 'Менеджер'},
])
const globalFiltersBuyer = ref([
  {filter: 'numberName', placeholder: 'NN'},
  {filter: 'buyer', placeholder: 'Имя'},
  {filter: 'phone', placeholder: 'Телефон'},
  {filter: 'email', placeholder: 'Email'},
  {filter: 'address', placeholder: 'Адрес'},

])

const columnsForProducts = ref([
  {field: '№', header: '№'},
  {field: 'product.name', header: 'Наименование'},
  {field: 'product.sku', header: 'Артикул'},
  {field: 'count', header: 'Количество'},
  {field: 'price', header: 'Цена'},
  {field: 'sum', header: 'Сумма'},

])

// Фильтры для DataTable
const filters = ref({
  global: {value: null},
  numberName: {value: null},
  buyer: {value: null},
  name: {value: null},
  id: {value: null},
  managers: {value: null},
  orderStatuses: {value: null},
  deliveryTypes: {value: null},
  payTypes: {value: null},
  sources: {value: null},
  warehouses: {value: null},
  phone: {value: null},
  email: {value: null},
  address: {value: null},
  comments: {value: null},
  product: {value: null},
  createdAt: {value: null},
  startDate: {value: null},
  endDate: {value: null},
  minPrice: {value: null},
  maxPrice: {value: null},

})

const initFilters = () => {
  filters.value = {
    global: {value: null},
    numberName: {value: null},
    buyer: {value: null},
    name: {value: null},
    id: {value: null},
    managers: {value: null},
    orderStatuses: {value: null},
    deliveryTypes: {value: null},
    payTypes: {value: null},
    sources: {value: null},
    warehouses: {value: null},
    phone: {value: null},
    email: {value: null},
    address: {value: null},
    comments: {value: null},
    product: {value: null},
    createdAt: {value: null},
    startDate: {value: null},
    endDate: {value: null},
    minPrice: {value: null},
    maxPrice: {value: null},

  }
}
initFilters()
const globalFilter = ref(null)

const onPage = async (event: any) => {
  ordersStore.limit = event.rows
  ordersStore.currentPage = event.page + 1
  loading.value = true
  await ordersStore.fetchOrders()
  loading.value = false
}


const onFilter = async (event) => {
  // Явный сброс глобального фильтра
  if (globalFilter.value || globalFilter.value !== '') {
    globalFilter.value = null;
  }
  if (event?.col) {
    filters.value[event.col].value = event.value
  }
  // Если есть примененные фильтры, вызываем поиск, иначе сбрасываем фильтры
  loading.value = true;
  await ordersStore.searchOrdersByForm(event?.filters ?? filters.value);
  loading.value = false;

};

const onFilterDebounced = debounce(300, async (event) => {
  await onFilter(event);
});
const clearFilter = () => {
  initFilters();
  onFilter();
};

const onGlobalDebounced = debounce(300, async (event) => {
  if (globalFilter.value || globalFilter.value !== '') {
    loading.value = true
    initFilters()
    await ordersStore.searchOrdersByString(globalFilter.value)
    loading.value = false
  } else {
    loading.value = true
    await ordersStore.fetchOrders()
    loading.value = false
  }
})


const onGlobalFilter = async (event: any) => {
  onGlobalDebounced(event)
}


const {confirmDelete} = useConfirmation()
const handleDelete = async (id: number) => {
  confirmDelete(
      id,
      async () => {
        await ordersStore.deleteOrder(id)
        // toast.add({ severity: 'success', summary: 'Успех', detail: 'Покупатель удален' })
        // await ordersStore.fetchOrders()
      },
  )
}

const addField = (field: 'emails' | 'phones' | 'addresses' | 'comments', type: 'create' | 'update' = 'create') => {

  if (type == 'create') {
    newOrder.value[field].push('')
  } else {
    if (field == 'addresses') {
      selectedOrder.value[field].push({
        address: ''
      })
      return;
    }
    selectedOrder.value[field].push({[field]: ''})
  }
}

const removeField = (field: 'emails' | 'phones' | 'addresses' | 'comments', index: number, type: 'create' | 'update' = 'create') => {
  if (type == 'create') {
    newOrder.value[field].splice(index, 1)
  } else {
    selectedOrder.value[field].splice(index, 1)

  }
}



const handleUpdate = async () => {
  try {
    // selectedOrder.value.managerId = authStore.user?.id
    newOrder.value.buyerId = newOrder.value.buyer.id
    newOrder.value.products = newOrder.value.products.map(product => {
      return {productId: product.id, ...product}
    })
    // let editedFields = getDifferencesOnlyId(oldOrderData.value, newOrder.value)
    // await ordersStore.updateOrder(oldOrderData.value.id, editedFields)
    await ordersStore.updateOrder(newOrder.value.id, newOrder.value)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Заказ обновлен'})
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить заказ: \n' + error})
  }


}
const oldOrderData = ref({})

const formatEmails = (row: any) =>
    row.emails?.map(item => item.email).join('<br>') || ''

const formatPhones = (row: Order) =>
    row.phones?.map(item => item.phone).join('<br>') || ''

const formatAddresses = (row: any) =>
    row.addresses?.map(item => item.address).join('<br>') || ''
const formatComments = (row: any) =>
    row.comments?.map(item => item.content).join('<br>') || ''

onMounted(async () => {
  // ordersStore.isRemind = true
  loading.value = true
  // await settingsStore.fetchAllEntity()
  ordersStore.resetFilters()
  await ordersStore.fetchOrders()
  loading.value = false
})

// Следим за изменениями в пагинации и лимите
// watch(
//     () => [ordersStore.currentPage, ordersStore.limit],
//     async () => {
//       loading.value = true
//       await ordersStore.fetchOrders()
//       loading.value = false
//     }
// )

const extractOrderField = (field, withoutId?: boolean) => {
  let orderField;
  switch (field) {
    case "orderStatuses":
      orderField = "status";
      break;
    case "payTypes":
      orderField = "payType";
      break;
    case "sources":
      orderField = "source";
      break;
    case "managers":
      orderField = "manager";
      break;
    case "managerLastEdit":
      orderField = "managerLastEdit";
      break;
    case "warehouses":
      orderField = "warehouse";
      break;
    case "deliveryTypes":
      orderField = "deliveryType";
      break;
    default:
      orderField = 'id';
  }
  if (withoutId) return orderField;
  return orderField + 'Id';
}




const onCellEditComplete = async (event) => {
  let {data, newData, field} = event;
  let editedFields = getDifferencesOnlyId(data, newData)
  await ordersStore.updateOrder(data.id, editedFields, true)
  console.log('editedFields', editedFields)
};

const onMultiselectCellChange = (data, field, value) => {
  // Обновляем значение в data и сохраняем его в store
  data[extractOrderField(field, true)] = value[1]
  data[extractOrderField(field)] = value[1].id

  // orderStore.updateOrderStatus(data.id, field, value)
}

function getDifferencesOnlyId(data, newData) {
  const differences: any = {}

  for (const key in newData) {
    if ((key.endsWith('Id'))  && newData[key] !== data[key]) {
      differences[key] = newData[key]
    }
  }

  return differences
}

const expandedRows = ref({})

const onRowExpand = (event) => {
  expandedRows.value[event.data.id] = true
}

const onRowCollapse = (event) => {
  delete expandedRows.value[event.data.id]
}

const setDateToFilter = async (date: any) => {
  const startDateInited = filters.value.startDate
  const endDateInited = filters.value.endDate
  if (startDateInited && startDateInited.value
      && !endDateInited.value) {
    if (startDateInited.value > date) {
      filters.value.startDate.value = moment(date).startOf('day').toDate()
    } else {
      filters.value.endDate.value = moment(date).endOf('day').toDate()
    }
  } else {
    filters.value.startDate.value = moment(date).startOf('day').toDate()
    filters.value.endDate.value = null
  }
  // await stockLogsStore.setFilters(filters.value)
  await onFilterDebounced({})
}

const formatCurrency = (value) => {
  return value.toLocaleString('ru-RU', {style: 'currency', currency: 'RUB'});
};

const printCheque = (orderData, chequeId) => {

  const template = settingsStore.getField('cheques', 'template', chequeId).replace('{{PRODUCT}}',
      `
  <table cellpadding="0">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Артикул</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {{#each PRODUCT}}
              <tr>
                <td>{{name}}</td>
                <td>{{sku}}</td>
                <td>{{price}} руб.</td>
                <td>{{count}}</td>
                <td>{{total}} руб.</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
  `)
  // Подготовка данных для шаблона
  const data = {
    ID: orderData.id,
    DATE: new Date(orderData.createdAt).toLocaleDateString('ru-RU'),
    PRODUCT: orderData.products.map(item => ({
      name: item.product.name,
      count: item.count,
      sku: item.product.sku,
      price: formatCurrency(item.price),
      total: formatCurrency(item.count * item.price),
    })),
    COUNT: orderData.products.reduce((acc, item) => acc + item.count, 0),
    TOTAL: formatCurrency(orderData.products.reduce((acc, item) => acc + (item.count * item.price), 0)),
    // Добавьте другие переменные по необходимости
  };

  // Компиляция шаблона
  const compiledTemplate = Handlebars.compile(template)(data);

  // Открытие нового окна и запись HTML
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(compiledTemplate);
    printWindow.document.close();
    // Опционально: Автоматически открыть диалог печати
    printWindow.onload = function () {
      printWindow.print();
    };
  } else {
    alert('Не удалось открыть окно для печати. Проверьте настройки браузера.');
  }

}

const handleNewBuyer = (buyer) => {
  // Добавление покупателя в начало списка suggestions
  filteredCustomers.value.unshift(buyer);
  // Назначение buyerId для newOrder
  newOrder.value.buyer = buyer
  newOrder.value.buyerId = buyer.id;
};

// Watcher для пересчета скидки в зависимости от процента
watch(
    () => newOrder.value.discountPercent,
    (newVal) => {
      if (newVal != null) {
        newOrder.value.discountConst = ((newOrder.value.totalAmount * newVal) / 100).toFixed(2);
      }
    }
);

// Watcher для пересчета процента в зависимости от скидки
watch(
    () => newOrder.value.discountConst,
    (newVal) => {
      if (newVal != null) {
        newOrder.value.discountPercent = (newVal / newOrder.value.totalAmount) * 100;
      }
    }
);

const calculateTotalAmount = computed(() => {
  const totalProductAmount = newOrder.value.products.reduce((sum, product) => {
    return sum + product.amount;
  }, 0);
  return newOrder.value.discountConst ? totalProductAmount - newOrder.value.discountConst : totalProductAmount;
});

watch(() => newOrder.value.products, (newProducts) => {
  newOrder.value.totalAmount = calculateTotalAmount.value;
  if (newOrder.value.discountConst) {
    newOrder.value.discountPercent = (newOrder.value.discountConst / newOrder.value.totalAmount) * 100;
  }
}, {deep: true});

// watch(() => [newOrder.value.discountPercent, newOrder.value.discountConst], () => {
//   newOrder.value.totalAmount = calculateTotalAmount.value;
// });

const onAddProduct = async (product) => {
  // Нужно, чтобы предовтравтить создание заказа, при нехватке товаров на складе
  // const warehouseName = settingsStore.getField('warehouses', 'name', newOrder.value.warehouseId)
  // if (warehouseName !== '') {
  //   const stockForCurrentWarehouse = product.warehouseProducts.find(w => w.warehouseId === newOrder.value.warehouseId)
  //   if (!stockForCurrentWarehouse || stockForCurrentWarehouse === 0) {
  //     toast.showErrorMessage('Ошибка', 'Продукта нет на ' + warehouseName)
  //     return;
  //   }
  // }
  productToAdd.value = product;
  productToAdd.value.price = product.recommendedPrice;
}
const addSelectedProduct = async () => {
  // Нужно, чтобы предовтравтить создание заказа, при нехватке товаров на складе
  // const warehouseName = settingsStore.getField('warehouses', 'name', newOrder.value.warehouseId)
  // if (warehouseName !== '') {
  //   const stockForCurrentWarehouse = productToAdd.value.warehouseProducts.find(w => w.warehouseId === newOrder.value.warehouseId)
  //   if (!stockForCurrentWarehouse || stockForCurrentWarehouse < productToAdd.value.count) {
  //
  //     toast.showErrorMessage('Ошибка', 'Продукта не хватает на ' + warehouseName)
  //     return;
  //   }
  // }
  if (!productToAdd.value.id) {
    toast.showErrorMessage('Ошибка', 'Выберите товар')
    return;
  }
  if (!productToAdd.value.count || productToAdd.value.count === 0) {
    toast.showErrorMessage("Ошибка", 'Укажите количество')
    return;
  }
  productToAdd.value.amount = productToAdd.value.price * productToAdd.value.count;
  newOrder.value.products.push(productToAdd.value);
  toast.showSuccessMessage('Товар добавлен в заказ')
}

/**
 * Нужно, чтобы предовтравтить создание заказа, при нехватке товаров на складе
 * @param event
 */
const changeWarehouseWhenCreate = async (event) => {
  // newOrder.value.products.forEach(product => {
  //   const stockForCurrentWarehouse = product.warehouseProducts.find(w => w.warehouseId === event.value)
  //   if (!stockForCurrentWarehouse || stockForCurrentWarehouse < productToAdd.value.count) {
  //
  //     toast.showErrorMessage('Ошибка', product.name + ' не хватает на ' + settingsStore.getField('warehouses', 'name', event.value))
  //   }
  // })
  return
}

const changeProductInCell = async (type, index, data) => {
  newOrder.value.products[index].amount = data.count * data.price
  newOrder.value.products[index][type] = data[type]
}

watch(filters, () => {
  console.time('watch callback'); // Для мониторинга времени срабатывания
  onFilterDebounced();
  console.timeEnd('watch callback');
}, { deep: true });

const onDuplicate = async (rawOrder) => {
  newOrder.value = rawOrder;
  newOrder.value.createdAt = new Date();
  if (!parseFloat(newOrder.value.discountConst)) {
    newOrder.value.discountConst = undefined
    newOrder.value.discountPercent = undefined
  }
  newOrder.value.managerId = authStore.user?.id
  newOrder.value.buyerId = rawOrder.buyer.id
  newOrder.value.comments = rawOrder.comments.map(comment=>comment.content)
  newOrder.value.products = rawOrder.products.map(product => {
    return {productId: product.id, name: product.product.name, sku: product.product.sku, amount: product.count*product.price, ...product}
  })
  showCreateDialog.value = true
}

const getColorByField = (data, field?) => {
  const settingsStore = useSettingsStore()
  if (field && !settingsStore[field][0]) return ''
  if (field) {
    let orderField = extractOrderField(field);
    if (!data[orderField]) return '';

    const color = settingsStore[field].find(entity => entity.id === data[orderField]).color
    if (color == null) return ''
    return color.startsWith('#') ? `${color}` : `#${color}`
  }
  if (data.color == null) return ''
  return data.color.startsWith('#') ? `${data.color}` : `#${data.color}`
}


const getOrdersByDay = (day: number, isAdd: boolean) => {
  const today = moment();
  let computedDay;
  if (isAdd) {
    computedDay = today.add(day, 'days');
  } else {
    computedDay = today.subtract(day, 'days');
  }
  const startOfComputedDay = moment(computedDay).startOf('day').toDate();
  const endOfComputedDay = moment(computedDay).endOf('day').toDate();

  filters.value.startDate.value = startOfComputedDay
  filters.value.endDate.value = endOfComputedDay
}

const getFutureOrders = () => {
  const today = moment();
  filters.value.startDate.value = moment(today.add(2, 'day')).startOf('day').toDate();
}
const getDeliveryTypesForUser = computed(() => {
  return authStore.user.deliverymanCanSee_deliveryType.map(v=>settingsStore['deliveryTypes'].find(dt => dt.id === v.deliveryTypeId))
})
</script>

<style scoped>
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.with-sticky {
  position: sticky;
  top: 0;
}

</style>
