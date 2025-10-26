<template>
  <div>
    <div class="flex items-center">
      <FormLabel :icon="icon">{{ label }}</FormLabel>
      <i class="pi pi-close ms-auto text-red-500" @click="open = false"></i>
    </div>
    <div class="relative">
      <input
        type="text"
        v-model="search"
        placeholder="Search..."
        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @click="open = !open"
      />

      <div
        v-if="open"
        class="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow max-h-[400px] overflow-y-auto divide-y divide-gray-300"
      >
        <div
          v-for="item in filtered"
          :key="item[itemKey]"
          class="px-3 py-2 text-sm hover:bg-indigo-100 cursor-pointer"
          @click="select(item)"
        >
          {{ item[itemLabel] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import FormLabel from './FormLabel.vue'
const props = defineProps({
  items: Array,
  label: String,
  icon: String,
  itemKey: String,
  itemLabel: String,
  modelValue: [String, Number],
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue', 'change'])
const search = ref('')
const open = ref(false)

const filtered = computed(() =>
  search.value
    ? props.items.filter(i => i[props.itemLabel].toLowerCase().includes(search.value.toLowerCase()))
    : props.items
)

function select(item) {
  emit('update:modelValue', item[props.itemKey])
  emit('change', item)
  search.value = item[props.itemLabel]
  open.value = false
}
</script>