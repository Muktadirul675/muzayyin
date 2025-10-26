<template>
    <div>
        <!-- Toggle Button -->
        <button @click="visible = !visible"
            class="bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-indigo-700 text-sm">
            {{ visible ? 'Hide Invoice' : 'Show Invoice' }}
        </button>

        <!-- Invoice Section -->
        <div v-if="visible" ref="invoiceRef"
            class="mt-6 bg-white p-6 border border-gray-300 rounded shadow text-sm text-gray-800">
            <!-- Header -->
            <div class="flex justify-between mb-6">
                <div>
                    <h2 class="text-xl font-semibold mb-1">Invoice</h2>
                    <p><strong>Order ID:</strong> #{{ order.id }}</p>
                    <p><strong>Date:</strong> {{ formatDate(order.created_at) }}</p>
                    <p><strong>Status:</strong> {{ order.status }}</p>
                </div>
                <div class="text-right">
                    <p><strong>Name:</strong> {{ order.full_name }}</p>
                    <p><strong>Phone:</strong> {{ order.phone }}</p>
                    <p><strong>Address:</strong> {{ order.shipping_address }}</p>
                </div>
            </div>

            <!-- Item Table -->
            <table class="w-full border border-gray-300">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 border border-gray-300 text-left">Product</th>
                        <th class="p-2 border border-gray-300">Variant</th>
                        <th class="p-2 border border-gray-300">Color</th>
                        <th class="p-2 border border-gray-300">Qty</th>
                        <th class="p-2 border border-gray-300 text-right">Price</th>
                        <th class="p-2 border border-gray-300 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in order.items" :key="index">
                        <td class="p-2 border border-gray-300">{{ item.product.name }}</td>
                        <td class="p-2 border border-gray-300 text-center">{{ item.variant?.name || '-' }}</td>
                        <td class="p-2 border border-gray-300 text-center">
                            <span v-if="item.color">{{ item.color.name }}</span>
                            <span v-else>-</span>
                        </td>
                        <td class="p-2 border border-gray-300 text-center">{{ item.quantity }}</td>
                        <td class="p-2 border border-gray-300 text-right">à§³{{ item.price_at_purchase }}</td>
                        <td class="p-2 border border-gray-300 text-right">
                            à§³{{ (item.quantity * parseFloat(item.price_at_purchase)).toFixed(2) }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Totals -->
            <div class="text-right mt-4 space-y-1">
                <p><strong>Subtotal:</strong> à§³{{ subtotal }}</p>
                <p><strong>Delivery Charge:</strong> à§³{{ order.delivery_charge }}</p>
                <p><strong>Discount:</strong> -à§³{{ order.order_discount }}</p>
                <p class="text-lg font-semibold"><strong>Total:</strong> à§³{{ total }}</p>
            </div>

            <!-- Download Button -->
            <div class="mt-6 text-right">
                <button @click="downloadPDF"
                    class="bg-green-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                    Download PDF
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import html2pdf from 'html2pdf.js'

const props = defineProps({
    order: {
        type: Object,
        required: true
    }
})

const visible = ref(false)
const invoiceRef = ref(null)

const subtotal = computed(() =>
    props.order.items.reduce(
        (sum, item) => sum + item.quantity * parseFloat(item.price_at_purchase),
        0
    ).toFixed(2)
)

const total = computed(() =>
    (
        parseFloat(subtotal.value) +
        parseFloat(props.order.delivery_charge || 0) -
        parseFloat(props.order.order_discount || 0)
    ).toFixed(2)
)

function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

async function downloadPDF() {
    if (!invoiceRef.value) return

    // Clone the DOM to avoid rendering issues
    const element = invoiceRef.value.cloneNode(true)

    // Optional: Add to body temporarily (hidden)
    element.style.position = 'fixed'
    element.style.top = '-9999px'
    document.body.appendChild(element)

    const opt = {
        margin: 0.5,
        filename: `invoice-order-${props.order.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }

    try {
        await html2pdf().set(opt).from(element).save()
    } catch (err) {
        alert('â Failed to generate PDF: ' + err.message)
    } finally {
        // Clean up cloned node
        document.body.removeChild(element)
    }
}
</script>