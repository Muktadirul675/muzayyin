<template>
  <div class="w-full lg:w-1/2 mx-auto flex flex-col items-center">
    <Loading v-if="loading" />
    <div v-else-if="product" class="w-full" :key="product.id">
      <h1 class="text-xl font-semibold my-3 px-2 lg:p-0 lg:my-3">{{ product.name }}</h1>

      <div class="w-full flex flex-col md:flex-row gap-4 ">
        <KeepAlive>
          <div class="w-full lg:w-1/2">
            <Carousel v-if="product.images.length && product.images.every((i) => i.image)"
              :images="product.images.map((i) => i.image)" />
          </div>
        </KeepAlive>

        <!-- Right: Selections -->
        <div class="flex flex-col gap-2 lg:gap-4">
          <!-- <h1 class="text-xl font-semibold hidden lg:block">{{ product.name }}</h1> -->

          <div class="flex items-center space-x-2 mt-2 text-lg px-2 lg:px-0">
            <span v-if="product.net_price" class="text-black font-semibold text-2xl flex items-center">
              <BDT :amount="parseFloat(product.net_price)" />
            </span>
            <span class="line-through text-gray-500" v-if="product.net_price">
              {{ formatBDT(product.price) }}
            </span>

            <span v-else class="text-black font-semibold text-2xl flex items-center">
              <BDT :amount="parseFloat(product.price)" />
            </span>
            <span v-if="!product.net_price" class="line-through text-gray-500">
              {{ formatBDT(product.compared_price) }}
            </span>
          </div>

          <!-- Variants -->
          <div v-if="product.variants?.length" class="flex p-2 lg:p-0 flex-wrap gap-2">
            <div v-for="variant in product.variants" :key="variant.id"
              class="px-3 py-1 text-white transition-all rounded cursor-pointer bg-black hover:bg-gray-600"
              :class="{ 'ring-2 ring-black': selectedVariant === variant.id }" @click="selectedVariant = variant.id">
              <i class="pi pi-check me-2" v-if="selectedVariant === variant.id"></i>
              {{ variant.name }}
            </div>
          </div>

          <!-- Colors -->
          <div v-if="product.colors?.length" class="flex p-2 lg:p-0 flex-wrap gap-4">
            <div v-for="color in product.colors" :key="color.id"
              class="flex flex-col items-center cursor-pointer hover:scale-105 transition"
              @click="selectedColor = color.id">
              <div class="w-10 h-10 rounded-full border-2"
                :class="selectedColor === color.id ? 'ring-2 ring-black' : 'border-gray-300'"
                :style="{ backgroundColor: color.hex_code }" />
              <span class="text-sm mt-1">{{ color.name }}</span>
            </div>
          </div>

          <!-- Quantity + Add to Cart -->
          <div class="flex gap-2 w-full p-2 lg:p-0">
            <div class="flex border flex-[1.5] md:flex-1 border-gray-300 rounded-md w-full overflow-hidden">
              <button :disabled="quantity === 1" class="px-3 py-1 text-2xl cursor-pointer"
                @click="quantity = Math.max(1, quantity - 1)">-</button>
              <input disabled type="number" class="w-full text-center outline-none appearance-none"
                v-model.number="quantity" min="1" />
              <button :disabled="quantity === product.stock" class="px-3 py-1 text-2xl cursor-pointer"
                @click="quantity = Math.min(quantity + 1, maxStock)">+</button>
            </div>
            <button
              class="bg-gray-400 cursor-pointer flex-[0.8] md:flex-2 hover:bg-gray-600 text-white px-4 py-2 w-full flex justify-center items-center gap-2"
              :disabled="addingToCart || !canPurchase" @click="handleAddToCart">
              <i class="pi pi-spin pi-spinner" v-if="addingToCart"></i>
              <template v-else>
                <i class="pi pi-shopping-cart md:me-2"></i> <span class="hidden bn md:inline">Add Cart</span>
              </template>
            </button>
            <!-- <button
              class="bg-gray-400 cursor-pointer flex-[0.8] md:flex-2 hover:bg-red-600 text-white px-4 py-2 rounded-md w-full flex justify-center items-center gap-2"
              :disabled="addingToCart || !canPurchase" @click="handleAddToCart">
              <i class="pi pi-spin pi-spinner" v-if="addingToCart"></i>
              <template v-else>
                <i class="pi pi-shopping-cart md:me-2"></i> <span class="hidden bn md:inline">কার্টে যোগ করুন</span>
              </template>
            </button> -->
            <button
              class="bg-black cursor-pointer flex-2 hover:bg-gray-600 text-white px-4 py-2 w-full flex justify-center items-center gap-2"
              :disabled="buyingNow || !canPurchase" @click="handleBuyNow">
              <i class="pi pi-spin pi-spinner" v-if="buyingNow"></i>
              <template v-else>
                <span class="bn">
                  <i class="pi pi-shopping-bag me-2"></i> অর্ডার করুন
                </span>
              </template>
            </button>
          </div>
          <p v-if="errorMessage" class="text-sm text-red-500 px-2">{{ errorMessage }}</p>
          <div class="my-2">
            <div class="font-semibold text-slate-800">Description</div>
            <p v-html="product.description" class="whitespace-pre-line"></p>
          </div>
          <!-- Contact Options -->
          <!-- <div class="flex gap-1 flex-col p-1 lg:p-0">
            <a :href="`tel:${settings.get('contact_number')}`" target="_blank"
              class="text-white bn rounded bg-black hover:bg-gray-600 transition-all flex items-center gap-2 p-2 cursor-pointer justify-center">
              <Phone class="w-4 h-4" /> ফোনে অর্ডার করুন {{ settings.get('contact_number') && ': ' }} {{
                settings.get('contact_number') }}
            </a>
            <a :href="`https://wa.me/${settings.get('whatsapp_number')}?text=${wp_message}`" target="_blank"
              class="text-white bn rounded bg-black hover:bg-gray-600 transition-all flex items-center justify-center gap-2 p-2 cursor-pointer flex-wrap">
              <MessageSquare class="w-4 h-4" /> হোয়্যাটসআ্যপ এ অর্ডার করুন: {{
                settings.get('whatsapp_number').replace('+88', '')
              }}
            </a>
            <a :href="`https://m.me/${settings.get('messenger_link')}`" target="_blank"
              class="text-white bn rounded bg-black hover:bg-gray-600 transition-all flex items-center gap-2 p-2 cursor-pointer justify-center">
              <FacebookIcon class="w-4 h-4" /> ম্যাসেজের মাধ্যমে অর্ডার করতে ক্লিক করুন
            </a>
          </div> -->
          <!-- Categories -->
          <div class="my-2 px-2 lg:px-0">
            <span class="text-slate-800">
              Categories:
            </span>
            <template v-for="(cat, index) in product.categories" :key="cat.id">
              <RouterLink :to="`/category/${cat.slug}`" class="text-black hover:text-gray-600 cursor-pointer">
                {{ cat.name }}
              </RouterLink>
              <span v-if="index !== product.categories.length - 1" class="text-gray-500">, </span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Description -->
    <!-- <div v-if="product && !loading" class="lg:mt-6 p-1 lg:p-3 w-full">
      <div class="text-lg font-semibold mb-2 w-full bg-red-500 text-white text-center p-2">Description</div>
      <p v-html="product.description" class="text-gray-700 whitespace-pre-line p-2"></p>
    </div> -->
    <!-- Similar Products -->
    <div v-if="similars.length > -1 && !loading" class="mt-10 p-1 w-full">
      <div class="text-lg font-semibold mb-2 w-full bg-slate-300 text-center p-2">Similar Products</div>
      <div class="flex flex-row flex-wrap p-1 relative">
        <ProductCard :cols="4" v-for="product in similars" :key="product.id" :product="product" />
      </div>
    </div>
    <!-- Error -->
    <div v-else class="text-center text-red-500 p-5">{{ error }}</div>
  </div>
