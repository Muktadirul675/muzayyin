<template>
    <div class="bg-white p-6 rounded shadow">
      <h3 class="text-xl font-semibold mb-4">Add Products to Order</h3>
  
      <input
        v-model="search"
        type="text"
        placeholder="Search products..."
        class="mb-4 border border-gray-300 px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
  
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100 text-sm text-left font-semibold">
            <tr>
              <th class="px-4 py-2">Image</th>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Variant</th>
              <th class="px-4 py-2">Color</th>
              <th class="px-4 py-2">Qty</th>
              <th class="px-4 py-2">Price</th>
              <th class="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="border-b"
            >
              <td class="px-4 py-2">
                <img
                  :src="resolveImage(product.image)"
                  class="w-12 h-12 object-cover rounded border"
                />
              </td>
              <td class="px-4 py-2">
                <div class="font-medium">{{ product.name }}</div>
                <div class="text-sm text-gray-500">SKU: {{ product.sku }}</div>
                <div class="text-sm text-green-600">Stock: {{ product.stock }}</div>
              </td>
  
              <td class="px-4 py-2">
                <select
                  v-model="selections[product.id].variant_id"
                  v-if="product.variants.length"
                  class="border px-2 py-1 rounded w-full text-sm"
                >
                  <option disabled value="">Select</option>
                  <option
                    v-for="variant in product.variants"
                    :key="variant.id"
                    :value="variant.id"
                  >
                    {{ variant.name }} ({{ variant.stock }})
                  </option>
                </select>
              </td>
  
              <td class="px-4 py-2">
                <select
                  v-model="selections[product.id].color_id"
                  v-if="product.colors.length"
                  class="border px-2 py-1 rounded w-full text-sm"
                >
                  <option disabled value="">Select</option>
                  <option
                    v-for="color in product.colors"
                    :key="color.id"
                    :value="color.id"
                  >
                    {{ color.name }}
                  </option>
                </select>
              </td>
  
              <td class="px-4 py-2">
                <input
                  v-model.number="selections[product.id].quantity"
                  @input="autoSetPrice(product)"
                  type="number"
                  min="1"
                  class="border px-2 py-1 rounded w-20 text-sm"
                />
              </td>
  
              <td class="px-4 py-2">
                <input
                  v-model.number="selections[product.id].price_at_purchase"
                  type="number"
                  step="0.01"
                  class="border px-2 py-1 rounded w-24 text-sm"
                />
              </td>
  
              <td class="px-4 py-2">
                <button
                  class="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700"
                  @click="addProductToOrder(product)"
                >
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
  import { ref, computed, onMounted } from 'vue'
  import { useProductStore } from '@/stores/products'
  
  const emit = defineEmits(['addItem'])
  
  const search = ref('')
  const productStore = useProductStore()
  const selections = ref({})
  
  const resolveImage = (image) => {
    return image?.startsWith('http') ? image : `http://localhost:8000${image}`
  }
  
  onMounted(async () => {
    const all = await productStore.fetchAllProducts()
    all.forEach((p) => {
      selections.value[p.id] = {
        product_id: p.id,
        variant_id: '',
        color_id: '',
        quantity: 1,
        price_at_purchase: p.price || 0,
      }
    })
  })
  
  const filteredProducts = computed(() => {
    return productStore.products.filter((p) =>
      p.name.toLowerCase().includes(search.value.toLowerCase())
    )
  })
  
  function autoSetPrice(product) {
    const sel = selections.value[product.id]
    sel.price_at_purchase = (product.price || 0) * (sel.quantity || 1)
  }
  
  function addProductToOrder(product) {
    const sel = selections.value[product.id]
    if (!sel.quantity || !sel.price_at_purchase) return
  
    emit('addItem', {
      product_id: product.id,
      variant_id: sel.variant_id || null,
      color_id: sel.color_id || null,
      quantity: sel.quantity,
      price_at_purchase: sel.price_at_purchase,
      product,
    })
  
    sel.quantity = 1
    sel.price_at_purchase = product.price || 0
  }
  </script>