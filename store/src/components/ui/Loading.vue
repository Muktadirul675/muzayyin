<template>
  <div class="flex flex-col items-center justify-center min-h-[200px] space-y-4 text-gray-600">
    <img class="w-[70px] h-[70px]" decoding="async" loading="lazy" :src="randomGif" alt="">
    <div class="text-center text-sm italic">{{ randomMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const messages = [
  'Loading magic...',
  'Warming up the server...',
  'Fetching something awesome...',
  'Almost there...',
  'Hold tight, good things take time!',
  'Generating awesomeness...',
];

const gifs = [
  '/loading.gif',
  '/loading1.gif',
  '/loading2.gif',
]

const randomMessage = ref('');
const randomGif = ref('')

onMounted(() => {
  const index = Math.floor(Math.random() * messages.length);
  const gifIndex = Math.floor(Math.random() * gifs.length);
  randomMessage.value = messages[index];
  randomGif.value = gifs[gifIndex]
});
</script>

<style scoped>
.loader {
  border-top-color: transparent;
}
</style>