import { Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'Sweet Celebration Cake | Kue Ulang Tahun Premium',
  description:
    'Pesan kue ulang tahun premium dengan desain cantik dan rasa lezat. Custom cake, delivery, dan berbagai pilihan rasa. Sweet Celebration Cake - Rayakan momen spesialmu!',
  keywords: 'kue ulang tahun, birthday cake, custom cake, pesan kue online, sweet celebration',
  openGraph: {
    title: 'Sweet Celebration Cake | Kue Ulang Tahun Premium',
    description: 'Rayakan momen spesialmu dengan kue terbaik dari Sweet Celebration Cake',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${playfair.variable} ${poppins.variable} scroll-smooth`}>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
