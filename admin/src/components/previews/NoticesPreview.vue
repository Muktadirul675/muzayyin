<script setup>
import { useBuilderStore } from '@/stores/builder';
import { computed, ref } from 'vue';
import Preview from '../Preview.vue';

const props = defineProps({
  uid: Number
})
let sec = 0;
const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))
const active = ref(0)

function left() {
  const len = section.value.notices.length
  active.value = (active.value - 1 + len) % len
  sec = 0;
}

function right() {
  const len = section.value.notices.length
  active.value = (active.value + 1) % len
  sec = 0;
}

setInterval(()=>{
  if(sec === 5){
    right()
    sec = 0;
  }else sec++;
},1000)
</script>

<template>
    <Preview :uid="uid">
        <template v-if="section.notices.length === 0">
          <div class="w-full p-3 bg-slate-50">No Notice</div>
        </template>
      
        <template v-else-if="section.notices.length === 1">
          <div class="w-full flex flex-row justify-around p-3 bg-red-500 text-white">
            {{ section.notices[0].text }}
          </div>
        </template>
      
        <template v-else>
          <div class="p-2 w-full flex flex-row justify-around bg-red-500 text-white">
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
    </Preview>
</template>