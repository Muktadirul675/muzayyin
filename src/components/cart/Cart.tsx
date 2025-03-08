'use client';

import { useErrors } from '@/hooks/errors';
import { Item, useCart } from "@/stores/cart";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BiMinus, BiPlus, BiTrash } from "react-icons/bi";
import Spinner from "../Spinner";
function ItemIncDec({ addItemToCart, item, removeItemFromCart }: { removeItemFromCart: (itemId: string) => Promise<void>, addItemToCart: (id: string, count: number, selection: { variantId: string | null, colorId: string | null }) => Promise<void>, item: Item }) {
    const [updating, setUpdating] = useState<boolean>(false)
    async function inc() {
        setUpdating(true)
        await addItemToCart(item.product.id, 1, { variantId: item.variant?.id ?? null, colorId: item.color?.id ?? null })
        setUpdating(false)
    }
    async function dec() {
        setUpdating(true)
        await removeItemFromCart(item.cartid)
        setUpdating(false)
    }
    return <div className="flex items-center flex-wrap justify-center w-fit font-normal">
        <BiMinus className="inline-block cursor-pointer text-sm h-10 w-5 md:w-10 border border-r-0" onClick={dec} />
        {updating ? <div className="border-gray-300 h-4 w-4 transition-all animate-spin rounded-full border-2 border-t-base-theme" /> :
            <input type="number" value={item.count} name="" id="" className="remove-arrow border rounded-none h-10 w-20 border-x-0 form-input text-center" disabled />}
        <BiPlus className="inline-block cursor-pointer text-sm h-10 w-5 md:w-10 border border-l-0" onClick={inc} />
    </div>
}

function RemoveFullItem({ remove, prodId, variantId, colorId }: { remove: (prodId: string, variantId: string | null, colorId: string | null) => Promise<void>, prodId: string, variantId: string | null, colorId: string | null }) {
    const [removing, setRemoving] = useState<boolean>(false)
    async function del() {
        setRemoving(true)
        await remove(prodId, variantId, colorId)
        setRemoving(true)
    }
    if (removing) {
        return <Spinner size="sm" />
    }
    return <BiTrash onClick={del} className="text-xl me-2 cursor-pointer rounded hover:bg-slate-50" />
}

export default function Cart() {
    const errors = useErrors()

    useEffect(() => {
        for (const e of errors.errors) {
            toast.error(e.error)
        }
    }, [errors.errors])

    const cart = useCart()

    const subTotal = useMemo<number>(() => {
        let price = 0;
        cart.items.forEach((item) => {
            if (item.product.discounted_price) {
                price += item.count * item.product.discounted_price
            } else {
                price += item.count * item.product.price
            }
        })
        return price;
    }, [cart.items])

    if (cart.items.length === 0) {
        return <div className="p-5 w-full flex flex-col md:flex-row justify-center mx-auto">
            <div className="md:w-1/2 bg-white rounded flex flex-col h-52 w-full justify-center items-center">
                <h3 className="text-2xl font-bold mb-2">
                    Nothing on cart!
                </h3>
                <div>
                    <Link href="/" className="btn text-center">Continue Shopping</Link>
                </div>
            </div>
        </div>
    }

    return <>
        <div className="w-full flex md:w-1/2 flex-col md:flex-row justify-center mx-auto p-3">
            <div className="w-full md:w-3/5 p-2 rounded">
                <div className="w-full rounded border p-0">
                    <div className="bg-slate-100 w-full p-3 uppercase rounded font-bold">Products</div>
                    <div className="p-0 flex flex-col">
                        <div className="flex items-center p-3">
                            <h3 className="text-2xl font-bold">Products : {cart.items.length}</h3>
                            {/* <div className="text-xl font-bold ms-auto">{subTotal}</div> */}
                        </div>
                        <div className="w-full h-1 bg-gray-200"></div>
                        {cart.items.map((item) => {
                            return <div key={item.uid} className="p-3 flex flex-col md:flex-row border-b">
                                <div className="flex flex-grow">
                                    <img src={item.product.images[0].url} className="h-20 w-20 object-cover rounded" alt="" />
                                    <div className="mx-2"></div>
                                    <div>
                                        <h3 className="text-lg font-bold">{item.product.name}</h3>
                                        {item.variant && <div className="my-1">
                                            Variant : {item.variant.name}
                                        </div>}
                                        {item.color && <div className="my-1">
                                            Color : {item.color.name}
                                        </div>}
                                    </div>
                                </div>
                                <div className="md:ms-auto font-bold my-1 md:my-0">
                                    <span>{item.product.discounted_price ? item.product.discounted_price : item.product.price}</span> <span className="mx-1">X</span> <span>{item.count}</span>
                                    <div className="flex items-center flex-wrap">
                                        <RemoveFullItem prodId={item.product.id} variantId={item.variant?.id ?? null} colorId={item.color?.id ?? null} remove={cart.removeItemFull} />
                                        <ItemIncDec removeItemFromCart={cart.removeItemFromCart} addItemToCart={cart.addItemToCart} item={item} />
                                    </div>
                                </div>
                            </div>
                        })}
                        <div className="my-2 p-3 font-bold">
                            <div className="flex items-center">
                                <div>Subtotal : </div>
                                <div className="ms-auto">{subTotal} Tk</div>
                            </div>
                        </div>
                        <div className="w-full p-1 flex justify-center">
                            <Link href="/" className="btn flex-grow text-center">Continue Shopping</Link>
                        </div>
                        <div className="flex w-full p-1">
                            <Link href="/checkout" className="btn flex-grow text-center flex justify-center items-center">Checkout</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}
