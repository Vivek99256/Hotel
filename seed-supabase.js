const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://rtmpuulcgnpktkhcdxyc.supabase.co',
  'sb_publishable_htREj7DcsV74c2Wb2g3BCQ_s7DpMD1S'
);

// Read mock data from compiled or source definitions
async function seedDatabase() {
  console.log('--- Seeding Live Supabase Database ---');

  // 1. Guests
  const guests = [
    {
      id: 'GST-8024',
      first_name: 'Alistair',
      last_name: 'Vance-Sterling',
      full_name: 'Lord Alistair Vance-Sterling',
      email: 'alistair.vance@monaco-holdings.mc',
      phone: '+377 98 97 48 21',
      phone_masked: '+377 (***) ***-4821',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      tier: 'Royal Ambassador',
      nationality: 'Monégasque',
      city: 'Monaco-Ville',
      country: 'Monaco',
      address: '14 Avenue de Monte-Carlo, 98000 Monaco',
      verification_status: 'Verified',
      document: {
        id: 'DOC-9041',
        type: 'Passport',
        documentNumberMasked: 'MC••••••94',
        documentNumberFull: 'MC84920194',
        issuingCountry: 'Monaco',
        expiryDate: '2031-09-15',
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '20.5°C',
        floorPreference: 'High Floor',
        pillowType: 'Silk Pillow',
        dietaryRestrictions: ['Shellfish Allergy', 'Truffle Connoisseur'],
        welcomeAmenity: 'Dom Pérignon 2013 & Oscietra Caviar'
      },
      total_stays: 14,
      total_nights: 48,
      lifetime_spend: 86400,
      last_visit_date: '2026-09-18',
      current_room_number: '401',
      notes: 'Long-standing VIP patron. Personal acquaintance of property owner.',
      vip_tag: 'Owner VIP'
    },
    {
      id: 'GST-7819',
      first_name: 'Sophia',
      last_name: 'Kensington',
      full_name: 'Lady Sophia Kensington',
      email: 'sophia.kensington@kensingtontrust.co.uk',
      phone: '+44 20 7946 0912',
      phone_masked: '+44 (***) ***-0912',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
      tier: 'Platinum Elite',
      nationality: 'British',
      city: 'London',
      country: 'United Kingdom',
      address: '22 Belgrave Square, Knightsbridge, London SW1X 8PH',
      verification_status: 'Verified',
      document: {
        id: 'DOC-8102',
        type: 'Passport',
        documentNumberMasked: 'GB••••••88',
        documentNumberFull: 'GB91028388',
        issuingCountry: 'United Kingdom',
        expiryDate: '2030-04-20',
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '21.0°C',
        floorPreference: 'Quiet Corner',
        pillowType: 'Hypoallergenic Feather',
        dietaryRestrictions: ['Plant-Based Breakfast', 'Decaf Oat Latte'],
        welcomeAmenity: 'Seasonal Artisan White Peaches & Sparkling San Pellegrino'
      },
      total_stays: 9,
      total_nights: 27,
      lifetime_spend: 34200,
      last_visit_date: '2026-08-30',
      current_room_number: '302',
      notes: 'Member of Mayfair Arts Club. Requests quiet suite away from elevator.',
      vip_tag: 'VIP Platinum'
    },
    {
      id: 'GST-6540',
      first_name: 'Arthur',
      last_name: 'Vance',
      full_name: 'Arthur Vance',
      email: 'arthur.vance@vancetech.io',
      phone: '+1 415 555 7820',
      phone_masked: '+1 (***) ***-7820',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
      tier: 'Gold VIP',
      nationality: 'American',
      city: 'San Francisco',
      country: 'United States',
      address: '888 Brannan St, San Francisco, CA 94103',
      verification_status: 'Verified',
      document: {
        id: 'DOC-7411',
        type: 'Passport',
        documentNumberMasked: 'US••••••14',
        documentNumberFull: 'US66209114',
        issuingCountry: 'United States',
        expiryDate: '2032-12-01',
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '19.5°C',
        floorPreference: 'High Floor',
        pillowType: 'Memory Foam',
        dietaryRestrictions: ['Gluten-Free'],
        welcomeAmenity: 'Cold brew selection & dark chocolate almonds'
      },
      total_stays: 5,
      total_nights: 16,
      lifetime_spend: 15400,
      last_visit_date: '2026-07-14',
      notes: 'Tech founder. Unrelated to Alistair Vance despite shared surname.',
      vip_tag: 'Corporate Elite'
    },
    {
      id: 'GST-5211',
      first_name: 'Elena',
      last_name: 'Moretti',
      full_name: 'Dr. Elena Moretti',
      email: 'elena.moretti@milano-cardio.it',
      phone: '+39 02 8901 3421',
      phone_masked: '+39 (***) ***-3421',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      tier: 'Silver Preferred',
      nationality: 'Italian',
      city: 'Milan',
      country: 'Italy',
      address: 'Via Montenapoleone 18, 20121 Milano MI',
      verification_status: 'Pending Verification',
      document: {
        id: 'DOC-6290',
        type: 'National ID',
        documentNumberMasked: 'IT••••••50',
        documentNumberFull: 'IT90234150',
        issuingCountry: 'Italy',
        expiryDate: '2027-02-14',
        status: 'Pending Verification'
      },
      preferences: {
        roomTemperature: '21.5°C',
        floorPreference: 'Garden View',
        pillowType: 'Hypoallergenic Feather',
        dietaryRestrictions: ['Vegetarian'],
        welcomeAmenity: 'Tuscan Chianti Classico & Grissini'
      },
      total_stays: 2,
      total_nights: 6,
      lifetime_spend: 5400,
      last_visit_date: '2025-11-20',
      notes: 'Speaker at Medical Summit. High attention to soundproofing.',
      vip_tag: 'VIP Guest'
    },
    {
      id: 'GST-4098',
      first_name: 'Kenji',
      last_name: 'Takahashi',
      full_name: 'Kenji Takahashi',
      email: 'k.takahashi@tokyo-capital.jp',
      phone: '+81 3 5555 0192',
      phone_masked: '+81 (***) ***-0192',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      tier: 'Platinum Elite',
      nationality: 'Japanese',
      city: 'Tokyo',
      country: 'Japan',
      address: 'Roppongi Hills Mori Tower, Minato-ku, Tokyo 106-6108',
      verification_status: 'Verified',
      document: {
        id: 'DOC-5182',
        type: 'Passport',
        documentNumberMasked: 'JP••••••72',
        documentNumberFull: 'JP88291072',
        issuingCountry: 'Japan',
        expiryDate: '2033-05-10',
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '20.0°C',
        floorPreference: 'High Floor',
        pillowType: 'Silk Pillow',
        dietaryRestrictions: ['Traditional Japanese Breakfast Requested'],
        welcomeAmenity: 'Gyokuro Green Tea Service & Wagashi confections'
      },
      total_stays: 11,
      total_nights: 38,
      lifetime_spend: 52800,
      last_visit_date: '2026-08-14',
      current_room_number: '304',
      notes: 'Executive board director. Frequent repeat guest.',
      vip_tag: 'VIP Platinum'
    }
  ];

  const { error: guestErr } = await supabase.from('guests').upsert(guests);
  if (guestErr) console.error('Guest Seed Error:', guestErr.message);
  else console.log('✓ Successfully seeded', guests.length, 'guests to Supabase!');

  // 2. Rooms
  const rooms = [
    {
      id: 'RM-401',
      room_number: '401',
      floor: 4,
      type: 'Presidential Penthouse Suite',
      price_per_night: 2400,
      status: 'Occupied',
      capacity: 4,
      bed_configuration: '1 Emperor Master Bed + 1 King Bed',
      square_meters: 280,
      view: 'Oceanfront',
      amenities: ['Private Heated Plunge Pool', 'Direct Keycard Elevator', 'Butler Service', 'Steinway Piano', 'Sauna'],
      current_guest_id: 'GST-8024',
      current_guest_name: 'Lord Alistair Vance-Sterling',
      current_stay_check_in: '2026-10-20',
      current_stay_check_out: '2026-10-25',
      last_cleaned_at: '2026-10-20T11:00:00Z',
      cleaned_by: 'Housekeeping Lead Maria G.'
    },
    {
      id: 'RM-402',
      room_number: '402',
      floor: 4,
      type: 'Presidential Penthouse Suite',
      price_per_night: 2400,
      status: 'Available',
      capacity: 4,
      bed_configuration: '1 Emperor Master Bed + 1 King Bed',
      square_meters: 280,
      view: 'City Skyline',
      amenities: ['Private Rooftop Terrace', 'Direct Keycard Elevator', 'Butler Service', 'Wine Cellar', 'Marble Fireplace'],
      next_reservation_date: '2026-10-24',
      last_cleaned_at: '2026-10-22T08:30:00Z',
      cleaned_by: 'Housekeeping Lead Maria G.'
    },
    {
      id: 'RM-101',
      room_number: '101',
      floor: 1,
      type: 'Royal Oceanfront Villa',
      price_per_night: 1850,
      status: 'Available',
      capacity: 6,
      bed_configuration: '2 King Master Suites + 2 Daybeds',
      square_meters: 320,
      view: 'Oceanfront',
      amenities: ['Private Beach Access', 'Infinity Pool', 'Dedicated Cabana', 'Outdoor Rain Shower', 'Kitchenette'],
      last_cleaned_at: '2026-10-22T07:45:00Z',
      cleaned_by: 'Housekeeping Team Alpha'
    },
    {
      id: 'RM-102',
      room_number: '102',
      floor: 1,
      type: 'Royal Oceanfront Villa',
      price_per_night: 1850,
      status: 'Reserved',
      capacity: 6,
      bed_configuration: '2 King Master Suites + 2 Daybeds',
      square_meters: 320,
      view: 'Oceanfront',
      amenities: ['Private Beach Access', 'Infinity Pool', 'Dedicated Cabana', 'Outdoor Rain Shower'],
      next_reservation_date: '2026-10-22',
      last_cleaned_at: '2026-10-21T16:00:00Z',
      cleaned_by: 'Housekeeping Team Alpha'
    },
    {
      id: 'RM-301',
      room_number: '301',
      floor: 3,
      type: 'Executive Grand Suite',
      price_per_night: 950,
      status: 'Cleaning',
      capacity: 3,
      bed_configuration: '1 California King Bed',
      square_meters: 110,
      view: 'Oceanfront',
      amenities: ['Panoramic Corner Balcony', 'Dressing Room', 'Soaking Marble Tub', 'Dyson Hair Care System'],
      maintenance_notes: 'Turnover in progress following morning departure. Deep steam cleaning.',
      last_cleaned_at: '2026-10-21T10:00:00Z'
    },
    {
      id: 'RM-302',
      room_number: '302',
      floor: 3,
      type: 'Executive Grand Suite',
      price_per_night: 950,
      status: 'Occupied',
      capacity: 3,
      bed_configuration: '1 California King Bed',
      square_meters: 110,
      view: 'City Skyline',
      amenities: ['Private Terrace', 'Walk-in Wardrobe', 'Aromatherapy Diffuser', 'Custom Bar'],
      current_guest_id: 'GST-7819',
      current_guest_name: 'Lady Sophia Kensington',
      current_stay_check_in: '2026-10-19',
      current_stay_check_out: '2026-10-23',
      last_cleaned_at: '2026-10-22T09:15:00Z'
    },
    {
      id: 'RM-201',
      room_number: '201',
      floor: 2,
      type: 'Deluxe King Sanctuary',
      price_per_night: 580,
      status: 'Available',
      capacity: 2,
      bed_configuration: '1 Plush King Bed',
      square_meters: 65,
      view: 'Botanical Gardens',
      amenities: ['Juliet Balcony', 'Rain Shower', 'Artisan Mini Bar', 'Smart Lighting Control'],
      last_cleaned_at: '2026-10-22T07:15:00Z',
      cleaned_by: 'Housekeeping Team Beta'
    },
    {
      id: 'RM-202',
      room_number: '202',
      floor: 2,
      type: 'Deluxe King Sanctuary',
      price_per_night: 580,
      status: 'Maintenance',
      capacity: 2,
      bed_configuration: '1 Plush King Bed',
      square_meters: 65,
      view: 'City Skyline',
      amenities: ['City View Loggia', 'Walk-in Closet', 'Rain Shower'],
      maintenance_notes: 'Annual HVAC precision calibration and smart thermostat firmware sync.',
      last_cleaned_at: '2026-10-20T14:00:00Z'
    }
  ];

  const { error: roomErr } = await supabase.from('rooms').upsert(rooms);
  if (roomErr) console.error('Room Seed Error:', roomErr.message);
  else console.log('✓ Successfully seeded', rooms.length, 'rooms to Supabase!');

  // 3. Reservations
  const reservations = [
    {
      id: 'RSV-9401',
      guest_id: 'GST-8024',
      guest_name: 'Lord Alistair Vance-Sterling',
      guest_email: 'alistair.vance@monaco-holdings.mc',
      guest_phone_masked: '+377 (***) ***-4821',
      room_number: '401',
      room_type: 'Presidential Penthouse Suite',
      check_in_date: '2026-10-20',
      check_out_date: '2026-10-25',
      nights: 5,
      adults: 2,
      total_price: 12000,
      paid_amount: 12000,
      status: 'Checked-In',
      special_requests: 'Chilled champagne at arrival. Express private lift access.',
      payment_method: 'Credit Card (Amex Black)'
    },
    {
      id: 'RSV-9402',
      guest_id: 'GST-7819',
      guest_name: 'Lady Sophia Kensington',
      guest_email: 'sophia.kensington@kensingtontrust.co.uk',
      guest_phone_masked: '+44 (***) ***-0912',
      room_number: '302',
      room_type: 'Executive Grand Suite',
      check_in_date: '2026-10-19',
      check_out_date: '2026-10-23',
      nights: 4,
      adults: 1,
      total_price: 3800,
      paid_amount: 3800,
      status: 'Checked-In',
      special_requests: 'Aromatherapy lavender essential oils in humidifier.',
      payment_method: 'Luxury Card'
    }
  ];

  const { error: resErr } = await supabase.from('reservations').upsert(reservations);
  if (resErr) console.error('Reservation Seed Error:', resErr.message);
  else console.log('✓ Successfully seeded', reservations.length, 'reservations to Supabase!');

  // 4. Audit Logs
  const auditLogs = [
    {
      id: 'AUD-501',
      action: 'Completed Check-Out',
      category: 'Check-Out',
      staff_name: 'Julian Vance',
      staff_role: 'Front Desk Manager',
      target: 'Room 301 / Amara Okafor (GST-3382)',
      details: 'Folio settled with Amex ending in 4018 ($4,120.00 incl incidentals). Room marked for Turnover Cleaning.',
      ip_address: '192.168.10.42 (Terminal 1)',
      severity: 'info'
    },
    {
      id: 'AUD-500',
      action: 'Room Sanitization Completed',
      category: 'Room Status',
      staff_name: 'Maria G. (Housekeeping Lead)',
      staff_role: 'Housekeeping Supervisor',
      target: 'Room 402 (Presidential Penthouse)',
      details: 'Inspection passed 100/100 points. Status updated to Available for arrival.',
      ip_address: '192.168.10.88 (Tablet HK-3)',
      severity: 'info'
    }
  ];

  const { error: auditErr } = await supabase.from('audit_logs').upsert(auditLogs);
  if (auditErr) console.error('Audit Seed Error:', auditErr.message);
  else console.log('✓ Successfully seeded', auditLogs.length, 'audit logs to Supabase!');

  console.log('--- All live data is now in your Supabase database! ---');
}

seedDatabase();
