// stores/salesAnalyticsStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useSalesAnalyticsStore = defineStore('salesAnalytics', {
  state: () => ({
    summary: null,
    report: [],
    startDate: '',
    endDate: '',
    loading: false,
    error: null,
  }),
  actions: {
    clear() {
      this.startDate = ''
      this.endDate = ''
    },
    async fetchSummary() {
      try {
        const params = {}
        if (this.startDate) params.start = this.startDate
        if (this.endDate) params.end = this.endDate
        const res = await api.get('/analytics/sales', { params })
        this.summary = res.data
      } catch (e) {
        this.error = e.message
      }
    },

    async fetchSalesReport() {
      this.loading = true
      try {
        const params = {}
        if (this.startDate) params.start = this.startDate
        if (this.endDate) params.end = this.endDate
        const res = await api.get('/analytics/sales/report', { params })
        this.report = res.data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
  }
})