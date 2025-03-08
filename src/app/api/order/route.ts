import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { OrderPayload } from "@/types";
import { Order } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { perPageOrder } from "../../../types";
import { revalidatePath } from "next/cache";
import { checkProductAvailability } from "@/utils/orders";

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const pageStr = searchParams.get('page')
    const page = parseInt(pageStr ?? '0') === 0 ? 1 : parseInt(pageStr ?? '1')
    const skip = perPageOrder * (page-1)
    const take = perPageOrder 

    const orders: Order[] = await prisma.order.findMany({
        skip: skip,
        take: take,
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
        orderBy:{
            created_at: 'desc'
        }
    })
    return NextResponse.json(orders)
}

export async function POST(request: Request) {
    const payload: OrderPayload = await request.json()
    console.log(payload)
    const secret = process.env.ZILMIL_SECRET
    if (secret !== payload.secret) {
        throw new Error("Unauthorized")
    }
    const session = await auth()
    if (session) {
        const user = await prisma.user.findUnique({
            where: { email: session.user?.email as string }
        })
        const order = await prisma.order.create({
            data: {
                name: payload.name,
                address: payload.address,
                phone: payload.phone,
                inside_dhaka: payload.inside_dhaka,
                order_price: payload.order_price,
                userId: user?.id,
            }
        })
        for (const i of payload.items) {
            for(let j=0;j<i.count;j++){
                await prisma.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: i.product,
                        variantId: i.variant,
                        colorId: i.color
                    }
                })
                await prisma.product.update({
                    where:{id:i.product},
                    data:{
                        stocks:{
                            decrement: 1
                        }
                    }
                })
            }
            console.log("created")
        }
        await prisma.cartItem.deleteMany({
            where: { userId: user?.id }
        })
        await checkProductAvailability(payload.items.map((o)=>o.product))
        revalidatePath("/admin/orders")
        return NextResponse.json(order)
    } else {
        const order = await prisma.order.create({
            data: {
                name: payload.name,
                address: payload.address,
                phone: payload.phone,
                inside_dhaka: payload.inside_dhaka,
                order_price: payload.order_price,
                items: {
                    createMany: {
                        data: payload.items.map((i) => { return { productId: i.product } })
                    }
                }
            }
        })
        for (const i of payload.items) {
            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: i.product,
                    variantId: i.variant,
                    colorId: i.color
                }
            })
            console.log("created")
        }

        await checkProductAvailability(payload.items.map((o)=>o.product))
        revalidatePath("/admin/orders")
        revalidatePath("/admin/products")
        revalidatePath("/admin/stocks")
        return NextResponse.json(order)
    }
}