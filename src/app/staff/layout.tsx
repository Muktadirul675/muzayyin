import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { redirect } from "next/navigation"

export default async function Layout({children}:{children: React.ReactNode}){
    const session = await auth()
    const user = await prisma.user.findUnique({
        where:{
            email: session?.user?.email ?? ''
        }
    })
    if(!user){
        redirect('/unauthorized')
    }
    if(!user.is_staff){
        redirect('/unauthorized')
    }
    return children
}