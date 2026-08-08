'use client';

import React, { useRef, useEffect } from 'react';

interface ChartPoint {
  joint: string;
  peakRom: number;
  date: string;
}

interface RomTrendChartProps {
  data: ChartPoint[];
}

export const RomTrendChart: React.FC<RomTrendChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset and clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // 1. Draw Empty State if no records exist
    if (data.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Complete screenings to visualize ROM trends', width / 2, height / 2);
      return;
    }

    // Sort data chronologically for plotting (oldest to newest)
    const sortedData = [...data].reverse();

    // 2. Compute plot parameters
    const maxVal = 180; // joint max range is typically 180 deg
    const pointsCount = sortedData.length;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // 3. Draw Grid Lines & Y Axis Values
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const yVal = (maxVal / gridLines) * i;
      const yPos = padding + chartHeight - (chartHeight / gridLines) * i;

      // Draw horizontal grid line
      ctx.beginPath();
      ctx.moveTo(padding, yPos);
      ctx.lineTo(width - padding, yPos);
      ctx.stroke();

      // Draw axis tag
      ctx.fillText(`${yVal}°`, padding - 10, yPos);
    }

    // 4. Draw Line & Points
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#00b4d8';

    ctx.beginPath();
    sortedData.forEach((point, idx) => {
      const xPos = padding + (chartWidth / Math.max(1, pointsCount - 1)) * idx;
      const yPos = padding + chartHeight - (point.peakRom / maxVal) * chartHeight;

      if (idx === 0) {
        ctx.moveTo(xPos, yPos);
      } else {
        ctx.lineTo(xPos, yPos);
      }
    });
    ctx.stroke();

    // Draw circles and date tags
    sortedData.forEach((point, idx) => {
      const xPos = padding + (chartWidth / Math.max(1, pointsCount - 1)) * idx;
      const yPos = padding + chartHeight - (point.peakRom / maxVal) * chartHeight;

      // Draw dot
      ctx.beginPath();
      ctx.arc(xPos, yPos, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw date tag at the bottom (for first, middle, last to avoid crowding)
      if (idx === 0 || idx === pointsCount - 1 || (pointsCount > 2 && idx === Math.floor(pointsCount / 2))) {
        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const formattedDate = new Date(point.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
        ctx.fillText(formattedDate, xPos, height - padding + 10);
      }
    });

  }, [data]);

  return (
    <div className="w-full bg-[#141820] border border-[#1e293b] p-6 rounded-2xl">
      <h4 className="text-sm font-bold text-white mb-4 tracking-wider uppercase">Range of Motion (ROM) Trend</h4>
      <div className="relative w-full h-[220px]">
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={200} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
