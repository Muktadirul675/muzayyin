<script setup>
import api from '@/services/api';
import { convert_to_snake_word } from '@/services/utils';
import { useBuilderStore } from '@/stores/builder';
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
    uid: Number
})
const builder = useBuilderStore()
const type = ref('')
const title = ref('')
const category = ref(null)
// const types = ['Notice', 'Navbar', 'Image Slider', "Products", 'Category','Categories Bar', 'Categories Slider', 'Footer']
const types = computed(()=>{
    let available_types = ['Navbar', 'Image Slider', "Products", 'Category','Categories Bar', 'Categories Slider', 'Footer']
    const hasNavbar = builder.feed.some((s)=>s.type === 'navbar')
    const hasCategoryBar = builder.feed.some((s)=>s.type === 'categories_bar')
    const hasFooter = builder.feed.some((s)=>s.type === 'footer')
    if(hasNavbar) available_types = available_types.filter((t)=>t!=='Navbar')
    if(hasCategoryBar) available_types = available_types.filter((t)=>t!=='Categories Bar')
    if(hasFooter) available_types = available_types.filter((t)=>t!=='Footer')

    if(builder.feed.length === 0){
        return ['Navbar']
    }else{
        return available_types
    }
})
const categories = ref([])

const ok = computed(() => {
    if (!type.value) return false
    if (type.value === 'category') {
        if (!category.value) return false
    }
    return true
})

const payload = computed(() => {
    if (category.value) {
        const cat = categories.value.find((c) => c.id === category.value)
        return {
            type: type.value,
            title: title.value,
            category: { ...cat }
        }
    }
    return {
        type: type.value,
        title: title.value,
    }
})

function add() {
    builder.addSectionAfter(props.uid, payload.value)
    type.value = ''
    title.value = ''
    category.value = null
}

onMounted(async () => {
    try {
        const res = await api.get("/categories")
        categories.value = res.data
    } catch (e) {
        alert(e)
    }
})
</script>

<template>
    <div class="bg-white flex flex-col gap-2">
        <div class="flex flex-row items-center">
            <div class="label">Title</div>
            <!-- {{ ok }} {{ type }} -->
            <div @click.stop="()=>builder.pop(null)"
                class="ms-auto text-red-500 p-1 rounded hover:bg-red-300 cursor-pointer transition-all">
                <i class="pi pi-times"></i>
            </div>
        </div>
        <input type="text" v-model="title" class="input">
        <div class="label">Select Type</div>
        <select name="" v-model="type" class="input" id="">
            <option value="">---Types---</option>
            <template v-for="type in types">
                <option :value="convert_to_snake_word(type)">{{ type }}</option>
            </template>
        </select>
        <div v-if="type === 'category'" class="flex flex-col gap-2">
            <div class="label">Select Category</div>
            <select name="" v-model="category" id="" class="input">
                <template v-for="cat in categories">
                    <option :value="cat.id">{{ cat.name }}</option>
                </template>
            </select>
        </div>
        <button @click.stop="add" v-if="ok" class="btn">Add</button>
    </div>
</template>