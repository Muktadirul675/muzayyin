<template>
  <div class="mt-10">
    <h3 class="text-xl font-semibold mb-4 text-gray-800">Select Products</h3>

    <!-- Search -->
    <input v-model="searchTerm" type="text" placeholder="Search products..."
      class="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
    <div class="my-1"></div>
    <!-- Table -->
    <div class="overflow-auto max-h-[500px] border border-gray-300 rounded-lg bg-white shadow">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-slate-100 border-b text-xs text-gray-500 uppercase">
          <tr>
            <th class="px-4 py-2 text-left">Image</th>
            <th class="px-4 py-2 text-left">Product</th>
            <th class="px-4 py-2">Variant</th>
            <th class="px-4 py-2">Color</th>
            <th class="px-4 py-2">Qty</th>
            <th class="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id" class="border-t hover:bg-gray-50 transition">
            <td class="px-4 py-2">
              <img :src="`${BACKEND_URL}${product.image.image}`" alt="product image" class="w-12 h-12 object-cover rounded" />
            </td>
            <td class="px-4 py-2">
              <div class="font-medium">{{ product.name }}</div>
              <div class="text-xs text-gray-400">SKU: {{ product.sku }}</div>
              <div class="text-xs text-gray-400">Stock: {{ product.stock }}</div>
            </td>
            <td class="px-4 py-2">
              <select v-if="product.variants.length" v-model="productInputs[product.id].variant_id"
                class="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option disabled value="">Select</option>
                <option v-for="v in product.variants" :key="v.id" :value="v.id">
                  {{ v.name }}
                </option>
              </select>
            </td>
            <td class="px-4 py-2">
              <select v-if="product.colors.length" v-model="productInputs[product.id].color_id"
                class="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option disabled value="">Select</option>
                <option v-for="c in product.colors" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </td>
            <td class="px-4 py-2">
              <input type="number" min="1" v-model.number="productInputs[product.id].quantity"
                @input="updatePrice(product.id, product.price)"
                class="w-[80px] border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </td>
            <!-- <td class="px-4 py-2">
              <input disabled type="number" min="0" step="0.01" v-model.number="productInputs[product.id].price_at_purchase"
                class="w-[150px] border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <div v-if="product.net_price" class="text-xs text-gray-500 mt-1">
                Price: {{ product.price }}, Discount: {{ product.discount }}
              </div>
            </td> -->
            <td class="px-4 py-2 text-right">
              <button @click="add(product)" type="button"
                class="w-full border border-gray-300 bg-blue-500 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-white">
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useProductStore } from '@/stores/products'

const emit = defineEmits(['add'])
const productStore = useProductStore()
const searchTerm = ref('')
const allProducts = ref([])
const productInputs = reactive({})

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

onMounted(async () => {
  const products = await productStore.fetchAllProducts()
  allProducts.value = products
  products.forEach(p => {
    productInputs[p.id] = {
      variant_id: '',
      color_id: '',
      quantity: 1,
      price_at_purchase: p.price,
    }
  })
})

const filteredProducts = computed(() =>
  allProducts.value.filter(p =>
    p.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)

function updatePrice(productId, basePrice) {
  const input = productInputs[productId]
  // input.price_at_purchase =  parseFloat((basePrice * input.quantity).toFixed(2))
}

function add(product) {
  const input = productInputs[product.id]
  if (!input.quantity || input.quantity < 1 || !input.price_at_purchase) return
  if (product.variants.length && !input.variant_id){
    return
  }
  if (product.colors.length && !input.color_id){
    return
  }
  const variant = product.variants.find(v => v.id === input.variant_id)
  const color = product.colors.find(c => c.id === input.color_id)

  emit('add', {
    product,
    product_id: product.id,
    variant_id: input.variant_id || null,
    color_id: input.color_id || null,
    quantity: input.quantity,
    price_at_purchase: input.price_at_purchase,
    variant,
    color,
  })

  productInputs[product.id] = {
    variant_id: '',
    color_id: '',
    quantity: 1,
    price_at_purchase: product.price,
  }
}
</script>