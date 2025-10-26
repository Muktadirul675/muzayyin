<script setup>
import { ref, watch } from 'vue';

const shake = ref(false);
</script>

<template>
  <div class="flex items-center gap-6 text-gray-700 font-medium">
    <!-- <div class="mx-2">
      <i class="pi pi-spin pi-spinner"></i>
    </div> -->
    <span to="/cart"  class="hover:text-gray-500 flex items-center gap-2 group">
      <i class="pi pi-shopping-cart text-2xl"></i>
      <div
        class="bg-black group-hover:text-red text-white px-2 py-0.5 rounded-md"
        :class="{ 'shake': shake }"
      >
        {{ 0 }}
      </div>
    </span>
</div>
</template>

<style scoped>
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  50% { transform: translateX(3px); }
  75% { transform: translateX(-3px); }
  100% { transform: translateX(0); }
}

.shake {
  animation: shake 0.4s ease-in-out;
}
</style>