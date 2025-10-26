<template>
  <label class="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
    <i :class="`pi pi-${icon}`" />
    <slot />
  </label>
</template>

<script setup>
defineProps({ icon: String })
</script>