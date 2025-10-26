<script setup>
import { useBuilderStore } from '@/stores/builder';
import { computed, ref, watch } from 'vue';
import Builder from '../Builder.vue';

const props = defineProps({
  uid: Number
})

const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))

// Ensure args object exists
watch(section, (val) => {
  if (!val.args) val.args = {}
}, { immediate: true })

const onLogoChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const preview = URL.createObjectURL(file)
    section.value.args.logo = file
    section.value.args.preview = preview
  }
}
</script>

<template>
  <Builder :uid="props.uid">
    <div class="p-2 rounded w-full flex flex-col gap-3">
      <div class="text-lg font-semibold">Logo</div>

      <div class="flex flex-col gap-2 items-start">
        <img
          v-if="section.args?.preview"
          :src="section.args.preview"
          alt="Logo Preview"
          class="h-16 rounded border"
        />

        <label
          for="logo_upload"
          class="border p-2 border-dashed border-blue-500 flex justify-center items-center rounded cursor-pointer text-white bg-blue-300"
        >
          <i class="pi pi-image"></i>
          <span class="mx-2">Upload Logo</span>
        </label>

        <input
          id="logo_upload"
          type="file"
          accept="image/*"
          @change="onLogoChange"
          class="hidden"
        />
      </div>
    </div>
  </Builder>
</template>