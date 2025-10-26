<template>
  <div class="relative md:me-4 p-2 z-10 md:p-0 w-full md:mx-0">
    <div class="flex items-center border rounded border-gray-300 px-4 py-2 shadow-sm bg-white">
      <input type="text"  placeholder="Search products..."
        class="w-full md:w-[300px] outline-none text-sm bg-transparent" />
      <!-- <i v-if="loading" class="pi pi-spinner pi-spin text-gray-400 ms-auto" /> -->
      <i class="pi pi-search text-gray-500 ms-auto" />
    </div>
  </div>
</template>