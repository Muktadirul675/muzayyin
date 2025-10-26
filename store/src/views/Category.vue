<script setup>
import { onMounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import api from '@/lib/api'
import ProductCard from '@/components/product/ProductCard.vue'
import Loading from '@/components/ui/Loading.vue'
import BackButton from '@/components/ui/BackButton.vue'
import { toast } from '@/lib/toast'
import { useHead } from '@vueuse/head'
import { trackPageView, trackViewCategory } from '@/lib/pixel'

const route = useRoute()
const category = ref(null)
const products = ref([])
const loading = ref(true)

async function fetchCategory(slug) {
    loading.value = true;
    const { data: catData } = await api.get(`/categories/${slug}`)
    category.value = catData

    trackPageView({
        content_name: `Category Page: ${category.value.name}`,
        content_category: 'Products'
    })

    const { data: prodData } = await api.get(`/categories/${slug}/products`)
    products.value = prodData
    loading.value = false

    trackViewCategory({
        content_name: category.value.name,
        content_category: category.value.name,
        content_ids: products.value.map(p => p.id), // Array of product IDs in category
        content_type: 'product_group'
    })
}

onMounted(async () => {
    window.scrollTo({ top: 0 })
    try {
        const slug = route.params.slug
        await fetchCategory(slug)
    } catch (error) {
        // toast.info("No Products")
        console.error('Error fetching category or products:', error)
    } finally {
        loading.value = false
    }
})

onBeforeRouteUpdate((to, from, next) => {
    if (to.params.slug !== from.params.slug) {
        fetchCategory(to.params.slug)
        window.scrollTo({ top: 0 })
    }
    next()
})

watch(category, (newCategory) => {
    if (!newCategory) return

    useHead({
        title: `${newCategory.name} - Buy Products Online`,
        meta: [
            {
                name: 'description',
                content: newCategory.description || `Browse ${newCategory.name} products online.`
            },
            { property: 'og:title', content: newCategory.name },
            {
                property: 'og:description',
                content: newCategory.description || ''
            }
        ]
    })
})
</script>

<template>
    <div class="w-full md:w-[65%] mx-auto p-2 lg:px-4 lg:py-6">
        <Loading v-if="loading" />
        <div v-else>
            <div class="flex items-center gap-2 mb-6">
                <BackButton />
                <h1 class="text-2xl font-bold">{{ category?.name }}</h1>
            </div>

            <div v-if="products.length === 0" class="text-gray-500">No products found in this category.</div>

            <div class="flex flex-row flex-wrap">
                <template v-for="product in products" :key="product.id">
                    <ProductCard :product="product" />
                </template>
            </div>
        </div>
    </div>
</template>