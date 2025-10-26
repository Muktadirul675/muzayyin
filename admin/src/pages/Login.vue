<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded shadow max-w-[400px] w-full">
            <div class="flex flex-row items-center justify-center gap-2">
                <h2 class="text-2xl font-semibold text-center">Login to</h2>
                <img src="/logo.png" class="rounded h-6" alt="">
            </div>
            <div class="my-3"></div>
            <form @submit.prevent="handleLogin" class="space-y-4">
                <!-- Username -->
                <div>
                    <label class="block text-sm font-medium mb-1">Username</label>
                    <div
                        class="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                        <i class="pi pi-user text-gray-500 mr-2"></i>
                        <input v-model="username" required type="text" placeholder="Enter username"
                            class="flex-1 text-sm focus:outline-none" />
                    </div>
                </div>

                <!-- Password -->
                <div>
                    <label class="block text-sm font-medium mb-1">Password</label>
                    <div
                        class="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                        <i class="pi pi-lock text-gray-500 mr-2"></i>
                        <input v-model="password" required type="password" placeholder="Enter password"
                            class="flex-1 text-sm focus:outline-none" />
                    </div>
                </div>

                <!-- Error -->
                <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>

                <!-- Button -->
                <button type="submit" class="w-full cursor-pointer bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                    :disabled="loading">
                    <span v-if="loading">
                        <i class="pi pi-spin pi-spinner mr-2"></i> Logging in...
                    </span>
                    <span v-else>Login</span>
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHead } from '@vueuse/head'

useHead({title: `Login to Muzayyin.com.bd`})

const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)
const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
    errorMessage.value = ''
    try{
        loading.value = true
        const success = await auth.login({ username: username.value, password: password.value })
        if (success) {
            router.push('/')
        } else {
            errorMessage.value = auth.error || 'Login failed. Please check your credentials.'
        }
    }catch(e){
        errorMessage.value = e
    }finally{
        loading.value = false
    }
}

// Keep error reactive
watch(() => auth.error, (val) => {
    if (val) errorMessage.value = val
})
</script>

<style scoped>
.pi {
    font-size: 1rem;
}
</style>