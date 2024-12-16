<template>
  <Dialog header="Создать заказ" v-model:visible="visible" modal class="w-4/5">
    <form @submit.prevent="handleCreate">
      <div class="flex gap-4">
        <div class="flex flex-col sm:w-40% w-100% gap-4">
          <div class="field">
            <label>Дата</label>
            <DatePicker v-model="newOrder.createdAt" required dateFormat="dd.mm.y" />
          </div>
          <div class="field">
            <label>Статус</label>
            <Select
                filter
                showClear
                v-model="newOrder.statusId"
                :options="settingsStore.orderStatuses"
                optionLabel="name"
                option-value="id"
            >
              <template #option="slotProps">
                <div class="flex items-center w-100% gap-5">
                  <div>{{ slotProps.option.name }}</div>
                  <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
                </div>
              </template>
            </Select>
          </div>
          <div class="field">
            <label>Покупатель</label>
            <AutoComplete
                v-model="newOrder.buyer"
                :suggestions="filteredCustomers"
                @complete="searchCustomer"
                placeholder="Введите имя покупателя"
                optionValue="id"
                optionLabel="numberName"
            >
              <template #option="slotProps">
                <div class="flex items-center">
                  <div>{{ slotProps.option.name }} | {{ slotProps.option.numberName }}</div>
                </div>
              </template>
              <template #header>
                <div class="font-medium px-3 py-2">Покупатели</div>
              </template>
              <template #footer>
                <div class="px-3 py-3">
                  <Button
                      @click="isCreateBuyerModalVisible = true"
                      label="Создать нового"
                      fluid
                      severity="success"
                      text
                      size="small"
                      icon="pi pi-plus"
                  />
                </div>
              </template>
            </AutoComplete>
          </div>
          <div class="field">
            <label>Напомнить</label>
            <DatePicker v-model="newOrder.remind" required dateFormat="dd.mm.y" />
          </div>
          <div class="field">
            <label>Склад</label>
            <Select
                filter
                showClear
                v-model="newOrder.warehouseId"
                :options="settingsStore.warehouses"
                optionLabel="name"
                option-value="id"
                @change="changeWarehouseWhenCreate"
            >
              <template #option="slotProps">
                <div class="flex items-center w-100% gap-5">
                  <div>{{ slotProps.option.name }}</div>
                  <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
                </div>
              </template>
            </Select>
          </div>
          <div class="field">
            <label>Форма оплаты</label>
            <Select
                filter
                showClear
                v-model="newOrder.payTypeId"
                :options="settingsStore.payTypes"
                optionLabel="name"
                option-value="id"
            >
              <template #option="slotProps">
                <div class="flex items-center w-100% gap-5">
                  <div>{{ slotProps.option.name }}</div>
                  <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
                </div>
              </template>
            </Select>
          </div>
          <div class="field">
            <label>Источник</label>
            <Select
                filter
                showClear
                v-model="newOrder.sourceId"
                :options="settingsStore.sources"
                optionLabel="name"
                option-value="id"
            >
              <template #option="slotProps">
                <div class="flex items-center w-100% gap-5">
                  <div>{{ slotProps.option.name }}</div>
                  <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
                </div>
              </template>
            </Select>
          </div>
          <div class="field">
            <label>Чек</label>
            <Select
                filter
                showClear
                v-model="newOrder.chequeId"
                :options="settingsStore.cheques"
                optionLabel="name"
                option-value="id"
            ></Select>
          </div>
          <div class="field">
            <label>Компания доставки</label>
            <Select
                filter
                showClear
                v-model="newOrder.deliveryTypeId"
                :options="settingsStore.deliveryTypes"
                optionLabel="name"
                option-value="id"
            >
              <template #option="slotProps">
                <div class="flex items-center w-100% gap-5">
                  <div>{{ slotProps.option.name }}</div>
                  <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
                </div>
              </template>
            </Select>
          </div>
          <div class="field">
            <label>Стоимости доставки</label>
            <InputNumber
                v-model="newOrder.deliveryPrice"
                mode="currency"
                currency="RUB"
                locale="ru-RU"
                :maxFractionDigits="2"
            />
          </div>
          <div class="flex flex-col gap-4">
            <div
                v-for="(comment, index) in newOrder.comments"
                :key="index"
                class="field flex items-center"
            >
              <div class="w-full">
                <label :for="`comment-${index}`">Комментарий</label>
                <Editor
                    rows="5"
                    cols="30"
                    :id="`comment-${index}`"
                    v-model="newOrder.comments[index].content"
                    class="w-full"
                    placeholder="Комментарий"
                />
              </div>
              <Button
                  icon="pi pi-trash"
                  class="p-button-text p-button-danger ml-2"
                  v-if="newOrder.comments.length > 1"
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
          <div class="field">
            <label>Скидка</label>
            <InputNumber
                v-model="newOrder.discountPercent"
                suffix=" %"
                showButtons
                locale="ru-RU"
                :maxFractionDigits="2"
            />
            <InputNumber
                v-model="newOrder.discountConst"
                mode="currency"
                currency="RUB"
                locale="ru-RU"
                :maxFractionDigits="2"

            />
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex flex-col with-sticky">
            <Button
                label="Добавить товар"
                icon="pi pi-plus"
                outlined
                @click="showAddProductDialog = true"
                class="w-auto inline-block ml-auto"
                pt:icon:style="margin-right:0.3rem"
            />

            <DataTable :value="newOrder.products" responsiveLayout="scroll" edit-mode="cell">
              <Column field="name" header="Название" />
              <Column field="sku" header="Артикул" />
              <Column field="count" header="Количество" editor="true">
                <template #editor="{ data, index }">
                  <InputNumber
                      v-model="data.count"
                      @valueChange="changeProductInCell('count', index, data)"
                      :maxFractionDigits="2"
                  />
                </template>
              </Column>
              <Column field="price" header="Цена" editor="true">
                <template #editor="{ data, index }">
                  <InputNumber
                      v-model="data.price"
                      mode="currency"
                      currency="RUB"
                      locale="ru-RU"
                      @valueChange="changeProductInCell('price', index, data)"
                      :maxFractionDigits="2"
                  />
                </template>
              </Column>
              <Column field="amount" header="Сумма" />
              <Column>
                <template #body="{ data, index }">
                  <Button
                      icon="pi pi-trash"
                      class="p-button-text p-button-danger"
                      @click="removeProduct(index)"
                  />
                </template>
              </Column>
              <template #footer>
                <div v-if="newOrder.discountConst" class="flex justify-between pl-1 pr-1 mb-2">
                  <strong>Скидка:</strong>
                  <span>{{ `-${newOrder.discountConst}` }}</span>
                </div>
                <tr>
                  <td><span class="p-dialog-title">Итоговая сумма:</span></td>
                  <td>{{ calculateTotalAmount }}₽</td>
                </tr>
              </template>
            </DataTable>
          </div>
        </div>
        <Dialog header="Добавить товар в заказ" v-model:visible="showAddProductDialog" modal class="w-4/5">
