// stores/orderStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'
import { toast } from '@/services/toast'
import { beep } from '@/services/beep'
import { handleError } from '@/services/errors'

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
    search: '',
    filterStatus: 'pending',
    filters: {
      discount_min: null,
      discount_max: null,
      created_after: null,
      created_before: null,
    },
    limit: 10,
    offset: 0,
    totalCount: 0,
    selectedOrderIds: [],
    socket: null, // WebSocket instance
    processing_orders: []
  }),

  getters: {
    currentPage(state) {
      return Math.floor(state.offset / state.limit) + 1
    },
    totalPages(state) {
      return Math.ceil(state.totalCount / state.limit)
    },
    areAllSelected(state) {
      return (
        state.orders.length > 0 &&
        state.orders.every(order => state.selectedOrderIds.includes(order.id))
      )
    },
  },

  actions: {
    async fetchOrders() {
      this.loading = true
      this.error = null

      const params = {
        limit: this.limit,
        offset: this.offset,
      }

      if (this.search.trim()) {
        params.search = this.search.trim()
      }

      if (this.filterStatus) {
        params.status = this.filterStatus
      }

      for (const [key, value] of Object.entries(this.filters)) {
        if (value !== null && value !== '') {
          params[key] = value
        }
      }

      for (const [key, value] of Object.entries(this.filters)) {
        if (value !== null && value !== '') {
          params[key] = value
        }
      }

      try {
        const response = await api.get('/orders/', { params })
        this.orders = response.data.results
        this.totalCount = response.data.count
        this.clearSelection()
      } catch (err) {
        this.error = err.response?.data || 'Failed to fetch orders'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // Pagination
    goToPage(page) {
      const newOffset = (page - 1) * this.limit
      if (newOffset >= 0 && newOffset < this.totalCount) {
        this.offset = newOffset
        this.fetchOrders()
      }
    },
    nextPage() {
      this.goToPage(this.currentPage + 1)
    },
    prevPage() {
      this.goToPage(this.currentPage - 1)
    },

    // Selection
    toggleOrderSelection(id) {
      if (this.selectedOrderIds.includes(id)) {
        this.selectedOrderIds = this.selectedOrderIds.filter(oid => oid !== id)
      } else {
        this.selectedOrderIds.push(id)
      }
    },
    toggleSelectAll() {
      if (this.areAllSelected) {
        this.selectedOrderIds = []
      } else {
        this.selectedOrderIds = this.orders.map(o => o.id)
      }
    },
    clearSelection() {
      this.selectedOrderIds = []
    },

    async deleteOrder(orderId) {
      this.processing_orders.push(orderId)
      try {
        await api.delete(`/orders/${orderId}/`)

        // Remove order from local state
        this.orders = this.orders.filter(order => order.id !== orderId)
        this.totalCount -= 1
        this.selectedOrderIds = this.selectedOrderIds.filter(id => id !== orderId)
      } catch (err) {
        this.error = err.response?.data || 'Failed to delete order'
        console.error(err)
      } finally {
        this.processing_orders = this.processing_orders.filter(id => id !== orderId)
      }
    },

    async changeOrderStatus(orderId, newStatus) {
      this.processing_orders.push(orderId)
      try {
        const response = await api.patch(`/orders/${orderId}/`, {
          status: newStatus
        })

        // Update the order in local state
        this.orders = this.orders.map(order =>
          order.id === orderId ? response.data : order
        )
      } catch (err) {
        handleError(err)
        this.error = err.response?.data || 'Failed to change order status'
        toast.error(this.error)
        console.error(err)
      } finally {
        this.processing_orders = this.processing_orders.filter(id => id !== orderId)
      }
    },

    // ð WebSocket integration
    initOrderSocket() {
      if (this.socket) return

      this.socket = new WebSocket(`${'wss'}://${import.meta.env.VITE_BACKEND_URL_BASE}/ws/orders/`)

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type !== 'order') return

        const { action, data } = message

        switch (action) {
          case 'order.create':
            if (!this.orders.some(o => o.id === data.id)) {
              this.orders.unshift(data)
              this.totalCount += 1
              toast.info("New Order!", 500)
              beep()
            }
            break

          case 'order.update':
            this.orders = this.orders.map(o => (o.id === data.id ? data : o))
            break

          case 'order.delete':
            this.orders = this.orders.filter(o => o.id !== data.id)
            this.totalCount -= 1
            break
        }
      }

      this.socket.onclose = () => {
        this.socket = null
        console.warn('Order WebSocket closed')
      }

      this.socket.onerror = (err) => {
        console.error('Order WebSocket error:', err)
      }
    },
  },
})
