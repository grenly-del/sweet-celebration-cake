'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotal,
    getTotalItems,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const totalItems = getTotalItems();

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="flex h-full flex-col bg-[linear-gradient(180deg,#fff8f6_0%,#ffffff_28%)]">
          <div className="border-b border-pink-100 px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">Keranjang</p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-charcoal">Beli Sekarang</h2>
                <p className="mt-2 text-sm leading-6 text-charcoal/60">
                  Cek pesananmu dulu, lalu lanjutkan ke checkout untuk isi nama, alamat, dan pin lokasi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full border border-pink-200 p-3 text-charcoal/60 transition hover:border-pink-default hover:text-pink-dark"
                aria-label="Tutup keranjang"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {items.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-pink-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-light text-pink-dark">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M16 10V7a4 4 0 1 0-8 0v3m-2 0h12l1 10H5L6 10Z" />
                  </svg>
                </div>
                <h3 className="mt-5 font-serif text-2xl font-bold text-charcoal">Keranjang masih kosong</h3>
                <p className="mt-3 text-sm leading-6 text-charcoal/60">
                  Tambahkan slice cake, whole cake, dry cake, atau merchandise favoritmu dulu.
                </p>
                <Link
                  href="/katalog"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 inline-flex rounded-full bg-gradient-to-r from-pink-default to-rose px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-[0_16px_30px_rgba(232,168,124,0.28)]"
                >
                  Lihat Katalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.sizeLabel}`}
                    className="rounded-[28px] border border-pink-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#fff6f3]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-charcoal">{item.name}</h3>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/45">
                              {item.sizeLabel}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id, item.sizeLabel)}
                            className="rounded-full border border-pink-100 p-2 text-charcoal/35 transition hover:border-red-200 hover:text-red-500"
                            aria-label={`Hapus ${item.name}`}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="font-semibold text-charcoal">{formatPrice(item.price)}</p>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.sizeLabel, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200 text-sm text-charcoal/60 transition hover:bg-pink-light disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="w-7 text-center text-sm font-semibold text-charcoal">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.sizeLabel, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-pink-200 text-sm text-charcoal/60 transition hover:bg-pink-light"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-pink-100 bg-white px-6 py-6">
              <div className="rounded-[30px] border border-pink-100 bg-[#fffaf8] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-charcoal/45">
                  Informasi Pesanan
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-charcoal/65">
                    <span>Jumlah item</span>
                    <span className="font-semibold text-charcoal">{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between text-charcoal/65">
                    <span>Jenis produk</span>
                    <span className="font-semibold text-charcoal">{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-pink-100 pt-3">
                    <span className="font-semibold text-charcoal">Subtotal</span>
                    <span className="text-xl font-bold gradient-text">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-charcoal/55">
                  Setelah klik beli sekarang, Anda akan mengisi email, nomor WhatsApp, alamat lengkap, dan lokasi pengiriman di maps.
                </p>

                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-default to-rose px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:shadow-[0_16px_30px_rgba(232,168,124,0.28)]"
                >
                  Beli Sekarang
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
