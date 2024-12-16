<template>

  <div class="card"><h2>Данные по продажам</h2>
    <div class="flex md:items-start gap-6 flex-wrap">

      <DatePicker v-model="selectDates" selectionMode="range" dateFormat="dd.mm.y" placeholder="Date" inline/>
      <!--    todo ПРЕДЛОЖЕНИЯ сделать сортировку-->
      <!--    todo ПРЕДЛОЖЕНИЯ сделать подсветку дат, в которых есть статистика-->
      <div class="flex gap-6 flex-wrap" v-if="hasStatistics">
        <div>
          <h3>По статусам</h3>
          <div class="flex flex-col gap-6 flex-wrap">
            <DataTable
                :value="tableDataStatuses"
                paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} по {last} из {totalRecords}"
                :rows="10"
                :rowsPerPageOptions="[10, 25, 50, 100]"
            >
              <Column field="name" header="Статус"></Column>
              <Column field="sum" header="Сумма"></Column>
              <Column field="percent" header="%"></Column>
            </DataTable>
            <div class="flex my-panel p-3 h-full flex-wrap">
              <Chart type="doughnut" :data="chartData" class="w-full md:w-[20rem]"/>
            </div>
          </div>
        </div>
        <div>
          <h3>По типам доставки</h3>
          <div class=" flex flex-col gap-6 flex-wrap">
            <DataTable
                :value="tableDataDeliveries"
                paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} по {last} из {totalRecords}"
                :rows="10"
                :rowsPerPageOptions="[10, 25, 50, 100]"
            >
              <Column field="name" header="Статус"></Column>
              <Column field="sum" header="Сумма"></Column>
              <Column field="percent" header="%"></Column>
            </DataTable>
            <div class="flex my-panel p-3 h-full flex-wrap">
              <Chart type="doughnut" :data="chartDataDeliveries" class="w-full md:w-[20rem]"/>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">

import Chart from 'primevue/chart';

import {useStatisticsStore} from "~/stores/statistics";
import {formatCurrency, getNameById} from "~/utils/common-utils";

const statisticsStore = useStatisticsStore()
const selectDates = ref([])

const hasStatistics = computed(() => {
  return statisticsStore.sales && statisticsStore.sales.totalAmountByStatus && statisticsStore.sales.totalAmountByStatus[0]
})

const tableDataStatuses = computed(() => {
  if (!statisticsStore.sales) return []
  const totalSum = statisticsStore.sales.totalAmountByStatus ? statisticsStore.sales.totalAmountByStatus.reduce((a, b) => a + (b._sum.totalAmount || 0), 0) : 0;
  return statisticsStore.sales.totalAmountByStatus.map(val => {
    return {
      name: getNameById(val.statusId, 'orderStatuses'),
      sum: formatCurrency(val._sum.totalAmount),
      percent: (val._sum.totalAmount / totalSum * 100).toFixed(2),
    }
  })
});

const tableDataDeliveries = computed(() => {
  if (!statisticsStore.sales) return []
  const totalSum = statisticsStore.sales.deliveryPriceByType ? statisticsStore.sales.deliveryPriceByType.reduce((a, b) => a + (b._sum.deliveryPrice || 0), 0) : 0;
  return statisticsStore.sales.deliveryPriceByType.map(val => {
    return {
      name: getNameById(val.deliveryTypeId, 'deliveryTypes'),
      sum: formatCurrency(val._sum.deliveryPrice),
      percent: (val._sum.deliveryPrice / totalSum * 100).toFixed(2),
    }
  })
});

const chartData = computed(() => {
  if (!statisticsStore.sales) return {}
  return {
    labels: statisticsStore.sales.totalAmountByStatus.map(item => getNameById(item.statusId, 'orderStatuses')),
    datasets: [
      {
        data: statisticsStore.sales.totalAmountByStatus.map(item => item._sum.totalAmount),
      }
    ]
  };
});

const chartDataDeliveries = computed(() => {
  if (!statisticsStore.sales) return {}
  return {
    labels: statisticsStore.sales.deliveryPriceByType.map(item => getNameById(item.deliveryTypeId, 'deliveryTypes')),
    datasets: [
      {
        data: statisticsStore.sales.deliveryPriceByType.map(item => item._sum.deliveryPrice),
      }
    ]
  };
});

watch(selectDates, async () => {
  console.log('дата изменилась')
  await statisticsStore.fetchSalesStatistics(selectDates.value[0], selectDates.value.length === 2 ? selectDates.value[1] : undefined)
})

</script>


<style scoped>

</style>
