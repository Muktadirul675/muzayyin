'use client'

import { addCategory } from "@/actions/category";
import { ListedProduct } from "@/types";
import StateButton from "../StateButton";

function Label({ children, htmlFor }: { children: React.ReactNode, htmlFor: string }) {
    return <label htmlFor={htmlFor} className="text-lg font-bold">{children}</label>
}

export default function AddCategoryForm({ products }: { products: ListedProduct[] }) {
    return <form action={addCategory} className="p-3 w-full md:w-1/2 mx-auto flex flex-col">
        <Label htmlFor="name">Name</Label>
        <input type="text" name="name" className="form-input" required/>
        <div className="my-1">
            <b>Select Products</b> <br />
            {products.map((product) => {
                return <div key={product.id} className="my-1 rounded border p-3 flex">
                    <input type="checkbox" value={product.id} name="products" /><div className="mx-1"></div> {product.name} <div className="ms-auto">{product.stocks}</div> <br />
                </div>
            })}
        </div>
        <StateButton>Add</StateButton>
    </form>
}