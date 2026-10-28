'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { EmptyState } from '@/components/ui/EmptyState';
import { GuestRegistrationModal } from '@/components/ui/GuestRegistrationModal';
import { QuickStayConfirmModal } from '@/components/ui/QuickStayConfirmModal';
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
  Sparkles,
  CheckCircle2,
  Calendar,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Guest } from '@/types/hotel';

function GuestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { guests, reservations, deleteGuest, clearAllTestData } = useHotel();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isNewGuestOpen, setIsNewGuestOpen] = useState(false);
  const [quickStayGuest, setQuickStayGuest] = useState<Guest | null>(null);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);
  const [quickSuccessAlert, setQuickSuccessAlert] = useState<{
    guestName: string;
    roomNumber: string;
    reservationId: string;
  } | null>(null);

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
        const matchVisitDate = guest.lastVisitDate ? guest.lastVisitDate.toLowerCase().includes(q) : false;

        if (!matchName && !matchId && !matchCity && !matchEmail && !matchPhone && !matchVisitDate) {
          return false;
        }
      }

      // Occupancy filter
      if (selectedOccupancy === 'in-house' && !guest.currentRoomNumber) return false;
      if (selectedOccupancy === 'checked-out' && guest.currentRoomNumber) return false;

      // Specific Date Filter (Visit date, Check-in/Check-out stay range, or registration)
      if (selectedDate) {
        const visitDateStr = guest.lastVisitDate ? guest.lastVisitDate.split('T')[0] : '';
        const createdDateStr = guest.createdAt ? guest.createdAt.split('T')[0] : '';

        const hasMatchingStay = (reservations || []).some((res) => {
          if (res.guestId !== guest.id) return false;
          const ci = res.checkInDate ? res.checkInDate.split('T')[0] : '';
          const co = res.checkOutDate ? res.checkOutDate.split('T')[0] : '';
          return (
            ci === selectedDate ||
            co === selectedDate ||
            (ci && co && ci <= selectedDate && selectedDate <= co)
          );
        });

        const matchesDate =
          visitDateStr === selectedDate ||
          createdDateStr === selectedDate ||
          hasMatchingStay;

        if (!matchesDate) return false;
      }

      return true;
    });
  }, [guests, reservations, searchQuery, selectedOccupancy, selectedDate]);

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
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E6DF] bg-white px-3.5 py-2 text-xs font-semibold text-[#8C3A3A] hover:bg-[#FDF2F2] hover:border-[#E8A5A5] transition-all shadow-2xs cursor-pointer"
            title="Wipe all test guests & reset rooms for customer handover"
          >
            <Trash2 className="h-3.5 w-3.5 text-[#B33A3A]" />
            Clear All Test Data
          </button>

          <button
            onClick={() => setIsNewGuestOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-[#B69A65]" />
            Register New Guest
          </button>
        </div>
      </div>

      {/* Deletion / Action Feedback Toast */}
      {feedbackToast && (
        <div
          className={`rounded-2xl border p-4 shadow-xs flex items-center justify-between gap-3 animate-in fade-in ${
            feedbackToast.type === 'success'
              ? 'border-[#C8E8D7] bg-[#E8F5E9] text-[#202923]'
              : 'border-[#E8A5A5] bg-[#FDF2F2] text-[#8C3A3A]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-[#2E6F4E] shrink-0" />
            <p className="text-xs font-semibold">{feedbackToast.message}</p>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#777C77] hover:bg-white/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Prominent Check-In Success Notification Banner */}
      {quickSuccessAlert && (
        <div className="rounded-2xl border border-[#C8E8D7] bg-[#E8F5E9] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#2E6F4E] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[#202923]">
                  Check-In Confirmed Successfully!
                </h3>
                <span className="rounded-full bg-[#2E6F4E] text-white text-[10px] font-bold px-2 py-0.5">
                  Room {quickSuccessAlert.roomNumber} Assigned
                </span>
              </div>
              <p className="text-xs text-[#555E57] mt-0.5">
                <strong>{quickSuccessAlert.guestName}</strong> is now checked into Room <strong>{quickSuccessAlert.roomNumber}</strong>. Stay entry recorded (Ref: {quickSuccessAlert.reservationId}).
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuickSuccessAlert(null)}
            className="rounded-xl border border-[#C8E8D7] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2E6F4E] hover:bg-[#FAF9F6] transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

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

        {/* Filter Pills Toolbar: Left = Occupancy Filter, Right = Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
          {/* Left: Occupancy Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#777C77] flex items-center gap-1 font-medium mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter:
            </span>

            <select
              value={selectedOccupancy}
              onChange={(e) => setSelectedOccupancy(e.target.value)}
              className="rounded-lg border border-[#E8E6DF] bg-[#FAF9F6] px-2.5 py-1.5 text-xs text-[#202923] font-medium focus:border-[#B69A65] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="All">All In-House &amp; Past Guests</option>
              <option value="in-house">Currently In-House Only</option>
              <option value="checked-out">Past / Arriving Later</option>
            </select>
          </div>

          {/* Right: Date Filter */}
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            <span className="text-[#777C77] flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5 text-[#B69A65]" /> Date:
            </span>

            {/* Date Input */}
            <div className="relative flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs text-[#202923] focus:border-[#B69A65] focus:bg-white focus:outline-none transition-all cursor-pointer ${
                  selectedDate
                    ? 'border-[#B69A65] bg-[#FDF9EE] font-semibold text-[#8F6F2E]'
                    : 'border-[#E8E6DF] bg-[#FAF9F6]'
                }`}
                title="Filter guests by stay or visit date"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="ml-1 rounded-md p-1 text-[#959A95] hover:bg-[#E8E6DF]/60 hover:text-[#202923] transition-colors"
                  title="Clear selected date"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick 'Today' Shortcut Button */}
            <button
              type="button"
              onClick={() => {
                if (selectedDate === todayStr) {
                  setSelectedDate('');
                } else {
                  setSelectedDate(todayStr);
                }
              }}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedDate === todayStr
                  ? 'border-[#B69A65] bg-[#202923] text-white shadow-2xs'
                  : 'border-[#E8E6DF] bg-[#FAF9F6] text-[#555E57] hover:bg-white hover:border-[#B69A65]'
              }`}
              title="Show guests with activity Today"
            >
              Today
            </button>

            {/* Reset All Filters button */}
            {(searchQuery || selectedOccupancy !== 'All' || selectedDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedOccupancy('All');
                  setSelectedDate('');
                }}
                className="text-xs text-[#B33A3A] hover:underline font-semibold ml-1 cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Grid: 2 Cards in 1 Row on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Card 1: All Guests Directory */}
        <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="h-4 w-4 text-[#B69A65]" />
              <h2 className="text-sm font-semibold text-[#202923]">Guest Directory</h2>
              <span className="rounded-full bg-[#F2EFE8] px-2 py-0.5 text-[11px] font-semibold text-[#777C77]">
                {filteredGuests.length}
              </span>
              {selectedDate && (
                <span className="rounded-full bg-[#FDF9EE] border border-[#F3E4BF] px-2 py-0.5 text-[10px] font-bold text-[#8F6F2E]">
                  {formatDate(selectedDate)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#959A95]">
              Click row to view profile
            </span>
          </div>

          {filteredGuests.length === 0 ? (
            <EmptyState
              title={selectedDate ? `No guests on ${formatDate(selectedDate)}` : "No guests found"}
              description={selectedDate ? `No guest stay or visit was recorded for ${formatDate(selectedDate)}.` : "No guest profiles match the current filter."}
              actionLabel="Reset All Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedOccupancy('All');
                setSelectedDate('');
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
                          <button
                            type="button"
                            onClick={() => setQuickStayGuest(guest)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#202923] text-white px-2.5 py-1 text-[10px] font-semibold hover:bg-[#161D19] transition-all shadow-xs"
                          >
                            <KeyRound className="h-2.5 w-2.5 text-[#B69A65]" />
                            Confirm Stay
                          </button>
                        )}
                        <Link
                          href={`/guests/${guest.id}`}
                          className="rounded-lg border border-[#E8E6DF] px-2 py-0.5 text-[10px] font-medium text-[#202923]"
                        >
                          Profile →
                        </Link>
                        <button
                          type="button"
                          onClick={() => setGuestToDelete(guest)}
                          className="rounded-lg border border-[#E8E6DF] p-1 text-[#959A95] hover:text-[#B33A3A] hover:bg-[#FDF2F2]"
                          title="Delete guest"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
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
                              <button
                                type="button"
                                onClick={() => setQuickStayGuest(guest)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#B69A65] bg-[#FDF9EE] px-2.5 py-1 text-[11px] font-semibold text-[#8F6F2E] hover:bg-[#FBEFD9] transition-all shadow-2xs cursor-pointer"
                                title="Confirm Stay for returning guest"
                              >
                                <KeyRound className="h-3 w-3 text-[#B69A65]" />
                                Confirm Stay
                              </button>
                            )}
                            <Link
                              href={`/guests/${guest.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6DF] bg-white px-2 py-1 text-[11px] font-medium text-[#202923] hover:bg-[#FAF9F5] transition-colors"
                            >
                              <Eye className="h-3 w-3 text-[#777C77]" />
                              Profile
                            </Link>
                            <button
                              type="button"
                              onClick={() => setGuestToDelete(guest)}
                              className="inline-flex items-center rounded-lg border border-[#E8E6DF] bg-white p-1 text-[#959A95] hover:text-[#B33A3A] hover:border-[#E8A5A5] hover:bg-[#FDF2F2] transition-colors"
                              title="Delete guest record"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
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
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className="h-4 w-4 text-[#B69A65]" />
              <h2 className="text-sm font-semibold text-[#202923]">Recent Visited</h2>
              <span className="rounded-full bg-[#FEF7ED] border border-[#FBE0B9] px-2 py-0.5 text-[11px] font-semibold text-[#A66719]">
                {recentVisitedGuests.length} Visited
              </span>
              {selectedDate && (
                <span className="rounded-full bg-[#FDF9EE] border border-[#F3E4BF] px-2 py-0.5 text-[10px] font-bold text-[#8F6F2E]">
                  {formatDate(selectedDate)}
                </span>
              )}
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
                          <button
                            type="button"
                            onClick={() => setQuickStayGuest(guest)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#202923] text-white px-2.5 py-1 text-[10px] font-semibold hover:bg-[#161D19] transition-all shadow-xs"
                          >
                            <KeyRound className="h-2.5 w-2.5 text-[#B69A65]" />
                            Confirm Stay
                          </button>
                        )}
                        <Link
                          href={`/guests/${guest.id}`}
                          className="rounded-lg border border-[#E8E6DF] px-2 py-0.5 text-[10px] font-medium text-[#202923]"
                        >
                          Profile →
                        </Link>
                        <button
                          type="button"
                          onClick={() => setGuestToDelete(guest)}
                          className="rounded-lg border border-[#E8E6DF] p-1 text-[#959A95] hover:text-[#B33A3A] hover:bg-[#FDF2F2]"
                          title="Delete guest"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
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
                              <button
                                type="button"
                                onClick={() => setQuickStayGuest(guest)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#B69A65] bg-[#FDF9EE] px-2.5 py-1 text-[11px] font-semibold text-[#8F6F2E] hover:bg-[#FBEFD9] transition-all shadow-2xs cursor-pointer"
                                title="Confirm Stay for returning guest"
                              >
                                <KeyRound className="h-3 w-3 text-[#B69A65]" />
                                Confirm Stay
                              </button>
                            )}
                            <Link
                              href={`/guests/${guest.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6DF] bg-white px-2 py-1 text-[11px] font-medium text-[#202923] hover:bg-[#FAF9F5] transition-colors"
                            >
                              <Eye className="h-3 w-3 text-[#777C77]" />
                              Profile
                            </Link>
                            <button
                              type="button"
                              onClick={() => setGuestToDelete(guest)}
                              className="inline-flex items-center rounded-lg border border-[#E8E6DF] bg-white p-1 text-[#959A95] hover:text-[#B33A3A] hover:border-[#E8A5A5] hover:bg-[#FDF2F2] transition-colors"
                              title="Delete guest record"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
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

      {/* Quick Stay Confirmation Modal */}
      <QuickStayConfirmModal
        isOpen={Boolean(quickStayGuest)}
        onClose={() => setQuickStayGuest(null)}
        guest={quickStayGuest}
        onSuccess={(reservationId, roomNumber) => {
          const gName = quickStayGuest?.fullName || 'Guest';
          setQuickStayGuest(null);
          setQuickSuccessAlert({
            guestName: gName,
            roomNumber,
            reservationId,
          });
        }}
      />

      {/* Confirmation Modal: Delete Individual Guest */}
      {guestToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202923]/60 backdrop-blur-[3px] animate-in fade-in"
          onClick={() => setGuestToDelete(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FDF2F2] text-[#B33A3A] flex items-center justify-center shrink-0 border border-[#FBE0B9]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#202923]">Delete Guest Profile?</h3>
                <p className="text-xs text-[#777C77]">This action cannot be undone</p>
              </div>
            </div>

            <div className="text-xs text-[#555E57] bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E8E6DF] space-y-1">
              <p>
                Are you sure you want to permanently delete <strong>{guestToDelete.fullName}</strong> ({guestToDelete.id})?
              </p>
              {guestToDelete.currentRoomNumber && (
                <p className="text-[#B33A3A] font-semibold pt-1">
                  ⚠️ Guest is currently checked into Room {guestToDelete.currentRoomNumber}. The room will be immediately set to Available.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setGuestToDelete(null)}
                className="rounded-xl border border-[#E8E6DF] px-4 py-2 text-xs font-semibold text-[#777C77] hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = deleteGuest(guestToDelete.id);
                  setGuestToDelete(null);
                  if (res.success) {
                    setFeedbackToast({ message: res.message, type: 'success' });
                    setTimeout(() => setFeedbackToast(null), 4000);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#B33A3A] px-4 py-2 text-xs font-bold text-white hover:bg-[#962A2A] transition-colors shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Wipe All Test Data for Customer Handover */}
      {isClearModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202923]/60 backdrop-blur-[3px] animate-in fade-in"
          onClick={() => setIsClearModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] p-6 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-[#FDF2F2] text-[#B33A3A] flex items-center justify-center shrink-0 border border-[#FBE0B9]">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#202923]">
                  Wipe All Test Data for Customer Handover
                </h3>
                <p className="text-xs text-[#777C77]">
                  Prepare the hotel system for clean, real client deployment
                </p>
              </div>
            </div>

            <div className="text-xs text-[#555E57] space-y-2.5 bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E6DF]">
              <p className="font-semibold text-[#202923]">
                This clean-slate operation will:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[#555E57]">
                <li>Permanently remove all <strong className="text-[#202923]">{guests.length} test guest profiles</strong>.</li>
                <li>Reset all hotel rooms to <strong className="text-[#2E6F4E]">Available</strong> (unoccupied &amp; ready).</li>
                <li>Clear all test check-in reservations, stay history, and folio records.</li>
                <li>Initialize a clean, fresh PMS database ready for your customer.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-[#E8E6DF] pt-4">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="rounded-xl border border-[#E8E6DF] px-4 py-2 text-xs font-semibold text-[#777C77] hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllTestData();
                  setIsClearModalOpen(false);
                  setFeedbackToast({
                    message: 'All test data has been cleared! System is clean and ready for your customer.',
                    type: 'success',
                  });
                  setTimeout(() => setFeedbackToast(null), 6000);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#B33A3A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#962A2A] transition-all shadow-md"
              >
                <Trash2 className="h-4 w-4" />
                Confirm &amp; Wipe All Test Data
              </button>
            </div>
          </div>
        </div>
      )}
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
