// stores/productStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'
import { handleError } from '@/services/errors'
import { toast } from '@/services/toast'

export const useProductStore = defineStore('productStore', {
    state: () => ({
        products: [],
        low_stocks: [],
        unavailables: [],
        loading: false,
        error: null,
        search: '',
        filterStockStatus: 'all',
        limit: 10,
        offset: 0,
        totalCount: 0,
        selectedProductIds: [],
        lowStocksFetched: false,
        lowStockTimeOut : false,
        filters: {
            price_min: null,
            price_max: null,
            stock_min: null,
            stock_max: null,
            created_after: null,
            created_before: null
        },

        socket: null // WebSocket instance
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
                state.products.length > 0 &&
                state.products.every(product => state.selectedProductIds.includes(product.id))
            )
        }
    },

    actions: {
        async fetchProducts() {
            this.loading = true
            this.error = null

            const params = {
                limit: this.limit,
                offset: this.offset
            }

            if (this.search.trim()) {
                params.search = this.search.trim()
            }

            if (this.filterStockStatus === 'in-stock') {
                params.stock_min = 1
            } else if (this.filterStockStatus === 'out-of-stock') {
                params.stock_max = 0
            }

            for (const [key, value] of Object.entries(this.filters)) {
                if (value !== null && value !== '') {
                    params[key] = value
                }
            }

            try {
                const response = await api.get('/products/', { params })
                this.products = response.data.results
                this.totalCount = response.data.count
                this.clearSelection()
                await this.fetchLowStocks()
            } catch (err) {
                this.error = err.message || 'Failed to fetch products'
                console.error(err)
            } finally {
                this.loading = false
            }
        },

        async fetchAllProducts() {
            this.loading = true
            this.error = null
            try {
                const response = await api.get('/products/all/')
                return response.data.results || response.data
            } catch (err) {
                this.error = err.message || 'Failed to fetch all products'
                console.error(err)
                return []
            } finally {
                this.loading = false
            }
        },

        async addProduct(formData) {
            this.loading = true
            this.error = null
            try {
                if(!formData.categories.length){
                    toast.error("You have to select at least one category")
                    return;
                }
                if(!formData.images.length){
                    toast.error("You have to attach at least one image")
                    return;
                }
                console.log(JSON.stringify(formData, null, 2))
                let data = {
                    ...formData,
                    category_ids: formData.categories,
                    image_ids: formData.images,
                }
                const response = await api.post('/products/', data)
                this.products.unshift(response.data)
                toast.success("Product Added Successfully")
                await this.fetchLowStocks()
                return response.data
            } catch (err) {
                this.error = err.response?.data || 'Failed to add product'
                // handleError(err)
            } finally {
                this.loading = false
            }
        },

        async fetchLowStocks() {
            if(this.lowStocksFetched){
                if(!this.lowStockTimeOut){
                    this.lowStockTimeOut = true;
                    setTimeout(()=>{
                        this.lowStocksFetched = false;
                        this.lowStockTimeOut = false
                    },500)
                }
                return
            }
            try {
                const res = await api.get('/products/low-stocks/')
                this.low_stocks = res.data['low_stock'].products || []
                this.unavailables = res.data['unavailable'].products || []
                this.lowStocksFetched = true
            } catch (e) {
                this.error = err.message || "Failed to load stock alert"
            }
        },

        goToPage(page) {
            const newOffset = (page - 1) * this.limit
            if (newOffset >= 0 && newOffset < this.totalCount) {
                this.offset = newOffset
                this.fetchProducts()
            }
        },
        nextPage() {
            this.goToPage(this.currentPage + 1)
        },
        prevPage() {
            this.goToPage(this.currentPage - 1)
        },

        toggleProductSelection(id) {
            if (this.selectedProductIds.includes(id)) {
                this.selectedProductIds = this.selectedProductIds.filter(pid => pid !== id)
            } else {
                this.selectedProductIds.push(id)
            }
        },
        toggleSelectAll() {
            if (this.areAllSelected) {
                this.selectedProductIds = []
            } else {
                this.selectedProductIds = this.products.map(p => p.id)
            }
        },
        clearSelection() {
            this.selectedProductIds = []
        },

        // ð WebSocket
        initProductSocket() {
            if (this.socket) return

            this.socket = new WebSocket(`${'wss'}://${import.meta.env.VITE_BACKEND_URL_BASE}/ws/products/`)

            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data)
                // console.log(`Message : `,message)
                if (message.type !== 'product') return

                const { action, data } = message

                switch (action) {
                    case 'product.create':
                        if (!this.products.some(p => p.id === data.id)) {
                            this.products.unshift(data)
                            this.totalCount += 1
                        }
                        break

                    case 'product.update':
                        this.products = this.products.map(p =>
                            p.id === data.id ? data : p
                        )
                        break

                    case 'product.delete':
                        this.products = this.products.filter(p => p.id !== data.id)
                        this.totalCount -= 1
                        break
                }
                this.fetchLowStocks()
            }

            this.socket.onclose = () => {
                this.socket = null
                console.warn('Product WebSocket closed')
            }

            this.socket.onerror = (err) => {
                console.error('Product WebSocket error:', err)
            }
        },
        async deleteProduct(id) {
            try {
                await api.delete(`/products/${id}/`)
                // Remove from local state
                this.products = this.products.filter(p => p.id !== id)
                this.totalCount--
            } catch (err) {
                console.error(`Failed to delete product with id ${id}`, err)
                throw err
            }
        },

        async toggleActive(id) {
            try {
                const product = this.products.find(p => p.id === id)
                if (!product) throw new Error('Product not found in state.')

                const updated = await api.patch(`/products/${id}/`, {
                    is_active: !product.is_active
                })

                // Update the product in local state
                this.products = this.products.map(p =>
                    p.id === id ? { ...p, ...updated.data } : p
                )
            } catch (err) {
                console.error(`Failed to toggle active status for product with id ${id}`, err)
                throw err
            }
        },
    }
})