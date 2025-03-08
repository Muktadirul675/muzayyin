'use server'

import { prisma } from "@/prisma"
import { hasCategory } from "@/utils/homepage/utils"
import { revalidatePath } from "next/cache"
import { redirect } from 'next/navigation'
import slugify from "slugify"

export async function addCategory(formData: FormData) {
    const name = formData.get('name')
    if (!name){
        return 
    }

    const res1 = await fetch(process.env.BACKEND_URL + "/api/available/category/" + name.toString(), {
        cache: 'no-store'
    })
    const available: { available: boolean } = await res1.json()
    if (!available.available) {
        return 
    }

    const products = formData.getAll('products')
    const category = await prisma.category.create({
        data: {
            id: slugify(name.toString(), { remove: /[*+~.()'"!:@]/g }),
            name: name?.toString() as string,
            products: {
                connect: products.map((prod) => { return { id: prod.toString() } })
            }
        },
        include:{
            products: {
                select:{
                    id: true
                }
            }
        }
    })
    if (hasCategory(category.id)) {
        revalidatePath("/")
    }

    if(category.products.length){
        for(const p of category.products){
            revalidatePath("/products/"+p.id)
        }
    }

    revalidatePath("/admin/products")
    revalidatePath('/admin/categories')
    revalidatePath('/admin/customize/homepage')
    redirect('/admin/categories')
}

export async function editCategory(formData: FormData) {
    const id = formData.get('id')
    const name = formData.get('name')
    if (!name) return
    const products = formData.getAll('products')
    await prisma.category.update({
        where: { id: id?.toString() },
        data: {
            products: { set: [] }
        }
    })
    const category = await prisma.category.update({
        where: { id: id?.toString() },
        data: {
            name: name?.toString() as string,
            products: {
                connect: products.map((prod) => { return { id: prod.toString() } })
            }
        },
        include:{
            products:{
                select:{id:true}
            }
        }
    })
    if (hasCategory(category.id)) {
        revalidatePath("/")
    }

    if(category.products.length){
        for(const p of category.products){
            revalidatePath("/products/"+p.id)
        }
    }

    revalidatePath("/admin/products")
    revalidatePath('/admin/categories')
    revalidatePath(`/categories/${id}`)
    revalidatePath('/admin/customize/homepage')
    revalidatePath('/')
    redirect('/admin/categories')
}

export async function deleteCategory(id: string) {
    const category = await prisma.category.delete({
        where: { id: id },
        include:{
            products:{
                select:{id:true}
            }
        }
    })
    if (hasCategory(category.id)) {
        revalidatePath("/")
    }

    if(category.products.length){
        for(const c of category.products){
            revalidatePath(`/products/${c.id}`)
        }
    }
    
    revalidatePath('/admin/customize/homepage')
    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/admin/categories")
}