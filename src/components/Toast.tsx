'use client';

import toast from "react-hot-toast";

export default function Toast({message}:{message:string}){
    toast.error(message)
    return null;
}
