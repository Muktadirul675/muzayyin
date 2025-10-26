// src/stores/feed.js
import { defineStore } from 'pinia'
import api from '@/lib/api'

export const useFeedStore = defineStore('feed', {
  state: () => ({
    feed: [],
    sections: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchFeed() {
      this.loading = true
      this.error = null

      try {
        const response = await api.get('/feed/')
        this.feed = response.data
        this.sections = this.feed.filter(
          (section) =>
            section.type !== 'notice' &&
            section.type !== 'navbar' &&
            section.type !== 'categories_bar' &&
            section.type !== 'footer'
        )
      } catch (err) {
        this.error = err.response?.data?.detail || 'Failed to load feed'
        console.error(err)
      } finally {
        this.loading = false
      }
    },
  },
})