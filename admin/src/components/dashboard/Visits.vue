<template>
  <section class="flex w-full max-w-[90vw] mx-auto py-8 gap-8 min-h-[300px]">
    <!-- Left Section -->
    <div class="w-1/5 flex flex-col gap-6">

      <!-- Visits Summary -->
      <div class="flex flex-col gap-4">
        <div class="bg-indigo-600 text-white p-4 rounded-lg shadow-md">
          <div class="text-4xl font-bold">{{ store.today?.total_visits ?? 0 }}</div>
          <div class="text-lg font-semibold">Total Visits Today</div>
        </div>

        <div class="bg-green-600 text-white p-4 rounded-lg shadow-md">
          <div class="text-3xl font-bold">{{ store.active?.active_users ?? 0 }}</div>
          <div class="text-lg font-semibold">Active Users Now</div>
        </div>
      </div>

      <!-- Trending Page Card -->
      <div
        class="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 border border-gray-300 hover:shadow-lg transition-shadow cursor-pointer">
        <img v-if="store.trendingCard?.image" :src="store.trendingCard.image"
          class="w-16 h-16 object-cover rounded-md" />
        <div>
          <div class="text-gray-500 text-xs uppercase font-semibold tracking-wide">Trending Page</div>
          <div class="text-xl font-bold text-gray-800 truncate max-w-[140px]">
            {{ store.trendingCard?.name }}
          </div>
          <div class="text-gray-400 text-sm mt-1 truncate max-w-[140px]">
            {{ store.today?.most_visited_page?.path }}
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Section: Pie Chart -->
    <div class="w-2/5 bg-white rounded-lg shadow-md border border-gray-300 p-6 flex items-center justify-center">
      <PieChart v-if="pieChartData && store.today?.total_visits" :chartData="pieChartData" :chartOptions="pieOptions"
        class="max-w-[300px] max-h-[300px]" />
      <p v-else-if="store.today?.total_visits === 0" class="text-gray-400 italic text-sm">No origin data</p>
      <p v-else class="text-gray-400 italic text-sm">No origin data</p>
    </div>

    <!-- Right Section: Logs -->
    <!-- Right Section: Logs -->
    <div class="w-2/5 bg-white rounded-lg shadow-md p-6 border border-gray-300">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Logs</h2>
        <RouterLink to="/logs" class="text-sm text-indigo-600 hover:underline font-medium">
          See all
        </RouterLink>
      </div>

      <div v-if="activity.activities.length" class="space-y-4">
        <div v-for="log in activity.activities.slice(0, 4)" :key="log.id" class="border-b border-gray-300 pb-2">
          <div class="text-gray-800 font-semibold text-sm">
            {{ log.user?.username || 'System' }}
            <span class="text-gray-500 font-normal"> {{ log.action }}</span>
          </div>
          <div class="text-gray-600 text-sm mt-1">{{ log.message }}</div>
          <div class="text-xs text-gray-400 mt-1">
            {{ new Date(log.created_at).toLocaleString() }}
          </div>
        </div>
      </div>
      <p v-else class="text-gray-400 italic select-none">No logs yet.</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useVisitsAnalyticsStore } from '@/stores/analytics/visits'
import PieChart from '@/components/charts/PieChart.vue'
import { useActivityStore } from '@/stores/activities'

const store = useVisitsAnalyticsStore()
const activity = useActivityStore()

const pieChartData = computed(() => {
  if (!store.sources?.origins) return null
  const origins = store.sources.origins
  return {
    labels: Object.keys(origins),
    datasets: [
      {
        data: Object.values(origins),
        backgroundColor: [
          '#3b82f6', // blue
          '#ef4444', // red
          '#10b981', // green
          '#f59e0b', // yellow
          '#8b5cf6', // purple
          '#ec4899', // pink
        ],
      },
    ],
  }
})

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
}
</script>