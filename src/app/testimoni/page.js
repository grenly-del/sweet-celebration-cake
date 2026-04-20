import { testimonials } from '@/data/testimonials';
import TestimonialSlider from '@/components/TestimonialSlider';
import ScrollReveal from '@/components/ScrollReveal';

export default function TestimoniPage() {
  // Calculate average rating
  const avgRating = (
    testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
  ).toFixed(1);

  return (
    <>
      {/* Header */}
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-pink-light to-white">
        <div className="text-center px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
            Kata Mereka
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Testimoni
          </h1>
          <p className="text-charcoal/60 max-w-lg mx-auto">
            Apa kata pelanggan kami tentang Sweet Celebration Cake.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-pink-light/30 border border-pink-100/50">
                <p className="text-3xl font-bold gradient-text">{avgRating}</p>
                <p className="text-xs text-charcoal/50 uppercase tracking-wider mt-1">
                  Rating
                </p>
                <div className="flex justify-center gap-0.5 mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`star text-sm ${i < Math.round(avgRating) ? 'filled' : ''}`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-pink-light/30 border border-pink-100/50">
                <p className="text-3xl font-bold gradient-text">{testimonials.length}+</p>
                <p className="text-xs text-charcoal/50 uppercase tracking-wider mt-1">
                  Review
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-pink-light/30 border border-pink-100/50">
                <p className="text-3xl font-bold gradient-text">100%</p>
                <p className="text-xs text-charcoal/50 uppercase tracking-wider mt-1">
                  Puas
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Slider */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">
                Apa Kata Mereka?
              </h2>
              <div className="section-divider" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <TestimonialSlider testimonials={testimonials} />
          </ScrollReveal>
        </div>
      </section>

      {/* All Reviews Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">
                Semua Review
              </h2>
              <div className="section-divider" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.id} delay={i * 100}>
                <div className="testimonial-card p-6 rounded-2xl bg-white border border-pink-100/50 shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{t.avatar}</span>
                    <div>
                      <p className="font-semibold text-charcoal text-sm">
                        {t.name}
                      </p>
                      <p className="text-xs text-charcoal/40">{t.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }, (_, j) => (
                      <span key={j} className={`star text-sm ${j < t.rating ? 'filled' : ''}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-charcoal/70 leading-relaxed flex-grow italic">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-cream to-pink-light">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <ScrollReveal>
            <span className="text-5xl block mb-4">💬</span>
            <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">
              Ingin Jadi Pelanggan Berikutnya?
            </h2>
            <p className="text-charcoal/60 mb-8">
              Pesan kue impianmu sekarang dan rasakan sendiri kelezatannya!
            </p>
            <a
              href="https://wa.me/6285823458349?text=Halo%20Sweet%20Celebration%20Cake!%20Saya%20ingin%20memesan%20kue."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-default to-rose text-white font-semibold px-8 py-3.5 rounded-full hover:shadow-xl hover:shadow-pink-200/50 transition-all text-sm uppercase tracking-wider"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Pesan Sekarang
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
