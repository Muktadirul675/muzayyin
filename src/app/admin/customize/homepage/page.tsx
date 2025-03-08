import path from "path";
import fs from 'fs'
import { prisma } from "@/prisma";
import HomepageCustomize from "@/components/customize/homepage/HomepageCustomize";

export const dynamic = 'force-dynamic'

export default async function Page() {
    const jsonPath = path.join(process.cwd(), 'src', 'home.json')
    const json: {
        notice: string,
        categories: ({
            index: number,
            products: {
                id: string;
                name: string;
                index: number
            }[];
        } & {
            id: string;
            name: string;
            created_at: Date;
            updated_at: Date;
        })[]
    } = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    const preCategories = json.categories
    const categories = await prisma.category.findMany({
        include: {
            products: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    return <>
        {/* {JSON.stringify(categories)} */}
        <HomepageCustomize categories={categories} preCategories={preCategories} />
    </>
}