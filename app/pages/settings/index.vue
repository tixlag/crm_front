<!-- /pages/settings/index.vue -->
<template>
  <div class="settings-page p-p-4">
    <h2>Настройки</h2>

    <!-- Компоненты для различных сущностей -->
    <ManagerTable />
    <DeliverymanTable />
    <OrderStatusTable />
    <DeliveryTypeTable />
    <PayTypeTable />
    <SourceTable />
    <ChequeTable />
    <WarehouseTable :canEdit="true"/>
    <!-- Добавьте другие компоненты по необходимости -->

  </div>
</template>

<script setup>

import ManagerTable from "~/components/settings/Manager/ManagerTable.vue";
import DeliverymanTable from "~/components/settings/Deliveryman/DeliverymanTable.vue";
import OrderStatusTable from "~/components/settings/OrderStatus/OrderStatusTable.vue";
import DeliveryTypeTable from "~/components/settings/DeliveryType/DeliveryTypeTable.vue";
import PayTypeTable from "~/components/settings/PayType/PayTypeTable.vue";
import SourceTable from "~/components/settings/Source/SourceTable.vue";
import ChequeTable from "~/components/settings/Cheque/ChequeTable.vue";
import WarehouseTable from "~/components/settings/Warehouse/WarehouseTable.vue";
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-page h2 {
  margin-bottom: 2rem;
}
</style>
