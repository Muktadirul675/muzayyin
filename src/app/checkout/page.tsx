import { auth } from "@/auth";
import Breadcrumb from "@/components/Breadcrumb";
import OrderForm from "@/components/cart/OrderForm";
import { prisma } from "@/prisma";

export const dynamic = 'force-dynamic'

export default async function Page(){
    const session = await auth()
    const user = await prisma.user.findUnique({
        where:{
            email: session?.user?.email ?? ''
        }
    })

    return <>
        <Breadcrumb links={[{ name: 'Home', url: '/' },{ name: 'Checkout', url: '/checkout' }]}/>
        <OrderForm user={user}/>
    </> 
}