<script setup>
import api from '@/services/api';
import { useBuilderStore } from '@/stores/builder';
import { computed, onMounted, ref } from 'vue';
import Builder from '../Builder.vue';

const props = defineProps({
    uid: Number
})
const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))
const categories = ref(null)
const slides = computed(() => section.value.slides)
const image = ref({
    image: null,
    preview: null
})
const selecteds = computed(() => slides.value.filter((s) => s.category_id).map((s) => s.category_id))
const category = ref('')
const caption = ref('')
let uid = 4000;
const isLoading = ref(false)
const error = ref('')

const getCat = (id) => {
    return categories.value.find((c) => c.category_id === id)
}

const selectImage = (event) =>{
    const file = event.target.files[0]
    const url = URL.createObjectURL(file)
    image.value = {
        image: file,
        preview: url
    }
}

const add = () => {
    console.log('validating', category.value, image.value, caption.value)
    if (category.value && image.value.image && caption.value) {
        console.log('adding')
        slides.value.push({
            uid: uid++,
            image: image.value.image,
            preview: image.value.preview,
            category_id: category.value,
            caption: caption.value
        })
        image.value = {image:null, preview:null}
        category.value = null
        caption.value = ''
        console.log('added')
    }
}

const remove = (uid) => {
    section.value.slides = section.value.slides.filter((s) => s.uid !== uid)
}

onMounted(async () => {
    isLoading.value = true
    try {
        const res = await api.get("/categories")
        categories.value = res.data
        error.value = ''
    } catch (e) {
        error.value = e
    } finally {
        isLoading.value = false
    }
})

</script>

<template>
    <Builder :uid="props.uid">
        <template v-if="slides.length === 0">
            <div class="flex p-2 my-1 rounded border border-gray-300 justify-center">
                No slides
            </div>
        </template>
        <template v-else>
            <div class="flex flex-col gap-2 p-2 rounded border my-2 border-gray-300 divide-y divide-gray-300">
                <template v-for="slide in section.slides">
                    <div class="flex flex-row items-center gap-2">
                        <!-- {{ slide.preview || `http://localhost:8000${slide.image}` }} -->
                        <img :src="slide.preview || `http://localhost:8000${slide.image}`" class="rounded h-14 w-14" alt="">
                        <div v-if="categories">
                            <input type="text" v-model="slide.caption" class="input w-full">
                        </div>
                        <div class="ms-auto">
                            <div @click.stop="remove(slide.uid)"
                                class="p-1 rounded cursor-pointer text-red-500 hover:bg-red-300 transitiona-l">
                                <i class="pi pi-trash"></i>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </template>
        <div class="p-1 flex flex-col gap-2">
            <div class="label">Add Slide</div>
            <input type="text" v-model="caption" placeholder="Caption" class="input">
            <div class="label">Select Category</div>
            <select class="input" name="" v-model="category" id="">
                <template v-for="cat in categories">
                    <option :value="cat.id">{{ cat.name }}</option>
                </template>
            </select>
            <img v-if="image.preview" :src="image.preview" class="h-14 w-14" alt="">
            <label for="cat_image" class="border p-2 border-dashed border-blue-500 flex justify-center rounded cursor-pointer text-white bg-blue-300 items-center"> 
                <i class="pi pi-image"></i> <div class="mx-1"></div>
                Select Image
            </label>
            <input @change="selectImage" id="cat_image" type="file" name="" accept="image/*" class="hidden"/>
            <button @click.stop="add" class="btn">Add</button>
        </div>
    </Builder>
</template>
