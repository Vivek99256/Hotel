'use client';

import React from 'react';
import { useHotel } from '@/lib/data-store';
import {
  UserCog,
  Shield,
  Clock,
  Check,
  Settings,
  Hotel,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

export default function StaffPage() {
  const { currentStaff, setCurrentStaff, staffList, resetToDefaultData } = useHotel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6DF] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#202923]">
            Staff Directory & PMS Settings
          </h1>
          <p className="mt-1 text-xs text-[#777C77]">
            Front desk roles, security document access clearance, and system configurations
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset PMS database to pristine luxury demonstration data?')) {
              resetToDefaultData();
              alert('Hotel database reset to pristine seed state.');
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E6DF] bg-white px-3.5 py-2 text-xs font-medium text-[#777C77] hover:bg-[#FAF9F5] hover:text-[#B33A3A] transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* Staff Roster Cards */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-[#202923] mb-1">Front Desk & Concierge Staff</h3>
        <p className="text-xs text-[#777C77] mb-5">
          Select an active profile to switch duty session or test permissions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {staffList.map((stf) => {
            const isCurrent = stf.id === currentStaff.id;

            return (
              <div
                key={stf.id}
                onClick={() => setCurrentStaff(stf)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#B69A65] bg-[#FDF9EE]/50 ring-1 ring-[#B69A65]'
                    : 'border-[#E8E6DF] bg-white hover:border-[#D6D2C4] hover:bg-[#FAF9F5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={stf.avatar}
                      alt={stf.name}
                      className="h-12 w-12 rounded-xl object-cover border border-[#E8E6DF]"
                    />
                    {isCurrent && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E6F4E] text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#202923]">{stf.name}</h4>
                    <p className="text-[11px] text-[#777C77]">{stf.role}</p>
                    <span className="inline-block mt-1 font-mono text-[10px] text-[#959A95]">
                      {stf.shift}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E8E6DF]/60 text-[11px] text-[#777C77] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Document View Clearance:</span>
                    <span className={stf.permissions.canViewSensitiveDocuments ? 'text-[#2E6F4E] font-medium' : 'text-[#777C77]'}>
                      {stf.permissions.canViewSensitiveDocuments ? 'Authorized' : 'Restricted'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Penthouse Allocation:</span>
                    <span className={stf.permissions.canAssignPenthouses ? 'text-[#2E6F4E] font-medium' : 'text-[#777C77]'}>
                      {stf.permissions.canAssignPenthouses ? 'Yes' : 'Manager only'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Property & PMS Rules Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Hotel className="h-4 w-4 text-[#B69A65]" />
            <h3 className="text-sm font-semibold text-[#202923]">Hospitality Operating Rules</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8E6DF]/60 pb-2">
              <span className="text-[#777C77]">Standard Check-In Hour:</span>
              <span className="font-medium text-[#202923]">14:00 IST (Indian Standard Time)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E8E6DF]/60 pb-2">
              <span className="text-[#777C77]">Standard Check-Out Hour:</span>
              <span className="font-medium text-[#202923]">11:00 IST (Late checkout by request)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E8E6DF]/60 pb-2">
              <span className="text-[#777C77]">Identity Verification Policy:</span>
              <span className="font-medium text-[#2E6F4E]">Mandatory (Aadhaar Card / PAN / Passport)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#777C77]">Housekeeping Turnover Buffer:</span>
              <span className="font-medium text-[#202923]">60 minutes deep clean per heritage suite</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[#B69A65]" />
            <h3 className="text-sm font-semibold text-[#202923]">Security & ID Compliance Architecture</h3>
          </div>
          <div className="space-y-3 text-xs text-[#777C77]">
            <p>
              • Sensitive Aadhaar and PAN numbers are masked in compliance with UIDAI regulations and the Indian Digital Personal Data Protection (DPDP) Act.
            </p>
            <p>
              • Customer ID proof photos (Front &amp; Back) are encrypted and stored with immutable audit logs and staff timestamps.
            </p>
            <p>
              • All keycard issuance operations and room reassignments generate indelible audit logs with staff credentials and terminal timestamps.
            </p>
          </div>
        </div>

        {/* Live Supabase Cloud Database Integration */}
        <div className="md:col-span-2 rounded-2xl border border-[#C8E8D7] bg-[#EDF7F2]/60 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2E6F4E] animate-pulse" />
              <h3 className="text-sm font-semibold text-[#235F42]">
                Live Supabase Cloud Database Connected
              </h3>
            </div>
            <span className="rounded-full bg-[#2E6F4E] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
              Live Connection Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#202923]">
            <div className="rounded-xl border border-[#C8E8D7] bg-white p-3 font-mono">
              <span className="text-[10px] text-[#777C77] block uppercase font-sans">Supabase Project Endpoint</span>
              <span className="font-semibold text-xs text-[#202923]">https://rtmpuulcgnpktkhcdxyc.supabase.co</span>
            </div>
            <div className="rounded-xl border border-[#C8E8D7] bg-white p-3 font-mono">
              <span className="text-[10px] text-[#777C77] block uppercase font-sans">Active Publishable Key</span>
              <span className="font-semibold text-xs text-[#235F42]">sb_publishable_htREj7DcsV74c2Wb...</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-[#235F42] leading-relaxed">
            The application is connected to your live Supabase project. A complete, ready-to-execute schema script is available in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#C8E8D7]">supabase-schema.sql</code>. Paste it into your Supabase SQL editor to create the PostgreSQL tables and Row-Level Security policies.
          </p>
        </div>
      </div>
    </div>
  );
}
