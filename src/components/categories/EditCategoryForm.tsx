'use client'

import { useState } from "react";
import { deleteCategory, editCategory } from "../../actions/category";
import StateButton from "../StateButton";
import Spinner from "../Spinner";
import { BiTrash } from "react-icons/bi";

function Label({ children, htmlFor }: { children: React.ReactNode, htmlFor: string }) {
    return <label htmlFor={htmlFor} className="text-lg font-bold">{children}</label>
}


function DeleteButton({id}:{id: string}) {
    const [deleting, setDeleting] = useState<boolean>(false)

    async function del(){
        setDeleting(true)
        await deleteCategory(id)
        setDeleting(false)
    }

    if(deleting){
        return <Spinner/>
    }
    return <button onClick={del} className="flex items-center justify-center p-3 text-red-500">
        <BiTrash className="text-lg"/>
    </button>
}


export default function EditCategoryForm({category, products}:{category:{
    products: {
        id: string;
        name: string;
    }[];
} & {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}, products:{name:string, id:string}[]}){
    return <form action={editCategory} className="p-1 flex flex-col w-full md:w-1/2 mx-auto">
        <DeleteButton id={category.id}/>
        <input type="text" name="id" defaultValue={category.id} id="" hidden/>
        <Label htmlFor="name">Name</Label>
        <input className="form-input" defaultValue={category.name} type="text" name="name" id="name" required/>
        <div className="my-1">
            <b>Select Products</b> <br />
            {products.map((product) => {
                return <div key={product.id} className="my-1 rounded border p-3 flex">
                    <input type="checkbox" defaultChecked={category.products.some((prod)=>prod.id === product.id)} value={product.id} name="products" /><div className="mx-1"></div> {product.name} <br />
                </div>
            })}
        </div>
        <StateButton>Save</StateButton>
    </form>
}