<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 flex items-center gap-2">
      <div class="flex items-center gap-2">
        <i class="pi pi-box  text-indigo-600"></i>
        Products
      </div>
      <div v-if="productStore.loading">
        <i class="pi pi-spin pi-spinner text-sm px-3 text-center text-indigo-600"></i>
      </div>
    </h2>

    <!-- Search and Actions -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <div class="flex flex-col gap-2">
        <div class="relative w-full md:w-64">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="productStore.search" @input="onSearchInput" type="text" placeholder="Search by name or SKU"
            class="pl-10 border bg-white border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div class="flex flex-row gap-3 px-2">
          <div>
            <input class="cursor-pointer" type="radio" name="" v-model="listType" id="" value="all"> All
          </div>
          <div>
            <input class="cursor-pointer" type="radio" name="" v-model="listType" id="" value="low_stocks"> Low Stocks
            <span class="badge-gray" v-if="productStore.low_stocks.length">{{ productStore.low_stocks.length }}</span>
          </div>
          <div>
            <input class="cursor-pointer" type="radio" name="" v-model="listType" id="" value="unavailables">
            Unavailables
            <span class="badge-gray" v-if="productStore.unavailables.length">{{ productStore.unavailables.length
              }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 items-center">
        <!-- Limit Input -->
        <div class="flex items-center gap-2" v-if="listType == 'all'">
          <label for="limit" class="text-sm font-medium text-gray-700">Per page:</label>
          <input id="limit" type="number" min="1" v-model.number="productStore.limit" @change="onLimitChange"
            class="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <!-- Bulk Actions -->
        <div v-if="productStore.selectedProductIds.length" class="flex gap-2 items-center">
          <select v-model="bulkAction"
            class="border border-gray-300 rounded cursor-pointer px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option class="" disabled value="">Select Action</option>
            <option class="cursor-pointer" value="delete">Delete</option>
            <option class="cursor-pointer" value="toggle-active">Toggle Active</option>
          </select>
          <button @click="applyBulkAction"
            class="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            :disabled="!bulkAction || loadingAction">
            <i class="pi pi-check-square"></i>
            Apply
          </button>
          <span v-if="loadingAction" class="text-sm text-indigo-600">Applying...</span>
        </div>

        <!-- Refresh and Add Buttons -->
        <button @click="refreshProducts"
          class="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 flex items-center gap-2">
          <i class="pi pi-refresh"></i>
          Refresh
        </button>

        <RouterLink to="/products/add"
          class="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Add
        </RouterLink>

        <RouterLink to="/products/stocks/add"
          class="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 flex items-center gap-2">
          <i class="pi pi-database"></i>
          Add Stocks
        </RouterLink>
      </div>
    </div>

    <!-- Filters Accordion -->
    <div class="bg-white rounded shadow my-2 border border-gray-200">
      <button @click="showFilters = !showFilters"
        class="w-full text-left px-4 py-3 flex justify-between items-center text-sm font-semibold border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100">
        <span class="flex items-center gap-2">
          <i class="pi pi-filter-fill text-gray-500" />
          Advanced Filters
        </span>
        <svg :class="{ 'rotate-180': showFilters }" class="h-4 w-4 transition-transform" fill="none"
          stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Transition name="slide-fade">
        <div v-if="showFilters" class="p-4 border-t border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="number" v-model.number="productStore.filters.price_min" placeholder="Min Price"
              class="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="number" v-model.number="productStore.filters.price_max" placeholder="Max Price"
              class="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="number" v-model.number="productStore.filters.stock_min" placeholder="Min Stock"
              class="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="number" v-model.number="productStore.filters.stock_max" placeholder="Max Stock"
              class="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="datetime-local" v-model="productStore.filters.created_after"
              class="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="datetime-local" v-model="productStore.filters.created_before"
              class="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div class="mt-4 flex gap-3">
            <button @click="applyFilters"
              class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
              <i class="pi pi-filter"></i>
              Apply
            </button>
            <button @click="clearFilters"
              class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-2">
              <i class="pi pi-times-circle"></i>
              Clear
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Product Table and Pagination stay unchanged -->
    <!-- Keep your existing product table and pagination markup -->
    <div class="overflow-x-auto bg-white rounded shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-slate-700 text-white">
          <tr>
            <th class="pl-4 py-3 text-left w-10">
              <input type="checkbox" :checked="productStore.areAllSelected" @change="productStore.toggleSelectAll" />
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">SKU</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in productList" :key="product.id" class="cursor-pointer hover:bg-gray-50"
            @click="goToEdit(product.id)">
            <td class="pl-4 py-4 w-10" @click.stop>
              <input type="checkbox" :checked="productStore.selectedProductIds.includes(product.id)"
                @change="productStore.toggleProductSelection(product.id)" />
            </td>
            <td :class="[
              'ps-3 py-4 whitespace-nowrap text-sm font-medium',
              !product.is_active ? 'text-gray-400 italic line-through' : 'text-gray-900'
            ]">
              {{ product.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.sku || '-' }}</td>
            <td :class="[
              'px-6 py-4 whitespace-nowrap text-sm font-semibold',
              product.stock > stockAlert ? 'text-green-600' : 'text-red-600'
            ]">
              {{ product.stock }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span v-if="product.net_price">
                <BDT :amount="parseFloat(product.net_price)" />
                <!-- {{ product.net_price }} -->
                <span class="text-xs text-gray-500">[{{ product.price }} - {{ product.discount }}]</span>
              </span>
              <span v-else>
                <BDT :amount="parseFloat(product.price) || 0.00" />
                <!-- {{ product.price || '0.00' }} -->
              </span>
            </td>
          </tr>
          <tr v-if="!productList.length && !productStore.loading">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">No products found.</td>
          </tr>
          <tr v-if="productStore.loading">
            <td colspan="5" class="px-6 py-4 text-center text-indigo-600">Loading products...</td>
          </tr>
          <tr v-if="productStore.error">
            <td colspan="5" class="px-6 py-4 text-center text-red-600">{{ productStore.error }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="listType === 'all'" class="flex justify-between items-center mt-4">
      <div class="text-gray-700">
        Showing page {{ productStore.currentPage }} of {{ productStore.totalPages }} ({{ productStore.totalCount }}
        products)
      </div>
      <nav class="space-x-2">
        <button @click="productStore.prevPage" :disabled="productStore.currentPage === 1 || productStore.loading"
          class="px-3 py-1 rounded cursor-pointer border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
          Previous
        </button>
        <button v-for="page in totalPageButtons" :key="page" @click="() => productStore.goToPage(page)" :class="[
          'px-3 py-1 rounded cursor-pointer border',
          page === productStore.currentPage
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'border-gray-300 hover:bg-gray-100'
        ]" :disabled="productStore.loading">
          {{ page }}
        </button>
        <button @click="productStore.nextPage"
          :disabled="productStore.currentPage === productStore.totalPages || productStore.loading"
          class="px-3 py-1 rounded cursor-pointer border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<!-- Product Table -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useProductStore } from '@/stores/products.js'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import BDT from '@/components/ui/BDT.vue'
import { useSettingsStore } from '@/stores/settings'
import { useHead } from '@vueuse/head'
const router = useRouter()

useHead({
  title: 'Products - Muzayyin.com.bd'
})

const goToEdit = (productId) => {
  router.push(`/products/${productId}`)
}
const productStore = useProductStore()
const showFilters = ref(false)
const bulkAction = ref('')
const loadingAction = ref(false)
const listType = ref('all') // 'low_stock' 'unavailables'
const productList = computed(() => {
  if (listType.value === 'all') {
    return productStore.products
  } else if (listType.value === 'low_stocks') {
    return productStore.low_stocks
  } else if (listType.value === 'unavailables') {
    return productStore.unavailables
  }
})
const totalPageButtons = computed(() => {
  const total = productStore.totalPages
  const current = productStore.currentPage
  const maxButtons = 5
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + maxButtons - 1)
  if (end - start < maxButtons - 1) {
    start = Math.max(1, end - maxButtons + 1)
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
const settings = useSettingsStore()
const stockAlert = computed(() => {
  console.log(settings.settings['stock_alert_at'])
  if (settings.settings['stock_alert_at']) {
    return parseInt(settings.settings['stock_alert_at'])
  }
  return 0
})

const onSearchInput = () => {
  productStore.offset = 0
  productStore.fetchProducts()
}

const onLimitChange = () => {
  if (productStore.limit < 1) productStore.limit = 1
  productStore.offset = 0
  productStore.fetchProducts()
}

const refreshProducts = () => {
  productStore.offset = 0
  productStore.fetchProducts()
}

const applyFilters = () => {
  productStore.offset = 0
  productStore.fetchProducts()
}

const clearFilters = () => {
  productStore.filters = {
    price_min: null,
    price_max: null,
    stock_min: null,
    stock_max: null,
    created_after: null,
    created_before: null
  }
  productStore.offset = 0
  productStore.fetchProducts()
}

const applyBulkAction = async () => {
  if (!bulkAction.value || productStore.selectedProductIds.length === 0) return
  loadingAction.value = true

  const ids = [...productStore.selectedProductIds]
  try {
    if (bulkAction.value === 'delete') {
      for (const id of ids) await productStore.deleteProduct(id)
    } else if (bulkAction.value === 'toggle-active') {
      for (const id of ids) await productStore.toggleActive(id)
    }

    await productStore.fetchProducts()
    productStore.clearSelection()
    bulkAction.value = ''
  } catch (err) {
    console.error('Bulk action error:', err)
  } finally {
    loadingAction.value = false
  }
}

watch(
  () => [productStore.search, productStore.filterStockStatus],
  () => {
    productStore.offset = 0
    productStore.fetchProducts()
  }
)

onMounted(() => {
  productStore.fetchProducts()
})
</script>