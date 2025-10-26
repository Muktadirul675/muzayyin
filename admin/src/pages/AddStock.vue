<template>
  <div class="max-w-7xl mx-auto p-6 bg-white rounded shadow">
    <!-- Header Row -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <h2 class="text-2xl font-semibold flex items-center gap-2">
        <BackButton />
        Add Stocks to Products
      </h2>

      <div class="flex gap-3 flex-1 justify-end md:justify-end">
        <div class="relative w-full md:w-64">
          <i class="pi pi-search absolute left-3 top-3 text-gray-400" />
          <input v-model="searchQuery" type="text" placeholder="Search products..."
            class="pl-10 border border-gray-300 px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="button" @click="submitStocks"
          class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          :disabled="loading">
          <i class="pi pi-send mr-1" />
          {{ loading ? 'Submitting...' : 'Submit' }}
        </button>
      </div>
    </div>

    <!-- Stock Form -->
    <form @submit.prevent="submitStocks" class="space-y-6">
      <div v-for="product in filteredProducts" :key="product.id" class="border border-gray-300 rounded p-4 bg-gray-50">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Product Info -->
          <div class="flex gap-4 items-start">
            <img :src="BACKEND_URL + product.image.image" alt="Product" class="w-20 h-20 object-cover rounded" />
            <div class="flex-1">
              <p class="font-semibold">{{ product.name }}</p>
              <p v-if="qErrors[product.id]" class="text-red-500 font-semibold">Please check for quantity mismatch</p>
              <div class="relative mt-2">
                <i class="pi pi-box absolute left-3 top-2.5 text-gray-400" />
                <input type="number" min="0" v-model.number="product.quantity" placeholder="Add stock"
                  class="pl-8 w-full border border-gray-300 px-3 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <!-- Variants -->
          <div>
            <p class="font-medium mb-2 flex items-center gap-1">
              <i class="pi pi-tags text-indigo-600" /> Variants
            </p>
            <div v-if="product.variants?.length" class="flex flex-col gap-2">
              <div v-for="variant in product.variants" :key="variant.id" class="flex items-center gap-2">
                <span class="text-sm flex-1">{{ variant.name }}</span>
                <input type="number" min="0" v-model.number="variant.quantity"
                  class="w-24 border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Qty" />
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">No Variant</p>
          </div>

          <!-- Colors -->
          <div>
            <p class="font-medium mb-2 flex items-center gap-1">
              <i class="pi pi-palette text-indigo-600" /> Colors
            </p>
            <div v-if="product.colors?.length" class="flex flex-col gap-2">
              <div v-for="color in product.colors" :key="color.id" class="flex items-center gap-2">
                <span class="text-sm flex-1">{{ color.name }}</span>
                <input type="number" min="0" v-model.number="color.quantity"
                  class="w-24 border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Qty" />
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">No Color</p>
          </div>
        </div>
      </div>

      <!-- Feedback -->
      <p v-if="error" class="text-red-600 mt-2">
        <i class="pi pi-exclamation-triangle mr-1" /> {{ error }}
      </p>
      <p v-if="success" class="text-green-600 mt-2">
        <i class="pi pi-check-circle mr-1" /> Stocks updated successfully!
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import api from '@/services/api'
import BackButton from '@/components/ui/BackButton.vue'
import { toast } from '@/services/toast'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Add Stocks - Muzayyin.com.bd'
})

const products = ref([])
const productStocks = ref([])
const loading = ref(false)
const error = ref('')
const success = ref(false)
const searchQuery = ref('')
const qErrors = ref({})
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

onMounted(async () => {
  const res = await api.get('/products/all')
  products.value = res.data
  productStocks.value = res.data.map(p => ({
    id: p.id,
    quantity: 0,
    variants: p.variants?.map(v => ({ id: v.id, quantity: 0 })) || [],
    colors: p.colors?.map(c => ({ id: c.id, quantity: 0 })) || [],
  }))
})

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

async function submitStocks() {
  qErrors.value = {}
  loading.value = true
  error.value = ''
  success.value = false

  productStocks.value = products.value.map(p => ({
    id: p.id,
    quantity: p.quantity,
    variants: p.variants?.map(v => ({ id: v.id, quantity: v.quantity })) || [],
    colors: p.colors?.map(c => ({ id: c.id, quantity: c.quantity })) || [],
  }))

  let quantity_error = false;

  productStocks.value.filter((p) => p.quantity).forEach((product) => {
    if (product.quantity) {
      const quantity = product.quantity;
      let vq = 0, cq = 0;
      if (product.variants.length) {
        product.variants.forEach((v) => vq += v.quantity || 0)
      }
      if (product.colors.length) {
        product.colors.forEach((v) => cq += v.quantity || 0)
      }
      if (vq >= 0) {
        if (quantity !== vq) {
          quantity_error = true;
          qErrors.value[product.id] = true;
        }
      }
      if (cq >= 0) {
        if (quantity !== cq) {
          quantity_error = true;
          qErrors.value[product.id] = true;
        }
      }
    }
  })

  if (quantity_error) {
    toast.error("Quantity mismatched");
    loading.value = false;
    return;
  }

  try {
    await api.post('/products/stocks/add/', productStocks.value.filter((p) => p.quantity))
    success.value = true
    toast.success("Stocks updated successfully")
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to update stocks.'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>