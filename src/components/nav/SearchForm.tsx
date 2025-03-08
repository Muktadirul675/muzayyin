'use client';

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SearchForm({forceFull = false}:{forceFull?: boolean}) {
    const [query, setQuery] = useState<string>('')
    const router = useRouter()

    async function submit(e:FormEvent){
        e.preventDefault()
        router.push(`/search?query=${query}`)
    }

    return <form onSubmit={submit} className={`w-full ${forceFull ? 'md:w-full' : 'md:w-1/2'} border relative rounded flex items-center text-white`}>
        <input onChange={(e)=>setQuery(e.target.value)} placeholder="Search Products" className="px-2 text-lg flex-grow bg-base-theme mx-0 h-[40px] focus:outline-none focus:border-base-theme" type="text" name="" id="" required />
        <button className="bg-base-theme text-white h-[40px] px-2 rounded-tr-sm rounded-br-sm">
            Search
        </button>
    </form>
}