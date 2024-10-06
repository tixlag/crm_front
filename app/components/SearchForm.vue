<!-- SearchForm.vue -->
<template>
  <div class="search-form-container">
    <!-- Кнопка для открытия формы на мобильных устройствах -->
    <button v-if="isMobile" @click="toggleForm" class="toggle-button">
      {{ formVisible ? 'Скрыть Поиск' : 'Показать Поиск' }}
    </button>

    <!-- Форма поиска с анимацией -->
    <transition name="fade-slide">
      <div v-if="!isMobile || formVisible" class="form-wrapper">
        <FormKit
            type="form"
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
          v-bind="searchString"
      />
      <Button type="submit">Поиск</Button>
    </FormKit>

    <!-- Компонент пагинации -->
    <Pagination
        :current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="limit"
        @page-changed="handlePageChange"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, onUnmounted } from 'vue';
import Pagination from './Pagination.vue'; // Предполагается, что у вас есть компонент пагинации

const props = defineProps({
  fields: {
    type: Array,
    required: true,
    default: () => [],
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  validationSchema: {
    type: Object,
    default: () => ({}),
  },
  searchHandlers: {
    type: Object,
    default: () => ({
      handleSearchByForm: () => {},
      handleSearchByString: () => {},
    }),
  },
});

const emit = defineEmits(['submit']);

const formVisible = ref(false);
const isMobile = ref(false);
const currentPage = ref(1);
const limit = ref(10);
const totalItems = ref(0);
const formValues = ref(props.initialValues);
const searchString = ref("");

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    formVisible.value = false;
  }
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
});

const toggleForm = () => {
  formVisible.value = !formVisible.value;
};

const handleFormSubmit = () => {
  const payload = { ...formValues.value, page: currentPage.value, limit: limit.value };
  props.searchHandlers.handleSearchByForm(payload).then(response => {
    // Обработка ответа
    // Например, установить общее количество записей
    totalItems.value = response.total;
  }).catch(error => {
    console.error('Ошибка при поиске покупателей:', error);
  });
};

const handleStringSubmit = () => {
  const payload = { search: searchString.value, page: currentPage.value, limit: limit.value };
  props.searchHandlers.handleSearchByString(payload).then(response => {
    totalItems.value = response.total;
  }).catch(error => {
    console.error('Ошибка при поиске покупателей:', error);
  });
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  // Повторный запрос с обновленной страницей
  handleFormSubmit(); // Или handleStringSubmit в зависимости от текущего поиска
};
</script>

<style scoped>
/* Ваши стили здесь */
</style>
