'use client'

import { signOut } from "next-auth/react";

export default function LogoutButton(){
    return <div onClick={()=> signOut()} className="btn flex items-center justify-center cursor-pointer">
        Logout
    </div>
}