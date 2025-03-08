'use client'

import { useCart } from "@/stores/cart"
import { Category, Color, Image, Product as PProduct, Variant } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"
import { BiMinus, BiPlus } from "react-icons/bi"
import { BsBagPlus } from "react-icons/bs"
import { CgCheck, CgShoppingCart } from "react-icons/cg"

interface Product extends PProduct {
    categories: Category[];
    images: Image[];
    variants: Variant[],
    colors: Color[]
}

export default function AddToCartaOrBuy({ product }: { product: Product }) {
    const [count, setCount] = useState<number>(1)
    const cart = useCart()
    const [color, setColor] = useState<Color | null>(null)
    const [variant, setVariant] = useState<Variant | null>(null)
    const router = useRouter()
    const [ordering, setOrdering] = useState<boolean>(false)
    const [addingToCart, setAddingToCart] = useState<boolean>(false)

    async function ordernow() {
        if(count > 0){
            setOrdering(true)
            let invalid: boolean = false;
            if (product.colors.length && !color) {
                invalid = true;
                toast.error("Please select a color")
            }
            if (product.variants.length && !variant) {
                invalid = true;
                toast.error("Please select a variant")
            }
            if (invalid) {
                setOrdering(false)
                return;
            }
            await cart.addItemToCart(product.id, count, { colorId: color?.id ?? null, variantId: variant?.id ?? null })
            router.push("/checkout")
            setOrdering(false)
        }else{
            toast.error("Please provide a quantity")
        }
    }

    async function add() {
        if(count > 0){
            setAddingToCart(true)
            let invalid: boolean = false;
            if (product.colors.length && !color) {
                invalid = true;
                toast.error("Please select a color")
            }
            if (product.variants.length && !variant) {
                invalid = true;
                toast.error("Please select a variant")
            }
            if (invalid) {
                setAddingToCart(false)
                return;
            }
            await cart.addItemToCart(product.id, count, { variantId: variant?.id ?? null, colorId: color?.id ?? null })
            setAddingToCart(false)
        }else{
            toast.error("Please provide a quantity")
        }
    }

    return <>
        {product.colors.length ? <div className="my-1">
            {/* <h3 className="font-bold">Choose a color:</h3> */}
            <div className="my-1 flex flex-row flex-nowrap items-start">
                {product.colors.map((c) => <div key={c.id} onClick={() => setColor(c)} className="me-2 my-1 flex flex-col w-fit items-start">
                    <div className="border h-10 w-10 cursor-pointer rounded-full" style={{ backgroundColor: c.hex }}>
                    </div>
                    <div className="flex justify-center w-full text-center m-0">
                        {(color?.id === c.id) && <CgCheck className={`text-2xl inline text-green-500 m-0`} />}
                    </div>
                </div>)}
            </div>
        </div> : null}
        {product.variants.length ? <div className="my-1">
            {/* <h3 className="font-bold">Choose a variant:</h3> */}
            <div className="my-1 flex flex-row flex-nowrap">
                <div className="bg-base-theme text-white hidden"></div>
                {product.variants.map((v) => <div key={v.id} onClick={() => setVariant(v)} className={`border relative p-1 px-4 me-2 my-1 cursor-pointer ${(v.id === variant?.id) && 'bg-base-theme text-white'}`}>{v.name}</div>)}
            </div>
        </div> : null}
        <div className="flex items-center">
            <div className="w-fit px-1 flex items-center">
                <div className="h-10 flex justify-center items-center w-10 border border-r-0">

                <BiMinus className="cursor-pointer text-sm h-5 w-10 " onClick={() => (count - 1 < 0) ? null : setCount((prev) => prev - 1)} />
                </div>
                <input type="number" name="" className="border text-center w-10 h-10 remove-arrow p-1.5 m-0 md:border-x-0" value={count} onChange={(e) => setCount(parseInt(e.target.value))} id="" />
                <div className="w-10 h-10 flex justify-center items-center border border-l-0">

                <BiPlus className="cursor-pointer text-sm h-5 w-10 " onClick={() => setCount((prev) => prev + 1)} />
                </div>
            </div>
            <div className=" p-1">
                {product.stocks > 0 ?
                    <div onClick={ordernow} className=" flex items-center justify-center bg-base-theme rounded text-white p-2 px-4 cursor-pointer">
                        {ordering ? <div className="border-gray-300 h-4 w-4 transition-all animate-spin rounded-full border-2 border-t-blue-600" /> : <>
                            <BsBagPlus /> <div className="mx-1"></div> <span className="">Order Now</span>
                        </>
                        }
                    </div>
                    : <div className="w-full flex items-center justify-center bg-red-500 text-white p-2">
                        <span className="">Out of stock</span>
                    </div>}
            </div>
            {product.stocks > 0 &&
                <>
                    {addingToCart ? <div className="border-gray-300 h-4 w-4 transition-all  animate-spin rounded-full border-2 border-t-red-500" /> :
                        <div className="w-1/4 h-full">
                            <div onClick={() => add()} className="w-full h-full flex flex-wrap items-center justify-center bg-base-theme rounded text-white p-2 cursor-pointer">
                                <CgShoppingCart className="text-2xl md:text-lg"/> <div className="mx-1 hidden md:block"></div> <span className="hidden md:inline">Add To Cart</span>
                            </div>
                        </div>
                    }
                </>
            }
        </div>
    </>
}