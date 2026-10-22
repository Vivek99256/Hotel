'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useHotel } from '@/lib/data-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewReservationModal } from '@/components/ui/NewReservationModal';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CreditCard,
  KeyRound,
  CheckCircle2,
  Clock,
  User,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReservationStatus } from '@/types/hotel';

export default function ReservationsPage() {
  const { reservations, updateReservationStatus } = useHotel();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      if (statusFilter !== 'All' && res.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = res.guestName.toLowerCase().includes(q);
        const matchId = res.id.toLowerCase().includes(q);
        const matchRoom = res.roomNumber.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRoom) return false;
      }
      return true;
    });
  }, [reservations, statusFilter, searchQuery]);

  // Statistics
  const confirmedCount = reservations.filter((r) => r.status === 'Confirmed').length;
  const checkedInCount = reservations.filter((r) => r.status === 'Checked-In').length;
  const completedCount = reservations.filter((r) => r.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6DF] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#202923]">
            Reservation Management
          </h1>
          <p className="mt-1 text-xs text-[#777C77]">
            Active bookings, upcoming arrivals, and pre-allocated luxury suites
          </p>
        </div>

        <button
          onClick={() => setIsNewReservationOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-all shrink-0"
        >
          <Plus className="h-4 w-4 text-[#B69A65]" />
          New Reservation
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E8E6DF] bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777C77]">
            Confirmed & Due Arrivals
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-medium text-[#202923]">{confirmedCount}</span>
            <span className="text-xs text-[#8F6F2E]">Awaiting check-in</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E6DF] bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777C77]">
            Currently In-House Stays
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-medium text-[#214366]">{checkedInCount}</span>
            <span className="text-xs text-[#2A5580]">Active folios</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8E6DF] bg-white p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777C77]">
            Completed Stays
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-medium text-[#235F42]">{completedCount}</span>
            <span className="text-xs text-[#2E6F4E]">Settled & archived</span>
          </div>
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
            placeholder="Search booking ref, guest name, or room..."
            className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] pl-9 pr-3 py-1.5 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Confirmed', 'Checked-In', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-[#202923] text-white shadow-xs'
                  : 'text-[#777C77] hover:bg-[#FAF9F5] hover:text-[#202923]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs">
        {filteredReservations.length === 0 ? (
          <EmptyState
            title="No reservations found"
            description="No bookings match your current filter and search query."
          />
        ) : (
          <div>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-[#E8E6DF]/60">
              {filteredReservations.map((res) => (
                <div key={res.id} className="p-4 bg-white hover:bg-[#FAF9F5] space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#8F6F2E]">{res.id}</span>
                      <Link
                        href={`/guests/${res.guestId}`}
                        className="block font-semibold text-sm text-[#202923] hover:text-[#B69A65] mt-0.5"
                      >
                        {res.guestName}
                      </Link>
                    </div>
                    <StatusBadge status={res.status} type="reservation" size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#777C77] bg-[#FAF9F6] p-2.5 rounded-lg border border-[#E8E6DF]/60">
                    <div>
                      <span className="font-mono font-bold text-[#202923]">Room {res.roomNumber}</span>
                      <span className="block text-[10px] text-[#959A95]">{res.roomType}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif font-bold text-sm text-[#8F6F2E]">{formatCurrency(res.totalPrice)}</span>
                      <span className="block text-[10px] text-[#959A95]">{res.nights} Nights</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-[#777C77]">
                      {formatDate(res.checkInDate)} — {formatDate(res.checkOutDate)}
                    </span>
                    <div>
                      {res.status === 'Confirmed' && (
                        <Link
                          href={`/check-in?guestId=${res.guestId}&roomNumber=${res.roomNumber}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#202923] px-3 py-1.5 text-xs font-medium text-white shadow-xs"
                        >
                          <KeyRound className="h-3 w-3 text-[#B69A65]" /> Check In
                        </Link>
                      )}
                      {res.status === 'Checked-In' && (
                        <Link
                          href="/check-in"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6DF] px-3 py-1.5 text-xs text-[#202923]"
                        >
                          Check Out
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E6DF] bg-[#FAF9F6] text-[11px] font-semibold uppercase tracking-wider text-[#777C77]">
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Room & Type</th>
                    <th className="py-3 px-4">Stay Dates</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E6DF]/60">
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#202923]">
                        {res.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/guests/${res.guestId}`}
                          className="font-semibold text-sm text-[#202923] hover:text-[#B69A65] transition-colors"
                        >
                          {res.guestName}
                        </Link>
                        <span className="block text-[11px] font-mono text-[#777C77]">
                          {res.guestPhoneMasked}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs text-[#202923]">
                          Room {res.roomNumber}
                        </span>
                        <span className="block text-[11px] text-[#777C77]">{res.roomType}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#777C77]">
                        <span className="font-medium text-[#202923]">
                          {formatDate(res.checkInDate)} — {formatDate(res.checkOutDate)}
                        </span>
                        <span className="block text-[11px] text-[#959A95]">{res.nights} Nights</span>
                      </td>
                      <td className="py-3.5 px-4 font-serif font-semibold text-[#8F6F2E]">
                        {formatCurrency(res.totalPrice)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={res.status} type="reservation" size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {res.status === 'Confirmed' && (
                          <Link
                            href={`/check-in?guestId=${res.guestId}&roomNumber=${res.roomNumber}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#202923] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#161D19]"
                          >
                            <KeyRound className="h-3 w-3 text-[#B69A65]" /> Check In
                          </Link>
                        )}
                        {res.status === 'Checked-In' && (
                          <Link
                            href="/check-in"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6DF] px-2.5 py-1 text-xs text-[#202923] hover:bg-[#FAF9F5]"
                          >
                            Check Out
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <NewReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
      />
    </div>
  );
}
