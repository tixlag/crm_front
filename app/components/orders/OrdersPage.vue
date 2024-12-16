<template>
  <div class="p-4">
    <div class="flex justify-between mb-4">
      <h2>Заказы</h2>
      <Button label="Добавить" icon="pi pi-plus" @click="showCreateDialog = true"/>
    </div>

    <div class="mb-4">
      <a @click="isVisibleFilters = !isVisibleFilters" class="toggle-filters mb-4">
        {{ isVisibleFilters ? 'Скрыть' : 'Показать' }} фильтры
      </a>

      <transition name="slide-fade">
        <div v-if="isVisibleFilters" class="hidden-div">
          <div class="flex flex-col gap-4 mb-4">
            <div class="sm:flex justify-center gap-4 flex-wrap grid grid-cols-[50%_50%]">

              <MultiSelect v-for="filter in globalFiltersMulti" filter v-model="filters[filter.filter].value"
                           :options="settingsStore[filter.filter]" optionLabel="name" option-value="id"
                           :placeholder="filter.placeholder">
                <template #option="slotProps">
                  <div class="flex items-center w-100% gap-5">
                    <div>{{ slotProps.option.name }}</div>
                    <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
                  </div>
                </template>
              </MultiSelect>


            </div>
            <div class="sm:flex justify-center gap-4 flex-wrap grid grid-cols-[50%_50%]">
              <InputText v-model="filters.comments.value" type="text"  placeholder="Комментарий"/>
              <AutoComplete
                  v-model="filters.products.value"
                  :suggestions="filteredProducts"
                  @complete="searchProducts"
                  placeholder="Товар"
                  optionValue="id"
                  optionLabel="name"
                  :multiple="true"
              >
                <template #option="slotProps">
                  <div class="flex items-center">
                    <div>{{ slotProps.option.name }} | {{ slotProps.option.sku }}</div>
                  </div>
                </template>
                <template #header>
                  <div class="font-medium px-3 py-2">Товары</div>
                </template>
              </AutoComplete>

              <DatePicker
                  v-model="filters.createdAt.value"
                  selectionMode="range"
                  dateFormat="dd.mm.y"
                  @date-select="setDateToFilter"
                  placeholder="Дата"
              >
              </DatePicker>
            </div>
            <div class="sm:flex justify-center gap-4 flex-wrap grid grid-cols-[50%_50%]">
              <InputText v-for="filter in globalFiltersBuyer" v-model="filters[filter.filter].value" type="text"
                         :placeholder="filter.placeholder"/>

            </div>
            <div class="sm:flex justify-center gap-4 flex-wrap grid grid-cols-[50%_50%]">
              <div class="p-d-flex p-ai-center ">
                <span class="p-mr-2">Стоимость: </span>
                <InputNumber v-model="filters.minPrice.value" mode="currency" currency="RUB" locale="ru-RU" placeholder="Мин" :maxFractionDigits="2"  />
                <span class="p-mx-2">-</span>
                <InputNumber v-model="filters.maxPrice.value" mode="currency" currency="RUB" locale="ru-RU" placeholder="Макс" :maxFractionDigits="2" />

              </div>
            </div>
          </div>
        </div>
      </transition>
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
        :rowsPerPageOptions="[10, 1, 25, 50, 100]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first} по {last} из {totalRecords}"
        contextMenu v-model:contextMenuSelection="selectedOrder"
        @rowContextmenu="onRowContextMenu"
        @row-dblclick="orderDblClick"
        scrollable
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
        @rowExpand="handleExpansion"
        :row-class="setClassForOrderRow"
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

        <div class="expansion-content" :ref="setExpansionsContentRef">
          <div class="p-4 flex gap-2" :class="classForExpand">
            <div v-if="data.buyer.phones?.length > 0" v-for="(phone, index) in data.buyer.phones">
              <div class="border-0 border-solid border-r-1.5 pr-4">Телефон {{ index + 1 }}: <b>{{ phone.phone }}</b>
              </div>
            </div>
          </div>
          <div class="p-4 flex gap-2" :class="classForExpand">
            <div v-if="data.buyer.addresses?.length > 0" v-for="(address, index) in data.buyer.addresses">
              <div class="border-0 border-solid border-r-1.5 pr-4">Адрес {{ index + 1 }}: <b>{{ address.address }}</b>
              </div>
            </div>
          </div>
          <div class="p-4 flex gap-2" :class="classForExpand">
            <div class="flex items-center gap-2 border-0 border-solid border-r-1.5 pr-4"
                 v-if="data.buyer.comments?.length > 0" v-for="(comment, index) in data.buyer.comments">
              <div class="flex flex-col">Комментарий {{ data.buyer.comments.length > 1 ? index + 1 : '' }}:
                <small title="Добавил" style="display: block; color: gray;">{{
                    settingsStore.getField('managers', 'name', comment.userId)
                  }}</small>
              </div>
              <div v-html="comment.content"></div>
            </div>
          </div>
          <div class="p-4 flex gap-2" :class="classForExpand">
            <div>Доставка: <b>{{ settingsStore.getField('deliveryTypes', 'name', data.deliveryTypeId) }}
              ({{ formatCurrency(data.deliveryPrice) }})</b>
            </div>
          </div>
          <!--        todo может вынести в отдельный компонент и там делать запрос на сервер?-->
          <div class="flex">
            <DataTable
                :value="data.products"
                class="revert-table products-in-order !bg-[#fcf8e3]"
                style="max-width: 50%"
                pt:bodyrow:style="color:red"

            >
              <Column v-for="col in columnsForProducts" :field="col.field" :header="col.header"
                      pt:style:="div {    text-align: center;}">
                <template #body="{index, data, field}">
                  <template v-if="'№' === field">{{ index + 1 }}</template>
                  <div v-if="field.startsWith('product')">
                    {{ data['product'][field.split('.')[1]] }}
                  </div>
                  <div v-if="['price'].includes(field)">
                    {{ formatCurrency(data[field]) }}
                  </div>
                  <div v-if="'count' === field">
                    {{ data[field] }}
                  </div>
                  <div v-if="'sum' === field">{{ formatCurrency(data.count * data.price) }}</div>
                </template>
              </Column>

            </DataTable>
            <div class="flex flex-col gap-2 text-center text-wrap w-full bg-[#d9edf7]">
              <b>Комментарии к заказу</b>
              <div v-for="(comment, index) in data.comments">
                <div class="flex flex-col"><span v-if="data.comments.length > 1">Комментарий {{ data.comments.length > 1 ? index + 1 : '' }}: </span>
                  <div v-html="comment.content"></div>
                  <small title="Добавил" style="display: block; color: gray;">{{
                      settingsStore.getField('managers', 'name', comment.userId)
                    }}</small>
                </div>

              </div>
            </div>

          </div>
          <Toolbar class="bg-[#d9edf7] ">
            <template #start>
              <Button label="Удалить заказ" icon="pi pi-trash" class="mr-2" severity="danger"/>
              <Button label="Дубликат" icon="pi pi-copy" class="mr-2" severity="info" @click="onDuplicate(data)"/>
            </template>

            <template #center>
              <SplitButton label="Печать чека" icon="pi pi-print" class="mr-2" raized
                           @click="printCheque(data, data.chequeId)"
                           :model="settingsStore.cheques.map(c => {return {label: c.name, command: () => printCheque(data, c.id)}})" />
              <Button label="Редактировать заказ" icon="pi pi-pen-to-square" class="mr-2"
                      severity="warn" @click="editOrder(data)"/>
            </template>

            <template #end>
              <Button label="История изменений" icon="pi pi-history" class="mr-2" severity="help"
                      @click="visibleHistory[data.id] = !visibleHistory[data.id]"
                      v-if="(authStore.user.roles.includes('ADMIN') || authStore.user.settings.canSeeHistory_change)"
              />
              <Button v-if="data.isCompleted" label="Заказ закрыт" icon="pi pi-times" class="mr-2" severity="danger"/>
              <Button v-else-if="data.isPaid && authStore.user.roles.includes('ADMIN')" @click="ordersStore.payOrCloseOrder(data.id, 'complete', true)" label="Закрыть" icon="pi pi-times" class="mr-2" severity="info"/>
              <Button v-else-if="authStore.user.roles.includes('ADMIN')" @click="ordersStore.payOrCloseOrder(data.id, 'pay', true)" label="Подтвердить оплату" icon="pi pi-wallet" class="mr-2" severity="warn"/>
            </template>
          </Toolbar>
          <OrderChangeLog v-if="visibleHistory[data.id]" :orderId="data.id" @afterRender="handleExpansion"/>
        </div>
      </template>


      <Column v-for="col of columnsForAutoRender" :key="col.field" :field="col.field"
              :class="{'max-h-3rem': col.field === 'comments'}">
        <template #header>
          <template v-for="head in col.header.split(';')">
            {{ head }}<br>
          </template>
        </template>
