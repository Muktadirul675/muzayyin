<script setup>
import { useBuilderStore } from '@/stores/builder';
import AddBuilderConfig from './AddBuilderConfig.vue';

const props = defineProps({
    uid:Number
})
const builder = useBuilderStore()
const popId = `section:uid:${props.uid}`
</script>

<template>
    <div @click.stop="builder.pop(popId)" class="p-1 relative rounded hover:bg-slate-200 cursor-pointer`">
        <i class="pi pi-plus-circle"></i>
        <div v-show="builder.popup === popId" class="absolute z-2 bg-white p-3 border border-gray-300 rounded-lg top-0 left-0 ms-auto">
            <AddBuilderConfig :uid="props.uid"/>
        </div>
    </div>
</template>
