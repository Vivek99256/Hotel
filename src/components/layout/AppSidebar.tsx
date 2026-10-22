'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { useHotel } from '@/lib/data-store';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  CalendarDays,
  KeyRound,
  BarChart3,
  UserCog,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function AppSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { rooms, reservations, notifications } = useHotel();

  // Dynamic badge counts
  const cleaningCount = rooms.filter((r) => r.status === 'Cleaning').length;
  const arrivalsToday = reservations.filter((r) => r.status === 'Confirmed').length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Guests',
      href: '/guests',
      icon: Users,
    },
    {
      label: 'Rooms',
      href: '/rooms',
      icon: BedDouble,
      badge: cleaningCount > 0 ? `${cleaningCount} cleaning` : undefined,
      badgeColor: 'amber',
    },
    {
      label: 'Reservations',
      href: '/reservations',
      icon: CalendarDays,
      badge: arrivalsToday > 0 ? `${arrivalsToday} due` : undefined,
      badgeColor: 'gold',
    },
    {
      label: 'Check-In / Out',
      href: '/check-in',
      icon: KeyRound,
      highlight: true,
    },
    {
      label: 'Reports',
      href: '/reports',
      icon: BarChart3,
    },
    {
      label: 'Staff & Settings',
      href: '/staff',
      icon: UserCog,
    },
    {
      label: 'Audit Logs',
      href: '/audit-logs',
      icon: ShieldAlert,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-[#E8E6DF] select-none">
      {/* Top Section: Hotel Logo & Identity */}
      <div>
        <div className="flex h-18 items-center justify-between border-b border-[#E8E6DF] px-4">
          <NextLink
            href="/"
            className="flex items-center gap-3 overflow-hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            {/* Elegant Hotel Crest */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#202923] text-[#B69A65] shadow-xs ring-1 ring-[#202923]/10">
              <span className="font-serif text-base font-bold tracking-wider">RH</span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm font-semibold tracking-wide text-[#202923] uppercase">
                    The Royal Haveli
                  </span>
                  <Sparkles className="h-3 w-3 text-[#B69A65]" />
                </div>
                <p className="text-[10px] font-medium tracking-widest text-[#777C77] uppercase">
                  Udaipur • Palace & Resort
                </p>
              </div>
            )}
          </NextLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8E6DF] text-[#777C77] hover:bg-[#F7F6F2] hover:text-[#202923] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <NextLink
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#202923] text-white shadow-xs font-semibold'
                    : 'text-[#777C77] hover:bg-[#F7F6F2] hover:text-[#202923]'
                } ${item.highlight && !isActive ? 'border border-[#E8DEC8] bg-[#FDFBF7] text-[#8F6F2E]' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#B69A65]'
                      : item.highlight
                      ? 'text-[#B69A65]'
                      : 'text-[#777C77] group-hover:text-[#202923]'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          item.badgeColor === 'amber'
                            ? 'bg-[#FEF7ED] text-[#A66719] border border-[#FBE0B9]'
                            : 'bg-[#FDF9EE] text-[#8C6A23] border border-[#F3E4BF]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Subtle active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#B69A65]" />
                )}
              </NextLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Property Info & Live Duty Badge */}
      <div className="p-3 border-t border-[#E8E6DF]">
        {!isCollapsed ? (
          <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777C77]">
                Front Desk
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#235F42]">
                <span className="h-2 w-2 rounded-full bg-[#2E6F4E] animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#959A95]">
              Heritage PMS • Udaipur, Rajasthan
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2E6F4E] ring-2 ring-white" title="Connected to PMS" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 ease-in-out shrink-0 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#202923]/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white transition-transform duration-200 ease-in-out md:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
