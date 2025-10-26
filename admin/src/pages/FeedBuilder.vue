<template>
    <div class="flex p-3 flex-row gap-4 items-start">
        <div class="relative w-1/4 divide-y rounded border bg-white border-gray-300 divide-gray-300">
            <div
                :class="`absolute z-2 m-auto ${builder.popup === -1 ? 'flex' : 'hidden'} justify-center items-center w-full transition-all `">
                <div class="w-5/6 bg-white rounded-lg p-3 border border-gray-300">
                    <AddBuilderConfig :uid="-1" />
                </div>
            </div>
            <div class="w-full flex justify-around items-center relative">
                <div @click="builder.pop(-1)" :class="buttonClass">
                    <i class="pi pi-plus-circle"></i>
                </div>
                <div @click="expandAll" v-if="anyCollapsed" :class="buttonClass">
                    <i class="pi pi-arrow-up-right-and-arrow-down-left-from-center"></i>
                </div>
                <div @click="collapseAll" v-if="anyExpanded" :class="buttonClass">
                    <i class="pi pi-arrow-down-left-and-arrow-up-right-to-center"></i>
                </div>
                <div @click="viewMode = 'desktop'" :class="buttonClass">
                    <i class="pi pi-desktop"></i>
                </div>
                <div @click="viewMode = 'mobile'" :class="buttonClass">
                    <i class="pi pi-mobile"></i>
                </div>
                <div @click="builder.reset()" :class="buttonClass">
                    <i class="pi pi-refresh"></i>
                </div>

                <!-- Build button -->
                <div v-if="!builder.buildLoading" @click="builder.build()"
                    :class="`p-2 text-center flex-grow cursor-pointer text-lg transition-all rounded-tr ${builder.isChanged ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'text-gray-300 cursor-not-allowed'}`"
                    :disabled="!builder.isChanged">
                    <i class="pi pi-save"></i>
                </div>

                <!-- Loading spinner -->
                <div v-else class="p-2 text-center flex-grow text-indigo-600 text-lg">
                    <i class="pi pi-cog pi-spin"></i>
                </div>
            </div>

            <!-- Status Message -->
            <div v-if="builder.buildSuccess"
                class="relative flex justify-between items-start gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm rounded">
                <span class="italic">Build completed successfully!</span>
                <button @click="builder.buildSuccess = false"
                    class="text-green-700 hover:text-green-900 text-2xl cursor-pointer leading-none font-bold">&times;</button>
            </div>

            <div v-if="builder.buildError"
                class="relative flex justify-between items-start gap-2 px-4 py-2 bg-red-100 text-red-700 text-sm rounded">
                <span class="italic">{{ builder.buildError }}</span>
                <button @click="builder.buildError = ''"
                    class="text-red-700 hover:text-red-900 text-2xl cursor-pointer leading-none font-bold">&times;</button>
            </div>
            <template v-for="section in builder.feed" :key="section.uid">
                <!-- {{ section.uid }} -->
                <NoticeBuilder :uid="section.uid" v-if="section.type === 'notice'" />
                <NavbarBuilder :uid="section.uid" v-if="section.type === 'navbar'" />
                <CategoryBarBuilder :uid="section.uid" v-if="section.type === 'categories_bar'" />
                <ImageSliderBuilder :uid="section.uid" v-if="section.type === 'image_slider'" />
                <ProductsBuilder :uid="section.uid" v-if="section.type === 'products'" />
                <CategoryBuilder :uid="section.uid" v-if="section.type === 'category'" />
                <CategoriesSliderBuilder :uid="section.uid" v-if="section.type === 'categories_slider'" />
                <FooterBuilder :uid="section.uid" v-if="section.type === 'footer'" />
            </template>
        </div>
        <div
            :class="`${viewMode === 'desktop' ? 'w-3/4' : 'w-[400px]'} mx-auto @container sticky top-2 rounded border border-gray-300 h-[80vh] overflow-auto transition-all`">
            <template v-for="section in builder.feed">
                <NoticesPreview :uid="section.uid" v-if="section.type === 'notice'" />
                <NavbarPreview :uid="section.uid" v-if="section.type === 'navbar'" />
                <CategoriesBarPreview :uid="section.uid" v-if="section.type === 'categories_bar'" />
                <ImageSliderPreview :uid="section.uid" v-if="section.type === 'image_slider'" />
                <ProductsPreview :uid="section.uid" v-if="section.type === 'products'" />
                <CategoryPreview :uid="section.uid" v-if="section.type === 'category'" />
                <CategorySliderPreview :uid="section.uid" v-if="section.type === 'categories_slider'" />
                <FooterPreview :uid="section.uid" v-if="section.type === 'footer'" />
            </template>
        </div>
    </div>
</template>

<script setup>
import AddBuilderConfig from '@/components/builders/AddBuilderConfig.vue';
import CategoriesSliderBuilder from '@/components/builders/CategoriesSliderBuilder.vue';
import CategoryBarBuilder from '@/components/builders/CategoryBarBuilder.vue';
import CategoryBuilder from '@/components/builders/CategoryBuilder.vue';
import FooterBuilder from '@/components/builders/FooterBuilder.vue';
import ImageSliderBuilder from '@/components/builders/ImageSliderBuilder.vue';
import NavbarBuilder from '@/components/builders/NavbarBuilder.vue';
import NoticeBuilder from '@/components/builders/NoticeBuilder.vue';
import ProductsBuilder from '@/components/builders/ProductsBuilder.vue';
import CategoriesBarPreview from '@/components/previews/CategoriesBarPreview.vue';
import CategoryPreview from '@/components/previews/CategoryPreview.vue';
import CategorySliderPreview from '@/components/previews/CategorySliderPreview.vue';
import FooterPreview from '@/components/previews/FooterPreview.vue';
import ImageSliderPreview from '@/components/previews/ImageSliderPreview.vue';
import NavbarPreview from '@/components/previews/NavbarPreview.vue';
import NoticesPreview from '@/components/previews/NoticesPreview.vue';
import ProductsPreview from '@/components/previews/ProductsPreview.vue';
import { useBuilderStore } from '@/stores/builder';
import { useHead } from '@vueuse/head';
import { computed, ref, watch } from 'vue';

useHead({title:'Website Builder - Muzayyin.com.bd'})

const builder = useBuilderStore()
const viewMode = ref('desktop')

const anyExpanded = computed(() => builder.feed.some((s) => s.show))
const anyCollapsed = computed(() => builder.feed.some((s) => !s.show))
const buttonClass = computed(() =>
    builder.buildLoading
        ? 'p-2 text-center flex-grow text-lg opacity-50 cursor-not-allowed'
        : 'p-2 text-center flex-grow text-lg cursor-pointer rounded hover:bg-slate-100 transition-all'
)

function expandAll() {
    builder.feed = builder.feed.map((f) => ({ ...f, show: true }))
}

function collapseAll() {
    builder.feed = builder.feed.map((f) => ({ ...f, show: false }))
}

watch(builder.feed, (newFeed)=>{
    const all_categories = null;
    const category_bar = newFeed.find((s)=>s.type === 'categories_bar')
    const navbar = newFeed.find((s)=>s.type === 'navbar')
    if(category_bar && category_bar.args.all_categories && navbar){
        navbar.args.all_categories = category_bar.args.all_categories
    }
},{deep:true})
</script>
