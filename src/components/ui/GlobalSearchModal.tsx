'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { StatusBadge } from './StatusBadge';
import { QuickStayConfirmModal } from './QuickStayConfirmModal';
import { Search, X, User, ArrowRight, ShieldCheck, Calendar, MapPin, KeyRound } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Guest } from '@/types/hotel';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuestForCheckIn?: (guest: Guest) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectGuestForCheckIn,
}: GlobalSearchModalProps) {
  const router = useRouter();
  const { guests } = useHotel();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quickStayGuest, setQuickStayGuest] = useState<Guest | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuickStayGuest(null);
    } else {
      setQuery('');
      setQuickStayGuest(null);
    }
  }, [isOpen]);

  // Fast multi-field filtering
  const filteredGuests = useMemo(() => {
    if (!query.trim()) {
      return guests.slice(0, 5); // Show recent VIPs/frequent guests by default
    }

    const q = query.toLowerCase().trim();
    const cleanNumbers = q.replace(/\D/g, '');

    return guests.filter((guest) => {
      const matchName = guest.fullName.toLowerCase().includes(q);
      const matchId = guest.id.toLowerCase().includes(q);
      const matchCity = guest.city.toLowerCase().includes(q);
      const matchCountry = guest.country.toLowerCase().includes(q);
      const matchEmail = guest.email.toLowerCase().includes(q);
      const matchVip = guest.tier.toLowerCase().includes(q);
      const matchRoom = guest.currentRoomNumber?.toLowerCase() === q;

      // Phone matching
      let matchPhone = false;
      if (cleanNumbers.length >= 3) {
        const guestPhoneClean = guest.phone.replace(/\D/g, '');
        matchPhone = guestPhoneClean.includes(cleanNumbers);
      }

      return matchName || matchId || matchCity || matchCountry || matchEmail || matchVip || matchRoom || matchPhone;
    });
  }, [guests, query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredGuests.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && filteredGuests[selectedIndex]) {
      e.preventDefault();
      handleSelectGuest(filteredGuests[selectedIndex]);
    }
  };

  const handleSelectGuest = (guest: Guest) => {
    onClose();
    router.push(`/guests/${guest.id}`);
  };

  const handleQuickCheckIn = (e: React.MouseEvent, guest: Guest) => {
    e.stopPropagation();
    if (onSelectGuestForCheckIn) {
      onClose();
      onSelectGuestForCheckIn(guest);
    } else {
      setQuickStayGuest(guest);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#202923]/40 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-[#E8E6DF] px-4 py-3.5 bg-[#FAF9F6]">
          <Search className="h-5 w-5 text-[#B69A65] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search returning guests by name, mobile, guest ID (e.g. GST-8024), or city..."
            className="w-full bg-transparent text-sm sm:text-base text-[#202923] placeholder-[#959A95] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#959A95] hover:text-[#202923] hover:bg-[#E8E6DF]/50 transition-colors mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center rounded border border-[#E8E6DF] bg-white px-2 py-0.5 text-[11px] font-medium text-[#777C77]">
            ESC to close
          </span>
        </div>

        {/* Search Results Count & Quick Tips */}
        <div className="flex items-center justify-between px-5 py-2 bg-[#F7F6F2] text-[11px] text-[#777C77] border-b border-[#E8E6DF]">
          <span>
            {query.trim()
              ? `Found ${filteredGuests.length} matching guest record${filteredGuests.length === 1 ? '' : 's'}`
              : 'Recent frequent & returning guests'}
          </span>
          <span className="hidden sm:inline">Use ↑ ↓ arrows to navigate • Enter to view profile</span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#E8E6DF]/60 p-2">
          {filteredGuests.length === 0 ? (
            <div className="py-12 text-center px-4">
              <User className="mx-auto h-10 w-10 text-[#C6C2B4] mb-3" />
              <h4 className="text-sm font-medium text-[#202923]">No matching guest found</h4>
              <p className="mt-1 text-xs text-[#777C77] max-w-sm mx-auto">
                No guest matches &ldquo;{query}&rdquo;. Check spelling, phone digits, or register a new guest.
              </p>
              <button
                onClick={() => {
                  onClose();
                  router.push('/guests?action=new');
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#202923] px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#161D19]"
              >
                + Register New Guest
              </button>
            </div>
          ) : (
            filteredGuests.map((guest, idx) => {
              const isSelected = idx === selectedIndex;
              const hasStayedBefore = guest.totalStays > 0;

              return (
                <div
                  key={guest.id}
                  onClick={() => handleSelectGuest(guest)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'bg-[#F4F2EC] ring-1 ring-[#D6D2C4]' : 'hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-[#E8E6DF] border border-[#D9D6CC] flex items-center justify-center text-xs font-semibold text-[#202923]">
                        {guest.avatarUrl ? (
                          <img
                            src={guest.avatarUrl}
                            alt={guest.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{guest.firstName[0]}{guest.lastName[0]}</span>
                        )}
                      </div>
                      {guest.currentRoomNumber && (
                        <span
                          title={`Currently in Room ${guest.currentRoomNumber}`}
                          className="absolute -bottom-1 -right-1 flex h-4 px-1 items-center justify-center rounded-full bg-[#2A5580] text-[9px] font-bold text-white shadow-xs"
                        >
                          {guest.currentRoomNumber}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#202923] truncate">
                          {guest.fullName}
                        </span>
                        <span className="font-mono text-[11px] text-[#777C77] bg-white px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                          {guest.id}
                        </span>
                        <StatusBadge status={guest.tier} type="tier" size="sm" />
                      </div>

                      {/* Distinguishing Metadata */}
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#777C77] flex-wrap">
                        <span className="font-mono">{guest.phoneMasked}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#959A95]" />
                          {guest.city}, {guest.country}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-[#959A95]" />
                          Last stay: {formatDate(guest.lastVisitDate)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-[#202923]">
                          {guest.totalStays} {guest.totalStays === 1 ? 'stay' : 'stays'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <StatusBadge status={guest.verificationStatus} type="verification" size="sm" />

                    {!guest.currentRoomNumber && (
                      <button
                        onClick={(e) => handleQuickCheckIn(e, guest)}
                        title="Confirm stay for returning guest"
                        className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#B69A65] bg-[#FDF9EE] px-2.5 py-1 text-xs font-semibold text-[#8F6F2E] hover:bg-[#FBEFD9] transition-all shadow-2xs cursor-pointer"
                      >
                        <KeyRound className="h-3 w-3 text-[#B69A65]" />
                        Confirm Stay
                      </button>
                    )}

                    <span className="text-[#959A95] group-hover:text-[#202923] transition-colors p-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E8E6DF] bg-[#FAF9F6] px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-[#777C77]">
            <ShieldCheck className="h-4 w-4 text-[#2E6F4E]" />
            <span>Sensitive documents masked per luxury privacy standards</span>
          </div>

          <button
            onClick={() => {
              onClose();
              router.push('/guests');
            }}
            className="text-xs font-medium text-[#8F6F2E] hover:text-[#202923] transition-colors"
          >
            Open Full Guest Directory →
          </button>
        </div>
      </div>

      {/* Quick Stay Confirmation Modal */}
      <QuickStayConfirmModal
        isOpen={Boolean(quickStayGuest)}
        onClose={() => {
          setQuickStayGuest(null);
          onClose();
        }}
        guest={quickStayGuest}
        onSuccess={() => {
          if (quickStayGuest) {
            router.push(`/guests/${quickStayGuest.id}`);
          }
        }}
      />
    </div>
  );
}
