import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')
    if(!phone){
        return NextResponse.json({'rate':'N/A'}) 
    }
    const total = await prisma.order.count({
        where: { phone: phone }
    })
    const negative = await prisma.order.count({
        where:{
            phone: phone,
            status :{
                in: ['Failed','Return','Dismiss']
            }
        }
    })
    if(total === 0){
        return NextResponse.json({'rate':'N/A'})
    }
    let rate;
    if(negative === 0){
        rate = 100;
    }else{
        rate = ((total - negative) * 100) /  total
    }
    return NextResponse.json({'rate':`${rate}`})
}