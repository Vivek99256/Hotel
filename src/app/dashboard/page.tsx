'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoomStatusModal } from '@/components/ui/RoomStatusModal';
import { AddRoomModal } from '@/components/ui/AddRoomModal';
import {
  BedDouble,
  Users,
  LogIn,
  LogOut,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  KeyRound,
  UserPlus,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Room } from '@/types/hotel';

export default function DashboardPage() {
  const router = useRouter();
  const { guests, rooms, reservations, auditLogs, currentStaff, isLoading } = useHotel();
  const [selectedRoomForStatus, setSelectedRoomForStatus] = useState<Room | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-[#E8E6DF]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-[#E8E6DF]" />
          ))}
        </div>
      </div>
    );
  }

  // Live real data calculations
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const cleaningRooms = rooms.filter((r) => r.status === 'Cleaning').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;
  const reservedRooms = rooms.filter((r) => r.status === 'Reserved').length;

  const occupancyRate = Math.round(((occupiedRooms + reservedRooms) / (totalRooms || 1)) * 100);

  // Today is 2026-10-22
  const todayArrivals = reservations.filter(
    (r) => r.checkInDate === '2026-10-22' && r.status === 'Confirmed'
  );
  const todayDepartures = reservations.filter(
    (r) => r.checkOutDate === '2026-10-22'
  );

  const activeInHouseGuests = guests.filter((g) => Boolean(g.currentRoomNumber));
  const recentActivities = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E6DF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#202923]">
              Good morning, {currentStaff.name.split(' ')[0]}
            </h1>
            <span className="rounded-full bg-[#B69A65]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#8F6F2E]">
              {currentStaff.role}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#777C77]">
            Thursday, 22 October 2026 • The Royal Haveli Palace & Resort • Udaipur, Rajasthan
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8F6F2E] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#785C24] transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-white" />
            + Add Room
          </button>
          <Link
            href="/check-in"
            className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-all"
          >
            <KeyRound className="h-3.5 w-3.5 text-[#B69A65]" />
            Returning Guest Check-In
          </Link>
          <Link
            href="/guests?action=new"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8E6DF] bg-white px-3.5 py-2 text-xs font-medium text-[#202923] hover:border-[#B69A65] hover:bg-[#FAF9F5] transition-all"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#777C77]" />
            Register Guest
          </Link>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8E6DF] bg-white px-3.5 py-2 text-xs font-medium text-[#202923] hover:bg-[#FAF9F5] transition-all"
          >
            <BedDouble className="h-3.5 w-3.5 text-[#777C77]" />
            Room Inventory
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <MetricCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          subtext={`${occupiedRooms + reservedRooms} of ${totalRooms} suites`}
          trend={{ value: '4% vs yesterday', isPositive: true }}
          icon={<BedDouble className="h-4 w-4" />}
          badge="High Demand"
        />

        <MetricCard
          label="Today's Arrivals"
          value={todayArrivals.length}
          subtext="VIP check-ins scheduled"
          trend={{ value: 'All pre-allocated', isNeutral: true }}
          icon={<LogIn className="h-4 w-4" />}
          badge="Front Desk"
        />

        <MetricCard
          label="Departures Today"
          value={todayDepartures.length}
          subtext="1 departure completed"
          trend={{ value: 'Turnovers in progress', isNeutral: true }}
          icon={<LogOut className="h-4 w-4" />}
        />

        <MetricCard
          label="Available Suites"
          value={availableRooms}
          subtext="Ready for immediate check-in"
          trend={{ value: `${cleaningRooms} being cleaned`, isNeutral: true }}
          icon={<Sparkles className="h-4 w-4 text-[#B69A65]" />}
        />

        <MetricCard
          label="VIP Guest Registry"
          value={guests.length}
          subtext="High net worth profiles"
          trend={{ value: '100% ID Verified', isPositive: true }}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Occupancy Visualization Strip */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#202923]">Suite Occupancy & Floor Distribution</h3>
            <p className="text-xs text-[#777C77]">
              Real-time room availability status across Floors 1 to 4
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 text-[#235F42]">
              <span className="h-2 w-2 rounded-full bg-[#2E6F4E]" />
              {availableRooms} Available
            </span>
            <span className="flex items-center gap-1.5 text-[#214366]">
              <span className="h-2 w-2 rounded-full bg-[#2A5580]" />
              {occupiedRooms} Occupied
            </span>
            <span className="flex items-center gap-1.5 text-[#8C6A23]">
              <span className="h-2 w-2 rounded-full bg-[#B69A65]" />
              {reservedRooms} Reserved
            </span>
            <span className="flex items-center gap-1.5 text-[#A66719]">
              <span className="h-2 w-2 rounded-full bg-[#D48924]" />
              {cleaningRooms} Cleaning
            </span>
            <span className="flex items-center gap-1.5 text-[#963535]">
              <span className="h-2 w-2 rounded-full bg-[#B33A3A]" />
              {maintenanceRooms} Maintenance
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-3 w-full rounded-full bg-[#F1EFEA] overflow-hidden flex">
          <div
            style={{ width: `${(availableRooms / totalRooms) * 100}%` }}
            className="bg-[#2E6F4E] transition-all duration-500"
            title={`${availableRooms} Available`}
          />
          <div
            style={{ width: `${(occupiedRooms / totalRooms) * 100}%` }}
            className="bg-[#2A5580] transition-all duration-500"
            title={`${occupiedRooms} Occupied`}
          />
          <div
            style={{ width: `${(reservedRooms / totalRooms) * 100}%` }}
            className="bg-[#B69A65] transition-all duration-500"
            title={`${reservedRooms} Reserved`}
          />
          <div
            style={{ width: `${(cleaningRooms / totalRooms) * 100}%` }}
            className="bg-[#D48924] transition-all duration-500"
            title={`${cleaningRooms} Cleaning`}
          />
          <div
            style={{ width: `${(maintenanceRooms / totalRooms) * 100}%` }}
            className="bg-[#B33A3A] transition-all duration-500"
            title={`${maintenanceRooms} Maintenance`}
          />
        </div>

        {/* Quick Room Grid Mini Pills */}
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-2">
          {rooms.map((room) => {
            const statusBg =
              room.status === 'Available'
                ? 'bg-[#EDF7F2] text-[#235F42] border-[#C8E8D7]'
                : room.status === 'Occupied'
                ? 'bg-[#EFF5FB] text-[#214366] border-[#CBDFF2]'
                : room.status === 'Reserved'
                ? 'bg-[#FDF9EE] text-[#8C6A23] border-[#F3E4BF]'
                : room.status === 'Cleaning'
                ? 'bg-[#FEF7ED] text-[#A66719] border-[#FBE0B9]'
                : 'bg-[#FDF2F2] text-[#963535] border-[#F7CECE]';

            return (
              <button
                key={room.roomNumber}
                onClick={() => setSelectedRoomForStatus(room)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all hover:scale-105 ${statusBg}`}
                title={`Room ${room.roomNumber} (${room.type}) - ${room.status}`}
              >
                <span className="font-mono text-xs font-bold leading-none">{room.roomNumber}</span>
                <span className="text-[9px] mt-1 opacity-80 leading-none">{room.status.slice(0, 4)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Operational Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Queue & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Expected Arrivals */}
          {/* <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <LogIn className="h-4 w-4 text-[#B69A65]" />
                <h3 className="text-sm font-semibold text-[#202923]">
                  Today&apos;s Expected Arrivals ({todayArrivals.length})
                </h3>
              </div>
              <Link
                href="/check-in"
                className="text-xs font-medium text-[#8F6F2E] hover:text-[#202923] transition-colors"
              >
                Open Check-In Desk →
              </Link>
            </div>

            {todayArrivals.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#777C77]">
                No pending arrivals remaining for today.
              </div>
            ) : (
              <div className="divide-y divide-[#E8E6DF]/60">
                {todayArrivals.map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-[#FAF9F5] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#202923]">{res.guestName}</span>
                        <span className="font-mono text-[11px] text-[#777C77] bg-[#F7F6F2] px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                          {res.id}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#777C77] flex-wrap">
                        <span className="font-medium text-[#202923]">Room {res.roomNumber}</span>
                        <span>•</span>
                        <span>{res.roomType}</span>
                        <span>•</span>
                        <span>{res.nights} Nights</span>
                        <span>•</span>
                        <span className="font-mono">{res.guestPhoneMasked}</span>
                      </div>
                      {res.specialRequests && (
                        <p className="mt-1 text-xs text-[#8F6F2E] italic">
                          &ldquo;{res.specialRequests}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <Link
                        href={`/check-in?guestId=${res.guestId}&roomNumber=${res.roomNumber}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#202923] px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-colors"
                      >
                        <KeyRound className="h-3 w-3 text-[#B69A65]" />
                        Start Check-In
                      </Link>
                      <Link
                        href={`/guests/${res.guestId}`}
                        className="p-1.5 rounded-lg border border-[#E8E6DF] text-[#777C77] hover:bg-[#F7F6F2] hover:text-[#202923]"
                        title="View Guest CRM Profile"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}

          {/* Real-time Audit & Front Desk Activity Feed */}
          {/* <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#B69A65]" />
                <h3 className="text-sm font-semibold text-[#202923]">Recent Front Desk Activity</h3>
              </div>
              <Link
                href="/audit-logs"
                className="text-xs font-medium text-[#8F6F2E] hover:text-[#202923] transition-colors"
              >
                View Full Audit Trail →
              </Link>
            </div>

            <div className="divide-y divide-[#E8E6DF]/60">
              {recentActivities.map((log) => (
                <div key={log.id} className="p-4 hover:bg-[#FAF9F5] transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[#202923]">{log.action}</span>
                    <span className="font-mono text-[11px] text-[#959A95]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#777C77]">{log.details}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#959A95]">
                    <span>By {log.staffName}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{log.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Right Column: In-House VIPs & Turnovers */}
        
      </div>

      {/* Room Status Inspection Modal */}
      <RoomStatusModal
        room={selectedRoomForStatus}
        isOpen={Boolean(selectedRoomForStatus)}
        onClose={() => setSelectedRoomForStatus(null)}
      />

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
      />
    </div>
  );
}
