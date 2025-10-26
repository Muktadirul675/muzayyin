<template>
  <div class="flex">
    <Sidebar />
    <div class="ml-64 w-full">
      <Topbar />
      <main class="p-6 min-h-[calc(100vh-4rem)] bg-gray-50">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
</script>