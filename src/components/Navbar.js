'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/custom-cake', label: 'Custom Cake' },
  { href: '/tentang-kami', label: 'Tentang Kami' },
  { href: '/testimoni', label: 'Testimoni' },
  { href: '/kontak', label: 'Kontak' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { getTotalItems, setIsCartOpen, isCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = getTotalItems();

  return (
    <>
      <nav
        className={`navbar fixed top-0 left-0 right-0 z-50 ${
          scrolled
            ? 'scrolled bg-white/95'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎂</span>
            <div>
              <span className="font-serif text-xl font-bold text-charcoal tracking-tight">
                Sweet
              </span>
              <span className="font-serif text-xl font-bold gradient-text ml-1">
                Celebration
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-widest font-medium text-charcoal/70 hover:text-pink-default transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/admin"
              className="rounded-full bg-charcoal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-charcoal/85"
            >
              Login
            </Link>
          </div>

          {/* Cart + Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-pink-light rounded-full transition-colors"
              aria-label="Keranjang"
            >
              <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-default text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 hover:bg-pink-light rounded-full transition-colors"
              aria-label="Menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`hamburger-line block h-0.5 bg-charcoal rounded ${
                    menuOpen ? 'transform rotate-45 translate-y-1.5' : ''
                  }`}
                />
                <span
                  className={`hamburger-line block h-0.5 bg-charcoal rounded ${
                    menuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`hamburger-line block h-0.5 bg-charcoal rounded ${
                    menuOpen ? 'transform -rotate-45 -translate-y-1.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-pink-100 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm uppercase tracking-widest font-medium text-charcoal/70 hover:text-pink-default transition-colors py-2 border-b border-pink-50"
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

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
