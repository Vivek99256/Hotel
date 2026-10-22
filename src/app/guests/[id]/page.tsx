'use client';

import React, { useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHotel } from '@/lib/data-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NewReservationModal } from '@/components/ui/NewReservationModal';
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
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StayRecord } from '@/types/hotel';

function GuestProfileContent({ id }: { id: string }) {
  const router = useRouter();
  const { getGuestById, currentStaff, updateGuest, updateGuestDocument } = useHotel();

  const guest = getGuestById(id);

  const [isRevealed, setIsRevealed] = useState(false);
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(guest?.notes || '');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0];
    if (!file || !guest) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (isFront) {
          updateGuestDocument(guest.id, { documentImageUrl: reader.result });
        } else {
          updateGuestDocument(guest.id, { documentBackImageUrl: reader.result });
        }
      }
    };
    reader.readAsDataURL(file);
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

  // Mock luxury stay history timeline
  const stayTimeline: StayRecord[] = [
    {
      id: 'STY-2026-09',
      roomNumber: guest.currentRoomNumber || '401',
      roomType: 'Presidential Penthouse Suite',
      checkInDate: guest.lastVisitDate,
      checkOutDate: '2026-09-24',
      totalNights: 6,
      totalSpent: 14400,
      folioStatus: 'Settled',
      rating: 5,
      feedback: 'Exceptional personalized butler service and champagne pairing.',
    },
    {
      id: 'STY-2026-05',
      roomNumber: '302',
      roomType: 'Executive Grand Suite',
      checkInDate: '2026-05-14',
      checkOutDate: '2026-05-19',
      totalNights: 5,
      totalSpent: 4750,
      folioStatus: 'Settled',
      rating: 5,
    },
    {
      id: 'STY-2025-11',
      roomNumber: '101',
      roomType: 'Royal Oceanfront Villa',
      checkInDate: '2025-11-20',
      checkOutDate: '2025-11-26',
      totalNights: 6,
      totalSpent: 11100,
      folioStatus: 'Settled',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-6">
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
            <Link
              href={`/check-in?guestId=${guest.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#202923] px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-[#161D19] transition-all"
            >
              <KeyRound className="h-3.5 w-3.5 text-[#B69A65]" />
              Check In Returning Guest
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-[#CBDFF2] bg-[#EFF5FB] px-3.5 py-1.5 text-xs font-semibold text-[#214366]">
              <span className="h-2 w-2 rounded-full bg-[#2A5580] animate-pulse" />
              In-House • Room {guest.currentRoomNumber}
            </span>
          )}

          <button
            onClick={() => setIsNewReservationOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E8E6DF] bg-white px-3.5 py-2 text-xs font-medium text-[#202923] hover:border-[#B69A65] hover:bg-[#FAF9F5] transition-all"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-[#B69A65]" />
            New Reservation
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
                    <span className="text-[10px] text-[#2E6F4E] font-medium bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                      Archived in Live Supabase
                    </span>
                  </div>

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
                    {/* Front Side */}
                    <div>
                      {guest.document.documentImageUrl ? (
                        <div
                          onClick={() => setPreviewImageModal(guest.document?.documentImageUrl || null)}
                          className="relative group rounded-xl overflow-hidden border border-[#E8E6DF] bg-white h-28 cursor-pointer shadow-xs hover:border-[#B69A65] transition-all"
                        >
                          <img
                            src={guest.document.documentImageUrl}
                            alt="ID Front"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white gap-1 text-xs font-medium">
                            <ZoomIn className="h-4 w-4" /> Zoom / View
                          </div>
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

                    {/* Back Side */}
                    <div>
                      {guest.document.documentBackImageUrl ? (
                        <div
                          onClick={() => setPreviewImageModal(guest.document?.documentBackImageUrl || null)}
                          className="relative group rounded-xl overflow-hidden border border-[#E8E6DF] bg-white h-28 cursor-pointer shadow-xs hover:border-[#B69A65] transition-all"
                        >
                          <img
                            src={guest.document.documentBackImageUrl}
                            alt="ID Back"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white gap-1 text-xs font-medium">
                            <ZoomIn className="h-4 w-4" /> Zoom / View
                          </div>
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
                </div>

                <div className="border-t border-[#E8E6DF] pt-2 text-[11px] text-[#959A95] flex items-center justify-between">
                  <span>Verified by {guest.document.verifiedBy || 'Priya Patel'}</span>
                  <span className="text-[#2E6F4E] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Encrypted & Stored
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[#E8E6DF] bg-[#FAF9F6] text-center text-xs text-[#777C77]">
                <ShieldAlert className="h-6 w-6 text-[#A66719] mx-auto mb-2" />
                No document on file. Verification requested upon check-in.
              </div>
            )}
          </div>

          {/* Hospitality Preferences Card */}
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#B69A65]" />
              <h3 className="text-sm font-semibold text-[#202923]">Guest Preferences</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#E8E6DF]/60 pb-2">
                <span className="text-[#777C77]">Pillow Selection:</span>
                <span className="font-medium text-[#202923]">
                  {guest.preferences.pillowType || 'Hypoallergenic Feather'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#E8E6DF]/60 pb-2">
                <span className="text-[#777C77]">Floor Location:</span>
                <span className="font-medium text-[#202923]">
                  {guest.preferences.floorPreference || 'High Floor'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#E8E6DF]/60 pb-2">
                <span className="text-[#777C77]">Target Climate:</span>
                <span className="font-medium text-[#202923]">
                  {guest.preferences.roomTemperature || '21.0°C'}
                </span>
              </div>

              <div className="border-b border-[#E8E6DF]/60 pb-2">
                <span className="text-[#777C77] block mb-1">Welcome Amenity:</span>
                <span className="font-medium text-[#8F6F2E]">
                  {guest.preferences.welcomeAmenity || 'Seasonal artisanal treats & mineral water'}
                </span>
              </div>

              {guest.preferences.dietaryRestrictions && guest.preferences.dietaryRestrictions.length > 0 && (
                <div>
                  <span className="text-[#777C77] block mb-1.5">Dietary Notes:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {guest.preferences.dietaryRestrictions.map((diet, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-[#E8E6DF] bg-[#FAF9F6] px-2 py-0.5 text-[11px] font-medium text-[#202923]"
                      >
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Concierge Confidential Notes */}
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#B69A65]" />
                <h3 className="text-sm font-semibold text-[#202923]">Concierge Notes</h3>
              </div>
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-xs text-[#8F6F2E] hover:underline flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                {isEditingNotes ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E6DF] p-2.5 text-xs text-[#202923] focus:border-[#B69A65] focus:outline-none"
                />
                <button
                  onClick={handleSaveNotes}
                  className="rounded-lg bg-[#202923] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#161D19]"
                >
                  Save Notes
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#777C77] leading-relaxed bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E6DF]">
                {guest.notes || 'No confidential notes recorded for this guest.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column (2 Cols): Stay History Timeline & Past Room Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-[#B69A65]" />
                <h3 className="text-sm font-semibold text-[#202923]">
                  Stay History Timeline ({stayTimeline.length} Recorded Visits)
                </h3>
              </div>
              <span className="text-xs text-[#777C77]">Historical Folios Settled</span>
            </div>

            <div className="divide-y divide-[#E8E6DF]/60">
              {stayTimeline.map((stay) => (
                <div key={stay.id} className="p-5 hover:bg-[#FAF9F5] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202923] text-[#B69A65] shrink-0 font-mono font-bold text-xs">
                        {stay.roomNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#202923]">{stay.roomType}</h4>
                        <p className="text-xs text-[#777C77]">
                          {formatDate(stay.checkInDate)} — {formatDate(stay.checkOutDate)} ({stay.totalNights} nights)
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="font-serif text-base font-semibold text-[#202923]">
                        {formatCurrency(stay.totalSpent)}
                      </span>
                      <span className="block text-[11px] text-[#2E6F4E] font-medium">
                        Folio Settled
                      </span>
                    </div>
                  </div>

                  {stay.feedback && (
                    <div className="mt-3 rounded-xl border border-[#E8E6DF] bg-[#FAF9F6] p-3 text-xs text-[#777C77]">
                      <span className="font-semibold text-[#202923]">Guest Impression: </span>
                      &ldquo;{stay.feedback}&rdquo;
                    </div>
                  )}
                </div>
              ))}
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

      {/* Reservation Modal */}
      <NewReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
        preselectedGuestId={guest.id}
      />
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

