<template>
    <div class="flex items-start justify-between py-4">
        <div class="flex items-center gap-4">
            <img :src="product.image.image" alt="" class="w-16 h-16 object-cover rounded-md" />
            <div>
                <h4 class="font-semibold text-gray-800">{{ product.name }}</h4>
                <div class="text-sm text-gray-500">
                    <span v-if="item.variant">Variant: {{ item.variant.name }}</span> <br>
                    <span v-if="item.color">Color: {{ item.color.name }}</span>
                </div>
                <div class="text-sm text-gray-600">Qty: {{ item.quantity }}</div>
            </div>
        </div>
        <div class="font-semibold text-gray-700 flex flex-col items-end">
            <div class="text-sm">
                {{ formatBDT(unitPrice) }} <i class="pi pi-times text-xs"></i> {{ qty }}
            </div>
            <span class="text-lg text-red-500">
                <BDT :amount="parseFloat(totalPrice)" />
            </span>
            <div class="flex flex-col items-end gap-1">
                <div v-if="isUpdating" class="text-sm text-gray-500 py-1 px-3">
                    <i class="pi pi-spin pi-spinner text-red-500"></i>
                </div>
                <div v-else class="flex items-center gap-3">
                    <div class="flex w-fit border border-gray-300 rounded-md overflow-hidden">
                        <button class="px-3 py-1 text-2xl cursor-pointer" @click="dec">-</button>
                        <input disabled type="number"
                            class="w-[50px] text-center outline-none appearance-none no-spinner"
                            v-model.number="quantity" min="1" />
                        <button class="px-3 py-1 text-2xl cursor-pointer" @click="inc">+</button>
                    </div>
                    <div v-if="isDeleting" class="text-sm text-gray-500 py-1 px-3">
                        <i class="pi pi-spin pi-spinner text-red-500"></i>
                    </div>
                    <div @click="()=>del(item.id)" class="text-red-500 hover:text-red-600 transition-all cursor-pointer" v-else>
                        <i class="pi pi-trash"></i>
                    </div>
                </div>
                <p v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import BDT from '../ui/BDT.vue';
import { useCartStore } from '@/stores/cart';
import { formatBDT } from '@/lib/utils';

const cart = useCartStore()

const props = defineProps({
    item: Object
});

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const product = computed(() => {
    let p = props.item.product;
    if (!String(p.image.image).startsWith(BACKEND_URL)) {
        p.image.image = BACKEND_URL + p.image.image;
    }
    return p;
});

const quantity = ref(props.item.quantity);
const errorMessage = ref('');

const unitPrice = computed(() =>
    product.value.net_price ? product.value.net_price : product.value.price
);
const qty = computed(() => quantity.value);

const totalPrice = computed(() => qty.value * unitPrice.value);

const getMaxStock = () => {
    let stocks = [product.value?.stock ?? Infinity];
    if (props.item.variant?.stock != null) stocks.push(props.item.variant.stock);
    if (props.item.color?.stock != null) stocks.push(props.item.color.stock);
    return Math.min(...stocks);
};

const dec = () => {
    if (quantity.value > 1) {
        quantity.value -= 1;
        errorMessage.value = '';
    }
};

const inc = () => {
    const maxStock = getMaxStock();
    if (quantity.value < maxStock) {
        quantity.value += 1;
        errorMessage.value = '';
    } else {
        errorMessage.value = 'Not enough stock available';
    }
};

const isUpdating = ref(false)
const isDeleting = ref(false)
let isRollingBack = false

const del = async (id) => {
    console.log('deleting')
    isDeleting.value = true;
    try {
        await cart.removeItem(id)
    } catch (e) {
        errorMessage.value = e.message || 'Failed to delete'
    } finally {
        isDeleting.value = false;
    }
}

watch(quantity, async (newVal, oldVal) => {
    if (isRollingBack) {
        isRollingBack = false
        return
    }

    const maxStock = getMaxStock()
    if (newVal <= maxStock && newVal >= 1) {
        errorMessage.value = ''
        isUpdating.value = true
        try {
            await cart.updateCartItem({
                itemId: props.item.id,
                productId: product.value.id,
                variantId: props.item.variant ? props.item.variant.id : null,
                colorId: props.item.color ? props.item.color.id : null,
                quantity: newVal
            })
        } catch (err) {
            errorMessage.value = err.message || 'Failed to update cart'
            isRollingBack = true
            quantity.value = oldVal // safely rollback without retrigger
        } finally {
            isUpdating.value = false
        }
    } else if (newVal > maxStock) {
        errorMessage.value = 'Not enough stock available'
        isRollingBack = true
        quantity.value = maxStock
    } else if (newVal < 1) {
        isRollingBack = true
        quantity.value = 1
    }
})
</script>
<style scoped>
/* Hide number input spinners in most browsers */
input[type='number'].no-spinner::-webkit-inner-spin-button,
input[type='number'].no-spinner::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type='number'].no-spinner {
    -moz-appearance: textfield;
    /* Firefox */
}
</style>