<!--        todo ЗАПРЕТИТЬ ИЗМЕНЕНИЕ isCOMPETED заказов на сервере-->
        <template #body="{ data, field }"
                  v-if="!$data.isCompleted && ['orderStatuses', 'payTypes', 'warehouses', 'deliveryTypes'].includes(col.field)" >
          <div v-if="!data.isCompleted" class="flex flex-col with-bg-color" :data-style="getColorByField(data, field)">
            <Select @update:model-value="value => onChangeSelectInOrdersTable(data, field, value)"
                         :model-value="[data[extractOrderField(field, true)]]" :options="settingsStore[field]"
                         optionLabel="name">
              <template #option="slotProps">
                <div class="flex items-center w-100% gap-5">
                  <div>{{ slotProps.option.name }}</div>
                  <div class="h-1rem w-100%" :style="`background-color: ${getColorByField(slotProps.option)}`"></div>
                </div>
              </template>
            </Select>
          </div>
          <div v-else-if="columnsWithColor.includes(col.field)" :data-style="getColorByField(data, field)"
               class="flex flex-col with-bg-color"
          >
            <div>{{ getNameByField(data, field) }}</div>
            <div v-if="field==='sources'">{{ getNameByField(data, "managers") }}</div>
            <div v-if="field==='sources'">{{ getNameByField(data, "managerLastEdit") }}</div>
          </div>
        </template>
        <template #body="{ data, field }">
          <div v-if="field==='buyer'" class="flex flex-col">
            <a @click="showBuyerCard(data)">{{ data.buyer.name }}</a>
            <div>{{ data.buyer.numberName }}</div>
            <div>{{ data.buyer.phones[0].phone }}</div>
          </div>
          <div v-if="columnsWithColor.includes(col.field)" :data-style="getColorByField(data, field)"
               class="flex flex-col with-bg-color"
          >
            <div>{{ getNameByField(data, field) }}</div>
            <div v-if="field==='sources'">{{ getNameByField(data, "managers") }}</div>
            <div v-if="field==='sources'">{{ getNameByField(data, "managerLastEdit") }}</div>
          </div>
          <div v-if="field==='price'" class="flex flex-col ">
            <div>{{ formatCurrency(data.totalAmount) }}/</div>
            <div>{{ formatCurrency(data.deliveryPrice) }}</div>
          </div>
          <div v-if="field==='createdAt'" class="flex flex-col ">
            <div>{{ formatDate(data.createdAt) }}</div>
            <small style="display: block; color: gray;">{{ formatTime(data.createdAt) }}</small>
          </div>
          <div v-if="field === 'comments'"
               class="flex flex-col text-wrap max-h-5rem overflow-hidden"
               v-html="formatComments(data)">
          </div>
        </template>
        <template #editor="{data, field}"
                  v-if="!['price', 'createdAt', 'buyer', 'comments'].includes(col.field)" >
          <div :style="`background-color: ${getColorByField(data, field)}`" class="flex flex-col  ">
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
          </div>
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


      <Column header="Действия" style="min-width: 6rem">
        <template #body="{ data }">
          <div class="flex space-x-2">
            <Button
                icon="pi pi-pencil"
                class="p-button-text"
                @click="editOrder(data)"
            />
            <Button
                icon="pi pi-trash"
                class="p-button-text p-button-danger"
                @click="handleDeleteOrder(data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Диалог Создания заказа -->
    <Dialog header="Создать заказ" v-model:visible="showCreateDialog" modal class="w-4/5">
      <form @submit.prevent="handleCreate">
        <div class="flex gap-4">
          <div class="flex flex-col sm:w-40% w-100% gap-4">
            <div class="field">
              <label>Дата</label>
              <DatePicker
                  v-model="newOrder.createdAt"
                  required
                  dateFormat="dd.mm.y"
              />
            </div>
            <div class="field">
              <label>Статус</label>
              <Select filter showClear v-model="newOrder.statusId"
                      :options="settingsStore.orderStatuses" optionLabel="name" option-value="id">
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
                    <Button @click="isCreateBuyerModalVisible = true" label="Создать нового" fluid severity="success"
                            text size="small" icon="pi pi-plus"/>
                  </div>
                </template>
              </AutoComplete>
            </div>
            <div class="field">
              <label>Напомнить</label>
              <DatePicker
                  v-model="newOrder.remind"
                  required
                  dateFormat="dd.mm.y"
              />
            </div>
            <div class="field">
              <label>Склад</label>
              <Select filter showClear v-model="newOrder.warehouseId"
                      :options="settingsStore.warehouses" optionLabel="name" option-value="id"
                      @change="changeWarehouseWhenCreate">
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
              <Select filter showClear v-model="newOrder.payTypeId"
                      :options="settingsStore.payTypes" optionLabel="name" option-value="id">
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
              <Select filter showClear v-model="newOrder.sourceId"
                      :options="settingsStore.sources" optionLabel="name" option-value="id">
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
              <Select filter showClear v-model="newOrder.chequeId"
                      :options="settingsStore.cheques" optionLabel="name" option-value="id">
              </Select>
            </div>
            <div class="field">
              <label>Компания доставки</label>
              <Select filter showClear v-model="newOrder.deliveryTypeId"
                      :options="settingsStore.deliveryTypes" optionLabel="name" option-value="id">
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
              <InputNumber v-model="newOrder.deliveryPrice"
                           :maxFractionDigits="2"
                           mode="currency" currency="RUB" locale="ru-RU"/>
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="(comment, index) in newOrder.comments" :key="index" class="field flex items-center">
                <div class="w-full">
                  <label :for="`comment-${index}`">Комментарий</label>
                  <Editor rows="5" cols="30"
                          :id="`comment-${index}`"
                          v-model="newOrder.comments[index].content"
                          class="w-full"
                          :modules="editorModule"
                  />
                </div>
                <Button
                    icon="pi pi-trash"
                    class="p-button-text p-button-danger ml-2"
                    v-if="newOrder.comments.length > 0"
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
              <InputNumber v-model="newOrder.discountPercent" suffix=" %" showButtons :maxFractionDigits="2"
                           locale="ru-RU"/>
              <InputNumber v-model="newOrder.discountConst" :maxFractionDigits="2"
                           mode="currency" currency="RUB" locale="ru-RU"/>
            </div>

          </div>
          <div class="flex flex-col">
            <div class="flex flex-col with-sticky">
              <Button label="Добавить товар" icon="pi pi-plus" outlined @click="showAddProductDialog = true"
                      class="w-auto inline-block ml-auto" pt:icon:style="margin-right:0.3rem"/>

              <DataTable :value="newOrder.products" responsiveLayout="scroll" edit-mode="cell">
                <Column field="name" header="Название"/>
                <Column field="sku" header="Артикул"/>
                <Column field="count" header="Количество" editor="true">
                  <template #editor="{ data, index }">
                    <InputNumber v-model="data.count" @valueChange="changeProductInCell('count', index, data)" :maxFractionDigits="2" />
                  </template>
                </Column>
                <Column field="price" header="Цена" editor="true">
                  <template #body="{data, field}" >
                    {{formatCurrency(data[field])}}
                  </template>
                  <template #editor="{ data, index }">
                    <InputNumber v-model="data.price" mode="currency" currency="RUB" locale="ru-RU"
                                 :maxFractionDigits="2"
                                 @valueChange="changeProductInCell('price', index, data)"/>
                  </template>
                </Column>
                <Column field="amount" header="Сумма">
                  <template #body="{data, field}" >
                    {{formatCurrency(data[field])}}
                  </template>
                </Column>

                <Column>
                  <template #body="{data, index}">
                    <Button
                        icon="pi pi-trash"
                        class="p-button-text p-button-danger"
                        @click="newOrder.products.pop(index)"
                    />
                  </template>
                </Column>

                <template #footer>
                  <div v-if="newOrder.discountConst" class="flex justify-between pl-1 pr-1 mb-2">
                    <strong>Скидка:</strong>
                    <span>{{ `-${formatCurrency(newOrder.discountConst)}` }}</span>
                  </div>
                  <tr>
                    <td><span class="p-dialog-title">Итоговая сумма:</span></td>
                    <td>{{ formatCurrency(calculateTotalAmount) }}</td>
                  </tr>
                </template>
              </DataTable>
            </div>
          </div>
          <Dialog header="Добавить товар в заказ" v-model:visible="showAddProductDialog" modal class="w-4/5">
            <template #header>
              <div class="inline-flex items-center justify-center gap-2">
          <span id="pv_id_124_header" class="p-dialog-title"
                data-pc-section="title">Добавить товар</span>
                <form class='flex gap-4' @submit.prevent="addSelectedProduct">
                  <InputText placeholder="Товар" v-model="productToAdd.name" disabled></InputText>
                  <!--            <InputNumber v-model="productToAdd.count"></InputNumber>-->
                  <InputNumber placeholder="Кол-во" pt:pcInputText:root:class="w-100%" v-model="productToAdd.count"
                               style="width: 5rem" :min="0" :maxFractionDigits="2"/>
                  <InputNumber placeholder="цена" pt:pcInputText:root:class="w-100%" v-model="productToAdd.price" :maxFractionDigits="2"
                               style="width: 5rem" :min="0" mode="currency" currency="RUB" locale="ru-RU"/>
                  <Button icon="pi pi-plus" type="submit"/>
                </form>
              </div>
            </template>
            <!--              Это вариант компонента, когда пользователь видит только товары, у которых есть остаток на выбранном складе-->
            <!--            <UniversalProducts @clickOnPlusInWarehouseModal="onAddProduct" :canEdit="false"-->
            <!--                               :with-stocks="true" :warehouseId="newOrder.warehouseId"/>-->
            <UniversalProducts @clickOnPlusInWarehouseModal="onAddProduct" :canEdit="false"
                               :with-stocks="false"/>
          </Dialog>
        </div>

        <Button type="submit" label="Создать" class="mt-4"/>
      </form>
    </Dialog>

    <Dialog header="Редактировать заказ" v-model:visible="showEditDialog" @hide="closeEditModal" modal class="w-4/5">
      <form @submit.prevent="handleUpdate">
        <div class="flex gap-4">
          <div class="flex flex-col sm:w-40% w-100% gap-4">
            <div class="field">
              <label>Дата</label>
              <DatePicker
                  v-model="newOrder.createdAt"
                  disabled
                  dateFormat="dd.mm.y"
              />
            </div>
            <div class="field">
              <label>Статус</label>
              <Select filter showClear v-model="newOrder.statusId"
                      :options="settingsStore.orderStatuses" optionLabel="name" option-value="id">
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
                    <Button @click="isCreateBuyerModalVisible = true" label="Создать нового" fluid severity="success"
                            text size="small" icon="pi pi-plus"/>
                  </div>
                </template>
              </AutoComplete>
            </div>
            <div class="field">
              <label>Напомнить</label>
              <DatePicker
                  v-model="newOrder.remind"
                  required
                  dateFormat="dd.mm.y"
              />
            </div>
            <div class="field">
              <label>Склад</label>
              <Select filter showClear v-model="newOrder.warehouseId"
                      :options="settingsStore.warehouses" optionLabel="name" option-value="id"
                      @change="changeWarehouseWhenCreate">
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
              <Select filter showClear v-model="newOrder.payTypeId"
                      :options="settingsStore.payTypes" optionLabel="name" option-value="id">
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
              <Select filter showClear v-model="newOrder.sourceId"
                      :options="settingsStore.sources" optionLabel="name" option-value="id">
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
              <Select filter showClear v-model="newOrder.chequeId"
                      :options="settingsStore.cheques" optionLabel="name" option-value="id">
              </Select>
            </div>
            <div class="field">
              <label>Компания доставки</label>
              <Select filter showClear v-model="newOrder.deliveryTypeId"
                      :options="settingsStore.deliveryTypes" optionLabel="name" option-value="id">
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
              <InputNumber v-model="newOrder.deliveryPrice"
                           :maxFractionDigits="2"
                           mode="currency" currency="RUB" locale="ru-RU"/>
            </div>
            <div class="flex flex-col gap-4">
              <div v-for="(comment, index) in newOrder.comments" :key="index" class="field flex items-center">
                <div class="w-full">
                  <label>Комментарий</label>
                  <Editor
                          v-model="newOrder.comments[index].content"
                          :modules="editorModule"
                          :placeholder="newOrder.comments[index].content"
                  />
                </div>
                <Button
                    icon="pi pi-trash"
                    class="p-button-text p-button-danger ml-2"
                    v-if="newOrder.comments.length > 0"
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
              <InputNumber v-model="newOrder.discountPercent" suffix=" %" showButtons
                           :maxFractionDigits="2"
                           locale="ru-RU"/>
              <InputNumber v-model="newOrder.discountConst"
                           :maxFractionDigits="2"
                           mode="currency" currency="RUB" locale="ru-RU"/>
            </div>

          </div>
          <div class="flex flex-col">
            <div class="flex flex-col with-sticky">
              <Button label="Добавить товар" icon="pi pi-plus" outlined @click="showAddProductDialog = true"
                      class="w-auto inline-block ml-auto" pt:icon:style="margin-right:0.3rem"/>

              <DataTable :value="newOrder.products" responsiveLayout="scroll" edit-mode="cell">
                <Column field="name" header="Название"/>
                <Column field="sku" header="Артикул"/>
                <Column field="count" header="Количество" editor="true">
                  <template #editor="{ data, index }">
                    <InputNumber v-model="data.count" @valueChange="changeProductInCell('count', index, data)" :maxFractionDigits="2" />
                  </template>
                </Column>
                <Column field="price" header="Цена" editor="true">
                  <template #body="{data, field}" >
                    {{formatCurrency(data[field])}}
                  </template>
                  <template #editor="{ data, index }">
                    <InputNumber v-model="data.price" mode="currency" currency="RUB" locale="ru-RU"
                                 :maxFractionDigits="2"
                                 @valueChange="changeProductInCell('price', index, data)"/>
                  </template>
                </Column>
                <Column field="amount" header="Сумма">
                  <template #body="{data, field}" >
                    {{formatCurrency(data[field])}}
                  </template>
                </Column>
                <Column>
                  <template #body="{data, index}">
                    <Button
                        icon="pi pi-trash"
                        class="p-button-text p-button-danger"
                        @click="newOrder.products.pop(index)"
                    />
                  </template>
                </Column>
                <template #footer>
                  <div v-if="newOrder.discountConst" class="flex justify-between pl-1 pr-1 mb-2">
                    <strong>Скидка:</strong>
                    <span>{{ `-${formatCurrency(newOrder.discountConst)}` }}</span>
                  </div>
                  <tr>
                    <td><span class="p-dialog-title">Итоговая сумма:</span></td>
                    <td>{{ formatCurrency(calculateTotalAmount) }}</td>
                  </tr>
                </template>
              </DataTable>
            </div>
          </div>
          <Dialog header="Добавить товар в заказ" v-model:visible="showAddProductDialog" modal class="w-4/5">
            <template #header>
              <div class="inline-flex items-center justify-center gap-2">
          <span id="pv_id_124_header" class="p-dialog-title"
                data-pc-section="title">Добавить товар</span>
                <form class='flex gap-4' @submit.prevent="addSelectedProduct">
                  <InputText placeholder="Товар" v-model="productToAdd.name" disabled></InputText>
                  <!--            <InputNumber v-model="productToAdd.count"></InputNumber>-->
                  <InputNumber placeholder="Кол-во" pt:pcInputText:root:class="w-100%" v-model="productToAdd.count"
                               :maxFractionDigits="2"
                               style="width: 5rem" :min="0"/>
                  <InputNumber placeholder="цена" pt:pcInputText:root:class="w-100%" v-model="productToAdd.price"
                               :maxFractionDigits="2"
                               style="width: 5rem" :min="0" mode="currency" currency="RUB" locale="ru-RU"/>
                  <Button icon="pi pi-plus" type="submit"/>
                </form>
              </div>
            </template>
            <!--              Это вариант компонента, когда пользователь видит только товары, у которых есть остаток на выбранном складе-->
            <!--            <UniversalProducts @clickOnPlusInWarehouseModal="onAddProduct" :canEdit="false"-->
            <!--                               :with-stocks="true" :warehouseId="newOrder.warehouseId"/>-->
            <UniversalProducts @clickOnPlusInWarehouseModal="onAddProduct" :canEdit="false"
                               :with-stocks="false"/>
          </Dialog>
        </div>

        <Button type="submit" label="Изменить" class="mt-4"/>
      </form>
    </Dialog>



  </div>

  <BuyerModal
      :isVisible="isCreateBuyerModalVisible"
      :buyer="newBuyer"
      @update:isVisible="value => isCreateBuyerModalVisible = value"
      @update:buyer="value => handleNewBuyer(value)"
      @close="() => isCreateBuyerModalVisible = false"
  />
  <BuyerModal
      :isVisible="showBuyerModal"
      :buyerForEdit="selectedBuyer"
      @update:isVisible="value => showBuyerModal = value"
      @close="() => showBuyerModal = false"
      @update:buyerForEdit="handleUpdateBuyer"
  />
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {Order, useOrdersStore} from '~/stores/orders'
import {debounce} from "@antfu/utils";
import OrderChangeLog from "~/components/orders/OrderChangeLog.vue";
import {formatDate, formatTime} from "~/utils/date-utils";
import moment from "moment";
import BuyerModal from "~/components/buyers/BuyerModal.vue";
import UniversalProducts from "~/components/products/UniversalProducts.vue";
import {normalizePhoneNumber} from "~/pages/buyers/normalizePhone";
import {
  classForExpand,
  columnsForAutoRender, columnsForProducts,
  columnsWithColor, formatComments, getColorByField,
  getDifferencesOnlyId, getNameByField, onChangeSelectInOrdersTable, onMultiselectCellChange,
  printCheque, setClassForOrderRow
} from "~/utils/order-utils";
import {formatCurrency} from "~/utils/common-utils";
import type {Product} from "~/stores/products";
import type {Buyer} from "~/stores/buyers";
import {useConfirmation} from "~/composables/confirmation";
// Импортируйте другие необходимые компоненты и утилиты

