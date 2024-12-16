<template>
  <BDStatistics></BDStatistics>
  <SaleStatistics></SaleStatistics>
  <CommonMonthStatistics></CommonMonthStatistics>
  <DataTable :value="products" v-model:expandedRows="expandedRows" @rowExpand="handleExpansion" @rowCollapse="handleCollapse">
    <Column expander style="width: 3em" />
    <Column field="name" header="Name" />
    <Column field="price" header="Price" />

    <template #expansion="{ data }">
      <div class="expansion-content" ref="expansionContent">
        <h4>Details for {{ data.name }}</h4>
        <p>Price: {{ data.price }}</p>
        <p>Description: {{ data.description }}</p>
      </div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">

    import SaleStatistics from "~/components/statistics/SaleStatistics.vue";
    import BDStatistics from "~/components/statistics/BDStatistics.vue";
    import CommonMonthStatistics from "~/components/statistics/CommonMonthStatistics.vue";

    const products = ref([
      { id: 1, name: "Product A", price: 50, description: "High-quality product A" },
      { id: 2, name: "Product B", price: 30, description: "Affordable product B" },
    ]);
    const expandedRows = ref([]);
    const expansionContent = ref([]);

    const animateExpansion = (el) => {
      if (!el) return;
      el.style.height = "0px";
      el.style.overflow = "hidden";
      const targetHeight = el.scrollHeight + "px";
      requestAnimationFrame(() => {
        el.style.transition = "height 0.3s ease";
        el.style.height = targetHeight;
      });
    };

    const handleExpansion = (el, del, pel) => {
      nextTick(() => {
        if (Array.isArray(expansionContent.value)) {
          expansionContent.value.forEach((el) => animateExpansion(el));
        } else if (expansionContent.value) {
          animateExpansion(expansionContent.value);
        }
      });
    };

    const handleCollapse = (el, del, pel) => {
      if (Array.isArray(expansionContent.value)) {
        expansionContent.value.forEach((el) => animateCollapse(el));
      } else if (expansionContent.value) {
        animateCollapse(expansionContent.value);
      }

    };
    const animateCollapse = (el) => {
      if (!el) return;
      el.style.overflow = "hidden";
      requestAnimationFrame(() => {
        el.style.transition = "height 0.3s ease";
        el.style.height = 0;
      });
      setTimeout(() => {}, 300)
    };

    // watch(expandedRows, handleExpansion);

</script>

<style>
.expansion-content {
  transition: height 0.3s ease;
}
</style>
