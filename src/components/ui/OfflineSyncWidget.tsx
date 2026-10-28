'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useHotel } from '@/lib/data-store';
import {
  Zap,
  ZapOff,
  RefreshCw,
  CheckCircle2,
  Clock,
  Database,
  X,
  Layers,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export function OfflineSyncWidget() {
  const {
    isOnline,
    isSimulatedOffline,
    setIsSimulatedOffline,
    syncQueue,
    isSyncing,
    lastSyncTime,
    pendingSyncCount,
    syncOfflineDataNow,
  } = useHotel();

  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleManualSync = async () => {
    setFeedback('Synchronizing with live database...');
    const result = await syncOfflineDataNow();
    if (result.success) {
      setFeedback(`Synced ${result.syncedCount} offline record(s) to cloud!`);
    } else {
      setFeedback(result.errors[0] || 'Sync incomplete. Check internet connection.');
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const formatElapsed = (epoch: number) => {
    const diffSec = Math.floor((Date.now() - epoch) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  };

  const isActuallyOffline = !isOnline || isSimulatedOffline;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all shadow-xs border ${
          isActuallyOffline
            ? 'bg-amber-500/10 text-amber-800 border-amber-300 hover:bg-amber-500/20 animate-pulse'
            : isSyncing
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            : pendingSyncCount > 0
            ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
            : 'bg-[#2E6F4E]/10 text-[#235F42] border-[#2E6F4E]/20 hover:bg-[#2E6F4E]/15'
        }`}
        title="Database sync & power-cut offline storage"
      >
        {isActuallyOffline ? (
          <>
            <ZapOff className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              Offline ({pendingSyncCount})
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin shrink-0" />
            <span className="text-[11px] sm:text-xs">Syncing...</span>
          </>
        ) : pendingSyncCount > 0 ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 text-orange-600 shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold">
              {pendingSyncCount} Pending
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-[#2E6F4E] ring-2 ring-[#2E6F4E]/30 shrink-0" />
            <span className="hidden md:inline text-[11px] sm:text-xs font-semibold">
              Cloud Synced
            </span>
            <span className="md:hidden text-[11px] font-semibold">Synced</span>
          </>
        )}
        <ChevronDown className="h-3 w-3 opacity-60 text-current" />
      </button>

      {/* Dropdown Popover: Anchored cleanly underneath the button */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl border border-[#E8E6DF] bg-white shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isActuallyOffline
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-[#2E6F4E]/10 text-[#2E6F4E]'
                }`}
              >
                {isActuallyOffline ? (
                  <ZapOff className="h-3.5 w-3.5" />
                ) : (
                  <Database className="h-3.5 w-3.5" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#202923] leading-none">
                  Database Sync & Cache
                </h4>
                <p className="text-[10px] text-[#777C77] mt-0.5">
                  Offline-first persistence with auto-sync
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-[#777C77] hover:bg-[#E8E6DF]/50 hover:text-[#202923] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3.5 space-y-3 max-h-[70vh] overflow-y-auto">
            {/* Status Strip */}
            {isActuallyOffline ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 flex items-start gap-2.5">
                <ZapOff className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-950 text-[11px]">
                    Offline Mode Active (Power Cut / Disconnected)
                  </p>
                  <p className="text-amber-800 text-[10px] leading-relaxed">
                    Check-ins, registrations, and room updates are safely saved in local storage. All changes will automatically sync to Supabase when reconnected.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#2E6F4E]/30 bg-[#2E6F4E]/5 p-2.5 text-xs text-[#1E4B35] flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#2E6F4E] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#183C2A] text-[11px]">
                    Cloud Database Connected
                  </p>
                  <p className="text-[#235F42] text-[10px]">
                    All local records are synchronized with the live database.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-2">
                <span className="text-[9px] font-medium text-[#777C77] uppercase tracking-wider block">
                  Pending
                </span>
                <span className="text-sm font-bold text-[#202923] mt-0.5 block">
                  {pendingSyncCount}
                </span>
              </div>
              <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-2">
                <span className="text-[9px] font-medium text-[#777C77] uppercase tracking-wider block">
                  Last Synced
                </span>
                <span className="text-[11px] font-semibold text-[#202923] mt-0.5 block truncate">
                  {lastSyncTime || 'Just now'}
                </span>
              </div>
              <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-2">
                <span className="text-[9px] font-medium text-[#777C77] uppercase tracking-wider block">
                  Storage
                </span>
                <span className="text-[11px] font-semibold text-[#2E6F4E] mt-0.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Protected
                </span>
              </div>
            </div>

            {/* Offline Simulation Toggle */}
            <div className="rounded-xl border border-[#E8E6DF] bg-[#FAF9F5] p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#8F6F2E]" />
                <div>
                  <p className="text-[11px] font-semibold text-[#202923]">
                    Simulate Offline Mode
                  </p>
                  <p className="text-[9px] text-[#777C77]">
                    Test power-cut behavior without unplugging internet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSimulatedOffline ? 'bg-amber-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSimulatedOffline ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Pending Changes List */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#202923] flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-[#8F6F2E]" />
                  Cached Operations ({syncQueue.length})
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto rounded-xl border border-[#E8E6DF] bg-white divide-y divide-[#E8E6DF]/60 p-1">
                {syncQueue.length === 0 ? (
                  <div className="py-4 text-center text-[11px] text-[#777C77]">
                    <CheckCircle2 className="h-4 w-4 text-[#2E6F4E] mx-auto mb-1 opacity-70" />
                    All records are synchronized. No pending items.
                  </div>
                ) : (
                  syncQueue.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors rounded-lg text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded px-1 py-0.2 text-[8px] font-bold uppercase tracking-wider ${
                              item.entity === 'guest'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.entity === 'room'
                                ? 'bg-blue-100 text-blue-800'
                                : item.entity === 'reservation'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.entity}
                          </span>
                          <span className="text-[11px] font-medium text-[#202923] truncate">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] text-[#777C77]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-2 w-2" />
                            {formatElapsed(item.createdAtEpoch)}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{item.id.slice(-6)}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] rounded px-1.5 py-0.5 font-medium shrink-0 ${
                          item.status === 'failed'
                            ? 'text-red-700 bg-red-50 border border-red-200'
                            : 'text-amber-700 bg-amber-50 border border-amber-200'
                        }`}
                      >
                        {item.status === 'failed' ? 'Retry' : 'Queued'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Feedback notification */}
            {feedback && (
              <div className="rounded-lg bg-[#202923] text-white p-2 text-[11px] text-center font-medium animate-in fade-in">
                {feedback}
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between border-t border-[#E8E6DF] bg-[#FAF9F6] px-4 py-2.5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-[#777C77] hover:text-[#202923] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isSyncing || isSimulatedOffline}
              onClick={handleManualSync}
              className="flex items-center gap-1.5 rounded-xl bg-[#202923] px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`h-3 w-3 ${isSyncing ? 'animate-spin' : 'text-[#B69A65]'}`}
              />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
