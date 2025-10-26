<script setup>
import { useBuilderStore } from '@/stores/builder';
import { computed } from 'vue';
import Builder from '../Builder.vue';

const props = defineProps({
    uid: Number
})

const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))
let uid = 3000;

function remove(uid){
  section.value.images = section.value.images.filter((i)=>i.uid !== uid)
}

function onChange(event) {
    const files = event.target.files
    if (files.length) {
        for (const file of files) {
            const sec = {
                uid: uid++,
                file: file,
                preview: URL.createObjectURL(file), // â Preview with ObjectURL
                image: URL.createObjectURL(file)     // â So preview and render work the same
            }
            section.value.images.push(sec)
        }
        // Optional: clear input so re-uploading same file works
        event.target.value = ''
    }
}
</script>

<template>
  <Builder :uid="props.uid">
    <div class="flex flex-wrap my-2">
      <template v-for="image in section.images" :key="image.uid">
        <div class="w-1/2 p-1 relative">
          <img :src="image.image" class="rounded-lg w-full h-auto object-cover" />
          <div @click="remove(image.uid)" class="absolute cursor-pointer right-0 top-0 m-2 p-1 hover:opacity-100 opacity-50 transition-all text-red-500">
            <i class="pi pi-trash"></i>
          </div>
        </div>
      </template>
    </div>

    <label
      for="addImage"
      class="w-full cursor-pointer mt-1 items-center rounded-md border-blue-400 p-3 border bg-blue-200 border-dashed flex justify-center"
    >
      <i class="pi pi-plus"></i>
      <div class="mx-1"></div>
      Add Image
    </label>

    <input
      type="file"
      multiple
      accept="image/*"
      id="addImage"
      class="hidden"
      @change="onChange"
    />
  </Builder>
</template>