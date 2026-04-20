'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';
import ScrollReveal from '@/components/ScrollReveal';
import LocationPicker from '@/components/LocationPicker';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createClientRecordId } from '@/lib/record-id';
import { buildOrderPayload } from '@/lib/orders';
import { hasValidCoordinates } from '@/lib/location';

const supabase = getSupabaseBrowserClient();
const initialCustomer = {
  name: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  locationLat: '',
  locationLng: '',
  locationLink: '',
};

export default function CheckoutPage() {
  const { items, getTotal, clearCart, setToast } = useCart();
  const [customer, setCustomer] = useState(initialCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    setCustomer((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleLocationChange = (location) => {
    setCustomer((current) => ({
      ...current,
      locationLat: location.latitude,
      locationLng: location.longitude,
      locationLink: location.mapLink,
    }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (items.length === 0 || isSubmitting) {
      return;
    }

    if (!hasValidCoordinates(customer.locationLat, customer.locationLng)) {
      setSubmitError('Pilih lokasi pengiriman di peta terlebih dahulu.');
      return;
    }

    const total = getTotal();
    const orderId = createClientRecordId();
    const orderPayload = {
      id: orderId,
      ...buildOrderPayload({ customer, items, total }),
    };
    const whatsappUrl = `https://wa.me/6285823458349?text=${encodeURIComponent(orderPayload.whatsapp_message)}`;
    const whatsappWindow = window.open('', '_blank', 'noopener,noreferrer');

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const { error } = await supabase
        .from('orders')
        .insert(orderPayload);

      if (error) {
        throw error;
      }

      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }

      clearCart();
      setCustomer(initialCustomer);
      setToast(`Pesanan ${orderId ? 'berhasil disimpan' : 'berhasil dibuat'}. Lanjutkan konfirmasi di WhatsApp.`);
    } catch (error) {
      console.error('Failed to save order:', error);
      whatsappWindow?.close();
      setSubmitError('Pesanan belum berhasil disimpan ke sistem. Coba lagi beberapa saat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="py-32 text-center">
        <span className="mb-4 block text-6xl">Keranjang</span>
        <h1 className="mb-4 font-serif text-3xl font-bold text-charcoal">Keranjang Kosong</h1>
        <p className="mb-8 text-charcoal/50">Belum ada produk di keranjangmu.</p>
        <Link
          href="/katalog"
          className="inline-block rounded-full bg-gradient-to-r from-pink-default to-rose px-8 py-3 font-semibold text-white transition-all hover:shadow-lg"
        >
          Mulai Belanja
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className="relative flex h-[200px] items-center justify-center bg-gradient-to-b from-pink-light to-white">
        <div className="px-4 text-center">
          <h1 className="mb-2 font-serif text-4xl font-bold text-charcoal">Checkout</h1>
          <p className="text-charcoal/60">Lengkapi data, simpan pesanan, lalu lanjutkan ke WhatsApp</p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ScrollReveal>
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-pink-100/50 bg-white p-8 shadow-sm"
                >
                  <h2 className="mb-6 font-serif text-xl font-bold text-charcoal">Data Pelanggan</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-charcoal">Nama Lengkap *</label>
                      <input
                        type="text"
                        name="name"
                        value={customer.name}
                        onChange={handleChange}
                        required
                        placeholder="Masukkan nama"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-charcoal">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleChange}
                        required
                        placeholder="email@contoh.com"
                        autoComplete="email"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-charcoal">No. HP / WhatsApp *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={customer.phone}
                        onChange={handleChange}
                        required
                        placeholder="08123456789"
                        className="w-full rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                    <div>
                      <LocationPicker
                        value={{
                          latitude: customer.locationLat,
                          longitude: customer.locationLng,
                          mapLink: customer.locationLink,
                        }}
                        onChange={handleLocationChange}
                        title="Lokasi Pengiriman *"
                        helperText="Pilih titik lokasi di peta agar koordinat dan link Maps ikut tersimpan saat checkout dikirim."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-charcoal">Alamat Lengkap *</label>
                      <textarea
                        name="address"
                        value={customer.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder="Patokan alamat, nomor rumah, warna pagar, atau detail tambahan lainnya."
                        className="w-full resize-none rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-charcoal">Catatan (Opsional)</label>
                      <textarea
                        name="notes"
                        value={customer.notes}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Catatan tambahan..."
                        className="w-full resize-none rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-8 flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-default to-rose py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:shadow-xl hover:shadow-pink-200/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? 'Menyimpan Pesanan...' : 'Pesan via WhatsApp'}
                  </button>
                </form>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-2">
              <ScrollReveal delay={200}>
                <div className="sticky top-24 rounded-2xl border border-pink-100/50 bg-pink-light/30 p-6">
                  <h2 className="mb-6 font-serif text-xl font-bold text-charcoal">Ringkasan Pesanan</h2>
                  <div className="mb-6 space-y-4">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.sizeLabel}`} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="min-w-0 flex-grow">
                          <h4 className="truncate text-sm font-semibold text-charcoal">{item.name}</h4>
                          <p className="text-xs text-charcoal/50">{item.sizeLabel} x {item.quantity}</p>
                          <p className="gradient-text text-sm font-bold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-pink-200/50 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60">Subtotal</span>
                      <span className="text-charcoal">{formatPrice(getTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal/60">Ongkir</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                    <div className="flex justify-between border-t border-pink-200/50 pt-2">
                      <span className="font-bold text-charcoal">Total</span>
                      <span className="gradient-text text-xl font-bold">{formatPrice(getTotal())}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-4 text-charcoal/40">
                    {['Aman', 'Fresh', 'Rapi'].map((text) => (
                      <span key={text} className="text-xs">{text}</span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
