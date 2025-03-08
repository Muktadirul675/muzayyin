import EditCategoryForm from "@/components/categories/EditCategoryForm";
import { prisma } from "@/prisma";
import { notFound } from "next/navigation";

export default async function Page({params}:{params:{id:string}}){
    const category = await prisma.category.findUnique({
        where:{id:params.id},
        include:{
            products:{
                select:{
                    id:true,
                    name : true
                }
            }
        }
    })

    const products = await prisma.product.findMany({
        select:{
            id:true,
            name: true
        }
    })

    if(!category){
        notFound()
    }

    return <EditCategoryForm category={category} products={products}/>
}