import OrderReport from "@/components/dashboard/OrderReport";
import SalesReportChart from "@/components/dashboard/SalesReport";
import { prisma } from "@/prisma";
import Image from "next/image";

export const revalidate = 3600;

export default async function Page() {
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
    const counts = {
        pending: pending,
        delivered: delivered,
        returned: returned,
        complete: complete,
        dismissed: dismissed
    }

    const total = counts.pending + counts.delivered + counts.returned + counts.complete + counts.dismissed

    const allSales = await prisma.order.findMany({
        select: {
            id: true,
            order_price: true,
        },
    });

    const totalSales = allSales.reduce((sum, order) => sum + order.order_price, 0);
    const orderCount = allSales.length;


    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysSales = await prisma.order.findMany({
        where: {
            created_at: {
                gte: startOfDay,
                lt: endOfDay,
            },
        },
        select: {
            id: true,
            order_price: true,
        },
    });

    const todaysTotalSales = todaysSales.reduce((sum, order) => sum + order.order_price, 0);
    const todaysOrderCount = todaysSales.length;

    const todaysSoldItem = await prisma.orderItem.findMany({
        where: {
            created_at: {
                gte: startOfDay,
                lt: endOfDay,
            },
        },
        select: {
            id: true,
            product: {
                select: {
                    price: true,
                    discounted_price: true
                }
            }
        },
    });

    const todaysSoldItemsPrice = todaysSoldItem.reduce((sum, item) => sum + (item.product.discounted_price ? item.product.discounted_price : item.product.price), 0)

    const mostSoldProducts = await prisma.orderItem.groupBy({
        by: ['productId'], // Group by productId
        _count: {
            productId: true, // Count the number of occurrences of each productId
        },
        orderBy: {
            _count: {
                productId: 'desc', // Order by the count of productId in descending order
            },
        },
        take: 5, // Get the top 5 most sold products
    });

    const productIds = mostSoldProducts.map(item => item.productId);

    // Fetch the product details for the top 5 most sold products
    const products = await prisma.product.findMany({
        where: {
            id: {
                in: productIds, // Filter by the productIds from the aggregated results
            },
        },
        include: {
            images: true,
            _count: {
                select: {
                    orders: true
                }
            }
        }
    });


    return <div>
        <div className="flex flex-wrap flex-col md:flex-row">
            <div className="flex-grow p-1">
                <div className="rounded bg-base-theme p-3 text-white">
                    <h3 className="text-2xl">
                        {orderCount} / {totalSales}
                    </h3>
                    Total Orders / Sale
                </div>
            </div>
            <div className="flex-grow p-1">
                <div className="rounded bg-base-theme p-3 text-white">
                    <h3 className="text-2xl">
                        {todaysOrderCount} / {todaysTotalSales}
                    </h3>
                    Today's Order / Sale
                </div>
            </div>
            <div className="flex-grow p-1">
                <div className="rounded bg-base-theme p-3 text-white">
                    <h3 className="text-2xl">
                        {todaysSoldItem.length} / {todaysSoldItemsPrice}
                    </h3>
                    Today's Sold Items / Sale
                </div>
            </div>
        </div>
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2">
                <OrderReport counts={counts} />
                <div className="my-1"></div>
                <SalesReportChart />
            </div>
            <div className="w-full md:w-1/2">
                <div className="p-1 my-1">
                    <h3 className="font-bold">
                        Most Ordered Products
                    </h3>
                    {products.map((product) => {
                        return <div className="rounded p-2 shadow flex">
                            <Image width={100} height={100} src={product.images[0].url} alt="Image" className="w-[100px] h-[100px] rounded" />
                            <div className="ms-2">
                                <h3 className="text-bold">{product.name} X {product._count.orders}</h3>
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    </div>
}