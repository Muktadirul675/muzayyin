'use client';

import { useCart } from "@/stores/cart";
import Link from "next/link";
import { useState } from "react";
import { BsBag } from "react-icons/bs";

export default function HomeAddCartButton({ id, variants, colors, slug }: { id: string, variants: number, colors: number, slug:string }) {
    let vc: string = '';
    if (variants > 0) {
        vc += 'v';
    }
    if (colors > 0) {
        vc += 'c';
    }

    const cart = useCart()
    const [adding, setAdding] = useState<boolean>(false)
    async function handle() {
        setAdding(true)
        await cart.addItemToCart(id, 1, { variantId: null, colorId: null })
        setAdding(false)
    }
    if (vc !== '') {
        return <Link href={`/products/${slug}?select=${vc}`}>
            <BsBag className='hover:text-base-theme transition-all text-2xl cursor-pointer' />
        </Link>
    }
    if (adding) {
        return <div className="border-gray-300 h-4 w-4 transition-all animate-spin rounded-full border-2 border-t-base-theme" />
    }
    return <BsBag onClick={handle} className='hover:text-base-theme transition-all text-2xl cursor-pointer' />
}
