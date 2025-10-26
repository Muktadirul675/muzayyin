<script setup>
import { onBeforeMount, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import 'vue3-toastify/dist/index.css';
import Toaster from './components/Toaster.vue';
import { useActivityStore } from './stores/activities';
import { useVisitsAnalyticsStore } from './stores/analytics/visits';
import { useAuthStore } from './stores/auth';
import { useBuilderStore } from './stores/builder';
import { useOrderStore } from './stores/orders';
import { useProductStore } from './stores/products';
import { useSettingsStore } from './stores/settings';

const auth = useAuthStore()
const products = useProductStore()
const orders = useOrderStore()
const builder = useBuilderStore()
const activity = useActivityStore()
const visits = useVisitsAnalyticsStore()
const settings = useSettingsStore()

onBeforeMount(async () => {
  await auth.fetchUser()
  if(!auth.isAuthenticated) auth.logout()
})

onMounted(async() => {
  products.initProductSocket()
  orders.initOrderSocket()
  activity.connectWebSocket()
  await Promise.all([
    builder.init(),
    activity.fetchActivities(),
    visits.fetchAll(),
    settings.fetchSettings()
  ])

  setInterval(()=>{
    visits.fetchAll()
  },1000*60*2)
  setInterval(async ()=>{
    const wasAdmin = auth.isAdmin;
    const wasStaff = auth.isStaff;
    await auth.fetchUser()
    if(wasAdmin){
      if(!auth.isAdmin){
        auth.logout()
      }
    }
    if(wasStaff){
      if(!auth.isStaff){
        auth.logout()
      }
    }
    if(!auth.isAuthenticated){
      auth.logout()
    }
  },1000*60*5)
})

</script>

<template>
  <RouterView />
  <Toaster/>
</template>
