'use client';

import { Color, Variant } from "@prisma/client";
import { useMemo, useState } from "react";
import Spinner from "../Spinner";

function Product({ addStocks, product }: {
    addStocks: (prodId: string, stocks: number, variants: { id: string, stocks: number }[], colors: { id: string, stocks: number }[]) => Promise<void>, product: {
        name: string;
        id: string;
        slug: string;
        stocks: number;
        price: number;
        discounted_price: number | null;
        variants: Variant[],
        colors: Color[]
    }
}) {
    const [adding, setAdding] = useState<boolean>(false)
    const [stocks, setStocks] = useState<number>(0)
    const [colors, setColors] = useState<{ id: string, stocks: number }[]>(product.colors.map((v) => { return { id: v.id, stocks: 0 } }))
    const [variants, setVariants] = useState<{ id: string, stocks: number }[]>(product.variants.map((c) => { return { id: c.id, stocks: 0 } }))

    async function add() {
        setAdding(true)
        await addStocks(product.id, stocks, variants, colors)
        setAdding(false)
    }
    return <div className="my-1 shadow rounded p-3 flex items-center">
        {/* {JSON.stringify(product)} */}
        <div className="w-1/4">
            <h3 className="text-lg font-bold">
                {product.name}
            </h3>
            <h3>Current Stocks: {product.stocks}</h3>
            <input type="number" name="" value={stocks} placeholder="New Stocks" onChange={(e)=>setStocks(parseInt(e.target.value))} id="" className="form-input" />
        </div>
        <div className="w-1/4">
            Variants:
            {product.variants.map((v) => {
                return <div key={v.id}>
                    <h3>{v.name} : {v.stocks}</h3>
                    <input type="number" name="" onChange={(e) => setVariants((prev) => prev.map((p) => {
                        if (p.id === v.id) {
                            p.stocks = parseInt(e.target.value)
                        }
                        return p;
                    }))} placeholder="New Stocks" id="" className="form-input" />
                </div>
            })}
        </div>
        <div className="w-1/4">
            Colors:
            {product.colors.map((c) => {
                return <div key={c.id}>
                    <h3>{c.name} : {c.stocks}</h3>
                    <input type="number" name="" onChange={(e) => setColors((prev) => prev.map((p) => {
                        if (p.id === c.id) {
                            p.stocks = parseInt(e.target.value)
                        }
                        return p;
                    }))} placeholder="New Stocks" id="" className="form-input" />
                </div>
            })}
        </div>
        <div className="w-1/4">
            {adding ? <Spinner/> :<button onClick={add} className="btn">Add</button>}
        </div>
    </div>
}

export default function StockManagement({ allProducts }: {
    allProducts: {
        name: string;
        id: string;
        slug: string;
        stocks: number;
        price: number;
        discounted_price: number | null;
        variants: Variant[],
        colors: Color[]
    }[]
}) {
    const [products, setProducts] = useState<{
        name: string;
        id: string;
        slug: string;
        stocks: number;
        price: number;
        discounted_price: number | null;
        variants: Variant[],
        colors: Color[]
    }[]>(allProducts)
    const [searchStr, setSearchStr] = useState<string>('')
    const filtered = useMemo(() => {
        if (searchStr === '') {
            return products
        } else {
            return products.filter((prod) => prod.name.toLowerCase().includes(searchStr.toLowerCase()))
        }
    }, [searchStr, products])
    const lowStocks = useMemo(() => {
        return products.filter((p) => p.stocks <= 5)
    }, [products])

    async function addStocks(prodId: string, stocks: number, variants: { id: string, stocks: number }[], colors: { id: string, stocks: number }[]) {
        const res = await fetch("/api/stocks/add", { 
            method: "post",
            body: JSON.stringify({
                prodId:prodId, stocks: stocks, variants:variants, colors:colors
            })
         })
        const data: { id: string, stocks: number, variants: { id: string, stocks: number }[], colors: { id: string, stocks: number }[] } = await res.json()
        console.log(data)
        setProducts((prev) => prev.map((prod) => {
            const product = { ...prod }
            if (data.id === product.id) {
                product.stocks = data.stocks
                product.variants = product.variants.map((va) => {
                    const v = { ...va }
                    for (const pv of data.variants) {
                        if (pv.id === v.id) {
                            v.stocks = pv.stocks
                            break
                        }
                    }
                    return v;
                })
                product.colors = product.colors.map((va) => {
                    const v = { ...va }
                    for (const pv of data.colors) {
                        if (pv.id === v.id) {
                            v.stocks = pv.stocks
                            break
                        }
                    }
                    return v;
                })
            }
            console.log(product)
            return product
        }))
    }

    return <div className="flex flex-col">

        {lowStocks.length > 0 && <div className="my-1">
            <h3 className="text-lg text-red-500">
                Low Stocks
            </h3>
            {lowStocks.map((prod) => {
                return <Product key={prod.id} product={prod} addStocks={addStocks} />
            })}
        </div>}

        <input type="text" name="" value={searchStr} placeholder="Search" onChange={((e) => setSearchStr(e.target.value))} id="" className="form-input my-1" />
        {filtered.map((prod) => {
            return <Product key={prod.id} product={prod} addStocks={addStocks} />
        })}
    </div>
}
