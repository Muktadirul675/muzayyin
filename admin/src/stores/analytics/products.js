// stores/analytics/products.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useProductAnalyticsStore = defineStore('productAnalytics', {
  state: () => ({
    report: [],
    performance: [],
    startDate: '',
    endDate: '',
    showAll: false,
    loading: false,
    error: null,
  }),
  actions: {
    clear() {
      this.startDate = ''
      this.endDate = ''
    },
    async fetchReport() {
      this.loading = true
      const params = {}
      if (this.startDate) params.start = this.startDate
      if (this.endDate) params.end = this.endDate

      try {
        const res = await api.get('/analytics/products/report/', { params })
        this.report = res.data
      } catch (err) {
        this.error = 'Failed to load product report'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchPerformance() {
      this.loading = true
      const params = {}
      if (this.startDate) params.start = this.startDate
      if (this.endDate) params.end = this.endDate
      try {
        const res = await api.get('/analytics/products/performance/', { params })
        this.performance = res.data
      } catch (err) {
        this.error = 'Failed to load product performance'
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  }
})