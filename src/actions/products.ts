'use server'

import { prisma } from "@/prisma";
import { Color, Variant } from "@/types";
import { hasProduct } from "@/utils/homepage/utils";
import { Product as PProduct } from "@prisma/client";
import fs from 'fs';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import slugify from "slugify";

interface Product extends PProduct{
    categories : {id:string}[]
}

export async function deleteProduct(id: string) {
    const product = await prisma.product.delete({
        where: { id: id },
        include:{
            categories:{
                select:{id:true}
            },
            images: {
                select: {
                    url: true
                }
            }
        }
    })
    for(const img of product.images){
        const parts = img.url.split('/')
        const filepath = path.join(process.cwd(),'uploads',parts[3])
        await fs.promises.unlink(filepath)
    }
    if (hasProduct(product.id)) {
        revalidatePath("/")
    }

    if(product.categories.length){
        for(const c of product.categories){
            revalidatePath(`/categories/${c.id}`)
        }
    }
    
    revalidatePath("/admin/products")
    revalidatePath("/admin/categories")
    revalidatePath("/")
    redirect("/admin/products")
}

export async function addProduct(formData: FormData) {
    const name = formData.get('name')
    const description = formData.get("description")
    const price = formData.get('price')
    const dPrice = formData.get('dPrice')
    const stocks = formData.get('stocks')

    let product: Product | null = null;

    if (!name || !description || !price || !dPrice || !stocks) {
        console.log("Error")
        return
    }

    const res1 = await fetch(process.env.BACKEND_URL + "/api/available/" + name.toString(), {
        cache: 'no-store'
    })
    const available: { available: boolean } = await res1.json()
    if (!available.available) {
        return
    }

    try {
        const images = formData.getAll('images[]')
        const variantsStr: string[] = JSON.parse(JSON.stringify(formData.getAll("variants[]")))
        const variants: Variant[] = variantsStr.map((v) => JSON.parse(v))
        const colorsStr: string[] = JSON.parse(JSON.stringify(formData.getAll('colors[]')))
        const colors: Color[] = colorsStr.map((c) => JSON.parse(c))
        const categories: { name: string, id: string }[] = JSON.parse(formData.get("categories[]")?.toString() ?? '[]')
        console.log(images, variants, colors)
        product = await prisma.product.create({
            data: {
                name: name.toString().trim(),
                description: description.toString(),
                slug: slugify(name.toString(), { remove: /[*+~.()'"!:@]/g }),
                price: parseInt(price.toString()),
                discounted_price: parseInt(dPrice.toString()),
                stocks: parseInt(stocks.toString()),
                variants: {
                    create: variants
                },
                colors: {
                    create: colors
                },
                categories: {
                    connect: categories.map((c) => { return { id: c.id } })
                }
            },
            include:{
                categories:{
                    select: {
                        id: true
                    }
                }
            }
        })

        for (const img of images) {
            const image = img as File
            const buffer = Buffer.from(await image.arrayBuffer())
            const fileName = `${Date.now()}-${image.name}`
            const filePath = path.join(process.cwd(), 'uploads', fileName)
            fs.writeFileSync(filePath, buffer)
            await prisma.image.create({
                data: {
                    url: `/api/uploads/${fileName}`,
                    productId: product.id
                }
            })
        }

        if (hasProduct(product.id)) {
            revalidatePath("/")
        }

        if(product.categories.length){
            for(const c of product.categories){
                revalidatePath(`/categories/${c.id}`)
            }
        }

        revalidatePath("/admin/products")
        revalidatePath("/admin/categories")
        revalidatePath("/")
        console.log("success")
    } catch (e) {
        console.log(e)
    }
    redirect("/admin/products")
}


export async function editProduct(formData: FormData) {
    const id = formData.get('id')
    const name = formData.get('name')
    const description = formData.get("description")
    const price = formData.get('price')
    const dPrice = formData.get('dPrice')
    const stocks = formData.get('stocks')

    let product: Product | null = null;

    if (!name || !description || !price || !dPrice || !stocks) {
        console.log("Error")
        return
    }

    try {
        const images = formData.getAll('images[]')
        const variantsStr: string[] = JSON.parse(JSON.stringify(formData.getAll("variants[]")))
        const variants: Variant[] = variantsStr.map((v) => JSON.parse(v))
        const colorsStr: string[] = JSON.parse(JSON.stringify(formData.getAll('colors[]')))
        const colors: Color[] = colorsStr.map((c) => JSON.parse(c))
        const categories: { name: string, id: string }[] = JSON.parse(formData.get("categories[]")?.toString() ?? '[]')
        const isAvailable = parseInt(stocks.toString()) > 0
        await prisma.variant.deleteMany({
            where: { productId: id?.toString() }
        })
        await prisma.color.deleteMany({
            where: { productId: id?.toString() }
        })
        const prodImages = await prisma.image.findMany({
            where: { productId: id?.toString() },
            select: {
                url: true
            }
        })

        for(const i of prodImages){
            const fileName = i.url.split('/')[3]
            try {
                await fs.promises.access(fileName, fs.promises.constants.F_OK)
                await fs.promises.unlink(fileName)
            } catch (e) {
                console.log(`${fileName} not found ${e}`)
            }
        }

        await prisma.image.deleteMany({
            where: { productId: id?.toString() },
        })
        product = await prisma.product.update({
            where: { id: id?.toString() },
            data: {
                name: name.toString(),
                description: description.toString(),
                slug: slugify(name.toString(), { remove: /[*+~.()'"!:@]/g }),
                price: parseInt(price.toString()),
                discounted_price: parseInt(dPrice.toString()),
                stocks: parseInt(stocks.toString()),
                is_available: isAvailable,
                categories: {
                    set: categories.map((c) => { return { id: c.id } })
                }
            },
            include:{
                categories:{
                    select:{
                        id:true
                    }
                }
            }
        })

        for (const v of variants) {
            await prisma.variant.create({
                data: { ...v, productId: product.id }
            })
        }

        for (const c of colors) {
            await prisma.color.create({
                data: { ...c, productId: product.id }
            })
        }

        for (const img of images) {
            const image = img as File
            const buffer = Buffer.from(await image.arrayBuffer())
            const fileName = `${Date.now()}-${image.name}`
            const filePath = path.join(process.cwd(), 'uploads', fileName)
            fs.writeFileSync(filePath, buffer)
            await prisma.image.create({
                data: {
                    url: `/api/uploads/${fileName}`,
                    productId: product.id
                }
            })
        }

        if (hasProduct(product.id)) {
            revalidatePath("/")
        }

        if(product.categories.length){
            for(const c of product.categories){
                revalidatePath(`/categories/${c.id}`)
            }
        }

        revalidatePath("/admin/products")
        revalidatePath("/admin/categories")
        revalidatePath("/products/" + product.slug)
        console.log("success")
    } catch (e) {
        console.log(e)
    }
    redirect("/admin/products")
}