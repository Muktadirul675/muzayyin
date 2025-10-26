<script setup>
import Orders from '@/components/dashboard/Orders.vue';
import { useOrdersAnalyticsStore } from '@/stores/analytics/orders';
import { useHead } from '@vueuse/head';
import { reactive } from 'vue';

useHead({
  title:'Orders Overview - Muzayyin.com.bd'
})

const orders = useOrdersAnalyticsStore()

const fetching = reactive({
  orders: false
})

function refreshOrders() {
  if (!fetching.orders) {
    fetching.orders = true
    orders.fetchReport()
    orders.fetchSummary()
    fetching.orders = false
  }
}

</script>
<template>
    <div class="max-w-[90vw] mx-auto py-5 space-y-5">
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
    </div>
</template>