const props = defineProps({isRemind: Boolean})

const ordersStore = useOrdersStore()
const buyersStore = useBuyersStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const toast = useMessages()

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showAddProductDialog = ref(false)

let oldSelectedOrderData

const menuModel = ref([
  {label: 'Редактировать', icon: 'pi pi-fw pi-search', command: () => editRow()},
  {label: 'Удалить', icon: 'pi pi-fw pi-times', command: () => deleteRow(selectedOrder)}
]);
const visibleHistory = ref<boolean[]>([])

const isCreateBuyerModalVisible = ref(false)
const newBuyer = ref<Buyer>()

const orders = computed(() => ordersStore.orders)

const contextMenu = ref();
const onRowContextMenu = (event) => {
  contextMenu.value.show(event.originalEvent);
};

const editRow = () => {
  showEditDialog.value = true
};
const deleteRow = (row) => {
  handleDeleteOrder(row.value.id)
};


// const newOrder = ref({
//   name: '',
//   emails: [''],
//   phones: [''],
//   addresses: [''],
//   comments: [''],
//   products: [],
// })
const newOrder = ref<Order>({createdAt: new Date(), products: [], comments: [{content: ''}]})

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
  products: {value: null},
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
    products: {value: null},
    createdAt: {value: null},
    startDate: {value: null},
    endDate: {value: null},
    minPrice: {value: null},
    maxPrice: {value: null},

  }
}
initFilters()


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

