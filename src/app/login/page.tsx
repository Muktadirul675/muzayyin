'use client';

import Image from "next/image"
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function  LoginPage(){
    const session = useSession()
    const router = useRouter()
    useEffect(()=>{
        if(session.status === 'authenticated'){
            router.push('/')
        }
    })
    return (
        <div className="flex p-5 items-center justify-center">
            <div>
                <div className="flex items-center justify-center my-2">
                    <b className="text-2xl me-2">Login to</b>
                    <Image src="/logo.png" alt="Zilmil" width={160} height={90} />
                </div>
                <div onClick={()=>signIn('google',{
                    callbackUrl: '/profile'
                })} className="flex flex-row select-none cursor-pointer hover:border hover:border-yellow-300 items-center transition-all bg-slate-100 rounded p-3 my-2">
                    <Image src='/google.png' alt='Google' width={30} height={30} /> <div className="mx-2"></div> Login With Google
                </div>
            </div>
        </div>
    )
}