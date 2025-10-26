<script setup>
import { ref } from 'vue'

const { section } = defineProps({
  section: Object
})
let sec = 0
const active = ref(0)

function left() {
  const len = section?.notices?.length || 0
  active.value = (active.value - 1 + len) % len
  sec = 0
}

function right() {
  const len = section?.notices?.length || 0
  active.value = (active.value + 1) % len
  sec = 0
}

setInterval(() => {
  if (!section || !section.notices || section.notices.length <= 1) return
  if (sec === 5) {
    right()
    sec = 0
  } else sec++
}, 1000)
</script>

<template>
    <template v-if="!section?.notices?.length">
      <div class="w-full px-2 py-1 lg:py-2 bg-slate-50">No Notice</div>
    </template>

    <template v-else-if="section.notices.length === 1">
      <div class="w-full flex flex-row justify-around px-2 py-1 lg:py-2 bg-red-500 text-white">
        {{ section.notices[0].text }}
      </div>
    </template>

    <template v-else>
      <div class="px-2 py-1 lg:py-2 w-full flex flex-row justify-around bg-red-500 text-white">
        <div @click="left" class="p-1 hover:bg-red-700 transition-all cursor-pointer">
          <i class="pi pi-angle-left"></i>
        </div>
        <div class="flex-grow text-center">
          {{ section.notices[active].text }}
        </div>
        <div @click="right" class="p-1 hover:bg-red-700 transition-all cursor-pointer">
          <i class="pi pi-angle-right"></i>
        </div>
      </div>
    </template>
</template>