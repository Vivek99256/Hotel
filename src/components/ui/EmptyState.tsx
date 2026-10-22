'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E8E6DF] bg-[#FAF9F6] p-8 text-center sm:p-12 ${className}`}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#777C77] shadow-sm border border-[#E8E6DF]">
          {icon}
        </div>
      ) : (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#B69A65] shadow-sm border border-[#E8E6DF]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}

      <h3 className="text-base font-medium text-[#202923]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[#777C77]">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#202923] px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#161D19] focus:outline-none focus:ring-2 focus:ring-[#B69A65]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
