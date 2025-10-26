<!-- pages/Cart.vue -->
<script setup>
import { useCartStore } from '@/stores/cart'
import CartItem from '@/components/cart/CartItem.vue'
import { onMounted, ref, watch } from 'vue'
import BDT from '@/components/ui/BDT.vue'
import { RouterLink } from 'vue-router'
import { useHead } from '@vueuse/head'

const cart = useCartStore()
useHead({
  title: "Cart - Muzayyin.com.bd"
})
onMounted(() => {
  window.scrollTo({ top: 0 })
})
</script>

<template>
  <div class="max-w-2xl mt-2 mb-4 mx-auto p-2 pb-0">
    <div class="rounded border border-gray-300 p-0">
      <div class="flex justify-between p-0 rounded-tr rounded-tl bg-blue-100">
        <h2 class="text-lg font-semibold text-gray-800 p-3 uppercase flex items-center gap-2">
          <i class="pi pi-shopping-cart"></i>
          Your Cart
        </h2>
      </div>
      <!-- {{ JSON.stringify(cart.cart,null,2) }} -->
      <div v-if="cart.cart && cart.cart.items?.length > 0" class="divide-y divide-gray-300">
        <div class="px-2 lg:px-4" v-for="item in cart.cart.items">
          <CartItem :key="item.id" :item="item" />
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center text-center text-gray-500 my-4">
        <div>
          <img src="/empty.png" class="w-[100px] h-[100px]" alt="">
        </div>
        <div class="my-4">
          Your cart is empty.
        </div>
        <div>
          <RouterLink to="/" class="btn"> <i class="pi pi-shopping-cart me-2"></i> Continue Shopping</RouterLink>
        </div>
      </div>

      <div v-if="cart.cart && cart.cart.items.length" class="flex justify-between border-t border-gray-300">
        <div class="text-xl font-semibold text-gray-800 flex items-center p-2">
          Sub Total:
          <span class="text-black">
            <BDT :amount="parseFloat(cart.cart.total_price)" />
          </span>
        </div>
      </div>
      <RouterLink to="/checkout"
        class="flex items-center justify-center gap-2 bg-black p-3 hover:bg-gray-600 text-white rounded-br rounded-bl transition">
        <i class="pi pi-arrow-right"></i> Checkout
      </RouterLink>
    </div>
  </div>
</template>