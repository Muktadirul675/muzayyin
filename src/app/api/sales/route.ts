// app/api/salesReport/route.ts
import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const salesData = await prisma.order.groupBy({
    by: ['created_at'],
    where: {
      AND:{
        status : 'Delivered',
        created_at: {
          gte: last30Days,
        },
      }
    },
    _sum: {
      order_price: true,
    },
    orderBy: {
      created_at: 'asc',
    },
  });

  const chartData = salesData.map((item) => ({
    date: item.created_at.toISOString().split('T')[0], // Date in YYYY-MM-DD format
    totalSales: item._sum.order_price,
  }));

  return NextResponse.json(chartData);
}