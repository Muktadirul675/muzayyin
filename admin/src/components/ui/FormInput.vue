<template>
    <div>
        <FormLabel :icon="icon">{{label}}</FormLabel>
        <input :type="type" :value="model" @input="model = $event.target.value" v-bind="$attrs"
            class="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import FormLabel from './FormLabel.vue'
const { modelValue, type,label,icon } = defineProps(['modelValue', 'type','label','icon'])
const emit = defineEmits(['update:modelValue'])

const model = computed({
    get: () => modelValue,
    set: (value) => emit('update:modelValue', value),
})
</script>