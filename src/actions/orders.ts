'use server';

import { Item } from "@/app/admin/orders/add/page";
import { revalidate } from "@/app/page";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { checkProductAvailability } from "@/utils/orders";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


// /**
//  * To Create Order
//  * @type <POST>
//  * Pass below mentioned parameter
//  *
//    store_id <required, numeric>
//    merchant_order_id    <nullable, string>
//    sender_name  <required, numeric>
//    sender_phone     <required, string/>
//    recipient_name   <required, string>
//    recipient_phone  <required, string>
//    recipient_address    <required, string, Min:10>
//    recipient_city   <required, numeric>
//    recipient_zone   <required, numeric>
//    recipient_area   <required, numeric>
//    delivery_type    <required, numeric> is provided by the merchant and not changeable. 48 for Normal Delivery, 12 for On Demand Delivery"
//    item_type    <required, numeric> is provided by the merchant and not changeable. 1 for Document, 2 for Parcel"
//    special_instruction  <nullable, string>
//    item_quantity    <required, numeric>
//    item_weight  <required, numeric>
//    amount_to_collect    <required, numeric>
//    item_description     <nullable, string>
//  */

async function stableStocks(id: string, oldStatus: string, newStatus: string) {
    if (oldStatus === newStatus) {
        return;
    }
    const negative = ['Failed', 'Dismiss', 'Return']
    const positive = ['Complete', 'Hold', 'Pending']
    let transition = 0
    if (oldStatus in negative && newStatus in positive) {
        transition = -1
    }
    if (oldStatus in positive && newStatus in negative) {
        transition = 1
    }
    if (transition === 1) {
        await prisma.product.update({
            where: { id: id },
            data: {
                stocks: {
                    increment: 1
                }
            }
        })
    }
    // if(transition === -1){
    //     await prisma.product.update({
    //         where:{id:id},
    //         data:{
    //             stocks:{
    //                 decrement: 1
    //             }
    //         }
    //     })
    // }
}

export async function addOrder(items: Item[], formData: FormData) {
    const name = formData.get('name')
    const address = formData.get('address')
    const phone = formData.get('phone')
    const quantity = formData.get('quantity')
    const weight = formData.get('weight')
    const total = formData.get('total')
    const location = formData.get('location')
    const note = formData.get('note')
    const courier = formData.get('courier')
    const city = formData.get('city')
    const area = formData.get('area')
    const zone = formData.get('zone')
    const status = formData.get('status')
    if (!name || !address || !phone || !total || !location || !courier) {
        return
    }
    if (courier.toString() === 'pathao') {
        if (!city || !zone) {
            return
        }
    }
    let ordItems: { productId: string, colorId: string | null, variantId: string | null }[] = []
    items.forEach((it) => {
        for (let i = 0; i < it.count; i++) {
            ordItems.push({ productId: it.product.id, colorId: it.color?.id ?? null, variantId: it.variant?.id ?? null })
        }
    })
    const order = await prisma.order.create({
        data: {
            address: address.toString(),
            inside_dhaka: location.toString() === 'insideDhaka' ? true : false,
            order_price: parseInt(total.toString()),
            phone: phone.toString(),
            area: parseInt(area?.toString() ?? '0'),
            city: parseInt(city?.toString() ?? '0'),
            courier: courier.toString(),
            name: name.toString(),
            note: note?.toString(),
            status: status?.toString(),
            zone: parseInt(zone?.toString() ?? '0'),
            items: {
                create: ordItems
            }

        }
    })
    for (const p of ordItems) {
        const prodId = p.productId
        await prisma.product.update({
            where: { id: prodId },
            data: {
                stocks: {
                    decrement: 1
                }
            }
        })
    }

    await checkProductAvailability(ordItems.map((o) => o.productId))

    revalidatePath("/admin/orders")
    revalidatePath("/admin/products")
    revalidatePath("/admin/stocks")
    const session = await auth()
    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email ?? ''
        }
    })
    if (user) {
        if (user.is_admin) {
            redirect("/admin/orders")
        }
        if(user.is_staff){
            redirect("/staff")
        }
    }
    redirect("/unauthorized")
}

