<!-- SearchForm.vue -->
<template>
  <div class="search-form-container">
    <!-- Кнопка для открытия формы на мобильных устройствах -->
    <button v-if="isMobile" @click="toggleForm" class="toggle-button">
      {{ formVisible ? 'Скрыть Поиск' : 'Показать Поиск' }}
    </button>

    <!-- Форма поиска по форме с анимацией -->
    <transition name="fade-slide">
      <div v-if="!isMobile || formVisible" class="form-wrapper">
        <FormKit
            :type="formType"
            @submit="handleFormSubmit"
            :actions="false"
            :validation-schema="validationSchema"
            v-model="formValues"
        >
          <div class="form-fields">
            <FormKit
                v-for="field in fields"
                :key="field.name"
                :type="field.type"
                :name="field.name"
                :label="field.label"
                :iconPrefix="field.iconPrefix"
                v-bind="field.attrs"
            />
          </div>
          <Button type="submit"><span class="pi pi-search"/> Поиск</Button>
        </FormKit>
      </div>
    </transition>

    <!-- Форма поиска по строке -->
    <FormKit
        type="form"
        @submit="handleStringSubmit"
        :actions="false"
        v-model="searchString"
    >
      <FormKit
          key="search"
          type="primeInputText"
          name="search"
          label="Поиск"
          iconPrefix="pi pi-search"
          v-model="searchString"
      />
      <Button type="submit">Поиск</Button>
    </FormKit>

    <!-- Компонент пагинации -->
    <Pagination
        :current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        @page-changed="handlePageChange"
    />
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, onUnmounted } from 'vue'
import Pagination from './Pagination.vue'

const props = defineProps({
  fields: {
    type: Array,
    required: true,
    default: () => [],
  },
  formType: {
    type: String,
    default: 'form',
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  validationSchema: {
    type: Object,
    default: () => ({}),
  },
  currentPage: {
    type: Number,
    required: true,
    default: 1,
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    required: true,
    default: 10,
  },
})

const emit = defineEmits(['search-form', 'search-string', 'page-changed'])

const formVisible = ref(false)
const isMobile = ref(false)
const formValues = ref(props.initialValues)
const searchString = ref("")

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    formVisible.value = false
  }
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

const toggleForm = () => {
  formVisible.value = !formVisible.value
}

const handleFormSubmit = (payload) => {
  emit('search-form', { values: formValues.value, page: 1, limit: props.itemsPerPage })
}

const handleStringSubmit = (payload) => {
  emit('search-string', { search: searchString.value, page: 1, limit: props.itemsPerPage })
}

const handlePageChange = (newPage) => {
  emit('page-changed', newPage)
}
</script>

<style scoped>
.search-form-container {
  width: 100%;
}

/* Кнопка переключения */
.toggle-button {
  display: none;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-button:hover {
  background-color: #0056b3;
}

/* Обертка формы */
.form-wrapper {
  overflow: hidden;
}

/* Поля формы */
.form-fields {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* Медиа-запрос для мобильных устройств */
@media (max-width: 768px) {
  .toggle-button {
    display: block;
  }

  .form-fields {
    flex-direction: column;
  }
}

/* Анимации для перехода */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
}

.fade-slide-enter-to {
  opacity: 1;
  max-height: 1000px; /* Большое значение для обеспечения полного раскрытия */
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
}
</style>
