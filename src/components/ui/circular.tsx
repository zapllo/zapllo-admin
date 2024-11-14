"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CircularProgress({
  value,
  size = 40,
  strokeWidth = 3,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Determine color based on traffic light system
  let color;
  if (value >= 80) {
    color = "#10B981"; // Green
  } else if (value >= 50) {
    color = "#FBBF24"; // Yellow
  } else {
    color = "#EF4444"; // Red
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-gray-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="transition-all duration-300 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-sm text-white">{value}%</span>
    </div>
  );
}

// Usage in the TableCell for completion
{
  /* <TableCell>
  <div className="flex items-center justify-start">
    <CircularProgress value={company.completion} />
  </div>
</TableCell>; */
}

export default CircularProgress;
