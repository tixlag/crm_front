<!-- Pagination.vue -->
<template>
  <div class="pagination-container">
    <button @click="prevPage" :disabled="currentPage === 1">Предыдущая</button>
    <span>Страница {{ currentPage }} из {{ totalPages }}</span>
    <button @click="nextPage" :disabled="currentPage === totalPages">Следующая</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['page-changed'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('page-changed', props.currentPage - 1)
  }
}

const nextPage = () => {
  if (props.currentPage < totalPages.value) {
    emit('page-changed', props.currentPage + 1)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #0056b3;
}
</style>
