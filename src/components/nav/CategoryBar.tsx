'use client';

import { BarContent } from "@/app/admin/customize/categorybar/page";
import { Category } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { Content } from "./Navbar";
import CartButton from "./CartButton";
import { usePathname } from "next/navigation";

function ShowContent({ cont }: { cont: Content }) {
    const [display, setDisplay] = useState<boolean>(false)
    if (cont.subs?.length && cont.subs?.length > 0) {
        return <div onClick={() => setDisplay((prev) => !prev)} onMouseEnter={() => setDisplay(true)} onMouseLeave={() => setDisplay(false)} className="p-3 border-b cursor-pointer">
            <b>{cont.name}</b>
            <div className="ms-auto"></div>
            <BiChevronRight />
            {display && <div onMouseEnter={() => setDisplay(true)} onMouseLeave={() => setDisplay(false)} className="absolute px-2 top-0 right-0">
                <div className="flex flex-col bg-white border">
                    {cont.subs.map((sub) => {
                        return <Link href={`/categories/${sub.id}`} className="p-3 flex items-center border-b cursor-pointer">
                            <b>{sub.name}</b>
                        </Link>
                    })}
                </div>
            </div>}
        </div>
    } else {
        return <Link href={`/categories/${cont.id}`} className="p-3 flex items-center border-b cursor-pointer">
            <b>{cont.name}</b>
        </Link>
    }
}

export default function CategoryBar({ selecteds, categories }: { selecteds: BarContent[], categories: Content[] }) {
    const [show, setShow] = useState<boolean>(false)
    function click() {
        setShow((prev) => !prev)
    }
    const [activeSub, setActiveSub] = useState<number | null>(null)
    useEffect(() => {
        if (!show) {
            setActiveSub(null)
        }
    }, [show])
    const path = usePathname()
    if (path.startsWith("/admin")) {
        return null;
    }
    return <>
        <div className="hidden md:flex  w-full justify-center border-b shadow">
            <div className="w-2/3 flex relative items-center">
                <div onClick={click} className="bg-red-500 h-full cursor-pointer text-white flex items-center px-5 py-3 p-3">
                    Browse Categories
                </div>
                <div className="border-l-[0.5px] border-r-[0.5px]  border-gray-200 border-opacity-70 cursor-pointer">
                    <div className="hidden md:flex" hidden></div>
                    {show && <div onMouseEnter={() => setShow(true)} onMouseLeave={() => {
                        setShow(false)
                    }} className={`flex w-[620px] animate-topDownSlide transition-all rounded text-black absolute left-0 top-[100%] z-20 `}>
                        <div className="my-2">
                            <div className="bg-white min-w-[200px] flex-grow border rounded flex flex-col">
                                {categories.map((c, index) => {
                                    if (c.id) {
                                        return <Link key={index} onMouseEnter={() => setActiveSub(index)} href={`/categories/${c.id}`} className="hover:bg-slate-50 text-lg h-[52px] flex justify-start items-center px-3 border-b">
                                            {c.name}
                                        </Link>
                                    }
                                    return <div key={index} onMouseEnter={() => setActiveSub(index)} className="hover:bg-slate-50 text-lg h-[52px] flex justify-start items-center px-3 border-b">
                                        {c.name}
                                        <BiChevronRight className="text-xl ms-auto" />
                                    </div>
                                })}
                            </div>
                        </div>
                        <div className="mx-2"></div>
                        <div className="flex-grow min-w-[200px] h-fit flex flex-col my-2">
                            <div className="hidden md:block"></div>
                            {categories.map((c, index) => {
                                if (c.subs?.length) {
                                    return <div style={{ marginTop: `${52 * index}px` }} key={index} className={`bg-white font-normal border flex flex-col w-full rounded ${activeSub !== index ? 'hidden' : 'block'}`}>
                                        {c.subs?.map((s) => {
                                            return <Link key={s.id} href={`/categories/${s.id}`} className="hover:bg-slate-50 p-3 border-b last:border-b-0">
                                                {s.name}
                                            </Link>
                                        })}
                                    </div>
                                }
                                return null
                            })}
                        </div>
                    </div>}
                </div>
                <div className="ms-auto flex items-center p-3">
                    <Link href="/" className="hover:text-white font-bold rounded-xl mx-2 px-3 py-1.5 hover:bg-red-200 transition-all">
                        Home
                    </Link>
                    <Link href="/" className="hover:text-white font-bold rounded-xl mx-2 px-3 py-1.5 hover:bg-red-200 transition-all">
                        About
                    </Link>
                    {selecteds.map((s) => {
                        return <Link href={`/categories/${s.id}`} className="hover:text-white font-bold rounded-xl mx-2 px-3 py-1.5 hover:bg-red-200 transition-all">
                            {s.name}
                        </Link>
                    })}
                    <CartButton />
                </div>
            </div>
        </div>
    </>
}