import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, {params}:{params:{id:string}}){
    const variant = await prisma.variant.findUnique({
        where:{id:params.id}
    })
    if(!variant){
        throw new Error("Variant not found")
    }else{
        return NextResponse.json(variant)
    }
}