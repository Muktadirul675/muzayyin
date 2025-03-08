'use client'

import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { BiSearch } from "react-icons/bi"
import { CgClose } from "react-icons/cg"

export default function SearchButton() {
    const [query, setQuery] = useState<string>('')
    const [display, setDisplay] = useState<string>('hidden')
    const router = useRouter()

    async function submit(e:FormEvent){
        e.preventDefault()
        setDisplay('hidden')
        router.push(`/search?query=${query}`)
    }

    return <>
        <div className="block md:hidden">
            <div className="hidden md:flex" hidden></div>
            <BiSearch onClick={() => setDisplay((prev) => prev === 'hidden' ? 'flex' : 'hidden')} className="text-2xl font-bold cursor-pointer hover:text-base-theme" />
        </div>
        <form onSubmit={submit} className={`${display} items-center absolute top-full left-0 right-0 bg-white p-3`} id="topSearchForm">
            <input onChange={(e)=>setQuery(e.target.value)} placeholder="Search Products" className="border-2 px-2 text-lg w-1/2 border-base-theme mx-0 h-[40px] focus:outline-none focus:border-base-theme flex-grow" type="text" name="" id="" required />
            <button className="bg-base-theme flex items-center justify-center text-white h-[40px] px-2 rounded-tr-sm rounded-br-sm">
                Search
            </button>
            <CgClose onClick={()=> setDisplay((prev) => prev === 'hidden' ? 'flex' : 'hidden')} className="mx-2 text-2xl"/>
        </form>
    </>
}