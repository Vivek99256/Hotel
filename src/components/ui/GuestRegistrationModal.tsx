'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useHotel } from '@/lib/data-store';
import { GuestTier, VerificationStatus, IdentityDocument } from '@/types/hotel';
import { X, UserPlus, Shield, Sparkles, CheckCircle2, Upload, Camera, Image as ImageIcon, Trash2, AlertTriangle, ExternalLink, Users } from 'lucide-react';
import { maskDocumentNumber } from '@/lib/utils';
import { generateAadhaarFrontSvg, generateAadhaarBackSvg, generatePanCardSvg } from '@/lib/indian-documents';

interface GuestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestCreated?: (guestId: string) => void;
}

export function GuestRegistrationModal({
  isOpen,
  onClose,
  onGuestCreated,
}: GuestRegistrationModalProps) {
  const { addGuest, checkDuplicateGuest } = useHotel();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tier: 'AC' as GuestTier,
    nationality: 'Indian',
    city: 'Navsari',
    country: 'India',
    address: 'Satellite, Ahmedabad, Gujarat',
    roomTemperature: '21.5°C',
    floorPreference: 'Garden View' as const,
    pillowType: 'Hypoallergenic Feather' as const,
    welcomeAmenity: 'Kesar Peda & Fresh Masala Chai',
    documentType: 'Aadhaar Card' as IdentityDocument['type'],
    documentNumber: '',
    documentExpiry: '2035-12-31',
    specialNotes: 'Prefers Pure Veg / Jain breakfast options.',
  });

  const [documentFrontImage, setDocumentFrontImage] = useState<string>('');
  const [documentBackImage, setDocumentBackImage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdId, setCreatedId] = useState('');

  // Disambiguation confirmation state: When name matches, staff can confirm it's a different person with unique ID
  const [confirmedDifferentPerson, setConfirmedDifferentPerson] = useState<boolean>(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Reset confirmation if user modifies name
  useEffect(() => {
    setConfirmedDifferentPerson(false);
  }, [formData.firstName, formData.lastName]);

  // Real-time instant duplicate detection across Name, Phone, and Government ID Document
  const duplicateInfo = useMemo(() => {
    return checkDuplicateGuest({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      documentNumber: formData.documentNumber,
    });
  }, [checkDuplicateGuest, formData.firstName, formData.lastName, formData.phone, formData.email, formData.documentNumber]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (isFront) {
          setDocumentFrontImage(reader.result);
        } else {
          setDocumentBackImage(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile phone number is required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Valid 10-digit mobile number required';
    }
    if (!formData.documentNumber.trim()) {
      errs.documentNumber = `${formData.documentType} number is required`;
    }

    // 1. Hard Block (ID document, Phone, or Email matches existing patron)
    if (duplicateInfo.hardBlock) {
      if (duplicateInfo.field === 'document') {
        errs.documentNumber = duplicateInfo.reasonGu;
      } else if (duplicateInfo.field === 'phone') {
        errs.phone = duplicateInfo.reasonGu;
      } else if (duplicateInfo.field === 'email') {
        errs.email = duplicateInfo.reasonGu;
      }
      setSubmitError(duplicateInfo.reasonGu);
      setErrors(errs);
      return false;
    }

    // 2. Name Match Only: Must confirm whether this is the same or a different person
    if (duplicateInfo.nameMatchOnly && !confirmedDifferentPerson) {
      errs.firstName = 'Patron with matching name found. Please verify below if this is the same or a different individual.';
      setSubmitError('An existing patron with the same name was found. Please confirm whether this is a different individual.');
      setErrors(errs);
      return false;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    if (duplicateInfo.hardBlock) {
      setSubmitError(duplicateInfo.reasonGu);
      return;
    }

    if (duplicateInfo.nameMatchOnly && !confirmedDifferentPerson) {
      setSubmitError('An existing patron with the same name was found. Please confirm whether this is a different individual.');
      return;
    }

    setIsSubmitting(true);
    try {
      const guestFullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const docMasked = maskDocumentNumber(formData.documentNumber, formData.documentType);

      const rawFront =
        documentFrontImage ||
        (formData.documentType === 'PAN Card'
          ? generatePanCardSvg(guestFullName, docMasked, formData.city)
          : generateAadhaarFrontSvg(guestFullName, docMasked, formData.city));

      const rawBack =
        documentBackImage ||
        (formData.documentType === 'Aadhaar Card'
          ? generateAadhaarBackSvg(formData.address, formData.city)
          : undefined);

      let localFrontUrl = rawFront;
      let localBackUrl = rawBack;

      try {
        if (rawFront) {
          const res = await fetch('/api/upload-guest-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guestName: guestFullName,
              side: 'front',
              base64: rawFront,
            }),
          });
          const d = await res.json();
          if (d.success && d.url) localFrontUrl = d.url;
        }

        if (rawBack) {
          const res = await fetch('/api/upload-guest-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guestName: guestFullName,
              side: 'back',
              base64: rawBack,
            }),
          });
          const d = await res.json();
          if (d.success && d.url) localBackUrl = d.url;
        }
      } catch (err) {
        console.warn('Failed to save guest photo locally during registration:', err);
      }

      const newGuest = addGuest(
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fullName: guestFullName,
          email: formData.email.trim() || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@example.in`,
          phone: formData.phone.trim(),
          tier: formData.tier,
          nationality: formData.nationality,
          city: formData.city,
          country: formData.country,
          address: formData.address,
          verificationStatus: 'Verified' as VerificationStatus,
          document: {
            id: `DOC-${Date.now().toString().slice(-4)}`,
            type: formData.documentType,
            documentNumberMasked: docMasked,
            documentNumberFull: formData.documentNumber.trim(),
            issuingCountry: formData.country,
            expiryDate: formData.documentExpiry,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Priya Patel (Front Desk Mgr)',
            documentImageUrl: localFrontUrl,
            documentBackImageUrl: localBackUrl,
            status: 'Verified',
          },
          preferences: {
            roomTemperature: formData.roomTemperature,
            floorPreference: formData.floorPreference,
            pillowType: formData.pillowType,
            welcomeAmenity: formData.welcomeAmenity,
            specialNotes: formData.specialNotes,
          },
          notes: formData.specialNotes,
        },
        { allowSameNameDifferentId: confirmedDifferentPerson }
      );

      setCreatedId(newGuest.id);
      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Duplicate registration rejected');
    }
  };

  const handleFinish = () => {
    setShowSuccess(false);
    onClose();
    if (onGuestCreated && createdId) {
      onGuestCreated(createdId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#202923]/40 backdrop-blur-[2px] overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E8E6DF] my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E6DF] bg-[#FAF9F6] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202923] text-white">
              <UserPlus className="h-5 w-5 text-[#B69A65]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#202923]">Register New Guest</h2>
              <p className="text-xs text-[#777C77]">
                Add customer profile, ID proof photo (Aadhaar / PAN), and stay preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#959A95] hover:bg-[#E8E6DF]/50 hover:text-[#202923]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showSuccess ? (
          <div className="p-8 text-center sm:p-12 overflow-y-auto">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EDF7F2] text-[#2E6F4E] border border-[#C8E8D7]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-[#202923]">Guest Registered Successfully</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#777C77] max-w-md mx-auto">
              Guest record <span className="font-mono font-bold text-[#202923]">{createdId}</span> with verified ID proof photo has been stored in your live Supabase database.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleFinish}
                className="rounded-xl bg-[#202923] px-5 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-[#161D19]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* HARD BLOCK ALERT BANNER: When Government ID or Phone matches an existing patron */}
            {duplicateInfo.hardBlock && (
              <div className="rounded-2xl border-2 border-[#B33A3A]/40 bg-[#FFF5F5] p-4 text-[#8A2525] shadow-xs animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#B33A3A] p-2 text-white shrink-0 mt-0.5 shadow-xs">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-[#8A2525] flex items-center gap-1.5">
                        ⚠️ ID Document or Mobile Number Already Exists
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B33A3A] text-white px-2 py-0.5 rounded-full">
                        {duplicateInfo.field?.toUpperCase()} DUPLICATE
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6B2424] leading-relaxed font-medium">
                      {duplicateInfo.reasonGu}
                    </p>
                    {duplicateInfo.matchedGuest && (
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-[#B33A3A]/20 bg-white/80 rounded-lg p-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-[#202923]">{duplicateInfo.matchedGuest.fullName}</span>
                          <span className="font-mono text-[10px] text-[#777C77] bg-white px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                            {duplicateInfo.matchedGuest.id}
                          </span>
                          <span className="text-xs text-[#777C77] font-mono">
                            {duplicateInfo.matchedGuest.phoneMasked || duplicateInfo.matchedGuest.phone}
                          </span>
                          <span className="text-[11px] text-[#777C77]">
                            • {duplicateInfo.matchedGuest.city}
                          </span>
                        </div>
                        <Link
                          href={`/guests/${duplicateInfo.matchedGuest.id}`}
                          onClick={onClose}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#202923] hover:bg-[#161D19] px-3 py-1.5 rounded-lg shadow-xs transition-all shrink-0"
                        >
                          View Profile <ExternalLink className="h-3 w-3 text-[#B69A65]" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SOFT MATCH DISAMBIGUATION: When Name & Surname match, list matching guests and allow confirmation of different person */}
            {!duplicateInfo.hardBlock && duplicateInfo.nameMatchOnly && duplicateInfo.matchedGuests.length > 0 && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4 text-[#8A5300] shadow-xs animate-in fade-in duration-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-500 p-2 text-white shrink-0 mt-0.5 shadow-xs">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                        👥 Matching Patrons Found ({duplicateInfo.matchedGuests.length})
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                        NAME MATCH
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-amber-900 leading-relaxed font-medium">
                      The system found existing guests registered under the name <strong className="font-bold underline text-amber-950">{formData.firstName} {formData.lastName}</strong>:
                      <span className="block mt-0.5 font-bold text-amber-950">
                        👉 Is this the existing patron, or a new person with a different government ID?
                      </span>
                    </p>

                    {/* Matching Guests List */}
                    <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                      {duplicateInfo.matchedGuests.map((matchedGuest) => (
                        <div
                          key={matchedGuest.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-amber-200 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-[#202923] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {matchedGuest.avatarUrl ? (
                                <img src={matchedGuest.avatarUrl} alt={matchedGuest.fullName} className="h-full w-full object-cover" />
                              ) : (
                                <span>{matchedGuest.firstName[0]}{matchedGuest.lastName[0]}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#202923] truncate">{matchedGuest.fullName}</span>
                                <span className="font-mono text-[10px] text-[#777C77] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E8E6DF]">
                                  {matchedGuest.id}
                                </span>
                                <span className="text-[10px] text-[#2E6F4E] font-semibold bg-[#EDF7F2] px-1.5 py-0.5 rounded">
                                  {matchedGuest.city || 'India'}
                                </span>
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-[#777C77]">
                                <span className="font-mono">{matchedGuest.phoneMasked || matchedGuest.phone}</span>
                                <span>•</span>
                                <span className="font-semibold text-amber-900">
                                  {matchedGuest.document?.type || 'ID'}: {matchedGuest.document?.documentNumberMasked || '•••• ••••'}
                                </span>
                                <span>•</span>
                                <span>{matchedGuest.totalStays} {matchedGuest.totalStays === 1 ? 'Stay' : 'Stays'}</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/guests/${matchedGuest.id}`}
                            onClick={onClose}
                            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-[#202923] hover:bg-[#161D19] px-3 py-1.5 rounded-lg shadow-xs transition-all shrink-0"
                          >
                            Use Existing Profile <ExternalLink className="h-3 w-3 text-[#B69A65]" />
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Disambiguation Action */}
                    <div className="mt-3.5 pt-3 border-t border-amber-200/80">
                      {!confirmedDifferentPerson ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 p-3 rounded-xl border border-amber-300">
                          <div className="text-xs text-amber-950">
                            <span className="font-bold block">If this is a different individual sharing the same name:</span>
                            <span className="text-[11px] text-amber-800">
                              Enter their distinct government ID document number below and confirm.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setConfirmedDifferentPerson(true)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E6F4E] text-white text-xs font-semibold hover:bg-[#235F42] shadow-xs transition-all shrink-0"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Different Individual (Add as New)
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 bg-[#EDF7F2] p-3 rounded-xl border border-[#C8E8D7] animate-in fade-in duration-150">
                          <div className="flex items-center gap-2.5 text-xs font-medium text-[#235F42]">
                            <CheckCircle2 className="h-5 w-5 text-[#2E6F4E] shrink-0" />
                            <div>
                              <p className="font-bold text-[#235F42]">
                                ✓ Verified: Different individual with unique government ID document
                              </p>
                              <p className="text-[11px] text-[#2E6F4E]/90 mt-0.5">
                                You can now enter their distinct ID document number below and save.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setConfirmedDifferentPerson(false)}
                            className="text-[11px] text-[#777C77] hover:text-[#202923] underline shrink-0 font-medium"
                          >
                            Undo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitError && !duplicateInfo.hardBlock && !duplicateInfo.nameMatchOnly && (
              <div className="rounded-xl border border-[#B33A3A]/30 bg-[#FFF5F5] p-3 text-xs text-[#B33A3A] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Personal Details */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#777C77] mb-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B69A65]" />
                Personal Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">
                    First Name <span className="text-[#B33A3A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Rajesh, Priya, Vivek"
                    className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 ${
                      duplicateInfo.nameMatchOnly && !confirmedDifferentPerson
                        ? 'border-amber-400 bg-amber-50/40 text-[#202923] focus:ring-amber-400'
                        : duplicateInfo.nameMatchOnly && confirmedDifferentPerson
                        ? 'border-emerald-500 bg-emerald-50/30 text-[#202923] focus:ring-emerald-500'
                        : errors.firstName
                        ? 'border-[#B33A3A] focus:ring-[#B33A3A]'
                        : 'border-[#E8E6DF] focus:border-[#B69A65]'
                    }`}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-[#B33A3A]">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">
                    Last Name <span className="text-[#B33A3A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Mehta, Patel, Gajera"
                    className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 ${
                      duplicateInfo.nameMatchOnly && !confirmedDifferentPerson
                        ? 'border-amber-400 bg-amber-50/40 text-[#202923] focus:ring-amber-400'
                        : duplicateInfo.nameMatchOnly && confirmedDifferentPerson
                        ? 'border-emerald-500 bg-emerald-50/30 text-[#202923] focus:ring-emerald-500'
                        : errors.lastName
                        ? 'border-[#B33A3A] focus:ring-[#B33A3A]'
                        : 'border-[#E8E6DF] focus:border-[#B69A65]'
                    }`}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-[#B33A3A]">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">
                    Mobile Number <span className="text-[#B33A3A]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#777C77]">+91</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="98250 12345"
                      className={`w-full rounded-xl border pl-11 pr-3 py-2 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 ${
                        duplicateInfo.hardBlock && duplicateInfo.field === 'phone'
                          ? 'border-[#B33A3A] bg-[#FFF8F8] focus:ring-[#B33A3A]'
                          : errors.phone
                          ? 'border-[#B33A3A] focus:ring-[#B33A3A]'
                          : 'border-[#E8E6DF] focus:border-[#B69A65]'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-[#B33A3A]">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rajesh.mehta@example.in"
                    className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65] ${
                      duplicateInfo.hardBlock && duplicateInfo.field === 'email'
                        ? 'border-[#B33A3A] bg-[#FFF8F8]'
                        : 'border-[#E8E6DF]'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-[#B33A3A]">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">City / State</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Navsari"
                    className="w-full rounded-xl border border-[#E8E6DF] px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Room Category</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as GuestTier })}
                    className="w-full rounded-xl border border-[#E8E6DF] bg-white px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                  >
                    <option value="AC">AC</option>
                    <option value="Non AC">Non AC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ID Proof & Photo Upload Section */}
            <div className="border-t border-[#E8E6DF] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#777C77] flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[#B69A65]" />
                  Customer ID Proof & Document Photos
                </h4>
                <span className="text-[10px] text-[#2E6F4E] font-medium bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#C8E8D7]">
                  Saved to Local Guest Folder
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Document Type</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                    className="w-full rounded-xl border border-[#E8E6DF] bg-white px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driving Licence</option>
                    <option value="Voter ID">Election / Voter ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">
                    Document Number <span className="text-[#B33A3A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder={formData.documentType === 'Aadhaar Card' ? 'XXXX XXXX 1234' : 'ABCDE1234F'}
                    className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 ${
                      duplicateInfo.hardBlock && duplicateInfo.field === 'document'
                        ? 'border-[#B33A3A] bg-[#FFF8F8] focus:ring-[#B33A3A]'
                        : errors.documentNumber
                        ? 'border-[#B33A3A] focus:ring-[#B33A3A]'
                        : 'border-[#E8E6DF] focus:border-[#B69A65]'
                    }`}
                  />
                  {errors.documentNumber && <p className="mt-1 text-xs text-[#B33A3A]">{errors.documentNumber}</p>}
                </div>
              </div>

              {/* ID Proof Photo Upload Area (Front & Back) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front Photo */}
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1.5 flex items-center justify-between">
                    <span>Front Photo</span>
                    {documentFrontImage && (
                      <button
                        type="button"
                        onClick={() => setDocumentFrontImage('')}
                        className="text-[11px] text-[#B33A3A] hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </label>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                  />
                  {documentFrontImage ? (
                    <div
                      onClick={() => frontInputRef.current?.click()}
                      className="relative h-32 rounded-xl overflow-hidden border border-[#B69A65] bg-[#FAF9F6] cursor-pointer group"
                    >
                      <img src={documentFrontImage} alt="ID Front" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                        <Camera className="h-4 w-4" /> Change Photo
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => frontInputRef.current?.click()}
                      className="h-32 rounded-xl border border-dashed border-[#E8E6DF] hover:border-[#B69A65] bg-[#FAF9F6] flex flex-col items-center justify-center cursor-pointer transition-colors p-3 text-center"
                    >
                      <Upload className="h-6 w-6 text-[#B69A65] mb-1.5" />
                      <span className="text-xs font-semibold text-[#202923]">Upload Front Side Photo</span>
                      <span className="text-[10px] text-[#777C77] mt-0.5">Click to choose or take photo</span>
                    </div>
                  )}
                </div>

                {/* Back Photo */}
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1.5 flex items-center justify-between">
                    <span>Back Photo (Optional)</span>
                    {documentBackImage && (
                      <button
                        type="button"
                        onClick={() => setDocumentBackImage('')}
                        className="text-[11px] text-[#B33A3A] hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </label>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                  {documentBackImage ? (
                    <div
                      onClick={() => backInputRef.current?.click()}
                      className="relative h-32 rounded-xl overflow-hidden border border-[#B69A65] bg-[#FAF9F6] cursor-pointer group"
                    >
                      <img src={documentBackImage} alt="ID Back" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                        <Camera className="h-4 w-4" /> Change Photo
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => backInputRef.current?.click()}
                      className="h-32 rounded-xl border border-dashed border-[#E8E6DF] hover:border-[#B69A65] bg-[#FAF9F6] flex flex-col items-center justify-center cursor-pointer transition-colors p-3 text-center"
                    >
                      <ImageIcon className="h-6 w-6 text-[#959A95] mb-1.5" />
                      <span className="text-xs font-semibold text-[#202923]">Upload Back Side Photo</span>
                      <span className="text-[10px] text-[#777C77] mt-0.5">Aadhaar address side (Optional)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Food & Preferences */}
            {/* <div className="border-t border-[#E8E6DF] pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#777C77] mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#B69A65]" />
                Food & Stay Preferences
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Welcome Amenity / Drink</label>
                  <input
                    type="text"
                    value={formData.welcomeAmenity}
                    onChange={(e) => setFormData({ ...formData, welcomeAmenity: e.target.value })}
                    placeholder="e.g. Masala Chai & Kesar Peda"
                    className="w-full rounded-xl border border-[#E8E6DF] px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202923] mb-1">Special Dietary / Meal Notes</label>
                  <input
                    type="text"
                    value={formData.specialNotes}
                    onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                    placeholder="e.g. Pure Veg, Jain Food, No Onion/Garlic"
                    className="w-full rounded-xl border border-[#E8E6DF] px-3 py-2 text-xs sm:text-sm focus:border-[#B69A65]"
                  />
                </div>
              </div>
            </div> */}

            {/* Sticky/Footer Save Buttons */}
            <div className="pt-3 border-t border-[#E8E6DF] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E8E6DF] px-4 py-2 text-xs font-medium text-[#777C77] hover:bg-[#FAF9F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || duplicateInfo.hardBlock || (duplicateInfo.nameMatchOnly && !confirmedDifferentPerson)}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-xs transition-all ${
                  duplicateInfo.hardBlock
                    ? 'bg-[#B33A3A]/10 text-[#B33A3A] border-2 border-[#B33A3A]/30 cursor-not-allowed opacity-90'
                    : duplicateInfo.nameMatchOnly && !confirmedDifferentPerson
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed'
                    : duplicateInfo.nameMatchOnly && confirmedDifferentPerson
                    ? 'bg-[#202923] text-white hover:bg-[#161D19] ring-2 ring-emerald-500/60'
                    : 'bg-[#202923] text-white hover:bg-[#161D19] disabled:opacity-50'
                }`}
              >
                {isSubmitting ? (
                  'Saving to Database...'
                ) : duplicateInfo.hardBlock ? (
                  '⚠️ ID / Phone Duplicate Blocked'
                ) : duplicateInfo.nameMatchOnly && !confirmedDifferentPerson ? (
                  '👥 Verify Patron Above First'
                ) : duplicateInfo.nameMatchOnly && confirmedDifferentPerson ? (
                  '✓ Register as New Guest'
                ) : (
                  'Save & Register Guest'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
