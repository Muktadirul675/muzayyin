<template>
  <div class="max-w-[80%] mx-auto mt-10">
    <div class="bg-white p-6 rounded shadow-md">
      <div v-if="loading" class="text-center py-10">
        <i class="pi pi-spin pi-spinner text-2xl text-indigo-600" />
        <p class="text-sm text-gray-500 mt-2">Adding...</p>
      </div>

      <form v-if="!loading" @submit.prevent="submitOrder">
        <div class="flex items-center justify-between my-2 mb-3">
          <div class="flex flex-row items-center gap-2">
            <BackButton />
            <h2 class="text-2xl font-semibold">Add Order</h2>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Left (Compact Inputs) -->
          <div class="w-full md:w-1/3 space-y-4">
            <FormInput label="Full Name" icon="user" v-model="order.full_name" required />
            <FormInput label="Phone" icon="phone" v-model="order.phone" required />

            <div>
              <FormLabel icon="home">Shipping Address</FormLabel>
              <textarea v-model="order.shipping_address" required placeholder="Shipping Address"
                class="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>

            <div>
              <FormLabel icon="tag">Status</FormLabel>
              <select v-model="order.status"
                class="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option v-for="s in statusOptions" :key="s" :value="s">{{ capitalize(s) }}</option>
              </select>
            </div>

            <div>
              <FormLabel icon="info-circle">Note</FormLabel>
              <textarea v-model="order.note" placeholder="Note"
                class="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>

            <SearchSelect label="District" icon="map-marker" :items="cities" itemKey="city_id" itemLabel="city_name"
              v-model="order.city_id" @change="fetchZones" />
            <div v-if="fetchingCities" class="text-slate-800">
              <i class="pi pi-spin pi-spinner me-2"></i>
              Fetching Districts
            </div>
            <div class="flex flex-row items-center justify-start gap-1">
              <div class="flex-1">
                <SearchSelect v-if="zones.length" label="Zone" icon="globe" :items="zones" itemKey="zone_id"
                  itemLabel="zone_name" v-model="order.zone_id" @change="fetchAreas" :disabled="!order.city_id" />
                <div v-if="fetchingZones" class="text-slate-800">
                  <i class="pi pi-spin pi-spinner me-2"></i>
                  Fetching zones
                </div>
              </div>
              <div class="flex-1">
                <SearchSelect v-if="areas.length" label="Area" icon="location-arrow" :items="areas" itemKey="area_id"
                  itemLabel="area_name" v-model="order.area_id" :disabled="!order.zone_id" />
                <div v-if="fetchingAreas" class="text-slate-800">
                  <i class="pi pi-spin pi-spinner me-2"></i>
                  Fetching areas
                </div>
              </div>
            </div>
            <div class="flex flex-row flex-wrap gap-2 items-start">
              <div class="flex-1">
                <FormInput label="Discount" icon="percentage" v-model="order.order_discount" type="number" />
              </div>
              <div class="flex-1">
                <FormInput label="Delivery Charge" icon="dollar" v-model="order.delivery_charge" type="number" />
                <p v-if="isCalculatingDelivery" class="text-xs text-gray-500 mt-1">Calculating delivery charge...</p>
              </div>
            </div>
            <!-- Total Price -->
            <div class="text-sm font-medium pt-2 flex items-center">
              Total Price:
              <BDT :amount="totalPrice" />
            </div>
            <div class="my-3 flex justify-center w-full">
              <button type="submit"
                class="bg-green-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition cursor-pointer">
                <i class="pi pi-check mr-1" /> Add Order
              </button>
              <p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>
              <p v-if="success" class="text-green-600 text-sm mt-2">Order added successfully!</p>
            </div>
          </div>

          <!-- Right (Wider Product Section) -->
          <div class="w-full md:w-2/3 space-y-4">
            <FraudChecker v-if="order.phone" :number="order.phone" />
            <OrderItemPreview :items="order.items" @remove="i => order.items.splice(i, 1)" />
            <ProductSelector @add="item => order.items.push(item)" />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import ProductSelector from '@/components/ProductSelector.vue'
