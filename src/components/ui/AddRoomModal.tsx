'use client';

import React, { useState } from 'react';
import { useHotel } from '@/lib/data-store';
import { RoomType, RoomStatus } from '@/types/hotel';
import { X, BedDouble, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated?: (roomNumber: string) => void;
}

export function AddRoomModal({ isOpen, onClose, onRoomCreated }: AddRoomModalProps) {
  const { addRoom, rooms } = useHotel();

  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [type, setType] = useState<RoomType>('AC');
  const [pricePerNight, setPricePerNight] = useState(1500);
  const [capacity, setCapacity] = useState(2);
  const [bedConfiguration, setBedConfiguration] = useState('1 King Size Royal Bed');
  const [squareMeters, setSquareMeters] = useState(75);
  const [view, setView] = useState<'Lake Pichola View' | 'Palace Courtyard' | 'Royal Gardens' | 'City Skyline'>('Palace Courtyard');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'High-Speed Wi-Fi',
    'Smart 4K TV',
    'Italian Marble Bathtub',
    'Artisanal Tea & Espresso Atelier',
  ]);
  const [status, setStatus] = useState<RoomStatus>('Available');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const availableAmenities = [
    'High-Speed Wi-Fi',
    'Smart 4K TV',
    'Italian Marble Bathtub',
    'Artisanal Tea & Espresso Atelier',
    'Private Heated Plunge Pool',
    'Lake View Balcony',
    'Dedicated Butler Service',
    'Ayurvedic Bath Amenities',
    'Minibar & Wine Cooler',
    'Royal Dressing Room',
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!roomNumber.trim()) {
      errs.roomNumber = 'Room number is required';
    } else if (rooms.some((r) => r.roomNumber.toLowerCase() === roomNumber.trim().toLowerCase())) {
      errs.roomNumber = `Room ${roomNumber} already exists in inventory`;
    }
    if (pricePerNight <= 0) {
      errs.pricePerNight = 'Please enter a valid price per night';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addRoom({
      roomNumber: roomNumber.trim(),
      floor,
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      bedConfiguration,
      squareMeters: Number(squareMeters),
      view,
      amenities: selectedAmenities,
      status,
    });

    setIsSuccess(true);
    if (onRoomCreated) onRoomCreated(roomNumber.trim());
  };

  const handleFinish = () => {
    setIsSuccess(false);
    setRoomNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#202923]/40 backdrop-blur-[2px] overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202923] text-white">
              <BedDouble className="h-5 w-5 text-[#B69A65]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#202923]">Add New Room</h2>
              <p className="text-xs text-[#777C77]">
                Add an AC or Non AC room to hotel inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#959A95] hover:bg-[#E8E6DF]/50 hover:text-[#202923]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF7F2] text-[#2E6F4E] border border-[#C8E8D7]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-[#202923]">Room Added Successfully</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#777C77] max-w-md mx-auto">
              Room <strong className="text-[#202923]">#{roomNumber}</strong> ({type}) at rate{' '}
              <strong className="text-[#8F6F2E]">{formatCurrency(pricePerNight)}/night</strong> is now active in your Supabase database and inventory.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleFinish}
                className="rounded-xl bg-[#202923] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#161D19]"
              >
                Close & View Rooms
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Room Number */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">
                  Room Number <span className="text-[#B33A3A]">*</span>
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 105, 203, 401"
                  className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 ${
                    errors.roomNumber ? 'border-[#B33A3A] focus:ring-[#B33A3A]' : 'border-[#E8E6DF] focus:border-[#B69A65]'
                  }`}
                  autoFocus
                />
                {errors.roomNumber && <p className="mt-1 text-xs text-[#B33A3A]">{errors.roomNumber}</p>}
              </div>

              {/* Floor */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Floor Level</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E8E6DF] bg-white px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                >
                  <option value={1}>Floor 1</option>
                  <option value={2}>Floor 2</option>
                  <option value={3}>Floor 3</option>
                  <option value={4}>Floor 4</option>
                </select>
              </div>

              {/* Room Type */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#202923] mb-1">Room Category</label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as RoomType;
                    setType(newType);
                    if (newType === 'AC' && pricePerNight === 1000) setPricePerNight(1500);
                    if (newType === 'Non AC' && pricePerNight === 1500) setPricePerNight(1000);
                  }}
                  className="w-full rounded-xl border border-[#E8E6DF] bg-white px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                >
                  <option value="AC">AC</option>
                  <option value="Non AC">Non AC</option>
                </select>
              </div>

              {/* Price Per Night */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">
                  Price per Night (₹ INR) <span className="text-[#B33A3A]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8F6F2E]">₹</span>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E8E6DF] pl-7 pr-3 py-2 text-xs sm:text-sm font-semibold text-[#202923] focus:border-[#B69A65]"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Guest Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E8E6DF] px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                />
              </div>

              {/* Bed Configuration */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Bed Configuration</label>
                <input
                  type="text"
                  value={bedConfiguration}
                  onChange={(e) => setBedConfiguration(e.target.value)}
                  placeholder="e.g. 1 King Size Bed or Twin Beds"
                  className="w-full rounded-xl border border-[#E8E6DF] px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                />
              </div>

              {/* View */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Room View</label>
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value as any)}
                  className="w-full rounded-xl border border-[#E8E6DF] bg-white px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                >
                  <option value="Lake Pichola View">Lake Pichola View</option>
                  <option value="Palace Courtyard">Palace Courtyard</option>
                  <option value="Royal Gardens">Royal Gardens</option>
                  <option value="City Skyline">City Skyline</option>
                </select>
              </div>

              {/* Square Meters */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Area (Square Meters / m²)</label>
                <input
                  type="number"
                  min={20}
                  value={squareMeters}
                  onChange={(e) => setSquareMeters(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E8E6DF] px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                />
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-xs font-medium text-[#202923] mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RoomStatus)}
                  className="w-full rounded-xl border border-[#E8E6DF] bg-white px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                >
                  <option value="Available">Available (Ready for check-in)</option>
                  <option value="Cleaning">Cleaning / Turnover</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-[#202923] mb-1.5">Amenities Included</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableAmenities.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`text-left p-2 rounded-lg border text-[11px] transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'border-[#B69A65] bg-[#FDF9EE] text-[#8F6F2E] font-medium'
                          : 'border-[#E8E6DF] bg-white text-[#777C77] hover:bg-[#FAF9F5]'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isChecked ? 'bg-[#B69A65]' : 'bg-[#D9D6CC]'}`} />
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E8E6DF] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E8E6DF] px-4 py-2 text-xs font-medium text-[#777C77] hover:bg-[#FAF9F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19]"
              >
                <Plus className="h-4 w-4 text-[#B69A65]" />
                Add Room to Inventory
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
