'use client';

import React from 'react';
import { useHotel } from '@/lib/data-store';
import { ZapOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const {
    isOnline,
    isSimulatedOffline,
    pendingSyncCount,
    isSyncing,
    syncOfflineDataNow,
  } = useHotel();

  const isActuallyOffline = !isOnline || isSimulatedOffline;

  // Do not show banner when online and all records synced
  if (!isActuallyOffline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-amber-200 bg-amber-50/90 backdrop-blur-xs px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-200/80 text-amber-800">
            <ZapOff className="h-3 w-3" />
          </span>
          <div className="leading-snug">
            <span className="font-semibold text-amber-900">
              {isActuallyOffline
                ? 'Offline Mode Active'
                : 'Connection Restored'}
            </span>
            <span className="mx-1.5 text-amber-400">•</span>
            <span className="text-amber-800">
              {isActuallyOffline
                ? `Hotel operations remain fully functional offline. ${
                    pendingSyncCount > 0
                      ? `${pendingSyncCount} pending change${pendingSyncCount > 1 ? 's' : ''} stored locally`
                      : 'Changes are cached locally'
                  } and will auto-sync once internet reconnects.`
                : `${pendingSyncCount} pending change${pendingSyncCount > 1 ? 's' : ''} ready to sync to the live database.`}
            </span>
          </div>
        </div>

        {!isActuallyOffline && pendingSyncCount > 0 && (
          <button
            onClick={() => syncOfflineDataNow()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg bg-[#202923] px-3 py-1 text-[11px] font-medium text-white shadow-2xs hover:bg-[#161D19] transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3 w-3 ${isSyncing ? 'animate-spin text-[#B69A65]' : ''}`}
            />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
