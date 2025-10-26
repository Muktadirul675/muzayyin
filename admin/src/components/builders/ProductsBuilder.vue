<script setup>
import { computed, onMounted, ref } from 'vue';
import Builder from '../Builder.vue';
import api from '@/services/api';
import { useBuilderStore } from '@/stores/builder';

const props = defineProps({
    uid: Number
})

const isLoading = ref(false)
const builder = useBuilderStore()
const section = computed(()=>builder.feed.find((s)=>s.uid === props.uid))
const products = ref([])
const selecteds = computed(()=>section.value.products.map((p)=>p.id))

const add = (id) =>{
    const prod = products.value.find((p)=>p.id === id)
    section.value.products.push(prod)
}

const remove = (id) => {
    section.value.products = section.value.products.filter((prod)=>prod.id !== id)
}

const toggle = (id) => {
    if (selecteds.value.includes(id)) remove(id)
    else add(id)
}

onMounted(async()=>{
    isLoading.value = true
    const res = await api.get("/products/all")
    const data = res.data
    products.value = data;
    isLoading.value = false
})

</script>

<template>
    <Builder :uid="props.uid">
        <div class="label">Select Products</div>
        <div v-if="isLoading">
            <i class="pi pi-cog pi-spin text-xl my-2"></i>
        </div>
        <div v-else class="h-[100px] overflow-auto divide-y rounded border border-gray-300 divide-gray-300">
            <template v-for="product in products" :key="product.id">
                <div @click="toggle(product.id)"
                    :class="`p-2 transition-all cursor-pointer ${selecteds.includes(product.id) ? 'bg-blue-500 text-white' : ''}`">
                    {{ product.name }}
                </div>
            </template>
        </div>
    </Builder>
</template>