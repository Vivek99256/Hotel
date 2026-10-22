import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

export function maskPhone(phone: string): string {
  if (!phone) return '—';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return phone;
  const lastFour = clean.slice(-4);
  const prefix = clean.length > 10 ? `+91 ` : '+91 ';
  const firstTwo = clean.slice(-10, -8);
  return `${prefix}${firstTwo}••• ••${lastFour}`;
}

export function maskDocumentNumber(docNum: string, type?: string): string {
  if (!docNum) return '—';
  const clean = docNum.trim();
  if (clean.length <= 4) return '•••• ' + clean;

  if (type === 'Aadhaar Card' || clean.length === 12) {
    return `•••• •••• ${clean.slice(-4)}`;
  }
  if (type === 'PAN Card' || clean.length === 10) {
    return `${clean.slice(0, 3)}•••••${clean.slice(-2)}`;
  }

  const firstTwo = clean.slice(0, 2);
  const lastTwo = clean.slice(-2);
  return `${firstTwo}••••••${lastTwo}`;
}

export function getInitials(name: string): string {
  if (!name) return 'GH';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
