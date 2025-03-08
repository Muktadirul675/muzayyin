import { prisma } from "@/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";

export const getAllProductsList = cache(async ()=>{
    const products = await prisma.product.findMany({
        select:{
            id: true,
            name: true,
            price: true,
            discounted_price: true,
            stocks: true,
            is_available:true,
            slug: true
        },
        orderBy:{
            created_at: 'desc'
        }
    })
    return products
})

export const getProduct = cache(async (slug:string)=>{
    const product = await prisma.product.findUnique({
        where:{
            slug: slug,
        },
        include:{
            variants:true,
            colors: true,
            images: true,
            categories: true
        }
    })
    if(!product){
        notFound()
    }
    return product;
})
