import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Warsaw Beauty Salon Explorer | Find & Manage Beauty Services',
  description:
    'Browse the finest hair and beauty salons across Warsaw districts. Check reviews, ratings, price levels, and live map directions instantly.',
  keywords: 'warsaw, beauty salon, hair salon, booksy, warszawa, salon fryzjerski, kosmetyczka',
  authors: [{ name: 'Beauty Services Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background-app text-text-main antialiased">
        {children}
        <Toaster theme="dark" closeButton richColors position="top-right" />
      </body>
    </html>
  );
}
