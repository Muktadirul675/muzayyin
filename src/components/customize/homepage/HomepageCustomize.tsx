'use client';

import { saveHomepage } from "@/actions/customize";
import StateButton from "@/components/StateButton";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";

interface Prop {
    products: {
        id: string;
        name: string;
    }[],
    id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
}

interface PreProp extends Prop{
    index : number,
    products: {
        id: string;
        name: string;
        index: number
    }[],
}

export default function HomepageCustomize({ categories, preCategories }: { categories: Prop[], preCategories:PreProp[] }) {
    const [selected, setSelected] = useState<{
        products: {
            id: string;
            name: string;
        }[],
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
    }[]>([])

    useEffect(()=>{
        const preCat : Prop[] = []
        for(const i of categories){
            for(const j of preCategories){
                if(i.id === j.id){
                    const cat = {...i};
                    const prods = cat.products.filter((prod)=>j.products.some((p)=>p.id === prod.id))
                    cat.products = prods
                    preCat.push(cat)
                }
            }
        }
        setSelected(preCat)
    },[])

    const initialState = {
        message: '',
        error: ''
    }

    const [state, action] = useFormState(saveHomepage, initialState)

    return <>
        <h3 className="text-lg font-bold">
            Select Categories
        </h3>
        <div className="flex flex-wrap">
            {categories.map((cat) => {
                return <div key={cat.id} className="w-full md:w-1/3 p-1">
                    <div className="p-3 border rounded flex items-center my-1">
                        <div className="border-red-500" hidden></div>
                        <input checked={selected.some((sel) => sel.id == cat.id)} type="checkbox" onChange={(e) => {
                            if (e.target.checked) {
                                setSelected((prev) => [...prev, {...cat, products: preCategories.find((pc)=>pc.id===cat.id)?.products || []}])
                            } else {
                                setSelected((prev) => prev.filter((c) => c.id !== cat.id))
                            }
                        }} name="" id="" /> <div className="mx-2"></div> <b>{cat.name}</b>
                    </div>
                </div>
            })}
        </div>
        <div className="my-1">
            {selected.length && <h3 className="text-lg font-bold">
                Selected Categories
            </h3>}
            <form action={action}>
                {state.message !== '' && <>
                    <div className="p-3 transition-all my-1 bg-green-300 text-white border-green-500 rounded">
                        {state.message}
                    </div>
                </>}
                {state.error !== '' && <>
                    <div className="p-3 transition-all my-1 bg-red-300 text-white border-red-500 rounded">
                        {state.error}
                    </div>
                </>}
                {selected.map((cat) => {
                    return <div key={cat.id} className="p-3 border rounded my-1">
                        <div className="flex items-center">
                            <input checked={true} type="checkbox" onChange={(e) => {
                                if (e.target.checked) {
                                    setSelected((prev) => [...prev, {...cat, products: preCategories.find((pc)=>pc.id===cat.id)?.products || []}])
                                } else {
                                    setSelected((prev) => prev.filter((c) => c.id !== cat.id))
                                }
                            }} name="categories" value={cat.id} id="" /> <div className="mx-2"></div> <b>{cat.name}</b>
                            <input defaultValue={preCategories.find((pc)=>pc.id === cat.id)?.index} type="number" name={`${cat.id}-index`} id="" className={`form-input w-20 ms-auto`} placeholder="Index" />
                        </div>
                        <div className="ps-5 my-1">
                            {categories.find((c)=>c.id===cat.id)?.products.map((prod) => {
                                const preChecked : boolean = selected.find((pc)=>pc.id === cat.id)?.products.some((p)=>p.id == prod.id) || false
                                return <div key={cat.id + '-' + prod.id} className="flex items-center my-1">
                                    <input defaultChecked={preChecked} type="checkbox" name={`${cat.id}-products`} value={prod.id} id="" /> <div className="mx-2"></div> {prod.name}
                                    <input defaultValue={preCategories.find((pc)=>pc.id === cat.id)?.products.find((p)=>p.id===prod.id)?.index}  type="number" name={`${cat.id}-${prod.id}-index`} id="" className="form-input w-20 ms-auto" placeholder="Index" />
                                </div>
                            })}
                        </div>
                    </div>
                })}
                <StateButton>Save</StateButton>
            </form>
        </div>
    </>
}