const globalFilter = ref(null)
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





const addField = (field: 'emails' | 'phones' | 'addresses' | 'comments', type: 'create' | 'update' = 'create') => {

  if (type == 'create') {
    if (field == 'comments') {
      newOrder.value[field].push({content: ''})
    } else {
      newOrder.value[field].push('')
    }
  } else {
    if (field == 'addresses') {
      selectedOrder.value[field].push({
        address: ''
      })
      return;
    }
    if (field == 'comments') {
      selectedOrder.value[field].push({content: ''})
    } else {
      selectedOrder.value[field].push({[field]: ''})
    }

  }
}

const removeField = (field: 'emails' | 'phones' | 'addresses' | 'comments', index: number, type: 'create' | 'update' = 'create') => {
  if (type == 'create') {
    newOrder.value[field].splice(index, 1)
  } else {
    selectedOrder.value[field].splice(index, 1)

  }
}

const handleCreate = async () => {
  try {
    newOrder.value.managerId = authStore.user?.id
    if (!newOrder.value.buyer) {
      toast.showErrorMessage('Ошибка', 'Не указан покупатель')
      return
    }
    if (!newOrder.value.warehouseId) {
      toast.showErrorMessage('Ошибка', 'Не указан склад')
      return
    }
    if (!newOrder.value.products.length) {
      toast.showErrorMessage('Ошибка', 'Не добавлены товары')
      return
    }
    newOrder.value.buyerId = newOrder.value.buyer.id
    newOrder.value.products = newOrder.value.products.map(product => {
      return {productId: product.id, ...product}
    })
    await ordersStore.createOrder(newOrder.value)
    toast.add({severity: 'success', summary: 'Успех', detail: 'Заказ создан'})
    showCreateDialog.value = false
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать заказ: \n' + error})
  }
}

