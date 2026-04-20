'use client';

import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

export default function KontakPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Halo Sweet Celebration Cake!\n\n*Nama:* ${formData.name}\n*Email:* ${formData.email}\n*Pesan:* ${formData.message}`;
    window.open(`https://wa.me/6285823458349?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
      <section className="relative h-[300px] flex items-center justify-center bg-gradient-to-b from-pink-light to-white">
        <div className="text-center px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">Hubungi Kami</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-4">Kontak</h1>
          <p className="text-charcoal/60 max-w-lg mx-auto">Punya pertanyaan? Jangan ragu untuk menghubungi kami!</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <a href="https://wa.me/6285823458349?text=Halo%20Sweet%20Celebration%20Cake!" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-6 md:p-8 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">💬</div>
                <div>
                  <p className="text-xl font-bold mb-1">WhatsApp Order</p>
                  <p className="text-white/80 text-sm">0822-0033-8090</p>
                </div>
              </div>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
            </a>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <ScrollReveal>
              <div className="bg-white rounded-2xl shadow-sm border border-pink-100/50 p-8">
                <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">Kirim Pesan</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Nama</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nama lengkap"
                      className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-default focus:ring-2 focus:ring-pink-100 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@contoh.com"
                      className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-default focus:ring-2 focus:ring-pink-100 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Pesan</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Tulis pesan kamu..."
                      className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-default focus:ring-2 focus:ring-pink-100 outline-none text-sm resize-none" />
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-pink-default to-rose text-white font-semibold py-3 rounded-full hover:shadow-lg transition-all active:scale-[0.98]">
                    Kirim via WhatsApp
                  </button>
                </form>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-pink-100/50 h-[300px]">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.4158!2d124.9746!3d1.3592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x328726bced0db3d5%3A0x4152c4c7e81867b6!2sUniversitas%20Klabat!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid"
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Lokasi" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: '📍', title: 'Alamat', desc: 'Universitas Klabat, Rumah Dosen No. 99' },
                    { icon: '📱', title: 'Telepon', desc: '0822-0033-8090' },
                    { icon: '🕐', title: 'Jam Buka', desc: 'Senin–Sabtu: 08:00–20:00' },
                    { icon: '✉️', title: 'Email', desc: 'hello@sweetcelebration.id' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-pink-100/50 shadow-sm">
                      <span className="text-2xl block mb-2">{item.icon}</span>
                      <h3 className="font-semibold text-charcoal text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-charcoal/60">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
