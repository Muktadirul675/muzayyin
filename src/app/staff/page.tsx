import { sendToCourier } from "@/actions/courier";
import ScrollToTop from "@/components/ScrollToTop";
import StateButton from "@/components/StateButton";
import OrderTable from "@/components/orders/OrderTable";
import { prisma } from "@/prisma";
import { perPageOrder } from "@/types";
import { range } from "@/utils/range";
import { Color, Order as POrder, OrderItem as POrderItem, Product as PProduct, Image as ProdImage, Variant } from "@prisma/client";
import Link from "next/link";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css';
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";

export interface Product extends Omit<PProduct, 'description' | 'created_at' | 'updated_at' | 'profit'> {
    images: ProdImage[]
}

export interface OrderItem extends POrderItem {
    product: Product,
    variant: Variant | null,
    color: Color | null
}

export interface Order extends POrder {
    items: OrderItem[]
}

export interface Item {
    product: Product,
    count: number,
    variant: Variant | null,
    color: Color | null,
    cartid: string
}

export const dynamic = 'force-dynamic';

export default async function Order({ searchParams }: { searchParams: { page: string, start?: string, end?: string } }) {
    let pageStr = '1'
    if (searchParams) {
        pageStr = searchParams.page
    }
    const page = parseInt(pageStr ?? '0') === 0 ? 1 : parseInt(pageStr ?? '1')
    const skip = perPageOrder * (page - 1)
    const take = perPageOrder

    const start = searchParams.start ?? null
    const end = searchParams.end ?? null;

    let orders: Order[] = [];

    if (start || end) {
        if (start && !end) {
            orders = await prisma.order.findMany({
                where: {
                    created_at: (new Date(start))
                },
                skip: skip,
                take: take,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    categories: true,
                                    discounted_price: true,
                                    name: true,
                                    is_available: true,
                                    price: true,
                                    slug: true,
                                    stocks: true,
                                    images: {
                                        take: 1
                                    }
                                }
                            },
                            variant: true,
                            color: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
        } else {
            if (start && end) {
                orders = await prisma.order.findMany({
                    where: {
                        created_at: {
                            gte: (new Date(start)),
                            lte: (new Date(end))
                        }
                    },
                    skip: skip,
                    take: take,
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        categories: true,
                                        discounted_price: true,
                                        name: true,
                                        is_available: true,
                                        price: true,
                                        slug: true,
                                        stocks: true,
                                        images: {
                                            take: 1
                                        }
                                    }
                                },
                                variant: true,
                                color: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                })
            }
        }
    } else {
        orders = await prisma.order.findMany({
            skip: skip,
            take: take,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                categories: true,
                                discounted_price: true,
                                name: true,
                                is_available: true,
                                price: true,
                                slug: true,
                                stocks: true,
                                images: {
                                    take: 1
                                }
                            }
                        },
                        variant: true,
                        color: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })
    }


    const count = await prisma.order.count()
    const totalPages = (count / perPageOrder) + 1
    const pending = await prisma.order.count({
        where: {
            status: 'Pending'
        }
    })
    const delivered = await prisma.order.count({
        where: {
            status: 'Delivered'
        }
    })
    const returned = await prisma.order.count({
        where: {
            status: 'Return'
        }
    })
    const complete = await prisma.order.count({
        where: {
            status: 'Complete'
        }
    })
    const dismissed = await prisma.order.count({
        where: {
            status: 'Dismiss'
        }
    })
    const hold = await prisma.order.count({
        where: {
            status: 'Hold'
        }
    })
    const failed = await prisma.order.count({
        where: {
            status: 'Failed'
        }
    })

    function next() {
        let p = page;
        if (page >= totalPages) {
            p = page
        }
        p = page + 1
        let str = `?page=${p}`
        if(start){
            str += `&start=${start}`
            if(end){
                str+= `&end=${end}`
            }
        }
        return str;
    }

    function prev() {
        let p = page;
        if (page === 1) {
            p = 1
        }
        p = page - 1
        let str = `?page=${p}`
        if(start){
            str += `&start=${start}`
            if(end){
                str+= `&end=${end}`
            }
        }
        return str;
    }

    return <div>
        <ScrollToTop />
        <div className="flex w-full items-center">
            <h3 className="text-xl font-bold">Orders List</h3>
            <div className="ms-auto flex items-center">
                <Link className="btn me-2" href="/staff/add">Add Order</Link>
                <form action={sendToCourier}>
                    <StateButton>Send To Courier</StateButton>
                </form>
            </div>
        </div>
        <div className="flex justify-center items-center my-2">
            <div className="flex-grow border-r p-3 flex justify-center text-center flex-col">
                <h3 className="text-lg text-gray-400">Total Orders</h3>
                <h6>{count}</h6>
            </div>
            <div className="flex-grow border-r p-3 flex justify-center text-center flex-col">
                <h3 className="text-lg text-gray-400">New</h3>
                <h6>{pending}</h6>
            </div>
            <div className="flex-grow border-r p-3 flex justify-center text-center flex-col">
                <h3 className="text-lg text-gray-400">Complete</h3>
                <h6>{complete}</h6>
            </div>
            <div className="flex-grow border-r p-3 flex justify-center text-center flex-col">
                <h3 className="text-lg text-gray-400">Hold</h3>
                <h6>{hold}</h6>
            </div>
            <div className="flex-grow border-r p-3 flex justify-center text-center flex-col">
                <h3 className="text-lg text-gray-400">Delivered</h3>
                <h6>{delivered}</h6>
            </div>
            <div className="flex-grow border-r p-3 flex justify-center text-center flex-col">
                <h3 className="text-lg text-gray-400">Return</h3>
                <h6>{returned}</h6>
            </div>
            <div className="flex-grow border-r p-3 flex justify-center text-center flex-col">
                <h3 className="text-lg text-gray-400">Dismiss</h3>
                <h6>{dismissed}</h6>
            </div>

            <div className="flex-grow p-3 flex justify-center text-center flex-col">
                <h3 className="text-lg text-gray-400">Failed</h3>
                <h6>{failed}</h6>
            </div>
        </div>
        <OrderTable orders={orders} />
        <div className="flex justify-between my-2">
            {page === 1 ? <div className="border px-1 5 py-1 rounded bg-white font-bold flex items-center">
                <BiLeftArrow className="text-lg" /> <div className="mx-1"></div> Previous
            </div> : <Link href={`/staff${prev()}`} className="border px-1 5 py-1 rounded cursor-pointer bg-white font-bold flex items-center">
                <BiLeftArrow className="text-lg" /> <div className="mx-1"></div> Previous
            </Link>
            }
            <div className="flex items-center justify-center">
                <div className="bg-red-300 hidden"></div>
                {range(1, totalPages + 2).map((p) => {
                    return <Link href={`/staff?page=${p}`} className={`p-1 px-2 block ${p === page ? 'bg-red-500' : null} bg-red-400 mx-2 text-white cursor-pointer rounded hover:bg-red-600`}>{p}</Link>
                })}
            </div>
            {page === totalPages ? <div className="border px-1 5 py-1 rounded bg-white font-bold flex items-center">
                <BiRightArrow className="text-lg" /> <div className="mx-1"></div> Next
            </div> : <Link href={`/staff${next()}`} className="border px-1 5 py-1 rounded cursor-pointer bg-white font-bold flex items-center">
                Next <div className="mx-1"></div> <BiRightArrow className="text-lg" />
            </Link>}
        </div>
    </div>
}
