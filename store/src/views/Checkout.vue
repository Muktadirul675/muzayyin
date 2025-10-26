<template>
  <!-- Loading state -->
  <div class="max-w-xl mx-auto p-2 lg:p-3 mb-12">
    <div v-if="success" id="success"
      class="min-h-[50vh] flex gap-2 flex-col w-full bg-white rounded justify-center items-center">
      <img src="/order_confirmed.gif" class="w-[70px] h-[70px]" alt="">
      <div class="text-3xl text-green-500 text-center">আপনার অর্ডার গ্রহণ করা হয়েছে!</div>
      <div class="text-lg text-green-500 text-center"> Order id: #{{ order_id }}</div>
      <RouterLink to="/" class="btn"> <i class="pi pi-shopping-cart me-2"></i> Continue Shopping</RouterLink>
    </div>
    <div v-else-if="loading"
      class="min-h-[200px] flex gap-2 flex-col w-full bg-white rounded justify-center items-center">
      <img class="h-[70px] w-[70px]" src="/delivery_processing.gif" alt="">
      <div class="text-lg">Confirming your order</div>
    </div>
    <div class="max-w-xl mx-auto text-center py-12 text-gray-500" v-else-if="cart.loading && !noPageLoad">
      <i class="pi pi-spin pi-spinner text-4xl mb-4"></i>
      <p class="text-lg font-medium">Loading your cart...</p>
    </div>

    <!-- Empty cart state -->
    <div v-else-if="cart.cart && cart.cart.items.length === 0" class="max-w-xl mx-auto text-center py-12 text-gray-400">
      <i class="pi pi-shopping-cart text-5xl mb-4"></i>
      <p class="text-lg font-semibold">Your cart is empty</p>
      <p class="text-sm">Add some items to get started.</p>
      <RouterLink to="/" class="btn"> <i class="pi pi-shopping-cart me-2 my-4"></i> Shop Now</RouterLink>
    </div>
    <div v-else class="border border-gray-300 rounded m-2">
      <h1 class="text-xl font-bold mb-4 p-3 bg-blue-100 text-slate-800 uppercase text-center">
        আপনার নাম, ফোন নাম্বার এবং ঠিকানা দিয়ে অর্ডার কনফার্ম করুন।
      </h1>
      <div class="space-y-2 p-3 w-full">
        <label class="block text-sm text-gray-700 font-semibold">
          <i class="pi pi-user mr-2"></i>আপনার নাম *
        </label>
        <input v-model="name" type="text" placeholder="Full Name"
          class="w-full p-2 border shadow-sm border-gray-300 rounded" />

        <!-- Shipping Address -->
        <label class="block text-sm text-gray-700 font-semibold">
          <i class="pi pi-map-marker mr-2"></i> আপনার ঠিকানা *
        </label>
        <textarea v-model="address" placeholder="Shipping Address"
          class="w-full p-2 border shadow-sm border-gray-300 rounded"></textarea>

        <!-- Phone Number -->
        <label class="block text-sm font-semibold text-gray-700">
          <i class="pi pi-phone mr-2"></i>আপনার মোবাইল নাম্বার *
        </label>
        <input v-model="phone" type="text" placeholder="Phone Number"
          class="w-full p-2 border shadow-sm border-gray-300 rounded" />

        <div class="flex my-2 items-center gap-4">
          <label class="flex items-center gap-2">
            <input type="radio" v-model="location" value="outside" />
            <span class="font-semibold">
              ঢাকার বাহিরে
            </span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" v-model="location" value="inside" />
            <span class="font-semibold">
              ঢাকার ভিতরে
            </span>
          </label>
        </div>
        <div class="w-full bg-gray-300 h-[1px] my-3"></div>
        <div class="text-slade-800 mt-2 uppercase font-semibold">
          <i class="pi pi-shopping-cart me-2"></i> Order Summary
        </div>
        <div class="divide-y divide-gray-300">
          <template v-if="cart.cart && cart.cart.items" v-for="item in cart.cart.items" :key="item.id">
            <div class="flex items-start justify-between p-1">
              <div class="flex items-center gap-2 w-full">
                <img :src="prodImage(item.product.image.image)" alt="" class="w-10 h-10 rounded">
                <span class="md:font-semibold truncate">{{ truncate(item.product.name, 20) }}</span>
                <div class="ms-auto">
                  {{ formatBDT(item.product.net_price || item.product.price) }} <i class="pi pi-times text-xs"></i> {{
                    item.quantity }}
                </div>
                <div v-if="!removingItemsId.includes(item.id)" @click="removeItem(item.id)" class="p-1 text-red-500 hover:text-red-600 hover:bg-red-300/50 transition-all">
                  <i class="pi pi-trash"></i>
                </div>
                <div v-else>
                  <i class="pi pi-spinner pi-spin text-red-500"></i>
                </div>
              </div> 
            </div>
          </template>
        </div>
        <hr>
        <div class="">
          <div class="flex items-center">
            Subtotal:
            <div class="ms-auto flex items-center">
              Tk. {{ formatBDT(subtotal) }}
            </div>
          </div>
          <div class="flex items-center">
            Delivery:
            <div class="ms-auto flex items-center">
              Tk. {{ formatBDT(deliveryCharge) }}
            </div>
          </div>
          <hr class="mt-2 mb-1">
          <div class="font-bold flex items-center">
            Grand Total:
            <div class="ms-auto flex items-center">
              <span class="">
                Tk. {{ formatBDT(total) }}
              </span>
            </div>
          </div>
          <div class="my-3"></div>
          <div class="flex w-full items-center justify-center">
            <button :disabled="!isFormValid || loading" @click="submitOrder"
              class="w-2/3 mx-auto bg-black hover:bg-gray-600 cursor-pointer transition-all text-white p-2 rounded disabled:opacity-50">
              <span v-if="loading">Placing Order...</span>
              <span v-else-if="!isFormValid">অর্ডার কনফার্ম করুন</span>
              <span v-else class=""> <i class="pi pi-check me-2"></i>অর্ডার কনফার্ম করুন</span>
            </button>
          </div>
        </div>

        <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, effect } from 'vue'
