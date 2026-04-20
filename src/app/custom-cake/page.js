'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import LocationPicker from '@/components/LocationPicker';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ensureSupabasePublicSession } from '@/lib/supabase/public-session';
import { createClientRecordId } from '@/lib/record-id';
import {
  buildCustomCakePayload,
  createCustomCakeStoragePath,
  customCakeFlavorOptions,
  customCakeSizeOptions,
  CUSTOM_CAKE_STORAGE_BUCKET,
  CUSTOM_CAKE_WHATSAPP_NUMBER,
} from '@/lib/custom-cake';
import { hasValidCoordinates } from '@/lib/location';

const supabase = getSupabaseBrowserClient();
const initialFormData = {
  name: '',
  email: '',
  whatsapp: '',
  address: '',
  flavor: 'coklat',
  size: '16cm',
  notes: '',
  locationLat: '',
  locationLng: '',
  locationLink: '',
};

function getCustomCakeSubmitErrorMessage(error) {
  const rawMessage = [
    error?.message,
    error?.details,
    error?.hint,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (rawMessage.includes('bucket') && rawMessage.includes('not found')) {
    return 'Bucket Storage `custom-cake-designs` belum dibuat di Supabase.';
  }

  if (rawMessage.includes('custom_cake_requests') && rawMessage.includes('does not exist')) {
    return 'Tabel `custom_cake_requests` belum ada. Jalankan ulang `supabase/schema.sql` di SQL Editor Supabase.';
  }

  if (rawMessage.includes('row-level security') || rawMessage.includes('permission denied')) {
    return 'Policy Supabase untuk custom cake belum lengkap. Jalankan ulang `supabase/schema.sql`, lalu coba lagi.';
  }

  if (rawMessage.includes('anonymous') && rawMessage.includes('disabled')) {
    return 'Anonymous sign-in di Supabase belum aktif. Buka Authentication > Sign In / Providers, lalu aktifkan Anonymous Sign-Ins.';
  }

  if (rawMessage) {
    return `Request custom cake belum berhasil dikirim. ${error.message}`;
  }

  return 'Request custom cake belum berhasil dikirim. Coba lagi beberapa saat lagi.';
}

export default function CustomCakePage() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(initialFormData);
  const [designFile, setDesignFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleLocationChange = (location) => {
    setFormData((current) => ({
      ...current,
      locationLat: location.latitude,
      locationLng: location.longitude,
      locationLink: location.mapLink,
    }));
    setSubmitError('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSubmitError('File referensi harus berupa gambar.');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('Ukuran gambar maksimal 10MB.');
      event.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSubmitError('');
    setDesignFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setDesignFile(null);
    setPreviewUrl('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!hasValidCoordinates(formData.locationLat, formData.locationLng)) {
      setSubmitError('Pilih lokasi pengiriman di peta terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    setWhatsappRedirectUrl('');

    try {
      await ensureSupabasePublicSession(supabase);

      const requestId = createClientRecordId();
      let designImagePath = null;
      let designImageUrl = null;

      if (designFile) {
        designImagePath = createCustomCakeStoragePath(designFile, requestId);

        const { error: uploadError } = await supabase
          .storage
          .from(CUSTOM_CAKE_STORAGE_BUCKET)
          .upload(designImagePath, designFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: designFile.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from(CUSTOM_CAKE_STORAGE_BUCKET)
          .getPublicUrl(designImagePath);

        designImageUrl = publicUrl;
      }

      const payload = {
        id: requestId,
        ...buildCustomCakePayload({
          formData,
          designFile,
          designImagePath,
          designImageUrl,
        }),
      };

      const { error } = await supabase
        .from('custom_cake_requests')
        .insert(payload);

      if (error) {
        throw error;
      }

      const whatsappUrl = `https://wa.me/${CUSTOM_CAKE_WHATSAPP_NUMBER}?text=${encodeURIComponent(payload.whatsapp_message)}`;
      const requestCode = requestId.slice(0, 8).toUpperCase();
      const openedWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      setWhatsappRedirectUrl(whatsappUrl);
      setFormData(initialFormData);
      clearSelectedFile();

      if (openedWindow) {
        setSubmitSuccess(
          `Request custom cake berhasil disimpan${requestCode ? ` dengan kode ${requestCode}` : ''}. WhatsApp dibuka di tab baru.`
        );
      } else {
        setSubmitSuccess(
          `Request custom cake berhasil disimpan${requestCode ? ` dengan kode ${requestCode}` : ''}. Browser memblokir tab baru, silakan klik tombol WhatsApp di bawah.`
        );
      }
    } catch (error) {
      console.error('Failed to submit custom cake request:', error);
      setSubmitError(getCustomCakeSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative flex h-[300px] items-center justify-center overflow-hidden bg-gradient-to-b from-pink-light to-white">
        <div className="px-4 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-pink-default">
            Desain Impianmu
          </p>
          <h1 className="mb-4 font-serif text-4xl font-bold text-charcoal md:text-5xl">
            Custom Cake
          </h1>
          <p className="mx-auto max-w-lg text-charcoal/60">
            Wujudkan kue impianmu. Upload referensi desain, simpan request ke admin, lalu lanjutkan konfirmasi melalui WhatsApp.
          </p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-pink-100/50 bg-white p-8 shadow-lg md:p-12"
            >
              <div className="mb-10 flex items-center justify-center gap-4">
                {['Data Diri', 'Detail Kue', 'Kirim Pesanan'].map((step, index) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-default to-rose text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="hidden text-xs uppercase tracking-wider text-charcoal/50 sm:block">
                      {step}
                    </span>
                    {index < 2 && <div className="hidden h-px w-8 bg-pink-200 sm:block" />}
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-charcoal">
                  Nama Pelanggan <span className="text-pink-default">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none transition-all focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-charcoal">
                  Email <span className="text-pink-default">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@contoh.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none transition-all focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-charcoal">
                  Nomor WhatsApp <span className="text-pink-default">*</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none transition-all focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div className="mb-6">
                <LocationPicker
                  value={{
                    latitude: formData.locationLat,
                    longitude: formData.locationLng,
                    mapLink: formData.locationLink,
                  }}
                  onChange={handleLocationChange}
                  title="Lokasi Pengiriman *"
                  helperText="Pilih titik lokasi di peta agar koordinat dan link Maps ikut tersimpan saat request dikirim."
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-charcoal">
                  Detail Alamat (Opsional)
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Patokan alamat, nomor rumah, warna pagar, atau detail tambahan lainnya."
                  className="w-full resize-none rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none transition-all focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-charcoal">
                  Pilihan Rasa <span className="text-pink-default">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {customCakeFlavorOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                        formData.flavor === option.value
                          ? 'border-pink-default bg-pink-light shadow-sm'
                          : 'border-pink-100 hover:border-pink-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="flavor"
                        value={option.value}
                        checked={formData.flavor === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="mb-1 block text-2xl">{option.icon}</span>
                      <span className="text-xs font-medium text-charcoal">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-charcoal">
                  Ukuran Kue <span className="text-pink-default">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {customCakeSizeOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                        formData.size === option.value
                          ? 'border-pink-default bg-pink-light shadow-sm'
                          : 'border-pink-100 hover:border-pink-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={option.value}
                        checked={formData.size === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="block text-lg font-bold text-charcoal">{option.label}</span>
                      <span className="text-xs text-charcoal/50">{option.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-charcoal">
                  Upload Desain Kue (Opsional)
                </label>
                <div className="relative rounded-xl border-2 border-dashed border-pink-200 p-8 text-center transition-colors hover:border-pink-default">
                  {previewUrl ? (
                    <div>
                      <div className="relative mx-auto h-48 w-full max-w-sm overflow-hidden rounded-lg shadow-md">
                        <Image
                          src={previewUrl}
                          alt="Preview desain kue"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="mt-3 text-xs font-semibold text-pink-default hover:underline"
                      >
                        Hapus gambar
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="mb-2 block text-4xl">📷</span>
                      <p className="mb-2 text-sm text-charcoal/50">
                        Klik atau drag gambar referensi desain kue
                      </p>
                      <p className="text-xs text-charcoal/30">
                        JPEG, PNG, WEBP maksimal 10MB
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className={previewUrl ? 'hidden' : 'absolute inset-0 cursor-pointer opacity-0'}
                    style={!previewUrl ? { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' } : {}}
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="mb-2 block text-sm font-semibold text-charcoal">
                  Catatan Tambahan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tulisan di kue, warna favorit, tema acara, dll..."
                  className="w-full resize-none rounded-xl border border-pink-200 px-4 py-3 text-sm outline-none transition-all focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                />
              </div>

              {submitError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <p>{submitSuccess}</p>
                  {whatsappRedirectUrl && (
                    <a
                      href={whatsappRedirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center rounded-full border border-green-300 bg-white px-4 py-2 font-semibold text-green-700 transition hover:border-green-400 hover:bg-green-100"
                    >
                      Buka WhatsApp di Tab Baru
                    </a>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-default to-rose py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:shadow-xl hover:shadow-pink-200/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {isSubmitting ? 'Mengirim Request...' : 'Kirim Request via WhatsApp'}
              </button>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
