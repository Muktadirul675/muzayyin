import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";


export const dynamic = 'force-dynamic';

export async function GET(){
    const session = await auth()
    if(!session){
        throw new Error("Must be logged in")
    }
    const user = await prisma.user.findFirst({
        where:{email: session.user?.email as string},
        select:{
            cart: {
                include:{
                    product: {
                        include:{
                            images:{
                                take: 1
                            }
                        }
                    },
                    variant: true,
                    color: true
                }
            }
        }
    })
    console.log(user)
    return NextResponse.json(user?.cart ?? null)
}

export async function POST(request: NextRequest){
    const searchParams = request.nextUrl.searchParams
    const prodId = searchParams.get('product')
    const variantId = searchParams.get('variant')
    const colorId = searchParams.get('color')
    if(!prodId){
        throw new Error("Must provide product id")
    }
    const session = await auth()
    if(!session){
        throw new Error("Must be logged in")
    }
    const user = await prisma.user.findFirst({where:{email:session?.user?.email as string}, select:{id:true}})
    if(!user){
        throw new Error("User not found")
    }
    try{
        const cartItem = await prisma.cartItem.create({
            data:{
                userId: user.id,
                productId: prodId,
                variantId: variantId,
                colorId: colorId
            },
            include:{
                product: {
                    include:{
                        images:{
                            take:1
                        }
                    }
                },
                variant: true,
                color: true
            }
        })
        return NextResponse.json(cartItem)
    }catch(e){
        console.log(e)
    }

}