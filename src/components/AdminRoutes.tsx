'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AiFillProduct } from "react-icons/ai";
import { BiCarousel, BiCategory, BiHome } from "react-icons/bi";
import { FaUserGroup } from "react-icons/fa6";
import { GrOrderedList } from "react-icons/gr";
import { MdAnnouncement, MdOutlineWarehouse, MdPendingActions } from "react-icons/md";
import { TbCategory, TbHomeEdit } from "react-icons/tb";

export default function AdminRoutes() {
    const path = usePathname()
        console.log(path)
    return <>
        <Link href="/admin" className={`${path === '/admin' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <BiHome className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Home
            </span>
        </Link>
        <Link href="/admin/users" className={`${path === '/admin/users' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <FaUserGroup className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Users
            </span>
        </Link>
        <Link href="/admin/products" className={`${path === '/admin/products' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <AiFillProduct className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Products
            </span>
        </Link>
        <Link href="/admin/stocks" className={`${path === '/admin/stocks' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <MdOutlineWarehouse className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Add Stocks
            </span>
        </Link>
        <Link href="/admin/categories" className={`${path === '/admin/categories' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <BiCategory className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Categories
            </span>
        </Link>
        <div className="hidden md:flex transition-all mt-2 mb-1.5 items-center uppercase text-white p-3 rounded ">
            <span className="">
                Order Management
            </span>
        </div>
        <Link href="/admin/orders" className={`${path === '/admin/orders' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <GrOrderedList className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Orders
            </span>
        </Link>
        <div className="hidden md:flex transition-all mt-3 mb-0 items-center uppercase text-white p-3 rounded ">
            <span className="">
                Customization
            </span>
        </div>
        <Link href="/admin/customize/homepage" className={`${path === '/admin/customize/homepage' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <TbHomeEdit className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Homepage
            </span>
        </Link>
        <Link href="/admin/customize/notice" className={`${path === '/admin/customize/notice' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <MdAnnouncement className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Notice
            </span>
        </Link>
        <Link href="/admin/customize/banner" className={`${path === '/admin/customize/banner' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <BiCarousel className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Banner
            </span>
        </Link>
        <Link href="/admin/customize/categorybar" className={`${path === '/admin/customize/categorybar' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <TbCategory className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Categories
            </span>
        </Link>
        <Link href="/admin/customize/allcategories" className={`${path === '/admin/customize/allcategories' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <TbCategory className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                All Categories
            </span>
        </Link>
        <Link href="/admin/customize/categorybanner" className={`${path === '/admin/customize/categorybanner' && 'bg-base-theme-dark'} flex transition-all my-3 items-center  text-white p-3 rounded hover:bg-base-theme-dark`}>
            <BiCategory className="text-xl" />
            <span className="hidden md:flex">
                <span className="mx-2"></span>
                Featured Categories
            </span>
        </Link>
    </>
}