export function useConfirmation() {
  // const { vueApp } = useNuxtApp()
  // const confirm = vueApp.config.globalProperties.$confirm
  const confirm = useConfirm()
  const { showSuccessMessage, showInfoMessage, showErrorMessage,} = useMessages()

  // eslint-disable-next-line unused-imports/no-unused-vars
  function doNothing(id?: any) {
  }

  function confirmDelete(idToDelete: any, acceptCallback: (id: any) => void, warningText = 'Удалить?', rejectCallback: (id: any) => void = doNothing) {
    return confirm.require({
      message: warningText,
      header: 'Вы уверены',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Отмена',
      acceptLabel: 'Удалить',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await acceptCallback(idToDelete)
          showSuccessMessage('Успех', `Строка с ID ${idToDelete} удалена`)
        } catch (e) {
          showErrorMessage('Ошибка', `Ошибка при удалении ID ${idToDelete}.  + (e.data.message ?? e)`)
        }

      },
      reject: () => {
        showInfoMessage('Отмена', 'Удаление отменено')
        rejectCallback(idToDelete)
      },
    })
  }

  function confirmAction(acceptCallback: () => void, rejectCallback: () => void = doNothing, message: string = 'Вы уверены?', header: string = 'Внимание', acceptButtonClass = 'p-button-success') {
    confirm.require({
      message,
      header,
      icon: 'pi pi-info-circle',
      rejectLabel: 'Отмена',
      acceptLabel: 'Да',
      rejectClass: 'p-button-secondary p-button-outlined',
      acceptClass: acceptButtonClass,
      accept: () => {
        acceptCallback()
      },
      reject: () => {
        rejectCallback()
        showInfoMessage('Заказ не записан на сервер')
      },
    })
  }

  return { confirmDelete, confirmAction }
}
