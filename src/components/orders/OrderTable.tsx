'use client'

import Link from "next/link";
import { Item, Order } from "./Orders";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrismaDate } from '@/utils/date/format'
import { DateRangePicker } from "react-date-range";

function SuccessRate({ phone }: { phone: string }) {
    const [isLoading, setLoading] = useState<boolean>(true)
    const [rate, setRate] = useState<string>('')
    async function getRate() {
        setLoading(true)
        const res = await fetch(`/api/order/success_rate?phone=${phone}`)
        const data = await res.json()
        setRate(data.rate.slice(0, 5))
        setLoading(false)
    }
    useEffect(() => {
        getRate()
    }, [])
    if (isLoading) {
        return <div className="border-gray-300 h-4 w-4 transition-all animate-spin rounded-full border-2 border-t-blue-600" />
    }
    if (rate === 'N/A') {
        return <h3 className="text-center text-gray-700">{rate}</h3>
    }
    if (parseInt(rate) < 50) {
        return <h3 className="text-center text-red-500">{rate}%</h3>
    } else if (parseInt(rate) < 80) {
        return <h3 className="text-center text-orange-700">{rate}%</h3>
    }
    else {
        return <h3 className="text-center text-green-500">{rate}%</h3>
    }
}

function OrderDate({ date }: { date: Date }) {
    let [time, setTime] = useState(formatPrismaDate(date))

    const [secInterval, setSecInterval] = useState<NodeJS.Timeout | null>(null)
    const [mntInterval, setMntInterval] = useState<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (time.includes("seconds")) {
            setSecInterval(setInterval(() => {
                setTime(formatPrismaDate(date))
            }, 1000))
        } else if (time.includes("minutes")) {
            if (secInterval) {
                clearInterval(secInterval)
            }
            setMntInterval(setInterval(() => {
                setTime(formatPrismaDate(date))
            }, 60000))
        } else {
            if (mntInterval) {
                clearInterval(mntInterval)
            }
        }
        return () => {
            if (secInterval) {
                clearInterval(secInterval)
            }
            if (mntInterval) {
                clearInterval(mntInterval)
            }
        }
    },[date])
    return <div>
        {time}
    </div>
}

function OrderStatus({ status }: { status: string }) {
    if (status === 'Pending') {
        return <div className="px-1.5 py-1 rounded text-center text-sm bg-gray-300">{status}</div>
    }
    if (status === 'Delivered') {
        return <div className="px-1.5 py-1 rounded text-center text-sm bg-green-500 text-white">{status}</div>
    }
    if (status === 'Return') {
        return <div className="px-1.5 py-1 rounded text-center text-sm bg-red-500 text-white">{status}</div>
    }
    if (status === 'Complete') {
        return <div className="px-1.5 py-1 rounded text-center text-sm bg-base-theme text-white">{status}</div>
    }
    if (status === 'Dismiss') {
        return <div className="px-1.5 py-1 rounded text-center text-sm bg-red-700 text-white">{status}</div>
    }
    if (status === 'Hold') {
        return <div className="px-1.5 py-1 rounded text-center text-sm bg-green-300 text-white">{status}</div>
    }
    if (status === 'Failed') {
        return <div className="px-1.5 py-1 rounded text-center text-sm bg-red-300 text-white">{status}</div>
    }
}

