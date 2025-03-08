'use client';

import { useCart } from "@/stores/cart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { BsBagCheck } from "react-icons/bs";

export default function OrderNow({ id, stocks, variants, colors, slug }: { id: string, stocks: number, variants: number, colors: number, slug:string }) {
    let vc: string = '';
    if (variants > 0) {
        vc += 'v';
    }
    if (colors > 0) {
        vc += 'c';
    }

    const router = useRouter()
    const cart = useCart()
    const [adding, setAdding] = useState<boolean>(false)

    const add = useCallback(async () => {
        setAdding(true)
        if (vc !== '') {
            setAdding(false)
            router.push(`/products/${slug}?select=${vc}`)
        } else {
            await cart.addItemToCart(id, 1, { colorId: null, variantId: null })
            setAdding(false)
            router.push("/checkout")
        }
    }, [vc, id, stocks])

    if (stocks) {
        if (vc === '') {
            return <div onClick={add} className="rounded-lg bg-base-theme px-2 py-1.5 text-white my-1 flex items-center justify-center cursor-pointer">
                {adding ? <div className="border-gray-300 h-4 w-4 transition-all animate-spin rounded-full border-2 border-t-blue-600" /> : <><BsBagCheck /> <div className="mx-1"></div> Order Now</>}
                <div className="hidden">{id}</div>
            </div>
        }
        return <Link href={`/products/${slug}?select=${vc}`} className="rounded-lg bg-base-theme px-2 py-1.5 text-white my-1 flex items-center justify-center cursor-pointer">
            {adding ? <div className="border-gray-300 h-4 w-4 transition-all animate-spin rounded-full border-2 border-t-blue-600" /> : <><BsBagCheck /> <div className="mx-1"></div> Order Now</>}
            <div className="hidden">{id}</div>
        </Link>
    }
    return <div className="rounded-lg bg-base-theme px-2 py-1.5 text-white my-1 flex items-center justify-center">
        Out of stock
    </div>
}