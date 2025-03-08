'use client';

import { BarContent } from "@/app/admin/customize/categorybar/page";
import { Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { CgClose } from "react-icons/cg";
import { GiHamburgerMenu } from "react-icons/gi";
import { Content } from "./Navbar";

function  ShowContent({content, click}:{content: Content, click: (id:string)=>void}){
    const [show, setShow] = useState<boolean>(false)
    if(content.id){
        return <div onClick={()=>click(content.id ?? '')} className="p-3 font-bold border-b flex items-center last:border-b-0">
            {content.name}
        </div>
    }else{
        return <div className="border-b flex flex-col">
            <div onClick={()=>setShow((prev)=>!prev)} className={`p-3 ${show && 'pb-1.5'} flex font-bold items-center last:border-b-0 rounded hover:bg-slate-50`}>
                {content.name}
                <BiChevronRight className={`text-xl ms-auto ${show ? 'rotate-90 text-base-theme' : 'rotate-0'}`}/>
            </div>
            <div className="p-3 ps-5 pb-1.5 rotate-90 md:rotate-0 hidden h-0"></div>
            {content.subs && <div style={{height: show ? `${12 + (20+4)*content.subs?.length}px` : '0px'}} className={`flex flex-col transition-all overflow-hidden ${show ? 'ps-5' : 'h-0'}`}>
                {content.subs?.map((sub)=>{
                    return <div onClick={()=>click(sub.id ?? '')} className="my-1 text-sm flex items-center">
                        <div className="w-[10px] h-[1px] bg-black me-2"></div> {sub.name}
                    </div>
                })}
            </div>}
        </div>
    }
}

export default function Sidebar({ selecteds }: { selecteds: Content[] }) {
    const [display, setDisplay] = useState<string>('hidden')
    const router = useRouter()
    function toggle() {
        setDisplay((prev) => prev === 'hidden' ? 'block' : 'hidden')
    }
    function click(id: string){
        router.push(`/categories/${id}`)
        setDisplay('hidden')
    }
    return <>
        <div className="block md:hidden">
            <GiHamburgerMenu onClick={toggle} className="text-2xl me-2 cursor-pointer hover:text-base-theme" />
        </div>
        <div id="sidebar" className={`${display} fixed w-full top-0 overflow-x-hidden left-0 bottom-0 z-25 bg-slate-50 p-3 border rounded`}>
            <div className="flex w-[285px] border-b justify-center p-2 flex-col">
                <Image src="/logo.png" height={120} width={120} className="w-1/2 mx-auto" alt="Awal" />
                {/* <h3 className="text-lg font-extrabold mx-auto">zilmil.com.bd</h3> */}
            </div>
            <div className="hidden">
                {selecteds.map((s) => JSON.stringify(s))}
            </div>
            <CgClose onClick={toggle} className="text-2xl cursor-pointer hover:text-base-theme absolute top-4 right-4" />
            {selecteds.map((s, index)=>{
                return <ShowContent click={click} content={s} key={index}/>
            })}
        </div>
    </>
}