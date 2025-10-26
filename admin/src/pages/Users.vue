<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/users'
import { ref } from 'vue'
import api from '@/services/api'
import { useHead } from '@vueuse/head'
import { toast } from '@/services/toast'

useHead({
  title: 'Users - Muzayyin.com.bd'
})

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUsers()
})
const changingPasswordFor = ref(null)
const newPasswordInput = ref('')

const openChangePassword = (userId) => {
  changingPasswordFor.value = userId
  newPasswordInput.value = ''
  const newPass = prompt('Enter new password for this user:')
  if (newPass) {
    changePassword(userId, newPass)
  }
}

const changePassword = async (userId, newPassword) => {
  try {
    await api.post(`/auth/user/change-password?user_id=${userId}`, {
      new_password: newPassword
    })
    toast.success('Password changed successfully!')
  } catch (err) {
    toast.error('Failed to change password')
    console.error(err)
  }
}

const newUser = ref({
  username: '',
  password: '',
})

const registering = ref(false)
const registerError = ref('')
const registerSuccess = ref(false)

const register = async () => {
  registering.value = true
  registerError.value = ''
  registerSuccess.value = false

  try {
    await userStore.registerUser(newUser.value.username, newUser.value.password)
    registerSuccess.value = true
    newUser.value.username = ''
    newUser.value.password = ''
  } catch (err) {
    registerError.value = err?.response?.data?.username?.[0] || err?.message || 'Failed to register user'
  } finally {
    registering.value = false
  }
}

const setStaff = async (userId) => {
  try {
    await api.post(`/auth/users/${userId}/make-staff/`)
    await userStore.fetchUsers()
  } catch (e) {
    alert('Failed to make staff')
    console.error(e)
  }
}

const removeStaff = async (userId) => {
  try {
    await api.post(`/auth/users/${userId}/remove-staff/`)
    await userStore.fetchUsers()
  } catch (e) {
    alert('Failed to remove staff')
    console.error(e)
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">
      <i class="pi pi-users text-indigo-600"></i>
      Users
    </h2>

    <!-- Search Input -->
    <div class="relative mb-4 w-full md:w-64">
      <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
      <input v-model="userStore.search" type="text" placeholder="Search by username or email"
        class="pl-9 w-full border border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:ring-2" />
    </div>

    <!-- Register Section -->
    <div class="bg-white rounded shadow p-4 mb-6">
      <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
        <i class="pi pi-user-plus text-green-600"></i>
        Register New User
      </h3>

      <form @submit.prevent="register" class="flex flex-col gap-3 md:flex-row md:items-center">
        <input v-model="newUser.username" type="text" placeholder="Username"
          class="w-full md:w-1/4 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          required />
        <input v-model="newUser.password" type="password" placeholder="Password"
          class="w-full md:w-1/4 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          required />
        <button type="submit"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          :disabled="registering">
          <i class="pi pi-check-circle"></i>
          Register
        </button>
        <span v-if="registerError" class="text-red-600 text-sm">{{ registerError }}</span>
        <span v-if="registerSuccess" class="text-green-600 text-sm">User registered!</span>
      </form>
    </div>

    <!-- Users Table -->
    <div class="overflow-x-auto bg-white rounded shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-slate-700 text-white">
          <tr>
            <th class="pl-4 py-3 text-left w-10">
              <input type="checkbox" :checked="userStore.areAllSelected" @change="userStore.toggleSelectAll" />
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase">Username</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="user in userStore.filteredUsers" :key="user.id">
            <td class="pl-4 py-4">
              <input type="checkbox" :checked="userStore.selectedUserIds.includes(user.id)"
                @change="userStore.toggleUserSelection(user.id)" />
            </td>

            <td class="px-6 py-4">{{ user.username }}</td>

            <td class="px-6 py-4">
              <span v-if="user.groups.some(g => g.name === 'Staff')"
                class="text-green-600 font-medium flex items-center gap-1">
                <i class="pi pi-shield"></i>
                Staff
              </span>
              <span v-else class="text-gray-500">Regular</span>
            </td>

            <td class="px-6 py-4 space-x-2 flex gap-2">
              <button v-if="!user.groups.some(g => g.name === 'Staff')" @click="setStaff(user.id)"
                class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                <i class="pi pi-user-edit"></i>
                Make Staff
              </button>
              <button v-else @click="removeStaff(user.id)"
                class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                <i class="pi pi-user-minus"></i>
                Remove Staff
              </button>
              <button @click="openChangePassword(user.id)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                <i class="pi pi-key"></i>
                Change Password
              </button>
            </td>
          </tr>

          <tr v-if="!userStore.filteredUsers.length && !userStore.loading">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">No users found.</td>
          </tr>
          <tr v-if="userStore.loading">
            <td colspan="4" class="px-6 py-4 text-center text-indigo-600">Loading users...</td>
          </tr>
          <tr v-if="userStore.error">
            <td colspan="4" class="px-6 py-4 text-center text-red-600">{{ userStore.error }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>