'use client'

import { ListedProduct } from "@/types"
import Link from "next/link"
import { useEffect, useState } from "react"
import { BiCheck, BiEdit } from "react-icons/bi"
import { CgCross } from "react-icons/cg"

export default function ProductTable({ products }: { products: ListedProduct[] }) {
    const [filteredProducts, setFilteredProducts] = useState<ListedProduct[]>(products)
    const [searchStr, setSearchStr] = useState<string>('')

    useEffect(() => {
        if (searchStr.trim() === '') {
            setFilteredProducts(products)
        } else {
            setFilteredProducts(products.filter((product) => {
                return product.name.toLocaleLowerCase().includes(searchStr)
            }))
        }
    }, [searchStr])

    return <>
        <input value={searchStr} onChange={(e) => setSearchStr(e.target.value)} type="text" className="form-input my-2 w-full md:w-max-[600px]" placeholder="Search" />
        <div className="w-full max-w-[300px] md:max-w-[600px] lg:max-w-full overflow-x-auto">
            <table className="border w-full border-gray-300 text-sm text-left text-gray-500">
                <thead className="bg-gray-200 text-gray-700 uppercase">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Stocks</th>
                        <th className="px-6 py-3">Price</th>
                        <th className="px-6 py-3">Discounted Price</th>
                        <th className="px-6 py-3">Is Available</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map((product) => (
                        <tr key={product.id} className="odd:bg-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                <Link className="link" href={`/products/${product.slug}`}>
                                    {product.name}
                                </Link>
                            </td>
                            <td className="px-6 py-4">{product.stocks}</td>
                            <td className="px-6 py-4">{product.price}</td>
                            <td className="px-6 py-4">{product.discounted_price}</td>
                            <td className="px-6 py-4">{product.is_available ? <BiCheck className="text-lg text-green-500" /> : <CgCross className="text-red-500 text-lg" />}</td>
                            <td className="px-6 py-4 text-end">
                                <div className="flex items-center">
                                    <Link href={`/admin/products/${product.slug}`}>
                                        <BiEdit className="text-xl text-blue-500" />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>
}