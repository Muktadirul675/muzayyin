import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET(){
    const categories = await prisma.category.findMany({
        select:{
            name: true,
            id : true
        }
    })
    return NextResponse.json(categories)
}