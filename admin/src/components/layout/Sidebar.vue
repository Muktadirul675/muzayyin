<template>
  <aside class="w-64 bg-gray-800 text-white h-screen fixed">
    <div class="text-2xl font-bold p-4 border-b border-gray-700">
      <i class="pi pi-chart-line mr-2"></i> 
      <span v-if="auth.isAdmin">Admin</span>
      <span v-else-if="auth.isStaff">Staff</span>
      <span v-else>Error</span>
    </div>
    <nav class="mt-4 flex flex-col space-y-2 px-4">
      <RouterLink v-if="auth.isAdmin" to="/dashboard" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-home"></i>
        <span>Dashboard</span>
      </RouterLink>

      <RouterLink v-if="auth.isAdmin" to="/users" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-users"></i>
        <span>Users</span>
      </RouterLink>

      <RouterLink v-if="auth.isAdmin" to="/products" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-box"></i>
        <span>Products</span>
        <div class="ms-auto">
          <div class="flex items-center flex-row gap-3 text-sm">
            <div v-if="products.low_stocks.length" class="">
              <i class="pi pi-exclamation-circle me-2"></i>
              <span>{{ products.low_stocks.length }}</span>
            </div>
            <div v-if="products.unavailables.length" class="">
              <i class="pi pi-times-circle me-2"></i>
              <span>{{ products.unavailables.length }}</span>
            </div>
          </div>
        </div>
      </RouterLink>

      <RouterLink v-if="auth.isAdmin || auth.isStaff" to="/orders" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-shopping-cart"></i>
        <span>Orders</span>
      </RouterLink>

      <RouterLink v-if="auth.isAdmin" to="/dashboard/orders" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-shopping-cart"></i>
        <span>Orders Overview</span>
      </RouterLink>

      <RouterLink v-if="auth.isAdmin||auth.isStaff" to="/couriers" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-truck"></i>
        <span>Courier</span>
      </RouterLink>

      <RouterLink v-if="auth.isAdmin" to="/logs" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-file"></i>
        <span>Logs</span>
      </RouterLink>

      <RouterLink v-if="auth.isAdmin" to="/builder" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-th-large"></i>
        <span>Builder</span>
      </RouterLink>

      <RouterLink v-if="auth.isAdmin" to="/settings" class="hover:bg-gray-700 p-2 rounded flex items-center space-x-2">
        <i class="pi pi-sliders-h"></i>
        <span>Settings</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from '@/stores/products';
import { RouterLink } from 'vue-router'
const products = useProductStore()
const auth = useAuthStore()
</script>