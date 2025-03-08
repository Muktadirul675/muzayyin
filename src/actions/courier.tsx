'use client';

import { prisma } from "@/prisma";

export async function sendToCourier() {
    const orders = await prisma.order.findMany({
        where: {
            status: 'Complete',
            courier_status: 'N/A'
        },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            categories: true,
                            discounted_price: true,
                            name: true,
                            is_available: true,
                            price: true,
                            slug: true,
                            stocks: true,
                            images: {
                                take: 1
                            }
                        }
                    },
                    variant: true,
                    color: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    })
    for (const o of orders) {
        const courier = o.courier;
        if (!courier) {
            continue;
        }
        if (courier === 'steadfast') {
            const key = process.env.STEADFAST_API_KEY
            const secret = process.env.STEADFAST_SECRET_KEY
            // const headers = {
            //     "Api-Key": key,
            //     "Secret-Key": secret,
            //     "Content-Type": "application/json",
            // }
            const base_url = process.env.STEADFAST_BASE_URL
            const payload = {
                invoice: o.id,
                recipient_name: o.name,
                recipient_phone: o.phone,
                recipient_address: o.address,
                cod_amount: o.order_price,
                note: o.note
            }
            try {
                const res = await fetch(`${base_url}/create_order`, {
                    headers: {
                        "Api-Key": key,
                        "Secret-Key": secret,
                        "Content-Type": "application/json",
                    } as HeadersInit,
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                if (res.ok) {
                    const data = await res.json()
                    const c_id = data.consignment.consignment_id
                    const ord = await prisma.order.update({
                        where: { id: o.id },
                        data: {
                            c_id: `${c_id}`,
                            courier_status: "Sent"
                        }
                    })
                }
            }
            catch (e) {
                continue;
            }
        }
        if (courier === 'pathao') {
            if(!o.city || !o.zone){
                continue;
            }
            const payload = {
                store_id: process.env.STORE_ID,
                merchant_order_id: o.id,
                sender_name: process.env.PATHAO_SENDER_NAME,
                sender_phone:process.env.PATHAO_SENDER_PHONE,
                recipient_name: o.name,
                recipient_phone: o.phone,
                recipient_address: o.address,
                recipient_city: o.city as number,
                recipient_zone: o.zone,
                recipient_area: o.area,
                delivery_type: 48,
                item_type: 2,
                item_quantity: o.items.length,
                item_weight: '0.5',
                amount_to_collect: o.order_price
            }
            try{
                const res = await fetch(`${process.env.PATHAO_URL}/create_order`,{
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
                if(res.ok){
                    const json = await res.json()
                    const data = json.data
                    const c_id = data.data.consignment_id
                    const ord = await prisma.order.update({
                        where: { id: o.id },
                        data: {
                            c_id: `${c_id}`,
                            courier_status: "Sent"
                        }
                    })
                }
            }catch(e){
                continue;
            }
        }
    }
}