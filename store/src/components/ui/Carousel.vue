<template>
  <div class="carousel w-full max-w-screen-md mx-auto">
    <!-- Image Area -->
    <div class="relative overflow-hidden">
      <div
        class="carousel-inner flex transition-transform duration-500 ease-in-out"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(img, index) in images"
          :key="index"
          class="carousel-item min-w-full relative flex items-center justify-center bg-slate-100"
        >
          <img
            :ref="el => zoomImages[index] = el"
            :src="img"
            :alt="'Image ' + (index + 1)"
            class="zoom-image w-full lg:rounded-md"
            loading="lazy"
            @mousemove="handleZoom($event, index)"
            @mouseleave="resetZoom(index)"
            @load="prefetchAdjacent(index)"
          />
        </div>
      </div>

      <!-- Navigation buttons -->
      <button
        @click="prev"
        class="absolute z-10 left-2 top-1/2 transform -translate-y-1/2 text-white bg-transparent bg-opacity-50 p-2 rounded-full"
      >
        <i class="pi pi-chevron-left"></i>
      </button>
      <button
        @click="next"
        class="absolute z-10 right-2 top-1/2 transform -translate-y-1/2 text-white bg-transparent bg-opacity-50 p-2 rounded-full"
      >
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>

    <!-- Thumbnails -->
    <div class="thumbnails flex flex-wrap justify-center gap-2 mt-4">
      <img
        v-for="(img, index) in images"
        :key="'thumb-' + index"
        :src="img"
        :alt="'Thumbnail ' + (index + 1)"
        class="w-16 h-16 object-cover border cursor-pointer rounded"
        :class="{ 'border-blue-500': currentIndex === index }"
        @click="currentIndex = index"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
})

const currentIndex = ref(0)
const zoomImages = ref([])

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}
const prev = () => {
  currentIndex.value =
    (currentIndex.value - 1 + props.images.length) % props.images.length
}

const prefetchAdjacent = (index) => {
  [index - 1, index + 1].forEach((i) => {
    if (props.images[i]) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = props.images[i]
      link.as = 'image'
      document.head.appendChild(link)
    }
  })
}

// Zoom logic
const handleZoom = (event, index) => {
  const img = event.target
  const rect = img.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  img.style.transformOrigin = `${x}% ${y}%`
  img.style.transform = 'scale(2.5)'
}

const resetZoom = (index) => {
  const img = zoomImages.value[index]
  if (img) {
    img.style.transform = ''
    img.style.transformOrigin = ''
  }
}

onMounted(() => {
  prefetchAdjacent(currentIndex.value)
})
</script>

<style scoped>
.carousel-inner {
  display: flex;
}
.zoom-image {
  transition: transform 0.3s ease;
  pointer-events: auto;
}
</style>