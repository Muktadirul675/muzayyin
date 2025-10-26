// stores/activity.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [],
    next: null,
    previous: null,
    count: 0,
    isLoading: false,
    filters: {
      start_date: null,
      end_date: null,
      user: '',
      action: ''
    },
    socket: null,
  }),

  actions: {
    async fetchActivities(customParams = {}) {
      this.isLoading = true
      try {
        const params = {
          ...this.filters,
          ...customParams,
        }

        const res = await api.get('/activities/', { params })
        this.activities = res.data.results
        this.count = res.data.count
        this.next = res.data.next
        this.previous = res.data.previous
      } catch (e) {
        console.error('Failed to fetch activities:', e)
      } finally {
        this.isLoading = false
      }
    },

    async loadNextPage() {
      if (!this.next) return
      this.isLoading = true
      try {
        const res = await api.get(this.next)
        this.activities.push(...res.data.results)
        this.next = res.data.next
        this.previous = res.data.previous
      } catch (e) {
        console.error('Failed to load next page:', e)
      } finally {
        this.isLoading = false
      }
    },

    setFilters(filters = {}) {
      this.filters = { ...this.filters, ...filters }
    },

    connectWebSocket() {
      if (this.socket) return

      const wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws'
      const wsUrl = `${'wss'}://${import.meta.env.VITE_BACKEND_URL_BASE}/ws/activities/`
      this.socket = new WebSocket(wsUrl)

      this.socket.onmessage = (event) => {
        try {
          const newActivity = JSON.parse(event.data)
          this.activities.unshift(newActivity)
        } catch (e) {
          console.error('Failed to parse WS activity:', e)
        }
      }

      this.socket.onclose = () => {
        console.warn('Activity WebSocket closed')
        this.socket = null
      }

      this.socket.onerror = (e) => {
        console.error('WebSocket error:', e)
      }
    },

    disconnectWebSocket() {
      if (this.socket) {
        this.socket.close()
        this.socket = null
      }
    },
  },
})