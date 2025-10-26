<script setup>
defineOptions({ name: 'HomeView' })

import Loading from '@/components/ui/Loading.vue'
import ProductGridSkeleton from '@/components/ui/ProductGridSkeleton.vue'
import { trackPageView } from '@/lib/pixel'
import { useFeedStore } from '@/stores/feed'
import { useHead } from '@vueuse/head'
import { defineAsyncComponent, onActivated, onMounted } from 'vue'

const ImageSlider = defineAsyncComponent(() => import('@/components/sections/ImageSlider.vue'))
const Products = defineAsyncComponent(() => import('@/components/sections/Products.vue'))
const Category = defineAsyncComponent(() => import('@/components/sections/Category.vue'))
const CategorySlider = defineAsyncComponent(() => import('@/components/sections/CategorySlider.vue'))

const feedStore = useFeedStore()

const componentMap = {
  image_slider: ImageSlider,
  products: Products,
  category: Category,
  categories_slider: CategorySlider,
}

onActivated(()=>{
  useHead({
    title: "Muzayyin Online Shopping"
  })
})

onMounted(()=>{
  trackPageView({
    content_name: 'Home Page'
  })
})
</script>

<template>
  <div v-show="feedStore.sections.length">
    <div v-for="section in feedStore.sections" :key="section.id" v-memo="[section.id]">
      <Suspense>
        <template #default>
          <component :is="componentMap[section.type]" :section="section" />
        </template>
        <template #fallback>
          <ProductGridSkeleton v-if="section.type === 'category' || section.type === 'products'" />
        </template>
      </Suspense>
    </div>
  </div>
  <Loading v-show="!feedStore.sections.length" />
</template>