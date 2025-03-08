import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 120

export async function GET(){
    const count = await prisma.order.count()
    const pending = await prisma.order.count({where:{
        status: 'Pending'
    }})
    const delivered = await prisma.order.count({where:{
        status: 'Delivered'
    }})
    const returned = await prisma.order.count({where:{
        status: 'Returned'
    }})
    const confirmed = await prisma.order.count({where:{
        status: 'Complete'
    }})
    const dismissed = await prisma.order.count({where:{
        status: 'Dismissed'
    }})
    const hold = await prisma.order.count({where:{
        status: 'Hold'
    }})
    return NextResponse.json({
        count : count,
        pending: pending,
        delivered: delivered,
        returned : returned,
        confirmed: confirmed,
        dismissed:dismissed,
        hold:hold,
    })
}