const handleUpdate = async () => {
  try {
    // selectedOrder.value.managerId = authStore.user?.id
    if (!newOrder.value.buyer) {
      toast.showErrorMessage('Ошибка', 'Не указан покупатель')
      return
    }
    newOrder.value.buyerId = newOrder.value.buyer.id
    newOrder.value.products = newOrder.value.products.map(product => {
      return {productId: product.id, ...product}
    })
    // let editedFields = getDifferencesOnlyId(oldOrderData.value, newOrder.value)
    // await ordersStore.updateOrder(oldOrderData.value.id, editedFields)
    if (!newOrder.value.warehouseId) {
      toast.showErrorMessage('Ошибка', 'Не указан склад')
      return
    }
    await ordersStore.updateOrder(newOrder.value.id, newOrder.value)
    oldSelectedOrderData = JSON.parse(JSON.stringify(newOrder.value))
    showEditDialog.value = false
    toast.add({severity: 'success', summary: 'Успех', detail: 'Заказ обновлен'})
  } catch (error) {
    toast.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить заказ: \n' + error})
  }
}


const editOrder = (rawOrder: any) => {
  rawOrder.createdAt = new Date(rawOrder.createdAt);
  if (!parseFloat(rawOrder.discountConst)) {
    rawOrder.discountConst = undefined
    rawOrder.discountPercent = undefined
  }
  rawOrder.buyerId = rawOrder.buyer.id
  // rawOrder.comments = rawOrder.comments.map(comment=>comment.content) это зло)
  rawOrder.products = rawOrder.products.map(product => {
    if (product.id) return {product: { ...product}, ...product} //todo костыль из-за неверного маппинга товаров с сервера и тех, что в таблице
    return {productId: product.id, name: product.product.name, sku: product.product.sku, amount: product.count*product.price, ...product}
  })

  newOrder.value = rawOrder;
  oldSelectedOrderData = JSON.parse(JSON.stringify(rawOrder))
  showEditDialog.value = true
}

