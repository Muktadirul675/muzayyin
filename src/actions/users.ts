'use server'

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function makeStaff(id:string){
    await prisma.user.update({
        where:{id:id},
        data:{
            is_staff:true
        }
    })
    revalidatePath("/admin/users")
    redirect("/admin/users")
}

export async function removeStaff(id:string){
    await prisma.user.update({
        where:{id:id},
        data:{
            is_staff:false
        }
    })
    revalidatePath("/admin/users")
    redirect("/admin/users")
}

export async function makeAdmin(id:string){
    await prisma.user.update({
        where:{id:id},
        data:{
            is_admin:true
        }
    })
    revalidatePath("/admin/users")
    redirect("/admin/users")
}

export async function removeAdmin(id:string){
    await prisma.user.update({
        where:{id:id},
        data:{
            is_admin:false
        }
    })
    revalidatePath("/admin/users")
    redirect("/admin/users")
}

export async function saveUserDetails(formData: FormData){
    const address = formData.get('address')
    const phone = formData.get('phone')
    if(!address || !phone){
        throw new Error("Must provide address and name")
    }
    const session = await auth()
    if(!session){
        throw new Error("Must be logged in")
    }
    await prisma.user.update({
        where:{email:session?.user?.email as string},
        data:{
            phone: phone.toString(),
            address: address.toString()
        }
    })
    revalidatePath("/admin/users")
    revalidatePath("/profile")
    redirect("/profile")
}

export async function saveUser(formData: FormData){
    const isStaff = formData.get("isStaff")
    await prisma.user.update({
        where:{id:formData.get('id')?.toString()},
        data:{
            name: formData.get('name')?.toString(),
            phone:  formData.get('phone')?.toString(),
            address: formData.get('address')?.toString(),
            is_staff: isStaff ? true : false
        }
    })
    revalidatePath("/admin/users")
    redirect("/admin/users")
}