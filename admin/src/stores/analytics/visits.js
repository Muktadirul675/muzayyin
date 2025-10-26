import { defineStore } from 'pinia'
import api from '@/services/api'

export const useVisitsAnalyticsStore = defineStore('visitsAnalytics', {
  state: () => ({
    today: null,
    active: null,
    sources: null,
    trendingProduct: null,
    loading: false 
  }),
  getters: {
    trendingCard(state) {
      const path = state.today?.most_visited_page?.path
      if (!path) return null

      if (state.trendingProduct) {
        return {
          name: state.trendingProduct.name,
          image:
            state.trendingProduct.images?.[0]?.image ||
            'https://via.placeholder.com/100?text=Product',
        }
      }

      if (path === '/' || path === '/home') {
        return {
          name: 'Home',
          image: 'https://img.icons8.com/ios-filled/100/home.png',
        }
      }

      return {
        name: 'Unknown Page',
        image: 'https://img.icons8.com/ios/100/web.png',
      }
    },
  },
  actions: {
    clear(){
      this.startDate = ''
      this.endDate = ''
    },
    async fetchAll() {
      this.loading = true
      const [todayRes, activeRes, sourcesRes] = await Promise.all([
        api.get('/visits/today/'),
        api.get('/visits/active/'),
        api.get('/visits/sources/'),
      ])
      this.today = todayRes.data
      this.active = activeRes.data
      this.sources = sourcesRes.data

      const path = this.today?.most_visited_page?.path
      if (path && (!path?.startsWith('/category') || !path?.startsWith('/cart') || !path?.startsWith('/checkout') && path !== '/')){
        const slug = path.split('/').pop()
        try {
          const res = await api.get(`/products/${slug}`)
          this.trendingProduct = res.data
        } catch (e) {
          console.warn('Could not fetch product', e)
        }
      }
      this.loading = false
    },
  },
})
