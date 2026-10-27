const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rtmpuulcgnpktkhcdxyc.supabase.co',
  'sb_publishable_htREj7DcsV74c2Wb2g3BCQ_s7DpMD1S'
);

function makeAadhaarFrontSvg(name, aadhaarNum, city, dob) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF9"/>
        <stop offset="50%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#F7FAF7"/>
      </linearGradient>
    </defs>
    <rect width="600" height="380" rx="16" fill="url(#bg)" stroke="#B69A65" stroke-width="2"/>
    <rect x="0" y="0" width="600" height="12" fill="#FF9933" rx="16 16 0 0"/>
    <rect x="0" y="66" width="600" height="4" fill="#138808"/>
    <text x="300" y="38" font-family="sans-serif" font-size="18" font-weight="bold" fill="#202923" text-anchor="middle">भारत સરકાર / Government of India</text>
    <text x="300" y="56" font-family="sans-serif" font-size="12" fill="#777C77" text-anchor="middle">Unique Identification Authority of India (UIDAI)</text>
    <rect x="36" y="96" width="124" height="150" rx="8" fill="#202923" stroke="#D9D6CC" stroke-width="1.5"/>
    <circle cx="98" cy="150" r="36" fill="#B69A65" opacity="0.85"/>
    <path d="M58 220 Q98 185 138 220 Z" fill="#B69A65" opacity="0.85"/>
    <text x="98" y="235" font-family="sans-serif" font-size="10" fill="#FFFFFF" text-anchor="middle">GOVT PHOTO ID</text>
    <text x="184" y="125" font-family="sans-serif" font-size="12" fill="#777C77">નામ / Name:</text>
    <text x="184" y="148" font-family="sans-serif" font-size="17" font-weight="bold" fill="#202923">${name}</text>
    <text x="184" y="178" font-family="sans-serif" font-size="12" fill="#777C77">જન્મ તારીખ / DOB: ${dob || '15/06/1980'}</text>
    <text x="184" y="202" font-family="sans-serif" font-size="12" fill="#777C77">સરનામું / City: ${city}, India</text>
    <text x="184" y="228" font-family="sans-serif" font-size="12" fill="#138808" font-weight="bold">✓ AADHAAR CARD VERIFIED</text>
    <rect x="30" y="270" width="540" height="58" rx="10" fill="#202923"/>
    <text x="300" y="307" font-family="monospace" font-size="22" font-weight="bold" fill="#FDFBF7" text-anchor="middle" letter-spacing="4">${aadhaarNum}</text>
    <text x="300" y="321" font-family="sans-serif" font-size="10" fill="#B69A65" text-anchor="middle">મારો આધાર, મારી ઓળખ (Government of India)</text>
    <text x="300" y="360" font-family="sans-serif" font-size="10" fill="#959A95" text-anchor="middle">Helpline: 1947 • help@uidai.gov.in • www.uidai.gov.in</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function makeAadhaarBackSvg(address, city) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380">
    <rect width="600" height="380" rx="16" fill="#FAF9F6" stroke="#B69A65" stroke-width="2"/>
    <rect x="0" y="0" width="600" height="12" fill="#FF9933" rx="16 16 0 0"/>
    <rect x="0" y="66" width="600" height="4" fill="#138808"/>
    <text x="300" y="42" font-family="sans-serif" font-size="16" font-weight="bold" fill="#202923" text-anchor="middle">વિશિષ્ટ ઓળખ સત્તામંડળ / Unique Identification Authority of India</text>
    <rect x="40" y="96" width="350" height="150" rx="8" fill="#FFFFFF" stroke="#E8E6DF" stroke-width="1.5"/>
    <text x="56" y="125" font-family="sans-serif" font-size="12" font-weight="bold" fill="#777C77">સરનામું / Address:</text>
    <text x="56" y="148" font-family="sans-serif" font-size="13" fill="#202923">${address}</text>
    <text x="56" y="170" font-family="sans-serif" font-size="13" fill="#202923">${city}, Gujarat / India</text>
    <text x="56" y="195" font-family="sans-serif" font-size="11" fill="#777C77">PIN Code: 380015</text>
    <!-- QR Code Mock -->
    <rect x="420" y="96" width="140" height="140" rx="8" fill="#202923"/>
    <rect x="435" y="111" width="30" height="30" fill="#FFFFFF"/>
    <rect x="515" y="111" width="30" height="30" fill="#FFFFFF"/>
    <rect x="435" y="191" width="30" height="30" fill="#FFFFFF"/>
    <text x="490" y="255" font-family="sans-serif" font-size="10" fill="#777C77" text-anchor="middle">Secure QR Code</text>
    <rect x="30" y="280" width="540" height="48" rx="8" fill="#E8DEC8"/>
    <text x="300" y="310" font-family="sans-serif" font-size="12" font-weight="bold" fill="#8F6F2E" text-anchor="middle">The Royal Haveli Palace &amp; Resort • Verified Indian ID Document</text>
    <text x="300" y="355" font-family="sans-serif" font-size="10" fill="#959A95" text-anchor="middle">Unique Identification Authority of India • 1947 Helpline</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function makePanCardSvg(name, panNum, city) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380">
    <rect width="600" height="380" rx="16" fill="#F0F7FF" stroke="#3A6B9C" stroke-width="2"/>
    <rect x="0" y="0" width="600" height="60" fill="#2A5580" rx="16 16 0 0"/>
    <text x="300" y="28" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FFFFFF" text-anchor="middle">आयकर विभाग / INCOME TAX DEPARTMENT</text>
    <text x="300" y="48" font-family="sans-serif" font-size="12" fill="#D9E8F5" text-anchor="middle">भारत सरकार / GOVT. OF INDIA</text>
    <rect x="36" y="80" width="120" height="145" rx="8" fill="#1C3854" stroke="#D9D6CC" stroke-width="1.5"/>
    <circle cx="96" cy="135" r="32" fill="#6B9AC4"/>
    <path d="M60 200 Q96 168 132 200 Z" fill="#6B9AC4"/>
    <text x="96" y="215" font-family="sans-serif" font-size="10" fill="#FFFFFF" text-anchor="middle">PHOTO</text>
    <text x="180" y="105" font-family="sans-serif" font-size="11" fill="#5A7184">Name / નામ:</text>
    <text x="180" y="128" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1A2D3F">${name}</text>
    <text x="180" y="155" font-family="sans-serif" font-size="11" fill="#5A7184">Father's Name: D. K. ${name.split(' ')[1] || 'Sharma'}</text>
    <text x="180" y="180" font-family="sans-serif" font-size="11" fill="#5A7184">Date of Birth: 22/10/1985</text>
    <text x="180" y="205" font-family="sans-serif" font-size="12" fill="#2E6F4E" font-weight="bold">✓ PERMANENT ACCOUNT CARD</text>
    <rect x="30" y="255" width="540" height="55" rx="10" fill="#1C3854"/>
    <text x="300" y="291" font-family="monospace" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">${panNum}</text>
    <text x="300" y="345" font-family="sans-serif" font-size="11" fill="#5A7184" text-anchor="middle">Signature / સહી: ${name}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

