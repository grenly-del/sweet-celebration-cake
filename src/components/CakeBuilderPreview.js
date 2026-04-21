'use client';

import { formatPrice } from '@/data/products';
import {
  getCustomCakeDesignStyleMeta,
  getCustomCakeFillingMeta,
  getCustomCakeFlavorMeta,
  getCustomCakePreviewTheme,
  getCustomCakeSizeMeta,
  getCustomCakeToppingMeta,
} from '@/lib/custom-cake';

export default function CakeBuilderPreview({ formData, estimatedPrice }) {
  const sizeMeta = getCustomCakeSizeMeta(formData.size);
  const flavorMeta = getCustomCakeFlavorMeta(formData.flavor);
  const fillingMeta = getCustomCakeFillingMeta(formData.filling);
  const toppingMeta = getCustomCakeToppingMeta(formData.topping);
  const designMeta = getCustomCakeDesignStyleMeta(formData.designStyle);
  const previewTheme = getCustomCakePreviewTheme(formData);
  const frostingColor = designMeta.value === 'wedding' ? '#fff9f2' : '#ffeaf1';
  const accentColor = previewTheme.cakeColor;

  return (
    <div className="sticky top-28 overflow-hidden rounded-[32px] border border-pink-100 bg-white shadow-[0_24px_80px_rgba(232,168,124,0.14)]">
      <div className={`bg-gradient-to-br ${previewTheme.accentClass} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-charcoal/55">Live Preview</p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-charcoal">Build Your Cake</h2>
        <p className="mt-2 text-sm leading-6 text-charcoal/60">
          Harga dan tampilan akan menyesuaikan pilihan ukuran, rasa, filling, topping, dan gaya desainmu.
        </p>

        <div className="relative mt-8 flex min-h-[280px] items-end justify-center rounded-[28px] bg-white/65 p-6 backdrop-blur-sm">
          <div
            className="relative transition-transform duration-300"
            style={{ transform: `scale(${previewTheme.scale})` }}
          >
            <div
              className="mx-auto h-14 w-56 rounded-full"
              style={{ backgroundColor: `${accentColor}26` }}
            />
            <div
              className="relative -mt-6 h-44 w-56 rounded-[32px_32px_22px_22px] border border-white/70 shadow-[0_18px_40px_rgba(45,45,45,0.12)]"
              style={{ backgroundColor: frostingColor }}
            >
              <div
                className="absolute left-4 right-4 top-5 h-8 rounded-full"
                style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}90)` }}
              />
              <div
                className="absolute left-6 right-6 top-16 h-10 rounded-full"
                style={{ backgroundColor: `${accentColor}3A` }}
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 pb-5">
                {Array.from({ length: designMeta.value === 'character' ? 5 : 3 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-7 w-7 rounded-full border border-white/80 shadow-sm"
                    style={{ backgroundColor: index % 2 === 0 ? accentColor : '#fff' }}
                  />
                ))}
              </div>
              {formData.cakeMessage.trim() && (
                <div className="absolute inset-x-5 top-[82px] rounded-full bg-white/90 px-3 py-1 text-center text-xs font-semibold tracking-wide text-charcoal shadow-sm">
                  {formData.cakeMessage.trim()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="rounded-[26px] border border-pink-100 bg-[#fffaf8] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal/45">
            Estimasi Harga
          </p>
          <p className="mt-3 font-serif text-4xl font-bold text-charcoal">
            {formatPrice(estimatedPrice)}
          </p>
          <p className="mt-2 text-sm leading-6 text-charcoal/60">
            Sudah termasuk dekor utama builder. Final price bisa berubah jika ada detail custom tambahan.
          </p>
        </div>

        <div className="grid gap-3">
          {[
            ['Ukuran', `${sizeMeta.label} - ${sizeMeta.servingEstimate}`],
            ['Rasa', `${flavorMeta.label} - ${flavorMeta.note}`],
            ['Filling', `${fillingMeta.label} - ${fillingMeta.note}`],
            ['Topping', `${toppingMeta.label} - ${toppingMeta.note}`],
            ['Desain', `${designMeta.label} - ${designMeta.note}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 rounded-2xl border border-pink-100 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal/45">{label}</span>
              <span className="text-right text-sm leading-6 text-charcoal/72">{value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-[24px] border border-dashed border-pink-200 bg-[#fff7f4] px-4 py-4 text-sm leading-6 text-charcoal/60">
          Preview ini membantu memberi gambaran cepat. Admin tetap bisa menyesuaikan hasil akhir berdasarkan referensi gambar dan catatan Anda.
        </div>
      </div>
    </div>
  );
}
