export const dynamic = 'force-dynamic'

import EditProductForm from "@/components/products/EditProductForm";
import { getProduct } from "@/utils/db/products";

export default async function Page({params}:{params:{slug:string}}){
    const product = await getProduct(params.slug)
    return <>
        <EditProductForm product={JSON.parse(JSON.stringify(product))}/>
    </>
}