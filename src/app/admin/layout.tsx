import { auth } from "@/auth";
import AdminRoutes from "@/components/AdminRoutes";
import { prisma } from "@/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    const user = await prisma.user.findUnique({
        where:{email:session?.user?.email ?? ''} 
    })
    if(!user || !user.is_admin){
        redirect("/unauthorized")
    }
    return <div className="flex">
        <div className="w-fit min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-80px)] sticky top-[60px] md:top-[80px] p-1 md:p-3 flex flex-col bg-base-theme">
            <AdminRoutes/>
        </div>
        <div className="flex-grow p-1 flex justify-center">
            <div className="w-full md:w-2/3">
                {children}
            </div>
        </div>
    </div>
}