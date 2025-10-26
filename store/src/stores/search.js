// stores/searchStore.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '@/lib/api' // your axios instance
import debounce from 'lodash/debounce'
import { useToast } from '@/lib/toast'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref([])
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const limit = ref(10)
  const offset = ref(0)
  const loading = ref(false)
  const toast = useToast()
  const hasMore = computed(() => !!next.value)

  const fetchResults = async () => {
    if (!query.value.trim()) {
      results.value = []
      count.value = 0
      next.value = null
      previous.value = null
      offset.value = 0
      return
    }

    loading.value = true
    try {
      const res = await api.get('/products', {
        params: {
          search: query.value,
          limit: limit.value,
          offset: offset.value
        }
      })

      if (offset.value === 0) {
        results.value = res.data.results
      } else {
        results.value = [...results.value, ...res.data.results]
      }

      count.value = res.data.count
      next.value = res.data.next
      previous.value = res.data.previous
    } catch (err) {
      console.error('Search failed:', err)
      toast.error(err.message)
    } finally {
      loading.value = false
    }
  }

  // â Debounced version of fetchResults (400ms delay)
  const debouncedFetchResults = debounce(() => {
    offset.value = 0
    fetchResults()
  }, 400)

  watch(query, () => {
    debouncedFetchResults()
  })

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return
    offset.value += limit.value
    await fetchResults()
  }

  return {
    query,
    results,
    count,
    next,
    previous,
    loading,
    hasMore,
    loadMore,
    setQuery: (val) => {
      query.value = val
    }
  }
})