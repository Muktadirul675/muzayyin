import { saveUserDetails } from "@/actions/users";
import { auth } from "@/auth"
import LogoutButton from "@/components/LogoutButton";
import StateButton from "@/components/StateButton";
import { prisma } from "@/prisma";
import Image from "next/image"
import Link from "next/link";
import { redirect } from "next/navigation";
import { BiPhone, BiUser } from "react-icons/bi";
import { FaAddressCard } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await auth();
    if (!session) {
        return redirect('/unauthenticated')
    }
    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email as string
        },
        include: {
            orders: {
                include:{
                    items: true
                }
            }
        }
    })
    if (session) {
        return (
            <div className="flex justify-center p-3 w-full md:w-1/2 mx-auto flex-col md:flex-row">
                <div className="w-full md:w-1/4 bg-slate-50 p-3 flex flex-col">
                    <div className="w-full flex justify-center">
                        <Image quality={100} src={session.user?.image as string} alt={session.user?.name as string} width={100} height={100} className="rounded-full" />
                    </div>
                    <div className="flex my-1 items-center">
                        <BiUser className="text-xl" />
                        <div className="mx-1"></div>
                        {session.user?.name}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">* Provided by google. Can not change.</div>
                    <div className="flex my-1 items-center">
                        <MdEmail className="text-xl" />
                        <div className="mx-1"></div>
                        {session.user?.email}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">* Provided by google. Can not change.</div>
                    <form action={saveUserDetails} className="flex flex-col">
                        <div className="flex items-center my-2">
                            <BiPhone className="text-xl" />
                            <div className="mx-1"></div>
                            <input type="text" name="phone" className="form-input" placeholder="Phone" defaultValue={user?.phone as string} />
                        </div>
                        <div className="flex items-center my-2">
                            <FaAddressCard className="text-xl" />
                            <div className="mx-1"></div>
                            <input type="text" name="address" className="form-input" placeholder="Address" defaultValue={user?.address as string} />
                        </div>
                        <div className="my-1">
                            <StateButton>Save</StateButton>
                        </div>
                    </form>
                    {/* {JSON.stringify(user, null,2)}
                    {JSON.stringify(session, null,2)} */}
                    {user?.is_admin && <Link href="/admin" className="my-1 rounded bg-base-theme px-2 py-1.5 flex flex-wrap items-center justify-center text-white">
                        Go to admin panel
                    </Link>}
                    <LogoutButton />
                </div>
                <div className="w-full my-1 md:w-3/4 md:ps-3">
                    <div className="border rounded p-0">
                        <div className="w-full p-3 bg-base-theme text-white text-lg font-bold rounded-tr rounded-tl uppercase">
                            Orders
                        </div>
                        <div className="bg-slate-50 p-3">
                            {user?.orders.length === 0 && <div className="w-full min-h-40 h-full flex flex-col justify-center text-center">
                                <div className="text-[30px] my-2">No orders!</div>
                                <div>
                                    <Link href="/" className="btn">Continue Shopping</Link>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        redirect('/login')
    }
}