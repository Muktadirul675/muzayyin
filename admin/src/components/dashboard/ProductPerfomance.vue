<template>
    <section class="w-full max-w-[90vw] mx-auto py-8">
        <!-- Filters -->
        <div class="flex flex-wrap gap-4 items-center mb-6">
            <button @click="today"
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition">
                Today
            </button>
            <button @click="yesterday"
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition">
                Yesterday
            </button>
            <input type="date" v-model="store.startDate"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:outline-none" />
            <input type="date" v-model="store.endDate"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-indigo-500 focus:outline-none" />
            <button @click="apply"
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition">
                Apply
            </button>
            <button v-if="store.startDate || store.endDate" @click="clear"
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition">Clear</button>
        </div>

        <!-- Main Grid Layout -->
        <div class="flex flex-col lg:flex-row gap-8">
            <!-- Performance Left Panel -->
            <div class="bg-white border border-gray-300 p-6 rounded-xl shadow-sm w-full lg:w-1/3">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Top Products by Revenue</h2>
                <div class="space-y-5">
                    <div v-for="item in visibleProducts" :key="item.sku" class="space-y-1">
                        <div class="flex justify-between text-sm font-medium text-gray-700">
                            <span class="truncate">{{ item.product }} ({{ item.sku }})</span>
                            <span class="text-gray-900 font-semibold">
                                <!-- {{ item.amount.toLocaleString() }} -->
                                <BDT :amount="item.amount" />
                            </span>
                        </div>
                        <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div class="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full"
                                :style="{ width: item.percentage + '%' }"></div>
                        </div>
                    </div>
                </div>

                <div v-if="store.performance.length > 5" class="mt-5 text-right">
                    <button @click="store.showAll = !store.showAll"
                        class="text-indigo-600 text-sm font-medium hover:underline">
                        {{ store.showAll ? 'Show less' : 'Show more' }}
                    </button>
                </div>
            </div>

            <!-- Chart Right Panel -->
            <div class="bg-white border border-gray-300 p-6 rounded-xl shadow-sm flex-1 overflow-x-auto">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Sales Count by Product</h2>
                <div class="w-full h-[500px]">
                    <div v-if="store.report.length" class="divide-y divide-gray-300">
                        <template v-for="product in store.report" :key="product.sku">
                            <div class="flex items-center p-3 gap-2">
                                <img :src="`${BACKEND_URL}${product.image}`" alt="" class="w-18 h-18 rounded">
                                <div class="text-lg font-semibold">{{ product.product }}</div>
                                <div class="ms-auto">
                                    {{ product.count }}
                                </div>
                            </div>
                        </template>
                    </div>
                    <p v-else class="text-gray-500 text-sm mt-24 text-center">
                        No data available for selected range.
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useProductAnalyticsStore } from '@/stores/analytics/products'
import BarChart from '@/components/charts/BarChart.vue'
import BDT from '../ui/BDT.vue'

const store = useProductAnalyticsStore()

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

async function apply(){
    await Promise.all([
        store.fetchReport(),
        store.fetchPerformance()
    ])
}

onMounted(() => {
    apply()
})

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

const labels = computed(() => store.report.map(r => r.product))
const sales = computed(() => store.report.map(r => r.count))

const barData = computed(() => ({
    labels: labels.value,
    datasets: [
        {
            label: 'Sales Count',
            data: sales.value,
            backgroundColor: '#4F46E5',
            borderRadius: 6,
            barThickness: 28,
        },
    ],
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: { color: '#4B5563' }, // text-gray-700
            grid: { color: '#E5E7EB' },  // border-gray-300
        },
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#4B5563' },
            grid: { color: '#E5E7EB' },
        },
    },
    plugins: {
        legend: {
            labels: { color: '#374151' }, // text-gray-800
        },
    },
}

const visibleProducts = computed(() => {
    return store.showAll ? store.performance : store.performance.slice(0, 5)
})
</script>