<script setup>
import { computed } from 'vue';
import Preview from '../Preview.vue';
import { useBuilderStore } from '@/stores/builder';
import ProductCard from './product/ProductCard.vue';

const props = defineProps({
    uid: Number
})
const builder = useBuilderStore()
const section = computed(()=>builder.feed.find((s)=>s.uid === props.uid))
</script>

<template>
    <Preview :uid="props.uid">
          <div v-if="section?.products?.length" class="my-2 flex justify-center w-full">
    <div class="w-full @lg:w-[65%] p-2">
      <div class="flex gap-2 flex-wrap items-center justify-between mb-2">
        <div class="flex-1 m-1 p-2 text-center rounded-md font-bold bg-gray-300 text-2xl @md:text-3xl truncate">
          {{ section.title }}
          <!-- <div class="w-full h-[1px] my-[2px] bg-red-500 opacity-30"></div> -->
        </div>
        <!-- <span v-if="section?.category?.slug" :to="`/category/${section.category.slug}`"
          class="text-white rounded px-2 py-1 bg-red-500 hover:bg-red-600 transition">
          See All
        </span> -->
      </div>

      <div class="flex flex-wrap">
        <template v-for="product in section.products" :key="product.id">
          <ProductCard :product="product" v-memo="[product.id]" />
        </template>
      </div>
    </div>
  </div>
    </Preview>
</template>