function OrderTr({ order }: { order: Order }) {
    const router = useRouter()
    const items: Item[] = []
    for (const c of order.items) {
        let found = false;
        for (const i of items) {
            if (c.colorId && c.variantId) {
                if (c.product.id === i.product.id && c.variantId === i.variant?.id && c.colorId === i.color?.id) {
                    i.count = i.count + 1;
                    found = true;
                    break;
                }
            } else if (c.colorId) {
                if (c.product.id === i.product.id && c.colorId === i.color?.id) {
                    i.count = i.count + 1;
                    found = true;
                    break;
                }
            } else if (c.variantId) {
                if (c.product.id === i.product.id && c.variantId === i.variant?.id) {
                    i.count = i.count + 1;
                    found = true;
                    break;
                }
            } else {
                if (c.product.id === i.product.id) {
                    i.count = i.count + 1;
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            // console.log('ni', { product: c.product, count: 1, variant: c.variant, color: c.color, cartid: c.id })
            items.push({ product: c.product, count: 1, variant: c.variant, color: c.color, cartid: c.id })
        }
    }
    return <tr onClick={() => router.push(`/admin/orders/${order.id}`)} key={order.id} className="border-b p-3 cursor-pointer odd:bg-gray-100 hover:bg-gray-50 align-top">
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                {order.id.slice(0, 5)}...
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                {<OrderDate date={order.created_at} />}
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                {order.name}
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                {items.map((prod) => {
                    return <span className="block">{prod.product.name.length < 30 ? prod.product.name : prod.product.name.slice(0, 30)} X {prod.count}</span>
                })}
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                {order.order_price}
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                <SuccessRate phone={order.phone} />
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                <OrderStatus status={order.status} />
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                {order.courier === 'pathao' ? 'Pathao' : 'Steadfast'}
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block uppercase" href={`/admin/orders/${order.id}`}>
                {order.courier_status}
            </Link>
        </td>
        <td className="px-3 py-2">
            <Link className="block" href={`/admin/orders/${order.id}`}>
                Facebook
            </Link>
        </td>
    </tr>
}

export default function OrderTable({ orders }: { orders: Order[] }) {
    const [filtered, setFiltered] = useState<Order[]>(orders)
    const [status, setStatus] = useState<string>('All')
    const [search, setSearch] = useState<string>('')

    const [showDates, setShowDates] = useState<boolean>(false)

    const [start, setStart] = useState<Date|null>(null)
    const [end, setEnd] = useState<Date|null>(null)

    useEffect(() => {
        const statusOrders = status === 'All' ? orders : orders.filter((ord) => ord.status === status)
        if (search.trim() === '') {
            setFiltered(statusOrders)
        } else {
            setFiltered(statusOrders.filter((ord) => ord.name.toLowerCase().includes(search.toLowerCase()) || ord.id.toLowerCase().includes(search.toLowerCase())))
        }
    }, [search, orders, status])

    const range = {
        start: new Date(),
        end: new Date(),
        key: 'selection'
    }

    return <div className="rounded border">
        <div className="p-3 flex items-center">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or order id" className="form-input" />
            <div className="ms-auto flex items-center relative">
                <select name="" id="" onChange={(e) => setStatus(e.target.value)} value={status} className="px-2 py-1 cursor-pointer rounded border bg-white">
                    <option value="All">All</option>
                    <option value="Complete">Complete</option>
                    <option value="Return">Return</option>
                    <option value="Hold">Hold</option>
                    <option value="Dismiss">Dismiss</option>
                </select>
                <div className="mx-2">  </div>
                <div onClick={()=>setShowDates(!showDates)} className="px-2 py-1 rounded border cursor-pointer">
                    Filter Date
                </div>
                {showDates && <div onMouseLeave={()=>setShowDates(false)} className="absolute right-0 top-[100%] m-2">
                    <DateRangePicker onChange={(range: any)=>{
                        setStart(range.selection.startDate)
                        setEnd(range.selection.endDate)
                    }} ranges={[range]}/>
                    <Link href={`/admin/orders/?start=${start}&end=${end}`} className="bg-blue-500 rounded">Filter</Link>
                </div>}
            </div>
        </div>
        <table className="p-3 w-full">
            <thead className="bg-slate-100 font-bold">
                <tr>
                    <td className="px-3 py-2">Id</td>
                    <td className="px-3 py-2">Date</td>
                    <td className="px-3 py-2">Name</td>
                    <td className="px-3 py-2">Products</td>
                    <td className="px-3 py-2">Amount</td>
                    <td className="px-3 py-2">Rating</td>
                    <td className="px-3 py-2">Status</td>
                    <td className="px-3 py-2">Courier</td>
                    <td className="px-3 py-2">Courier Status</td>
                    <td className="px-3 py-2">Orgin</td>
                </tr>
            </thead>
            <tbody>
                {filtered.map((order) => <OrderTr order={order} key={order.id} />)}
            </tbody>
        </table>
    </div>
}
