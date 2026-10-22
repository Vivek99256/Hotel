export type GuestTier = 'Standard' | 'Silver Preferred' | 'Gold VIP' | 'Platinum Elite' | 'Royal Ambassador';

export type VerificationStatus = 'Verified' | 'Pending Verification' | 'Expired' | 'Rejected';

export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance';

export type RoomType = 
  | 'Maharaja Presidential Suite'
  | 'Royal Haveli Suite'
  | 'Palace Courtyard Villa'
  | 'Heritage Grand Suite'
  | 'Deluxe Lake View Room'
  | 'Classic Luxury Room'
  | 'Presidential Penthouse Suite'
  | 'Royal Oceanfront Villa'
  | 'Executive Grand Suite'
  | 'Deluxe King Sanctuary'
  | 'Garden Terrace Suite';

export type ReservationStatus = 'Confirmed' | 'Checked-In' | 'Completed' | 'Cancelled' | 'No-Show';

export interface IdentityDocument {
  id: string;
  type: 'Aadhaar Card' | 'PAN Card' | 'Passport' | "Driver's License" | 'Voter ID' | 'National ID';
  documentNumberMasked: string;
  documentNumberFull: string;
  issuingCountry: string;
  expiryDate?: string;
  verifiedAt: string;
  verifiedBy: string;
  documentImageUrl?: string; // Front of ID Proof
  documentBackImageUrl?: string; // Back of ID Proof
  status: VerificationStatus;
}

export interface GuestPreference {
  roomTemperature?: string;
  floorPreference?: 'High Floor' | 'Ground Floor' | 'Garden View' | 'Quiet Corner';
  pillowType?: 'Hypoallergenic Feather' | 'Memory Foam' | 'Silk Pillow';
  dietaryRestrictions?: string[];
  welcomeAmenity?: string;
  newspaper?: string;
  specialNotes?: string;
}

export interface StayRecord {
  id: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  totalSpent: number;
  folioStatus: 'Settled' | 'Open' | 'Transferred';
  rating?: number;
  feedback?: string;
  specialRequests?: string;
}

export interface Guest {
  id: string; // e.g. "GST-8024"
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  phoneMasked: string;
  avatarUrl?: string;
  tier: GuestTier;
  nationality: string;
  city: string;
  country: string;
  address: string;
  dateOfBirth?: string;
  verificationStatus: VerificationStatus;
  document?: IdentityDocument;
  preferences: GuestPreference;
  totalStays: number;
  totalNights: number;
  lifetimeSpend: number;
  lastVisitDate: string;
  currentRoomNumber?: string;
  currentStayId?: string;
  notes?: string;
  vipTag?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  roomNumber: string; // "101", "204", "401"
  floor: number;
  type: RoomType;
  pricePerNight: number;
  status: RoomStatus;
  capacity: number;
  bedConfiguration: string;
  squareMeters: number;
  view: 'Lake Pichola View' | 'Palace Courtyard' | 'Royal Gardens' | 'City Skyline' | 'Oceanfront' | 'Private Courtyard' | 'Botanical Gardens';
  amenities: string[];
  currentGuestId?: string;
  currentGuestName?: string;
  currentStayCheckIn?: string;
  currentStayCheckOut?: string;
  nextReservationDate?: string;
  lastCleanedAt?: string;
  cleanedBy?: string;
  maintenanceNotes?: string;
}

export interface Reservation {
  id: string; // "RSV-9402"
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhoneMasked: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  totalPrice: number;
  paidAmount: number;
  status: ReservationStatus;
  specialRequests?: string;
  paymentMethod: 'UPI / GPay / PhonePe' | 'Credit Card (HDFC Infinia)' | 'Credit Card (Amex Black)' | 'NEFT / RTGS' | 'Cash at Front Desk' | 'Corporate Account' | 'Luxury Card' | 'Direct Wire' | 'Cash at Counter';
  createdAt: string;
}

export interface CheckInPayload {
  guestId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  paymentMethod: string;
  specialRequests?: string;
  depositAmount: number;
  identityVerified: boolean;
  keyCardCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'Check-In' | 'Check-Out' | 'Guest Profile' | 'Security / Document' | 'Room Status' | 'Billing' | 'System';
  staffName: string;
  staffRole: string;
  target: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'security';
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Front Desk Manager' | 'Senior Concierge' | 'Hotel Director' | 'Operations Lead' | 'Housekeeping Supervisor';
  avatar: string;
  shift: 'Morning Shift' | 'Evening Shift' | 'Night Audit';
  isOnDuty: boolean;
  permissions: {
    canViewSensitiveDocuments: boolean;
    canOverrideRates: boolean;
    canProcessRefunds: boolean;
    canAssignPenthouses: boolean;
  };
}

export interface HotelNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'arrival' | 'departure' | 'vip' | 'housekeeping' | 'security' | 'billing';
  isRead: boolean;
  actionLink?: string;
}
