import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(request:Request, {params}:{params:{id:string}}){
    const id = params.id
    const product = await prisma.product.findUnique({
        where:{
            id:id
        },
        include:{
            images:{
                take : 1
            }
        }
    })
    if(product?.is_available){
        return NextResponse.json(product);
    }
    return NextResponse.json(null);
}