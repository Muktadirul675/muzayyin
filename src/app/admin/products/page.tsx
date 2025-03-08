import ProductTable from "@/components/products/ProductTable";
import { getAllProductsList } from "@/utils/db/products";
import Link from "next/link";
import { BiPlus } from "react-icons/bi";

export const revalidate = 3600;

export default async function Page() {
    const products = await getAllProductsList()
    const lowStocks = products.filter((product) => product.stocks <= 5 && product.stocks > 0)
    const notAvailables = products.filter((product) => !product.is_available || product.stocks <= 0)
    const outOfStocks = products.filter((product) => product.stocks <= 0)
    return <>
        <div className="flex flex-col md:flex-row mb-2">
            <div className="w-full md:w-1/4 p-2">
                <div className="rounded w-full p-3 text-white bg-red-500 relative">
                    <div className="text-[50px]">
                        {products.length}
                    </div>
                    Total Products
                    <Link href="/admin/products/add" className="btn absolute bottom-0 right-0 p-3"><BiPlus className="text-2xl"/></Link>
                </div>
            </div>
            <div className="w-full md:w-1/4 p-2">
                <div className="rounded w-full p-3 text-white bg-red-500">
                    <div className="text-[50px]">
                        {lowStocks.length}
                    </div>
                    Low Stocks
                </div>
            </div>
            <div className="w-full md:w-1/4 p-2">
                <div className="rounded w-full p-3 text-white bg-red-500">
                    <div className="text-[50px]">
                        {outOfStocks.length}
                    </div>
                    Out of Stock
                </div>
            </div>
            <div className="w-full md:w-1/4 p-2">
                <div className="rounded w-full p-3 text-white bg-red-500">
                    <div className="text-[50px]">
                        {notAvailables.length}
                    </div>
                    Not Available
                </div>
            </div>
        </div>
        {outOfStocks.length > 0 && <> <h3 className="text-2xl mt-3">Out Of Stocks</h3>
        <ProductTable products={outOfStocks} /></>}
        {lowStocks.length > 0 && <> <h3 className="text-2xl mt-3">Low Stocks</h3>
        <ProductTable products={lowStocks} /></>}
        <h3 className="text-2xl mt-3">All products</h3>
        <ProductTable products={products} />
    </>
}