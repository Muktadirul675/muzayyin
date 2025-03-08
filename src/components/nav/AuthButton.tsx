'use client'

import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

export default function AuthButton(){
    const {data:session} =  useSession()
    if(session){
        return <Link href='/profile'>
            <Image quality={100} src={session.user?.image as string} alt={session.user?.name as string} height={40} width={40} className="rounded-full h-10 w-10"/>
        </Link>
    }
    return <Link href="/login" className="text-lg hover:text-base-theme">
        Login
    </Link>
}