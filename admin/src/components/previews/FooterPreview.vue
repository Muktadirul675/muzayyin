<template>
  <Preview :uid="props.uid">
    <div class="w-full bg-black text-white py-6 px-4">
    <div class="w-full @lg:w-[65%] mx-auto flex flex-col @md:flex-row @md:items-start @md:justify-between gap-6">
      <!-- Left Side: Logo + Info -->
      <div class="flex flex-col items-start gap-2 w-full @md:w-1/3 text-left">
        <img v-if="section.args?.logo" :src="`${BACKEND_URL}${section.args.logo}`" alt="Logo"
          class="h-12 w-auto mb-2" />
        <p v-if="section.args?.description" class="text-sm">
          {{ section.args.description }}
        </p>
        <div v-if="section.args?.address" class="text-sm">
          <i class="pi me-2 pi-building"></i> {{ section.args.address }}
        </div>
        <div v-if="section.args?.phone" class="text-sm">
          <i class="pi me-2 pi-phone"></i> {{ section.args.phone }}
        </div>
        <div v-if="section.args?.email" class="text-sm">
          <i class="pi me-2 pi-envelope"></i> {{ section.args.email }}
        </div>
      </div>

      <div class="flex flex-col items-start gap-2 w-full @md:w-1/3 text-left py-3">
        <div class="uppercase font-semibold">
          Useful Links
        </div>
        <div class="flex flex-col py-3 gap-2">
          <span :to="`/about`">About Us</span>
          <span :to="`/contact`">Contact Us</span>
          <span :to="`/terms-and-conditions`">Teems and Condition</span>
          <span :to="`/return-and-refunds`">Return and Refunds</span>
        </div>
      </div>

      <!-- Right Side: Facebook Page Button -->

      <div class="flex flex-col items-start @md:items-end w-full @md:w-1/3 text-left @md:text-right gap-2">
        <div class="text-lg font-semibold">Follow us on Facebook</div>
        <iframe
          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1E8jUYbdar%2F&tabs=timeline&width=0&height=0&@small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
          width="0" height="0" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
        <!-- {{ section.args.facebook || 'https://www.facebook.com/zilmil.com.bd' }} -->
        <div class="fb-page" :data-href="section.args.facebook || 'https://www.facebook.com/zilmil.com.bd'" data-tabs=""
          data-width="" data-height="" data-small-header="true" data-adapt-container-width="true"
          data-hide-cover="false" data-show-facepile="true">
          <blockquote :cite="section.args.facebook || 'https://www.facebook.com/zilmil.com.bd'"
            class="fb-xfbml-parse-ignore">
            <a :href="section.args.facebook || 'https://www.facebook.com/zilmil.com.bd'">Zilmil Online Shopping</a>
          </blockquote>
        </div>
        <a :href="section.args?.facebook || 'https://www.facebook.com/zilmil.com.bd'" target="_blank" rel="noopener"
          class="bg-white text-red-500 px-4 py-2 rounded hover:bg-red-100 transition-all text-sm font-medium">
          Visit Facebook Page
        </a>
      </div>

    </div>
  </div>
  </Preview>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useBuilderStore } from '@/stores/builder';
import Preview from '../Preview.vue';

const props = defineProps({
  uid: Number
})
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const builder = useBuilderStore()
const section = computed(() => builder.feed.find(s => s.uid === props.uid) || {})

// watch(section, () => {
//   if (window.FB) {
//     window.FB.XFBML.parse() // Parse new Facebook elements
//   }
// },{deep:true, immediate:true})
</script>