import { saveUser } from "@/actions/users"
import StateButton from "@/components/StateButton"
import { getUser } from "@/utils/db/users"
import { notFound } from "next/navigation"

function Label({ children, htmlFor }: { children: React.ReactNode, htmlFor: string }) {
    return <label htmlFor={htmlFor} className="text-lg font-bold">{children}</label>
}


export default async function Page({ params }: { params: { id: string } }) {
    const user = await getUser(params.id)
    if (!user) {
        notFound()
    }
    return <div className="flex flex-col md:flex-row p-1">
        <form className="flex flex-col" action={saveUser}>
            <input type="text" name="id" defaultValue={user.id} id="id" hidden/>
            <Label htmlFor="name">Name</Label>
            <input defaultValue={user?.name as string} type="text" name="name" id="name" className="form-input" required /> <br />
            <Label htmlFor="email">Email</Label>
            <input defaultValue={user?.email as string} type="text" name="email" id="email" className="form-input" disabled /> <br />
            <Label htmlFor="address">Address</Label>
            <input defaultValue={user?.address as string} type="text" name="address" id="address" className="form-input"/> <br />
            <Label htmlFor="phone">Phone</Label>
            <input defaultValue={user?.phone as string} type="text" name="phone" id="phone" className="form-input"/> <br />
            {/* <div>
                <input type="checkbox" name="isAdmin" id="isAdmin" />
                <Label htmlFor="">Is Admin</Label>
            </div> */}
            <div className="flex">
                <input defaultChecked={user.is_staff} type="checkbox" name="isStaff" id="isStaff" /> 
                <div className="mx-2"></div>
                <Label htmlFor="">Is Staff</Label>
            </div>
            <StateButton>Save</StateButton>
        </form>
        <div className="flex-grow ps-5">
            <h3 className="text-[50px]">Orders</h3>
            No orders
        </div>
    </div>
}