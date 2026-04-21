'use client';

import { CartProvider } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import BackToTop from '@/components/BackToTop';
import Toast from '@/components/Toast';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const showFloatingWhatsApp = !pathname?.startsWith('/kontak');

  return (
    <CartProvider>
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? 'min-h-screen bg-[#fffaf8]' : 'min-h-screen'}>{children}</main>
      {!isAdminRoute && (
        <>
          <Footer />
          {showFloatingWhatsApp && <FloatingWhatsApp />}
          <BackToTop />
          <Toast />
        </>
      )}
    </CartProvider>
  );
}
