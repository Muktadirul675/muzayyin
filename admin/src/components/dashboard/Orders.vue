<template>
  <div class="flex flex-col gap-2">
    <section class="w-full max-w-[90vw] mx-auto py-8 flex flex-col lg:flex-row gap-8">
      <!-- Left: Summary Cards (Two vertical stacks of 5 cards) -->
      <div class="flex flex-col md:flex-row gap-1 flex-wrap lg:flex-row lg:w-[40%]">
        <template v-if="store.summary">
          <!-- Group 1 -->
          <div class="flex flex-col gap-4 w-full lg:w-[calc(50%-10px)]">
            <div v-for="key in statusKeys.slice(0, 5)" :key="key"
              class="flex items-center space-x-4 p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div :class="['p-3 rounded-lg text-white', colorBgMap[key] || 'bg-gray-500']">
                <component :is="iconMap[key]" class="w-6 h-6" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-700 capitalize tracking-wide">
                  {{ key.replace('_', ' ') }}
                </p>
                <p :class="['text-xl font-bold', colorMap[key] || 'text-gray-900']">
                  {{ store.summary[key] }}
                </p>
              </div>
            </div>
          </div>

          <!-- Group 2 -->
          <div class="flex flex-col gap-4 w-full lg:w-[calc(50%-10px)]">
            <div v-for="key in statusKeys.slice(5)" :key="key"
              class="flex items-center space-x-4 p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div :class="['p-3 rounded-lg text-white', colorBgMap[key] || 'bg-gray-500']">
                <component :is="iconMap[key]" class="w-6 h-6" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-700 capitalize tracking-wide">
                  {{ key.replace('_', ' ') }}
                </p>
                <p :class="['text-xl font-bold', colorMap[key] || 'text-gray-900']">
                  {{ store.summary[key] }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Right: Filters + Chart -->
      <div class="flex-1 space-y-6">
        <!-- Filters -->
        <div class="flex flex-wrap gap-4 items-center">
          <button @click="today"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition">
            Today
          </button>
          <button @click="yesterday"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition">
            Yesterday
          </button>
          <input type="date" v-model="store.startDate"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <input type="date" v-model="store.endDate"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          <button @click="apply"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition">
            Apply
          </button>
          <button v-if="store.startDate || store.endDate" @click="clear"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition">Clear</button>
        </div>

        <!-- Chart -->
        <div class="bg-white border border-gray-300 rounded-lg p-6 shadow-sm" style="height: 400px;">
          <LineChart v-if="store.report.length" :chartData="lineData" />
          <p v-else class="text-center text-gray-500 text-sm mt-24">No data available for selected range.</p>
        </div>
      </div>
    </section>
    <div class="w-full max-w-[90vw] mx-auto py-8 flex flex-col lg:flex-row gap-8">
      <!-- Chart: Order Origins (Pie) -->
      <div class="bg-white flex-1 border border-gray-300 rounded-lg p-6 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Order Origins</h3>
        <PieChart v-if="originData.length" :chartData="pieData" />
        <p v-else class="text-center text-gray-500 text-sm py-16">No origin data available.</p>
      </div>

      <!-- Chart: Top Ordered Products (Bar) -->
      <div class="bg-white flex-2 border border-gray-300 rounded-lg shadow-sm p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-2 ">Top Confirmed Products</h3>
        <div class="divide-y space-y-2 divide-gray-300" v-if="store.productOrdersReport.length">
          <template v-for="product in store.productOrdersReport" :key="product.id">
            <div v-if="product.order_count > 0" class="flex p-3 items-center gap-2">
              <img :src="`${BACKEND_URL}${product.image.image}`" l0ading="lazy" alt="" class="rounded-md w-18 h-18">
              <div class="text-lg font-semibold">
                {{ product.name }}
              </div>
              <div class="ms-auto">
                {{ product.order_count }}
              </div>
            </div>
          </template>
        </div>
        <p v-else class="text-center text-gray-500 text-sm py-16">No product order data available.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useOrdersAnalyticsStore } from '@/stores/analytics/orders'
