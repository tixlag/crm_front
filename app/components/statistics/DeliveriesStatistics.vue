<template>
  <div v-if="hasStatistics" class="w-full md:w-auto">
    <h3>Статистика по доставкам</h3>
    <div class="flex gap-6 flex-wrap w-full md:w-auto">
      <DataTable
          :value="tableDeliveries"
          scrollable class="w-full md:w-auto"
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} по {last} из {totalRecords}"
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50, 100]"
      >
        <Column v-for="col in ProductTableFields" :field="col.field" :header="col.header">
          <template v-if="col.field === 'count'" #body="{ data, field }">
            {{ data[field].toLocaleString('ru-RU', {maximumFractionDigits: 2}) }}
            ({{ (data[field] / totalStats.count * 100).toLocaleString('ru-RU', {maximumFractionDigits: 2}) }}%)
          </template>
          <template v-if="col.field === 'totalPrice'" #body="{ data, field }">
            {{ formatCurrency(data[field]) }}
            ({{ (data[field] / totalStats.totalDeliveries * 100).toLocaleString('ru-RU', {maximumFractionDigits: 2}) }}%)
          </template>
          <template v-if="col.field === 'avgPrice'" #body="{ data, field }">
            {{ data[field].toLocaleString('ru-RU', {maximumFractionDigits: 2}) }}
          </template>
        </Column>
      </DataTable>
      <div class="flex my-panel p-3 h-full flex-wrap">
        <div>
          <h4>Кол-во доставок</h4>
          <Chart type="doughnut" :data="chartCountDeliveries" class="w-full md:w-[20rem]"/>
        </div>
        <div>
          <h4>Стоимость доставок</h4>
          <Chart type="doughnut" :data="chartPriceDeliveries" class="w-full md:w-[20rem]"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">

import {useStatisticsStore} from "~/stores/statistics";
import Chart from "primevue/chart";
import {formatCurrency, getNameById} from "~/utils/common-utils";

const {selectDates} = defineProps<{ selectDates: Date[] }>()

const statisticsStore = useStatisticsStore()

const hasStatistics = computed(() => {
  return statisticsStore.deliveries && statisticsStore.deliveries[0]
})

const totalStats = ref();
const tableDeliveries = computed(() => {
  if (!statisticsStore.deliveries) return []
  totalStats.value = statisticsStore.deliveries.reduce((a, b) => {
    return {
      count: a.count + b._count,
      totalDeliveries: a.totalDeliveries + b._sum.deliveryPrice,
    };
  }, {
    count: 0,
    totalDeliveries: 0,
  })
  return statisticsStore.deliveries.map(val => {
    //todo перенести форматирование выввода в templates
    return {
      id: val.deliveryTypeId,
      name: getNameById(val.deliveryTypeId, "deliveryTypes"),
      count: val._count,
      totalPrice: val._sum.deliveryPrice,
      avgPrice: val._sum.deliveryPrice / val._count,
    }
  })
});

const chartCountDeliveries = computed(() => {
  if (!statisticsStore.deliveries) return {}
  return {
    labels: statisticsStore.deliveries?.map(item => getNameById(item.deliveryTypeId, 'deliveryTypes')),
    datasets: [
      {
        data: statisticsStore.deliveries?.map(item => item._count),
      }
    ]
  };
});

const chartPriceDeliveries = computed(() => {
  if (!statisticsStore.deliveries) return {}
  return {
    labels: statisticsStore.deliveries?.map(item => getNameById(item.deliveryTypeId, 'deliveryTypes')),
    datasets: [
      {
        data: statisticsStore.deliveries?.map(item => item._sum.deliveryPrice),
      }
    ]
  };
});


const fetchStatistics = (selectDates: Date[]) => {
  const startDate = selectDates[0] ?? new Date();
  const endDate = selectDates.length === 2 ? selectDates[1] : undefined;
  statisticsStore.fetchDeliveriesStatistics(startDate, endDate);
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


const ProductTableFields = [ //вручную рендерим здесь
  {field: "id", header: "ID"},
  {field: "name", header: "Название доставки"},
  {field: "count", header: "Кол-во доставок"},
  {field: "totalPrice", header: "Стоимость"},
  {field: "avgPrice", header: "Среднее значение"},
]
</script>


<style scoped>

</style>