const formatEmails = (row: any) =>
    row.emails?.map(item => item.email).join('<br>') || ''

const formatPhones = (row: Order) =>
    row.phones?.map(item => item.phone).join('<br>') || ''

const formatAddresses = (row: any) =>
    row.addresses?.map(item => item.address).join('<br>') || ''


onMounted(async () => {
  ordersStore.isRemind = props.isRemind
  loading.value = true
  // await settingsStore.fetchAllEntity()
  ordersStore.resetFilters()
  await ordersStore.fetchOrders(true)
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
  if (editedFields) await ordersStore.updateOrder(data.id, editedFields)
};





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
        newOrder.value.discountPercent = ((newVal / newOrder.value.totalAmount) * 100).toFixed(2);
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
    newOrder.value.discountPercent = ((newOrder.value.discountConst / newOrder.value.totalAmount) * 100).toFixed(2);
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
  newOrder.value.comments = newOrder.value.comments.map(comment=>comment.content)
  newOrder.value.products = newOrder.value.products.map(product => {
    return {productId: product.id, name: product.product.name, sku: product.product.sku, amount: product.count*product.price, ...product}
  })
  showCreateDialog.value = true
}

const expansionsContent = ref([]);
const setExpansionsContentRef = (el) => {
  if (el) {
    expansionsContent.value.push(el)
  }
}

