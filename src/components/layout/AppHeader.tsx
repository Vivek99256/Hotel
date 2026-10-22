'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHotel } from '@/lib/data-store';
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Plus,
  KeyRound,
  UserPlus,
  CalendarPlus,
  Check,
  CheckCheck,
  BedDouble,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AppHeaderProps {
  onOpenSearch: () => void;
  onOpenNewGuest: () => void;
  onOpenNewReservation: () => void;
  onOpenAddRoom?: () => void;
  onToggleMobileMenu: () => void;
}

export function AppHeader({
  onOpenSearch,
  onOpenNewGuest,
  onOpenNewReservation,
  onOpenAddRoom,
  onToggleMobileMenu,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentStaff, setCurrentStaff, staffList, notifications, markAllNotificationsAsRead, markNotificationAsRead } =
    useHotel();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showStaffMenu, setShowStaffMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Breadcrumbs generation
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Dashboard', href: '/' }];

    const breadcrumbs = [{ label: 'Home', href: '/' }];
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      if (part === 'check-in') label = 'Check-In & Check-Out';
      if (part === 'audit-logs') label = 'Audit Logs';
      if (part.startsWith('GST-')) label = `Guest ${part}`;
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-18 w-full items-center justify-between border-b border-[#E8E6DF] bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Brand & Breadcrumbs */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-[#777C77] hover:bg-[#F7F6F2] hover:text-[#202923] md:hidden"
          aria-label="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand Identity */}
        <div className="flex items-center gap-1.5 md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#202923] text-[#B69A65]">
            <span className="font-serif text-xs font-bold">RH</span>
          </div>
          <span className="font-serif text-xs font-bold text-[#202923] tracking-wide uppercase">
            The Royal Haveli
          </span>
        </div>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[#777C77]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-[#B4B0A4]" />}
                {isLast ? (
                  <span className="font-medium text-[#202923]">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#202923] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center / Right: Global Search & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Guest Search Trigger Button */}
        <button
          onClick={onOpenSearch}
          className="group flex items-center gap-2.5 rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] px-3.5 py-1.5 text-xs text-[#777C77] hover:border-[#B69A65] hover:bg-white hover:text-[#202923] transition-all shadow-xs"
        >
          <Search className="h-4 w-4 text-[#B69A65]" />
          <span className="hidden md:inline font-normal">Search guests by name, phone, or ID...</span>
          <span className="inline md:hidden font-normal">Search guests...</span>
          <kbd className="hidden sm:inline-flex items-center rounded border border-[#E8E6DF] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#959A95]">
            ⌘K
          </kbd>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowQuickActions(!showQuickActions);
              setShowNotifications(false);
              setShowStaffMenu(false);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#202923] px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-[#B69A65]" />
            <span className="hidden lg:inline">Quick Action</span>
          </button>

          {showQuickActions && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-[#E8E6DF] bg-white py-1.5 shadow-xl animate-in fade-in zoom-in-95 z-40"
              onClick={() => setShowQuickActions(false)}
            >
              <button
                onClick={() => router.push('/check-in')}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-[#202923] hover:bg-[#FAF9F5] transition-colors"
              >
                <KeyRound className="h-4 w-4 text-[#B69A65]" />
                <div className="text-left">
                  <p className="font-medium">Express Check-In</p>
                  <p className="text-[11px] text-[#777C77]">Returning guest room key issue</p>
                </div>
              </button>
              <button
                onClick={onOpenNewGuest}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-[#202923] hover:bg-[#FAF9F5] transition-colors"
              >
                <UserPlus className="h-4 w-4 text-[#2E6F4E]" />
                <div className="text-left">
                  <p className="font-medium">Register New Guest</p>
                  <p className="text-[11px] text-[#777C77]">Create profile with passport</p>
                </div>
              </button>
              <button
                onClick={onOpenNewReservation}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-[#202923] hover:bg-[#FAF9F5] transition-colors"
              >
                <CalendarPlus className="h-4 w-4 text-[#B69A65]" />
                <div className="text-left">
                  <p className="font-medium">New Reservation</p>
                  <p className="text-[11px] text-[#777C77]">Allocate suite & dates</p>
                </div>
              </button>
              <button
                onClick={() => {
                  if (onOpenAddRoom) onOpenAddRoom();
                  else router.push('/rooms');
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-[#202923] hover:bg-[#FAF9F5] transition-colors"
              >
                <BedDouble className="h-4 w-4 text-[#8F6F2E]" />
                <div className="text-left">
                  <p className="font-medium">Add New Room</p>
                  <p className="text-[11px] text-[#777C77]">Create suite or villa</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowQuickActions(false);
              setShowStaffMenu(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E6DF] text-[#777C77] hover:bg-[#F7F6F2] hover:text-[#202923] transition-colors"
            aria-label="View Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B69A65] text-[10px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E8E6DF] bg-white shadow-2xl animate-in fade-in zoom-in-95 z-40 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-4 py-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-[#202923]">Hotel Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#B69A65]/10 px-2 py-0.5 text-[10px] font-medium text-[#8F6F2E]">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="flex items-center gap-1 text-[11px] text-[#777C77] hover:text-[#202923]"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E6DF]/60">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.actionLink) router.push(notif.actionLink);
                      setShowNotifications(false);
                    }}
                    className={`flex items-start gap-3 p-3 text-xs transition-colors cursor-pointer ${
                      notif.isRead ? 'bg-white hover:bg-[#FAF9F5]' : 'bg-[#FDFBF7] hover:bg-[#F9F6F0]'
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notif.isRead ? 'bg-[#D9D6CC]' : 'bg-[#B69A65]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#202923]">{notif.title}</p>
                      <p className="mt-0.5 text-[#777C77] line-clamp-2">{notif.description}</p>
                      <span className="mt-1 block text-[10px] text-[#959A95]">{notif.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Staff Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStaffMenu(!showStaffMenu);
              setShowQuickActions(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 rounded-xl border border-[#E8E6DF] p-1.5 hover:border-[#D6D2C4] hover:bg-[#FAF9F6] transition-colors"
          >
            <div className="relative">
              <img
                src={currentStaff.avatar}
                alt={currentStaff.name}
                className="h-7 w-7 rounded-lg object-cover border border-[#E8E6DF]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#2E6F4E] ring-1 ring-white" />
            </div>
            <div className="hidden xl:block text-left pr-1">
              <p className="text-xs font-medium text-[#202923] leading-none">{currentStaff.name}</p>
              <p className="text-[10px] text-[#777C77] leading-none mt-1">{currentStaff.role}</p>
            </div>
          </button>

          {showStaffMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E8E6DF] bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 z-40">
              <div className="border-b border-[#E8E6DF] px-3 py-2">
                <p className="text-xs font-semibold text-[#202923]">{currentStaff.name}</p>
                <p className="text-[11px] text-[#777C77]">{currentStaff.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2E6F4E]" />
                  <span className="text-[10px] font-medium text-[#235F42]">
                    On Duty • {currentStaff.shift}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#959A95]">
                  Switch Active Staff Profile
                </span>
                {staffList.map((stf) => (
                  <button
                    key={stf.id}
                    onClick={() => {
                      setCurrentStaff(stf);
                      setShowStaffMenu(false);
                    }}
                    className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs transition-colors ${
                      stf.id === currentStaff.id
                        ? 'bg-[#F7F6F2] font-semibold text-[#202923]'
                        : 'text-[#777C77] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <span>{stf.name} ({stf.role.split(' ')[0]})</span>
                    {stf.id === currentStaff.id && <Check className="h-3.5 w-3.5 text-[#B69A65]" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#E8E6DF] pt-1">
                <button
                  onClick={() => {
                    setShowStaffMenu(false);
                    router.push('/staff');
                  }}
                  className="w-full text-left rounded-xl px-3 py-1.5 text-xs text-[#777C77] hover:bg-[#FAF9F5]"
                >
                  Permissions & Shift Settings →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
