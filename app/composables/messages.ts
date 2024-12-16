import type { ToastMessageOptions } from 'primevue/toast'
import { useToast } from '#imports'

export enum MessageSeverity {
  SUCCESS = 'success',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export function useMessages() {
  // const { vueApp } = useNuxtApp()
  // const toast = vueApp.config.globalProperties.$toast
  const toast = useToast()

  function showMessage(severity: ToastMessageOptions['severity'], summary: string, detail: string, life: number = 10000) {
    toast.add({ severity, summary, detail, life })
  }

  function showSuccessMessage(summary: string, detail: string = summary, life: number = 3000) {
    showMessage(MessageSeverity.SUCCESS, summary, detail, life)
  }

  function showInfoMessage(summary: string, detail: string = summary, life: number = 3000) {
    showMessage(MessageSeverity.INFO, summary, detail, life)
  }

  function showWarnMessage(summary: string, detail: string = summary, life: number = 10000) {
    showMessage(MessageSeverity.WARN, summary, detail, life)
  }

  function showErrorMessage(summary: string, detail: string = summary, life: number = 10000) {
    showMessage(MessageSeverity.ERROR, summary, detail, life)
  }
  function add(params:{severity: ToastMessageOptions['severity'], summary: string, detail: string, life?: number, group?: string}, life: number = 10000) {

    if (!params.life) {
      if (params.severity == MessageSeverity.SUCCESS) {
        params.life = 3000
      } else {
        params.life = life;
      }
    }
    toast.add(params)
  }

  return { showSuccessMessage, showInfoMessage, showWarnMessage, showErrorMessage, add }
}
