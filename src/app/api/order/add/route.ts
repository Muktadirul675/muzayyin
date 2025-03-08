import { Order } from '@/app/admin/orders/add/page'
import { prisma } from '@/prisma'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: Request) {
    const data: Order = await request.json()
    const order = await prisma.order.create({
        data: {
            address: data.address,
            inside_dhaka: data.inside_dhaka,
            order_price: data.order_price,
            phone: data.phone,
            area: data.area,
            city: data.city,
            courier: data.courier,
            name: data.name,
            zone: data.zone,
            note: data.note,
            status: data.status,
            items: {
                create: data.items.map((it) => {
                    return {
                        productId: it.product.id,
                        colorId: it.color?.id,
                        variantId: it.variant?.id
                    }
                })
            }
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
    })

    revalidatePath("/admin/orders")
    return NextResponse.json(order)
}