'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CakeBuilderPreview from '@/components/CakeBuilderPreview';
import LocationPicker from '@/components/LocationPicker';
import ScrollReveal from '@/components/ScrollReveal';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ensureSupabasePublicSession } from '@/lib/supabase/public-session';
import { createClientRecordId } from '@/lib/record-id';
import {
  buildCustomCakeDiscussionUrl,
  buildCustomCakePayload,
  calculateCustomCakePrice,
  createCustomCakeStoragePath,
  customCakeDesignStyleOptions,
  customCakeFillingOptions,
  customCakeFlavorOptions,
  customCakeInspirationCategories,
  customCakeInspirations,
  customCakeSizeOptions,
  customCakeToppingOptions,
  CUSTOM_CAKE_STORAGE_BUCKET,
} from '@/lib/custom-cake';
import { hasValidCoordinates } from '@/lib/location';

const supabase = getSupabaseBrowserClient();
const initialFormData = {
  name: '',
  email: '',
  whatsapp: '',
  address: '',
  size: 'medium',
  flavor: 'coklat',
  filling: 'vanilla-cream',
  topping: 'fresh-fruit',
  designStyle: 'minimalist',
  cakeMessage: '',
  notes: '',
  inspirationId: '',
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
    return `Custom cake belum berhasil disimpan. ${error.message}`;
  }

  return 'Custom cake belum berhasil disimpan. Coba lagi beberapa saat lagi.';
}

