<script setup>
import { useBuilderStore } from '@/stores/builder';
import { computed, Transition } from 'vue';
import Preview from '../Preview.vue';

const props = defineProps({
    uid: Number
})
const builder = useBuilderStore()
const section = computed(() => builder.feed.find((s) => s.uid === props.uid))
</script>

<template>
    <Preview :uid="uid">

        <div class="hidden @lg:flex justify-center items-center bg-black text-white" v-if="section?.categories?.length">
            <div class="w-full @lg:w-[65%] flex">
                <div class="relative group border-l-[0.5px] last:border-r border-gray-300">
                    <div class="px-3 py-2 cursor-pointer hover:bg-gray-600">All Categories</div>
                    <Transition name="fade">
                        <div v-if="section.args?.all_categories?.length"
                            class="absolute top-full rounded left-0 bg-white text-black shadow-md z-10 flex flex-col min-w-[200px] divide-y divide-gray-300 transition-opacity duration-200 ease-out group-hover:flex opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">

                            <template v-for="cat in section.args.all_categories" :key="cat.uid">
                                <div
                                    class="relative hover:bg-gray-100 group/sub transition-all duration-150 ease-in-out">
                                    <div v-if="cat.children && cat.children.length"
                                        class="flex w-full px-4 py-2 flex-row items-center justify-between transition-all cursor-pointer hover:bg-gray-500 hover:text-white">
                                        {{ cat.name }}
                                        <i class="pi pi-chevron-right text-sm"></i>
                                    </div>
                                    <span
                                        class="flex w-full px-4 py-2 flex-row items-center justify-between transition-all cursor-pointer hover:bg-gray-500 hover:text-white"
                                        :to="`/category/${cat.link}`" v-else>
                                        {{ cat.name }}
                                    </span>
                                    <Transition name="fade">
                                        <div v-if="cat.children && cat.children.length"
                                            class="absolute top-0 left-full bg-white shadow-md hidden group-hover/sub:flex flex-col min-w-[200px] z-20 divide-y divide-gray-300 transition-opacity duration-200 ease-out opacity-0 group-hover/sub:opacity-100 pointer-events-none group-hover/sub:pointer-events-auto">
                                            <span :to="`/category/${sub.link}`" v-for="sub in cat.children"
                                                :key="sub.id"
                                                class="px-4 py-2 hover:bg-100-500 hover:text-black cursor-pointer transition-colors duration-150">
                                                {{ sub.name }}
                                            </span>
                                        </div>
                                    </Transition>
                                </div>
                            </template>
                        </div>
                    </Transition>
                </div>
                <template v-for="(cat, index) in [...section.categories]" :key="cat.id">
                    <span :to="`/category/${cat.slug}`"
                        class="px-3 py-2 cursor-pointer border-l border-gray-300 last:border-r hover:bg-slate-600 transition-all"
                        role="button" tabindex="0">
                        {{ cat.name }}
                    </span>
                </template>
            </div>
        </div>
    </Preview>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>