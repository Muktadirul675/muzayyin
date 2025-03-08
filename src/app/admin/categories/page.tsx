import CategoryTable from "@/components/categories/CategoryTable";
import { getAllCategories } from "@/utils/db/categories";
import Link from "next/link";
import { BiPlus } from "react-icons/bi";

export const revalidate = 3600;

export default async function Page() {
    const categories = await getAllCategories()
    return <div className="p-1">
        <div className="p-3 rounded bg-red-500 text-white w-full md:w-1/3 relative">
            <h3 className="text-[50px]">{categories.length}</h3>
            Total Categories
            <div className="absolute bottom-0 right-0 p-3">
                <Link href="/admin/categories/add">
                    <BiPlus className="text-2xl" />
                </Link>
            </div>
        </div>
        <CategoryTable categories={categories} />
    </div>
}