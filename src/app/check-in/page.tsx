'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { GuestRegistrationModal } from '@/components/ui/GuestRegistrationModal';
import {
  KeyRound,
  LogOut,
  Search,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  BedDouble,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  User,
  UserPlus,
  Printer,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Guest, Room } from '@/types/hotel';

function CheckInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    guests,
    rooms,
    reservations,
    checkInGuest,
    checkOutGuest,
    updateRoomStatus,
  } = useHotel();

  // Active Main Tab: 'check-in' vs 'check-out'
  const [activeTab, setActiveTab] = useState<'check-in' | 'check-out'>('check-in');

  // Check-In Wizard Step (1: Guest, 2: Document/Review, 3: Room, 4: Confirm)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [guestSearch, setGuestSearch] = useState<string>('');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('');
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [checkInDate, setCheckInDate] = useState<string>('2026-10-22');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-10-26');
  const [keyCardCount, setKeyCardCount] = useState<number>(2);
  const [paymentMethod, setPaymentMethod] = useState<string>('Credit Card (Amex Black)');
  const [isIdentityVerified, setIsIdentityVerified] = useState<boolean>(true);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Processing & Success State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    reservationId?: string;
  } | null>(null);

  // Check-Out State
  const [checkoutRoom, setCheckoutRoom] = useState<Room | null>(null);
  const [checkoutConfirmed, setCheckoutConfirmed] = useState<boolean>(false);

  // Auto-select guest or room from query params
  useEffect(() => {
    const qGuest = searchParams.get('guestId');
    const qRoom = searchParams.get('roomNumber');
    if (qGuest) {
      setSelectedGuestId(qGuest);
      setStep(2);
    }
    if (qRoom) {
      setSelectedRoomNumber(qRoom);
    }
  }, [searchParams]);

  const selectedGuest = guests.find((g) => g.id === selectedGuestId);
  const availableRooms = rooms.filter((r) => r.status === 'Available');
  const selectedRoom = rooms.find((r) => r.roomNumber === selectedRoomNumber);
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied');

  // Filter guests for step 1
  const searchResults = guests.filter((g) => {
    if (!guestSearch.trim()) return true;
    const q = guestSearch.toLowerCase();
    const cleanNum = q.replace(/\D/g, '');
    return (
      g.fullName.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q) ||
      g.city.toLowerCase().includes(q) ||
      (cleanNum.length >= 3 && g.phone.replace(/\D/g, '').includes(cleanNum))
    );
  });

  // Calculate nights
  const nights = Math.max(
    1,
    Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000)
  ) || 4;

  const estimatedTotal = (selectedRoom?.pricePerNight || 600) * nights;

  // Handle final check-in confirmation
  const handleConfirmCheckIn = () => {
    if (!selectedGuest || !selectedRoom) return;

    setIsProcessing(true);
    setTimeout(() => {
      const result = checkInGuest({
        guestId: selectedGuest.id,
        roomNumber: selectedRoom.roomNumber,
        checkInDate,
        checkOutDate,
        adults: 2,
        paymentMethod,
        depositAmount: estimatedTotal,
        identityVerified: isIdentityVerified,
        keyCardCount,
        specialRequests,
      });

      setCheckInResult(result);
      setIsProcessing(false);
      setStep(5); // Success confirmation step
    }, 500);
  };

  // Handle Check-Out
  const handlePerformCheckOut = (room: Room) => {
    setCheckoutRoom(room);
    const result = checkOutGuest(room.roomNumber, 'Standard departure turnover');
    if (result.success) {
      setCheckoutConfirmed(true);
    }
  };

  const resetWizard = () => {
    setSelectedGuestId('');
    setSelectedRoomNumber('');
    setGuestSearch('');
    setCheckInResult(null);
    setStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6DF] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#202923]">
            Front Desk Check-In & Check-Out Hub
          </h1>
          <p className="mt-1 text-xs text-[#777C77]">
            Streamlined returning guest room assignment, identity verification, and folio settlement
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-[#E8E6DF] bg-white p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('check-in')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'check-in'
                ? 'bg-[#202923] text-white shadow-xs font-semibold'
                : 'text-[#777C77] hover:text-[#202923]'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-[#B69A65]" />
            Returning Guest Check-In
          </button>
          <button
            onClick={() => setActiveTab('check-out')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              activeTab === 'check-out'
                ? 'bg-[#202923] text-white shadow-xs font-semibold'
                : 'text-[#777C77] hover:text-[#202923]'
            }`}
          >
            <LogOut className="h-3.5 w-3.5" />
            Check-Out Hub ({occupiedRooms.length})
          </button>
        </div>
      </div>

      {activeTab === 'check-in' ? (
        /* ================= CHECK-IN WIZARD ================= */
        <div className="space-y-6">
          {/* Step Indicator Header (Steps 1 to 4) */}
          {step < 5 && (
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-4 shadow-xs">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { num: 1, label: 'Select Guest', desc: 'Find returning patron' },
                  { num: 2, label: 'Verify Identity', desc: 'Review preferences' },
                  { num: 3, label: 'Allocate Suite', desc: 'Select room' },
                  { num: 4, label: 'Issue Keycards', desc: 'Confirm check-in' },
                ].map(({ num, label, desc }) => {
                  const isCurrent = step === num;
                  const isDone = step > num;

                  return (
                    <div
                      key={num}
                      className={`flex flex-col border-t-2 pt-2 transition-colors ${
                        isCurrent
                          ? 'border-[#B69A65]'
                          : isDone
                          ? 'border-[#2E6F4E]'
                          : 'border-[#E8E6DF]'
                      }`}
                    >
                      <span
                        className={`text-[11px] font-bold ${
                          isCurrent
                            ? 'text-[#8F6F2E]'
                            : isDone
                            ? 'text-[#235F42]'
                            : 'text-[#959A95]'
                        }`}
                      >
                        Step 0{num}
                      </span>
                      <span className="font-semibold text-xs text-[#202923] mt-0.5 truncate">
                        {label}
                      </span>
                      <span className="text-[10px] text-[#777C77] hidden sm:block">
                        {desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1: Search and Select Returning Guest */}
          {step === 1 && (
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#202923]">1. Select Returning Guest</h3>
                  <p className="text-xs text-[#777C77]">
                    Instant lookup by name, phone number, or guest ID.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3.5 py-1.5 text-xs font-semibold text-[#202923] hover:bg-white hover:border-[#B69A65] shadow-2xs transition-colors shrink-0"
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#B69A65]" />
                  + Register New Guest
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B69A65]" />
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Type guest name, phone digits, or ID..."
                  className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#202923] placeholder-[#959A95] focus:border-[#B69A65] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="divide-y divide-[#E8E6DF]/60 max-h-96 overflow-y-auto rounded-xl border border-[#E8E6DF]">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center bg-[#FAF9F6] rounded-xl">
                    <User className="h-8 w-8 text-[#959A95] mx-auto mb-2" />
                    <p className="text-xs font-semibold text-[#202923]">No registered guest matches &ldquo;{guestSearch}&rdquo;</p>
                    <p className="text-[11px] text-[#777C77] mt-0.5">Please check spelling or register this patron as a new guest.</p>
                    <button
                      type="button"
                      onClick={() => setIsRegisterOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#202923] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19]"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-[#B69A65]" /> Register New Guest
                    </button>
                  </div>
                ) : (
                  searchResults.map((guest) => {
                    const isOccupied = Boolean(guest.currentRoomNumber);

                    return (
                      <div
                        key={guest.id}
                        onClick={() => {
                          if (!isOccupied) {
                            setSelectedGuestId(guest.id);
                            setStep(2);
                          }
                        }}
                        className={`flex items-center justify-between p-3.5 transition-colors ${
                          isOccupied
                            ? 'opacity-60 bg-[#FAF9F6] cursor-not-allowed'
                            : 'hover:bg-[#FAF9F5] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-[#E8E6DF] overflow-hidden shrink-0 border border-[#D9D6CC] flex items-center justify-center font-bold text-xs text-[#202923]">
                            {guest.avatarUrl ? (
                              <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
                            ) : (
                              <span>{guest.firstName[0]}{guest.lastName[0]}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#202923]">{guest.fullName}</span>
                              <span className="font-mono text-[10px] text-[#777C77] bg-white px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                                {guest.id}
                              </span>
                              <StatusBadge status={guest.tier} type="tier" size="sm" />
                            </div>

                            <div className="mt-1 flex items-center gap-3 text-xs text-[#777C77]">
                              <span className="font-mono">{guest.phoneMasked}</span>
                              <span>•</span>
                              <span>{guest.city}, {guest.country}</span>
                              <span>•</span>
                              <span className="font-medium text-[#202923]">
                                {guest.totalStays} {guest.totalStays === 1 ? 'Stay' : 'Stays'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isOccupied ? (
                            <span className="text-[11px] font-semibold text-[#214366] bg-[#EFF5FB] px-2 py-1 rounded-md border border-[#CBDFF2]">
                              Already In Room {guest.currentRoomNumber}
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#202923] px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-[#161D19]"
                            >
                              Select Guest <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Review Profile & Verify Identity Document */}
          {step === 2 && selectedGuest && (
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#202923]">2. Review Identity & VIP Preferences</h3>
                  <p className="text-xs text-[#777C77]">
                    Confirm identity compliance and hospitality requirements for {selectedGuest.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#777C77] hover:text-[#202923] flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Change Guest
                </button>
              </div>

              {/* Guest Summary Card */}
              <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#202923] text-white flex items-center justify-center font-serif text-lg font-bold">
                    {selectedGuest.firstName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-medium text-[#202923]">
                        {selectedGuest.fullName}
                      </span>
                      <StatusBadge status={selectedGuest.tier} type="tier" size="sm" />
                    </div>
                    <p className="text-xs text-[#777C77]">
                      {selectedGuest.city}, {selectedGuest.country} • {selectedGuest.email}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#777C77]">Total Recorded Stays</span>
                  <p className="font-serif text-lg font-bold text-[#8F6F2E]">
                    {selectedGuest.totalStays} Stays ({selectedGuest.totalNights} nights)
                  </p>
                </div>
              </div>

              {/* Document Check */}
              <div className="rounded-xl border border-[#E8E6DF] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#2E6F4E]" />
                    <span className="text-xs font-semibold text-[#202923]">Identity Document on Record</span>
                  </div>
                  <StatusBadge status={selectedGuest.document?.status || 'Verified'} type="verification" size="sm" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF9F6] p-3 rounded-lg border border-[#E8E6DF]/60">
                  <div>
                    <span className="text-[#777C77] block text-[10px] uppercase">Type</span>
                    <span className="font-medium text-[#202923]">{selectedGuest.document?.type || 'Passport'}</span>
                  </div>
                  <div>
                    <span className="text-[#777C77] block text-[10px] uppercase">Masked Document #</span>
                    <span className="font-mono text-[#202923]">
                      {selectedGuest.document?.documentNumberMasked || '•••• 8492'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#777C77] block text-[10px] uppercase">Issuing Country</span>
                    <span className="text-[#202923]">{selectedGuest.document?.issuingCountry || selectedGuest.country}</span>
                  </div>
                  <div>
                    <span className="text-[#777C77] block text-[10px] uppercase">Expiry</span>
                    <span className="text-[#202923]">
                      {formatDate(selectedGuest.document?.expiryDate || '2030-12-31')}
                    </span>
                  </div>
                </div>

                {/* ID Proof Photo Display */}
                <div className="pt-2 border-t border-[#E8E6DF]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#202923]">
                      Customer ID Proof Photo on File:
                    </span>
                    <span className="text-[10px] text-[#2E6F4E] font-medium bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                      ✓ Supabase Live Archive
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedGuest.document?.documentImageUrl ? (
                      <div className="rounded-lg overflow-hidden border border-[#E8E6DF] bg-white h-24 relative shadow-xs">
                        <img
                          src={selectedGuest.document.documentImageUrl}
                          alt="ID Front"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.2 rounded font-medium">
                          Front Side
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#E8E6DF] h-24 flex items-center justify-center text-[10px] text-[#959A95]">
                        No Front Photo
                      </div>
                    )}
                    {selectedGuest.document?.documentBackImageUrl ? (
                      <div className="rounded-lg overflow-hidden border border-[#E8E6DF] bg-white h-24 relative shadow-xs">
                        <img
                          src={selectedGuest.document.documentBackImageUrl}
                          alt="ID Back"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.2 rounded font-medium">
                          Back Side
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-[#E8E6DF] h-24 flex items-center justify-center text-[10px] text-[#959A95]">
                        No Back Photo
                      </div>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isIdentityVerified}
                    onChange={(e) => setIsIdentityVerified(e.target.checked)}
                    className="rounded text-[#B69A65] focus:ring-[#B69A65]"
                  />
                  <span className="text-xs font-medium text-[#202923]">
                    Receptionist confirms identity document verified with physical Aadhaar / PAN / Photo ID
                  </span>
                </label>
              </div>

              {/* Preferences Checklist */}
              <div className="rounded-xl border border-[#E8E6DF] p-4 text-xs space-y-2">
                <span className="font-semibold text-[#202923] block">Pre-Arrival Amenities & Preferences</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#777C77]">
                  <p>• Climate Target: <strong className="text-[#202923]">{selectedGuest.preferences.roomTemperature || '21.0°C'}</strong></p>
                  <p>• Pillow Selection: <strong className="text-[#202923]">{selectedGuest.preferences.pillowType || 'Hypoallergenic Feather'}</strong></p>
                  <p>• Floor Preference: <strong className="text-[#202923]">{selectedGuest.preferences.floorPreference || 'High Floor'}</strong></p>
                  <p>• Welcome Amenity: <strong className="text-[#8F6F2E]">{selectedGuest.preferences.welcomeAmenity || 'Dom Pérignon 2013 & Caviar'}</strong></p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E6DF]">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-[#E8E6DF] px-4 py-2 text-xs font-medium text-[#777C77] hover:bg-[#FAF9F5]"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#202923] px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19]"
                >
                  Proceed to Room Selection <ArrowRight className="h-3 w-3 text-[#B69A65]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Available Suite */}
          {step === 3 && (
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#202923]">3. Allocate Suite or Villa</h3>
                  <p className="text-xs text-[#777C77]">
                    Select an inspected room from available inventory ({availableRooms.length} ready)
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#777C77] hover:text-[#202923] flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Review
                </button>
              </div>

              {availableRooms.length === 0 ? (
                <EmptyState
                  title="No suites currently available"
                  description="All rooms are currently occupied or undergoing cleaning turnover."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRooms.map((room) => {
                    const isSelected = selectedRoomNumber === room.roomNumber;

                    return (
                      <div
                        key={room.roomNumber}
                        onClick={() => setSelectedRoomNumber(room.roomNumber)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#B69A65] bg-[#FDF9EE]/60 ring-1 ring-[#B69A65] shadow-sm'
                            : 'border-[#E8E6DF] bg-white hover:border-[#D6D2C4] hover:bg-[#FAF9F5]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-base font-bold text-[#202923]">
                              Room {room.roomNumber}
                            </span>
                            <span className="font-serif text-sm font-semibold text-[#8F6F2E]">
                              {formatCurrency(room.pricePerNight)} / night
                            </span>
                          </div>
                          <h4 className="font-medium text-xs text-[#202923] mt-0.5">{room.type}</h4>
                          <p className="text-[11px] text-[#777C77] mt-1">
                            Floor {room.floor} • {room.view} • {room.squareMeters} m²
                          </p>

                          <div className="mt-2.5 flex gap-1 flex-wrap">
                            {room.amenities.slice(0, 2).map((a, i) => (
                              <span
                                key={i}
                                className="rounded bg-[#FAF9F6] border border-[#E8E6DF] px-1.5 py-0.2 text-[10px] text-[#777C77]"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-2 border-t border-[#E8E6DF]/60 flex items-center justify-between text-xs">
                          <span className="text-[#2E6F4E] flex items-center gap-1 font-medium text-[11px]">
                            <CheckCircle2 className="h-3 w-3" /> Inspected & Ready
                          </span>
                          <span
                            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                              isSelected
                                ? 'bg-[#202923] text-white'
                                : 'bg-[#FAF9F6] text-[#777C77] border border-[#E8E6DF]'
                            }`}
                          >
                            {isSelected ? 'Selected ✓' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E6DF]">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-[#E8E6DF] px-4 py-2 text-xs font-medium text-[#777C77] hover:bg-[#FAF9F5]"
                >
                  Back
                </button>
                <button
                  disabled={!selectedRoomNumber}
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#202923] px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] disabled:opacity-40"
                >
                  Continue to Keycards & Dates <ArrowRight className="h-3 w-3 text-[#B69A65]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm Dates, Payment Guarantee & Issue Keycards */}
          {step === 4 && selectedGuest && selectedRoom && (
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8E6DF] pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#202923]">4. Final Stay Confirmation</h3>
                  <p className="text-xs text-[#777C77]">
                    Confirm stay duration, keycard programming, and complete check-in
                  </p>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="text-xs text-[#777C77] hover:text-[#202923] flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              </div>

              {/* Summary Bill & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-4 text-xs space-y-3">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#777C77] block">
                    Room & Guest Allocation
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[#777C77]">Guest:</span>
                    <span className="font-semibold text-[#202923]">{selectedGuest.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#777C77]">Allocated Room:</span>
                    <span className="font-mono font-bold text-[#202923]">Room {selectedRoom.roomNumber} ({selectedRoom.type})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#777C77]">Rate per night:</span>
                    <span className="font-serif font-medium text-[#8F6F2E]">{formatCurrency(selectedRoom.pricePerNight)}</span>
                  </div>
                  <div className="border-t border-[#E8E6DF] pt-2 flex items-center justify-between text-sm font-bold text-[#202923]">
                    <span>Total Stay ({nights} Nights):</span>
                    <span className="text-[#8F6F2E] text-base">{formatCurrency(estimatedTotal)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#202923] mb-1">Stay Dates</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="rounded-lg border border-[#E8E6DF] px-3 py-1.5 text-xs text-[#202923]"
                      />
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="rounded-lg border border-[#E8E6DF] px-3 py-1.5 text-xs text-[#202923]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202923] mb-1">Payment Method / Folio</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-[#E8E6DF] bg-white px-3 py-1.5 text-xs text-[#202923]"
                    >
                      <option value="UPI (GPay / PhonePe / Paytm)">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="RuPay Platinum Elite">RuPay Platinum / Select Card</option>
                      <option value="HDFC / ICICI Diners Black">HDFC / ICICI Diners &amp; Infinia Card</option>
                      <option value="NetBanking (SBI / HDFC / ICICI)">NetBanking (SBI / HDFC / ICICI / Kotak)</option>
                      <option value="Corporate Bill to Company">Corporate Bill to Company (GST Invoice)</option>
                      <option value="Cash at Reception">Cash Deposit at Reception (INR ₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#202923] mb-1">
                      RFID Keycards to Program & Issue
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setKeyCardCount(num)}
                          className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-all ${
                            keyCardCount === num
                              ? 'border-[#202923] bg-[#202923] text-white shadow-xs'
                              : 'border-[#E8E6DF] bg-white text-[#777C77] hover:bg-[#FAF9F5]'
                          }`}
                        >
                          {num} {num === 1 ? 'Key' : 'Keys'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Concierge Instructions */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">
                  Arrival Concierge Notes / Requests
                </label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Escort to suite, iced sparkling water, champagne delivery"
                  className="w-full rounded-lg border border-[#E8E6DF] px-3 py-2 text-xs focus:border-[#B69A65] focus:outline-none"
                />
              </div>

              {/* Final Confirm Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E6DF]">
                <button
                  onClick={() => setStep(3)}
                  className="rounded-lg border border-[#E8E6DF] px-4 py-2 text-xs font-medium text-[#777C77] hover:bg-[#FAF9F5]"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-6 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-[#161D19] transition-all disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4 text-[#B69A65]" />
                  {isProcessing ? 'Issuing Keycards & Recording...' : 'Confirm Check-In & Issue Keys'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Luxury Confirmation & Keycard Receipt Screen */}
          {step === 5 && checkInResult && selectedGuest && selectedRoom && (
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-8 text-center max-w-2xl mx-auto shadow-lg animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF7F2] text-[#2E6F4E] border border-[#C8E8D7]">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <h2 className="font-serif text-2xl font-medium text-[#202923]">
                Check-In Completed Successfully
              </h2>
              <p className="mt-1 text-xs text-[#777C77]">
                Guest <strong className="text-[#202923]">{selectedGuest.fullName}</strong> is officially checked into{' '}
                <strong className="text-[#202923]">Room {selectedRoom.roomNumber}</strong>.
              </p>

              {/* Printable Guest Registration Card */}
              <div className="my-6 rounded-2xl border border-[#E8DEC8] bg-[#FDFBF7] p-6 text-left shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3 mb-4">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#202923] uppercase tracking-wider">
                      The Grand Aurelia • Guest Access Pass
                    </h4>
                    <p className="text-[10px] text-[#777C77]">Monaco Luxury Hospitality PMS</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#8F6F2E]">
                    Ref: {checkInResult.reservationId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#959A95] text-[10px] uppercase block">Guest Name</span>
                    <span className="font-semibold text-[#202923] text-sm">{selectedGuest.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#959A95] text-[10px] uppercase block">Assigned Suite</span>
                    <span className="font-mono font-bold text-[#202923] text-base">
                      Room {selectedRoom.roomNumber} ({selectedRoom.type})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#959A95] text-[10px] uppercase block">Stay Dates</span>
                    <span className="text-[#202923] font-medium">
                      {formatDate(checkInDate)} — {formatDate(checkOutDate)} ({nights} Nights)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#959A95] text-[10px] uppercase block">Keycards Programmed</span>
                    <span className="text-[#2E6F4E] font-medium">
                      {keyCardCount} High-Security RFID Keys Active
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DEC8] flex items-center justify-between text-[11px] text-[#777C77]">
                  <span>WiFi: Aurelia-Patron (Access Code: In-Suite)</span>
                  <span>Concierge Service: Dial 0</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E6DF] bg-white px-4 py-2 text-xs font-medium text-[#202923] hover:bg-[#FAF9F5]"
                >
                  <Printer className="h-4 w-4 text-[#777C77]" />
                  Print Registration Card
                </button>
                <button
                  onClick={resetWizard}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#202923] px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19]"
                >
                  Done & New Check-In
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= CHECK-OUT HUB ================= */
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#202923]">Currently Occupied Rooms & Scheduled Departures</h3>
                <p className="text-xs text-[#777C77]">
                  Review folios, process guest departure, and flag room for housekeeping turnover
                </p>
              </div>
              <span className="rounded-full bg-[#EFF5FB] border border-[#CBDFF2] px-3 py-1 text-xs font-semibold text-[#214366]">
                {occupiedRooms.length} Active Stays
              </span>
            </div>

            {occupiedRooms.length === 0 ? (
              <EmptyState
                title="No rooms currently occupied"
                description="All rooms are available or in cleaning turnover."
              />
            ) : (
              <div className="divide-y divide-[#E8E6DF]/60">
                {occupiedRooms.map((room) => {
                  const checkOutDateFormatted = formatDate(room.currentStayCheckOut || '2026-10-23');
                  const isTodayDeparture = room.currentStayCheckOut === '2026-10-22';

                  return (
                    <div
                      key={room.roomNumber}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-[#FAF9F5] transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-base font-bold text-[#202923]">
                            Room {room.roomNumber}
                          </span>
                          <span className="font-semibold text-sm text-[#202923]">
                            {room.currentGuestName}
                          </span>
                          {isTodayDeparture && (
                            <span className="rounded-full bg-[#FEF7ED] border border-[#FBE0B9] px-2 py-0.5 text-[10px] font-bold text-[#A66719]">
                              Departure Due Today
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-xs text-[#777C77] flex-wrap">
                          <span>{room.type}</span>
                          <span>•</span>
                          <span>Rate: {formatCurrency(room.pricePerNight)} / night</span>
                          <span>•</span>
                          <span>Checked-in: {formatDate(room.currentStayCheckIn || '')}</span>
                          <span>•</span>
                          <span>Departure: <strong>{checkOutDateFormatted}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => handlePerformCheckOut(room)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#B33A3A] bg-white px-3.5 py-1.5 text-xs font-medium text-[#B33A3A] hover:bg-[#FDF2F2] transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Process Check-Out
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checkout Completed Toast / Card */}
          {checkoutConfirmed && checkoutRoom && (
            <div className="rounded-2xl border border-[#C8E8D7] bg-[#EDF7F2] p-5 text-xs text-[#235F42] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#2E6F4E] shrink-0" />
                <div>
                  <p className="font-bold text-sm">Check-Out Completed for Room {checkoutRoom.roomNumber}</p>
                  <p className="mt-0.5 text-[#235F42]">
                    Folio settled. Room has been immediately set to &ldquo;Cleaning&rdquo; status for Housekeeping turnover.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCheckoutConfirmed(false)}
                className="rounded-lg bg-white border border-[#C8E8D7] px-3 py-1 font-medium text-[#235F42] hover:bg-[#FAF9F6]"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guest Registration Modal */}
      <GuestRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onGuestCreated={(newId) => {
          setSelectedGuestId(newId);
          setStep(2);
        }}
      />
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse bg-white rounded-2xl" />}>
      <CheckInContent />
    </Suspense>
  );
}
