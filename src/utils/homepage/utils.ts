import path from 'path'
import fs from 'fs'

export function hasCategory(id: string){
    const homejsonpath = path.join(process.cwd(), 'src', 'home.json')
    const homejsonfile = fs.readFileSync(homejsonpath, 'utf-8')
    const json = JSON.parse(homejsonfile)
    const categories : {id:string}[] = json.categories
    for(const c of categories){
        if(c.id === id){
            return true
        }
    }
    return false;
}

export function hasProduct(id: string){
    const homejsonpath = path.join(process.cwd(), 'src', 'home.json')
    const homejsonfile = fs.readFileSync(homejsonpath, 'utf-8')
    const json = JSON.parse(homejsonfile)
    const categories : {id:string, products:{id:string}[]}[] = json.categories
    for(const c of categories){
        for(const p of c.products){
            if(p.id === id){
                return true
            }
        }
    }
    return false;
}


  