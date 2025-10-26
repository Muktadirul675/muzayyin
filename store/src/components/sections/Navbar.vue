<script setup>
import { RouterLink } from 'vue-router';
import CartIcon from '../cart/CartIcon.vue';
import SearchBox from '../navbar/SearchBox.vue';
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import NavbarSidebarItem from './NavbarSidebarItem.vue';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const { section } = defineProps({
  section: Object
})
const settings = useSettingsStore()
const showSidebar = ref(false)
const showSearchBox = ref(false)
</script>

<template>
  <div v-if="showSidebar" @click="showSidebar = false" class="fixed inset-0 bg-transparent z-21"></div>
  <div
    :class="`${showSidebar ? 'translate-x-0' : '-translate-x-full'} z-22 bg-white border w-[70%] transition-all fixed inset-0 border-gray-300 rounded-tr rounded-br p-3`">
    <div class="w-full flex flex-col">
      <i class="ms-auto cursor-pointer pi pi-times hover:text-red-500" @click="showSidebar = false"></i>
      <div class="flex flex-row p-3 bg-slate-50">
        <img src="/logo.png" alt="" class="w-[80%] h-auto">
      </div>
      <div class="text-red-500 font-semibold px-3">muzayyin.com</div>
      <div class="w-full my-2 h-[1px] bg-gray-300 rounded"></div>
      <div class="p-3" v-if="section.args?.all_categories">
        <template v-for="(cat, index) in section.args.all_categories" :key="index">
          <NavbarSidebarItem @close="showSidebar = false" :category="cat" />
        </template>
      </div>
    </div>
  </div>
  <div class="flex w-full flex-col sticky top-0 z-20">
    <nav class="bg-white shadow px-3 lg:px-6 py-3 flex items-center justify-center">
      <div class="flex w-full lg:w-[65%]">
        <div class="flex w-full flex-row items-center md:w- gap-3">
          <div class="w-1/2 flex flex-row items-center gap-2">
            <span class="lg:hidden">
              <i @click="showSidebar = !showSidebar" class="pi pi-bars cursor-pointer hover:text-red-500"></i>
            </span>
            <RouterLink to="/">
              <img v-if="section?.args" :src="section.args.preview || `${BACKEND_URL}${section.args.logo}`" alt="Logo"
                class="h-8 w-auto" />
            </RouterLink>
          </div>
          <div class="w-1/2 flex flex-row items-center">
            <div class="hidden lg:block -translate-x-1/2">
              <SearchBox />
            </div>
            <a :href="`https://wa.me/${settings.get('whatsapp_number')}`"
              class="hidden lg:flex flex-row items-center mx-auto -translate-x-1/2">
              <img src="/helpline.png" alt="" class="w-10 h-10">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-800">
                  {{ settings.get('whatsapp_number') }}
                </span>
                <span class="w-full font-semibold text-justify text-sm [text-align-last:center] [text-justify:inter-character]">
                  Hotline Number
                </span>
              </div>
            </a>
            <div class="ms-auto flex items-center gap-3">
              <div @click="showSearchBox = !showSearchBox" class="flex items-center md:hidden">
                <i class="pi pi-search text-xl"></i>
              </div>
              <CartIcon />
            </div>
          </div>
        </div>
      </div>
    </nav>
    <div
      :class="`md:hidden ${showSearchBox ? '' : 'overflow-hidden'} flex z-10 flex-row items-center gap-1 border-b border-gray-300 shadow-sm bg-white px-2 transition-all ${showSearchBox ? 'h-[80px]' : 'h-0'}`">
      <SearchBox @close="showSearchBox = false" />
      <i @click="showSearchBox = false" class="pi pi-times text-xl"></i>
    </div>
  </div>
</template>