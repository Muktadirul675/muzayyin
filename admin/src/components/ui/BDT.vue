<template>
  <span class="inline-flex items-center cursor-pointer hover:opacity-90" :title="formatted">
    <img
      v-if="showIcon"
      src="/bdt.png"
      alt="BDT"
      class="w-4 object-contain"
    />
    <span>{{ formatted }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
})

const formatBDT = (num) => {
  if (num == null) return ''
  const [intPart, decimal] = num.toFixed(2).split('.')
  const lastThree = intPart.slice(-3)
  const otherNumbers = intPart.slice(0, -3)
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') +
    (otherNumbers ? ',' : '') +
    lastThree
  return `${(formatted)}`
}

const formatted = computed(() => formatBDT(props.amount))
</script>