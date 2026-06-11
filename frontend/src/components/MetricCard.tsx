"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendType: "up" | "down" | "neutral" | "warning";
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export default function MetricCard({
  title,
  value,
  trend,
  trendType,
  icon: Icon,
  iconBgColor,
  iconColor
}: MetricCardProps) {
  
  // Decide trend text color
  let trendClass = "text-gray-500";
  if (trendType === "up") {
    trendClass = "text-primary font-medium";
  } else if (trendType === "warning") {
    trendClass = "text-error font-medium";
  } else if (trendType === "neutral") {
    trendClass = "text-amber-600 font-medium";
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-card border border-surface-container-high flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-on-surface mt-2 tracking-tight">
            {value}
          </h3>
        </div>

        {/* Icon Circle Container */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-surface-container-low flex items-center">
        <span className={`text-xs ${trendClass}`}>{trend}</span>
      </div>
    </div>
  );
}
