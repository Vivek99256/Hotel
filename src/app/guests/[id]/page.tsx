'use client';

import React, { useState, useRef, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NewReservationModal } from '@/components/ui/NewReservationModal';
import { QuickStayConfirmModal } from '@/components/ui/QuickStayConfirmModal';
import {
  ArrowLeft,
  KeyRound,
  CalendarPlus,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  BedDouble,
  FileText,
  Edit3,
  Award,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Upload,
  Camera,
  ZoomIn,
  X,
  Folder,
  FolderOpen,
  ExternalLink,
  HardDrive,
  LogOut,
  Trash2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StayRecord } from '@/types/hotel';

function GuestProfileContent({ id }: { id: string }) {
  const router = useRouter();
  const { getGuestById, currentStaff, updateGuest, updateGuestDocument, checkOutGuest, deleteGuest, reservations, rooms } = useHotel();

  const guest = getGuestById(id);

  const [isRevealed, setIsRevealed] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [isQuickStayOpen, setIsQuickStayOpen] = useState(false);
  const [checkoutFeedback, setCheckoutFeedback] = useState<string | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(guest?.notes || '');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isOpeningFolder, setIsOpeningFolder] = useState(false);
  const [folderFeedback, setFolderFeedback] = useState<string | null>(null);

  const handleOpenGuestFolder = async () => {
    if (!guest) return;
    setIsOpeningFolder(true);
    setFolderFeedback(null);
    try {
      const res = await fetch('/api/open-guest-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guest.fullName,
          guestId: guest.id,
          frontImage: guest.document?.documentImageUrl,
          backImage: guest.document?.documentBackImageUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFolderFeedback('Folder opened in File Explorer');
        setTimeout(() => setFolderFeedback(null), 4000);
      } else {
        alert('Could not open folder: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Error opening local folder:', err);
      alert('Failed to open folder: ' + err.message);
    } finally {
      setIsOpeningFolder(false);
    }
  };

  // Auto-migrate any existing base64 photos to the local filesystem folder
  React.useEffect(() => {
    if (!guest || !guest.document) return;

    const autoSaveToDisk = async () => {
      const front = guest.document?.documentImageUrl;
      const back = guest.document?.documentBackImageUrl;

      let newFrontUrl = front;
      let newBackUrl = back;
      let needsUpdate = false;

      if (front && front.startsWith('data:')) {
        try {
          const res = await fetch('/api/upload-guest-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guestName: guest.fullName,
              guestId: guest.id,
              side: 'front',
              base64: front,
            }),
          });
          const d = await res.json();
          if (d.success && d.url) {
            newFrontUrl = d.url;
            needsUpdate = true;
          }
        } catch (e) {
          console.warn('Auto local save front error:', e);
        }
      }

      if (back && back.startsWith('data:')) {
        try {
          const res = await fetch('/api/upload-guest-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guestName: guest.fullName,
              guestId: guest.id,
              side: 'back',
              base64: back,
            }),
          });
          const d = await res.json();
          if (d.success && d.url) {
            newBackUrl = d.url;
            needsUpdate = true;
          }
        } catch (e) {
          console.warn('Auto local save back error:', e);
        }
      }

      if (needsUpdate) {
        updateGuestDocument(guest.id, {
          documentImageUrl: newFrontUrl,
          documentBackImageUrl: newBackUrl,
        });
      }
    };

    autoSaveToDisk();
  }, [guest?.id]);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0];
    if (!file || !guest) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('guestName', guest.fullName);
      formData.append('guestId', guest.id);
      formData.append('side', isFront ? 'front' : 'back');

      const res = await fetch('/api/upload-guest-doc', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        const fileUrl = `${data.url}?t=${Date.now()}`;
        if (isFront) {
          updateGuestDocument(guest.id, { documentImageUrl: fileUrl });
        } else {
          updateGuestDocument(guest.id, { documentBackImageUrl: fileUrl });
        }
      } else {
        alert('Could not save photo locally: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      alert('Error uploading photo: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  if (!guest) {
    return (
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-12 text-center">
        <h2 className="text-base font-semibold text-[#202923]">Guest Record Not Found</h2>
        <p className="mt-1 text-xs text-[#777C77]">
          No profile matches ID &ldquo;{id}&rdquo; in The Grand Aurelia PMS.
        </p>
        <Link
          href="/guests"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#202923] px-4 py-2 text-xs font-medium text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Guest Directory
        </Link>
      </div>
    );
  }

  const handleSaveNotes = () => {
    updateGuest(guest.id, { notes: notesDraft });
    setIsEditingNotes(false);
  };

  // Dynamic reservations / stay records for this guest
  const guestReservations = useMemo(() => {
    if (!guest) return [];
    return reservations
      .filter(
        (r) =>
          r.guestId === guest.id ||
          (r.guestName && r.guestName.trim().toLowerCase() === guest.fullName.trim().toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt || b.checkInDate).getTime() - new Date(a.createdAt || a.checkInDate).getTime());
  }, [reservations, guest]);

  const handleCheckOut = () => {
    if (!guest || !guest.currentRoomNumber) return;
    const ok = window.confirm(`Check out ${guest.fullName} from Room ${guest.currentRoomNumber}? Room will be scheduled for turnover cleaning.`);
    if (!ok) return;
    const res = checkOutGuest(guest.currentRoomNumber, 'Guest departed; folio settled at front desk.');
    if (res.success) {
      setCheckoutFeedback(`✓ ${guest.fullName} successfully checked out from Room ${guest.currentRoomNumber}.`);
      setTimeout(() => setCheckoutFeedback(null), 4500);
    } else {
      alert('Check-out failed: ' + res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {checkoutFeedback && (
        <div className="rounded-xl border border-[#C8E8D7] bg-[#E8F5E9] px-4 py-3 text-xs font-semibold text-[#2E6F4E] flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{checkoutFeedback}</span>
          </div>
          <button
            onClick={() => setCheckoutFeedback(null)}
            className="p-1 text-[#2E6F4E] hover:text-[#16432A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Back button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/guests"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#777C77] hover:text-[#202923] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Guest Directory
        </Link>

        {/* Primary Hospitality Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {!guest.currentRoomNumber ? (
            <>
              {/* Primary 1-Click Confirm Stay Button */}
              <button
                type="button"
                onClick={() => setIsQuickStayOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#161D19] transition-all group"
              >
                <KeyRound className="h-4 w-4 text-[#B69A65] group-hover:scale-110 transition-transform" />
                <span>Confirm Stay</span>
              </button>

              <Link
                href={`/check-in?guestId=${guest.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E6DF] bg-white px-3 py-2 text-xs font-medium text-[#777C77] hover:border-[#B69A65] hover:text-[#202923] hover:bg-[#FAF9F5] transition-all"
              >
                Full Check-In Wizard →
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-[#CBDFF2] bg-[#EFF5FB] px-3.5 py-1.5 text-xs font-semibold text-[#214366]">
                <span className="h-2 w-2 rounded-full bg-[#2A5580] animate-pulse" />
                In-House • Room {guest.currentRoomNumber}
              </span>
              <button
                type="button"
                onClick={handleCheckOut}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#B33A3A]/30 bg-[#FFF5F5] px-3 py-1.5 text-xs font-semibold text-[#B33A3A] hover:bg-[#FFEBEB] transition-colors shadow-2xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                Check Out Guest
              </button>
            </div>
          )}

          <button
            onClick={() => setIsNewReservationOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8E6DF] bg-white px-3.5 py-2 text-xs font-medium text-[#202923] hover:border-[#B69A65] hover:bg-[#FAF9F5] transition-all"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-[#B69A65]" />
            New Reservation
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E6DF] bg-white px-3 py-2 text-xs font-medium text-[#8C3A3A] hover:bg-[#FDF2F2] hover:border-[#E8A5A5] transition-all cursor-pointer"
            title="Delete this guest profile"
          >
            <Trash2 className="h-3.5 w-3.5 text-[#B33A3A]" />
            Delete Profile
          </button>
        </div>
      </div>

      {/* Guest Identity Header Card */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative h-18 w-18 rounded-2xl bg-[#E8E6DF] overflow-hidden shrink-0 border border-[#D9D6CC] shadow-xs">
              {guest.avatarUrl ? (
                <img src={guest.avatarUrl} alt={guest.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-serif text-2xl font-bold text-[#202923]">
                  {guest.firstName[0]}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#202923]">
                  {guest.fullName}
                </h1>
                <StatusBadge status={guest.tier} type="tier" />
                <StatusBadge status={guest.verificationStatus} type="verification" />
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-[#777C77] flex-wrap">
                <span className="font-mono bg-[#FAF9F6] border border-[#E8E6DF] px-2 py-0.5 rounded text-[#202923]">
                  Guest ID: {guest.id}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#959A95]" />
                  {guest.city}, {guest.country}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="h-3.5 w-3.5 text-[#959A95]" />
                  {guest.phoneMasked}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-[#959A95]" />
                  {guest.email}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Loyalty Metrics */}
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#E8E6DF] pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#777C77]">Total Stays</p>
              <p className="font-serif text-2xl font-medium text-[#202923] mt-0.5">{guest.totalStays}</p>
              <span className="text-[11px] text-[#959A95]">{guest.totalNights} nights total</span>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#777C77]">Lifetime Spend</p>
              <p className="font-serif text-2xl font-medium text-[#8F6F2E] mt-0.5">
                {formatCurrency(guest.lifetimeSpend)}
              </p>
              <span className="text-[11px] text-[#235F42]">High-Tier Patron</span>
            </div>
          </div>
        </div>
      </div>

      {/* Returning Guest Quick Stay Confirmation Banner */}
      {!guest.currentRoomNumber ? (
        <div className="rounded-2xl border border-[#B69A65]/35 bg-gradient-to-r from-[#FDF9EE] via-[#FAF6E9] to-[#FDF9EE] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#202923] text-[#B69A65] flex items-center justify-center shrink-0 shadow-xs">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#202923]">
                  Returning Guest Check-In (Repeat Customer)
                </span>
                <span className="bg-[#202923] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {guest.totalStays} Prior Stays
                </span>
              </div>
              <p className="text-xs text-[#777C77] mt-0.5">
                KYC documents and contact info are already saved. Click to select an available room and update the system that this guest is staying now.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickStayOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8F6F2E] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#785C24] transition-all shrink-0 active:scale-95 group"
          >
            <Sparkles className="h-4 w-4 text-[#FDE8BA] group-hover:rotate-12 transition-transform" />
            <span>Confirm Stay Now</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#CBDFF2] bg-[#EFF5FB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2A5580] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {guest.currentRoomNumber}
            </div>
            <div>
              <p className="text-xs font-bold text-[#214366]">
                Currently In-House in Room {guest.currentRoomNumber}
              </p>
              <p className="text-[11px] text-[#5A7B9D]">
                Checked-in since {formatDate(guest.lastVisitDate)} • Folio active
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckOut}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#B33A3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#9B2E2E] transition-all shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            Check Out &amp; Settle Folio
          </button>
        </div>
      )}

      {/* Two Column Layout: CRM Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Preferences & Verified Identity Documents */}
        <div className="space-y-6">
          {/* Identity Document & Compliance Section */}
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#B69A65]" />
                <h3 className="text-sm font-semibold text-[#202923]">Identity Verification</h3>
              </div>
              <StatusBadge status={guest.document?.status || 'Pending Verification'} type="verification" size="sm" />
            </div>

            {guest.document ? (
              <div className="space-y-3.5 rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777C77]">Document Type:</span>
                  <span className="font-medium text-[#202923]">{guest.document.type}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#777C77]">Document Number:</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span>
                      {isRevealed
                        ? guest.document.documentNumberFull
                        : guest.document.documentNumberMasked}
                    </span>
                    {currentStaff.permissions.canViewSensitiveDocuments && (
                      <button
                        onClick={() => setIsRevealed(!isRevealed)}
                        className="p-1 rounded text-[#777C77] hover:text-[#202923]"
                        title={isRevealed ? 'Hide full number' : 'Authorized reveal'}
                      >
                        {isRevealed ? <Lock className="h-3.5 w-3.5 text-[#B69A65]" /> : <Unlock className="h-3.5 w-3.5 text-[#777C77]" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#777C77]">Issuing Authority:</span>
                  <span className="font-medium text-[#202923]">{guest.document.issuingCountry}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#777C77]">Expiration Date:</span>
                  <span className="font-medium text-[#202923]">
                    {guest.document.expiryDate ? formatDate(guest.document.expiryDate) : 'Lifetime / No Expiry'}
                  </span>
                </div>

                {/* ID Proof Photo Storage & Interactive Upload */}
                <div className="border-t border-[#E8E6DF] pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#202923]">
                      Customer ID Proof Photo:
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenGuestFolder}
                      disabled={isOpeningFolder}
                      className="inline-flex items-center gap-1 text-[11px] text-[#8F6F2E] hover:text-[#5F4818] font-semibold hover:underline cursor-pointer transition-all active:scale-95"
                      title="Open guest photos folder in Windows File Explorer"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-[#B69A65]" />
                      <span>{isOpeningFolder ? 'Opening Folder...' : 'Open Local Folder ↗'}</span>
                    </button>
                  </div>

                  {folderFeedback && (
                    <div className="mb-2 text-center py-1 text-[11px] text-[#2E6F4E] bg-[#E8F5E9] border border-[#C8E8D7] rounded-lg font-medium animate-fadeIn">
                      ✓ {folderFeedback}
                    </div>
                  )}

                  {isUploadingPhoto && (
                    <div className="mb-2 text-center py-1 text-xs text-[#8F6F2E] bg-[#FAF5EC] rounded-lg animate-pulse">
                      Saving photo to local guest folder...
                    </div>
                  )}

                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    ref={frontFileRef}
                    accept="image/*"
                    onChange={(e) => handleUploadPhoto(e, true)}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={backFileRef}
                    accept="image/*"
                    onChange={(e) => handleUploadPhoto(e, false)}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Front Side - Click photo to open local folder directly */}
                    <div>
                      {guest.document.documentImageUrl ? (
                        <div
                          onClick={handleOpenGuestFolder}
                          className="relative group rounded-xl overflow-hidden border border-[#E8E6DF] bg-white h-28 cursor-pointer shadow-xs hover:border-[#B69A65] hover:shadow-md transition-all"
                          title="Click photo to open local folder in File Explorer"
                        >
                          <img
                            src={guest.document.documentImageUrl}
                            alt="ID Front"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {/* Hover Link Overlay */}
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white gap-1 text-xs font-semibold p-2 text-center backdrop-blur-[0.5px]">
                            <FolderOpen className="h-5 w-5 text-[#E6C687]" />
                            <span className="text-[11px] underline">Open in Local Folder ↗</span>
                          </div>
                          {/* Visible Link Badge right on the photo */}
                          <span className="absolute top-1.5 right-1.5 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1 shadow-xs border border-white/20 group-hover:bg-[#202923]">
                            <FolderOpen className="h-2.5 w-2.5 text-[#E6C687]" /> Open Folder ↗
                          </span>
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                            Front Side
                          </span>
                        </div>
                      ) : (
                        <div
                          onClick={() => frontFileRef.current?.click()}
                          className="rounded-xl border border-dashed border-[#B69A65]/60 hover:bg-[#FAF9F5] h-28 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors"
                        >
                          <Upload className="h-4 w-4 text-[#8F6F2E] mb-1" />
                          <span className="text-[11px] font-semibold text-[#202923]">Upload Front Photo</span>
                          <span className="text-[9px] text-[#777C77]">Tap to attach Aadhaar/PAN</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => frontFileRef.current?.click()}
                        className="mt-1.5 w-full flex items-center justify-center gap-1 rounded-lg border border-[#E8E6DF] bg-white py-1 text-[10px] font-medium text-[#202923] hover:bg-[#FAF9F5] transition-colors"
                      >
                        <Camera className="h-3 w-3 text-[#777C77]" />
                        {guest.document.documentImageUrl ? 'Change Front Photo' : 'Upload Front'}
                      </button>
                    </div>

                    {/* Back Side - Click photo to open local folder directly */}
                    <div>
                      {guest.document.documentBackImageUrl ? (
                        <div
                          onClick={handleOpenGuestFolder}
                          className="relative group rounded-xl overflow-hidden border border-[#E8E6DF] bg-white h-28 cursor-pointer shadow-xs hover:border-[#B69A65] hover:shadow-md transition-all"
                          title="Click photo to open local folder in File Explorer"
                        >
                          <img
                            src={guest.document.documentBackImageUrl}
                            alt="ID Back"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {/* Hover Link Overlay */}
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white gap-1 text-xs font-semibold p-2 text-center backdrop-blur-[0.5px]">
                            <FolderOpen className="h-5 w-5 text-[#E6C687]" />
                            <span className="text-[11px] underline">Open in Local Folder ↗</span>
                          </div>
                          {/* Visible Link Badge right on the photo */}
                          <span className="absolute top-1.5 right-1.5 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1 shadow-xs border border-white/20 group-hover:bg-[#202923]">
                            <FolderOpen className="h-2.5 w-2.5 text-[#E6C687]" /> Open Folder ↗
                          </span>
                          <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                            Back Side
                          </span>
                        </div>
                      ) : (
                        <div
                          onClick={() => backFileRef.current?.click()}
                          className="rounded-xl border border-dashed border-[#B69A65]/60 hover:bg-[#FAF9F5] h-28 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors"
                        >
                          <Upload className="h-4 w-4 text-[#8F6F2E] mb-1" />
                          <span className="text-[11px] font-semibold text-[#202923]">Upload Back Photo</span>
                          <span className="text-[9px] text-[#777C77]">Tap to attach Address side</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => backFileRef.current?.click()}
                        className="mt-1.5 w-full flex items-center justify-center gap-1 rounded-lg border border-[#E8E6DF] bg-white py-1 text-[10px] font-medium text-[#202923] hover:bg-[#FAF9F5] transition-colors"
                      >
                        <Camera className="h-3 w-3 text-[#777C77]" />
                        {guest.document.documentBackImageUrl ? 'Change Back Photo' : 'Upload Back'}
                      </button>
                    </div>
                  </div>

                  {/* Local Folder path on disk (clickable link) */}
                  <div
                    onClick={handleOpenGuestFolder}
                    role="button"
                    tabIndex={0}
                    className="mt-2.5 rounded-lg border border-[#E8E6DF] bg-[#FAF9F6] hover:bg-[#F4F1EA] p-2 text-[10px] text-[#777C77] flex items-center justify-between cursor-pointer transition-colors group"
                    title="Click to open this folder directly in File Explorer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Folder className="h-3.5 w-3.5 text-[#B69A65] shrink-0 group-hover:scale-105 transition-transform" />
                      <span className="truncate">
                        Folder: <strong className="font-mono text-[#202923]">public/uploads/guests/{guest.fullName}/</strong>
                      </span>
                    </div>
                    <span className="text-[9px] text-[#8F6F2E] font-semibold shrink-0 ml-2 group-hover:underline flex items-center gap-0.5">
                      Open Folder ↗
                    </span>
                  </div>
                </div>

                
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[#E8E6DF] bg-[#FAF9F6] text-center text-xs text-[#777C77]">
                
              </div>
            )}
          </div>

          {/* Hospitality Preferences Card */}
          

          {/* Concierge Confidential Notes */}
          
        </div>

        {/* Right Column (2 Cols): Stay History Timeline & Past Room Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#B69A65]" />
                <h3 className="text-sm font-semibold text-[#202923]">
                  Stay History Timeline ({guestReservations.length + (guest.currentRoomNumber ? 1 : 0)} Recorded Stays)
                </h3>
              </div>
              <span className="text-xs text-[#777C77]">
                {guest.currentRoomNumber ? '1 In-House • Folios Settled' : 'Historical Folios Settled'}
              </span>
            </div>

            <div className="divide-y divide-[#E8E6DF]/60">
              {/* If currently in-house, show live active stay card at top */}
              {guest.currentRoomNumber && (
                <div className="p-5 bg-[#F4FBF7] border-l-4 border-l-[#2E6F4E] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2E6F4E] text-white shrink-0 font-mono font-bold text-sm shadow-xs">
                        {guest.currentRoomNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-[#202923]">
                            Room {guest.currentRoomNumber}
                          </h4>
                          <span className="rounded-full bg-[#E8F5E9] border border-[#C8E8D7] px-2 py-0.5 text-[10px] font-bold text-[#2E6F4E] flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#2E6F4E] animate-pulse" />
                            Current Active Stay (In-House)
                          </span>
                        </div>
                        <p className="text-xs text-[#555E57] mt-0.5">
                          Checked-In: {formatDate(guest.lastVisitDate)} • Folio Active
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <span className="rounded-md bg-[#E8F5E9] px-2.5 py-1 text-[11px] font-bold text-[#2E6F4E]">
                        In-House
                      </span>
                      <button
                        type="button"
                        onClick={handleCheckOut}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#B33A3A]/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#B33A3A] hover:bg-[#FFF5F5] transition-colors"
                      >
                        <LogOut className="h-3 w-3" />
                        Check Out
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Reservations List */}
              {guestReservations.length > 0 ? (
                guestReservations.map((res) => (
                  <div key={res.id} className="p-5 hover:bg-[#FAF9F5] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202923] text-[#B69A65] shrink-0 font-mono font-bold text-xs">
                          {res.roomNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-[#202923]">
                              Room {res.roomNumber} ({res.roomType})
                            </h4>
                            <span className="font-mono text-[10px] text-[#777C77] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                              {res.id}
                            </span>
                            <StatusBadge status={res.status} type="reservation" size="sm" />
                          </div>
                          <p className="text-xs text-[#777C77] mt-0.5">
                            {formatDate(res.checkInDate)} — {formatDate(res.checkOutDate)} ({res.nights} {res.nights === 1 ? 'night' : 'nights'}) • {res.paymentMethod}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="font-serif text-base font-semibold text-[#202923]">
                          {formatCurrency(res.totalPrice)}
                        </span>
                        <span className="block text-[11px] text-[#2E6F4E] font-medium">
                          {res.status === 'Checked-In' ? 'Active Folio' : 'Folio Settled'}
                        </span>
                      </div>
                    </div>

                    {res.specialRequests && (
                      <div className="mt-2.5 rounded-lg border border-[#E8E6DF] bg-[#FAF9F6] p-2.5 text-xs text-[#777C77]">
                        <strong className="text-[#202923]">Notes: </strong>
                        {res.specialRequests}
                      </div>
                    )}
                  </div>
                ))
              ) : !guest.currentRoomNumber ? (
                <div className="p-8 text-center bg-[#FAF9F6] rounded-xl m-4 border border-dashed border-[#E8E6DF]">
                  <Clock className="h-8 w-8 text-[#959A95] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#202923]">Ready for 2nd / New Stay</p>
                  <p className="text-[11px] text-[#777C77] mt-0.5">
                    Previous record on file: {formatDate(guest.lastVisitDate)} ({guest.totalStays} prior stays)
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsQuickStayOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#202923] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#161D19]"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-[#B69A65]" />
                    Confirm Stay Now
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ID Proof Fullscreen Lightbox Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-[#E8E6DF] bg-[#FAF9F6]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2E6F4E]" />
                <span className="text-xs font-semibold text-[#202923]">
                  {guest.fullName} — Customer Identity Proof Photo
                </span>
              </div>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-lg text-[#777C77] hover:bg-[#E8E6DF] hover:text-[#202923]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3 bg-[#161D19] flex items-center justify-center rounded-b-xl overflow-hidden min-h-[300px]">
              <img
                src={previewImageModal}
                alt="ID Proof Large"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Stay Confirmation Modal */}
      <QuickStayConfirmModal
        isOpen={isQuickStayOpen}
        onClose={() => setIsQuickStayOpen(false)}
        guest={guest}
        onSuccess={(reservationId, roomNumber) => {
          setIsQuickStayOpen(false);
          setCheckoutFeedback(`✓ Successfully checked in ${guest.fullName} into Room ${roomNumber}! Stay record entry created.`);
          setTimeout(() => setCheckoutFeedback(null), 6000);
        }}
      />

      {/* Reservation Modal */}
      <NewReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
        preselectedGuestId={guest.id}
      />

      {/* Delete Guest Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202923]/60 backdrop-blur-[3px] animate-in fade-in"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FDF2F2] text-[#B33A3A] flex items-center justify-center shrink-0 border border-[#FBE0B9]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#202923]">Delete Guest Profile?</h3>
                <p className="text-xs text-[#777C77]">This action cannot be undone</p>
              </div>
            </div>

            <div className="text-xs text-[#555E57] bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E8E6DF] space-y-1">
              <p>
                Are you sure you want to permanently delete <strong>{guest.fullName}</strong> ({guest.id})?
              </p>
              {guest.currentRoomNumber && (
                <p className="text-[#B33A3A] font-semibold pt-1">
                  ⚠️ This guest is currently in Room {guest.currentRoomNumber}. The room will be immediately released to Available.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl border border-[#E8E6DF] px-4 py-2 text-xs font-semibold text-[#777C77] hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteGuest(guest.id);
                  setIsDeleteModalOpen(false);
                  router.push('/guests');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#B33A3A] px-4 py-2 text-xs font-bold text-white hover:bg-[#962A2A] transition-colors shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <React.Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white border border-[#E8E6DF]" />}>
      <GuestProfileContent id={resolvedParams.id} />
    </React.Suspense>
  );
}

