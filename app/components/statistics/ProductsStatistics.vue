<template>
  <div v-if="hasStatistics" class="w-full">
    <h3>Статистика по товарам</h3>
      <div class="flex gap-6 flex-wrap w-full">
          <DataTable
              :value="tableProducts"
              scrollable class="w-full"
              paginator
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="{first} по {last} из {totalRecords}"
              :rows="10"
              :rowsPerPageOptions="[10, 25, 50, 100]"
          >
            <Column v-for="col in ProductTableFields" :field="col.field" :header="col.header">
              <template v-if="col.isManual" #body="{ data, field }">
                {{data[field].toLocaleString('ru-RU', {maximumFractionDigits: 2}) }} ({{(data[field] / statisticsStore.products.total[field]*100).toLocaleString('ru-RU', {maximumFractionDigits: 2}) }}%)
              </template>
              <template v-if="col.field === 'avgDifTotal'" #body="{ data, field }">
                {{data[field].toLocaleString('ru-RU', {maximumFractionDigits: 2}) }}
              </template>
            </Column>
          </DataTable>
      </div>
  </div>
</template>
<script setup lang="ts">

import {useStatisticsStore} from "~/stores/statistics";
import {formatCurrency} from "~/utils/common-utils";

const {selectDates} = defineProps<{ selectDates: Date[] }>()

const statisticsStore = useStatisticsStore()

const hasStatistics = computed(() => {
  return statisticsStore.products.list && statisticsStore.products.list[0]
})

const tableProducts = computed(() => {
  if (!statisticsStore.products.list) return []
  statisticsStore.products.total = statisticsStore.products.list.reduce((a, b) => {
    const totalPurchase = b._sum.count * b.purchasePrice
    const difTotal = b._sum.price - totalPurchase
    return {
      count: a.count + b._sum.count,
      totalRevenue: a.totalRevenue + b._sum.price,
      purchasePrice: a.purchasePrice + b.purchasePrice,
      totalPurchase: a.totalPurchase + totalPurchase,
      difTotal: a.difTotal + b._sum.price - totalPurchase,
      avgDifTotal: a.avgDifTotal + difTotal
    };
  }, {
    count: 0,
    totalRevenue: 0,
    purchasePrice: 0,
    totalPurchase: 0,
    difTotal: 0,
    avgDifTotal: 0,
  });
  return statisticsStore.products.list.map(val => {
    const totalPurchase = val._sum.count * val.purchasePrice
    const difTotal = val._sum.price - totalPurchase
    return {
      id: val.id,
      name: val.name,
      sku: val.sku,
      count: val._sum.count,
      totalRevenue: val._sum.price,
      purchasePrice: val.purchasePrice,
      totalPurchase: totalPurchase,
      difTotal: difTotal,
      avgDifTotal: difTotal / val._sum.count,
    }
  })
});


const fetchStatistics = (selectDates: Date[]) => {
  const startDate = selectDates[0] ?? new Date();
  const endDate = selectDates.length === 2 ? selectDates[1] : undefined;
  statisticsStore.fetchProductsStatistics(startDate, endDate);
};

watch(
    () => selectDates,
    (newDates) => {
      fetchStatistics(newDates);
    },
    {immediate: true} // Для вызова при первой загрузке
);

onMounted(() => {
  fetchStatistics(selectDates);
});


const ProductTableFields = [
  {field: "id", header: "ID"},
  {field: "name", header: "Название"},
  {field: "sku", header: "Артикул"},
  {field: "count", header: "Кол-во проданных", isManual: true},
  {field: "totalRevenue", header: "Выручка", isManual: true},
  {field: "purchasePrice", header: "Цена закупки"},
  {field: "totalPurchase", header: "Сумма закупки", isManual: true},
  {field: "difTotal", header: "Выручка-закупка", isManual: true},
  {field: "avgDifTotal", header: "Среднее значение", },

]
</script>


<style scoped>

</style>