export default function CustomCakePage() {
  const builderRef = useRef(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(initialFormData);
  const [designFile, setDesignFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeInspirationCategory, setActiveInspirationCategory] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [discussionUrl, setDiscussionUrl] = useState('');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const estimatedPrice = calculateCustomCakePrice(formData);
  const quickDiscussionUrl = buildCustomCakeDiscussionUrl(formData);
  const filteredInspirations = customCakeInspirations.filter((item) => (
    activeInspirationCategory === 'all' || item.category === activeInspirationCategory
  ));

  const updateForm = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setSubmitError('');
  };

  const handleChange = (event) => {
    updateForm(event.target.name, event.target.value);
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

    setDesignFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSubmitError('');
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

  const applyInspiration = (inspiration) => {
    setFormData((current) => ({
      ...current,
      size: inspiration.suggestedSize,
      flavor: inspiration.suggestedFlavor,
      filling: inspiration.suggestedFilling,
      topping: inspiration.suggestedTopping,
      designStyle: inspiration.suggestedDesignStyle,
      inspirationId: inspiration.id,
      notes: current.notes || `Referensi inspirasi: ${inspiration.name}`,
    }));
    setSubmitError('');
    builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateBeforeSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      setSubmitError('Lengkapi nama, email, dan nomor WhatsApp terlebih dahulu.');
      return false;
    }

    if (!hasValidCoordinates(formData.locationLat, formData.locationLng)) {
      setSubmitError('Pilih lokasi pengiriman di peta terlebih dahulu.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateBeforeSubmit()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    setDiscussionUrl('');

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

      const requestCode = requestId.slice(0, 8).toUpperCase();

      setSubmitSuccess(
        `Builder custom cake berhasil disimpan${requestCode ? ` dengan kode ${requestCode}` : ''}. Tim kami bisa meninjau request ini dari dashboard admin.`
      );
      setDiscussionUrl(buildCustomCakeDiscussionUrl(formData, designImageUrl));
      setFormData(initialFormData);
      clearSelectedFile();
    } catch (error) {
      console.error('Failed to submit custom cake request:', error);
      setSubmitError(getCustomCakeSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(248,180,200,0.42),_transparent_32%),linear-gradient(180deg,#fff7f5_0%,#ffffff_72%)] py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-pink-500">
              Sweet Celebration Cake
            </p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-tight text-charcoal md:text-6xl">
              Build Your Cake, lihat preview harga, lalu pilih checkout atau diskusi.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-charcoal/68">
              Halaman custom cake sekarang dibuat seperti studio mini. Anda bisa memilih ukuran, rasa, filling, topping, desain, tulisan kue, lokasi pengiriman, upload referensi, lalu menyimpan request tanpa dipaksa langsung ke WhatsApp.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cake-builder"
                className="inline-flex rounded-full bg-gradient-to-r from-pink-default to-rose px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-[0_16px_30px_rgba(232,168,124,0.28)]"
              >
                Mulai Builder
              </a>
              <Link
                href="/kontak"
                className="inline-flex rounded-full border border-pink-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-charcoal transition hover:border-pink-default hover:bg-pink-light"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              ['Preview Live', 'Harga estimasi dan tampilan cake berubah sesuai pilihan builder.'],
              ['Inspirasi Siap Pakai', 'Pilih desain birthday, wedding, kids cake, atau custom unik.'],
              ['Checkout Fleksibel', 'Simpan request dulu, lalu diskusikan di WA hanya jika memang perlu.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-[28px] border border-pink-100 bg-white/88 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">{title}</p>
                <p className="mt-3 text-sm leading-7 text-charcoal/62">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cake-builder" ref={builderRef} className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              <ScrollReveal>
                <div className="rounded-[32px] border border-pink-100 bg-white p-7 shadow-sm">
                  <div className="mb-8 flex flex-wrap items-center gap-4">
                    {['Builder', 'Inspirasi', 'Referensi', 'Checkout'].map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-default to-rose text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-charcoal/55">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-7">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">Step 1</p>
                      <h2 className="mt-2 font-serif text-3xl font-bold text-charcoal">Cake Builder</h2>
                      <p className="mt-2 text-sm leading-7 text-charcoal/60">
                        Pilih komponen utama custom cake Anda. Preview dan estimasi harga di kanan akan langsung ikut berubah.
                      </p>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-semibold text-charcoal">
                        Pilih Ukuran
                      </label>
                      <div className="grid gap-3 md:grid-cols-3">
                        {customCakeSizeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateForm('size', option.value)}
                            className={`rounded-[24px] border p-4 text-left transition ${
                              formData.size === option.value
                                ? 'border-pink-default bg-pink-light shadow-sm'
                                : 'border-pink-100 hover:border-pink-200 hover:bg-[#fffaf8]'
                            }`}
                          >
                            <p className="font-serif text-2xl font-bold text-charcoal">{option.label}</p>
                            <p className="mt-1 text-sm text-charcoal/60">{option.desc}</p>
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-dark">
                              {option.servingEstimate}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-3 block text-sm font-semibold text-charcoal">
                          Pilih Rasa
                        </label>
                        <div className="space-y-3">
                          {customCakeFlavorOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateForm('flavor', option.value)}
                              className={`flex w-full items-start justify-between rounded-[22px] border px-4 py-4 text-left transition ${
                                formData.flavor === option.value
                                  ? 'border-pink-default bg-pink-light shadow-sm'
                                  : 'border-pink-100 hover:border-pink-200 hover:bg-[#fffaf8]'
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-charcoal">{option.label}</p>
                                <p className="mt-1 text-sm text-charcoal/60">{option.note}</p>
                              </div>
                              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: option.previewColor }} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="mb-3 block text-sm font-semibold text-charcoal">
                            Filling
                          </label>
                          <div className="space-y-3">
                            {customCakeFillingOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => updateForm('filling', option.value)}
                                className={`flex w-full items-start justify-between rounded-[22px] border px-4 py-4 text-left transition ${
                                  formData.filling === option.value
                                    ? 'border-pink-default bg-pink-light shadow-sm'
                                    : 'border-pink-100 hover:border-pink-200 hover:bg-[#fffaf8]'
                                }`}
                              >
                                <div>
                                  <p className="font-semibold text-charcoal">{option.label}</p>
                                  <p className="mt-1 text-sm text-charcoal/60">{option.note}</p>
                                </div>
                                <span className="text-sm font-semibold text-pink-dark">
                                  {option.priceAdd === 0 ? 'Included' : `+${option.priceAdd.toLocaleString('id-ID')}`}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="mb-3 block text-sm font-semibold text-charcoal">
                            Topping
                          </label>
                          <div className="space-y-3">
                            {customCakeToppingOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => updateForm('topping', option.value)}
                                className={`flex w-full items-start justify-between rounded-[22px] border px-4 py-4 text-left transition ${
                                  formData.topping === option.value
                                    ? 'border-pink-default bg-pink-light shadow-sm'
                                    : 'border-pink-100 hover:border-pink-200 hover:bg-[#fffaf8]'
                                }`}
                              >
                                <div>
                                  <p className="font-semibold text-charcoal">{option.label}</p>
                                  <p className="mt-1 text-sm text-charcoal/60">{option.note}</p>
                                </div>
                                <span className="text-sm font-semibold text-pink-dark">
                                  +{option.priceAdd.toLocaleString('id-ID')}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-semibold text-charcoal">
                        Gaya Desain
                      </label>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {customCakeDesignStyleOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateForm('designStyle', option.value)}
                            className={`rounded-[24px] border p-4 text-left transition ${
                              formData.designStyle === option.value
                                ? 'border-pink-default bg-pink-light shadow-sm'
                                : 'border-pink-100 hover:border-pink-200 hover:bg-[#fffaf8]'
                            }`}
                          >
                            <p className="font-semibold text-charcoal">{option.label}</p>
                            <p className="mt-1 text-sm text-charcoal/60">{option.note}</p>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-pink-dark">
                              {option.priceAdd === 0 ? 'Included' : `+${option.priceAdd.toLocaleString('id-ID')}`}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-charcoal">
                          Tulisan di Kue
                        </label>
                        <input
                          type="text"
                          name="cakeMessage"
                          value={formData.cakeMessage}
                          onChange={handleChange}
                          maxLength={32}
                          placeholder="Contoh: Happy Birthday Asha"
                          className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                        />
                        <p className="mt-2 text-xs text-charcoal/50">
                          Maksimal 32 karakter. Jika diisi, builder menambah biaya lettering.
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-charcoal">
                          Catatan Builder
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Tema warna, finishing matte / glossy, jumlah layer, atau detail unik lain."
                          className="w-full resize-none rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div className="rounded-[32px] border border-pink-100 bg-white p-7 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">Step 2</p>
                      <h2 className="mt-2 font-serif text-3xl font-bold text-charcoal">Galeri Inspirasi</h2>
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-charcoal/60">
                      Pilih referensi visual dari galeri kami. Tombol &quot;Gunakan desain ini&quot; akan otomatis mengisi builder di atas.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {customCakeInspirationCategories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => setActiveInspirationCategory(category.value)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                          activeInspirationCategory === category.value
                            ? 'bg-gradient-to-r from-pink-default to-rose text-white'
                            : 'border border-pink-200 text-charcoal/65 hover:border-pink-default hover:bg-pink-light'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    {filteredInspirations.map((item) => (
                      <article key={item.id} className="overflow-hidden rounded-[28px] border border-pink-100 bg-[#fffaf8]">
                        <div className="relative h-60">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">
                                {item.categoryLabel}
                              </p>
                              <h3 className="mt-2 font-serif text-2xl font-bold text-charcoal">
                                {item.name}
                              </h3>
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-charcoal/60">
                            {item.description}
                          </p>
                          <button
                            type="button"
                            onClick={() => applyInspiration(item)}
                            className="mt-5 inline-flex rounded-full bg-charcoal px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-charcoal/86"
                          >
                            Gunakan desain ini
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={180}>
                <div className="rounded-[32px] border border-pink-100 bg-white p-7 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">Step 3</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold text-charcoal">Upload Referensi Desain</h2>
                    <p className="mt-2 text-sm leading-7 text-charcoal/60">
                      Upload gambar dari Pinterest, Google, atau foto contoh sendiri. File akan ikut tersimpan saat checkout builder dikirim.
                    </p>
                  </div>

                  <div className="relative mt-6 rounded-[28px] border-2 border-dashed border-pink-200 bg-[#fffaf8] p-8 text-center transition hover:border-pink-default">
                    {previewUrl ? (
                      <div>
                        <div className="relative mx-auto h-56 w-full max-w-lg overflow-hidden rounded-[24px] shadow-md">
                          <Image
                            src={previewUrl}
                            alt="Preview referensi desain"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                          <button
                            type="button"
                            onClick={clearSelectedFile}
                            className="rounded-full border border-pink-200 bg-white px-5 py-2 text-sm font-semibold text-charcoal transition hover:border-pink-default hover:bg-pink-light"
                          >
                            Hapus gambar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                          <svg className="h-8 w-8 text-pink-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 16V4m0 12l-4-4m4 4l4-4M5 20h14" />
                          </svg>
                        </div>
                        <p className="mt-4 text-base font-semibold text-charcoal">Klik untuk upload referensi desain</p>
                        <p className="mt-2 text-sm text-charcoal/55">
                          Mendukung JPEG, PNG, atau WEBP maksimal 10MB.
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
              </ScrollReveal>

              <ScrollReveal delay={220}>
                <div className="rounded-[32px] border border-pink-100 bg-white p-7 shadow-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">Step 4</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold text-charcoal">Informasi Checkout</h2>
                    <p className="mt-2 text-sm leading-7 text-charcoal/60">
                      Lengkapi data kontak dan lokasi. Setelah itu Anda bisa langsung checkout builder, atau diskusi via WhatsApp bila perlu penyesuaian tambahan.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-charcoal">Nama Lengkap *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Masukkan nama lengkap"
                        className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-charcoal">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email@contoh.com"
                        className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-charcoal">Nomor WhatsApp *</label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        required
                        placeholder="Contoh: 08123456789"
                        className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <LocationPicker
                      value={{
                        latitude: formData.locationLat,
                        longitude: formData.locationLng,
                        mapLink: formData.locationLink,
                      }}
                      onChange={handleLocationChange}
                      title="Pin Lokasi Pengiriman *"
                      helperText="Klik peta untuk menaruh pin lokasi custom cake. Koordinat dan link maps akan ikut tersimpan."
                    />
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Alamat Lengkap</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Nomor rumah, nama gedung, patokan alamat, atau catatan kurir."
                      className="w-full resize-none rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                    />
                  </div>
                </div>
              </ScrollReveal>

              {(submitError || submitSuccess) && (
                <div className={`rounded-[28px] border px-5 py-4 text-sm ${
                  submitError ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
                }`}>
                  <p>{submitError || submitSuccess}</p>
                  {submitSuccess && discussionUrl && (
                    <a
                      href={discussionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex rounded-full border border-green-300 bg-white px-4 py-2 font-semibold text-green-700 transition hover:border-green-400 hover:bg-green-100"
                    >
                      Diskusikan via WhatsApp
                    </a>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-default to-rose px-6 py-4 text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:shadow-[0_16px_30px_rgba(232,168,124,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Menyimpan Builder...' : 'Checkout Builder'}
                </button>

                <a
                  href={quickDiscussionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-pink-200 bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-charcoal transition hover:border-pink-default hover:bg-pink-light"
                >
                  Diskusikan Lebih Lanjut
                </a>
              </div>
            </div>

            <ScrollReveal delay={80}>
              <CakeBuilderPreview formData={formData} estimatedPrice={estimatedPrice} />
            </ScrollReveal>
          </form>
        </div>
      </section>
    </>
  );
}
