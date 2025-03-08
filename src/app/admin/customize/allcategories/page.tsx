import path from "path"
import fs from "fs"
import { prisma } from '@/prisma';
import CustomizeAllCategories from "@/components/customize/categoriesbar/CustomizeAllCategories";

interface Content {
    uid: number,
    name?: string,
    id?: string,
    subs?: { uid: number, id?: string, name?: string }[]
}

export default async function Page() {
    const categoriesJson = path.join(process.cwd(), 'src', 'all_categories.json')
    const categoriesJsonPath = fs.readFileSync(categoriesJson, 'utf-8')
    const selecteds: Content[] = JSON.parse(categoriesJsonPath)
    const categories = await prisma.category.findMany({})
    return <div>
        <CustomizeAllCategories selecteds={selecteds} categories={categories}/>
    </div>
}