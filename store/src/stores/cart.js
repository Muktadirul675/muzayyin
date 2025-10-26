import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useToast } from '../lib/toast'
import { trackAddToCart } from '@/lib/pixel'

export const useCartStore = defineStore('cartStore', () => {
    const cart = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const toast = useToast()

    const fetchCart = async () => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('cart')
            cart.value = data
        } catch (err) {
            error.value = 'Failed to load cart'
        } finally {
            loading.value = false
        }
    }

    const addToCart = async ({ product, variant = null, color = null, quantity }) => {
        if (!product || !quantity) {
            alert('Product and quantity are required')
            return
        }

        const payload = {
            product_id: product,
            quantity: quantity,
        }

        if (variant) payload.variant_id = variant
        if (color) payload.color_id = color

        try {
            const res = await api.post('/cart/', payload)
            cart.value = res.data
            toast.success("Product Added to Cart")
        } catch (err) {
            alert('Failed to add item to cart')
        }
    }

    const updateCartItem = async ({ itemId, productId, variantId = null, colorId = null, quantity }) => {
        if (!itemId || !productId || !quantity) {
            alert('Item ID, Product ID and Quantity are required')
            return
        }

        const payload = {
            product_id: productId,
            quantity: quantity,
        }

        if (variantId) payload.variant_id = variantId
        if (colorId) payload.color_id = colorId

        try {
            const res = await api.patch(`/cart/items/${itemId}/`, payload)
            cart.value = res.data
        } catch (err) {
            alert('Failed to update cart item')
        }
    }

    const removeItem = async (itemId) => {
        if (!itemId) return

        try {
            await api.delete(`/cart/items/${itemId}/`)
            // console.log('deleted')
            // cart.value.items = cart.value.items.filter((i)=>i.id !== itemId)
            fetchCart()
            // console.log('removed')
        } catch (err) {
            alert(err.detail || 'Failed to remove item from cart')
        }
    }

    return {
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeItem
    }
})