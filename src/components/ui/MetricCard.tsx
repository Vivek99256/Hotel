'use client';

import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: React.ReactNode;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  trend,
  icon,
  badge,
  onClick,
  className = '',
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-[#E8E6DF] bg-white p-5 transition-all duration-200 hover:border-[#D6D2C4] hover:shadow-[0_4px_16px_rgba(32,41,35,0.04)] ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#777C77]">
          {label}
        </span>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F6F2] text-[#202923] transition-colors group-hover:bg-[#F0EEE8] group-hover:text-[#B69A65]">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="text-3xl font-light tracking-tight text-[#202923]">
          {value}
        </span>
        {badge && (
          <span className="rounded bg-[#F7F6F2] px-2 py-0.5 text-[11px] font-medium text-[#777C77]">
            {badge}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center font-medium ${
                trend.isNeutral
                  ? 'text-[#777C77]'
                  : trend.isPositive
                  ? 'text-[#235F42]'
                  : 'text-[#963535]'
              }`}
            >
              {trend.isPositive ? '↑ ' : trend.isNeutral ? '• ' : '↓ '}
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-[#959A95]">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
