<template>
  <div v-if="hasStatistics" class="w-full md:w-auto">
    <h3>Статистика по менеджерам</h3>
    <div class="flex gap-6 flex-wrap w-full md:w-auto">
      <DataTable
          :value="tableManagers"
          scrollable class="w-full md:w-auto"
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} по {last} из {totalRecords}"
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50, 100]"
      >
        <Column v-for="col in ManagersTableFields" :field="col.field" :header="col.header">
          <template v-if="col.field === 'count'" #body="{ data, field }">
            {{data[field].toLocaleString('ru-RU', {maximumFractionDigits: 2})}} ({{(data[field]/totalStats.count*100).toLocaleString('ru-RU', {maximumFractionDigits: 2})}}%)
          </template>
          <template v-if="col.field === 'totalPrice'" #body="{ data, field }">
            {{formatCurrency(data[field])}} ({{(data[field]/totalStats.totalAmount*100).toLocaleString('ru-RU', {maximumFractionDigits: 2})}}%)
          </template>
          <template v-if="col.field === 'avgPrice'" #body="{ data, field }">
            {{data[field].toLocaleString('ru-RU', {maximumFractionDigits: 2})}}
          </template>
        </Column>
      </DataTable>
<!--      todo ПРЕДЛОЖЕНИЯ добавить график по сумме-->
      <div class="flex my-panel p-3 h-full flex-wrap">
        <div>
          <h4>Кол-во заказов</h4>
          <Chart type="doughnut" :data="chartCountManagers" class="w-full md:w-[20rem]"/>
        </div>
        <div>
          <h4>Стоимость заказов</h4>
          <Chart type="doughnut" :data="chartPriceManagers" class="w-full md:w-[20rem]"/>
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
  return statisticsStore.managers && statisticsStore.managers[0]
})

const totalStats = ref()
const tableManagers = computed(() => {
  if (!statisticsStore.managers) return []
  totalStats.value = statisticsStore.managers.reduce((a, b) => {
    return {
      count: a.count + b._count,
      totalAmount: a.totalAmount + b._sum.totalAmount,
    };
  }, {
    count: 0,
    totalAmount: 0,
  })
  return statisticsStore.managers.map(val => {
    //todo перенести форматирование выввода в templates
    return {
      id: val.managerId,
      name: getNameById(val.managerId, "managers"),
      count: val._count,
      totalPrice: val._sum.totalAmount,
      avgPrice: val._sum.totalAmount / val._count,
    }
  })
});

const chartCountManagers = computed(() => {
  if (!statisticsStore.managers) return {}
  return {
    labels: statisticsStore.managers?.map(item => getNameById(item.managerId, 'managers')),
    datasets: [
      {
        data: statisticsStore.managers?.map(item => item._count),
      }
    ]
  };
});

const chartPriceManagers = computed(() => {
  if (!statisticsStore.managers) return {}
  return {
    labels: statisticsStore.managers?.map(item => getNameById(item.managerId, 'managers')),
    datasets: [
      {
        data: statisticsStore.managers?.map(item => item._sum.totalAmount),
      }
    ]
  };
});


const fetchStatistics = (selectDates: Date[]) => {
  const startDate = selectDates[0] ?? new Date();
  const endDate = selectDates.length === 2 ? selectDates[1] : undefined;
  statisticsStore.fetchManagersStatistics(startDate, endDate);
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


const ManagersTableFields = [ //вручную рендерим здесь
  {field: "id", header: "ID"},
  {field: "name", header: "Менеджер"},
  {field: "count", header: "Кол-во сделок",},
  {field: "totalPrice", header: "Стоимость"},
  {field: "avgPrice", header: "Средняя стоимость"},
]
</script>


<style scoped>

</style>
