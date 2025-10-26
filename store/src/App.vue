<script setup>
import api from '@/lib/api'; // assuming your axios instance is here
import { useCartStore } from '@/stores/cart';
import { useFeedStore } from '@/stores/feed';
import 'primeicons/primeicons.css';
import { computed, KeepAlive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CategoriesBar from './components/sections/CategoriesBar.vue';
import Footer from './components/sections/Footer.vue';
import Navbar from './components/sections/Navbar.vue';
import Notices from './components/sections/Notices.vue';
import { useSettingsStore } from './stores/settings';
import Toaster from './components/composables/Toaster.vue';
import { loadFacebookPixel } from './lib/pixel';

const feed = useFeedStore()
const cart = useCartStore()
const settings = useSettingsStore()

const noticeSection = computed(() =>
  feed.feed.find((section) => section.type === 'notice')
)

const navbarSection = computed(() =>
  feed.feed.find((section) => section.type === 'navbar')
)

const footerSection = computed(() =>
  feed.feed.find((section) => section.type === 'footer')
)

const categoriesBarSection = computed(() =>
  feed.feed.find((section) => section.type === 'categories_bar')
)

const router = useRouter()

async function visit(path, source) {
  try {
    console.log('visiting')
    console.log('source: '+source)
    await api.post('/visits/', { path: path, source:source })
    console.log('visited')
  } catch (e) {
    console.log(`Visiting ERROR: ${e.message}`)
  }
}

function saveUTMSource() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source");

  if (utmSource) {
    sessionStorage.setItem("source", utmSource);
  }
}


router.afterEach((to) => {
  saveUTMSource()
  let source = sessionStorage.getItem('source')
  if(!source){
    source = 'organic'
  }
  if (!['/cart', '/checkout'].includes(to.path)) {
    visit(to.path, source)
  }
})

onMounted(async () => {
  saveUTMSource()
  loadFacebookPixel(import.meta.env.VITE_PIXEL_ID)
  await Promise.all([
    feed.fetchFeed(),
    cart.fetchCart(),
    settings.fetchSettings(),
    await api.get('/visits/active')
  ])
  setInterval(() => {
    api.get('/visits/active')
  }, 170000)
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Toaster/>
    <div class="min-h-[90vh]">
      <template v-if="noticeSection">
        <Notices :section="noticeSection" />
      </template>
      <template v-if="navbarSection">
        <Navbar :section="navbarSection" />
      </template>
      <template v-if="categoriesBarSection">
        <CategoriesBar :section="categoriesBarSection" />
      </template>

      <RouterView v-slot="{ Component }">
        <KeepAlive include="HomeView">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>

    <template v-if="footerSection">
      <Suspense>
        <template #default>
          <Footer :section="footerSection" />
        </template>
      </Suspense>
    </template>
  </div>
</template>