</template>

<script setup>
import ProductCard from '@/components/product/ProductCard.vue'
import BDT from '@/components/ui/BDT.vue'
import Carousel from '@/components/ui/Carousel.vue'
import Loading from '@/components/ui/Loading.vue'
import api from '@/lib/api'
import { trackAddToCart, trackViewContent } from '@/lib/pixel'
import { formatBDT } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'
import { useSettingsStore } from '@/stores/settings'
import { useHead } from '@vueuse/head'
import { FacebookIcon, MessageSquare, Phone } from 'lucide-vue-next'
import { computed, KeepAlive, onMounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate, RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const settings = useSettingsStore()

const product = ref(null)
const error = ref('')
const loading = ref(true)
const currentIndex = ref(0)
const selectedVariant = ref(null)
const selectedColor = ref(null)
const quantity = ref(1)
const addingToCart = ref(false)
const buyingNow = ref(false)
const similars = ref([])

const wp_message = computed(() => {
  if (product.value) {
    const msg = `I want to know about ${product.value.name}`
    return msg;
  }
  return ''
})

const canPurchase = computed(() => {
  return product.value?.is_active && (product.value?.stock ?? 0) > 0
})

const maxStock = computed(() => {
  if (!product.value) return 0;

  let variantStock = Infinity;
  let colorStock = Infinity;

  if (product.value.variants && selectedVariant.value) {
    const variant = product.value.variants.find(v => v.id === selectedVariant.value);
    variantStock = variant?.stock ?? Infinity;
  }
  if (product.value.colors && selectedColor.value) {
    const color = product.value.colors.find(c => c.id === selectedColor.value);
    colorStock = color?.stock ?? Infinity;
  }

  return Math.min(product.value.stock ?? Infinity, variantStock, colorStock);
});

async function fetchSimilars(id) {
  // Fetch suggestions based on the product ID
  const suggestionsRes = await api.get(`/products/${id}/suggestions`)
  similars.value = suggestionsRes.data
}

const fetchProduct = async (slug) => {
  try {
    loading.value = true
    const { data } = await api.get(`/products/${slug || route.params.slug}/`)
    product.value = data
    // console.log(product.value)
    if(product.value){
      trackViewContent({
        content_name: `Product: ${product.value.name}`,
        content_ids: [product.value.id],
        content_type: 'product',
        value: product.value.net_price || product.value.price,
        currency: 'BDT',
      })
    }
    fetchSimilars(data.id)
  } catch (e) {
    error.value = 'Failed to load product'
    alert(e)
  } finally {
    loading.value = false
  }
}

watch(product, (newProduct) => {
  if (!newProduct) return

  useHead({
    title: `${newProduct.name} - Buy Products Online`,
    meta: [
      {
        name: 'description',
        content: newProduct.description || `Browse ${newProduct.name} products online.`
      },
      { property: 'og:title', content: newProduct.name },
      {
        property: 'og:description',
        content: newProduct.description || ''
      },
      {
        property: 'og:image',
        content: newProduct.image?.image || '/default-category.jpg'
      }
    ]
  })
})

const errorMessage = ref('')

const handleAddToCart = async (buying = false) => {
  errorMessage.value = ''

  if (!product.value?.id || quantity.value < 1) return

  // Validate color selection if variants exist
  if (product.value.variants?.length && !selectedVariant.value) {
    errorMessage.value += `${errorMessage.value === "" ? '' : '\n'}` + 'Please select a variant.'
    return
  }

  // Validate color selection if colors exist
  if (product.value.colors?.length && !selectedColor.value) {
    errorMessage.value += `${errorMessage.value === "" ? '' : '\n'}` + 'Please select a color.'
    return
  }

  const payload = {
    product: product.value.id,
    quantity: quantity.value,
  }
  if (selectedVariant.value) payload.variant = selectedVariant.value
  if (selectedColor.value) payload.color = selectedColor.value

  if (!buying) addingToCart.value = true
  try {
    await cart.addToCart(payload)

    trackAddToCart({
      content_name: product.value.name,
      content_ids: [product.value.id],
      content_type: 'product',
      value: parseFloat(product.value.net_price || product.value.price),
      currency: 'BDT',
      quantity: quantity.value
    })
  } catch (e) {
    alert(e.message || 'Failed to add to cart')
  } finally {
    if (!buying) addingToCart.value = false
  }
}

async function handleBuyNow() {
  buyingNow.value = true
  try{
    await handleAddToCart()
    trackAddToCart({
      content_name: product.value.name,
      content_ids: [product.value.id],
      content_type: 'product',
      value: parseFloat(product.value.net_price || product.value.price),
      currency: 'BDT',
      quantity: quantity.value
    })
    router.push("/checkout")
  }catch(e){
    console.error(e)
  }
  finally{
    buyingNow.value = false
  }
}

let slideInterval = null;
let seconds = 0;
let hold = false;

const nextSlide = () => {
  hold = false;
  seconds = 0;
  currentIndex.value = (currentIndex.value + 1) % product.value.images.length
}
const prevSlide = () => {
  hold = false;
  seconds = 0;
  currentIndex.value =
    currentIndex.value === 0 ? product.value.images.length - 1 : currentIndex.value - 1
}
const goToSlide = (index) => {
  currentIndex.value = index
}

let isRollingBack = false;

watch(quantity, (newVal) => {
  if (isRollingBack) {
    isRollingBack = false; // Reset here, NOT inside the if block!
    return;
  }
  if (newVal > maxStock) {
    isRollingBack = true;
    quantity.value = maxStock;
  }
  if (newVal === 0) {
    isRollingBack = true;
    quantity.value = 1;
  }
});

onBeforeRouteUpdate((to, from, next) => {
  if (to.params.slug !== from.params.slug) {
    fetchProduct(to.params.slug)
    window.scrollTo({ top: 0 })
  }
  next()
})
onMounted(() => {
  fetchProduct();
  window.scrollTo({ top: 0 });
});

</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