<!--          todo ПРЕДЛОЖЕНИЕ сделать добавление удобней (Таблица, сразу 1 товар, сразу рекомендованная цена)-->
          <template #header>
            <div class="inline-flex items-center justify-center gap-2">
              <span id="pv_id_124_header" class="p-dialog-title" data-pc-section="title">
                Добавить товар
              </span>
              <form class="flex gap-4" @submit.prevent="addSelectedProduct">
                <InputText placeholder="Товар" v-model="productToAdd.name" disabled />
                <InputNumber
                    placeholder="Кол-во"
                    pt:pcInputText:root:class="w-100%"
                    v-model="productToAdd.count"
                    style="width: 5rem"
                    :min="0"
                    :maxFractionDigits="2"
                />
                <InputNumber
                    placeholder="цена"
                    pt:pcInputText:root:class="w-100%"
                    v-model="productToAdd.price"
                    style="width: 5rem"
                    :min="0"
                    mode="currency"
                    currency="RUB"
                    locale="ru-RU"
                    :maxFractionDigits="2"
                />
                <Button icon="pi pi-plus" type="submit" />
              </form>
            </div>
          </template>
          <UniversalProducts @clickOnPlusInWarehouseModal="onAddProduct" :canEdit="false" :with-stocks="false" />
        </Dialog>
      </div>

      <Button type="submit" label="Создать" class="mt-4" />
    </form>
  </Dialog>
