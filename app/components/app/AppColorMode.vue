<script setup lang="ts">

// Получаем доступ к store
const themeStore = useThemeStore()

// Состояние для отображения меню выбора цветов
const showColorOptions = ref(false)

// Функция для переключения между светлой и тёмной темами
function toggleTheme() {
  const newTheme = themeStore.theme === 'light' ? 'dark' : 'light'
  themeStore.setTheme(newTheme)
}

// Функция для выбора цветового варианта
function selectColorVariant(variant: string) {
  themeStore.setColorVariant(variant)
  showColorOptions.value = false
}
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Кнопка для переключения темы -->
    <button
        @click="toggleTheme"
        class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none"
        :title="themeStore.theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'"
    >
      <i :class="themeStore.theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'" class="text-xl"></i>
    </button>

    <!-- Кнопка для выбора цветового варианта -->
    <div class="relative mt-2">
      <button
          @click="showColorOptions = !showColorOptions"
          class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 focus:outline-none"
          :title="'Выбрать цветовую тему'"
      >
        <i class="pi pi-palette text-xl"></i>
      </button>

      <!-- Меню выбора цвета -->
      <div
          v-if="showColorOptions"
          class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-20"
      >
        <ul class="p-2">
          <li
              v-for="variant in themeStore.availableThemes"
              :key="variant"
              @click="selectColorVariant(variant)"
              class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
          >
            <!-- Превью цвета -->
            <span
                :class="['w-4 h-4 mr-2 rounded-full', variant]"
            ></span>
            <span class="capitalize">{{ variant.replace('-', ' ') }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Добавляем классы для цветовых превью */
.saga-blue { background-color: #2196f3; }
.saga-green { background-color: #4caf50; }
.saga-purple { background-color: #9c27b0; }
.vela-blue { background-color: #1e88e5; }
.vela-green { background-color: #43a047; }
.vela-purple { background-color: #8e24aa; }
.arya-blue { background-color: #42a5f5; }
.arya-green { background-color: #66bb6a; }
.arya-purple { background-color: #ab47bc; }
/* Добавьте другие классы по необходимости */
</style>
