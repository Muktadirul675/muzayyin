<template>
    <div class="relative" @mouseenter="() => highlightP(true)" @mouseleave="() => highlightP(false)">
        <!-- {{ section.notices }} -->
        <slot></slot>
        <div v-show="section.highlightC" class="absolute inset-0 bg-blue-500 opacity-20"></div>
    </div>
</template>

<script setup>
import { useBuilderStore } from '@/stores/builder';
import { computed } from 'vue';

const props = defineProps({
    uid: Number
})

const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))

function highlightP(val) {
    section.value.highlightP = val
}

</script>
