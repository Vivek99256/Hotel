import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { HotelProvider } from '@/lib/data-store';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Royal Haveli Palace & Resort | Luxury Heritage PMS (Udaipur)',
  description: 'Indian luxury heritage hotel management system, returning guest intelligence, Aadhaar/ID verification, and express check-in.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#F7F6F2] text-[#202923] font-sans antialiased selection:bg-[#B69A65]/20 selection:text-[#202923]">
        <HotelProvider>
          <AppShell>{children}</AppShell>
        </HotelProvider>
      </body>
    </html>
  );
}
