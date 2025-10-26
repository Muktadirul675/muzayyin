<script setup>
import { computed, ref, watch } from 'vue'
import Builder from '../Builder.vue'
import api from '@/services/api'
import { useBuilderStore } from '@/stores/builder'

const props = defineProps({
    uid: Number
})

const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))
const isLoading = ref(false)
const error = ref('')
const products = ref([])
const selecteds = computed(() => section.value.products.map((p) => p.id))

const add = (id) => {
    const prod = products.value.find((p) => p.id === id)
    section.value.products.push(prod)
}

const remove = (id) => {
    section.value.products = section.value.products.filter((p) => p.id !== id)
}

const toggle = (id) => {
    if (selecteds.value.includes(id)) remove(id)
    else add(id)
}
// console.log("mount")
// watch(section, (val) => {
//   console.log('Section changed:', val)
// })
// ð Setup one-time watch
const stop = watch(
    section,
    async (val) => {
        // console.log("watch")
        if (val) {
            try{
                isLoading.value = true
                const res = await api.get(`/categories/${section.value.category.id}/products`)
                // console.log(res.data)
                products.value = res.data
                error.value = ''
                stop() // ð stop the watcher after first successful run
            }catch(e){
                alert(e)
                error.value = e
            }finally{
                isLoading.value = false
            }
        }
    }
,{deep:true, immediate:true})
</script>

<template>
    <Builder :uid="props.uid">
        <!-- Render fetched products -->
        <h3 class="text-lg font-bold text-gray-800 my-2">
            Select Products
        </h3>
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