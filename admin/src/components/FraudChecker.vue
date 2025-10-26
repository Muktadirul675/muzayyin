<template>
  <div class="w-full my-2 p-4 bg-white shadow rounded border border-gray-200">
    <!-- Loading or Error -->
    <div v-if="isLoading" class="text-gray-500 text-center flex items-center justify-center w-full"> 
      <i class="pi pi-spin pi-spinner text-blue-500 me-2"></i>
      Loading...</div>
    <div v-else-if="typeof data !== 'object'" class="text-red-600 text-center">{{ data }}</div>

    <!-- Success -->
    <div v-else>
      <h2 class="text-xl font-semibold mb-4">Courier Fraud Report</h2>

      <!-- Summary -->
      <div class="text-sm text-gray-700 mb-4 flex flex-wrap gap-4">
        <p><strong>Total:</strong> {{ summary.total_parcel }}</p>
        <p><strong>Success:</strong> {{ summary.success_parcel }}</p>
        <p><strong>Cancelled:</strong> {{ summary.cancelled_parcel }}</p>
        <p><strong>Success Ratio:</strong> {{ summary.success_ratio }}%</p>
      </div>

      <!-- Courier Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full border border-gray-300 text-sm text-gray-800">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 text-left">Courier</th>
              <th class="p-2 text-center">Total</th>
              <th class="p-2 text-center">Success</th>
              <th class="p-2 text-center">Cancelled</th>
              <th class="p-2 text-center">Success Ratio</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(courier, key) in filteredCouriers" :key="key" class="hover:bg-gray-50 transition">
              <td class="p-2 flex items-center gap-2">
                <img :src="courier.logo" :alt="courier.name" class="w-8 h-8 object-contain" />
                {{ courier.name }}
              </td>
              <td class="p-2 text-center">{{ courier.total_parcel }}</td>
              <td class="p-2 text-center">{{ courier.success_parcel }}</td>
              <td class="p-2 text-center">{{ courier.cancelled_parcel }}</td>
              <td class="p-2 text-center">{{ courier.success_ratio }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup>
import axios from 'axios'
import { ref, onMounted, computed, watch, toRef } from 'vue'

const props = defineProps({
  number: String
})

const number = toRef(props, 'number') // â make 'number' reactive
const data = ref(null)
const isLoading = ref(true)

const api_key = 'hc7ItT27pJ5KsA37oPmfzh7QOVHaRr5vBlNLGQxkzQaqsrR7jdhTtJZMnPlX'

async function checkFraud() {
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
  if (number.value.length >= 11) checkFraud()
}, { immediate: true })

const summary = computed(() => data.value?.courierData?.summary || {})
const filteredCouriers = computed(() => {
  const all = { ...data.value?.courierData }
  delete all.summary
  return all
})
</script>