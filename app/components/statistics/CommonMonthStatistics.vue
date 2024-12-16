<template>
  <div class="card">
    <h2>Отчет за месяц</h2>
    <DatePicker v-model="selectDates" selectionMode="range" dateFormat="dd.mm.y" placeholder="Date" inline/>
    <div class="flex md:items-start gap-6 flex-wrap">


      <ProductsStatistics :selectDates="selectDates" />
      <DeliveriesStatistics :selectDates="selectDates" />
      <ManagersStatistics :selectDates="selectDates" />
      <StatusesStatistics :selectDates="selectDates" />

    </div>
  </div>
</template>
<script setup lang="ts">

import ProductsStatistics from "~/components/statistics/ProductsStatistics.vue";
import DeliveriesStatistics from "~/components/statistics/DeliveriesStatistics.vue";
import ManagersStatistics from "~/components/statistics/ManagersStatistics.vue";
import StatusesStatistics from "~/components/statistics/StatusesStatistics.vue";

const selectDates = ref([])



watch(selectDates, async () => {
  console.log('дата изменилась')

})

</script>


<style scoped>

</style>
