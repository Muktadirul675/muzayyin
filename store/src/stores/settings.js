// stores/cart.js

// stores/settings.js or stores/settings.ts
import { defineStore } from 'pinia'
import api from '@/lib/api' // adjust the import based on your actual api file
import { useToast } from '@/lib/toast'

const toast = useToast()

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        data: null,         // The settings object
        loading: false,     // For showing loader
        error: null         // For catching any error
    }),

    actions: {
        async fetchSettings() {
            this.loading = true
            this.error = null

            try {
                const res = await api.get('/site-settings')
                this.data = res.data
            } catch (err) {
                this.error = err
                toast.error('Failed to load settings:')
            } finally {
                this.loading = false
            }
        },
        get(key) {
            if (this.data && typeof this.data === 'object' && key in this.data) {
                return this.data[key]
            }
            return null
        }
    }
})
