<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBuilderStore } from '@/stores/builder'
import api from '@/services/api'
import Builder from '../Builder.vue'

const props = defineProps({ uid: Number })
const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))

// Original flat categories list
const categories = ref([])
let uid = 2000

const isLoading = ref(false)
const error = ref('')

// For manual form input
const manualName = ref('')
const manualCategory = ref('')
const manualChildren = ref([])

// Load categories from API
onMounted(async () => {
    try {
        isLoading.value = true
        const res = await api.get('/categories')
        categories.value = res.data.map((c) => ({ ...c, uid: uid++ }))
    } catch (e) {
        error.value = e
    } finally {
        isLoading.value = false
    }
})

// Track selected category ids
const selecteds = computed(() => section.value.categories.map((c) => c.id))

// Toggle selection
const clck = (id) => {
    if (selecteds.value.includes(id)) remove(id)
    else add(id)
}

const deleteCategoryGroup = (id) => {
    if (section.value.args?.all_categories) {
        section.value.args.all_categories = section.value.args.all_categories.filter(c => c.link !== id)
    }
}

const add = (id) => {
    const cat = categories.value.find((c) => c.id === id)
    section.value.categories.push(cat)
}

const remove = (id) => {
    section.value.categories = section.value.categories.filter((c) => c.id !== id)
    if (section.value.args?.all_categories) {
        section.value.args.all_categories = section.value.args.all_categories.filter((c) => c.link !== id)
    }
}

// Add child to a specific parent
const addChildTo = (parentId, childId) => {
    const child = categories.value.find((c) => c.id === childId)
    const parent = section.value.args?.all_categories.find((c) => c.link === parentId)
    if (child && parent && !parent.children.find((ch) => ch.link === child.id)) {
        parent.children.push({
            name: child.name,
            link: child.id
        })
    }
}

// Submit manual entry
const addManualCategory = () => {
    if (!manualName.value) return

    if (!section.value.args) section.value.args = {}
    if (!section.value.args.all_categories) section.value.args.all_categories = []

    const children = manualChildren.value.map((id) => {
        const c = categories.value.find((cat) => cat.id === id)
        return { name: c.name, link: c.id }
    })

    section.value.args.all_categories.push({
        name: manualName.value,
        link: Number(manualCategory.value),
        children
    })

    manualName.value = ''
    manualCategory.value = ''
    manualChildren.value = []
}
</script>

<template>
    <Builder :uid="props.uid">
        <h3 class="text-lg font-bold text-gray-800 my-2">Select Categories</h3>

        <div v-if="isLoading">
            <i class="pi pi-cog pi-spin text-xl my-2"></i>
        </div>

        <div v-else
            class="flex flex-col divide-y max-h-[200px] overflow-auto rounded border border-gray-300 divide-gray-300">
            <template v-for="cat in categories" :key="cat.uid">
                <div @click="clck(cat.id)"
                    :class="`p-2 cursor-pointer ${selecteds.includes(cat.id) ? 'bg-blue-500 text-white' : ''}`">
                    {{ cat.name }}
                </div>
            </template>
        </div>
        <h4 class="mt-4 text-md font-semibold text-gray-700">All Categories</h4>
        <div v-if="section.args?.all_categories?.length">
            <template v-for="parent in section.args.all_categories" :key="parent.link">
                <div class="p-2 border border-gray-300 rounded my-2 bg-gray-50">
                    <div class="flex flex-row justify-between">
                        <div class="font-semibold">{{ parent.name }}</div>
                        <button @click="deleteCategoryGroup(parent.link)" class="text-sm text-red-600 hover:underline">
                            <i class="pi pi-trash"></i>
                        </button>
                    </div>
                    <div class="ml-4 text-sm text-gray-600">
                        <ul class="list-disc ml-4">
                            <li v-for="child in parent.children" :key="child.link">{{ child.name }}</li>
                        </ul>
                    </div>
                </div>
            </template>
        </div>

        <h4 class="mt-6 text-md font-semibold text-gray-700">Add Custom Entry</h4>
        <form @submit.prevent="addManualCategory" class="space-y-2 mt-2">
            <input v-model="manualName" placeholder="Name" class="w-full border border-gray-300 rounded px-3 py-1" />

            <select v-model="manualCategory" class="w-full border border-gray-300 rounded px-3 py-1">
                <option disabled value="">Select Category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>

            <label class="block text-sm">Add Children (optional)</label>
            <select v-model="manualChildren" multiple class="w-full border border-gray-300 rounded px-3 py-1">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>

            <button type="submit" class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                Add
            </button>
        </form>
    </Builder>
</template>