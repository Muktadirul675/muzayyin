'use client';

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export default function OrderReport({
  counts,
}: {
  counts: {
    pending: number;
    delivered: number;
    returned: number;
    complete: number;
    dismissed: number;
  };
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Destroy the previous chart instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create a new Chart.js instance
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Delivered', 'Returned', 'Complete', 'Dismissed'],
        datasets: [
          {
            label: 'Order Report',
            data: [
              counts.pending,
              counts.delivered,
              counts.returned,
              counts.complete,
              counts.dismissed,
            ],
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)',
            ],
            hoverOffset: 4,
          },
        ],
      },
    });

    // Clean up the chart instance on component unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [counts]);

  return (
    <div className="p-3 rounded shadow">
      <h3 className="font-bo">Order Report</h3>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}