// stores/analytics/ordersAnalyticsStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useOrdersAnalyticsStore = defineStore('ordersAnalyticsStore', {
  state: () => ({
    summary: null,
    report: [],
    originsReport: {},
    productOrdersReport: [],
    startDate: '',
    endDate: '',
    loading: false,
    error: null,
  }),

  actions: {
    clear(){
      this.startDate = ''
      this.endDate = ''
    },
    async fetchSummary() {
      try {
        this.loading = true
        const params = {}
        if (this.startDate) params.start = this.startDate
        if (this.endDate) params.end = this.endDate
        const res = await api.get('/analytics/orders', { params })
        this.summary = res.data
      } catch (err) {
        this.error = err.message || 'Failed to load order summary'
      } finally {
        this.loading = false
      }
    },

    async fetchReport() {
      try {
        this.loading = true
        const params = {}
        if (this.startDate) params.start = this.startDate
        if (this.endDate) params.end = this.endDate
        const res = await api.get('/analytics/orders/report', { params })
        this.report = res.data
      } catch (err) {
        this.error = err.message || 'Failed to load order report'
      } finally {
        this.loading = false
      }
    },

    async fetchOriginsReport() {
      try {
        this.loading = true
        const params = {}
        if (this.startDate) params.start = this.startDate
        if (this.endDate) params.end = this.endDate
        const res = await api.get('/analytics/orders/origins', { params })
        this.originsReport = res.data
      } catch (err) {
        this.error = err.message || 'Failed to load origin report'
      } finally {
        this.loading = false
      }
    },

    async fetchProductOrdersReport() {
      try {
        this.loading = true
        const params = {}
        if (this.startDate) params.start = this.startDate
        if (this.endDate) params.end = this.endDate
        const res = await api.get('/analytics/products/report/orders', { params })
        this.productOrdersReport = res.data
      } catch (err) {
        this.error = err.message || 'Failed to load product orders report'
      } finally {
        this.loading = false
      }
    },
  }
})