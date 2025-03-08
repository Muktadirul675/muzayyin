import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, {params}:{params: {id:string}}){
    const cartItem = await prisma.cartItem.delete({
        where:{id:params.id}
    })
    if(!cartItem){
        throw new Error("Cart Item not found")
    }
    return NextResponse.json(cartItem)
}