import LineChart from '@/components/charts/LineChart.vue'

import {
  ShoppingCartIcon,
  CheckCircleIcon,
  ClockIcon,
  PauseCircleIcon,
  TruckIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CubeIcon,
} from '@heroicons/vue/24/solid'
import PieChart from '../charts/PieChart.vue'
import BarChart from '../charts/BarChart.vue'

const store = useOrdersAnalyticsStore()

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

async function apply() {
  try {
    await Promise.all([
      store.fetchSummary(),
      store.fetchReport(),
      store.fetchOriginsReport(),
      store.fetchProductOrdersReport()
    ])
  } catch (err) {
    console.error('Failed to fetch analytics:', err)
  }
}

function formatDate(date) {
  return date.toISOString().split('T')[0] // returns "YYYY-MM-DD"
}

async function today() {
  const now = new Date()
  const dateStr = formatDate(now)

  store.startDate = dateStr
  store.endDate = dateStr
  apply()
}

async function yesterday() {
  const date = new Date()
  date.setDate(date.getDate() - 1)

  const dateStr = formatDate(date)

  store.startDate = dateStr
  store.endDate = dateStr
  apply()
}
function clear() {
  store.clear()
  apply()
}

const originData = computed(() => Object.entries(store.originsReport || {}))

const pieData = computed(() => ({
  labels: originData.value.map(([origin]) => origin),
  datasets: [
    {
      data: originData.value.map(([, count]) => count),
      backgroundColor: [
        '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'
      ],
    }
  ]
}))

const barData = computed(() => ({
  labels: store.productOrdersReport.map(p => p.name),
  datasets: [
    {
      label: 'Orders',
      data: store.productOrdersReport.map(p => p.order_count),
      backgroundColor: '#4F46E5'
    }
  ]
}))

onMounted(() => {
  today()
})

const labels = computed(() => store.report.map(r => r.day))
const ordersData = computed(() => store.report.map(r => r.orders))
const rejectionsData = computed(() => store.report.map(r => r.cancellations))

const lineData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Orders',
      data: ordersData.value,
      borderColor: '#4F46E5', // Indigo-600
      backgroundColor: '#C7D2FE', // Indigo-200 light fill
      tension: 0.4,
      fill: true,
      pointRadius: 3,
    },
    {
      label: 'Cancellations',
      data: rejectionsData.value,
      borderColor: '#DC2626', // Red-600
      backgroundColor: '#FCA5A5', // Red-300 light fill
      tension: 0.4,
      fill: true,
      pointRadius: 3,
    },
  ],
}))

const colorMap = {
  pending: 'text-gray-600',
  confirmed: 'text-blue-600',
  processing: 'text-yellow-600',
  hold: 'text-orange-600',
  shipped: 'text-cyan-600',
  delivered: 'text-green-600',
  cancelled: 'text-red-600',
  returned: 'text-pink-600',
  failed: 'text-rose-600',
  total: 'text-indigo-600',
}

const colorBgMap = {
  pending: 'bg-gray-400',
  confirmed: 'bg-blue-500',
  processing: 'bg-yellow-400',
  hold: 'bg-orange-500',
  shipped: 'bg-cyan-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  returned: 'bg-pink-500',
  failed: 'bg-rose-500',
  total: 'bg-indigo-500',
}

const iconMap = {
  pending: ClockIcon,
  confirmed: CheckCircleIcon,
  processing: ShoppingCartIcon,
  hold: PauseCircleIcon,
  shipped: TruckIcon,
  delivered: TruckIcon,
  cancelled: XCircleIcon,
  returned: ArrowPathIcon,
  failed: ExclamationCircleIcon,
  total: CubeIcon,
}

const statusKeys = [
  'pending',
  'confirmed',
  'processing',
  'hold',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
  'failed',
  'total',
]
</script>