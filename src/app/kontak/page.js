'use client';

import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

const contactChannels = [
  {
    title: 'Email',
    value: 'hello@sweetcelebration.id',
    href: 'mailto:hello@sweetcelebration.id',
    description: 'Untuk brief acara, kerja sama, dan pertanyaan yang ingin dijawab lebih detail.',
  },
  {
    title: 'WhatsApp',
    value: '0822-0033-8090',
    href: 'https://wa.me/6285823458349',
    description: 'Untuk diskusi cepat, follow-up order, atau tanya ketersediaan slot.',
  },
  {
    title: 'Instagram',
    value: '@sweetcelebrationcake',
    href: 'https://instagram.com',
    description: 'Lihat update desain terbaru, behind the scene, dan inspirasi cake harian.',
  },
  {
    title: 'TikTok',
    value: '@sweetcelebrationcake',
    href: 'https://www.tiktok.com',
    description: 'Temukan video detail dekor, packaging, dan momen delivery cake.',
  },
];

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = encodeURIComponent(formData.subject || `Inquiry dari ${formData.name}`);
    const body = encodeURIComponent(
      `Halo Sweet Celebration Cake,\n\nNama: ${formData.name}\nEmail: ${formData.email}\n\nPesan:\n${formData.message}`
    );

    window.location.href = `mailto:hello@sweetcelebration.id?subject=${subject}&body=${body}`;
    setSubmitMessage('Draft email sudah dibuka. Anda juga bisa pilih channel lain di bawah kalau ingin respon yang lebih cepat.');
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(248,180,200,0.36),_transparent_32%),linear-gradient(180deg,#fff7f4_0%,#ffffff_75%)] py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-default">
            Contact
          </p>
          <h1 className="mt-4 font-serif text-5xl font-bold text-charcoal md:text-6xl">
            Hubungi kami tanpa harus langsung ke WhatsApp.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-charcoal/65">
            Pilih channel yang paling nyaman untuk Anda. Email untuk brief lengkap, sosial media untuk inspirasi, dan WhatsApp jika ingin respon cepat.
          </p>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {contactChannels.map((channel, index) => (
              <ScrollReveal key={channel.title} delay={index * 80}>
                <a
                  href={channel.href}
                  target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={channel.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  className="group block rounded-[30px] border border-pink-100 bg-[#fffaf8] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(232,168,124,0.14)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">
                    {channel.title}
                  </p>
                  <h2 className="mt-3 font-serif text-2xl font-bold text-charcoal">
                    {channel.value}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-charcoal/60">
                    {channel.description}
                  </p>
                  <span className="mt-5 inline-flex text-sm font-semibold text-pink-dark transition group-hover:translate-x-1">
                    Buka channel ini
                  </span>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <ScrollReveal>
            <div className="rounded-[32px] border border-pink-100 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">
                Kirim Inquiry
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold text-charcoal">
                Tulis pesan Anda
              </h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/60">
                Form ini akan membuka draft email, jadi Anda tetap bisa review isi pesan sebelum mengirim.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-charcoal">Nama *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nama lengkap"
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
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">Subjek</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Contoh: Inquiry cake wedding bulan depan"
                    className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-charcoal">Pesan *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Ceritakan kebutuhan Anda: tanggal acara, jumlah tamu, tema, budget, atau pertanyaan lain."
                    className="w-full resize-none rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none transition focus:border-pink-default focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                {submitMessage && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex rounded-full bg-gradient-to-r from-pink-default to-rose px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-[0_16px_30px_rgba(232,168,124,0.28)]"
                >
                  Buka Draft Email
                </button>
              </form>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={140}>
            <div className="space-y-6">
              <div className="rounded-[32px] border border-pink-100 bg-white p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">
                  Office & Studio
                </p>
                <h2 className="mt-3 font-serif text-4xl font-bold text-charcoal">
                  Sweet Celebration Cake
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-7 text-charcoal/65">
                  <p>
                    Universitas Klabat, Rumah Dosen Nomor 99
                  </p>
                  <p>
                    Senin - Sabtu, 08:00 - 20:00
                  </p>
                  <p>
                    Respon tercepat biasanya melalui email kerja pada jam operasional dan WhatsApp untuk follow-up cepat.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[32px] border border-pink-100 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.4158!2d124.9746!3d1.3592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x328726bced0db3d5%3A0x4152c4c7e81867b6!2sUniversitas%20Klabat!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid"
                  width="100%"
                  height="380"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Lokasi Sweet Celebration Cake"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
