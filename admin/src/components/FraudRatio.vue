<template>
  <div class="w-full flex items-center justify-start">
    <!-- Loading or Error -->
    <div v-if="isLoading" class="text-gray-500 flex items-center gap-1">
      <i class="pi pi-spin pi-spinner text-blue-500"></i> Loading...
    </div>
    <div v-else-if="typeof data !== 'object'" class="text-red-600 text-center">{{ data }}</div>

    <div v-else class="flex items-center gap-2">
      <!-- Circular Progress -->
      <div class="relative w-10 h-10">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="gray"
            stroke-opacity="0.2"
            stroke-width="10"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            :stroke="color"
            stroke-width="10"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="strokeDashArray"
            stroke-dashoffset="0"
          />
        </svg>
        <!-- <div class="absolute inset-0 flex items-center justify-center font-semibold text-gray-700">
          {{ summary.success_ratio || 0 }}%
        </div> -->
      </div>

      <!-- Summary Text -->
      <div class="text-sm text-gray-700 space-y-1">
          <p><strong>Success:</strong> {{ ratio }}%</p>
        <p><strong>Orders:</strong> {{ summary.success_parcel || 0 }} / {{ summary.total_parcel || 0  }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, toRef } from 'vue'
import axios from 'axios'

const props = defineProps({
  number: {
    type: String,
    required: true
  }
})

const number = toRef(props, 'number')
const data = ref(null)
const isLoading = ref(true)

const api_key = 'hc7ItT27pJ5KsA37oPmfzh7QOVHaRr5vBlNLGQxkzQaqsrR7jdhTtJZMnPlX'

const fetchFraudRatio = async () => {
  if (!number.value) return
  try {
    isLoading.value = true
    const res = await axios.post(
      `https://bdcourier.com/api/courier-check?phone=${number.value}`,
      {},
      { headers: { Authorization: `Bearer ${api_key}` } }
    )
    data.value = res.data
  } catch (e) {
    data.value = e.message
  } finally {
    isLoading.value = false
  }
}

watch(number, () => {
  if (number.value.length >= 11) fetchFraudRatio()
}, { immediate: true })

const summary = computed(() => data.value?.courierData?.summary || {})
const ratio = computed(() => Number(summary.value.success_ratio) || 0)
const strokeDashArray = computed(() => `${(ratio.value / 100) * 283} 283`)
const color = computed(() => {
  if (ratio.value >= 80) return '#22c55e'   // green
  if (ratio.value >= 50) return '#facc15'   // yellow
  return '#ef4444'                          // red
})
</script>