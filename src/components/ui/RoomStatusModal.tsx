'use client';

import React, { useState } from 'react';
import { useHotel } from '@/lib/data-store';
import { Room, RoomStatus } from '@/types/hotel';
import { X, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface RoomStatusModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomStatusModal({ room, isOpen, onClose }: RoomStatusModalProps) {
  const { updateRoomStatus } = useHotel();
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus>(room?.status || 'Available');
  const [notes, setNotes] = useState(room?.maintenanceNotes || '');

  if (!isOpen || !room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoomStatus(room.roomNumber, selectedStatus, notes);
    onClose();
  };

  const statuses: { label: RoomStatus; desc: string }[] = [
    { label: 'Available', desc: 'Inspected and ready for guest arrival' },
    { label: 'Cleaning', desc: 'Turnover or deep cleaning in progress' },
    { label: 'Maintenance', desc: 'HVAC, plumbing, or hardware servicing' },
    { label: 'Reserved', desc: 'Held for upcoming confirmed arrival today' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202923]/40 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202923] text-white">
              <Sparkles className="h-5 w-5 text-[#B69A65]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#202923]">Room {room.roomNumber} Status</h2>
              <p className="text-xs text-[#777C77]">{room.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#959A95] hover:bg-[#E8E6DF]/50 hover:text-[#202923]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-[#777C77]">Current Status:</span>
            <StatusBadge status={room.status} type="room" />
          </div>

          <label className="block text-xs font-medium text-[#202923] mb-2">Change Status To:</label>
          <div className="space-y-2">
            {statuses.map(({ label, desc }) => (
              <label
                key={label}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === label
                    ? 'border-[#B69A65] bg-[#FDF9EE]/60'
                    : 'border-[#E8E6DF] hover:bg-[#FAF9F5]'
                }`}
              >
                <input
                  type="radio"
                  name="roomStatus"
                  value={label}
                  checked={selectedStatus === label}
                  onChange={() => setSelectedStatus(label)}
                  className="mt-0.5 text-[#B69A65] focus:ring-[#B69A65]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#202923]">{label}</span>
                    <StatusBadge status={label} type="room" size="sm" />
                  </div>
                  <p className="text-[11px] text-[#777C77] mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-[#202923] mb-1">Status Notes / Reason</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Inspected by housekeeping manager, all amenities verified"
              className="w-full rounded-lg border border-[#E8E6DF] px-3 py-2 text-xs focus:border-[#B69A65] focus:ring-1 focus:ring-[#B69A65]"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E8E6DF] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#E8E6DF] px-4 py-2 text-xs font-medium text-[#777C77] hover:bg-[#F7F6F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#202923] px-5 py-2 text-xs font-medium text-white hover:bg-[#161D19]"
            >
              Update Room Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
