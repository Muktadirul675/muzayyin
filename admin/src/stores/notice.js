// stores/notice.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    notices: [],
    loading: false,
    error: null,
    newText: '',
    newIsActive: true,

    // pagination
    count: 0,
    next: null,
    previous: null,
    offset: 0,
    limit: 10,
  }),

  actions: {
    async fetchNotices() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/notice/', {
          params: {
            offset: this.offset,
            limit: this.limit,
          },
        })
        this.notices = res.data.results
        this.count = res.data.count
        this.next = res.data.next
        this.previous = res.data.previous
      } catch (err) {
        this.error = 'Failed to fetch notices.'
      } finally {
        this.loading = false
      }
    },

    async addNotice() {
      if (!this.newText.trim()) return
      try {
        await api.post('/notice/', {
          text: this.newText,
          is_active: this.newIsActive,
        })
        this.newText = ''
        this.newIsActive = true
        this.offset = 0
        await this.fetchNotices()
      } catch (err) {
        this.error = 'Failed to add notice.'
      }
    },

    async toggleNotice(id, currentStatus) {
      try {
        await api.patch(`/notice/${id}/`, {
          is_active: !currentStatus,
        })
        await this.fetchNotices()
      } catch (err) {
        this.error = 'Failed to update notice.'
      }
    },

    goToPage(page) {
      this.offset = (page - 1) * this.limit
      this.fetchNotices()
    },

    nextPage() {
      if (this.next) {
        this.offset += this.limit
        this.fetchNotices()
      }
    },

    prevPage() {
      if (this.previous) {
        this.offset -= this.limit
        this.fetchNotices()
      }
    },
  },

  getters: {
    currentPage: (state) => Math.floor(state.offset / state.limit) + 1,
    totalPages: (state) => Math.ceil(state.count / state.limit),
  },
})