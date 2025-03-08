'use client'

import { ListedCategory } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";

export default function CategoryTable({ categories }: { categories: ListedCategory[] }) {
    const [filteredCategories, setFilteredCategories] = useState<ListedCategory[]>(categories)
    const [searchStr, setSearchStr] = useState<string>('')

    useEffect(() => {
        if (searchStr.trim() === '') {
            setFilteredCategories(categories)
        } else {
            setFilteredCategories(categories.filter((category) => {
                return category.name?.toLocaleLowerCase().includes(searchStr)
            }))
        }
    }, [searchStr])
    return <>
        <input value={searchStr} onChange={(e) => setSearchStr(e.target.value)} type="text" className="form-input my-2 w-full md:w-max-[600px]" placeholder="Search" />
        <div className="w-full max-w-[300px] md:max-w-[600px] lg:max-w-full overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm text-left text-gray-500">
                <thead className="bg-gray-200 text-gray-700 uppercase">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Products</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCategories.map((category) => {
                        return <tr key={category.id} className="odd:bg-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{category._count.products}</td>
                            <td className="px-6 py-4 text-end flex items-center">
                                <Link href={`/admin/categories/${category.id}`}>
                                    <BiEdit className="text-lg text-blue-500" />
                                </Link>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </>
}