// components/SalesReportChart.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

interface SalesData {
  date: string;
  totalSales: number;
}

const SalesReportChart: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Fetch sales data from the API
    const fetchSalesData = async () => {
      const res = await fetch('/api/sales');
      const data = await res.json();
      setSalesData(data);
    };

    fetchSalesData();
  }, []);

  useEffect(() => {
    if (salesData.length > 0 && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: salesData.map((item) => item.date),
          datasets: [
            {
              label: 'Sales Report',
              data: salesData.map((item) => item.totalSales),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Sales Report (Last 30 Days)',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [salesData]);

  return <div className='p-3 rounded shadow'>
      <canvas style={{height:'500px', width:'100%'}} ref={chartRef}></canvas>;
  </div>  
};

export default SalesReportChart;