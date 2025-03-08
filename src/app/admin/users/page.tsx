import UserTable from "@/components/user/UserTable"
import { getAllUsers } from "@/utils/db/users"

export const dynamic = 'force-dynamic'

export default async function Page(){
    const users = await getAllUsers()
    const staffs = users.filter((user)=>user.is_staff)
    return <div className="p-1">
        <div className="mb-3 flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-2">
                <div className="w-full p-3 bg-base-theme text-white rounded">
                    <h3 className="text-[50px]">{users.length}</h3>
                    Total Users
                </div>
            </div>
            <div className="w-full md:w-1/2 p-2">
                <div className="w-full p-3 bg-base-theme text-white rounded">
                    <h3 className="text-[50px]">{staffs.length}</h3>
                    Total Staffs
                </div>
            </div>
        </div>
        <UserTable users={users}/>
    </div>
}