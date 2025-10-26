<!-- components/ToastContainer.vue -->
<template>
  <Teleport to="body">
    <div class="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3">
      <TransitionGroup name="toast" tag="div">
        <div v-for="toast in toasts" :key="toast.id"
          :class="`flex items-start gap-2 mb-2 px-4 py-3 rounded-lg shadow border border-gray-300 bg-white min-w-[250px] max-w-md animate-fade-in ${borderClass(toast.type)}`">
          <i :class="iconClass(toast.type)" class="text-xl mt-0.5 shrink-0"></i>
          <span class="text-sm text-gray-800">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { toasts } from '@/lib/toast'

const borderClass = (type) => {
  switch (type) {
    case 'success': return 'border-green-500'
    case 'error': return 'border-red-500'
    case 'info': return 'border-blue-500'
    default: return 'border-gray-500'
  }
}

const iconClass = (type) => {
  switch (type) {
    case 'success': return 'pi pi-check-circle text-green-500'
    case 'error': return 'pi pi-times-circle text-red-500'
    case 'info': return 'pi pi-info-circle text-blue-500'
    default: return 'pi pi-bell text-gray-500'
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.toast-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
</style>