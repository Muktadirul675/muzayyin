// composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])

let id = 0

export function useToast() {
  const show = (message, type = 'default', duration = 3000) => {
    const toast = { id: id++, message, type }
    toasts.value.push(toast)

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== toast.id)
    }, duration)
  }

  return {
    toasts,
    show,
    success: (msg, duration) => show(msg, 'success', duration),
    error: (msg, duration) => show(msg, 'error', duration),
    info: (msg, duration) => show(msg, 'info', duration),
  }
}

const toast = useToast()

export { toasts, toast }