const animateExpansion = (el) => {
  if (!el) return;
  console.log(el)
  console.log(el.scrollHeight)
  // el.style.maxHeight = "0px";
  // el.style.overflow = "hidden";
  const targetHeight = el.scrollHeight + "px";
  requestAnimationFrame(() => {
    // el.style.transition = "max-height 0.3s ease";
    el.style.maxHeight = targetHeight;
  });
};

const handleExpansion = () => {
  nextTick(() => {
    if (Array.isArray(expansionsContent.value)) {
      expansionsContent.value.forEach((el) => animateExpansion(el));
    } else if (expansionsContent.value) {
      animateExpansion(expansionsContent.value);
    }
  });
};

const productsStore = useProductsStore()
const filteredProducts = ref<Product[]>([])
const searchProducts = async (event) => {
  filteredProducts.value = await productsStore.searchProductsList(event.query)
}

// Ниже для клика по имени покупателя и открытия картчоки с ним
const selectedBuyer = ref<Buyer>()
const showBuyerModal = ref(false)
const showBuyerCard = async (row) => {
  selectedBuyer.value = row.buyer
  showBuyerModal.value = true
}

const handleUpdateBuyer = async (editedBuyer?: Buyer) => {
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

    showBuyerModal.value = false
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


const isVisibleFilters = ref(true);

const toggleFilters = () => {
  isVisibleFilters.value = !isVisibleFilters.value;
};

const {confirmDelete} = useConfirmation()
const handleDeleteOrder = async (id: number) => {
  const ordersStore = useOrdersStore()

   confirmDelete(
      id,
      async () => {
        await ordersStore.deleteOrder(id)
      },
  )
}

const orderDblClick = (event) => {
  if (expandedRows.value[event.data.id]) {
    delete expandedRows.value[event.data.id]
  } else {
    expandedRows.value[event.data.id]= true;
    handleExpansion()
  }
}



const {confirmAction} = useConfirmation()
const closeEditModal = async () => {
  if (JSON.stringify(oldSelectedOrderData) !== JSON.stringify(newOrder.value)) {
    confirmAction(() => showEditDialog.value = false, () => showEditDialog.value = true, "Данные не сохранены. Уверены?")
  } else showEditDialog.value = false
}

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
.expansion-content {
  max-height: 0;
  transition: max-height 0.3s ease;
  overflow: hidden;
}
.hidden-div {
  background-color: #f9f9f9;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;

}
.toggle-filters {
  display: none;
}

@media (max-width: 640px) {
  .toggle-filters {
    display: block;
  }
}

/* Анимация для transition */
.slide-fade-enter-active {
  transition: all 0.2s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  max-height: 0;
  padding: 0 15px;
}
.slide-fade-enter-to {
  max-height: 500px; /* Достаточно большое значение для раскрытия */
  padding: 15px;
}
.slide-fade-leave-from {
  max-height: 500px;
  padding: 15px;
}
.slide-fade-leave-to {
  max-height: 0;
  padding: 0 15px;
}
</style>
