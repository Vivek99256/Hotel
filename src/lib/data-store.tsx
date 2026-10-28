'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  Guest,
  Room,
  Reservation,
  AuditLog,
  StaffUser,
  HotelNotification,
  IdentityDocument,
  CheckInPayload,
  RoomStatus,
  RoomType,
  GuestTier,
} from '@/types/hotel';
import {
  INITIAL_GUESTS,
  INITIAL_ROOMS,
  INITIAL_RESERVATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STAFF,
} from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

export interface DuplicateCheckParams {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  documentNumber?: string;
  excludeGuestId?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  hardBlock: boolean;
  nameMatchOnly: boolean;
  matchedGuests: Guest[];
  matchedGuest?: Guest;
  field?: 'name' | 'phone' | 'document' | 'email';
  reason: string;
  reasonGu: string;
}

export function deduplicateGuests(guestsList: Guest[]): Guest[] {
  const seenIds = new Set<string>();
  const seenPhones = new Set<string>();
  const seenDocs = new Set<string>();
  const result: Guest[] = [];

  for (const g of guestsList) {
    if (!g) continue;
    // Filter out legacy foreign test guests
    if (['GST-8024', 'GST-7819', 'GST-6540', 'GST-5211', 'GST-4098'].includes(g.id)) continue;
    if (g.fullName?.includes('Alistair') || g.fullName?.includes('Kensington')) continue;

    if (seenIds.has(g.id)) continue;

    // Normalize phone (last 10 digits)
    const phoneDigits = (g.phone || '').replace(/\D/g, '');
    const phone10 = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : '';
    if (phone10 && seenPhones.has(phone10)) continue;

    // Normalize Document Number
    const rawDoc = g.document?.documentNumberFull || '';
    const cleanDoc = rawDoc.replace(/[\s\-_./\\]/g, '').toUpperCase();
    if (cleanDoc && cleanDoc.length >= 8 && seenDocs.has(cleanDoc)) continue;

    seenIds.add(g.id);
    if (phone10) seenPhones.add(phone10);
    if (cleanDoc && cleanDoc.length >= 8) seenDocs.add(cleanDoc);
    result.push(g);
  }

  return result;
}

