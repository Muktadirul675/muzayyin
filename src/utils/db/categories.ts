import { prisma } from "@/prisma";
import { cache } from "react";

export const getAllCategories = cache(async()=>{
    const categories = await prisma.category.findMany({
        select:{
            name:true,
            id:true,
            _count:{
                select:{
                    products: true
                }
            }
        }
    })
    return categories
})