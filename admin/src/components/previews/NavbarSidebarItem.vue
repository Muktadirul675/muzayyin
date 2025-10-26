<template>
    <div>
        <div class="flex items-center justify-between mb-2 cursor-pointer hover:text-gray-500" @click="toggle">
            <span v-if="hasChildren">{{ category.name }}</span>
            <div v-else-if="category.link" @click="navigate(category.link)">
                {{ category.name }}
            </div>
            <span v-if="hasChildren" class="text-sm flex items-center">
                <i class="pi pi-minus text-sm" v-if="expanded"></i>
                <i class="pi pi-plus text-sm" v-else></i>
            </span>
        </div>

        <transition name="fade">
            <ul v-if="expanded && hasChildren" class="ml-4 mt-2 space-y-1">
                <template v-for="cat in category.children" :key="cat.name">
                    <navbar-sidebar-item :category="cat" @close="emit('close')"/>
                </template>
            </ul>
        </transition>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const props = defineProps({
    category: {
        type: Object,
        required: true
    }
})

const expanded = ref(false)
const hasChildren = props.category.children?.length > 0
const router = useRouter()
const navigate = (link) => {
    if(link){
        emit('close')
        router.push(`/category/${link}`)
    }
}

const toggle = () => {
    if (hasChildren) expanded.value = !expanded.value
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>