export function checkDuplicateGuest(
  guestsList: Guest[],
  input: DuplicateCheckParams
): DuplicateCheckResult {
  if (!guestsList || guestsList.length === 0) {
    return { isDuplicate: false, hardBlock: false, nameMatchOnly: false, matchedGuests: [], reason: '', reasonGu: '' };
  }

  // 1. Check ID Document Number (Aadhaar / PAN / Passport) -> HARD BLOCK
  const rawDoc = (input.documentNumber || '').trim();
  const cleanDoc = rawDoc.replace(/[\s\-_./\\]/g, '').toUpperCase();
  if (cleanDoc.length >= 4) {
    for (const g of guestsList) {
      if (input.excludeGuestId && g.id === input.excludeGuestId) continue;
      const gFull = (g.document?.documentNumberFull || '').replace(/[\s\-_./\\]/g, '').toUpperCase();
      const gMasked = (g.document?.documentNumberMasked || '').replace(/[\s\-_./\\]/g, '').toUpperCase();

      if (gFull && cleanDoc === gFull) {
        return {
          isDuplicate: true,
          hardBlock: true,
          nameMatchOnly: false,
          matchedGuests: [g],
          matchedGuest: g,
          field: 'document',
          reason: `Document number ${rawDoc} is already registered to "${g.fullName}" (${g.id}). Two individuals cannot have the same ID number.`,
          reasonGu: `Government ID document number (${rawDoc}) is already registered to patron "${g.fullName}" (${g.id}). ID numbers must be strictly unique.`,
        };
      }

      if (cleanDoc.length >= 8 && gMasked) {
        const last4 = cleanDoc.slice(-4);
        const gLast4 = gMasked.slice(-4);
        if (last4 === gLast4 && gFull && gFull === cleanDoc) {
          return {
            isDuplicate: true,
            hardBlock: true,
            nameMatchOnly: false,
            matchedGuests: [g],
            matchedGuest: g,
            field: 'document',
            reason: `Document number ending in ${last4} matches existing guest "${g.fullName}" (${g.id}).`,
            reasonGu: `This document number matches existing patron "${g.fullName}" (${g.id}). Duplicate ID documents are not permitted.`,
          };
        }
      }
    }
  }

  // 2. Check Mobile Phone Number (10 digits) -> HARD BLOCK
  const rawPhone = (input.phone || '').trim();
  const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
  if (cleanPhoneDigits.length >= 10) {
    const inputPhone10 = cleanPhoneDigits.slice(-10);
    for (const g of guestsList) {
      if (input.excludeGuestId && g.id === input.excludeGuestId) continue;
      const gPhoneDigits = (g.phone || '').replace(/\D/g, '');
      const gPhone10 = gPhoneDigits.length >= 10 ? gPhoneDigits.slice(-10) : '';

      if (gPhone10 && gPhone10 === inputPhone10) {
        return {
          isDuplicate: true,
          hardBlock: true,
          nameMatchOnly: false,
          matchedGuests: [g],
          matchedGuest: g,
          field: 'phone',
          reason: `Mobile number +91 ${inputPhone10} is already registered to "${g.fullName}" (${g.id}).`,
          reasonGu: `Mobile number (+91 ${inputPhone10}) is already registered to patron "${g.fullName}" (${g.id}). Mobile numbers must be unique.`,
        };
      }
    }
  }

  // 3. Check Email (if provided and non-placeholder) -> HARD BLOCK
  const cleanEmail = (input.email || '').trim().toLowerCase();
  if (cleanEmail.length > 5 && !cleanEmail.includes('example.in') && !cleanEmail.includes('test.com')) {
    for (const g of guestsList) {
      if (input.excludeGuestId && g.id === input.excludeGuestId) continue;
      const gEmail = (g.email || '').trim().toLowerCase();
      if (gEmail && !gEmail.includes('example.in') && gEmail === cleanEmail) {
        return {
          isDuplicate: true,
          hardBlock: true,
          nameMatchOnly: false,
          matchedGuests: [g],
          matchedGuest: g,
          field: 'email',
          reason: `Email address "${g.email}" is already registered with "${g.fullName}" (${g.id}).`,
          reasonGu: `Email address "${g.email}" is already registered to patron "${g.fullName}" (${g.id}).`,
        };
      }
    }
  }

  // 4. Check Full Name (Exact normalized case-insensitive match) -> SOFT DISAMBIGUATION (Show matching list, allow if different person)
  const inputFullName = (
    input.fullName ||
    `${input.firstName || ''} ${input.lastName || ''}`
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  if (inputFullName.length >= 3) {
    const nameMatches = guestsList.filter((g) => {
      if (input.excludeGuestId && g.id === input.excludeGuestId) return false;
      const gFullName = (g.fullName || `${g.firstName || ''} ${g.lastName || ''}`)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
      return gFullName === inputFullName;
    });

    if (nameMatches.length > 0) {
      return {
        isDuplicate: false, // NOT a hard duplicate block
        hardBlock: false,
        nameMatchOnly: true,
        matchedGuests: nameMatches,
        matchedGuest: nameMatches[0],
        field: 'name',
        reason: `${nameMatches.length} guest(s) share the name "${input.firstName || ''} ${input.lastName || ''}". Please verify if this is the same returning patron or a new guest with a different ID document.`,
        reasonGu: `Found ${nameMatches.length} registered patron(s) with the name "${input.firstName || ''} ${input.lastName || ''}". Please verify whether this is the same returning guest or a new patron with a distinct ID document.`,
      };
    }
  }

  return { isDuplicate: false, hardBlock: false, nameMatchOnly: false, matchedGuests: [], reason: '', reasonGu: '' };
}

interface HotelContextType {
  guests: Guest[];
  rooms: Room[];
  reservations: Reservation[];
  auditLogs: AuditLog[];
  notifications: HotelNotification[];
  currentStaff: StaffUser;
  setCurrentStaff: (staff: StaffUser) => void;
  staffList: StaffUser[];
  isLoading: boolean;
  isSupabaseConnected: boolean;

  // Guest actions
  addGuest: (guestData: Partial<Guest>, options?: { allowSameNameDifferentId?: boolean }) => Guest;
  checkDuplicateGuest: (params: DuplicateCheckParams) => DuplicateCheckResult;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  updateGuestDocument: (guestId: string, docUpdates: Partial<IdentityDocument>) => void;
  getGuestById: (id: string) => Guest | undefined;
  searchGuests: (query: string) => Guest[];

  // Room actions
  addRoom: (roomData: Partial<Room>) => Room;
  updateRoomStatus: (roomNumber: string, status: RoomStatus, notes?: string) => void;
  getRoomByNumber: (roomNumber: string) => Room | undefined;

  // Reservation actions
  createReservation: (data: Partial<Reservation>) => Reservation;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;

  // Check-In / Check-Out
  checkInGuest: (payload: CheckInPayload) => { success: boolean; message: string; reservationId?: string };
  checkOutGuest: (roomNumber: string, notes?: string) => { success: boolean; message: string };

  // Logs & Notifications
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteGuest: (guestId: string) => { success: boolean; message: string };
  clearAllTestData: () => void;
  resetToDefaultData: () => void;
}

const HotelContext = createContext<HotelContextType | null>(null);

const STORAGE_KEYS = {
  GUESTS: 'royal_haveli_guests_v2',
  ROOMS: 'royal_haveli_rooms_v2',
  RESERVATIONS: 'royal_haveli_reservations_v2',
  AUDIT_LOGS: 'royal_haveli_audit_logs_v2',
  NOTIFICATIONS: 'royal_haveli_notifications_v2',
};

const normalizeRoomCategory = (type?: string): RoomType => {
  if (type === 'AC' || type === 'Non AC') return type;
  const t = (type || '').toLowerCase();
  if (t.includes('non') || t.includes('classic') || t.includes('standard')) {
    return 'Non AC';
  }
  return 'AC';
};

const normalizeGuestTier = (tier?: string): GuestTier => {
  if (tier === 'AC' || tier === 'Non AC') return tier;
  const t = (tier || '').toLowerCase();
  if (t.includes('non') || t.includes('standard') || t.includes('silver')) {
    return 'Non AC';
  }
  return 'AC';
};

export function HotelProvider({ children }: { children: React.ReactNode }) {
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<HotelNotification[]>(INITIAL_NOTIFICATIONS);
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(INITIAL_STAFF[0]);
  const [staffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(isSupabaseConfigured);
  const [isLoading, setIsLoading] = useState(true);

  // Save changes to localStorage
  const persistState = useCallback(
    (key: string, data: unknown) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.warn(`Failed to persist ${key}:`, err);
      }
    },
    []
  );

  // Hydrate from localStorage and Supabase on mount
  useEffect(() => {
    try {
      // Clean legacy foreign data caches from previous sessions if present
      const legacyKeys = [
        'aurelia_hotel_guests_v1',
        'aurelia_hotel_rooms_v1',
        'aurelia_hotel_reservations_v1',
        'aurelia_hotel_audit_logs_v1',
        'aurelia_hotel_notifications_v1',
      ];
      legacyKeys.forEach((k) => localStorage.removeItem(k));

      const storedGuests = localStorage.getItem(STORAGE_KEYS.GUESTS);
      const storedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
      const storedReservations = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      const storedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

      if (storedGuests) {
        const parsedGuests = JSON.parse(storedGuests);
        const cleanGuests = deduplicateGuests(parsedGuests).map((g: any) => ({
          ...g,
          tier: normalizeGuestTier(g.tier),
        }));
        setGuests(cleanGuests);
      }
      if (storedRooms) {
        const parsedRooms = JSON.parse(storedRooms).map((r: any) => ({
          ...r,
          type: normalizeRoomCategory(r.type),
        }));
        setRooms(parsedRooms);
      }
      if (storedReservations) setReservations(JSON.parse(storedReservations));
      if (storedAuditLogs) setAuditLogs(JSON.parse(storedAuditLogs));
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    } catch (e) {
      console.warn('Failed to parse cached hotel state from localStorage:', e);
    } finally {
      setIsLoading(false);
    }

    // Attempt live Supabase synchronization
    if (isSupabaseConfigured) {
      Promise.all([
        supabase.from('guests').select('*').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*').order('room_number', { ascending: true }),
        supabase.from('reservations').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
      ])
        .then(([gRes, rRes, resRes, aRes]) => {
          if (gRes.data && gRes.data.length > 0) {
            const mappedGuests = gRes.data.map((g: any): Guest => ({
              id: g.id,
              firstName: g.first_name || g.firstName || '',
              lastName: g.last_name || g.lastName || '',
              fullName: g.full_name || g.fullName || `${g.first_name || ''} ${g.last_name || ''}`.trim(),
              email: g.email || '',
              phone: g.phone || '',
              phoneMasked: g.phone_masked || g.phoneMasked || '—',
              avatarUrl: g.avatar_url || g.avatarUrl,
              tier: g.tier || 'Standard',
              nationality: g.nationality || '',
              city: g.city || '',
              country: g.country || '',
              address: g.address || '',
              dateOfBirth: g.date_of_birth || g.dateOfBirth,
              verificationStatus: g.verification_status || g.verificationStatus || 'Verified',
              document: g.document,
              preferences: g.preferences || {},
              totalStays: Number(g.total_stays ?? g.totalStays ?? 0),
              totalNights: Number(g.total_nights ?? g.totalNights ?? 0),
              lifetimeSpend: Number(g.lifetime_spend ?? g.lifetimeSpend ?? 0),
              lastVisitDate: g.last_visit_date || g.lastVisitDate || '',
              currentRoomNumber: g.current_room_number || g.currentRoomNumber,
              currentStayId: g.current_stay_id || g.currentStayId,
              notes: g.notes || '',
              vipTag: g.vip_tag || g.vipTag,
              createdAt: g.created_at || g.createdAt,
              updatedAt: g.updated_at || g.updatedAt,
            }));
            const cleanGuests = deduplicateGuests(mappedGuests);
            setGuests(cleanGuests);
            persistState(STORAGE_KEYS.GUESTS, cleanGuests);
          }

          if (rRes.data && rRes.data.length > 0) {
            const mappedRooms = rRes.data.map((r: any): Room => ({
              id: r.id,
              roomNumber: r.room_number || r.roomNumber,
              floor: Number(r.floor),
              type: r.type,
              pricePerNight: Number(r.price_per_night ?? r.pricePerNight),
              status: r.status,
              capacity: Number(r.capacity || 2),
              bedConfiguration: r.bed_configuration || r.bedConfiguration || '1 King Bed',
              squareMeters: Number(r.square_meters || r.squareMeters || 60),
              view: r.view || 'City Skyline',
              amenities: r.amenities || [],
              currentGuestId: r.current_guest_id || r.currentGuestId,
              currentGuestName: r.current_guest_name || r.currentGuestName,
              currentStayCheckIn: r.current_stay_check_in || r.currentStayCheckIn,
              currentStayCheckOut: r.current_stay_check_out || r.currentStayCheckOut,
              nextReservationDate: r.next_reservation_date || r.nextReservationDate,
              lastCleanedAt: r.last_cleaned_at || r.lastCleanedAt,
              cleanedBy: r.cleaned_by || r.cleanedBy,
              maintenanceNotes: r.maintenance_notes || r.maintenanceNotes,
            }));
            setRooms(mappedRooms);
            persistState(STORAGE_KEYS.ROOMS, mappedRooms);
          }

          if (resRes.data && resRes.data.length > 0) {
            const mappedRes = resRes.data.map((res: any): Reservation => ({
              id: res.id,
              guestId: res.guest_id || res.guestId,
              guestName: res.guest_name || res.guestName,
              guestEmail: res.guest_email || res.guestEmail || '',
              guestPhoneMasked: res.guest_phone_masked || res.guestPhoneMasked || '',
              roomNumber: res.room_number || res.roomNumber,
              roomType: res.room_type || res.roomType,
              checkInDate: res.check_in_date || res.checkInDate,
              checkOutDate: res.check_out_date || res.checkOutDate,
              nights: Number(res.nights || 1),
              adults: Number(res.adults || 1),
              children: Number(res.children || 0),
              totalPrice: Number(res.total_price ?? res.totalPrice),
              paidAmount: Number(res.paid_amount ?? res.paidAmount ?? 0),
              status: res.status,
              specialRequests: res.special_requests || res.specialRequests,
              paymentMethod: res.payment_method || res.paymentMethod || 'Credit Card (Amex Black)',
              createdAt: res.created_at || res.createdAt,
            }));
            setReservations(mappedRes);
            persistState(STORAGE_KEYS.RESERVATIONS, mappedRes);
          }

          if (aRes.data && aRes.data.length > 0) {
            const mappedAudit = aRes.data.map((a: any): AuditLog => ({
              id: a.id,
              timestamp: a.timestamp,
              action: a.action,
              category: a.category,
              staffName: a.staff_name || a.staffName,
              staffRole: a.staff_role || a.staffRole,
              target: a.target || '',
              details: a.details || '',
              ipAddress: a.ip_address || a.ipAddress || '',
              severity: a.severity || 'info',
            }));
            setAuditLogs(mappedAudit);
            persistState(STORAGE_KEYS.AUDIT_LOGS, mappedAudit);
          }

          setIsSupabaseConnected(true);
        })
        .catch((err) => {
          console.info('Supabase live table sync notice:', err);
        });
    }
  }, [persistState]);

  const addAuditLog = useCallback(
    (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
      const newLog: AuditLog = {
        ...log,
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => {
        const updated = [newLog, ...prev];
        persistState(STORAGE_KEYS.AUDIT_LOGS, updated);
        return updated;
      });
    },
    [persistState]
  );

  const addGuest = useCallback(
    (guestData: Partial<Guest>, options?: { allowSameNameDifferentId?: boolean }): Guest => {
      const fullName = guestData.fullName || `${guestData.firstName || ''} ${guestData.lastName || ''}`.trim();
      const rawPhone = guestData.phone || '';
      const docNum = guestData.document?.documentNumberFull || guestData.document?.documentNumberMasked;

      // 1. Strict Duplicate Check
      const dupCheck = checkDuplicateGuest(guests, {
        fullName,
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        phone: rawPhone,
        email: guestData.email,
        documentNumber: docNum,
      });

      // 2. HARD BLOCK: Duplicate ID document number or phone number is NEVER allowed
      if (dupCheck.hardBlock && dupCheck.matchedGuest) {
        addAuditLog({
          action: 'Blocked Duplicate Guest Registration',
          category: 'Security / Document',
          staffName: currentStaff.name,
          staffRole: currentStaff.role,
          target: `${fullName || guestData.firstName} (Duplicate ${dupCheck.field?.toUpperCase()})`,
          details: `Strict duplicate blocked by ${dupCheck.field}: matched ${dupCheck.matchedGuest.fullName} (${dupCheck.matchedGuest.id}). ID documents and phone numbers must be unique.`,
          ipAddress: '192.168.1.10 (Terminal 1)',
          severity: 'warning',
        });
        throw new Error(dupCheck.reasonGu);
      }

      // 3. NAME MATCH ONLY: If not confirmed as different person, reject with prompt
      if (dupCheck.nameMatchOnly && !options?.allowSameNameDifferentId) {
        throw new Error(dupCheck.reasonGu);
      }

      const newId = `GST-${Math.floor(100 + Math.random() * 900)}`;
      const cleanDigits = rawPhone.replace(/\D/g, '');
      const maskedPhone = cleanDigits.length >= 10
        ? `+91 ${cleanDigits.slice(cleanDigits.length - 10, cleanDigits.length - 5)} ••••${cleanDigits.slice(-2)}`
        : rawPhone || '—';

      const newGuest: Guest = {
        id: newId,
        firstName: guestData.firstName || '',
        lastName: guestData.lastName || '',
        fullName,
        email: guestData.email || `${guestData.firstName?.toLowerCase() || 'guest'}.${guestData.lastName?.toLowerCase() || 'patron'}@example.in`,
        phone: rawPhone,
        phoneMasked: maskedPhone,
        avatarUrl:
          guestData.avatarUrl ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80`,
        tier: normalizeGuestTier(guestData.tier || 'AC'),
        nationality: guestData.nationality || 'Indian',
        city: guestData.city || 'Ahmedabad',
        country: guestData.country || 'India',
        address: guestData.address || 'Ahmedabad, Gujarat, India',
        verificationStatus: guestData.verificationStatus || 'Verified',
        document: guestData.document,
        preferences: guestData.preferences || {},
        totalStays: 0,
        totalNights: 0,
        lifetimeSpend: 0,
        lastVisitDate: new Date().toISOString().split('T')[0],
        notes: guestData.notes || '',
        vipTag: guestData.vipTag,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setGuests((prev) => {
        const updated = [newGuest, ...prev];
        persistState(STORAGE_KEYS.GUESTS, updated);
        return updated;
      });

      if (isSupabaseConfigured) {
        supabase.from('guests').insert([{
          id: newGuest.id,
          first_name: newGuest.firstName,
          last_name: newGuest.lastName,
          full_name: newGuest.fullName,
          email: newGuest.email,
          phone: newGuest.phone,
          phone_masked: newGuest.phoneMasked,
          avatar_url: newGuest.avatarUrl,
          tier: newGuest.tier,
          nationality: newGuest.nationality,
          city: newGuest.city,
          country: newGuest.country,
          address: newGuest.address,
          verification_status: newGuest.verificationStatus,
          document: newGuest.document,
          preferences: newGuest.preferences,
          total_stays: 0,
          total_nights: 0,
          lifetime_spend: 0,
          last_visit_date: newGuest.lastVisitDate,
          notes: newGuest.notes,
          vip_tag: newGuest.vipTag,
        }]).then(({ error }) => {
          if (error) console.info('Supabase guest insert notice:', error.message);
        });
      }

      addAuditLog({
        action: dupCheck.nameMatchOnly
          ? 'Registered Guest with Existing Name (Verified Unique ID)'
          : 'Registered New Guest',
        category: dupCheck.nameMatchOnly ? 'Security / Document' : 'Guest Profile',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `${newGuest.fullName} (${newGuest.id})`,
        details: dupCheck.nameMatchOnly
          ? `Verified as a different individual sharing the name "${fullName}". Unique Document: ${newGuest.document?.type} (${newGuest.document?.documentNumberMasked}).`
          : `Registered with ${newGuest.tier} status. Origin: ${newGuest.city}, ${newGuest.country}. Document: ${newGuest.document?.type || 'Aadhaar'}.`,
        ipAddress: '192.168.1.10 (Terminal 1)',
        severity: 'info',
      });

      return newGuest;
    },
    [addAuditLog, currentStaff, guests, persistState]
  );

  const updateGuest = useCallback(
    (id: string, updates: Partial<Guest>) => {
      setGuests((prev) => {
        const updated = prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
        persistState(STORAGE_KEYS.GUESTS, updated);
        return updated;
      });

      if (isSupabaseConfigured) {
        const sbUpdates: Record<string, any> = {};
        if (updates.firstName !== undefined) sbUpdates.first_name = updates.firstName;
        if (updates.lastName !== undefined) sbUpdates.last_name = updates.lastName;
        if (updates.fullName !== undefined) sbUpdates.full_name = updates.fullName;
        if (updates.email !== undefined) sbUpdates.email = updates.email;
        if (updates.phone !== undefined) sbUpdates.phone = updates.phone;
        if (updates.city !== undefined) sbUpdates.city = updates.city;
        if (updates.tier !== undefined) sbUpdates.tier = updates.tier;
        if (updates.verificationStatus !== undefined) sbUpdates.verification_status = updates.verificationStatus;
        if (updates.document !== undefined) sbUpdates.document = updates.document;
        if (updates.preferences !== undefined) sbUpdates.preferences = updates.preferences;
        if (updates.notes !== undefined) sbUpdates.notes = updates.notes;
        sbUpdates.updated_at = new Date().toISOString();

        supabase.from('guests').update(sbUpdates).eq('id', id).then(({ error }) => {
          if (error) console.info('Supabase guest update notice:', error.message);
        });
      }

      addAuditLog({
        action: 'Updated Guest Profile',
        category: 'Guest Profile',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `Guest ID: ${id}`,
        details: `Updated fields: ${Object.keys(updates).join(', ')}.`,
        ipAddress: '192.168.1.10 (Terminal 1)',
        severity: 'info',
      });
    },
    [addAuditLog, currentStaff, persistState]
  );

  const deleteGuest = useCallback(
    (guestId: string) => {
      const targetGuest = guests.find((g) => g.id === guestId);
      if (!targetGuest) return { success: false, message: 'Guest profile not found' };

      // 1. Remove from guests
      setGuests((prev) => {
        const updated = prev.filter((g) => g.id !== guestId);
        persistState(STORAGE_KEYS.GUESTS, updated);
        return updated;
      });

      // 2. If guest occupied a room, free up the room
      setRooms((prev) => {
        const updated = prev.map((r) => {
          if (r.currentGuestId === guestId) {
            return {
              ...r,
              status: 'Available' as RoomStatus,
              currentGuestId: undefined,
              currentGuestName: undefined,
              currentStayCheckIn: undefined,
              currentStayCheckOut: undefined,
            };
          }
          return r;
        });
        persistState(STORAGE_KEYS.ROOMS, updated);
        return updated;
      });

      // 3. Remove guest's reservations
      setReservations((prev) => {
        const updated = prev.filter((res) => res.guestId !== guestId);
        persistState(STORAGE_KEYS.RESERVATIONS, updated);
        return updated;
      });

      // 4. Supabase sync if configured
      if (isSupabaseConfigured) {
        supabase.from('guests').delete().eq('id', guestId).then(({ error }) => {
          if (error) console.info('Supabase guest delete notice:', error.message);
        });
        supabase.from('reservations').delete().eq('guest_id', guestId).then(({ error }) => {
          if (error) console.info('Supabase reservation delete notice:', error.message);
        });
      }

      // 5. Add audit log
      addAuditLog({
        action: 'Deleted Guest Profile',
        category: 'Guest Profile',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `${targetGuest.fullName} (${targetGuest.id})`,
        details: `Guest record removed from hotel system by ${currentStaff.name}. Any active room occupied was freed.`,
        ipAddress: '192.168.1.10 (Terminal 1)',
        severity: 'warning',
      });

      return { success: true, message: `Successfully deleted ${targetGuest.fullName}` };
    },
    [addAuditLog, currentStaff, guests, persistState]
  );

  const updateGuestDocument = useCallback(
    (guestId: string, docUpdates: Partial<IdentityDocument>) => {
      setGuests((prev) => {
        const updated = prev.map((g) => {
          if (g.id === guestId) {
            const currentDoc = g.document || {
              id: `DOC-${Date.now().toString().slice(-4)}`,
              type: 'Aadhaar Card' as const,
              documentNumberMasked: '•••• •••• 9821',
              documentNumberFull: '8492 7102 9821',
              issuingCountry: 'India',
              expiryDate: '2036-12-31',
              verifiedAt: new Date().toISOString(),
              verifiedBy: currentStaff.name,
              status: 'Verified' as const,
            };
            const updatedDoc = {
              ...currentDoc,
              ...docUpdates,
              verifiedAt: new Date().toISOString(),
              verifiedBy: currentStaff.name,
            };

            if (isSupabaseConfigured) {
              supabase.from('guests').update({ document: updatedDoc }).eq('id', guestId).then(({ error }) => {
                if (error) console.info('Supabase document update notice:', error.message);
              });
            }

            return {
              ...g,
              document: updatedDoc,
              verificationStatus: updatedDoc.status || g.verificationStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return g;
        });

        persistState(STORAGE_KEYS.GUESTS, updated);
        return updated;
      });

      addAuditLog({
        action: 'Updated Guest ID Proof Document',
        category: 'Guest Profile',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `Guest ID: ${guestId}`,
        details: `Archived customer ID proof photo(s). Type: ${docUpdates.type || 'Identity Document'}`,
        ipAddress: '192.168.1.10 (Terminal 1)',
        severity: 'info',
      });
    },
    [addAuditLog, currentStaff, persistState]
  );

  const getGuestById = useCallback(
    (id: string): Guest | undefined => {
      return guests.find((g) => g.id.toLowerCase() === id.toLowerCase());
    },
    [guests]
  );

  const searchGuests = useCallback(
    (query: string): Guest[] => {
      const q = query.trim().toLowerCase();
      if (!q) return guests;

      return guests.filter((g) => {
        const nameMatch = g.fullName.toLowerCase().includes(q);
        const idMatch = g.id.toLowerCase().includes(q);
        const emailMatch = g.email.toLowerCase().includes(q);
        const cityMatch = g.city.toLowerCase().includes(q);
        const countryMatch = g.country.toLowerCase().includes(q);
        const phoneMatch = g.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const docMatch = g.document?.documentNumberFull?.toLowerCase().includes(q) || false;

        return nameMatch || idMatch || emailMatch || cityMatch || countryMatch || phoneMatch || docMatch;
      });
    },
    [guests]
  );

  const addRoom = useCallback(
    (roomData: Partial<Room>): Room => {
      const roomNum = roomData.roomNumber || `${Math.floor(100 + Math.random() * 900)}`;
      const newRoom: Room = {
        id: `RM-${roomNum}`,
        roomNumber: roomNum,
        floor: Number(roomData.floor || 1),
        type: normalizeRoomCategory(roomData.type || 'AC'),
        pricePerNight: Number(roomData.pricePerNight || (roomData.type === 'Non AC' ? 1000 : 1500)),
        status: roomData.status || 'Available',
        capacity: Number(roomData.capacity || 2),
        bedConfiguration: roomData.bedConfiguration || '1 King Size Royal Bed',
        squareMeters: Number(roomData.squareMeters || 75),
        view: roomData.view || 'Palace Courtyard',
        amenities: roomData.amenities || ['High-Speed Wi-Fi', 'Smart 4K TV'],
        lastCleanedAt: new Date().toISOString(),
        cleanedBy: `${currentStaff.name} verified`,
        maintenanceNotes: roomData.maintenanceNotes,
      };

      setRooms((prev) => {
        const updated = [...prev, newRoom];
        persistState(STORAGE_KEYS.ROOMS, updated);
        return updated;
      });

      if (isSupabaseConfigured) {
        supabase.from('rooms').insert([{
          id: newRoom.id,
          room_number: newRoom.roomNumber,
          floor: newRoom.floor,
          type: newRoom.type,
          price_per_night: newRoom.pricePerNight,
          status: newRoom.status,
          capacity: newRoom.capacity,
          bed_configuration: newRoom.bedConfiguration,
          square_meters: newRoom.squareMeters,
          view: newRoom.view,
          amenities: newRoom.amenities,
          last_cleaned_at: newRoom.lastCleanedAt,
          cleaned_by: newRoom.cleanedBy,
          maintenance_notes: newRoom.maintenanceNotes,
        }]).then(({ error }) => {
          if (error) console.info('Supabase room insert notice:', error.message);
        });
      }

      addAuditLog({
        action: 'Added New Room',
        category: 'Room Status',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `Room ${newRoom.roomNumber} (${newRoom.type})`,
        details: `Floor ${newRoom.floor}, Rate: ₹${newRoom.pricePerNight}/night, Status: ${newRoom.status}`,
        ipAddress: '192.168.10.42 (Terminal 1)',
        severity: 'info',
      });

      return newRoom;
    },
    [addAuditLog, currentStaff, persistState]
  );

  const updateRoomStatus = useCallback(
    (roomNumber: string, status: RoomStatus, notes?: string) => {
      setRooms((prev) => {
        const updated = prev.map((r) => {
          if (r.roomNumber === roomNumber) {
            const nextRoom: Room = {
              ...r,
              status,
              maintenanceNotes: notes !== undefined ? notes : r.maintenanceNotes,
            };
            if (status === 'Available') {
              nextRoom.lastCleanedAt = new Date().toISOString();
              nextRoom.cleanedBy = `${currentStaff.name} verified`;
              delete nextRoom.currentGuestId;
              delete nextRoom.currentGuestName;
              delete nextRoom.currentStayCheckIn;
              delete nextRoom.currentStayCheckOut;
            }
            return nextRoom;
          }
          return r;
        });
        persistState(STORAGE_KEYS.ROOMS, updated);
        return updated;
      });

      addAuditLog({
        action: 'Changed Room Status',
        category: 'Room Status',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `Room ${roomNumber}`,
        details: `Status set to ${status}${notes ? ` (Notes: ${notes})` : ''}`,
        ipAddress: '192.168.10.42 (Terminal 1)',
        severity: status === 'Maintenance' ? 'warning' : 'info',
      });
    },
    [addAuditLog, currentStaff, persistState]
  );

  const getRoomByNumber = useCallback(
    (roomNumber: string): Room | undefined => {
      return rooms.find((r) => r.roomNumber === roomNumber);
    },
    [rooms]
  );

  const createReservation = useCallback(
    (data: Partial<Reservation>): Reservation => {
      const newId = `RSV-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReservation: Reservation = {
        id: newId,
        guestId: data.guestId || '',
        guestName: data.guestName || '',
        guestEmail: data.guestEmail || '',
        guestPhoneMasked: data.guestPhoneMasked || '',
        roomNumber: data.roomNumber || '',
        roomType: data.roomType || 'Deluxe King Sanctuary',
        checkInDate: data.checkInDate || new Date().toISOString().split('T')[0],
        checkOutDate: data.checkOutDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        nights: data.nights || 3,
        adults: data.adults || 1,
        children: data.children || 0,
        totalPrice: data.totalPrice || 1500,
        paidAmount: data.paidAmount || 0,
        status: data.status || 'Confirmed',
        specialRequests: data.specialRequests,
        paymentMethod: data.paymentMethod || 'Credit Card (Amex Black)',
        createdAt: new Date().toISOString(),
      };

      setReservations((prev) => {
        const updated = [newReservation, ...prev];
        persistState(STORAGE_KEYS.RESERVATIONS, updated);
        return updated;
      });

      addAuditLog({
        action: 'Created Reservation',
        category: 'Check-In',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `${newReservation.id} (${newReservation.guestName})`,
        details: `Room ${newReservation.roomNumber} (${newReservation.nights} nights, $${newReservation.totalPrice})`,
        ipAddress: '192.168.10.42 (Terminal 1)',
        severity: 'info',
      });

      return newReservation;
    },
    [addAuditLog, currentStaff, persistState]
  );

  const updateReservationStatus = useCallback(
    (id: string, status: Reservation['status']) => {
      setReservations((prev) => {
        const updated = prev.map((r) => (r.id === id ? { ...r, status } : r));
        persistState(STORAGE_KEYS.RESERVATIONS, updated);
        return updated;
      });
    },
    [persistState]
  );

  const checkInGuest = useCallback(
    (payload: CheckInPayload) => {
      const guest = guests.find((g) => g.id === payload.guestId);
      const room = rooms.find((r) => r.roomNumber === payload.roomNumber);

      if (!guest) return { success: false, message: 'Guest profile not found' };
      if (!room) return { success: false, message: 'Room not found' };
      if (room.status === 'Occupied') return { success: false, message: `Room ${room.roomNumber} is currently occupied` };

      const newReservationId = `RSV-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Update Room Status to Occupied
      setRooms((prev) => {
        const updated = prev.map((r) => {
          if (r.roomNumber === payload.roomNumber) {
            return {
              ...r,
              status: 'Occupied' as RoomStatus,
              currentGuestId: guest.id,
              currentGuestName: guest.fullName,
              currentStayCheckIn: payload.checkInDate,
              currentStayCheckOut: payload.checkOutDate,
            };
          }
          return r;
        });
        persistState(STORAGE_KEYS.ROOMS, updated);
        return updated;
      });

      // 2. Update Guest metadata (increment stays, set current room)
      setGuests((prev) => {
        const updated = prev.map((g) => {
          if (g.id === payload.guestId) {
            return {
              ...g,
              currentRoomNumber: payload.roomNumber,
              currentStayId: newReservationId,
              totalStays: (g.totalStays || 0) + 1,
              lastVisitDate: payload.checkInDate,
              verificationStatus: payload.identityVerified ? 'Verified' : g.verificationStatus,
            };
          }
          return g;
        });
        persistState(STORAGE_KEYS.GUESTS, updated);
        return updated;
      });

      const nights = Math.max(1, Math.round((new Date(payload.checkOutDate).getTime() - new Date(payload.checkInDate).getTime()) / 86400000)) || 1;

      // 3. Create or update reservation
      const newReservation: Reservation = {
        id: newReservationId,
        guestId: guest.id,
        guestName: guest.fullName,
        guestEmail: guest.email,
        guestPhoneMasked: guest.phoneMasked,
        roomNumber: payload.roomNumber,
        roomType: room.type,
        checkInDate: payload.checkInDate,
        checkOutDate: payload.checkOutDate,
        nights,
        adults: payload.adults || 1,
        children: 0,
        totalPrice: payload.depositAmount || (room.pricePerNight * nights),
        paidAmount: payload.depositAmount || (room.pricePerNight * nights),
        status: 'Checked-In',
        specialRequests: payload.specialRequests,
        paymentMethod: (payload.paymentMethod as Reservation['paymentMethod']) || 'Cash at Counter',
        createdAt: new Date().toISOString(),
      };

      setReservations((prev) => {
        const updated = [newReservation, ...prev];
        persistState(STORAGE_KEYS.RESERVATIONS, updated);
        return updated;
      });

      // Supabase sync if configured
      if (isSupabaseConfigured) {
        supabase.from('guests').update({
          current_room_number: payload.roomNumber,
          last_visit_date: payload.checkInDate,
          total_stays: (guest.totalStays || 0) + 1,
        }).eq('id', guest.id).then(({ error }) => {
          if (error) console.info('Supabase guest stay sync notice:', error.message);
        });

        supabase.from('rooms').update({
          status: 'Occupied',
          current_guest_id: guest.id,
          current_guest_name: guest.fullName,
          current_stay_check_in: payload.checkInDate,
          current_stay_check_out: payload.checkOutDate,
        }).eq('room_number', payload.roomNumber).then(({ error }) => {
          if (error) console.info('Supabase room stay sync notice:', error.message);
        });
      }

      // 4. Log to Audit
      addAuditLog({
        action: 'Completed Check-In & Issued Keys',
        category: 'Check-In',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `Room ${room.roomNumber} / ${guest.fullName} (${guest.id})`,
        details: `Issued ${payload.keyCardCount || 2} RFID keycards. Method: ${payload.paymentMethod}. Identity verified: ${payload.identityVerified ? 'Yes' : 'Pending'}.`,
        ipAddress: '192.168.10.42 (Terminal 1)',
        severity: 'info',
      });

      return {
        success: true,
        message: `Successfully checked in ${guest.fullName} into Room ${room.roomNumber}`,
        reservationId: newReservationId,
      };
    },
    [addAuditLog, currentStaff, guests, persistState, rooms]
  );

  const checkOutGuest = useCallback(
    (roomNumber: string, notes?: string) => {
      const room = rooms.find((r) => r.roomNumber === roomNumber);
      if (!room) return { success: false, message: 'Room not found' };

      const guestName = room.currentGuestName || 'Guest';
      const guestId = room.currentGuestId;

      // 1. Set Room to 'Cleaning'
      setRooms((prev) => {
        const updated = prev.map((r) => {
          if (r.roomNumber === roomNumber) {
            return {
              ...r,
              status: 'Cleaning' as RoomStatus,
              currentGuestId: undefined,
              currentGuestName: undefined,
              currentStayCheckIn: undefined,
              currentStayCheckOut: undefined,
              maintenanceNotes: notes || 'Turnover cleaning required following departure.',
            };
          }
          return r;
        });
        persistState(STORAGE_KEYS.ROOMS, updated);
        return updated;
      });

      // 2. Clear current room from guest
      if (guestId) {
        setGuests((prev) => {
          const updated = prev.map((g) => {
            if (g.id === guestId) {
              return {
                ...g,
                currentRoomNumber: undefined,
                currentStayId: undefined,
              };
            }
            return g;
          });
          persistState(STORAGE_KEYS.GUESTS, updated);
          return updated;
        });
      }

      // 3. Mark reservation completed
      setReservations((prev) => {
        const updated = prev.map((res) => {
          if (res.roomNumber === roomNumber && res.status === 'Checked-In') {
            return { ...res, status: 'Completed' as Reservation['status'] };
          }
          return res;
        });
        persistState(STORAGE_KEYS.RESERVATIONS, updated);
        return updated;
      });

      // Supabase sync if configured
      if (isSupabaseConfigured) {
        if (guestId) {
          supabase.from('guests').update({
            current_room_number: null,
          }).eq('id', guestId).then(({ error }) => {
            if (error) console.info('Supabase checkout guest sync notice:', error.message);
          });
        }
        supabase.from('rooms').update({
          status: 'Cleaning',
          current_guest_id: null,
          current_guest_name: null,
          current_stay_check_in: null,
          current_stay_check_out: null,
        }).eq('room_number', roomNumber).then(({ error }) => {
          if (error) console.info('Supabase checkout room sync notice:', error.message);
        });
      }

      // 4. Audit Log
      addAuditLog({
        action: 'Completed Check-Out',
        category: 'Check-Out',
        staffName: currentStaff.name,
        staffRole: currentStaff.role,
        target: `Room ${roomNumber} / ${guestName}`,
        details: `Folio settled. Room set to Cleaning status. Notes: ${notes || 'None'}.`,
        ipAddress: '192.168.10.42 (Terminal 1)',
        severity: 'info',
      });

      return {
        success: true,
        message: `Guest ${guestName} checked out of Room ${roomNumber}. Room marked for cleaning.`,
      };
    },
    [addAuditLog, currentStaff, persistState, rooms]
  );

  const markNotificationAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        persistState(STORAGE_KEYS.NOTIFICATIONS, updated);
        return updated;
      });
    },
    [persistState]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      persistState(STORAGE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });
  }, [persistState]);

  const resetToDefaultData = useCallback(() => {
    setGuests(INITIAL_GUESTS);
    setRooms(INITIAL_ROOMS);
    setReservations(INITIAL_RESERVATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    try {
      localStorage.removeItem(STORAGE_KEYS.GUESTS);
      localStorage.removeItem(STORAGE_KEYS.ROOMS);
      localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
      localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    } catch {}
  }, []);

  const clearAllTestData = useCallback(() => {
    // 1. Clear all guests
    setGuests([]);
    persistState(STORAGE_KEYS.GUESTS, []);

    // 2. Reset all rooms to Available (0 occupied, no guest assigned)
    setRooms((prev) => {
      const cleaned = prev.map((r) => ({
        ...r,
        status: 'Available' as RoomStatus,
        currentGuestId: undefined,
        currentGuestName: undefined,
        currentStayCheckIn: undefined,
        currentStayCheckOut: undefined,
      }));
      persistState(STORAGE_KEYS.ROOMS, cleaned);
      return cleaned;
    });

    // 3. Clear all reservations
    setReservations([]);
    persistState(STORAGE_KEYS.RESERVATIONS, []);

    // 4. Clear notifications
    setNotifications([]);
    persistState(STORAGE_KEYS.NOTIFICATIONS, []);

    // 5. Add clean initial audit log
    const cleanLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      action: 'System Initialized for Live Client Operations',
      category: 'System',
      staffName: currentStaff.name,
      staffRole: currentStaff.role,
      target: 'Hotel PMS System',
      details: 'All demonstration and test records cleared. Hotel database is clean and ready for real customer check-ins.',
      ipAddress: '192.168.1.10 (Terminal 1)',
      severity: 'info',
    };
    setAuditLogs([cleanLog]);
    persistState(STORAGE_KEYS.AUDIT_LOGS, [cleanLog]);

    // 6. Supabase cleanup if configured
    if (isSupabaseConfigured) {
      supabase.from('guests').delete().neq('id', 'non_existent_id').then(({ error }) => {
        if (error) console.info('Supabase bulk delete guests notice:', error.message);
      });
      supabase.from('reservations').delete().neq('id', 'non_existent_id').then(({ error }) => {
        if (error) console.info('Supabase bulk delete reservations notice:', error.message);
      });
    }
  }, [currentStaff, persistState]);

  const checkDuplicate = useCallback(
    (params: DuplicateCheckParams) => checkDuplicateGuest(guests, params),
    [guests]
  );

  return (
    <HotelContext.Provider
      value={{
        guests,
        rooms,
        reservations,
        auditLogs,
        notifications,
        currentStaff,
        setCurrentStaff,
        staffList,
        isLoading,
        isSupabaseConnected,
        addGuest,
        checkDuplicateGuest: checkDuplicate,
        updateGuest,
        updateGuestDocument,
        getGuestById,
        searchGuests,
        updateRoomStatus,
        addRoom,
        getRoomByNumber,
        createReservation,
        updateReservationStatus,
        checkInGuest,
        checkOutGuest,
        addAuditLog,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteGuest,
        clearAllTestData,
        resetToDefaultData,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
