import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://anniv.for-you-always.my.id'),
  title: "A Special Gift",
  description: 'A digital love letter, made just for you.',
  openGraph: {
    title: "A Special Gift",
    description: 'A digital love letter, made just for you.',
    siteName: 'For you, Always.',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "A Special Gift",
    description: 'A digital love letter, made just for you.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" translate="no" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
