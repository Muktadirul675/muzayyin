<template>
  <div class="relative md:me-4 p-2 z-10 md:p-0 w-full md:mx-0">
    <div class="flex items-center border rounded border-gray-300 px-4 py-2 shadow-sm bg-white">
      <input type="text" v-model="query" placeholder="Search products..."
        class="w-full md:w-[300px] outline-none text-sm bg-transparent" />
      <i v-if="loading" class="pi pi-spinner pi-spin text-gray-400 ms-auto" />
      <i v-else class="pi pi-search text-gray-500 ms-auto" />
    </div>

    <!-- Dropdown search results -->
    <div v-if="results.length && query"
      class="absolute z-50 w-full bg-white border rounded shadow mt-1 max-h-60 overflow-y-auto">
      <div @click="navigate(item.slug)" v-for="item in results" :to="`/${item.slug}`" :key="item.id"
        class="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between gap-2">
        <div class="flex flex-row items-center gap-2">
          <img :src="`${BACKEND_URL}${item.image.image}`" alt="" class="w-12 h-12 rounded">
          <div class="font-semibold">{{ item.name }}</div>
        </div>
        <div class="flex flex-col items-end">
          <span class="font-semibold text-slate-800">
            <BDT :amount="parseFloat(item.net_price || item.price)" />
          </span>
          <div class="text-gray-500 line-through text-xs">{{ item.net_price ? item.price : item.compared_price }}</div>
        </div>
      </div>

      <div v-if="hasMore" @click="loadMore"
        class="px-4 py-2 text-sm text-center text-blue-500 hover:underline cursor-pointer">
        Load more
      </div>
    </div>
  </div>
  <div v-if="results.length && query" @click="propagate" class="fixed inset-0 bg-transparent z-15 md:w-[100vw] md:h-[100vh] md:-translate-x-1/2 md:ms-[50%] overlay-blocker">
    
  </div>
</template>

<script setup>
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import BDT from '../ui/BDT.vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const searchStore = useSearchStore()
const { query, results, loading, hasMore } = storeToRefs(searchStore)
const { loadMore } = searchStore

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const router = useRouter()

function navigate(slug) {
  emit('close')
  query.value = ''
  router.push(`/product/${slug}`)
}

function propagate(event) {
  // clear query
  query.value = '';

  // temporarily disable overlay's pointer events
  const overlay = event.currentTarget;
  overlay.style.pointerEvents = "none";

  // now find the element underneath
  const underlying = document.elementFromPoint(event.clientX, event.clientY);

  // restore pointer events
  overlay.style.pointerEvents = "";

  // trigger click if found
  if (underlying) {
    underlying.click();
  }
}

</script>

<style scoped>
/* Optional styles if not using Tailwind */
</style>