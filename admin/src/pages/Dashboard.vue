<template>
  <div class="max-w-[90vw] mx-auto py-5 space-y-5">
    <!-- Page Title -->
    <!-- <h1 class="text-3xl font-bold text-gray-800 mb-4">
      Admin Dashboard
    </h1> -->

    <!-- Visits Summary -->
    <!-- Visits & Logs -->
    <!-- Visits & Logs -->
    <section class="bg-white p-6 rounded shadow">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-800 flex items-center">
          <i class="pi pi-eye mr-2"></i> Visits & Logs
        </h1>
        <div class="flex items-center gap-2">
          <i v-if="fetching.visits" class="pi pi-spinner pi-spin text-blue-500 text-lg"></i>
          <i class="pi pi-refresh text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition"
            @click="refreshVisits" title="Refresh Visits"></i>
        </div>
      </div>
      <Visits />
    </section>

    <!-- Orders Overview -->
    <section class="bg-white p-6 rounded shadow">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-800 flex items-center">
          <i class="pi pi-shopping-cart mr-2"></i> Orders Overview
        </h1>
        <div class="flex items-center gap-2">
          <i v-if="fetching.orders" class="pi pi-spinner pi-spin text-blue-500 text-lg"></i>
          <i class="pi pi-refresh text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition"
            @click="refreshOrders" title="Refresh Orders"></i>
        </div>
      </div>
      <Orders />
    </section>

    <!-- Sales Overview -->
    <section class="bg-white p-6 rounded shadow">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-800 flex items-center">
          <i class="pi pi-dollar mr-2"></i> Sales Overview
        </h1>
        <div class="flex items-center gap-2">
          <i v-if="fetching.sales" class="pi pi-spinner pi-spin text-blue-500 text-lg"></i>
          <i class="pi pi-refresh text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition"
            @click="refreshSales" title="Refresh Sales"></i>
        </div>
      </div>
      <Sales />
    </section>

    <!-- Products Performance -->
    <section class="bg-white p-6 rounded shadow">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-800 flex items-center">
          <i class="pi pi-box mr-2"></i> Products Performance
        </h1>
        <div class="flex items-center gap-2">
          <i v-if="fetching.products" class="pi pi-spinner pi-spin text-blue-500 text-lg"></i>
          <i class="pi pi-refresh text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition"
            @click="refreshProducts" title="Refresh Products"></i>
        </div>
      </div>
      <ProductPerfomance />
    </section>
  </div>
</template>

<script setup>
import Orders from '@/components/dashboard/Orders.vue';
import ProductPerfomance from '@/components/dashboard/ProductPerfomance.vue';
import Sales from '@/components/dashboard/Sales.vue';
import Visits from '@/components/dashboard/Visits.vue';
import { useOrdersAnalyticsStore } from '@/stores/analytics/orders';
import { useProductAnalyticsStore } from '@/stores/analytics/products';
import { useSalesAnalyticsStore } from '@/stores/analytics/sales';
import { useVisitsAnalyticsStore } from '@/stores/analytics/visits';
import { useHead } from '@vueuse/head';
import { reactive } from 'vue';

useHead({
  title:'Panel - Muzayyin.com.bd'
})

const visits = useVisitsAnalyticsStore()
const orders = useOrdersAnalyticsStore()
const products = useProductAnalyticsStore()
const sales = useSalesAnalyticsStore()

const fetching = reactive({
  orders: false,
  visits: false,
  products: false,
  sales: false
})

function refreshVisits() {
  if (!fetching.visits) {
    fetching.visits = true
    visits.fetchAll()
    fetching.visits = false
  }
}

function refreshSales() {
  if (!fetching.sales) {
    fetching.sales = true
    sales.fetchSalesReport()
    sales.fetchSummary()
    fetching.sales = false
  }
}

function refreshOrders() {
  if (!fetching.orders) {
    fetching.orders = true
    orders.fetchReport()
    orders.fetchSummary()
    fetching.orders = false
  }
}

function refreshProducts() {
  if (!fetching.products) {
    fetching.products = true
    products.fetchPerformance()
    products.fetchReport()
    fetching.products = false
  }
}

</script>