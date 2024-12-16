<template>
  <div class="card"><h2>Количество обращений к бд</h2>
    <div class="flex md:items-start gap-6 flex-wrap">

      <DatePicker v-model="selectDates" selectionMode="range" dateFormat="dd.mm.y" placeholder="Date" inline/>
      <!--    todo ПРЕДЛОЖЕНИЯ сделать сортировку-->
      <!--    todo ПРЕДЛОЖЕНИЯ сделать подсветку дат, в которых есть статистика-->
      <div class="flex gap-6 flex-wrap w-full md:w-auto" v-if="hasStatistics">
        <div>
          <h3>Общее</h3>
          <div class="flex gap-6 flex-wrap">
            <DataTable
                :value="tableUsersRequests"
                paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} по {last} из {totalRecords}"
                :rows="10"
                :rowsPerPageOptions="[10, 25, 50, 100]"
            >
              <Column field="name" header="Имя">
                <template #body="{ data }">
                  <span class="pi pi-user text-[0.9rem] color-gray-500" /> {{data.name}}
                </template>
              </Column>
              <Column field="count" header="Количество"></Column>
              <Column field="percent" header="%"></Column>
            </DataTable>
          </div>
        </div>
        <div class="w-full md:w-auto">
          <h3>По ссылкам</h3>
          <div class="flex w-full gap-6 flex-wrap">
            <DataTable
                class="w-full"
                :value="tableTopByUrl"
                scrollable
                paginator
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="{first} по {last} из {totalRecords}"
                :rows="10"
                :rowsPerPageOptions="[10, 25, 50, 100]"
            >
              <Column field="name" header="Имя">
                <template #body="{ data }">
                  <span class="pi pi-user text-[0.9rem] color-gray-500" /> {{data.name}}
                </template>
              </Column>
              <Column field="count" header="Количество"></Column>
              <Column field="percent" header="%"></Column>
              <Column field="url" header="URL"></Column>
              <Column field="method" header="Метод">
                <template #body="{ data }">
                  <Tag :value="data.method" :severity="getSeverityByMethod(data.method)" />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">

import Chart from 'primevue/chart';

import {useStatisticsStore} from "~/stores/statistics";
import {getNameById, getSeverityByMethod} from "~/utils/common-utils";

const statisticsStore = useStatisticsStore()
const selectDates = ref([])

const hasStatistics = computed(() => {
  return statisticsStore.bd && statisticsStore.bd.usersRequests && statisticsStore.bd.usersRequests[0]
})

const tableUsersRequests = computed(() => {
  if (!statisticsStore.bd) return []
  const totalSum = statisticsStore.bd.usersRequests ? statisticsStore.bd.usersRequests.reduce((a, b) => a + (b._sum.count || 0), 0) : 0;
  return statisticsStore.bd.usersRequests.map(val => {
    return {
      name: getNameById(val.userId, 'managers'),
      count: val._sum.count,
      percent: (val._sum.count / totalSum * 100).toFixed(1),
    }
  })
});

const tableTopByUrl = computed(() => {
  if (!statisticsStore.bd) return []
  const totalSum = statisticsStore.bd.topByUrl ? statisticsStore.bd.topByUrl.reduce((a, b) => a + (b._sum.count || 0), 0) : 0;
  return statisticsStore.bd.topByUrl.map(val => {
    return {
      name: getNameById(val.userId, 'managers'),
      count: val._sum.count,
      url: val.url,
      method: val.method,
      percent: (val._sum.count / totalSum * 100).toFixed(1),
    }
  })
});

// const chartData = computed(() => {
//   if (!statisticsStore.bd) return {}
//   return {
//     labels: statisticsStore.bd.totalAmountByStatus.map(item => getNameById(item.statusId, 'orderStatuses')),
//     datasets: [
//       {
//         data: statisticsStore.bd.totalAmountByStatus.map(item => item._sum.totalAmount),
//       }
//     ]
//   };
// });
//
// const chartDataDeliveries = computed(() => {
//   if (!statisticsStore.bd) return {}
//   return {
//     labels: statisticsStore.bd.deliveryPriceByType.map(item => getNameById(item.deliveryTypeId, 'deliveryTypes')),
//     datasets: [
//       {
//         data: statisticsStore.bd.deliveryPriceByType.map(item => item._sum.deliveryPrice),
//       }
//     ]
//   };
// });

watch(selectDates, async () => {
  console.log('дата изменилась')
  await statisticsStore.fetchBDStatistics(selectDates.value[0], selectDates.value.length === 2 ? selectDates.value[1] : undefined)
})

</script>


<style scoped>

</style>
