<template>
  <section class="max-w-[90vw] mx-auto py-8">
    <!-- Heading -->
    <h2 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
      <i class="pi pi-history text-indigo-600 text-lg"></i>
      Activity Logs
    </h2>

    <!-- Filters -->
    <div class="flex flex-wrap items-end gap-4 mb-6">
      <div>
        <label class="block text-sm text-gray-600 mb-1">Start Date</label>
        <div class="relative">
          <i class="pi pi-calendar absolute left-3 top-3 text-gray-400 text-sm"></i>
          <input
            type="date"
            v-model="store.filters.start_date"
            class="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm w-40"
          />
        </div>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">End Date</label>
        <div class="relative">
          <i class="pi pi-calendar absolute left-3 top-3 text-gray-400 text-sm"></i>
          <input
            type="date"
            v-model="store.filters.end_date"
            class="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm w-40"
          />
        </div>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">User</label>
        <div class="relative">
          <i class="pi pi-user absolute left-3 top-3 text-gray-400 text-sm"></i>
          <input
            type="text"
            v-model="store.filters.user"
            placeholder="username"
            class="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm w-40"
          />
        </div>
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">Action</label>
        <div class="relative">
          <i class="pi pi-cog absolute left-3 top-3 text-gray-400 text-sm"></i>
          <input
            type="text"
            v-model="store.filters.action"
            placeholder="e.g. product.update"
            class="border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm w-52"
          />
        </div>
      </div>

      <!-- Apply Filters Button -->
      <button
        @click="applyFilters"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 cursor-pointer rounded-md text-sm flex items-center gap-2"
      >
        <i class="pi pi-filter"></i>
        Apply
      </button>
    </div>

    <!-- Logs Table -->
    <div class="bg-white border border-gray-300 rounded-lg shadow-sm overflow-x-auto">
      <table class="min-w-full table-auto text-sm text-left">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-gray-600 font-semibold">User</th>
            <th class="px-4 py-3 text-gray-600 font-semibold">Action</th>
            <th class="px-4 py-3 text-gray-600 font-semibold">Message</th>
            <th class="px-4 py-3 text-gray-600 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="activity in store.activities"
            :key="activity.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-2">
              {{ activity.user?.username || 'System' }}
            </td>
            <td class="px-4 py-2">
              <span
                class="inline-block px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
              >
                {{ activity.action }}
              </span>
            </td>
            <td class="px-4 py-2 text-gray-700">{{ activity.message }}</td>
            <td class="px-4 py-2 text-gray-500">
              {{ formatDate(activity.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="!store.activities.length && !store.isLoading" class="p-6 text-gray-500 text-center">
        No activity logs found.
      </div>

      <!-- Loading -->
      <div v-if="store.isLoading" class="p-6 text-center text-indigo-600 font-medium animate-pulse flex justify-center items-center gap-2">
        <i class="pi pi-spinner pi-spin text-xl"></i>
        Loading...
      </div>

      <!-- Load More Button -->
      <div v-if="store.next && !store.isLoading" class="p-4 text-center">
        <button
          @click="store.loadNextPage"
          class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer rounded-md border border-gray-300 flex items-center gap-2"
        >
          <i class="pi pi-angle-double-down"></i>
          Load More
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useActivityStore } from '@/stores/activities'
import { useHead } from '@vueuse/head'
import { onBeforeUnmount } from 'vue'

useHead({title:'Logs - Muzayyin.com.bd'})

const store = useActivityStore()

onBeforeUnmount(() => {
  store.disconnectWebSocket()
})

function applyFilters() {
  store.fetchActivities()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString()
}
</script>