export const dynamic = 'force-dynamic'

import AddCategoryForm from "@/components/categories/AddCategoryForm";
import { getAllProductsList } from "@/utils/db/products";

export default async function Page(){
    const products = await getAllProductsList()
    return <div className="p-1">
        <AddCategoryForm products={products}/>
    </div>
}