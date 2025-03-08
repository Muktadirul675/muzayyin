import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, {params}:{params:{id:string}}){
    const color = await prisma.color.findUnique({
        where:{id:params.id}
    })
    if(!color){
        throw new Error("Color not found")
    }else{
        return NextResponse.json(color)
    }
}