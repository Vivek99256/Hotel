'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RoomStatusModal } from '@/components/ui/RoomStatusModal';
import { AddRoomModal } from '@/components/ui/AddRoomModal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  BedDouble,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  KeyRound,
  User,
  Calendar,
  Check,
  Wrench,
  Search,
  Plus,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Room, RoomStatus } from '@/types/hotel';

export default function RoomsPage() {
  const router = useRouter();
  const { rooms, updateRoomStatus } = useHotel();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [floorFilter, setFloorFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomForStatus, setSelectedRoomForStatus] = useState<Room | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  // Status counts for segment tabs
  const counts = {
    All: rooms.length,
    Available: rooms.filter((r) => r.status === 'Available').length,
    Occupied: rooms.filter((r) => r.status === 'Occupied').length,
    Reserved: rooms.filter((r) => r.status === 'Reserved').length,
    Cleaning: rooms.filter((r) => r.status === 'Cleaning').length,
    Maintenance: rooms.filter((r) => r.status === 'Maintenance').length,
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (statusFilter !== 'All' && room.status !== statusFilter) return false;
      if (floorFilter !== 'All' && room.floor.toString() !== floorFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = room.roomNumber.includes(q);
        const matchType = room.type.toLowerCase().includes(q);
        const matchGuest = room.currentGuestName?.toLowerCase().includes(q);
        if (!matchNumber && !matchType && !matchGuest) return false;
      }
      return true;
    });
  }, [rooms, statusFilter, floorFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6DF] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#202923]">
            Room & Suite Inventory
          </h1>
          <p className="mt-1 text-xs text-[#777C77]">
            Real-time status management, turnover sanitization, and room allocation
          </p>
        </div>

        {/* Actions & View Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8F6F2E] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#785C24] active:scale-95 transition-all ring-2 ring-[#B69A65]/30"
          >
            <Plus className="h-4 w-4 text-white" />
            + Add Room
          </button>

          <div className="flex rounded-xl border border-[#E8E6DF] bg-white p-1 shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#202923] text-white shadow-xs'
                  : 'text-[#777C77] hover:text-[#202923]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-[#202923] text-white shadow-xs'
                  : 'text-[#777C77] hover:text-[#202923]'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Status Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'] as const).map(
          (status) => {
            const count = counts[status];
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? 'border-[#202923] bg-[#202923] text-white shadow-xs'
                    : 'border-[#E8E6DF] bg-white text-[#777C77] hover:bg-[#FAF9F5] hover:text-[#202923]'
                }`}
              >
                <span>{status === 'All' ? 'All Rooms' : status}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F7F6F2] text-[#202923]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[#E8E6DF] bg-white p-3.5 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#B69A65]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search room number or occupant..."
            className="w-full rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] pl-9 pr-3 py-1.5 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#777C77]">Floor:</span>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3 py-1.5 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
          >
            <option value="All">All Floors (1 to 4)</option>
            <option value="4">Floor 4 — Presidential Penthouses</option>
            <option value="3">Floor 3 — Executive Grand Suites</option>
            <option value="2">Floor 2 — Deluxe Sanctuaries</option>
            <option value="1">Floor 1 — Oceanfront Villas & Gardens</option>
          </select>
        </div>
      </div>

      {/* Main View: Grid vs Table */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          title="No rooms match filter criteria"
          description="Adjust your status tabs or floor selections to display rooms."
          actionLabel="Clear Filters"
          onAction={() => {
            setStatusFilter('All');
            setFloorFilter('All');
            setSearchQuery('');
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            return (
              <div
                key={room.roomNumber}
                className="group rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-xs hover:border-[#D6D2C4] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-[#202923]">
                          Room {room.roomNumber}
                        </span>
                        <span className="text-xs text-[#777C77]">Floor {room.floor}</span>
                      </div>
                      <h3 className="font-medium text-sm text-[#202923] mt-0.5">{room.type}</h3>
                    </div>
                    <StatusBadge status={room.status} type="room" />
                  </div>

                  {/* Pricing & Specs */}
                  <div className="mt-3 flex items-center justify-between border-t border-b border-[#E8E6DF]/60 py-2.5 text-xs">
                    <div>
                      <span className="text-[#959A95] block text-[10px] uppercase">Rate per Night</span>
                      <span className="font-serif text-base font-semibold text-[#8F6F2E]">
                        {formatCurrency(room.pricePerNight)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#959A95] block text-[10px] uppercase">Size & View</span>
                      <span className="font-medium text-[#202923]">
                        {room.squareMeters} m² • {room.view}
                      </span>
                    </div>
                  </div>

                  {/* Current Occupant or Next Booking */}
                  <div className="my-3 text-xs">
                    {room.status === 'Occupied' && room.currentGuestName ? (
                      <div className="rounded-xl border border-[#CBDFF2] bg-[#EFF5FB] p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-[#214366]">Current Guest</span>
                          <span className="text-[10px] text-[#2A5580]">Departing {formatDate(room.currentStayCheckOut || '')}</span>
                        </div>
                        <p className="mt-1 font-semibold text-[#202923]">{room.currentGuestName}</p>
                      </div>
                    ) : room.status === 'Reserved' ? (
                      <div className="rounded-xl border border-[#F3E4BF] bg-[#FDF9EE] p-2.5">
                        <span className="text-[11px] font-bold uppercase text-[#8C6A23]">Reserved for Arrival</span>
                        <p className="mt-0.5 text-xs text-[#202923]">Expected today • Pre-allocated</p>
                      </div>
                    ) : room.status === 'Cleaning' ? (
                      <div className="rounded-xl border border-[#FBE0B9] bg-[#FEF7ED] p-2.5">
                        <span className="text-[11px] font-bold uppercase text-[#A66719]">Housekeeping in Progress</span>
                        <p className="mt-0.5 text-xs text-[#777C77]">
                          {room.maintenanceNotes || 'Turnover cleaning following departure'}
                        </p>
                      </div>
                    ) : room.status === 'Maintenance' ? (
                      <div className="rounded-xl border border-[#F7CECE] bg-[#FDF2F2] p-2.5">
                        <span className="text-[11px] font-bold uppercase text-[#963535]">Maintenance Active</span>
                        <p className="mt-0.5 text-xs text-[#777C77]">
                          {room.maintenanceNotes || 'Routine inspection / repair'}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[#C8E8D7] bg-[#EDF7F2] p-2.5 text-[#235F42]">
                        <span className="text-[11px] font-bold uppercase">Ready for Guest</span>
                        <p className="mt-0.5 text-[11px]">Inspected & fully prepped for arrival</p>
                      </div>
                    )}
                  </div>

                  {/* Amenities Tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-[#E8E6DF] bg-[#FAF9F6] px-2 py-0.5 text-[10px] text-[#777C77]"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-[10px] text-[#959A95] self-center">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-[#E8E6DF] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedRoomForStatus(room)}
                    className="inline-flex items-center gap-1 text-xs text-[#777C77] hover:text-[#202923] transition-colors"
                  >
                    <Wrench className="h-3.5 w-3.5 text-[#B69A65]" />
                    Update Status
                  </button>

                  {room.status === 'Available' ? (
                    <Link
                      href={`/check-in?roomNumber=${room.roomNumber}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#202923] px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-all"
                    >
                      <KeyRound className="h-3 w-3 text-[#B69A65]" />
                      Assign & Check In
                    </Link>
                  ) : room.status === 'Cleaning' ? (
                    <button
                      onClick={() => updateRoomStatus(room.roomNumber, 'Available', 'Verified clean by Front Desk')}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#C8E8D7] bg-[#EDF7F2] px-2.5 py-1 text-xs font-medium text-[#235F42] hover:bg-[#DDF0E6]"
                    >
                      <Check className="h-3 w-3" /> Mark Ready
                    </button>
                  ) : room.status === 'Occupied' ? (
                    <Link
                      href={`/check-in`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E8E6DF] bg-white px-2.5 py-1 text-xs font-medium text-[#202923] hover:bg-[#FAF9F5]"
                    >
                      Check-Out Hub →
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table View */
        <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E6DF] bg-[#FAF9F6] text-[11px] font-semibold uppercase tracking-wider text-[#777C77]">
                  <th className="py-3 px-4">Room #</th>
                  <th className="py-3 px-4">Suite / Room Type</th>
                  <th className="py-3 px-4">Floor & View</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Occupant / Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6DF]/60">
                {filteredRooms.map((room) => (
                  <tr key={room.roomNumber} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#202923]">
                      {room.roomNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#202923]">{room.type}</td>
                    <td className="py-3.5 px-4 text-[#777C77]">
                      Floor {room.floor} • {room.view}
                    </td>
                    <td className="py-3.5 px-4 font-serif font-medium text-[#8F6F2E]">
                      {formatCurrency(room.pricePerNight)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={room.status} type="room" size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-[#777C77]">
                      {room.currentGuestName ? (
                        <span className="font-medium text-[#202923]">{room.currentGuestName}</span>
                      ) : (
                        <span>{room.maintenanceNotes || '—'}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedRoomForStatus(room)}
                        className="rounded-lg border border-[#E8E6DF] px-2.5 py-1 text-xs text-[#202923] hover:bg-[#FAF9F5]"
                      >
                        Edit Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Room Status Inspection Modal */}
      <RoomStatusModal
        room={selectedRoomForStatus}
        isOpen={Boolean(selectedRoomForStatus)}
        onClose={() => setSelectedRoomForStatus(null)}
      />

      {/* Add New Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
      />
    </div>
  );
}
