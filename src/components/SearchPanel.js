'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  formatPrice,
  getCategoryLabel,
  getFlavorLabel,
  products,
} from '@/data/products';

export default function SearchPanel({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();

  const results = normalizedSearchTerm
    ? products.filter((product) => (
      [
        product.name,
        product.description,
        product.metaLine,
        getFlavorLabel(product.flavor),
        getCategoryLabel(product.category),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearchTerm)
    )).slice(0, 8)
    : products.filter((product) => product.isBestSeller || product.isPopular || product.isNew).slice(0, 6);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleGoToCatalog = (term) => {
    const trimmedTerm = term.trim();

    router.push(trimmedTerm ? `/katalog?search=${encodeURIComponent(trimmedTerm)}` : '/katalog');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1100] overflow-y-auto bg-[rgba(0,0,0,0.5)] px-4 py-4 sm:px-6 sm:py-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian produk"
    >
      <div className="flex min-h-full items-start justify-center">
        <div
          className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_30px_90px_rgba(45,45,45,0.18)] max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 border-b border-pink-100 px-5 pb-4 pt-5 md:px-7 md:pb-5 md:pt-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">Search</p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-charcoal sm:text-3xl">Cari Produk Favoritmu</h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-pink-200 p-3 text-charcoal/60 transition hover:border-pink-default hover:text-pink-dark"
                aria-label="Tutup pencarian"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleGoToCatalog(searchTerm);
              }}
              className="mt-5"
            >
              <div className="flex flex-col gap-3 md:flex-row">
                <label className="flex min-h-14 flex-1 items-center gap-3 rounded-full border border-pink-200 bg-[#fffaf8] px-5">
                  <svg className="h-5 w-5 text-charcoal/45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Cari nama produk, kategori, rasa, topping, atau merchandise..."
                    className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal/35"
                  />
                </label>

                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-pink-default to-rose px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-[0_16px_30px_rgba(232,168,124,0.28)]"
                >
                  Cari
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-6 md:px-7 md:pb-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-charcoal/55">
                {normalizedSearchTerm ? `Hasil untuk "${searchTerm.trim()}"` : 'Rekomendasi cepat dari Sweet Celebration'}
              </p>

              <button
                type="button"
                onClick={() => handleGoToCatalog(searchTerm)}
                className="text-left text-sm font-semibold text-pink-dark transition hover:underline sm:text-right"
              >
                Lihat di katalog
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.length === 0 ? (
                <div className="col-span-full rounded-[28px] border border-dashed border-pink-200 bg-[#fffaf8] px-6 py-14 text-center">
                  <p className="text-sm text-charcoal/60">Produk belum ditemukan. Coba kata kunci lain.</p>
                </div>
              ) : (
                results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/katalog?search=${encodeURIComponent(product.name)}`}
                    onClick={onClose}
                    className="group overflow-hidden rounded-[26px] border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(232,168,124,0.16)]"
                  >
                    <div className="relative h-44 overflow-hidden bg-[#fff6f3]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-500">
                            {getCategoryLabel(product.category)}
                          </p>
                          <h3 className="mt-2 font-serif text-xl font-bold text-charcoal">
                            {product.name}
                          </h3>
                        </div>
                        <span className="rounded-full bg-[#fff5ee] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal/60">
                          {product.metaLine || getFlavorLabel(product.flavor)}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-charcoal/60">
                        {product.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-pink-100 pt-4">
                        <span className="font-semibold text-charcoal">{formatPrice(product.price)}</span>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-dark">
                          Lihat Detail
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
