import { prisma } from "@/prisma";
import { cache } from "react";

export const getAllUsers = cache(async ()=>{
    const users = await prisma.user.findMany({
        select:{
            id: true,
            name:true,
            is_staff: true,
            email: true,
            phone: true,
            address: true
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    return users
})

export const getUser = cache(async(id:string)=>{
    const user = await prisma.user.findUnique({
        where:{id:id}
    })

    return user
})