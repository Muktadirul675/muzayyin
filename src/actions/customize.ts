'use server';

import path from 'path';
import fs from 'fs'
import { revalidatePath } from 'next/cache';

export async function saveHomepage(prevState: {message:string, error:string}, formData: FormData) {
    const json : {categories: {
        id: string;
        index: null | number;
        products: {
            id: string;
            index: number;
        }[];
    }[]} = {categories:[]}
    const categories = formData.getAll('categories')
    if(!categories.length){            
        return { message: '', error: 'You must select at least one category' }
    }
    for (const i of categories) {
        const category :  {id:string, index:null|number, products:{id:string, index:number}[]} = {id:i.toString(), index:null, products:[]}
        const index = formData.get(`${i}-index`)
        if (!index?.toString()) {
            return { message: '', error: 'You must provide indexes for each selected category' }
        }
        category.index = parseInt(index.toString())
        const products = formData.getAll(`${i}-products`)
        if(!products.length){
            return { message: '', error: 'You must select at least one product for each selected category' }
        }
        const indexedProducts = []
        for (const j of products) {
            const index = formData.get(`${i}-${j}-index`)
            if (!index?.toString()) {
                return { message: '', error: 'You must provide indexes for each selected product' }
            }
            indexedProducts.push({id:j.toString(), index: parseInt(index.toString())})
        }
        category.products = indexedProducts
        json.categories.push(category)
    }

    for(let i=0;i<json.categories.length - 1;i++){
        for(let j=i;j<json.categories.length;j++){
            if((json.categories[i].index as number) > (json.categories[j].index as number)){
                const temp = json.categories[j]
                json.categories[j] = json.categories[i]
                json.categories[i] = temp
            }
        }
    }

    for(let i=0;i<json.categories.length;i++){
        for(let j=0;j<json.categories[i].products.length-1;j++){
            for(let k=0;k<json.categories[i].products.length;k++){
                if((json.categories[i].products[j].index as number) > (json.categories[i].products[k].index as number)){
                    const temp = json.categories[i].products[k]
                    json.categories[i].products[k] = json.categories[i].products[j]
                    json.categories[i].products[j] = temp
                }
            }
        }
    }

    const filePath = path.join(process.cwd(),'src','home.json')
    const file = fs.readFileSync(filePath,'utf-8')
    const fileJson = JSON.parse(file)

    fileJson.categories = json.categories

    fs.writeFileSync(filePath, JSON.stringify(fileJson,null,2))

    revalidatePath("/")

    return { "message": "Homepage is saved", 'error': '' }
}

export async function editNotice(formData: FormData){
    const notice = formData.get('notice')
    if(!notice){
        return 
    }
    const homejsonpath = path.join(process.cwd(), 'src', 'home.json')
    const homejsonfile = fs.readFileSync(homejsonpath, 'utf-8')
    const json = JSON.parse(homejsonfile)
    json.notice = notice.toString()
    fs.writeFileSync(homejsonpath, JSON.stringify(json,null,2))
    revalidatePath("/")
    revalidatePath("/admin/customize/notice")
}

export async function editBanner(formData: FormData){
    const images = formData.getAll('images[]')
    const homejsonpath = path.join(process.cwd(), 'src', 'home.json')
    const homejsonfile = fs.readFileSync(homejsonpath, 'utf-8')
    const json : {banner:string[]} = JSON.parse(homejsonfile)
    const uploadPath = path.join(process.cwd(), 'uploads')
    for(const i of json.banner){
        const p = path.join(uploadPath, i.split('/')[3])
        try {
            await fs.promises.access(p, fs.promises.constants.F_OK)
            await fs.promises.unlink(p)
        } catch (e) {
            console.log(`${p} not found\n${e}`)
        }
    }
    json.banner = []
    const imgPaths : string[] = []
    for(const i of images){
        const img = i as File
        const filename = `${Date.now()}-${img.name}`
        const imgpath = path.join(uploadPath, filename)
        const buffer = Buffer.from(await img.arrayBuffer())
        imgPaths.push("/api/uploads/"+filename)
        fs.writeFileSync(imgpath, buffer)
        json.banner.push("/api/uploads/"+filename)
    }
    json.banner = imgPaths
    fs.writeFileSync(homejsonpath, JSON.stringify(json,null,2))
    revalidatePath("/")
    return
}


export async function editCategoryBar(formData: FormData){
    const categories = formData.get('categories')
    const categoriesJson = path.join(process.cwd(), 'src', 'categories.json')
    fs.writeFileSync(categoriesJson, categories?.toString() ?? '{}')
    revalidatePath("/")
    return
}

export async function editAllCategories(formData: FormData){
    const categories = formData.get('categories')
    const categoriesJson = path.join(process.cwd(), 'src', 'all_categories.json')
    fs.writeFileSync(categoriesJson, categories?.toString() ?? '{}')
    revalidatePath("/")
    return
}

export async function editCategoryBanner(prevState:{message:string, error:string},formData: FormData){
    const categories = formData.getAll('categories[]')
    console.log(categories)
    const mapping = []
    if(categories.length === 0){
        return {message:'',error:"Please select one or more categories"}
    }
    for(const c of categories){
        let logo = formData.get(`${c.toString()}-logo`)
        const name = formData.get(`${c.toString()}-name`)?.toString()
        console.log(logo, name)
        if(logo===null || name === ''){
            return {message: '', error:"You must provide name and logo for each selected category"}
        }
        logo = logo as File
        const buffer = Buffer.from(await logo.arrayBuffer())
        const filename = `${Date.now()}-${logo.name}`
        fs.writeFileSync(`${process.cwd()}/uploads/${filename}`, buffer)
        mapping.push({id:c, logo:"/api/uploads/"+filename,name:name})
    }
    const categoriesJson = path.join(process.cwd(), 'src', 'categories_banner.json')
    fs.writeFileSync(categoriesJson, JSON.stringify(mapping,null,2))
    revalidatePath("/")
    return {message:'Saved', error:''}
}
