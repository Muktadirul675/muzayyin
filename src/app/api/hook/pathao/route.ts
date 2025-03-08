import { prisma } from "@/prisma"
import { checkProductAvailability } from "@/utils/orders"
import { revalidatePath } from "next/cache"
// X-Pathao-Merchant-Webhook-Integration-Secret
export async function POST(req: Request){
    const zilmil_secret = process.env.ZILMIL_SECRET
    const headers = req.headers
    const secret = headers.get('X-PATHAO-Signature')
    if(!(secret === zilmil_secret)){
        throw new Error("Secret mismatched")
    }
    const data = await req.json()
    const id = data.merchant_order_id
    const c_id = data.consignment_id
    const event : string = data.event
    const status = event.split('.')[1]
    let increment = 0;
    let newStatus : string | null = null;

    if(event === 'order.returned' || event === 'order.delivery-failed' || event==='order.pickup-failed' || event==='order.pickup-cancelled' || event === 'order.paid-return'){
        increment = 1;
    }
    if(event === 'order.delivered' || event === 'order.partial-delivery'){
        newStatus = 'Delivered'
    }
    if(event === 'order.returned'){
        newStatus = 'Return'
    }
    if(event === 'order.delivery-failed'){
        newStatus = 'Failed'
    }

    const webhook_secret = process.env.PATHAO_WEBHOOK_SECRET
    if(!webhook_secret){
        throw new Error("Secret not found")
    }
    const pathaoHeaders = new Headers()
    pathaoHeaders.append('X-Pathao-Merchant-Webhook-Integration-Secret', webhook_secret)
    let order;
    if(newStatus){
        order = await prisma.order.update({
            where:{
                id:id,
            },
            data:{
                status: newStatus,
                courier_status: status,
            },
            select:{
                items: true
            }
        })
    }else{
        order = await prisma.order.update({
            where:{
                id:id,
            },
            data:{
                courier_status: status,
            },
            select:{
                items: true
            }
        })
    }  

    if(increment > 0){
        await prisma.product.updateMany({
            where:{
                orders:{
                    some:{
                        id: {
                            in: order.items.map((o)=>{return o.id})
                        }
                    }
                }
            },
            data:{
                stocks:{
                    increment: increment
                }
            }
        })
    }

    checkProductAvailability(order.items.map((o)=>o.productId))
    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/orders')
    revalidatePath('/admin/products')

    return new Response(JSON.stringify(order),{
        status: 200,
        headers: pathaoHeaders
    })
}