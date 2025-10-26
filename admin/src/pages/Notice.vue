<script setup>
import { onMounted, computed } from 'vue'
import { useNoticeStore } from '@/stores/notice'

const noticeStore = useNoticeStore()

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= noticeStore.totalPages; i++) {
    pages.push(i)
  }
  return pages
})

onMounted(() => {
  noticeStore.fetchNotices()
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Notices</h2>

    <!-- Add Notice Form -->
    <form @submit.prevent="noticeStore.addNotice" class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
      <input
        v-model="noticeStore.newText"
        placeholder="Write a notice..."
        class="flex-1 border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />
      <label class="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          v-model="noticeStore.newIsActive"
          class="rounded border-gray-300 text-indigo-600"
        />
        Active
      </label>
      <button
        type="submit"
        class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        :disabled="!noticeStore.newText.trim()"
      >
        Add
      </button>
    </form>

    <!-- Table -->
    <div class="overflow-x-auto bg-white rounded shadow border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-slate-700 text-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase">Text</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase">Created</th>
            <th class="px-6 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="notice in noticeStore.notices"
            :key="notice.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-pre-line">{{ notice.text }}</td>
            <td class="px-6 py-4">
              <span
                class="px-2 py-1 rounded-full text-xs font-semibold"
                :class="notice.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'"
              >
                {{ notice.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ new Date(notice.created_at).toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-right">
              <button
                @click="noticeStore.toggleNotice(notice.id, notice.is_active)"
                class="text-indigo-600 hover:underline text-sm"
              >
                {{ notice.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>

          <tr v-if="!noticeStore.notices.length && !noticeStore.loading">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">No notices found.</td>
          </tr>
          <tr v-if="noticeStore.loading">
            <td colspan="4" class="px-6 py-4 text-center text-indigo-600">Loading notices...</td>
          </tr>
          <tr v-if="noticeStore.error">
            <td colspan="4" class="px-6 py-4 text-center text-red-600">{{ noticeStore.error }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-4 text-sm">
      <div class="text-gray-700">
        Showing page {{ noticeStore.currentPage }} of {{ noticeStore.totalPages }} ({{ noticeStore.count }} total)
      </div>

      <nav class="space-x-2">
        <button
          @click="noticeStore.prevPage"
          :disabled="!noticeStore.previous || noticeStore.loading"
          class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          @click="noticeStore.goToPage(page)"
          :class="[
            'px-3 py-1 rounded border',
            page === noticeStore.currentPage
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-300 hover:bg-gray-100',
          ]"
          :disabled="noticeStore.loading"
        >
          {{ page }}
        </button>
        <button
          @click="noticeStore.nextPage"
          :disabled="!noticeStore.next || noticeStore.loading"
          class="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>