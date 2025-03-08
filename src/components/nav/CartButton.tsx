'use client';

import { useCart } from "@/stores/cart";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";

export default function CartButton(){
    const cart = useCart()
    return <Link href="/cart" className="flex rounded-full relative items-center cursor-pointer hover:text-base-theme transition-all">
        <FaShoppingCart className="text-2xl font-bold"/>
        <div className="text-lg right-0 top-0 font-bold px-1.5 py-1 rounded-full">{cart.cart.length}</div>
    </Link>
}