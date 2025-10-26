<script setup>
import { useBuilderStore } from '@/stores/builder';
import { computed, ref } from 'vue';
import Preview from '../Preview.vue';

const props = defineProps({
  uid: Number
})

const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))

const current = ref(0)

function next() {
  current.value = (current.value + 1) % section.value.images.length
}

function prev() {
  current.value = (current.value - 1 + section.value.images.length) % section.value.images.length
}
</script>

<template>
  <Preview :uid="props.uid">
   <div class="w-full bg--100 flex justify-center">
    <div class="relative w-full @lg:w-[65%] overflow-hidden">
      <!-- Slides -->
      <div
        v-if="props.section?.images?.length"
        class="flex transition-transform ease-in-out duration-500 w-full"
        :style="{ transform: `translateX(-${current * 100}%)` }"
      >
        <img
          v-for="(image, index) in props.section.images"
          :key="index"
          :src="image.image"
          class="w-full flex-shrink-0"
          alt="Slide"
          loading="lazy"
          decoding="async"
        />
      </div>

      <!-- Navigation -->
      <button
        v-if="props.section?.images?.length > 1"
        @click="prev"
        class="absolute cursor-pointer top-1/2 left-4 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
        aria-label="Previous Slide"
      >
        <i class="pi pi-angle-left"></i>
      </button>
      <button
        v-if="props.section?.images?.length > 1"
        @click="next"
        class="absolute cursor-pointer top-1/2 right-4 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
        aria-label="Next Slide"
      >
        <i class="pi pi-angle-right"></i>
      </button>
    </div>
  </div>
  </Preview>
</template>