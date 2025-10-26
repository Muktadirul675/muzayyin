<template>
  <div>
    <h1 class="text-2xl font-bold flex items-center gap-2 mb-4">
      <i class="pi pi-truck text-indigo-600"></i>
      Ready for Courier
    </h1>

    <!-- Search and Filters -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <input v-model="store.filters.search" @input="store.fetchCouriers" type="text"
        placeholder="Search by name, phone or address"
        class="border bg-white border-gray-300 rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />

      <div class="flex flex-wrap gap-3 items-center">
        <input v-model="store.filters.city_id" @input="store.fetchCouriers" type="number" placeholder="City ID"
          class="border bg-white border-gray-300 rounded px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input v-model="store.filters.zone_id" @input="store.fetchCouriers" type="number" placeholder="Zone ID"
          class="border bg-white border-gray-300 rounded px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500" />

        <button @click="store.fetchCouriers"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer">
          <i class="pi pi-refresh mr-2" /> Refresh
        </button>

        <button @click="store.sendSelectedToCourier" :disabled="!store.selected.length"
          class="bg-green-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <i class="pi pi-send" />
          Ship
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto bg-white rounded shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-slate-700 text-white">
          <tr>
            <th class="pl-4 py-3 text-left w-10">
              <input type="checkbox" :checked="store.allSelected" @change="store.toggleAll()" />
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Address</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">City ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Zone ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created At</th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="store.loading">
            <td colspan="7" class="px-6 py-4 text-center text-indigo-600">Loading couriers...</td>
          </tr>

          <tr v-if="!store.loading && !store.couriers.length">
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">Nothing to ship</td>
          </tr>

          <tr v-for="item in store.couriers" :key="item.id" class="hover:bg-gray-50 cursor-pointer"
            @click="handleRowClick($event, item.order.id)">
            <td class="pl-4 py-4 w-10" @click.stop>
              <div v-if="store.sendingStatus[item.id] === 'sending'" class="text-indigo-600">
                <i class="pi pi-cog pi-spin"></i>
              </div>
              <div v-else>
                <input type="checkbox" :checked="store.selected.includes(item.id)"
                  @change="store.toggleSelection(item.id)" />
              </div>
            </td>

            <td class="px-6 py-4 text-sm text-gray-900">
              {{ item.order.full_name }}
              <template v-if="item && store.sendingErrors[item.id]">
                <div class="text-sm text-red-600 italic">
                  {{ store.sendingErrors[item.id] }}
                </div>
              </template>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ item.order.phone }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ item.order.shipping_address }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ item.order.city_id }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ item.order.zone_id }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCourierStore } from '@/stores/couriers'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
const router = useRouter()

useHead({
  title: 'Ready For Courier - Muzayyin.com.bd'
})

function handleRowClick(event, orderId) {
  // Avoid navigating if user clicked a checkbox or icon
  const tag = event.target.tagName.toLowerCase()
  const classList = event.target.classList
  if (tag === 'input' || classList.contains('pi-cog') || classList.contains('pi-spin')) return

  router.push(`/orders/${orderId}`)
}

const store = useCourierStore()

onMounted(() => {
  store.fetchCouriers()
})

function formatDate(date) {
  return new Date(date).toLocaleString()
}
</script>