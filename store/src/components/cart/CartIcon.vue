<script setup>
import { useCartStore } from '@/stores/cart';
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

const cart = useCartStore();
const shake = ref(false);

watch(
  () => cart.cart?.total_items,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      shake.value = false;
      requestAnimationFrame(() => {
        shake.value = true;
        setTimeout(() => {
          shake.value = false;
        }, 400);
      });
    }
  }
);
</script>

<template>
  <div class="flex items-center gap-6 text-gray-700 font-medium">
    <div class="mx-2" v-if="cart.loading">
      <i class="pi pi-spin pi-spinner"></i>
    </div>
    <RouterLink to="/cart" v-else-if="cart.cart" class="hover:text-gray-500 flex items-center gap-2 group">
      <i class="pi pi-shopping-cart text-2xl"></i>
      <div
        class="bg-black group-hover:text-red text-white px-2 py-0.5 rounded-md"
        :class="{ 'shake': shake }"
      >
        {{ cart.cart.total_items }}
      </div>
    </RouterLink>
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