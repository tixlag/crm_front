<!-- /components/settings/Cheque/ChequeModal.vue -->
<template>
  <Dialog
      :header="isEdit ? 'Редактировать чек' : 'Создать чек'"
      :visible="isVisible"
      @update:visible="handleClose"
      modal
      class="w-4/5"
  >
    <form @submit.prevent="submitForm">
      <div class="flex items-center gap-6 flex-wrap">
        <div class="p-field">
          <label for="name">Название чека</label>
          <InputText id="name" v-model="form.name" required/>
        </div>

      </div>

      <div class="flex flex-row gap-4 flex-wrap md:flex-nowrap">
        <div class="flex flex-col">
          <label for="markup">Разметка чека</label>

          <TipTap ref="tipTapEditor" id="markup" v-model="form.template" style="min-height: 11rem"/>
        </div>

        <div class="flex flex-col">
          <small>Используйте следующие переменные для вставки данных:</small>
          <ul class="grid grid-rows-auto gap-y-2">
            <li
                v-for="variable in variables"
                :key="variable.name"
                class="grid grid-cols-[1fr_auto_2fr] items-center"
            >
              <div>

                <code @click="insertVariable(variable.value)" class="cursor-pointer text-blue-500">
                  {{ variable.display }}
                </code>
              </div>
              <span class="text-center mr-2">—</span>
              <span>{{ variable.description }}</span>
            </li>
          </ul>
        </div>


      </div>

<!--      <div v-if="error" class="p-error">-->
<!--        {{ error }}-->
<!--      </div>-->

      <div class="p-dialog-footer">
        <Button label="Отмена" class="p-button-text" @click="emitClose"/>
        <Button label="Сохранить" type="submit"/>
      </div>
    </form>
  </Dialog>

  <!--  <Button label="Добавить чек" icon="pi pi-plus" @click="visible = true" />-->
</template>

<script setup>

import TipTap from "~/components/tiptap/TipTap.vue";

const props = defineProps({
  cheque: Object, // Если есть, это редактирование
  isVisible: true
})

function handleClose() {
  emit('close')
  emit('update:visible', false);
}

const emit = defineEmits(['close', 'save', "update:visible"])

const isEdit = computed(() => !!props.cheque)

const form = ref({
  name: '',
  template: '',
})

watch(isEdit, () => {
      if (props.cheque) {
        form.value = {
          name: props.cheque.name,
          template: props.cheque.template,
        }
      } else {
        form.value = {
          name: '',
          template: '',
        }
      }
    }
)


const submitForm = () => {
  const payload = {...form.value}

  emit('save', payload)
}

const emitClose = () => {
  emit('close')
}

// Ссылка на редактор
const editor = ref(null)
// Метод для вставки текста в позицию курсора
const insertAtCursor = (text) => {
  // Получаем экземпляр Quill через PrimeVue Editor
  const quill = editor.value.quill
  const range = editor.value.quill?.selection
    if (range) {
      quill.insertText(range.index, text)
      // Перемещаем курсор после вставленного текста
      quill.setSelection(range.index + text.length, 0)
    } else {
      // Если нет активного выбора, вставляем в конец
      quill.insertText(quill.getLength() - 1, text)
      quill.setSelection(quill.getLength() - 1 + text.length, 0)
    }

}

const tipTapEditor = ref(null);

// Список переменных для вставки
const variables = [
  { name: 'ID', value: '{{ID}}', display: '{{ID}}', description: 'Номер заказа' },
  { name: 'BAYER', value: '{{BAYER}}', display: '{{BAYER}}', description: 'Имя покупателя' },
  { name: 'PHONE', value: '{{PHONE}}', display: '{{PHONE}}', description: 'Телефон покупателя' },
  { name: 'ADDRESS', value: '{{ADDRESS}}', display: '{{ADDRESS}}', description: 'Адрес покупателя' },
  { name: 'EMAIL', value: '{{EMAIL}}', display: '{{EMAIL}}', description: 'Email покупателя' },
  { name: 'DATE', value: '{{DATE}}', display: '{{DATE}}', description: 'Дата заказа' },
  { name: 'PRODUCT', value: '{{PRODUCT}}', display: '{{PRODUCT}}', description: 'Таблица продуктов' },
  { name: 'COUNT', value: '{{COUNT}}', display: '{{COUNT}}', description: 'Количество продуктов' },
  { name: 'TOTAL', value: '{{TOTAL}}', display: '{{TOTAL}}', description: 'Сумма заказа' },
];

// Функция для вставки переменной в редактор
const insertVariable = (variable) => {
  if (tipTapEditor.value && tipTapEditor.value.editor) {
    tipTapEditor.value.editor
        .chain()
        .focus()
        .insertContent(variable)
        .run();
  } else {
    console.warn('Редактор TipTap не инициализирован.');
  }
};


//todo перейти но новую версию. Решение: https://github.com/primefaces/primevue/issues/5606#issuecomment-2093536386
</script>

<style scoped>
.p-field {
  margin-bottom: 1rem;
}

label {
  margin: 5px
}

.p-field-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.p-field-checkbox label {
  margin-left: 0.5rem;
}

ul {
  list-style: none;
  padding-left: 0.5rem;


}

.p-d-flex {
  display: flex;
}

.p-jc-end {
  justify-content: flex-end;
}

code {
  padding: .2rem .4rem;
  font-size: 90%;
  color: #bd4147;
  background-color: #f7f7f9;
  border-radius: .25rem;
}
</style>
