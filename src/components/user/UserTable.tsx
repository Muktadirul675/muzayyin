'use client'

import { ListedUser } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiCheck } from "react-icons/bi";
import { CgClose } from "react-icons/cg";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function UserTable({ users }: { users: ListedUser[] }) {
    const [filteredUsers, setFilteredUsers] = useState<ListedUser[]>(users)
    const [searchStr, setSearchStr] = useState<string>('')

    useEffect(() => {
        if (searchStr.trim() === '') {
            setFilteredUsers(users)
        } else {
            setFilteredUsers(users.filter((user) => {
                return user.name?.toLocaleLowerCase().includes(searchStr)
            }))
        }
    }, [searchStr])
    return <>
        <input value={searchStr} onChange={(e) => setSearchStr(e.target.value)} type="text" className="form-input my-2 w-full md:w-max-[600px]" placeholder="Search" />
        <div className="w-full max-w-[300px] md:max-w-[600px] lg:max-w-full overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm text-left text-gray-500">
                <thead className="bg-gray-200 text-gray-700 uppercase">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Address</th>
                        <th className="px-6 py-3">Phone</th>
                        <th className="px-6 py-3">Is Staff</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => {
                        return <tr key={user.id} className="odd:bg-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{user.address}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{user.phone}</td>
                            <td className="px-6 py-4 font-medium text-gray-900 text-center">{user.is_staff ? <BiCheck className="text-lg text-green-500" /> : <CgClose className="text-lg text-red-500" />}</td>
                            <td className="px-6 py-4 text-end">
                                <Link href={`/admin/users/${user.id}`}>
                                    <FaExternalLinkAlt className="text-lg text-blue-500" />
                                </Link>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </>
}