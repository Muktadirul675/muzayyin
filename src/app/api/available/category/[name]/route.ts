import { prisma } from "@/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request,{params}:{params:{name:string}}){
    const name = params.name
    const category = await prisma.category.findUnique({
        where:{name: name}
    })
    if(!category){
        return NextResponse.json({available:true})
    }
    return NextResponse.json({available:false})
}