'use client';

import React, { useState, useEffect } from 'react';
import { useHotel } from '@/lib/data-store';
import { Guest, Room } from '@/types/hotel';
import {
  X,
  KeyRound,
  CheckCircle2,
  Calendar,
  CreditCard,
  BedDouble,
  ShieldCheck,
  User,
  Clock,
  ArrowRight,
  FolderOpen,
  Printer,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';

interface QuickStayConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onSuccess?: (reservationId: string, roomNumber: string) => void;
}

export function QuickStayConfirmModal({
  isOpen,
  onClose,
  guest,
  onSuccess,
}: QuickStayConfirmModalProps) {
  const { rooms, checkInGuest } = useHotel();

  // Calculate default dates (Today and Tomorrow)
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const availableRooms = rooms.filter((r) => r.status === 'Available');

  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(todayStr);
  const [checkOutDate, setCheckOutDate] = useState<string>(tomorrowStr);
  const [adults, setAdults] = useState<number>(2);
  const [keyCardCount, setKeyCardCount] = useState<number>(2);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash at Front Desk');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isIdentityVerified, setIsIdentityVerified] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{
    reservationId: string;
    roomNumber: string;
    roomType: string;
    guestName: string;
    nights: number;
    totalAmount: number;
  } | null>(null);

  // Initialize selected room when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccessInfo(null);
      setIsSubmitting(false);
      setCheckInDate(todayStr);
      setCheckOutDate(tomorrowStr);
      const avail = rooms.filter((r) => r.status === 'Available');
      if (avail.length > 0) {
        setSelectedRoomNumber(avail[0].roomNumber);
      } else {
        setSelectedRoomNumber('');
      }
    }
  }, [isOpen]);

  if (!isOpen || !guest) return null;

  const selectedRoom = rooms.find((r) => r.roomNumber === selectedRoomNumber);

  const nights = Math.max(
    1,
    Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000)
  ) || 1;

  const totalAmount = (selectedRoom?.pricePerNight || 1200) * nights;

  const handleConfirmStay = () => {
    const roomToAssign = selectedRoom || availableRooms.find((r) => r.roomNumber === selectedRoomNumber) || availableRooms[0];
    if (!guest || !roomToAssign) {
      alert('Please select an available room.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = checkInGuest({
        guestId: guest.id,
        roomNumber: roomToAssign.roomNumber,
        checkInDate,
        checkOutDate,
        adults,
        paymentMethod,
        depositAmount: totalAmount,
        identityVerified: isIdentityVerified,
        keyCardCount,
        specialRequests,
      });

      setIsSubmitting(false);

      if (res.success) {
        const resId = res.reservationId || `RSV-${Date.now().toString().slice(-4)}`;
        if (onSuccess) {
          onSuccess(resId, roomToAssign.roomNumber);
        }
        // Always close modal immediately upon successful check-in
        onClose();
      } else {
        alert('Check-In Notice: ' + res.message);
      }
    }, 200);
  };

  const handleOpenGuestFolder = async () => {
    try {
      await fetch('/api/open-guest-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guest.fullName,
          guestId: guest.id,
          frontImage: guest.document?.documentImageUrl,
          backImage: guest.document?.documentBackImageUrl,
        }),
      });
    } catch (e) {
      console.error('Error opening folder:', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202923]/60 backdrop-blur-[3px] overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202923] text-[#B69A65] shadow-xs">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#202923]">
                  Confirm Returning Guest Stay
                </h2>
                <span className="rounded-full bg-[#E8F5E9] border border-[#C8E8D7] px-2 py-0.5 text-[10px] font-bold text-[#2E6F4E]">
                  2nd+ Visit Check-In
                </span>
              </div>
              <p className="text-xs text-[#777C77]">
                Confirm guest stay • System will update in-house status &amp; record stay entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#959A95] hover:bg-[#E8E6DF]/50 hover:text-[#202923] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {successInfo ? (
          /* ================= SUCCESS CONFIRMATION VIEW ================= */
          <div className="p-6 text-center space-y-5">
            <div className="h-16 w-16 bg-[#E8F5E9] text-[#2E6F4E] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#E8F5E9]/50 animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-[#202923]">
                Stay Confirmed &amp; Entry Recorded!
              </h3>
              <p className="text-xs text-[#777C77] mt-1">
                {successInfo.guestName} is now officially checked in to Room {successInfo.roomNumber}.
              </p>
            </div>

            {/* Stay Receipt Summary Card */}
            <div className="rounded-xl border border-[#C8E8D7] bg-[#F4FBF7] p-4 text-xs max-w-md mx-auto text-left space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#C8E8D7]/60 pb-2">
                <span className="text-[#555E57] font-medium">Reservation / Stay ID:</span>
                <span className="font-mono font-bold text-[#202923]">{successInfo.reservationId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#555E57]">Allocated Room:</span>
                <span className="font-mono font-bold text-[#2E6F4E] text-sm">
                  Room {successInfo.roomNumber} ({successInfo.roomType})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#555E57]">Stay Duration:</span>
                <span className="font-medium text-[#202923]">
                  {formatDate(checkInDate)} — {formatDate(checkOutDate)} ({successInfo.nights} {successInfo.nights === 1 ? 'Night' : 'Nights'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#555E57]">Payment Guarantee:</span>
                <span className="font-medium text-[#202923]">{paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#C8E8D7]/60 pt-2 text-sm font-bold">
                <span className="text-[#202923]">Total Stay Amount:</span>
                <span className="text-[#8F6F2E]">{formatCurrency(successInfo.totalAmount)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenGuestFolder}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E6DF] bg-white px-3.5 py-2 text-xs font-semibold text-[#202923] hover:bg-[#FAF9F6] transition-colors shadow-2xs"
              >
                <FolderOpen className="h-4 w-4 text-[#B69A65]" />
                Open Guest Folder
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#202923] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#161D19] transition-all"
              >
                Done / View Profile
              </button>
            </div>
          </div>
        ) : (
          /* ================= FORM ENTRY VIEW ================= */
          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. Guest Profile Summary (Pre-verified) */}
            <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 rounded-xl bg-[#202923] text-white overflow-hidden shrink-0 border border-[#D9D6CC] flex items-center justify-center font-serif text-lg font-bold">
                  {guest.avatarUrl ? (
                    <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{guest.firstName[0]}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif text-base font-semibold text-[#202923] truncate">
                      {guest.fullName}
                    </span>
                    <span className="font-mono text-[10px] text-[#777C77] bg-white px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                      {guest.id}
                    </span>
                    <StatusBadge status={guest.tier} type="tier" size="sm" />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[#777C77] flex-wrap">
                    <span className="font-mono">{guest.phoneMasked}</span>
                    <span>•</span>
                    <span>{guest.city}, {guest.country}</span>
                    <span>•</span>
                    <span className="font-medium text-[#8F6F2E]">
                      {guest.totalStays} {guest.totalStays === 1 ? 'Previous Stay' : 'Previous Stays'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ID Proof Verified Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-[#E8E6DF] pt-2 sm:pt-0 sm:pl-4 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2E6F4E] bg-[#E8F5E9] px-2.5 py-1 rounded-md border border-[#C8E8D7]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>ID On Record</span>
                </div>
                <span className="text-[10px] text-[#777C77] mt-1">
                  {guest.document?.type || 'Aadhaar Card'} • {guest.document?.documentNumberMasked || '•••• 9821'}
                </span>
              </div>
            </div>

            {/* 2. Room Inventory Allocation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#202923] flex items-center gap-1.5">
                  <BedDouble className="h-3.5 w-3.5 text-[#B69A65]" />
                  Select Available Room / Suite *
                </label>
                <span className="text-[11px] text-[#2E6F4E] font-medium">
                  {availableRooms.length} room{availableRooms.length === 1 ? '' : 's'} ready
                </span>
              </div>

              {availableRooms.length === 0 ? (
                <div className="rounded-xl border border-[#FBE0B9] bg-[#FEF7ED] p-3.5 text-center text-xs text-[#A66719]">
                  <strong>All rooms are currently occupied or being cleaned.</strong> Please mark a room as Available first in Room Inventory.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {availableRooms.map((room) => {
                    const isSelected = selectedRoomNumber === room.roomNumber;
                    return (
                      <button
                        key={room.roomNumber}
                        type="button"
                        onClick={() => setSelectedRoomNumber(room.roomNumber)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#B69A65] bg-[#FDF9EE] ring-2 ring-[#B69A65] shadow-xs'
                            : 'border-[#E8E6DF] bg-white hover:border-[#D6D2C4] hover:bg-[#FAF9F5]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-[#202923]">
                            Room {room.roomNumber}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              room.type === 'Non AC'
                                ? 'bg-[#F2EFE8] text-[#777C77]'
                                : 'bg-[#E3EFE9] text-[#235F42]'
                            }`}
                          >
                            {room.type}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          <span className="text-[#777C77]">Floor {room.floor}</span>
                          <span className="font-semibold text-[#8F6F2E]">
                            {formatCurrency(room.pricePerNight)}/nt
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Dates & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#202923] mb-1">
                  Check-In Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-[#202923] focus:border-[#B69A65] focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#E8F5E9] text-[#2E6F4E] text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Today
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202923] mb-1">
                  Expected Check-Out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  min={checkInDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-[#202923] focus:border-[#B69A65] focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Stay Parameters: Adults, Keycards, Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-[#202923] mb-1">Total Guests</label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults (Extra Bed)</option>
                  <option value={4}>4 Adults / Family</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#202923] mb-1">Keycards Issued</label>
                <select
                  value={keyCardCount}
                  onChange={(e) => setKeyCardCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
                >
                  <option value={1}>1 Keycard</option>
                  <option value={2}>2 Keycards</option>
                  <option value={3}>3 Keycards</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#202923] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3 py-2 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none font-medium"
                >
                  <option value="Cash at Front Desk">Cash at Counter</option>
                  <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
                  <option value="Credit Card (HDFC Infinia)">Credit Card (POS)</option>
                  <option value="NEFT / RTGS">Bank Transfer / NEFT</option>
                  <option value="Corporate Account">Corporate Account</option>
                </select>
              </div>
            </div>

            {/* 5. Special Requests or Notes (Optional) */}
            <div>
              <label className="block text-xs font-medium text-[#202923] mb-1">
                Special Requests / Notes (Optional)
              </label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Extra blanket, late checkout requested, business visit..."
                className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3.5 py-2 text-xs text-[#202923] placeholder-[#959A95] focus:border-[#B69A65] focus:outline-none"
              />
            </div>

            {/* 6. Estimated Bill Summary Banner */}
            <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-3.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[#777C77]">Stay Calculation:</span>
                <p className="font-medium text-[#202923]">
                  {nights} {nights === 1 ? 'Night' : 'Nights'} × {formatCurrency(selectedRoom?.pricePerNight || 1200)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#777C77] block">Total Estimated Folio</span>
                <span className="font-serif text-lg font-bold text-[#8F6F2E]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Receptionist verification checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isIdentityVerified}
                onChange={(e) => setIsIdentityVerified(e.target.checked)}
                className="rounded text-[#B69A65] focus:ring-[#B69A65]"
              />
              <span className="text-xs text-[#555E57]">
                Receptionist verified guest identity matches previous recorded documents ({guest.document?.type || 'Aadhaar'}).
              </span>
            </label>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-[#E8E6DF] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E8E6DF] px-4 py-2 text-xs font-semibold text-[#777C77] hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedRoomNumber || isSubmitting || availableRooms.length === 0}
                onClick={handleConfirmStay}
                className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#161D19] transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recording Stay...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 text-[#B69A65] group-hover:scale-110 transition-transform" />
                    <span>Confirm Stay &amp; Check In</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
