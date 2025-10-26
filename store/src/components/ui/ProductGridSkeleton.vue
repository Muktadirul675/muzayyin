<template>
  <div class="w-full lg:w-[65%] mx-auto m-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    <div
      v-for="n in count"
      :key="n"
      class="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow"
    >
      <div class="h-48 w-full rounded-lg bg-gray-200"></div>
      <div class="mt-4 h-4 w-3/4 rounded bg-gray-200"></div>
      <div class="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
      <div class="mt-4 h-8 w-full rounded bg-gray-200"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 6,
  },
})
</script>