export async function editOrder(items: Item[], formData: FormData) {
    console.log('saving')
    const id = formData.get('id')
    if (!id) return;
    const name = formData.get('name')
    const address = formData.get('address')
    const phone = formData.get('phone')
    const quantity = formData.get('quantity')
    const weight = formData.get('weight')
    const total = formData.get('total')
    const location = formData.get('location')
    const note = formData.get('note')
    const courier = formData.get('courier')
    const city = formData.get('city')
    const area = formData.get('area')
    const zone = formData.get('zone')
    const status = formData.get('status')
    if (!name || !address || !phone || !total || !location || !courier) {
        return
    }
    if (courier.toString() === 'pathao') {
        if (!city || !zone) {
            return
        }
    }
    const oldOrderItems = await prisma.orderItem.findMany({ where: { id: id.toString() } });
    await prisma.product.updateMany({
        where: {
            id: {
                in: oldOrderItems.map((ooit) => ooit.productId)
            }
        },
        data: {
            stocks: {
                increment: 1
            }
        }
    })

    await prisma.orderItem.deleteMany({
        where: { orderId: id.toString() }
    })
    let ordItems: { productId: string, colorId: string | null, variantId: string | null }[] = []
    items.forEach((it) => {
        for (let i = 0; i < it.count; i++) {
            ordItems.push({ productId: it.product.id, colorId: it.color?.id ?? null, variantId: it.variant?.id ?? null })
        }
    })
    const oldOrder = await prisma.order.findUnique({
        where: { id: id.toString() },
        select: {
            status: true
        }
    })
    const order = await prisma.order.update({
        where: { id: id.toString() },
        data: {
            address: address.toString(),
            inside_dhaka: location.toString() === 'insideDhaka' ? true : false,
            order_price: parseInt(total.toString()),
            phone: phone.toString(),
            area: parseInt(area?.toString() ?? '0'),
            city: parseInt(city?.toString() ?? '0'),
            courier: courier.toString(),
            name: name.toString(),
            note: note?.toString(),
            status: status?.toString(),
            zone: parseInt(zone?.toString() ?? '0'),
            items: {
                create: ordItems
            }
        },
        select: {
            status: true,
            items: true
        }
    })
    for (const p of order.items) {
        const prodId = p.productId
        await prisma.product.update({
            where: { id: prodId },
            data: {
                stocks: {
                    decrement: 1
                }
            }
        })
        await stableStocks(prodId, oldOrder?.status ?? order.status, order.status)
    }
    await checkProductAvailability(order.items.map((o) => o.productId))
    revalidatePath("/admin/orders")
    revalidatePath("/admin/products")
    revalidatePath("/admin/stocks")
    
    const session = await auth()
    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email ?? ''
        }
    })
    if (user) {
        if (user.is_admin) {
            redirect("/admin/orders")
        }
        if(user.is_staff){
            redirect("/staff")
        }
    }
    redirect("/unauthorized")
}

export async function placeOrder(formData: FormData) {
    const store_id = process.env.STORE_ID
    const merchant_order_id = formData.get('order_id')
    const sender_name = 'Md Mehedi Hasan'
    const sender_phone = '01331094992'
    const name = formData.get('name')
    const address = formData.get('address')
    const phone = formData.get('phone')
    const city = parseInt(formData.get('city')?.toString() ?? '')
    const area = parseInt(formData.get('area')?.toString() ?? '')
    const zone = parseInt(formData.get('zone')?.toString() ?? '')
    const del_type = 48
    const item_type = 2
    const quantity = parseInt(formData.get("quantity")?.toString() ?? '1')
    const weight = parseFloat(formData.get('weight')?.toString() ?? '0.5')
    const amount = parseInt(formData.get('amount')?.toString() ?? '0')

    const payload = {
        store_id: store_id,
        merchant_order_id: merchant_order_id,
        sender_name: sender_name,
        sender_phone: sender_phone,
        recipient_name: name,
        recipient_phone: phone,
        recipient_address: address,
        recipient_city: city,
        recipient_zone: zone,
        recipient_area: area,
        delivery_type: del_type,
        item_type: item_type,
        item_quantity: quantity,
        item_weight: weight,
        amount_to_collect: amount
    }
    await fetch(`${process.env.PATHAO_URL}/create_order`, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}
