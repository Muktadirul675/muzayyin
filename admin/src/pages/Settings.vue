<template>
  <section class="max-w-[90vw] mx-auto py-10 px-4">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Site Settings</h1>

    <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200 space-y-6">
      <div
        v-for="(value, key) in localSettings"
        :key="key"
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <label class="text-sm font-semibold capitalize text-gray-700">
          {{ formatKey(key) }}
        </label>
        <input
          v-model="localSettings[key]"
          type="text"
          class="border border-gray-300 rounded-md px-3 py-2 w-full sm:max-w-xs text-sm"
        />
      </div>

      <div class="pt-4">
        <button
          @click="submit"
          :disabled="isSubmitting"
          class="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white px-6 py-2 rounded-md text-sm font-semibold transition"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { handleError } from '@/services/errors'
import { toast } from '@/services/toast'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Settings - Muzayyin.com.bd'
})

const settings = ref({})
const localSettings = ref({})
const isSubmitting = ref(false)

onMounted(async () => {
  try {
    const res = await api.get('/site-settings')
    settings.value = res.data
    localSettings.value = { ...res.data }
  } catch (e) {
    console.error('Failed to load site settings', e)
  }
})

function formatKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

async function submit() {
  isSubmitting.value = true
  try {
    await api.post('/site-settings/update/', localSettings.value)
    settings.value = { ...localSettings.value }
    toast.success("Settings Updated")
  } catch (e) {
    handleError(e)
    console.error('Failed to update site settings:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>