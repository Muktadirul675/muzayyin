'use client'

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function CategoryBannerSlider({ categories }: { categories: { id: string, logo: string, name: string }[] }) {
    const [acticeIndex, setActiveIndex] = useState<number>(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => {
                if (categories.length % 2) {
                    return (prev + 1) % (categories.length - 1)
                } else {
                    return (prev + 1) % (categories.length)
                }
            })
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    if (categories.length > 2) {
        return <>
            <div className="hidden md:flex justify-around my-2 flex-wrap">
                {categories.map((c) => <Link key={c.id} href={`/categories/${c.id}`} className="p-2 my-2 w-1/2 md:w-1/6">
                    <div className="rounded flex-col justify-center font-bold flex items-center">
                        <Image src={c.logo} alt="" width={50} height={50} />
                        <div className="my-1"></div>
                        <div className="text-sm font-normal">
                            {c.name}
                        </div>
                    </div>
                </Link>)}
            </div>
            <div className="flex md:hidden justify-around my-2 flex-row flex-nowrap overflow-hidden">
                {categories.map((c) => <Link key={c.id} style={{ translate: `${-100 * acticeIndex}%` }} href={`/categories/${c.id}`} className="p-2 flex-grow-0 shrink-0 my-2 w-1/2 md:w-1/5 translate-all duration-200">
                    <div className="rounded flex-col justify-center font-bold flex items-center">
                        <Image src={c.logo} alt="" width={50} height={50} />
                        <div className="my-1"></div>
                        <div className="text-sm font-normal">
                            {c.name}
                        </div>
                    </div>
                </Link>)}
            </div>
        </>
    } else {
        return <>
            <div className="hidden md:flex justify-around my-2 flex-wrap">
                {categories.map((c) => <Link key={c.id} href={`/categories/${c.id}`} className="p-2 my-2 w-1/2 md:w-1/6">
                    <div className="rounded flex-col justify-center font-bold flex items-center">
                        <Image src={c.logo} alt="" width={50} height={50} />
                        <div className="my-1"></div>
                        <div className="text-sm font-normal">
                            {c.name}
                        </div>
                    </div>
                </Link>)}
            </div>
            <div className="flex md:hidden justify-around my-2 flex-row overflow-hidden">
                {categories.map((c) => <Link key={c.id} href={`/categories/${c.id}`} className="p-2 my-2 w-1/2 md:w-1/5 translate-all duration-200">
                    <div className="rounded flex-col justify-center font-bold flex items-center">
                        <Image src={c.logo} alt="" width={50} height={50} />
                        <div className="my-1"></div>
                        <div className="text-sm font-normal">
                            {c.name}
                        </div>
                    </div>
                </Link>)}
            </div>
        </>
    }
}