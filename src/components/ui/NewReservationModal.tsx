'use client';

import React, { useState } from 'react';
import { useHotel } from '@/lib/data-store';
import { Room } from '@/types/hotel';
import { X, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedGuestId?: string;
  preselectedRoomNumber?: string;
}

export function NewReservationModal({
  isOpen,
  onClose,
  preselectedGuestId,
  preselectedRoomNumber,
}: NewReservationModalProps) {
  const { guests, rooms, createReservation } = useHotel();

  const [guestId, setGuestId] = useState(preselectedGuestId || (guests[0]?.id ?? ''));
  const [roomNumber, setRoomNumber] = useState(preselectedRoomNumber || '101');
  const [checkInDate, setCheckInDate] = useState('2026-10-23');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-27');
  const [adults, setAdults] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card (Amex Black)' | 'Direct Wire' | 'Corporate Account' | 'Luxury Card' | 'Cash at Counter'>('Credit Card (Amex Black)');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState('');

  if (!isOpen) return null;

  const selectedGuest = guests.find((g) => g.id === guestId);
  const selectedRoom = rooms.find((r) => r.roomNumber === roomNumber);

  const nights = Math.max(
    1,
    Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000)
  ) || 4;

  const totalPrice = (selectedRoom?.pricePerNight || 750) * nights;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest || !selectedRoom) return;

    const res = createReservation({
      guestId: selectedGuest.id,
      guestName: selectedGuest.fullName,
      guestEmail: selectedGuest.email,
      guestPhoneMasked: selectedGuest.phoneMasked,
      roomNumber: selectedRoom.roomNumber,
      roomType: selectedRoom.type,
      checkInDate,
      checkOutDate,
      nights,
      adults,
      children: 0,
      totalPrice,
      paidAmount: totalPrice,
      status: 'Confirmed',
      specialRequests,
      paymentMethod,
    });

    setCreatedReservationId(res.id);
    setIsSuccess(true);
  };

  const handleFinish = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202923]/40 backdrop-blur-[2px] overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202923] text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#202923]">New Luxury Reservation</h2>
              <p className="text-xs text-[#777C77]">Create a confirmed booking with live room allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#959A95] hover:bg-[#E8E6DF]/50 hover:text-[#202923] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF7F2] text-[#2E6F4E] border border-[#C8E8D7]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-[#202923]">Reservation Confirmed</h3>
            <p className="mt-2 text-sm text-[#777C77] max-w-md mx-auto">
              Booking reference <span className="font-mono font-bold text-[#202923]">{createdReservationId}</span> has been confirmed for {selectedGuest?.fullName} in Room {selectedRoom?.roomNumber} ({selectedRoom?.type}).
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleFinish}
                className="rounded-lg bg-[#202923] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#161D19] transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Guest Selection */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Select Guest</label>
                <select
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E6DF] bg-white px-3 py-2 text-sm focus:border-[#B69A65] focus:ring-1 focus:ring-[#B69A65]"
                >
                  {guests.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.fullName} ({g.id}) • {g.tier} • {g.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Select Suite or Villa</label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full rounded-lg border border-[#E8E6DF] bg-white px-3 py-2 text-sm focus:border-[#B69A65] focus:ring-1 focus:ring-[#B69A65]"
                >
                  {rooms.map((r: Room) => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room {r.roomNumber} — {r.type} (${r.pricePerNight}/night) • Status: {r.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:border-[#B69A65] focus:ring-1 focus:ring-[#B69A65]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:border-[#B69A65] focus:ring-1 focus:ring-[#B69A65]"
                  />
                </div>
              </div>

              {/* Adults & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:border-[#B69A65] focus:ring-1 focus:ring-[#B69A65]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Payment Guarantee</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-lg border border-[#E8E6DF] bg-white px-3 py-2 text-sm focus:border-[#B69A65] focus:ring-1 focus:ring-[#B69A65]"
                  >
                    <option value="Credit Card (Amex Black)">Amex Centurion / Black</option>
                    <option value="Luxury Card">Luxury Card (Mastercard World)</option>
                    <option value="Direct Wire">Direct Wire Transfer</option>
                    <option value="Corporate Account">Corporate Account Billing</option>
                    <option value="Cash at Counter">Cash Guarantee at Counter</option>
                  </select>
                </div>
              </div>

              {/* Rate Summary Card */}
              <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-4">
                <div className="flex items-center justify-between text-xs text-[#777C77]">
                  <span>Stay Duration:</span>
                  <span className="font-medium text-[#202923]">{nights} Nights</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#777C77] mt-1.5">
                  <span>Room Rate:</span>
                  <span>{formatCurrency(selectedRoom?.pricePerNight || 0)} / night</span>
                </div>
                <div className="border-t border-[#E8E6DF] my-2 pt-2 flex items-center justify-between text-sm font-semibold text-[#202923]">
                  <span>Estimated Total (Tax incl.):</span>
                  <span className="text-[#8F6F2E] text-base">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Special Concierge Requests</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. VIP champagne setup, quiet room, late check-in"
                  className="w-full rounded-lg border border-[#E8E6DF] px-3 py-2 text-sm focus:border-[#B69A65] focus:ring-1 focus:ring-[#B69A65]"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E8E6DF] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#E8E6DF] px-4 py-2 text-xs font-medium text-[#777C77] hover:bg-[#F7F6F2] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#202923] px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#161D19] transition-colors"
              >
                <CreditCard className="h-4 w-4 text-[#B69A65]" />
                Confirm Reservation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
