// stores/settingsStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api' // your axios instance

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function fetchSettings() {
    loading.value = true
    error.value = null

    try {
      const res = await api.get('/site-settings')
      settings.value = res.data
    } catch (err) {
      error.value = err.response?.data || 'Failed to fetch settings'
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    error,
    fetchSettings,
  }
})