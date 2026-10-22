'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { GuestRegistrationModal } from '@/components/ui/GuestRegistrationModal';
import {
  Search,
  UserPlus,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Calendar,
  KeyRound,
  Eye,
  MapPin,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { GuestTier, VerificationStatus } from '@/types/hotel';

function GuestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { guests } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
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

      // Tier filter
      if (selectedTier !== 'All' && guest.tier !== selectedTier) {
        return false;
      }

      // Verification filter
      if (selectedVerification !== 'All' && guest.verificationStatus !== selectedVerification) {
        return false;
      }

      // Occupancy filter
      if (selectedOccupancy === 'in-house' && !guest.currentRoomNumber) return false;
      if (selectedOccupancy === 'checked-out' && guest.currentRoomNumber) return false;

      return true;
    });
  }, [guests, searchQuery, selectedTier, selectedVerification, selectedOccupancy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6DF] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#202923]">
            Guest Directory & Hospitality CRM
          </h1>
          <p className="mt-1 text-xs text-[#777C77]">
            Instant identity lookup for returning patrons, VIP preferences, and stay histories
          </p>
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
            placeholder="Search by guest name, mobile digits, guest ID (e.g. GST-8024), or city..."
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

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="rounded-lg border border-[#E8E6DF] bg-[#FAF9F6] px-2.5 py-1 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
          >
            <option value="All">All Tiers</option>
            <option value="Royal Ambassador">Royal Ambassador</option>
            <option value="Platinum Elite">Platinum Elite</option>
            <option value="Gold VIP">Gold VIP</option>
            <option value="Silver Preferred">Silver Preferred</option>
            <option value="Standard">Standard</option>
          </select>

          {/* Verification Status */}
          <select
            value={selectedVerification}
            onChange={(e) => setSelectedVerification(e.target.value)}
            className="rounded-lg border border-[#E8E6DF] bg-[#FAF9F6] px-2.5 py-1 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
          >
            <option value="All">All Document Statuses</option>
            <option value="Verified">Verified Documents</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Expired">Expired Documents</option>
          </select>

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

          {(searchQuery || selectedTier !== 'All' || selectedVerification !== 'All' || selectedOccupancy !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTier('All');
                setSelectedVerification('All');
                setSelectedOccupancy('All');
              }}
              className="text-xs text-[#B33A3A] hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Guest Directory Table */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-5 py-3">
          <span className="text-xs font-semibold text-[#777C77]">
            Showing {filteredGuests.length} Guest Profile{filteredGuests.length === 1 ? '' : 's'}
          </span>
          <span className="text-[11px] text-[#959A95]">
            Click any row to open luxury CRM profile
          </span>
        </div>

        {filteredGuests.length === 0 ? (
          <EmptyState
            title="No guests match your criteria"
            description="Try modifying search keywords or clearing filters to view other registered guests."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedTier('All');
              setSelectedVerification('All');
              setSelectedOccupancy('All');
            }}
            className="m-6"
          />
        ) : (
          <div>
            {/* Mobile Card View (Phone / Small Tablets) */}
            <div className="sm:hidden divide-y divide-[#E8E6DF]/60">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  onClick={() => router.push(`/guests/${guest.id}`)}
                  className="p-4 bg-white hover:bg-[#FAF9F5] active:bg-[#F5F4EE] transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 rounded-full bg-[#E8E6DF] overflow-hidden shrink-0 border border-[#D9D6CC]">
                        {guest.avatarUrl ? (
                          <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-sm text-[#202923]">
                            {guest.firstName[0]}
                          </div>
                        )}
                        {guest.currentRoomNumber && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 px-1 items-center justify-center rounded-full bg-[#2A5580] text-[9px] font-bold text-white shadow-xs">
                            {guest.currentRoomNumber}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#202923]">{guest.fullName}</p>
                        <p className="text-[11px] text-[#777C77] flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-[#959A95]" />
                          {guest.city}, {guest.country}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={guest.tier} type="tier" size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8E6DF]/50">
                    <span className="font-mono text-[#202923] text-xs">{guest.phoneMasked}</span>
                    <div className="flex items-center gap-1">
                      <StatusBadge status={guest.verificationStatus} type="verification" size="sm" />
                      {guest.document?.documentImageUrl && (
                        <span className="bg-[#E8F5E9] text-[#2E6F4E] font-bold text-[9px] px-1.5 py-0.5 rounded">
                          Photo ✓
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-[11px] text-[#777C77]">
                      {guest.totalStays} {guest.totalStays === 1 ? 'Stay' : 'Stays'} • Last {formatDate(guest.lastVisitDate)}
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {!guest.currentRoomNumber && (
                        <Link
                          href={`/check-in?guestId=${guest.id}`}
                          className="rounded-lg bg-[#202923] text-white px-3 py-1 text-[11px] font-medium"
                        >
                          Check In
                        </Link>
                      )}
                      <Link
                        href={`/guests/${guest.id}`}
                        className="rounded-lg border border-[#E8E6DF] px-2.5 py-1 text-[11px] font-medium text-[#202923]"
                      >
                        Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Tablets & Desktop) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E6DF] bg-[#FAF9F6] text-[11px] font-semibold uppercase tracking-wider text-[#777C77]">
                    <th className="py-3 px-4">Guest Identity</th>
                    <th className="py-3 px-4">VIP Tier</th>
                    <th className="py-3 px-4">Contact & Location</th>
                    <th className="py-3 px-4">Verification & ID</th>
                    <th className="py-3 px-4">Stay Count</th>
                    <th className="py-3 px-4">Last Visit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
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
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-full bg-[#E8E6DF] overflow-hidden shrink-0 border border-[#D9D6CC]">
                            {guest.avatarUrl ? (
                              <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold text-[#202923]">
                                {guest.firstName[0]}
                              </div>
                            )}
                            {guest.currentRoomNumber && (
                              <span
                                title={`Currently in Room ${guest.currentRoomNumber}`}
                                className="absolute -bottom-0.5 -right-0.5 flex h-4 px-1 items-center justify-center rounded-full bg-[#2A5580] text-[9px] font-bold text-white shadow-xs"
                              >
                                {guest.currentRoomNumber}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#202923] group-hover:text-[#B69A65] transition-colors">
                              {guest.fullName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-[#777C77] bg-[#F7F6F2] px-1 rounded border border-[#E8E6DF]">
                                {guest.id}
                              </span>
                              {guest.currentRoomNumber && (
                                <span className="text-[10px] text-[#214366] font-medium">
                                  In Room {guest.currentRoomNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* VIP Tier */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={guest.tier} type="tier" size="sm" />
                      </td>

                      {/* Contact & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-[#202923]">{guest.phoneMasked}</div>
                        <div className="flex items-center gap-1 text-[11px] text-[#777C77] mt-0.5">
                          <MapPin className="h-3 w-3 text-[#959A95]" />
                          <span>{guest.city}, {guest.country}</span>
                        </div>
                      </td>

                      {/* Verification Status & ID Photo Indicator */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={guest.verificationStatus} type="verification" size="sm" />
                          <div className="flex items-center gap-1 text-[10px] text-[#777C77]">
                            <span>{guest.document?.type || 'Aadhaar Card'}</span>
                            {guest.document?.documentImageUrl && (
                              <span className="bg-[#E8F5E9] text-[#2E6F4E] font-bold text-[9px] px-1.5 py-0.2 rounded" title="Customer ID Proof Photo Stored">
                                Photo ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Stay Count */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#202923]">
                          {guest.totalStays} {guest.totalStays === 1 ? 'Stay' : 'Stays'}
                        </span>
                        <span className="block text-[11px] text-[#959A95]">
                          {guest.totalNights} nights total
                        </span>
                      </td>

                      {/* Last Visit */}
                      <td className="py-3.5 px-4">
                        <span className="text-[#202923]">{formatDate(guest.lastVisitDate)}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {!guest.currentRoomNumber && (
                            <Link
                              href={`/check-in?guestId=${guest.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#B69A65] bg-white px-2.5 py-1 text-xs font-medium text-[#8F6F2E] hover:bg-[#FDF9EE] transition-colors"
                            >
                              <KeyRound className="h-3 w-3 text-[#B69A65]" />
                              Check In
                            </Link>
                          )}
                          <Link
                            href={`/guests/${guest.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6DF] bg-white px-2.5 py-1 text-xs font-medium text-[#202923] hover:bg-[#FAF9F5] transition-colors"
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
