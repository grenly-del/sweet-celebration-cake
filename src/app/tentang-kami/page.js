import Image from 'next/image';
import ScrollReveal from '@/components/ScrollReveal';

export default function TentangKamiPage() {
  return (
    <>
      {/* Header */}
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-pink-light to-white">
        <div className="text-center px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
            Cerita Kami
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Tentang Kami
          </h1>
          <p className="text-charcoal/60 max-w-lg mx-auto">
            Mengenal lebih dekat Sweet Celebration Cake dan perjalanan kami.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/products/vanilla-garden-bloom.jpeg"
                  alt="Sweet Celebration Cake Kitchen"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
                  Cerita Kami
                </p>
                <h2 className="font-serif text-3xl font-bold text-charcoal mb-6">
                  Bermula dari Cinta akan Baking
                </h2>
                <div className="space-y-4 text-charcoal/70 leading-relaxed">
                  <p>
                    Sweet Celebration Cake lahir dari sebuah dapur kecil dengan
                    mimpi besar. Berawal dari hobi membuat kue untuk keluarga dan
                    teman-teman, kami menyadari bahwa setiap kue yang kami buat
                    membawa kebahagiaan yang tak ternilai.
                  </p>
                  <p>
                    Didirikan dengan semangat untuk menghadirkan kue ulang tahun
                    yang tidak hanya indah dipandang, tapi juga lezat dinikmati.
                    Kami percaya bahwa setiap perayaan layak mendapatkan kue yang
                    sempurna.
                  </p>
                  <p>
                    Berlokasi di Universitas Klabat, Manado, kami melayani pesanan
                    kue untuk berbagai acara — dari ulang tahun sederhana hingga
                    perayaan besar. Setiap kue dibuat fresh dan dikirim dengan
                    penuh kehati-hatian.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
                Perjalanan Kami
              </p>
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">
                Milestone
              </h2>
              <div className="section-divider" />
            </div>
          </ScrollReveal>

          <div className="space-y-8">
            {[
              {
                year: '2023',
                title: 'Awal Mula',
                desc: 'Mulai membuat kue untuk keluarga dan teman-teman dekat. Mendapat feedback positif yang luar biasa.',
              },
              {
                year: '2024',
                title: 'Pesanan Pertama',
                desc: 'Menerima pesanan pertama dari luar lingkaran pertemanan. Mulai mengembangkan variasi rasa dan desain.',
              },
              {
                year: '2025',
                title: 'Go Online',
                desc: 'Meluncurkan website dan media sosial. Pesanan meningkat drastis dari berbagai daerah di Manado.',
              },
              {
                year: '2026',
                title: 'Sweet Celebration',
                desc: 'Rebranding menjadi Sweet Celebration Cake dengan katalog lengkap dan sistem pemesanan online.',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-default to-rose flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {item.year}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-serif text-xl font-bold text-charcoal mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-charcoal/60 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
                Komitmen Kami
              </p>
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">
                Kualitas Tanpa Kompromi
              </h2>
              <div className="section-divider" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🌾',
                title: 'Bahan Premium',
                desc: 'Tepung terbaik, butter murni, coklat Belgian, dan bahan-bahan pilihan lainnya.',
              },
              {
                icon: '👩‍🍳',
                title: 'Dibuat dengan Cinta',
                desc: 'Setiap kue dikerjakan secara handmade dengan perhatian pada setiap detail.',
              },
              {
                icon: '🎨',
                title: 'Desain Kreatif',
                desc: 'Tim kami selalu berinovasi menghadirkan desain yang unik dan mengikuti tren.',
              },
              {
                icon: '✅',
                title: 'Higienis & Segar',
                desc: 'Dapur kami memenuhi standar kebersihan. Setiap kue dibuat fresh per pesanan.',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="text-center p-8 rounded-2xl bg-pink-light/30 border border-pink-100/50 hover:shadow-lg transition-all h-full">
                  <span className="text-4xl block mb-4">{item.icon}</span>
                  <h3 className="font-serif text-lg font-bold text-charcoal mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
                Galeri
              </p>
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">
                Dari Dapur Kami
              </h2>
              <div className="section-divider" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              '/images/products/berry-choco-drip.jpeg',
              '/images/products/purple-ombre-pearl.jpeg',
              '/images/products/pink-butterfly-bliss.jpeg',
              '/images/products/rose-gold-butterfly.jpeg',
              '/images/products/dark-chocolate-truffle.jpeg',
              '/images/products/lavender-butterfly-dream.jpeg',
              '/images/products/pink-vintage-pearl.jpeg',
              '/images/products/chocolate-ganache-praline.jpeg',
            ].map((src, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <Image
                    src={src}
                    alt={`Gallery ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
