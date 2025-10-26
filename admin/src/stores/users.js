// stores/userStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    users: [],                 // â Holds all users
    loading: false,
    error: null,
    search: '',
    selectedUserIds: [],
  }),

  getters: {
    filteredUsers(state) {
      const keyword = state.search.toLowerCase()
      return state.users.filter(user =>
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      )
    },
    areAllSelected(state) {
      return (
        state.filteredUsers.length > 0 &&
        state.filteredUsers.every(user => state.selectedUserIds.includes(user.id))
      )
    },
  },

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get('/auth/users')
        this.users = res.data || []
        this.clearSelection()
      } catch (err) {
        this.error = err.message || 'Failed to fetch users'
        this.users = []
      } finally {
        this.loading = false
      }
    },

    async registerUser(username, password) {
      this.loading = true
      this.error = null
      try {
        const res = await api.post('/auth/register/', {
          username,
          password,
        })
        await this.fetchUsers()
        return res.data
      } catch (err) {
        this.error = err.response?.data || 'Failed to register user'
        console.error(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    toggleUserSelection(id) {
      if (this.selectedUserIds.includes(id)) {
        this.selectedUserIds = this.selectedUserIds.filter(uid => uid !== id)
      } else {
        this.selectedUserIds.push(id)
      }
    },
    toggleSelectAll() {
      if (this.areAllSelected) {
        this.selectedUserIds = []
      } else {
        this.selectedUserIds = this.filteredUsers.map(u => u.id)
      }
    },
    clearSelection() {
      this.selectedUserIds = []
    },
  },
})