async function seedIndianData() {
  console.log('=== SEEDING PURE INDIAN HOSPITALITY DATA INTO LIVE SUPABASE ===');

  // 1. Indian Guests
  const guests = [
    {
      id: 'GST-101',
      first_name: 'Rajeshbhai',
      last_name: 'Mehta',
      full_name: 'Rajeshbhai Mehta',
      email: 'rajesh.mehta@mehtaconglomerate.in',
      phone: '+91 98250 12841',
      phone_masked: '+91 98250 ••••41',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
      tier: 'Royal Ambassador',
      nationality: 'Indian',
      city: 'Ahmedabad',
      country: 'India',
      address: 'Bungalow 4, Bodakdev, SG Highway, Ahmedabad, Gujarat 380054',
      date_of_birth: '1974-06-18',
      verification_status: 'Verified',
      document: {
        id: 'DOC-801',
        type: 'Aadhaar Card',
        documentNumberMasked: '•••• •••• 9821',
        documentNumberFull: '8492 7102 9821',
        issuingCountry: 'India',
        expiryDate: '2036-12-31',
        verifiedAt: '2026-08-12T14:30:00Z',
        verifiedBy: 'Priya Patel (Front Desk Mgr)',
        documentImageUrl: makeAadhaarFrontSvg('Rajeshbhai Mehta', 'XXXX XXXX 9821', 'Ahmedabad', '18/06/1974'),
        documentBackImageUrl: makeAadhaarBackSvg('Bungalow 4, Bodakdev, SG Highway', 'Ahmedabad'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '21.5°C',
        floorPreference: 'High Floor',
        pillowType: 'Silk Pillow',
        dietaryRestrictions: ['Pure Vegetarian', 'Jain Breakfast Preference'],
        welcomeAmenity: 'Kesar Badam Milk & Traditional Gujarati Ghevar',
        newspaper: 'Gujarat Samachar & Economic Times (Physical by 06:30 AM)',
        specialNotes: 'Chairman of Mehta Group. Personal friend of property patron.'
      },
      total_stays: 16,
      total_nights: 52,
      lifetime_spend: 185000,
      last_visit_date: '2026-10-20',
      current_room_number: '401',
      notes: 'VIP Guest. Prefers Lake Pichola view and early morning temple visit arrangements.',
      vip_tag: 'Patron VIP'
    },
    {
      id: 'GST-102',
      first_name: 'Priya',
      last_name: 'Patel',
      full_name: 'Priya Patel',
      email: 'priya.patel@suratjewels.in',
      phone: '+91 97129 44812',
      phone_masked: '+91 97129 ••••12',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
      tier: 'Platinum Elite',
      nationality: 'Indian',
      city: 'Surat',
      country: 'India',
      address: '22 Ghod Dod Road, Surat, Gujarat 395007',
      date_of_birth: '1984-09-12',
      verification_status: 'Verified',
      document: {
        id: 'DOC-802',
        type: 'Aadhaar Card',
        documentNumberMasked: '•••• •••• 4129',
        documentNumberFull: '9102 3841 4129',
        issuingCountry: 'India',
        expiryDate: '2035-08-15',
        verifiedAt: '2026-09-02T10:15:00Z',
        verifiedBy: 'Rajesh Sharma (Concierge)',
        documentImageUrl: makeAadhaarFrontSvg('Priya Patel', 'XXXX XXXX 4129', 'Surat', '12/09/1984'),
        documentBackImageUrl: makeAadhaarBackSvg('22 Ghod Dod Road', 'Surat'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '22.0°C',
        floorPreference: 'Garden View',
        pillowType: 'Hypoallergenic Feather',
        dietaryRestrictions: ['Vegetarian', 'Oat Milk Ginger Tea'],
        welcomeAmenity: 'Fresh Alphonso Mango Coulis & Organic Dry Fruits'
      },
      total_stays: 11,
      total_nights: 34,
      lifetime_spend: 124000,
      last_visit_date: '2026-10-21',
      current_room_number: '302',
      notes: 'Leading diamond jewelry designer from Surat.',
      vip_tag: 'VIP Platinum'
    },
    {
      id: 'GST-103',
      first_name: 'Ananya',
      last_name: 'Sharma',
      full_name: 'Dr. Ananya Sharma',
      email: 'dr.ananya.sharma@mumbaicardio.org',
      phone: '+91 98201 55320',
      phone_masked: '+91 98201 ••••20',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
      tier: 'Gold VIP',
      nationality: 'Indian',
      city: 'Mumbai',
      country: 'India',
      address: 'Flat 14B, Altamount Road, Cumballa Hill, Mumbai 400026',
      date_of_birth: '1982-11-25',
      verification_status: 'Verified',
      document: {
        id: 'DOC-803',
        type: 'PAN Card',
        documentNumberMasked: 'ABC••••82D',
        documentNumberFull: 'ABCPS8182D',
        issuingCountry: 'India',
        expiryDate: '2035-12-31',
        verifiedAt: '2026-07-14T09:00:00Z',
        verifiedBy: 'Priya Patel',
        documentImageUrl: makePanCardSvg('Dr. Ananya Sharma', 'ABC••••82D', 'Mumbai'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '20.0°C',
        floorPreference: 'Quiet Corner',
        pillowType: 'Memory Foam',
        dietaryRestrictions: ['Gluten-Free', 'Low Sodium'],
        welcomeAmenity: 'Kashmiri Saffron Kahwa with Crushed Almonds'
      },
      total_stays: 7,
      total_nights: 21,
      lifetime_spend: 76500,
      last_visit_date: '2026-10-18',
      current_room_number: '204',
      notes: 'Chief Cardiologist. Attending medical summit in Udaipur.',
      vip_tag: 'Corporate Elite'
    },
    {
      id: 'GST-104',
      first_name: 'Vikramaditya',
      last_name: 'Singhania',
      full_name: 'Maharaj Vikramaditya Singhania',
      email: 'vikram.singhania@rajasthanheritage.org',
      phone: '+91 94140 88201',
      phone_masked: '+91 94140 ••••01',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
      tier: 'Royal Ambassador',
      nationality: 'Indian',
      city: 'Jaipur',
      country: 'India',
      address: 'The Singhania Kothi, Civil Lines, Jaipur, Rajasthan 302006',
      date_of_birth: '1969-04-03',
      verification_status: 'Verified',
      document: {
        id: 'DOC-804',
        type: 'Passport',
        documentNumberMasked: 'Z••••••42',
        documentNumberFull: 'Z8942142',
        issuingCountry: 'India',
        expiryDate: '2034-03-20',
        verifiedAt: '2026-06-10T11:00:00Z',
        verifiedBy: 'Abhisek Parmar (GM)',
        documentImageUrl: makeAadhaarFrontSvg('Maharaj Vikramaditya Singhania', 'XXXX XXXX 5590', 'Jaipur', '03/04/1969'),
        documentBackImageUrl: makeAadhaarBackSvg('The Singhania Kothi, Civil Lines', 'Jaipur'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '21.0°C',
        floorPreference: 'High Floor',
        pillowType: 'Silk Pillow',
        dietaryRestrictions: ['Royal Rajputana Cuisine', 'Traditional Dal Baati Churma'],
        welcomeAmenity: 'Vintage Rose Petal Sharbat & Heritage Silver Platter'
      },
      total_stays: 24,
      total_nights: 78,
      lifetime_spend: 345000,
      last_visit_date: '2026-09-28',
      current_room_number: '402',
      notes: 'Heritage Trust Patron. Always reserves Shahi Pool Villa with personal butler.',
      vip_tag: 'Royal Ambassador'
    },
    {
      id: 'GST-105',
      first_name: 'Arvind',
      last_name: 'Malhotra',
      full_name: 'Col. Arvind Malhotra',
      email: 'arvind.malhotra@defence-advisory.in',
      phone: '+91 98110 33419',
      phone_masked: '+91 98110 ••••19',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
      tier: 'Platinum Elite',
      nationality: 'Indian',
      city: 'New Delhi',
      country: 'India',
      address: '12 Golf Links, New Delhi 110003',
      date_of_birth: '1962-08-15',
      verification_status: 'Verified',
      document: {
        id: 'DOC-805',
        type: 'Aadhaar Card',
        documentNumberMasked: '•••• •••• 5510',
        documentNumberFull: '6620 9182 5510',
        issuingCountry: 'India',
        expiryDate: '2033-12-31',
        verifiedAt: '2026-05-18T16:00:00Z',
        verifiedBy: 'Priya Patel',
        documentImageUrl: makeAadhaarFrontSvg('Col. Arvind Malhotra', 'XXXX XXXX 5510', 'New Delhi', '15/08/1962'),
        documentBackImageUrl: makeAadhaarBackSvg('12 Golf Links', 'New Delhi'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '19.5°C',
        floorPreference: 'Ground Floor',
        pillowType: 'Hypoallergenic Feather',
        dietaryRestrictions: ['High Protein', 'Earl Grey Tea at 06:00 AM'],
        welcomeAmenity: 'Darjeeling First Flush Tea Selection'
      },
      total_stays: 9,
      total_nights: 28,
      lifetime_spend: 98000,
      last_visit_date: '2026-10-19',
      current_room_number: '101',
      notes: 'Retired Army Colonel and Strategic Defense Consultant.',
      vip_tag: 'VIP Platinum'
    },
    {
      id: 'GST-106',
      first_name: 'Sneha',
      last_name: 'Desai',
      full_name: 'Sneha Desai',
      email: 'sneha.desai@innovatetech.in',
      phone: '+91 99099 77812',
      phone_masked: '+91 99099 ••••12',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      tier: 'Gold VIP',
      nationality: 'Indian',
      city: 'Vadodara',
      country: 'India',
      address: 'Alkapuri, Vadodara, Gujarat 390007',
      date_of_birth: '1989-02-14',
      verification_status: 'Verified',
      document: {
        id: 'DOC-806',
        type: 'PAN Card',
        documentNumberMasked: 'BPK••••19K',
        documentNumberFull: 'BPKPD1919K',
        issuingCountry: 'India',
        expiryDate: '2035-12-31',
        verifiedAt: '2026-08-20T12:00:00Z',
        verifiedBy: 'Priya Patel',
        documentImageUrl: makePanCardSvg('Sneha Desai', 'BPK••••19K', 'Vadodara'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '21.0°C',
        floorPreference: 'Garden View',
        pillowType: 'Hypoallergenic Feather',
        dietaryRestrictions: ['Vegetarian', 'Filter Coffee'],
        welcomeAmenity: 'Gujarati Khaman & Artisanal Filter Coffee Kit'
      },
      total_stays: 6,
      total_nights: 18,
      lifetime_spend: 62000,
      last_visit_date: '2026-09-15',
      notes: 'Tech founder from Vadodara.',
      vip_tag: 'Corporate VIP'
    },
    {
      id: 'GST-107',
      first_name: 'Amit',
      last_name: 'Trivedi',
      full_name: 'Amit Trivedi',
      email: 'amit.trivedi@rajkotexporters.in',
      phone: '+91 98242 11984',
      phone_masked: '+91 98242 ••••84',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
      tier: 'Silver Preferred',
      nationality: 'Indian',
      city: 'Rajkot',
      country: 'India',
      address: 'Kalawad Road, Rajkot, Gujarat 360005',
      date_of_birth: '1981-10-30',
      verification_status: 'Verified',
      document: {
        id: 'DOC-807',
        type: 'Voter ID',
        documentNumberMasked: 'GJ/••••/821',
        documentNumberFull: 'GJ/04/029/8821',
        issuingCountry: 'India',
        expiryDate: '2038-01-01',
        verifiedAt: '2026-07-22T14:00:00Z',
        verifiedBy: 'Rajesh Sharma',
        documentImageUrl: makeAadhaarFrontSvg('Amit Trivedi', 'XXXX XXXX 8821', 'Rajkot', '30/10/1981'),
        documentBackImageUrl: makeAadhaarBackSvg('Kalawad Road', 'Rajkot'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '22.0°C',
        floorPreference: 'Ground Floor',
        pillowType: 'Hypoallergenic Feather',
        dietaryRestrictions: ['Pure Kathiyawadi Vegetarian'],
        welcomeAmenity: 'Masala Chaas & Roasted Cashews'
      },
      total_stays: 4,
      total_nights: 12,
      lifetime_spend: 48000,
      last_visit_date: '2026-08-14',
      notes: 'Agricultural commodity exporter from Saurashtra.',
      vip_tag: 'Business Select'
    },
    {
      id: 'GST-108',
      first_name: 'Harishbhai',
      last_name: 'Shah',
      full_name: 'Harishbhai Shah',
      email: 'harish.shah@ahmedabadtextiles.com',
      phone: '+91 98251 66209',
      phone_masked: '+91 98251 ••••09',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
      tier: 'Gold VIP',
      nationality: 'Indian',
      city: 'Ahmedabad',
      country: 'India',
      address: 'Near Law Garden, Ellisbridge, Ahmedabad, Gujarat 380006',
      date_of_birth: '1970-01-20',
      verification_status: 'Verified',
      document: {
        id: 'DOC-808',
        type: 'Aadhaar Card',
        documentNumberMasked: '•••• •••• 1092',
        documentNumberFull: '7721 4402 1092',
        issuingCountry: 'India',
        expiryDate: '2035-12-31',
        verifiedAt: '2026-06-05T15:30:00Z',
        verifiedBy: 'Priya Patel',
        documentImageUrl: makeAadhaarFrontSvg('Harishbhai Shah', 'XXXX XXXX 1092', 'Ahmedabad', '20/01/1970'),
        documentBackImageUrl: makeAadhaarBackSvg('Ellisbridge, Law Garden', 'Ahmedabad'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '21.5°C',
        floorPreference: 'High Floor',
        pillowType: 'Silk Pillow',
        dietaryRestrictions: ['Jain Pure Veg - No Root Vegetables'],
        welcomeAmenity: 'Kesar Peda & Fresh Tender Coconut'
      },
      total_stays: 12,
      total_nights: 36,
      lifetime_spend: 112000,
      last_visit_date: '2026-09-02',
      notes: 'Textile mill owner. Regular weekend visitor.',
      vip_tag: 'VIP Gold'
    },
    {
      id: 'GST-109',
      first_name: 'Kavita',
      last_name: 'Iyer',
      full_name: 'Kavita Iyer',
      email: 'kavita.iyer@bengaluru-ai.io',
      phone: '+91 98450 77319',
      phone_masked: '+91 98450 ••••19',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
      tier: 'Silver Preferred',
      nationality: 'Indian',
      city: 'Bengaluru',
      country: 'India',
      address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
      date_of_birth: '1992-05-18',
      verification_status: 'Verified',
      document: {
        id: 'DOC-809',
        type: 'Aadhaar Card',
        documentNumberMasked: '•••• •••• 7731',
        documentNumberFull: '9021 3418 7731',
        issuingCountry: 'India',
        expiryDate: '2037-05-18',
        verifiedAt: '2026-09-10T10:00:00Z',
        verifiedBy: 'Rajesh Sharma',
        documentImageUrl: makeAadhaarFrontSvg('Kavita Iyer', 'XXXX XXXX 7731', 'Bengaluru', '18/05/1992'),
        documentBackImageUrl: makeAadhaarBackSvg('Indiranagar 100ft Road', 'Bengaluru'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '20.0°C',
        floorPreference: 'Garden View',
        pillowType: 'Memory Foam',
        dietaryRestrictions: ['South Indian Filter Coffee lover', 'Vegetarian'],
        welcomeAmenity: 'Mysore Pak & Traditional Filter Coffee'
      },
      total_stays: 3,
      total_nights: 9,
      lifetime_spend: 38000,
      last_visit_date: '2026-10-05',
      notes: 'AI Director at Tech Lab Bengaluru.',
      vip_tag: 'Corporate'
    },
    {
      id: 'GST-110',
      first_name: 'Meera',
      last_name: 'Rajput',
      full_name: 'Meera Rajput',
      email: 'meera.rajput@udaipurarts.org',
      phone: '+91 94141 22891',
      phone_masked: '+91 94141 ••••91',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      tier: 'Standard',
      nationality: 'Indian',
      city: 'Udaipur',
      country: 'India',
      address: 'Fateh Sagar Lake Road, Udaipur, Rajasthan 313001',
      date_of_birth: '1995-12-08',
      verification_status: 'Verified',
      document: {
        id: 'DOC-810',
        type: "Driver's License",
        documentNumberMasked: 'RJ••••••91',
        documentNumberFull: 'RJ27 2018002991',
        issuingCountry: 'India',
        expiryDate: '2038-12-08',
        verifiedAt: '2026-10-12T11:00:00Z',
        verifiedBy: 'Priya Patel',
        documentImageUrl: makeAadhaarFrontSvg('Meera Rajput', 'XXXX XXXX 2991', 'Udaipur', '08/12/1995'),
        documentBackImageUrl: makeAadhaarBackSvg('Fateh Sagar Lake Road', 'Udaipur'),
        status: 'Verified'
      },
      preferences: {
        roomTemperature: '22.0°C',
        floorPreference: 'Quiet Corner',
        pillowType: 'Hypoallergenic Feather',
        dietaryRestrictions: ['Organic Herbal Infusions'],
        welcomeAmenity: 'Rajasthan Miniature Art Print & Fresh Hibiscus Tea'
      },
      total_stays: 2,
      total_nights: 6,
      lifetime_spend: 24000,
      last_visit_date: '2026-10-15',
      notes: 'Author and Rajasthani miniature painting curator.',
      vip_tag: 'Local Patron'
    }
  ];

  // 2. Indian Rooms & Suites (INR Pricing)
  const rooms = [
    {
      id: 'RM-401',
      room_number: '401',
      floor: 4,
      type: 'Maharaja Presidential Suite',
      price_per_night: 45000,
      status: 'Occupied',
      capacity: 4,
      bed_configuration: '1 Emperor Master Bed + 1 King Bed',
      square_meters: 320,
      view: 'Lake Pichola View',
      amenities: [
        'Private Heated Plunge Pool',
        'Direct Jharokha Lake Balcony',
        'Dedicated Royal Khidmatgar (Butler)',
        'Italian Marble Bathtub',
        'Ayurvedic Spa Products',
        'High-Speed Wi-Fi'
      ],
      current_guest_id: 'GST-101',
      current_guest_name: 'Rajeshbhai Mehta',
      current_stay_check_in: '2026-10-20',
      current_stay_check_out: '2026-10-25',
      last_cleaned_at: '2026-10-20T11:00:00Z',
      cleaned_by: 'Housekeeping Lead Ramesh K.'
    },
    {
      id: 'RM-402',
      room_number: '402',
      floor: 4,
      type: 'Maharaja Presidential Suite',
      price_per_night: 48000,
      status: 'Occupied',
      capacity: 4,
      bed_configuration: '1 Emperor Master Bed + 1 Royal Diwan',
      square_meters: 350,
      view: 'Lake Pichola View',
      amenities: [
        'Private Heated Infinity Pool',
        'Panoramic Aravali & Lake View Terrace',
        '24/7 Butler Service',
        'Antique Teak Dressing Room',
        'Artisanal Saffron Bar'
      ],
      current_guest_id: 'GST-104',
      current_guest_name: 'Maharaj Vikramaditya Singhania',
      current_stay_check_in: '2026-10-21',
      current_stay_check_out: '2026-10-27',
      last_cleaned_at: '2026-10-21T09:00:00Z',
      cleaned_by: 'Housekeeping Lead Ramesh K.'
    },
    {
      id: 'RM-301',
      room_number: '301',
      floor: 3,
      type: 'Royal Haveli Suite',
      price_per_night: 28500,
      status: 'Available',
      capacity: 3,
      bed_configuration: '1 Royal King Bed',
      square_meters: 120,
      view: 'Lake Pichola View',
      amenities: [
        'Carved Marble Jharokha',
        'Jacuzzi with Lake View',
        'Traditional Brass Fittings',
        'Smart 4K TV',
        'Chai & Espresso Bar'
      ],
      last_cleaned_at: '2026-10-22T08:00:00Z',
      cleaned_by: 'Housekeeping Lead Ramesh K.'
    },
    {
      id: 'RM-302',
      room_number: '302',
      floor: 3,
      type: 'Royal Haveli Suite',
      price_per_night: 28500,
      status: 'Occupied',
      capacity: 3,
      bed_configuration: '1 Royal King Bed',
      square_meters: 120,
      view: 'Lake Pichola View',
      amenities: [
        'Carved Marble Jharokha',
        'Jacuzzi with Lake View',
        'Traditional Brass Fittings',
        'Smart 4K TV'
      ],
      current_guest_id: 'GST-102',
      current_guest_name: 'Priya Patel',
      current_stay_check_in: '2026-10-21',
      current_stay_check_out: '2026-10-24',
      last_cleaned_at: '2026-10-21T10:00:00Z',
      cleaned_by: 'Housekeeping Staff Mohan L.'
    },
    {
      id: 'RM-201',
      room_number: '201',
      floor: 2,
      type: 'Palace Courtyard Villa',
      price_per_night: 18500,
      status: 'Cleaning',
      capacity: 2,
      bed_configuration: '1 King Size Royal Bed',
      square_meters: 85,
      view: 'Palace Courtyard',
      amenities: [
        'Hand-Painted Fresco Ceilings',
        'Private Courtyard Sitout',
        'Rain Shower',
        'High-Speed Wi-Fi'
      ],
      last_cleaned_at: '2026-10-22T06:30:00Z',
      cleaned_by: 'Housekeeping Staff Mohan L.'
    },
    {
      id: 'RM-204',
      room_number: '204',
      floor: 2,
      type: 'Palace Courtyard Villa',
      price_per_night: 18500,
      status: 'Occupied',
      capacity: 2,
      bed_configuration: '1 King Size Royal Bed',
      square_meters: 85,
      view: 'Palace Courtyard',
      amenities: [
        'Hand-Painted Fresco Ceilings',
        'Courtyard Sitout',
        'Rain Shower'
      ],
      current_guest_id: 'GST-103',
      current_guest_name: 'Dr. Ananya Sharma',
      current_stay_check_in: '2026-10-18',
      current_stay_check_out: '2026-10-23',
      last_cleaned_at: '2026-10-18T12:00:00Z',
      cleaned_by: 'Housekeeping Staff Mohan L.'
    },
    {
      id: 'RM-101',
      room_number: '101',
      floor: 1,
      type: 'Heritage Grand Suite',
      price_per_night: 12500,
      status: 'Occupied',
      capacity: 2,
      bed_configuration: '1 King Size Bed',
      square_meters: 65,
      view: 'Royal Gardens',
      amenities: [
        'Private Garden Sitout',
        'Artisanal Brass Bathroom Fittings',
        'Ayurvedic Amenities',
        'Tea Station'
      ],
      current_guest_id: 'GST-105',
      current_guest_name: 'Col. Arvind Malhotra',
      current_stay_check_in: '2026-10-19',
      current_stay_check_out: '2026-10-23',
      last_cleaned_at: '2026-10-19T14:00:00Z',
      cleaned_by: 'Housekeeping Staff Geeta B.'
    },
    {
      id: 'RM-102',
      room_number: '102',
      floor: 1,
      type: 'Heritage Grand Suite',
      price_per_night: 12500,
      status: 'Available',
      capacity: 2,
      bed_configuration: '1 King Size Bed',
      square_meters: 65,
      view: 'Royal Gardens',
      amenities: [
        'Private Garden Sitout',
        'Artisanal Brass Fittings',
        'Ayurvedic Amenities'
      ],
      last_cleaned_at: '2026-10-22T07:45:00Z',
      cleaned_by: 'Housekeeping Staff Geeta B.'
    },
    {
      id: 'RM-105',
      room_number: '105',
      floor: 1,
      type: 'Classic Luxury Room',
      price_per_night: 8500,
      status: 'Available',
      capacity: 2,
      bed_configuration: '1 Queen Size Royal Bed',
      square_meters: 50,
      view: 'Royal Gardens',
      amenities: [
        'Traditional Jali Carvings',
        'En-suite Marble Bathroom',
        'Wi-Fi & Smart TV'
      ],
      last_cleaned_at: '2026-10-22T08:15:00Z',
      cleaned_by: 'Housekeeping Staff Geeta B.'
    },
    {
      id: 'RM-205',
      room_number: '205',
      floor: 2,
      type: 'Classic Luxury Room',
      price_per_night: 8500,
      status: 'Maintenance',
      capacity: 2,
      bed_configuration: '1 Queen Size Royal Bed',
      square_meters: 50,
      view: 'Palace Courtyard',
      amenities: [
        'Traditional Jali Carvings',
        'En-suite Marble Bathroom'
      ],
      maintenance_notes: 'Scheduled Daikin AC duct inspection and filter sanitization'
    }
  ];

  // 3. Indian Reservations
  const reservations = [
    {
      id: 'RSV-9101',
      guest_id: 'GST-101',
      guest_name: 'Rajeshbhai Mehta',
      guest_email: 'rajesh.mehta@mehtaconglomerate.in',
      guest_phone_masked: '+91 98250 ••••41',
      room_number: '401',
      room_type: 'Maharaja Presidential Suite',
      check_in_date: '2026-10-20',
      check_out_date: '2026-10-25',
      nights: 5,
      adults: 2,
      children: 0,
      total_price: 225000,
      paid_amount: 225000,
      status: 'Checked-In',
      special_requests: 'Pichola lake sunrise boat ride & Jain meals',
      payment_method: 'HDFC Diners Black (UPI)',
      created_at: '2026-10-10T10:00:00Z'
    },
    {
      id: 'RSV-9102',
      guest_id: 'GST-102',
      guest_name: 'Priya Patel',
      guest_email: 'priya.patel@suratjewels.in',
      guest_phone_masked: '+91 97129 ••••12',
      room_number: '302',
      room_type: 'Royal Haveli Suite',
      check_in_date: '2026-10-21',
      check_out_date: '2026-10-24',
      nights: 3,
      adults: 2,
      children: 0,
      total_price: 85500,
      paid_amount: 85500,
      status: 'Checked-In',
      special_requests: 'Lake view high floor, early morning yoga session',
      payment_method: 'UPI (GPay / ICICI)',
      created_at: '2026-10-14T11:00:00Z'
    },
    {
      id: 'RSV-9103',
      guest_id: 'GST-103',
      guest_name: 'Dr. Ananya Sharma',
      guest_email: 'dr.ananya.sharma@mumbaicardio.org',
      guest_phone_masked: '+91 98201 ••••20',
      room_number: '204',
      room_type: 'Palace Courtyard Villa',
      check_in_date: '2026-10-18',
      check_out_date: '2026-10-23',
      nights: 5,
      adults: 1,
      children: 0,
      total_price: 92500,
      paid_amount: 92500,
      status: 'Checked-In',
      special_requests: 'Quiet room away from elevators, gluten free',
      payment_method: 'ICICI Coral Card',
      created_at: '2026-10-08T15:00:00Z'
    },
    {
      id: 'RSV-9104',
      guest_id: 'GST-104',
      guest_name: 'Maharaj Vikramaditya Singhania',
      guest_email: 'vikram.singhania@rajasthanheritage.org',
      guest_phone_masked: '+91 94140 ••••01',
      room_number: '402',
      room_type: 'Maharaja Presidential Suite',
      check_in_date: '2026-10-21',
      check_out_date: '2026-10-27',
      nights: 6,
      adults: 2,
      children: 0,
      total_price: 288000,
      paid_amount: 288000,
      status: 'Checked-In',
      special_requests: 'Personal royal butler, antique car airport transfer',
      payment_method: 'RuPay Platinum Elite',
      created_at: '2026-10-01T09:00:00Z'
    },
    {
      id: 'RSV-9105',
      guest_id: 'GST-105',
      guest_name: 'Col. Arvind Malhotra',
      guest_email: 'arvind.malhotra@defence-advisory.in',
      guest_phone_masked: '+91 98110 ••••19',
      room_number: '101',
      room_type: 'Heritage Grand Suite',
      check_in_date: '2026-10-19',
      check_out_date: '2026-10-23',
      nights: 4,
      adults: 1,
      children: 0,
      total_price: 50000,
      paid_amount: 50000,
      status: 'Checked-In',
      special_requests: 'Ground floor room, early morning wake-up call at 05:45 AM',
      payment_method: 'UPI (PhonePe)',
      created_at: '2026-10-12T14:30:00Z'
    },
    {
      id: 'RSV-9106',
      guest_id: 'GST-106',
      guest_name: 'Sneha Desai',
      guest_email: 'sneha.desai@innovatetech.in',
      guest_phone_masked: '+91 99099 ••••12',
      room_number: '301',
      room_type: 'Royal Haveli Suite',
      check_in_date: '2026-10-24',
      check_out_date: '2026-10-27',
      nights: 3,
      adults: 2,
      children: 0,
      total_price: 85500,
      paid_amount: 40000,
      status: 'Confirmed',
      special_requests: 'High speed Wi-Fi setup, filter coffee on arrival',
      payment_method: 'HDFC Corporate Card',
      created_at: '2026-10-18T16:00:00Z'
    }
  ];

  // 4. Indian Hospitality Audit Logs
  const auditLogs = [
    {
      id: 'AUD-801',
      timestamp: '2026-10-22T08:30:00Z',
      action: 'Checked In Returning Guest',
      category: 'Check-In',
      staff_name: 'Priya Patel',
      staff_role: 'Front Office Manager',
      target: 'Rajeshbhai Mehta (GST-101)',
      details: 'Issued digital keycards for Room 401 (Maharaja Presidential Suite). Aadhaar verification re-confirmed.',
      ip_address: '192.168.1.10 (Front Desk Terminal 1)',
      severity: 'info'
    },
    {
      id: 'AUD-802',
      timestamp: '2026-10-22T07:45:00Z',
      action: 'Room Sanitization Completed',
      category: 'Room Status',
      staff_name: 'Ramesh Kumar',
      staff_role: 'Housekeeping Lead',
      target: 'Room 301',
      details: 'Deep sanitization and heritage teak polish verified. Status set to Available.',
      ip_address: '192.168.1.42 (Mobile Terminal)',
      severity: 'info'
    },
    {
      id: 'AUD-803',
      timestamp: '2026-10-21T16:15:00Z',
      action: 'ID Proof Photo Uploaded & Archived',
      category: 'Guest Profile',
      staff_name: 'Priya Patel',
      staff_role: 'Front Office Manager',
      target: 'Priya Patel (GST-102)',
      details: 'Scanned front and back Aadhaar card photos securely archived with UIDAI checksum.',
      ip_address: '192.168.1.11 (Terminal 2)',
      severity: 'info'
    },
    {
      id: 'AUD-804',
      timestamp: '2026-10-21T11:20:00Z',
      action: 'Added New Luxury Room',
      category: 'Room Status',
      staff_name: 'Abhisek Parmar',
      staff_role: 'General Manager',
      target: 'Room 402 (Maharaja Presidential Suite)',
      details: 'Added Shahi Pool Villa to inventory at ₹48,000/night.',
      ip_address: '192.168.1.1 (Executive Office)',
      severity: 'info'
    }
  ];

  // Clean old tables and insert fresh Indian records
  console.log('Cleaning old records...');
  await supabase.from('audit_logs').delete().neq('id', 'NONE');
  await supabase.from('reservations').delete().neq('id', 'NONE');
  await supabase.from('rooms').delete().neq('id', 'NONE');
  await supabase.from('guests').delete().neq('id', 'NONE');

  console.log('Inserting 10 Indian Guests with Aadhaar / PAN Photos...');
  const gResult = await supabase.from('guests').insert(guests);
  if (gResult.error) console.error('Guest Insert Error:', gResult.error);
  else console.log('✓ Successfully inserted 10 Indian guests into Supabase!');

  console.log('Inserting 10 Luxury Rooms in INR (₹)...');
  const rResult = await supabase.from('rooms').insert(rooms);
  if (rResult.error) console.error('Room Insert Error:', rResult.error);
  else console.log('✓ Successfully inserted 10 Luxury rooms into Supabase!');

  console.log('Inserting Indian Reservations...');
  const resResult = await supabase.from('reservations').insert(reservations);
  if (resResult.error) console.error('Reservation Insert Error:', resResult.error);
  else console.log('✓ Successfully inserted reservations into Supabase!');

  console.log('Inserting Audit Logs...');
  const aResult = await supabase.from('audit_logs').insert(auditLogs);
  if (aResult.error) console.error('Audit Insert Error:', aResult.error);
  else console.log('✓ Successfully inserted audit logs into Supabase!');

  console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
}

seedIndianData().catch(console.error);
