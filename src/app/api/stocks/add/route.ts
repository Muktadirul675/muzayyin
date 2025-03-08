import { prisma } from "@/prisma"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export async function POST(request: Request){
    const data :{prodId:string, stocks: number, variants:{stocks:number, id:string}[], colors:{stocks:number, id:string}[]} = await request.json()
    console.log(data)
    let product = await prisma.product.findUnique({
        where:{id:data.prodId},
        select:{
            id: true,
            stocks: true
        }
    })
    console.log("prev prod ", product)
    product = await prisma.product.update({
        where:{id:data.prodId},
        data:{
            stocks: (product?.stocks ?? 0) + data.stocks,
        }
    })
    console.log("next prod ", product)
    for(const variant of data.variants){
        console.log(variant)
        const v = await prisma.variant.findUnique({
            where:{id:variant.id},
        })
        await prisma.variant.update({
            where:{
                id: variant.id
            },
            data:{
                stocks: (v?.stocks ?? 0) + variant.stocks
            }
        })
    }

    for(const color of data.colors){
        const v = await prisma.color.findUnique({
            where:{id:color.id},
        })
        await prisma.color.update({
            where:{id:v?.id},
            data:{
                stocks: (v?.stocks ?? 0) + color.stocks
            }
        })
    }
    const prod = await prisma.product.findUnique({
        where: {id:data.prodId},
        select:{
            id: true,
            name: true,
            stocks: true,
            variants:{
                select:{
                    name: true,
                    id: true,
                    stocks: true
                }
            },
            colors:{
                select:{
                    name: true,
                    id: true,
                    stocks: true
                }
            }
        }
    })
    revalidatePath("/admin")
    revalidatePath("/admin/products")
    revalidatePath("/admin/stocks")
    revalidatePath("/admin/categories")
    return NextResponse.json(prod)
}