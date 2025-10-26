<template>
    <div v-if="items.length">
      <h3 class="text-xl font-semibold mt-10 mb-5 text-gray-800">Added Products</h3>
      <div class="grid  gap-5">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition hover:shadow-lg"
        >
          <img
            :src="BACKEND_URL+item.product.image.image"
            alt="Product"
            class="w-20 h-20 object-cover rounded-md border border-gray-100"
          />
  
          <div class="flex-1 space-y-1">
            <h4 class="text-base font-medium text-gray-900">{{ item.product.name }}</h4>
            <p class="text-sm text-gray-500">
              Variant: <span class="font-medium">{{ item.variant?.name || 'N/A' }}</span> |
              Color: <span class="font-medium">{{ item.color?.name || 'N/A' }}</span>
            </p>
            <div class="text-sm text-gray-700 flex flex-row items-center">
              Quantity: <span class="font-semibold">{{ item.quantity }}</span> &nbsp; | &nbsp;
              <div class="flex flex-row items-center">
                Price: <span class="font-semibold">
                  <BDT :amount="parseFloat(item.price_at_purchase)"/>
                </span>
              </div>
            </div>
          </div>
  
          <button
            v-if="!disabled"
            @click="$emit('remove', index)"
            type="button"
            class="text-sm text-red-500 hover:text-red-600 hover:underline sm:ml-auto mt-2 sm:mt-0"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import BDT from './ui/BDT.vue';

  defineProps({
    items:{
      type: Object
    },
    disabled:{
      type:Boolean,
      default: false
    }
  })
  defineEmits(['remove'])
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  </script>