import OrderItemPreview from '@/components/OrderItemPreview.vue'
import FormInput from '@/components/ui/FormInput.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import SearchSelect from '@/components/ui/SearchSelect.vue'
import BDT from '@/components/ui/BDT.vue'
import BackButton from '@/components/ui/BackButton.vue'
import { toast } from '@/services/toast'
import FraudChecker from '@/components/FraudChecker.vue'
import { useHead } from '@vueuse/head'

useHead({title:"Add Order - Muzayyin.com.bd"})

const router = useRouter()

const order = ref({
  full_name: '',
  phone: '',
  shipping_address: '',
  order_discount: 0,
  delivery_charge: 0,
  status: 'pending',
  note: '',
  city_id: null,
  zone_id: null,
  area_id: null,
  items: [],
})

const statusOptions = ['pending', 'confirmed', 'hold', 'shipped', 'delivered', 'cancelled', 'returned']
const success = ref(false)
const error = ref('')
const loading = ref(false)
const isCalculatingDelivery = ref(false)

const cities = ref([])
const zones = ref([])
const areas = ref([])

const fetchingCities = ref(false)
const fetchingZones = ref(false)
const fetchingAreas = ref(false)

const fetchCities = async () => {
  fetchingCities.value = true
  const res = await api.get('/courier/cities/')
  cities.value = res.data?.data.data || []
  fetchingCities.value = false
}

const fetchZones = async () => {
  fetchingZones.value = true
  order.value.zone_id = null
  order.value.area_id = null
  if (!order.value.city_id) return
  const res = await api.get(`/courier/zones/?city_id=${order.value.city_id}`)
  zones.value = res.data?.data.data || []
  fetchingZones.value = false
}

const fetchAreas = async () => {
  fetchingAreas.value = true
  order.value.area_id = null
  if (!order.value.zone_id) return
  const res = await api.get(`/courier/areas/?zone_id=${order.value.zone_id}`)
  areas.value = res.data?.data.data || []
  fetchingAreas.value = false
}


fetchCities()

watch(
  () => [order.value.city_id, order.value.zone_id],
  async ([cityId, zoneId]) => {
    if (cityId && zoneId) {
      console.log('fetching delivery charge')
      isCalculatingDelivery.value = true
      try {
        const res = await api.get('/courier/delivery-charge/', {
          params: {
            city_id: cityId,
            zone_id: zoneId,
          },
        })
        // console.log(res.data)
        order.value.delivery_charge = res.data?.data?.final_price || 0
      } catch (err) {
        console.error('Failed to fetch delivery charge:', err)
      } finally {
        isCalculatingDelivery.value = false
      }
    }
  }
)

const totalPrice = computed(() => {
  const itemsTotal = order.value.items?.reduce((acc, item) => {
    return acc + (item.price_at_purchase * item.quantity || 0)
  }, 0) || 0

  const discount = Number(order.value.order_discount || 0)
  const delivery = Number(order.value.delivery_charge || 0)

  return itemsTotal - discount + delivery
})

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

async function submitOrder() {
  if (isCalculatingDelivery.value) {
    toast.error("Calculating Delivery Charge")
    return
  }
  loading.value = true
  error.value = ''
  success.value = false

  if (
    !order.value.full_name ||
    !order.value.phone ||
    !order.value.shipping_address ||
    !order.value.status
  ) {
    error.value = 'Name, phone, address, and status are required.'
    loading.value = false
    return
  }

  if(order.value.items.length <=0 ){
    toast.error("At least one item is required")
    loading.value = false;
    return;
  }

  try {
    if (!order.value.order_discount) {
      order.value.order_discount = parseFloat('0')
    }
    const payload = {
      ...order.value,
      items: order.value.items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        color_id: item.color_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      })),
    }

    await api.post('/orders/', payload)
    success.value = true
    router.push('/orders')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to create order.'
  } finally {
    loading.value = false
  }
}
</script>