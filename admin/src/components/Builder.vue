<script setup>
import { useBuilderStore } from '@/stores/builder'
import { capitalize, computed } from 'vue'
import AddBuilder from './builders/AddBuilder.vue'
import { convert_to_normal_word } from '@/services/utils'

const props = defineProps({ uid: Number })
let id = 0

const builder = useBuilderStore()

const section = computed(() => builder.feed.find(s => s.uid === props.uid))

function hightlightC(val) {
  section.value.highlightC = val
}
</script>
<template>
  <div :class="`p-3 ${section.highlightP ? 'border rounded  border-blue-500' : null}`"
    @mouseenter="() => hightlightC(true)" @mouseleave="() => hightlightC(false)">
    <div class="flex hover:bg-slate-50 transition-all items-center cursor-pointer flex-row" @click="section.show = !section.show">
      <AddBuilder :uid="props.uid"/>
      <i :class="`pi pi-angle-down transition-all p-1 hover:bg-slate-100 ${section.show ? 'rotate-180' :''}`"></i> 
      [{{ convert_to_normal_word(section.type) }}] {{ convert_to_normal_word(section.title) }}
      <div class="ms-auto flex flex-row items-center gap-2">
        <i @click.stop="builder.remove(props.uid)" class="pi rounded-lg pi-trash text-red-500 p-1 hover:bg-red-200"></i>
        <i @click.stop="builder.swap(props.uid, -1)" class="pi rounded-lg pi-angle-up p-1 hover:bg-slate-100"></i>
        <i @click.stop="builder.swap(props.uid, 1)" class="pi rounded-lg pi-angle-down p-1 hover:bg-slate-100"></i>
      </div>
    </div>
    <div v-show="section.show">
      <div class="label">
        Title
      </div>
      <input type="text" v-model="section.title" class="input">
      <slot></slot>
    </div>
  </div>
</template>