/**
 * Indian Document Helpers & High-Resolution Vector Previews
 * Used for Aadhaar Card, PAN Card, Voter ID generation and live previews
 */

export function generateAadhaarFrontSvg(name: string, aadhaarNum: string, city: string, dob?: string): string {
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
    <text x="300" y="38" font-family="sans-serif" font-size="18" font-weight="bold" fill="#202923" text-anchor="middle">Government of India</text>
    <text x="300" y="56" font-family="sans-serif" font-size="12" fill="#777C77" text-anchor="middle">Unique Identification Authority of India (UIDAI)</text>
    <rect x="36" y="96" width="124" height="150" rx="8" fill="#202923" stroke="#D9D6CC" stroke-width="1.5"/>
    <circle cx="98" cy="150" r="36" fill="#B69A65" opacity="0.85"/>
    <path d="M58 220 Q98 185 138 220 Z" fill="#B69A65" opacity="0.85"/>
    <text x="98" y="235" font-family="sans-serif" font-size="10" fill="#FFFFFF" text-anchor="middle">GOVT PHOTO ID</text>
    <text x="184" y="125" font-family="sans-serif" font-size="12" fill="#777C77">Name:</text>
    <text x="184" y="148" font-family="sans-serif" font-size="17" font-weight="bold" fill="#202923">${name}</text>
    <text x="184" y="178" font-family="sans-serif" font-size="12" fill="#777C77">Date of Birth: ${dob || '15/06/1980'}</text>
    <text x="184" y="202" font-family="sans-serif" font-size="12" fill="#777C77">City: ${city}, India</text>
    <text x="184" y="228" font-family="sans-serif" font-size="12" fill="#138808" font-weight="bold">✓ AADHAAR CARD VERIFIED</text>
    <rect x="30" y="270" width="540" height="58" rx="10" fill="#202923"/>
    <text x="300" y="307" font-family="monospace" font-size="22" font-weight="bold" fill="#FDFBF7" text-anchor="middle" letter-spacing="4">${aadhaarNum}</text>
    <text x="300" y="321" font-family="sans-serif" font-size="10" fill="#B69A65" text-anchor="middle">Unique Identification Authority of India</text>
    <text x="300" y="360" font-family="sans-serif" font-size="10" fill="#959A95" text-anchor="middle">Helpline: 1947 • help@uidai.gov.in • www.uidai.gov.in</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function generateAadhaarBackSvg(address: string, city: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380">
    <rect width="600" height="380" rx="16" fill="#FAF9F6" stroke="#B69A65" stroke-width="2"/>
    <rect x="0" y="0" width="600" height="12" fill="#FF9933" rx="16 16 0 0"/>
    <rect x="0" y="66" width="600" height="4" fill="#138808"/>
    <text x="300" y="42" font-family="sans-serif" font-size="16" font-weight="bold" fill="#202923" text-anchor="middle">Unique Identification Authority of India (UIDAI)</text>
    <rect x="40" y="96" width="350" height="150" rx="8" fill="#FFFFFF" stroke="#E8E6DF" stroke-width="1.5"/>
    <text x="56" y="125" font-family="sans-serif" font-size="12" font-weight="bold" fill="#777C77">Address:</text>
    <text x="56" y="148" font-family="sans-serif" font-size="13" fill="#202923">${address}</text>
    <text x="56" y="170" font-family="sans-serif" font-size="13" fill="#202923">${city}, Gujarat / India</text>
    <text x="56" y="195" font-family="sans-serif" font-size="11" fill="#777C77">PIN Code: 380015</text>
    <rect x="420" y="96" width="140" height="140" rx="8" fill="#202923"/>
    <rect x="435" y="111" width="30" height="30" fill="#FFFFFF"/>
    <rect x="515" y="111" width="30" height="30" fill="#FFFFFF"/>
    <rect x="435" y="191" width="30" height="30" fill="#FFFFFF"/>
    <text x="490" y="255" font-family="sans-serif" font-size="10" fill="#777C77" text-anchor="middle">Secure QR Code</text>
    <rect x="30" y="280" width="540" height="48" rx="8" fill="#E8DEC8"/>
    <text x="300" y="310" font-family="sans-serif" font-size="12" font-weight="bold" fill="#8F6F2E" text-anchor="middle">Royals Inn Palace &amp; Resort • Verified Indian ID Document</text>
    <text x="300" y="355" font-family="sans-serif" font-size="10" fill="#959A95" text-anchor="middle">Unique Identification Authority of India • 1947 Helpline</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export function generatePanCardSvg(name: string, panNum: string, city: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380">
    <rect width="600" height="380" rx="16" fill="#F0F7FF" stroke="#3A6B9C" stroke-width="2"/>
    <rect x="0" y="0" width="600" height="60" fill="#2A5580" rx="16 16 0 0"/>
    <text x="300" y="28" font-family="sans-serif" font-size="15" font-weight="bold" fill="#FFFFFF" text-anchor="middle">INCOME TAX DEPARTMENT</text>
    <text x="300" y="48" font-family="sans-serif" font-size="12" fill="#D9E8F5" text-anchor="middle">GOVERNMENT OF INDIA</text>
    <rect x="36" y="80" width="120" height="145" rx="8" fill="#1C3854" stroke="#D9D6CC" stroke-width="1.5"/>
    <circle cx="96" cy="135" r="32" fill="#6B9AC4"/>
    <path d="M60 200 Q96 168 132 200 Z" fill="#6B9AC4"/>
    <text x="96" y="215" font-family="sans-serif" font-size="10" fill="#FFFFFF" text-anchor="middle">PHOTO</text>
    <text x="180" y="105" font-family="sans-serif" font-size="11" fill="#5A7184">Name:</text>
    <text x="180" y="128" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1A2D3F">${name}</text>
    <text x="180" y="155" font-family="sans-serif" font-size="11" fill="#5A7184">Father's Name: D. K. ${name.split(' ')[1] || 'Sharma'}</text>
    <text x="180" y="180" font-family="sans-serif" font-size="11" fill="#5A7184">Date of Birth: 22/10/1985</text>
    <text x="180" y="205" font-family="sans-serif" font-size="12" fill="#2E6F4E" font-weight="bold">✓ PERMANENT ACCOUNT CARD</text>
    <rect x="30" y="255" width="540" height="55" rx="10" fill="#1C3854"/>
    <text x="300" y="291" font-family="monospace" font-size="22" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">${panNum}</text>
    <text x="300" y="345" font-family="sans-serif" font-size="11" fill="#5A7184" text-anchor="middle">Authorized Signature: ${name}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
