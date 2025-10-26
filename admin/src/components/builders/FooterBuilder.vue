<script setup>
import { computed, ref, watch } from 'vue'
import Builder from '../Builder.vue'
import { useBuilderStore } from '@/stores/builder'

const props = defineProps({ uid: Number })
const builder = useBuilderStore()
const section = computed(() => builder.feed.find(s => s.uid === props.uid))

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

// Ensure section.args is always initialized
watch(section, (val) => {
    if (val && !val.args) {
        val.args = {}
    }
}, { immediate: true })

// Temp preview for logo
const logoPreview = ref(section.value?.args?.logo)

// Watch logo change and set preview
watch(
    () => section.value?.args,
    (val) => {
        if (val.preview) {
            logoPreview.value = val.preview
        }else if(val.logo){
            logoPreview.value = `${BACKEND_URL}${val.logo}`
        }
    },
    { immediate: true }
)

const selectLogo = (event) => {
    const file = event.target.files[0]
    if (file) {
        const url = URL.createObjectURL(file)
        logoPreview.value = url
        section.value.args.preview = url // store object URL in args.logo
        section.value.args.file = file // store object URL in args.logo
    }
}
</script>

<template>
    <Builder :uid="props.uid">
        <div class="p-2 flex flex-col gap-4">
            <div class="label">Logo</div>
            <div v-if="logoPreview" class="w-full flex justify-center">
                <img :src="`${logoPreview}`" alt="Logo Preview" class="h-14 mb-2 border rounded" />
            </div>
            <label for="logo"
                class="border p-2 border-dashed border-blue-500 flex justify-center rounded cursor-pointer text-white bg-blue-300 items-center">
                <i class="pi pi-image"></i>
                <div class="mx-1"></div>
                Select Logo
            </label>
            <input @change="selectLogo" id="logo" type="file" accept="image/*" class="hidden" />

            <div class="label">Description</div>
            <input v-model="section.args.description" type="text" class="input"
                placeholder="Business description" />

            <div class="label">Address</div>
            <input v-model="section.args.address" type="text" class="input" placeholder="Your address" />

            <div class="label">Phone</div>
            <input v-model="section.args.phone" type="text" class="input" placeholder="+8801XXXXXXX" />

            <div class="label">Email</div>
            <input v-model="section.args.email" type="email" class="input" placeholder="support@example.com" />

            <div class="label">Facebook Page Link</div>
            <input v-model="section.args.facebook" type="text" class="input"
                placeholder="https://facebook.com/yourpage" />
        </div>
    </Builder>
</template>