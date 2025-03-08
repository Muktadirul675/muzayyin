'use client';

import { editCategoryBar } from "@/actions/customize";
import Spinner from "@/components/Spinner";
import { Category } from "@prisma/client";
import { useState } from "react";

interface BarContent{
    name: string,
    id: string
}

export default function CustomizeCategoryBar({selecteds, categories}:{selecteds: BarContent[], categories: Category[]}){
    const [contents, setContents] = useState<BarContent[]>(selecteds)
    const [adding, setAdding] = useState<boolean>(false)
 
    async function save(){
        setAdding(true)
        const formData = new FormData()
        formData.append('categories',JSON.stringify(contents, null, 2))
        await editCategoryBar(formData)
        setAdding(false)
    }

    return <div className="p-3">
        {categories.map((c)=>{
            return <div className="my-1 flex items-center">
                <input type="checkbox" name="" checked={contents.some((co)=>co.id === c.id)} onChange={(e)=>{
                    if(e.target.checked){
                        setContents((prev)=>[...prev, {id: c.id, name: c.name}])
                    }else{
                        setContents((prev)=>prev.filter((p)=>p.id!==c.id))
                    }
                }} id="" /> {c.name}
            </div>
        })}
        {adding ? <Spinner/> : <button onClick={save} className="btn my-1">Save</button>}
    </div>
}