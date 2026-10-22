'use client';

import React, { useState, useMemo } from 'react';
import { useHotel } from '@/lib/data-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Shield,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AuditLogsPage() {
  const { auditLogs } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (categoryFilter !== 'All' && log.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchTarget = log.target.toLowerCase().includes(q);
        const matchStaff = log.staffName.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        if (!matchAction && !matchTarget && !matchStaff && !matchDetails) return false;
      }
      return true;
    });
  }, [auditLogs, categoryFilter, searchQuery]);

  const categories = [
    'All',
    'Check-In',
    'Check-Out',
    'Guest Profile',
    'Security / Document',
    'Room Status',
    'Billing',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6DF] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#202923]">
            Security & Audit Logs
          </h1>
          <p className="mt-1 text-xs text-[#777C77]">
            Tamper-evident operational audit trail for compliance, room keycards, and document inspections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#EDF7F2] border border-[#C8E8D7] px-3 py-1 text-xs font-semibold text-[#235F42] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2E6F4E] animate-pulse" />
            Audit Logging Active
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#E8E6DF] bg-white p-3.5 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#B69A65]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, staff, or room target..."
            className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] pl-9 pr-3 py-1.5 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#202923] text-white shadow-xs'
                  : 'text-[#777C77] hover:bg-[#FAF9F5] hover:text-[#202923]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No audit entries found"
            description="No log records match your filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E6DF] bg-[#FAF9F6] text-[11px] font-semibold uppercase tracking-wider text-[#777C77]">
                  <th className="py-3 px-4">Log ID & Time</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Operational Details</th>
                  <th className="py-3 px-4">IP / Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6DF]/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#202923]">{log.id}</span>
                      <span className="block text-[11px] text-[#959A95]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-[#FAF9F6] border border-[#E8E6DF] px-2 py-0.5 text-[11px] font-medium text-[#777C77]">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#202923]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[#202923] font-medium">{log.staffName}</span>
                      <span className="block text-[11px] text-[#959A95]">{log.staffRole}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#214366]">
                      {log.target}
                    </td>
                    <td className="py-3.5 px-4 text-[#777C77] max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-[#959A95]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
