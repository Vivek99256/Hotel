'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { EmptyState } from '@/components/ui/EmptyState';
import { GuestRegistrationModal } from '@/components/ui/GuestRegistrationModal';
import {
  Search,
  UserPlus,
  SlidersHorizontal,
  KeyRound,
  Eye,
  MapPin,
  X,
  Users,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

function GuestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { guests } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>('All');
  const [isNewGuestOpen, setIsNewGuestOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsNewGuestOpen(true);
    }
  }, [searchParams]);

  // Multi-field filtered search
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanNums = q.replace(/\D/g, '');
        const matchName = guest.fullName.toLowerCase().includes(q);
        const matchId = guest.id.toLowerCase().includes(q);
        const matchCity = guest.city.toLowerCase().includes(q);
        const matchEmail = guest.email.toLowerCase().includes(q);
        const matchPhone = cleanNums.length >= 3 && guest.phone.replace(/\D/g, '').includes(cleanNums);

        if (!matchName && !matchId && !matchCity && !matchEmail && !matchPhone) {
          return false;
        }
      }

      // Occupancy filter
      if (selectedOccupancy === 'in-house' && !guest.currentRoomNumber) return false;
      if (selectedOccupancy === 'checked-out' && guest.currentRoomNumber) return false;

      return true;
    });
  }, [guests, searchQuery, selectedOccupancy]);

  // Recent visited guests sorted by latest visit date descending
  const recentVisitedGuests = useMemo(() => {
    return [...filteredGuests]
      .filter((g) => Boolean(g.lastVisitDate))
      .sort((a, b) => {
        const timeA = new Date(a.lastVisitDate).getTime() || 0;
        const timeB = new Date(b.lastVisitDate).getTime() || 0;
        return timeB - timeA;
      });
  }, [filteredGuests]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6DF] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#202923]">
            Guest Directory & Hospitality CRM
          </h1>
          {/* <p className="mt-1 text-xs text-[#777C77]">
            Instant identity lookup for returning patrons, preferences, and visit records
          </p> */}
        </div>

        <button
          onClick={() => setIsNewGuestOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-all shrink-0"
        >
          <UserPlus className="h-4 w-4 text-[#B69A65]" />
          Register New Guest
        </button>
      </div>

      {/* Prominent Search & Filter Toolbar */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B69A65]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest name..."
            className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#202923] placeholder-[#959A95] focus:border-[#B69A65] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#B69A65] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#959A95] hover:text-[#202923]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-[#777C77] flex items-center gap-1 font-medium mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter:
          </span>

          {/* In-House Status */}
          <select
            value={selectedOccupancy}
            onChange={(e) => setSelectedOccupancy(e.target.value)}
            className="rounded-lg border border-[#E8E6DF] bg-[#FAF9F6] px-2.5 py-1 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
          >
            <option value="All">All In-House & Past Guests</option>
            <option value="in-house">Currently In-House Only</option>
            <option value="checked-out">Past / Arriving Later</option>
          </select>

          {(searchQuery || selectedOccupancy !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedOccupancy('All');
              }}
              className="text-xs text-[#B33A3A] hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Grid: 2 Cards in 1 Row on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Card 1: All Guests Directory */}
        <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#B69A65]" />
              <h2 className="text-sm font-semibold text-[#202923]">Guest Directory</h2>
              <span className="rounded-full bg-[#F2EFE8] px-2 py-0.5 text-[11px] font-semibold text-[#777C77]">
                {filteredGuests.length}
              </span>
            </div>
            <span className="text-[11px] text-[#959A95]">
              Click row to view profile
            </span>
          </div>

          {filteredGuests.length === 0 ? (
            <EmptyState
              title="No guests found"
              description="No guest profiles match the current filter."
              actionLabel="Reset Filter"
              onAction={() => {
                setSearchQuery('');
                setSelectedOccupancy('All');
              }}
              className="m-6"
            />
          ) : (
            <div>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-[#E8E6DF]/60 max-h-[560px] overflow-y-auto">
                {filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => router.push(`/guests/${guest.id}`)}
                    className="p-3.5 bg-white hover:bg-[#FAF9F5] active:bg-[#F5F4EE] transition-colors cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-9 w-9 rounded-full bg-[#E8E6DF] overflow-hidden shrink-0 border border-[#D9D6CC]">
                          {guest.avatarUrl ? (
                            <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-xs text-[#202923]">
                              {guest.firstName[0]}
                            </div>
                          )}
                          {guest.currentRoomNumber && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 px-1 items-center justify-center rounded-full bg-[#2A5580] text-[8px] font-bold text-white shadow-xs">
                              {guest.currentRoomNumber}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#202923]">{guest.fullName}</p>
                          <span className="font-mono text-[10px] text-[#777C77] bg-[#F7F6F2] px-1 rounded border border-[#E8E6DF]">
                            {guest.id}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[11px] text-[#202923] block">{guest.phoneMasked}</span>
                        <span className="text-[10px] text-[#777C77]">{guest.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#E8E6DF]/50">
                      <span className="text-[#777C77]">
                        Visit: {formatDate(guest.lastVisitDate)}
                      </span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!guest.currentRoomNumber && (
                          <Link
                            href={`/check-in?guestId=${guest.id}`}
                            className="rounded-lg bg-[#202923] text-white px-2 py-0.5 text-[10px] font-medium"
                          >
                            Check In
                          </Link>
                        )}
                        <Link
                          href={`/guests/${guest.id}`}
                          className="rounded-lg border border-[#E8E6DF] px-2 py-0.5 text-[10px] font-medium text-[#202923]"
                        >
                          Profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto max-h-[620px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#E8E6DF] bg-[#FAF9F6] text-[11px] font-semibold uppercase tracking-wider text-[#777C77]">
                      <th className="py-2.5 px-3">Guest Identity</th>
                      <th className="py-2.5 px-3">Contact & Location</th>
                      <th className="py-2.5 px-3">Last Visit</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6DF]/60">
                    {filteredGuests.map((guest) => (
                      <tr
                        key={guest.id}
                        onClick={() => router.push(`/guests/${guest.id}`)}
                        className="group hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                      >
                        {/* Guest Name & Avatar */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-8 w-8 rounded-full bg-[#E8E6DF] overflow-hidden shrink-0 border border-[#D9D6CC]">
                              {guest.avatarUrl ? (
                                <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center font-bold text-xs text-[#202923]">
                                  {guest.firstName[0]}
                                </div>
                              )}
                              {guest.currentRoomNumber && (
                                <span
                                  title={`Currently in Room ${guest.currentRoomNumber}`}
                                  className="absolute -bottom-0.5 -right-0.5 flex h-3.5 px-1 items-center justify-center rounded-full bg-[#2A5580] text-[8px] font-bold text-white shadow-xs"
                                >
                                  {guest.currentRoomNumber}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-[#202923] group-hover:text-[#B69A65] transition-colors truncate">
                                {guest.fullName}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-[9px] text-[#777C77] bg-[#F7F6F2] px-1 rounded border border-[#E8E6DF]">
                                  {guest.id}
                                </span>
                                {guest.currentRoomNumber && (
                                  <span className="text-[9px] text-[#214366] font-medium truncate">
                                    Room {guest.currentRoomNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Location */}
                        <td className="py-2.5 px-3">
                          <div className="font-mono text-[11px] text-[#202923]">{guest.phoneMasked}</div>
                          <div className="flex items-center gap-1 text-[10px] text-[#777C77] mt-0.5 truncate">
                            <MapPin className="h-2.5 w-2.5 text-[#959A95] shrink-0" />
                            <span className="truncate">{guest.city}, {guest.country}</span>
                          </div>
                        </td>

                        {/* Last Visit */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-xs text-[#202923]">{formatDate(guest.lastVisitDate)}</span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {!guest.currentRoomNumber && (
                              <Link
                                href={`/check-in?guestId=${guest.id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#B69A65] bg-white px-2 py-1 text-[11px] font-medium text-[#8F6F2E] hover:bg-[#FDF9EE] transition-colors"
                              >
                                <KeyRound className="h-3 w-3 text-[#B69A65]" />
                                Check In
                              </Link>
                            )}
                            <Link
                              href={`/guests/${guest.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6DF] bg-white px-2 py-1 text-[11px] font-medium text-[#202923] hover:bg-[#FAF9F5] transition-colors"
                            >
                              <Eye className="h-3 w-3 text-[#777C77]" />
                              Profile
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Recent Visited Guests */}
        <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#B69A65]" />
              <h2 className="text-sm font-semibold text-[#202923]">Recent Visited</h2>
              <span className="rounded-full bg-[#FEF7ED] border border-[#FBE0B9] px-2 py-0.5 text-[11px] font-semibold text-[#A66719]">
                {recentVisitedGuests.length} Visited
              </span>
            </div>
            <span className="text-[11px] text-[#959A95]">
              Sorted by latest visit
            </span>
          </div>

          {recentVisitedGuests.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#777C77]">
              No recent visits found.
            </div>
          ) : (
            <div>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-[#E8E6DF]/60 max-h-[560px] overflow-y-auto">
                {recentVisitedGuests.map((guest) => (
                  <div
                    key={`recent-${guest.id}`}
                    onClick={() => router.push(`/guests/${guest.id}`)}
                    className="p-3.5 bg-white hover:bg-[#FAF9F5] active:bg-[#F5F4EE] transition-colors cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-9 w-9 rounded-full bg-[#E8E6DF] overflow-hidden shrink-0 border border-[#D9D6CC]">
                          {guest.avatarUrl ? (
                            <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-xs text-[#202923]">
                              {guest.firstName[0]}
                            </div>
                          )}
                          {guest.currentRoomNumber && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 px-1 items-center justify-center rounded-full bg-[#2A5580] text-[8px] font-bold text-white shadow-xs">
                              {guest.currentRoomNumber}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#202923]">{guest.fullName}</p>
                          <span className="font-mono text-[10px] text-[#777C77] bg-[#F7F6F2] px-1 rounded border border-[#E8E6DF]">
                            {guest.id}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF5EC] border border-[#F3E4BF] px-2 py-0.5 text-[10px] font-medium text-[#8F6F2E]">
                        <Clock className="h-2.5 w-2.5 text-[#B69A65]" />
                        {formatDate(guest.lastVisitDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#E8E6DF]/50">
                      <span className="font-mono text-[#202923] text-[11px]">{guest.phoneMasked} • {guest.city}</span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!guest.currentRoomNumber && (
                          <Link
                            href={`/check-in?guestId=${guest.id}`}
                            className="rounded-lg bg-[#202923] text-white px-2 py-0.5 text-[10px] font-medium"
                          >
                            Check In
                          </Link>
                        )}
                        <Link
                          href={`/guests/${guest.id}`}
                          className="rounded-lg border border-[#E8E6DF] px-2 py-0.5 text-[10px] font-medium text-[#202923]"
                        >
                          Profile →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto max-h-[620px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#E8E6DF] bg-[#FAF9F6] text-[11px] font-semibold uppercase tracking-wider text-[#777C77]">
                      <th className="py-2.5 px-3">Guest Identity</th>
                      <th className="py-2.5 px-3">Contact & Location</th>
                      <th className="py-2.5 px-3">Visited Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6DF]/60">
                    {recentVisitedGuests.map((guest) => (
                      <tr
                        key={`recent-${guest.id}`}
                        onClick={() => router.push(`/guests/${guest.id}`)}
                        className="group hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                      >
                        {/* Guest Name & Avatar */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-8 w-8 rounded-full bg-[#E8E6DF] overflow-hidden shrink-0 border border-[#D9D6CC]">
                              {guest.avatarUrl ? (
                                <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center font-bold text-xs text-[#202923]">
                                  {guest.firstName[0]}
                                </div>
                              )}
                              {guest.currentRoomNumber && (
                                <span
                                  title={`Currently in Room ${guest.currentRoomNumber}`}
                                  className="absolute -bottom-0.5 -right-0.5 flex h-3.5 px-1 items-center justify-center rounded-full bg-[#2A5580] text-[8px] font-bold text-white shadow-xs"
                                >
                                  {guest.currentRoomNumber}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-[#202923] group-hover:text-[#B69A65] transition-colors truncate">
                                {guest.fullName}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-[9px] text-[#777C77] bg-[#F7F6F2] px-1 rounded border border-[#E8E6DF]">
                                  {guest.id}
                                </span>
                                {guest.currentRoomNumber && (
                                  <span className="text-[9px] text-[#214366] font-medium truncate">
                                    Room {guest.currentRoomNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Location */}
                        <td className="py-2.5 px-3">
                          <div className="font-mono text-[11px] text-[#202923]">{guest.phoneMasked}</div>
                          <div className="flex items-center gap-1 text-[10px] text-[#777C77] mt-0.5 truncate">
                            <MapPin className="h-2.5 w-2.5 text-[#959A95] shrink-0" />
                            <span className="truncate">{guest.city}, {guest.country}</span>
                          </div>
                        </td>

                        {/* Visited Date with subtle highlight badge */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF5EC] border border-[#F3E4BF] px-2 py-0.5 text-[11px] font-medium text-[#8F6F2E]">
                            <Clock className="h-3 w-3 text-[#B69A65]" />
                            {formatDate(guest.lastVisitDate)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {!guest.currentRoomNumber && (
                              <Link
                                href={`/check-in?guestId=${guest.id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#B69A65] bg-white px-2 py-1 text-[11px] font-medium text-[#8F6F2E] hover:bg-[#FDF9EE] transition-colors"
                              >
                                <KeyRound className="h-3 w-3 text-[#B69A65]" />
                                Check In
                              </Link>
                            )}
                            <Link
                              href={`/guests/${guest.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6DF] bg-white px-2 py-1 text-[11px] font-medium text-[#202923] hover:bg-[#FAF9F5] transition-colors"
                            >
                              <Eye className="h-3 w-3 text-[#777C77]" />
                              Profile
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guest Registration Modal */}
      <GuestRegistrationModal
        isOpen={isNewGuestOpen}
        onClose={() => setIsNewGuestOpen(false)}
        onGuestCreated={(newId) => router.push(`/guests/${newId}`)}
      />
    </div>
  );
}

export default function GuestsPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse bg-white rounded-2xl" />}>
      <GuestsContent />
    </Suspense>
  );
}
