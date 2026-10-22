'use client';

import React from 'react';
import { RoomStatus, VerificationStatus, GuestTier } from '@/types/hotel';

interface StatusBadgeProps {
  status?: RoomStatus | VerificationStatus | GuestTier | string;
  type?: 'room' | 'verification' | 'tier' | 'reservation';
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status = 'Available', type = 'room', className = '', size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  // Room status badges
  if (type === 'room') {
    switch (status) {
      case 'Available':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#C8E8D7] bg-[#EDF7F2] text-[#235F42] ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E6F4E]" />
            Available
          </span>
        );
      case 'Occupied':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#CBDFF2] bg-[#EFF5FB] text-[#214366] ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#2A5580]" />
            Occupied
          </span>
        );
      case 'Reserved':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#F3E4BF] bg-[#FDF9EE] text-[#8C6A23] ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#B69A65]" />
            Reserved
          </span>
        );
      case 'Cleaning':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#FBE0B9] bg-[#FEF7ED] text-[#A66719] ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#D48924] animate-pulse" />
            Cleaning
          </span>
        );
      case 'Maintenance':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#F7CECE] bg-[#FDF2F2] text-[#963535] ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#B33A3A]" />
            Maintenance
          </span>
        );
    }
  }

  // Verification status badges
  if (type === 'verification') {
    switch (status) {
      case 'Verified':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#C8E8D7] bg-[#EDF7F2] text-[#235F42] ${sizeClasses} ${className}`}
          >
            <svg className="w-3 h-3 text-[#2E6F4E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            ID Verified
          </span>
        );
      case 'Pending Verification':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#F3E4BF] bg-[#FDF9EE] text-[#8C6A23] ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#B69A65]" />
            Pending Verification
          </span>
        );
      case 'Expired':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#F7CECE] bg-[#FDF2F2] text-[#963535] ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#B33A3A]" />
            Document Expired
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border border-[#E8E6DF] bg-[#F7F6F2] text-[#777C77] ${sizeClasses} ${className}`}
          >
            {status}
          </span>
        );
    }
  }

  // VIP Tier badges
  if (type === 'tier') {
    switch (status) {
      case 'Royal Ambassador':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border border-[#E8DEC8] bg-[#FBF8F1] text-[#785E2C] font-semibold tracking-wide ${sizeClasses} ${className}`}
          >
            <svg className="w-3 h-3 text-[#B69A65]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Royal Ambassador
          </span>
        );
      case 'Platinum Elite':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border border-[#CBDFF2] bg-[#EFF5FB] text-[#214366] font-medium tracking-wide ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
            Platinum Elite
          </span>
        );
      case 'Gold VIP':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border border-[#F3E4BF] bg-[#FDF9EE] text-[#8C6A23] font-medium ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#B69A65]" />
            Gold VIP
          </span>
        );
      case 'Silver Preferred':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border border-[#E8E6DF] bg-[#F7F6F2] text-[#555A55] font-medium ${sizeClasses} ${className}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#8A8F8A]" />
            Silver Preferred
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border border-[#E8E6DF] bg-[#F7F6F2] text-[#777C77] ${sizeClasses} ${className}`}
          >
            Standard Guest
          </span>
        );
    }
  }

  // Reservation Status
  switch (status) {
    case 'Checked-In':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#C8E8D7] bg-[#EDF7F2] text-[#235F42] ${sizeClasses} ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#2E6F4E]" />
          Checked-In
        </span>
      );
    case 'Confirmed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#F3E4BF] bg-[#FDF9EE] text-[#8C6A23] ${sizeClasses} ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#B69A65]" />
          Confirmed
        </span>
      );
    case 'Completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#E8E6DF] bg-[#F7F6F2] text-[#777C77] ${sizeClasses} ${className}`}
        >
          Completed
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#E8E6DF] bg-[#F7F6F2] text-[#777C77] ${sizeClasses} ${className}`}
        >
          {status}
        </span>
      );
  }
}
