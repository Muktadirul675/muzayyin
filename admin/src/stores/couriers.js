// stores/couriers.js
import { defineStore } from 'pinia'
import api from '@/services/api'
import { handleError } from '@/services/errors'

export const useCourierStore = defineStore('courier', {
  state: () => ({
    couriers: [],
    loading: false,
    selected: [],
    filters: {
      search: '',
      city_id: '',
      zone_id: '',
    },
    sendingStatus: {}, // key: orderId, value: 'sending' | 'error'
    sendingErrors: {},  // key: orderId, value: error message
  }),

  getters: {
    allSelected(state) {
      return state.couriers.length && state.selected.length === state.couriers.length
    },
  },

  actions: {
    async fetchCouriers() {
      this.loading = true
      try {
        const params = {
          search: this.filters.search || undefined,
          'order__city_id': this.filters.city_id || undefined,
          'order__zone_id': this.filters.zone_id || undefined,
        }
        const res = await api.get('/orders/ready-for-courier/', { params })
        this.couriers = res.data
        this.selected = [] // reset selection
        this.sendingStatus = {}
        this.sendingErrors = {}
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    toggleSelection(id) {
      this.selected.includes(id)
        ? (this.selected = this.selected.filter(i => i !== id))
        : this.selected.push(id)
    },

    toggleAll() {
      if (this.allSelected) {
        this.selected = []
      } else {
        this.selected = this.couriers.map(c => c.id)
      }
    },

    async sendSelectedToCourier() {
      for (const id of this.selected) {
        this.sendingStatus[id] = 'sending'
        this.sendingErrors[id] = null
        const order = this.couriers.find(c=>c.id === id).order
        // console.log(order)
        // return
        try {
          await api.post(`/orders/${order.id}/ship/`)
          this.couriers = this.couriers.filter(o => o.id !== id)
          this.selected = this.selected.filter(sel => sel !== id)
          delete this.sendingStatus[id]
          delete this.sendingErrors[id]
        } catch (err) {
          handleError(err)
          this.sendingStatus[id] = 'error'
          this.sendingErrors[id] = err?.response.data.message || 'Failed to send'
        }
      }
    }
  }
})