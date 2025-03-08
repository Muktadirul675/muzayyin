'use client';

import { Item, useCart } from "@/stores/cart";
import { User } from "@prisma/client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BiMinus, BiPlus, BiTrash } from "react-icons/bi";
import Spinner from "../Spinner";
import { useErrors } from '@/hooks/errors'
import toast from "react-hot-toast";
import Image from "next/image";

function Label({ children, htmlFor }: { children: React.ReactNode, htmlFor: string }) {
    return <label htmlFor={htmlFor} className="text-lg font-bold">{children}</label>
}

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

export default function OrderForm({ user }: { user: User | null }) {
    const [name, setName] = useState<string>(user?.name ?? '')
    const [phone, setPhone] = useState<string>(user?.phone ?? '')
    const [address, setAddress] = useState<string>(user?.address ?? '')
    const [insideDhaka, setInsideDhaka] = useState<boolean>(true)
    const errors = useErrors()

    useEffect(() => {
        for (const e of errors.errors) {
            toast.error(e.error)
        }
    }, [errors.errors])

    const [placing, setPlacing] = useState<boolean>(false)

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

    const total = useMemo<number>(() => {
        const deliverCharge: number = insideDhaka ? 60 : 110;
        return subTotal + deliverCharge;
    }, [subTotal, insideDhaka])

    const placeOrder = useCallback(async () => {
        setPlacing(true)
        if (!address || !name || !phone) {
            errors.add("Please provide name, address and phone number")
            setPlacing(false)
            return;
        }
        await cart.placeOrder(name, address, insideDhaka, phone, total)
        setPlacing(false)
    }, [name, address, insideDhaka, phone, total])

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
            <div className="w-full md:w-2/5 p-2 rounded">
                <div className="w-full rounded border">
                    <div className="bg-slate-200 w-full p-3 uppercase rounded font-bold">Billing Details</div>
                    <div className="p-3 bg-white flex flex-col">
                        <Label htmlFor="name">Name</Label>
                        <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Write your nane" name="name" id="" className="shadow form-input my-3" />
                        <Label htmlFor="name">Phone Number</Label>
                        <input value={phone} onChange={(e) => setPhone((e.target.value))} type="text" placeholder="Write your number" name="phone" id="" className="shadow form-input my-3" />
                        <Label htmlFor="name">Address</Label>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Write your address" name="address" id="" className="shadow form-input my-3" />
                        <h3 className="text-lg font-bold">Select your area</h3>
                        <div className="flex items-center">
                            <input checked={insideDhaka} onChange={(e) => setInsideDhaka(e.target.checked)} type="radio" name="id_dhaka" id="" /> <div className="mx-2"></div> Inside Dhaka
                        </div>
                        <div className="my-1"></div>
                        <div className="flex items-center">
                            <input checked={!insideDhaka} onChange={(e) => setInsideDhaka(!e.target.checked)} type="radio" name="id_dhaka" id="" /> <div className="mx-2"></div> Outside Dhaka
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-3/5 p-2">
                <div className="w-full border-2 border-black p-3 my-4">
                    <h3 className="text-lg font-bold">Your Order</h3>
                    <div className="flex flex-row my-2">
                        <h3 className="font-bold">Products</h3>
                        <h3 className="font-bold ms-auto">Subtotal</h3>
                    </div>
                    <hr />
                    {cart.items.map((item) => <div className="flex p-2 items-center">
                        <Image quality={100} src={item.product.images[0].url} alt="Image" height={80} width={80} className="w-[80px] h-[80px]" />
                        <div className="ms-3 h-full">
                            <h3 className="font-bold">{item.product.name} <span className="mx-1"></span> <span>X {item.count}</span></h3>
                            {item.variant !== null && <div>
                                {item.variant.name}
                            </div>}
                            {item.color !== null && <div>
                                {item.color.name}
                            </div>}
                        </div>
                        <h3 className="text-lg font-bold ms-auto">{item.product.discounted_price ? item.product.discounted_price : item.product.price} </h3>
                    </div>)}
                    <hr />
                    <div className="flex items-center">
                        <h3 className="text-lg font-bold">Subtotal</h3>
                        <h3 className="text-lg font-bold ms-auto">{subTotal}</h3>
                    </div>
                    <div className="flex items-center">
                        <h3 className="text-lg font-bold">Shipping</h3>
                        <h3 className="text-lg font-bold ms-auto">{insideDhaka ? '60' : '110'}</h3>
                    </div>
                    <hr className="my-2" />
                    <div className="flex items-center">
                        <h3 className="text-lg font-bold">Total</h3>
                        <h3 className="text-lg font-bold ms-auto">{total}</h3>
                    </div>
                    <div className="p-3">
                        <b>Cash on delivery</b>
                        <br />
                        Pay with cash upon delivery
                    </div>
                    <div className="w-full flex justify-center">
                        {placing ? <Spinner /> : <button onClick={placeOrder} className="w-full rounded-lg p-3 bg-base-theme text-white">
                            Complete Order
                        </button>}
                    </div>
                </div>
            </div>
        </div>
    </>
}
