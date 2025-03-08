import StockManagement from "@/components/stocks/StockManagement";
import { prisma } from "@/prisma";

export const dynamic = 'force-dynamic'

export default async function AddStocks(){
    const products = await prisma.product.findMany({
        select:{
            id:true,
            name: true,
            slug: true,
            stocks: true,
            price: true,
            discounted_price: true,
            variants: true,
            colors: true
        }
    })
    return <StockManagement allProducts={products}/>
}