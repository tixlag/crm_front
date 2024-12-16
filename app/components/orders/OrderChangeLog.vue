<template>
  <div class="p-4">
    <h3>История изменений</h3>
    <DataTable :value="changeLogs" stripedRows>
      <Column field="timestamp" header="Дата">
        <template #body="{data}">
          <div>
            <div>{{ formatDate(data.timestamp) }}</div>
            <small style="display: block; color: gray;">{{ formatTime(data.timestamp) }}</small>
          </div>
        </template>
      </Column>
      <Column field="user" header="Пользователь">
        <template #body="{ data }">
          {{ data.user.name }}
        </template>
      </Column>
      <Column field="action" header="Действие">
        <template #body="{ data }">
          {{ data.action }}
        </template>
      </Column>
      <Column field="fieldChanges" header="Изменения">
        <template #body="{ data }">
          <ul>
            <li v-for="change in data.fieldChanges" :key="change.id">
              <strong>{{ changesName[change.fieldName] }}</strong>:
              <template v-if="!moment(change.newValue, undefined, undefined, true).isValid()">
                <span v-if="change.oldValue !== null">{{ getNameByField(change.oldValue, change.fieldName) }} → </span>
                <span>{{ getNameByField(change.newValue, change.fieldName) }}</span>
              </template>
              <template v-else>
                <span v-if="change.oldValue !== null">"{{
                    moment(change.oldValue).format("DD.MM.YYYY, HH:mm:ss")
                  }} → </span>
                <span>{{ moment(change.newValue).format("DD.MM.YYYY, HH:mm:ss ") }}</span>
              </template>
            </li>
          </ul>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {formatDate, formatTime} from "~/utils/date-utils";
import moment from "moment";

const ordersStore = useOrdersStore()

const props = defineProps({
  orderId: {
    type: Number,
    required: true,
  },
})

const emits = defineEmits(['afterRender'])

const changeLogs = ref([])

const fetchChangeLogs = async () => {
  try {
    changeLogs.value = await ordersStore.fetchChangeLogs(props.orderId)
    emits('afterRender')
  } catch (error) {
    console.error('Ошибка при получении логов:', error)
  }
}

const changesName = {
  createdAt: 'Дата создания',
  isPaid: 'Оплачен',
  isCompleted: "Завершен",
  deliveryAddress: "Адрес доставки",
  products: "Товары",
  managerId: "Менеджер",
  buyerId: "Покупатель",
  comments: "Комментарии",
  statusId: "Статус",
  warehouseId: "Склад",
  payTypeId: "Форма оплаты",
  sourceId: "Источник",
  chequeId: "Чек",
  deliveryTypeId: "Логистика",
  deliveryPrice: "Стоимость доставки",
  discountPercent: "Процент скидки",
  discountConst: "Скидка",
  totalAmount: "Общая стоимость"
}


const getNameByField = (val: any, fieldName: string) => {
  const fval = parseFloat(val)
  if (!fval) return val

  if (fieldName === 'statusId') { fieldName = 'orderStatuses'; }
  else if (fieldName.endsWith('Id')) fieldName = fieldName.replace('Id', 's')
  else return val

  return getNameById(fval, fieldName)

}

onMounted(() => {
  fetchChangeLogs()

})
</script>

<style scoped>
/* Стили по необходимости */
</style>