import { useCartStore } from '@/stores/cart'
import api from '@/lib/api'
import BDT from '@/components/ui/BDT.vue'
import { RouterLink } from 'vue-router'
import { useToast } from '@/lib/toast'
import { useSettingsStore } from '@/stores/settings'
import { useHead } from '@vueuse/head'
import { formatBDT, truncate } from '@/lib/utils'
import { trackInitiateCheckout, trackPurchase } from '@/lib/pixel'

useHead({
  title: "Checkout - Muzayyin.com.bd"
})

const cart = useCartStore()
const settings = useSettingsStore()
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const noPageLoad = ref(false)
const name = ref('')
const address = ref('')
const phone = ref('')
const location = ref('outside')

const removingItemsId = ref([])

const loading = ref(false)
const error = ref(null)
const success = ref(false)
const order_id = ref(null)

const subtotal = computed(() => cart?.cart?.total_price || 0)
const deliveryCharge = computed(() => location.value === 'inside' ? parseFloat(
  settings.get('delivery_charge_inside_dhaka')
) : parseFloat(
  settings.get('delivery_charge_outside_dhaka')
))
const total = computed(() => parseFloat(subtotal.value) + parseFloat(deliveryCharge.value))

const toast = useToast()

const isFormValid = computed(() =>
  name.value && address.value && phone.value && location.value
)

function prodImage(url) {
  if (url.startsWith(BACKEND_URL)) return url;
  return `${BACKEND_URL}${url}`
}

async function removeItem(itemId){
  noPageLoad.value = true;
  removingItemsId.value.push(itemId)
  try{
    await cart.removeItem(itemId)
    if(cart.cart.items.length <= 0) window.scrollTo({top:0})
  }catch(e){
    console.error("Failed to remove item")
  }finally{
    removingItemsId.value = removingItemsId.value.filter((id)=>id!==itemId)
  }
} 

const submitOrder = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null
  success.value = false

  try {
    const res = await api.post('/cart/checkout/', {
      full_name: name.value,
      shipping_address: address.value,
      phone: phone.value,
    })
    success.value = true
    order_id.value = res.data.order_id
    cart.fetchCart()
    window.scrollTo({ behavior: 'smooth', top: 0 })
    trackPurchase({
      value: total.value,
      currency: 'BDT',
      content_ids: res.data.product_ids, // array of product IDs in order
      content_type: 'product',
      num_items: res.data.num_items,
      order_id: order_id.value
    })
    // Optional: Clear the form or cart here
  } catch (err) {
    error.value = 'Failed to place order. Please try again.'
    console.log(err)
    toast.error('Failed to place order. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  window.scrollTo({ top: 0 });
  trackInitiateCheckout({
    value: total.value,
    currency: 'BDT',
    content_ids: cart.cart.items.map((i)=>i.product.id), // array of product IDs in cart
    content_type: 'product',
    num_items: cart.cart.total_items
  })
})
</script>
