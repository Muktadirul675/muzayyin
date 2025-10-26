<script setup>
import { RouterLink } from 'vue-router'
import ProductCard from '../product/ProductCard.vue'

const { section } = defineProps({
  section: Object
})
</script>

<template>
  <div v-if="section?.products?.length" class="my-2 flex justify-center w-full">
    <div class="w-full lg:w-[65%] p-2">
      <div class="flex gap-2 flex-wrap items-center justify-between mb-2">
        <div class="flex-1 m-1 p-2 text-center rounded-md font-bold bg-gray-300 text-2xl md:text-3xl truncate">
          {{ section.title }}
          <!-- <div class="w-full h-[1px] my-[2px] bg-red-500 opacity-30"></div> -->
        </div>
        <!-- <RouterLink v-if="section?.category?.slug" :to="`/category/${section.category.slug}`"
          class="text-white rounded px-2 py-1 bg-red-500 hover:bg-red-600 transition">
          See All
        </RouterLink> -->
      </div>

      <div class="flex flex-wrap">
        <ProductCard
          v-for="product in section.products"
          :key="product.id"
          :product="product"
          v-memo="[product.id]"
        />
      </div>
    </div>
  </div>
</template>