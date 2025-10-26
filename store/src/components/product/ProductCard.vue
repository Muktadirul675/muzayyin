<script setup>

import { trackAddToCart } from '@/lib/pixel'
import { useToast } from '@/lib/toast'
import { formatBDT } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'
import { computed, ref, toRefs } from 'vue'
import { useRouter } from 'vue-router'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  cols: {
    type: Number,
    default: 5
  }
})

const { product } = toRefs(props)
const unavailable = computed(() => {
  return product.value.stock <= 0 || !product.value.is_active;
})
const router = useRouter()
const cartStore = useCartStore()
const loading = ref(false)
const toast = useToast()

const imageUrl = computed(() => {
  const img = product.value.image?.image || ''
  return img.startsWith('http') ? img : `${BACKEND_URL}${img}`
})

const hasVariants = computed(() =>
  Boolean(product.value.variants?.length)
)

const hasColors = computed(() =>
  Boolean(product.value.colors?.length)
)

const netPrice = computed(() =>
  parseFloat(product.value.net_price || product.value.price)
)

const originalPrice = computed(() =>
  product.value.net_price ? product.value.price : product.value.compared_price
)

function navigate() {
  router.push(`/product/${product.value.slug}`)
}

const handleAddToCart = async () => {
  loading.value = true
  if (hasVariants.value || hasColors.value) {
    let constructedString = "Please Select "
    const arr = []
    if (hasVariants.value) {
      arr.push('variants')
    }
    if (hasColors.value) {
      arr.push('colors')
    }
    constructedString += arr.join(' and ')
    router.push(`/product/${product.value.slug}`)
    toast.info(constructedString)
    loading.value = false;
    return
  }

  try {
    await cartStore.addToCart({
      product: product.value.id,
      quantity: 1
    })
    trackAddToCart({
      content_name: product.value.name,
      content_ids: [product.value.id],
      content_type: 'product',
      value: parseFloat(product.value.net_price || product.value.price),
      currency: 'BDT',
      quantity: 1
    })
    toast.success("Product Added to Cart")
  } catch (err) {
    toast.error('Failed to add to cart.')
  } finally {
    loading.value = false
  }
}

const handleBuyNow = async () => {
  loading.value = true
  if (hasVariants.value || hasColors.value) {
    let constructedString = "Please Select "
    const arr = []
    if (hasVariants.value) {
      arr.push('variants')
    }
    if (hasColors.value) {
      arr.push('colors')
    }
    constructedString += arr.join(' and ')
    router.push(`/product/${product.value.slug}`)
    toast.info(constructedString)
    loading.value = false;
    return
  }

  try {
    await cartStore.addToCart({
      product: product.value.id,
      quantity: 1
    })
    trackAddToCart({
      content_name: product.value.name,
      content_ids: [product.value.id],
      content_type: 'product',
      value: parseFloat(product.value.net_price || product.value.price),
      currency: 'BDT',
      quantity: 1
    })
    router.push(`/checkout/`)
  } catch (err) {
    alert('Failed to add to cart.')
  } finally {
    loading.value = false
  }
}

const lgWidth = computed(()=>{
  if(props.cols === 4){
    return 100 / 4;
  }else if (props.cols === 5){
    return 100 / 5;
  }
})

</script>

<template>
  <div class="hidden w-[25%] lg:w-[20%]"></div>
  <div :class="`relative w-1/2 md:w-1/3 lg:w-[${lgWidth}%] p-1`">
    <div class="absolute inset-0 z-5 rounded m-1" v-if="unavailable">
      <div class="absolute bg-gray-300 opacity-50 rounded inset-0"></div>
      <div class="mt-[20%] bg-red-500 text-white font-semibold px-3 py-2 w-fit min-w-1/2 text-center z-6">Unavailable
      </div>
    </div>
    <div class="bg-white rounded hover:shadow transition overflow-hidden">
      <div @click="navigate" class="block relative group cursor-pointer">
        <img :src="imageUrl" alt="Product" loading="lazy" decoding="async"
          class="aspect-square w-full object-cover transition-transform rounded group-hover:scale-[1.02]" />

        <div
          class="absolute bottom-0 w-full h-0 group-hover:h-8 transition-all duration-300 bg-white/80 flex justify-center items-center gap-4 overflow-hidden">
          <i class="pi pi pi-shopping-cart text-xl cursor-pointer hover:text-gray-500" v-if="loading"></i>
          <i class="pi pi-shopping-cart text-xl cursor-pointer hover:text-gray-500" v-else
            @click.stop="handleAddToCart"></i>
          <RouterLink :to="`/product/${product.slug}`">
            <i class="pi pi-eye text-xl cursor-pointer hover:text-gray-500"></i>
          </RouterLink>
        </div>
      </div>

      <div class="p-1">
        <div class="font-semibold text-center truncate">
          {{ product.name }}
        </div>

        <div class="text-black font-semibold text flex flex-col lg:flex-row items-center justify-center gap-1">
          <div class="flex items-center justify-center gap-2 ms-[-1%]">
            Tk {{ formatBDT(netPrice) }}
            <span v-if="originalPrice" class="hidden lg:inline text-sm text-gray-500 line-through">
              {{ formatBDT(originalPrice) }}
            </span>
          </div>
        </div>
        <div class="flex flex-col items-center gap-1 mt-1">
          <!-- <button @click="handleAddToCart" :disabled="loading || unavailable"
            class="w-full cursor-pointer flex items-center justify-center text-sm font-medium rounded px-3 py-2 transition-all text-white"
            :class="loading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'">
            <i :class="loading ? 'pi pi-spinner pi-spin' : 'pi pi-shopping-cart'" />
            <span class="ml-2">{{ loading ? '' : 'কার্টে যোগ করুন' }}</span>
          </button> -->
          <button @click="handleBuyNow" :disabled="loading || unavailable"
            class="w-full cursor-pointer flex items-center justify-center text-sm font-medium rounded px-3 py-2 transition-all text-white"
            :class="loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-600'">
            <i :class="loading ? 'pi pi-spinner pi-spin' : 'pi pi-shopping-bag'" />
            <span class="ml-2 font-semibold">{{ loading ? '' : 'অর্ডার করুন' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
