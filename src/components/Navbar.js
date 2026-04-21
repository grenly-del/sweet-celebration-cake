'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import SearchPanel from './SearchPanel';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/custom-cake', label: 'Custom Cake' },
  { href: '/tentang-kami', label: 'Tentang Kami' },
  { href: '/testimoni', label: 'Testimoni' },
  { href: '/kontak', label: 'Contact' },
];

function ActionButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition hover:border-pink-default hover:bg-pink-light"
    >
      {children}
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = getTotalItems();

  return (
    <>
      <nav
        className={`navbar fixed left-0 right-0 top-0 z-50 border-b border-pink-100/40 ${
          scrolled ? 'scrolled bg-white/96' : 'bg-white/82 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="hidden lg:flex items-center gap-3">
            <ActionButton type="button" onClick={() => setSearchOpen(true)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z" />
              </svg>
              
            </ActionButton>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition hover:border-pink-default hover:bg-pink-light"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0a3.75 3.75 0 0 1 7.5 0Zm3 13.5a6.75 6.75 0 0 0-13.5 0" />
              </svg>
              
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition hover:border-pink-default hover:bg-pink-light"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 10V7a4 4 0 1 0-8 0v3m-2 0h12l1 10H5L6 10Z" />
              </svg>
              
              {totalItems > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-default px-1.5 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-default to-rose text-white shadow-[0_10px_25px_rgba(232,168,124,0.28)]">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 5c-4 0-6.5 1.75-6.5 4.5c0 1.7.95 3.15 2.5 3.95V17a1 1 0 0 0 1.57.82L12 16l2.43 1.82A1 1 0 0 0 16 17v-3.55c1.55-.8 2.5-2.25 2.5-3.95C18.5 6.75 16 5 12 5Z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-pink-500">
                Sweet Celebration
              </p>
              <h1 className="font-serif text-xl font-bold tracking-tight text-charcoal md:text-2xl">
                Cake Studio
              </h1>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold uppercase tracking-[0.24em] transition ${
                    isActive ? 'text-pink-dark' : 'text-charcoal/68 hover:text-pink-default'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-full border border-pink-200 p-3 text-charcoal transition hover:border-pink-default hover:bg-pink-light"
              aria-label="Buka pencarian"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full border border-pink-200 p-3 text-charcoal transition hover:border-pink-default hover:bg-pink-light"
              aria-label="Buka keranjang"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 10V7a4 4 0 1 0-8 0v3m-2 0h12l1 10H5L6 10Z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-default px-1.5 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="rounded-full border border-pink-200 p-3 text-charcoal transition hover:border-pink-default hover:bg-pink-light"
              aria-label="Buka menu"
            >
              <div className="flex h-4 w-5 flex-col justify-between">
                <span className={`hamburger-line block h-0.5 rounded bg-current ${menuOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
                <span className={`hamburger-line block h-0.5 rounded bg-current ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`hamburger-line block h-0.5 rounded bg-current ${menuOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-pink-100 bg-white px-6 py-5 shadow-[0_18px_50px_rgba(248,180,200,0.12)] lg:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition ${
                    pathname === link.href
                      ? 'bg-pink-light text-pink-dark'
                      : 'text-charcoal/70 hover:bg-[#fffaf8]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-charcoal px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-charcoal/85"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <div className="h-20" />
    </>
  );
}
