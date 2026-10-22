-- ============================================================
-- The Grand Aurelia - Luxury Hospitality Management System
-- Supabase PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rtmpuulcgnpktkhcdxyc/sql
-- ============================================================

-- 1. Create Guests Table
CREATE TABLE IF NOT EXISTS public.guests (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  phone_masked TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'Standard',
  nationality TEXT,
  city TEXT,
  country TEXT,
  address TEXT,
  date_of_birth TEXT,
  verification_status TEXT DEFAULT 'Verified',
  document JSONB,
  preferences JSONB,
  total_stays INT DEFAULT 0,
  total_nights INT DEFAULT 0,
  lifetime_spend NUMERIC DEFAULT 0,
  last_visit_date TEXT,
  current_room_number TEXT,
  current_stay_id TEXT,
  notes TEXT,
  vip_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  room_number TEXT UNIQUE NOT NULL,
  floor INT NOT NULL,
  type TEXT NOT NULL,
  price_per_night NUMERIC NOT NULL,
  status TEXT DEFAULT 'Available',
  capacity INT DEFAULT 2,
  bed_configuration TEXT,
  square_meters INT,
  view TEXT,
  amenities TEXT[],
  current_guest_id TEXT,
  current_guest_name TEXT,
  current_stay_check_in TEXT,
  current_stay_check_out TEXT,
  next_reservation_date TEXT,
  last_cleaned_at TEXT,
  cleaned_by TEXT,
  maintenance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Reservations Table
CREATE TABLE IF NOT EXISTS public.reservations (
  id TEXT PRIMARY KEY,
  guest_id TEXT REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone_masked TEXT,
  room_number TEXT,
  room_type TEXT,
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  nights INT DEFAULT 1,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  total_price NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Confirmed',
  special_requests TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  target TEXT,
  details TEXT,
  ip_address TEXT,
  severity TEXT DEFAULT 'info'
);

-- 5. Enable Row Level Security (RLS) and Allow Public Access for Demo
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read guests" ON public.guests FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert guests" ON public.guests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update guests" ON public.guests FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anonymous read rooms" ON public.rooms FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert rooms" ON public.rooms FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update rooms" ON public.rooms FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anonymous read reservations" ON public.reservations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert reservations" ON public.reservations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update reservations" ON public.reservations FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anonymous read audit_logs" ON public.audit_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert audit_logs" ON public.audit_logs FOR INSERT TO anon WITH CHECK (true);
