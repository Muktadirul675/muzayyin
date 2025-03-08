import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(requeet: Request, { params }: { params: { id: string } }) {
    const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            stocks: true,
                            discounted_price: true,
                            price: true,
                            images:{
                                take: 1
                            }
                        },
                    },
                    variant: true,
                    color: true
                }
            }
        }
    })
    return NextResponse.json(order);
}