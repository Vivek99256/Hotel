'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { GlobalSearchModal } from '@/components/ui/GlobalSearchModal';
import { GuestRegistrationModal } from '@/components/ui/GuestRegistrationModal';
import { NewReservationModal } from '@/components/ui/NewReservationModal';
import { AddRoomModal } from '@/components/ui/AddRoomModal';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  KeyRound,
  Plus,
} from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Global modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewGuestOpen, setIsNewGuestOpen] = useState(false);
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  // Global keyboard shortcuts: Cmd+K or Ctrl+K or / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F7F6F2]">
      {/* Sidebar with Suspense */}
      <Suspense fallback={<aside className="w-64 bg-white border-r border-[#E8E6DF]" />}>
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Suspense fallback={<header className="h-18 bg-white border-b border-[#E8E6DF]" />}>
          <AppHeader
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNewGuest={() => setIsNewGuestOpen(true)}
            onOpenNewReservation={() => setIsNewReservationOpen(true)}
            onOpenAddRoom={() => setIsAddRoomOpen(true)}
            onToggleMobileMenu={() => setIsMobileOpen((prev) => !prev)}
          />
        </Suspense>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          <Suspense fallback={<div className="h-40 animate-pulse bg-white rounded-2xl border border-[#E8E6DF]" />}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Smartphones) */}
      <nav aria-label="Mobile Navigation" className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8E6DF] md:hidden px-3 py-1.5 shadow-xl">
        <div className="grid grid-cols-5 items-center justify-around text-center">
          <Link
            href="/"
            className={`flex flex-col items-center py-1 text-[10px] font-medium transition-colors ${
              pathname === '/' ? 'text-[#8F6F2E] font-bold' : 'text-[#777C77] hover:text-[#202923]'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mb-0.5" />
            Home
          </Link>

          <Link
            href="/guests"
            className={`flex flex-col items-center py-1 text-[10px] font-medium transition-colors ${
              pathname.startsWith('/guests') ? 'text-[#8F6F2E] font-bold' : 'text-[#777C77] hover:text-[#202923]'
            }`}
          >
            <Users className="h-4 w-4 mb-0.5" />
            Guests
          </Link>

          {/* Floating Center Action: + Room */}
          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="flex flex-col items-center -mt-5 py-0.5 focus:outline-none group"
            title="Add New Room"
          >
            <div className="h-11 w-11 rounded-full bg-[#202923] text-white flex items-center justify-center shadow-lg ring-3 ring-white group-active:scale-95 transition-all">
              <Plus className="h-5 w-5 text-[#B69A65]" />
            </div>
            <span className="mt-0.5 font-bold text-[9px] text-[#8F6F2E]">+ Room</span>
          </button>

          <Link
            href="/rooms"
            className={`flex flex-col items-center py-1 text-[10px] font-medium transition-colors ${
              pathname === '/rooms' ? 'text-[#8F6F2E] font-bold' : 'text-[#777C77] hover:text-[#202923]'
            }`}
          >
            <BedDouble className="h-4 w-4 mb-0.5" />
            Rooms
          </Link>

          <Link
            href="/check-in"
            className={`flex flex-col items-center py-1 text-[10px] font-medium transition-colors ${
              pathname === '/check-in' ? 'text-[#8F6F2E] font-bold' : 'text-[#777C77] hover:text-[#202923]'
            }`}
          >
            <KeyRound className="h-4 w-4 mb-0.5" />
            Check-In
          </Link>
        </div>
      </nav>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <GuestRegistrationModal
        isOpen={isNewGuestOpen}
        onClose={() => setIsNewGuestOpen(false)}
      />

      <NewReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
      />

      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
      />
    </div>
  );
}
