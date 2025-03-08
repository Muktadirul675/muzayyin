import path from 'path';
import fs from 'fs';
import EditCategoryBanner from '@/components/customize/banner/EditCategoryBanner';

export default async function CategoryBanner(){
    const categoriesJson = path.join(process.cwd(), 'src', 'categories_banner.json')
    const categoriesJsonPath = fs.readFileSync(categoriesJson, 'utf-8')
    const json: {id:string, name: string, logo: string}[] = JSON.parse(categoriesJsonPath)
    return <EditCategoryBanner categories={json}/>
}