</template>

<script>


import UniversalProducts from "~/components/products/UniversalProducts.vue";

export default {
  name: 'OrderModal',
  components: {
    Dialog,
    Button,
    DatePicker,
    Select,
    AutoComplete,
    InputNumber,
    Editor,
    DataTable,
    Column,
    InputText,
    UniversalProducts,
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:visible', 'create'],
  setup(props, { emit }) {
    const settingsStore = useSettingsStore();

    const newOrder = reactive({
      createdAt: null,
      statusId: null,
      buyer: null,
      remind: null,
      warehouseId: null,
      payTypeId: null,
      sourceId: null,
      chequeId: null,
      deliveryTypeId: null,
      deliveryPrice: 0,
      comments: [{content: ''}],
      discountPercent: 0,
      discountConst: 0,
      products: [],
    });

    const showAddProductDialog = ref(false);
    const isCreateBuyerModalVisible = ref(false);
    const productToAdd = reactive({
      name: '',
      count: 0,
      price: 0,
    });
    const filteredCustomers = ref([]);

    const getColorByField = (option) => {
      return `background-color: ${option.color};`;
    };

    const searchCustomer = (event) => {
      // Implementation for searching customers
    };

    const changeWarehouseWhenCreate = () => {
      // Implementation for changing warehouse
    };

    const changeProductInCell = (field, index, data) => {
      newOrder.products[index][field] = data[field];
    };

    const addField = (field) => {
      newOrder[field].push('');
    };

    const removeField = (field, index) => {
      newOrder[field].splice(index, 1);
    };

    const calculateTotalAmount = computed(() => {
      return newOrder.products.reduce((total, product) => {
        return total + product.price * product.count;
      }, 0) - newOrder.discountConst;
    });

    const removeProduct = (index) => {
      newOrder.products.splice(index, 1);
    };

    const onAddProduct = (product) => {
      newOrder.products.push(product);
      showAddProductDialog.value = false;
    };

    const addSelectedProduct = () => {
      if (productToAdd.name && productToAdd.count > 0 && productToAdd.price > 0) {
        newOrder.products.push({ ...productToAdd });
        productToAdd.name = '';
        productToAdd.count = 0;
        productToAdd.price = 0;
        showAddProductDialog.value = false;
      }
    };

    const handleCreate = () => {
      emit('create', { ...newOrder });
      emit('update:visible', false);
      resetOrder();
    };

    const resetOrder = () => {
      Object.assign(newOrder, {
        createdAt: null,
        statusId: null,
        buyer: null,
        remind: null,
        warehouseId: null,
        payTypeId: null,
        sourceId: null,
        chequeId: null,
        deliveryTypeId: null,
        deliveryPrice: 0,
        comments: [''],
        discountPercent: 0,
        discountConst: 0,
        products: [],
      });
    };

    watch(
        () => props.visible,
        (val) => {
          if (!val) {
            resetOrder();
          }
        }
    );

    return {
      newOrder,
      showAddProductDialog,
      isCreateBuyerModalVisible,
      productToAdd,
      filteredCustomers,
      getColorByField,
      searchCustomer,
      changeWarehouseWhenCreate,
      changeProductInCell,
      addField,
      removeField,
      calculateTotalAmount,
      removeProduct,
      onAddProduct,
      addSelectedProduct,
      handleCreate,
    };
  },
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
