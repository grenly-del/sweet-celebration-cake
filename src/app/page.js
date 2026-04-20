'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { products, formatPrice } from '@/data/products';
import { useCart } from '@/context/CartContext';
import ScrollReveal from '@/components/ScrollReveal';
import ProductDetailModal from '@/components/ProductDetailModal';

const bestSellers = products.filter(
  (p) => p.isBestSeller || p.isPopular
).slice(0, 4);

const confettiColors = ['#F8B4C8', '#E8A87C', '#D4A574', '#a78bfa', '#FFD700', '#FF6B9D'];

export default function HomePage() {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const heroRef = useRef(null);

  // Generate confetti on client only to avoid hydration mismatch
  useEffect(() => {
    const pieces = confettiColors.flatMap((color, i) =>
      Array.from({ length: 3 }, (_, j) => ({
        key: `${i}-${j}`,
        backgroundColor: color,
        left: `${Math.random() * 100}%`,
        animationDuration: `${3 + Math.random() * 4}s`,
        animationDelay: `${Math.random() * 5}s`,
        width: `${6 + Math.random() * 6}px`,
        height: `${6 + Math.random() * 6}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }))
    );
    setConfettiPieces(pieces);
  }, []);

  // Anime.js hero animation
  useEffect(() => {
    let anime;
    import('animejs').then((mod) => {
      anime = mod.default;

      // Hero title animation
      anime({
        targets: '.hero-animate',
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(150),
        duration: 800,
        easing: 'easeOutExpo',
      });

      // Hero CTA animation
      anime({
        targets: '.hero-cta',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: 800,
        duration: 600,
        easing: 'easeOutExpo',
      });
    });
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/products/vanilla-garden-bloom.jpeg"
            alt="Sweet Celebration Cake Hero"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Confetti - rendered client-side only */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.key}
              className="confetti-piece"
              style={{
                backgroundColor: piece.backgroundColor,
                left: piece.left,
                animationDuration: piece.animationDuration,
                animationDelay: piece.animationDelay,
                width: piece.width,
                height: piece.height,
                borderRadius: piece.borderRadius,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="hero-animate text-white/80 text-sm uppercase tracking-[0.3em] mb-4 font-medium">
            ✨ Sweet Celebration Cake ✨
          </p>
          <h1 className="hero-animate font-serif text-4xl md:text-6xl lg:text-7xl text-white font-bold leading-tight mb-6">
            Rayakan Momen Spesialmu dengan{' '}
            <span className="italic text-pink-200">Kue Terbaik</span>
          </h1>
          <p className="hero-animate text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
            Kue ulang tahun premium dengan desain cantik dan rasa yang tak terlupakan.
            Dibuat dengan cinta untuk setiap perayaan istimewamu.
          </p>
          <div className="hero-cta opacity-0 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/katalog"
              className="bg-gradient-to-r from-pink-default to-rose text-white font-semibold px-8 py-3.5 rounded-full hover:shadow-xl hover:shadow-pink-500/30 transition-all inline-block text-sm uppercase tracking-wider"
            >
              Pesan Sekarang
            </Link>
            <Link
              href="/custom-cake"
              className="border-2 border-white/50 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-all inline-block text-sm uppercase tracking-wider"
            >
              Custom Cake
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
                Pilihan Terfavorit
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Best Seller Kami
              </h2>
              <div className="section-divider" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 100}>
                <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100/50">
                  <div
                    className="relative h-64 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="product-image object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-3 left-3">
                      {product.isBestSeller && (
                        <span className="badge badge-bestseller">Best Seller</span>
                      )}
                      {product.isPopular && !product.isBestSeller && (
                        <span className="badge badge-popular">Populer</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-bold text-charcoal mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-charcoal/50 uppercase tracking-wider mb-3">
                      {product.flavor}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-pink-50">
                      <span className="font-bold text-lg gradient-text">
                        {formatPrice(product.price)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-gradient-to-r from-pink-default to-rose text-white text-xs font-semibold px-4 py-2 rounded-full hover:shadow-lg transition-all active:scale-95"
                      >
                        + Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="text-center mt-10">
              <Link
                href="/katalog"
                className="text-sm uppercase tracking-widest font-bold text-charcoal border-b-2 border-charcoal pb-1 hover:text-pink-default hover:border-pink-default transition-all"
              >
                Lihat Semua Katalog →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="relative h-[300px] md:h-[350px] rounded-2xl overflow-hidden group cursor-pointer">
              <Image
                src="/images/products/berry-choco-drip.jpeg"
                alt="Promo"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-dark/70 to-rose/50 flex items-center justify-center text-center p-6">
                <div>
                  <p className="text-white/80 text-sm uppercase tracking-[0.3em] mb-2">
                    Pesan Sekarang
                  </p>
                  <h2 className="text-white text-4xl md:text-6xl font-serif font-bold mb-4">
                    Custom Cake
                  </h2>
                  <p className="text-white/80 text-base mb-6 max-w-md mx-auto">
                    Wujudkan kue impianmu dengan desain custom sesuai keinginanmu
                  </p>
                  <Link
                    href="/custom-cake"
                    className="bg-white text-pink-dark font-semibold px-8 py-3 rounded-full hover:bg-pink-light transition-all inline-block text-sm uppercase tracking-wider"
                  >
                    Mulai Desain →
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
                Mengapa Kami
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mb-4">
                Kenapa Sweet Celebration?
              </h2>
              <div className="section-divider" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'Desain Custom',
                desc: 'Setiap kue dibuat sesuai keinginanmu. Apapun temanya, kami siap mewujudkan.',
              },
              {
                icon: '🧁',
                title: 'Bahan Premium',
                desc: 'Menggunakan bahan-bahan berkualitas tinggi untuk rasa yang tidak terlupakan.',
              },
              {
                icon: '🚚',
                title: 'Pengiriman Aman',
                desc: 'Kue dikirim dengan packaging khusus agar sampai dalam kondisi sempurna.',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="text-center p-8 rounded-2xl bg-pink-light/30 border border-pink-100/50 hover:shadow-lg hover:shadow-pink-100/30 transition-all">
                  <span className="text-4xl block mb-4">{item.icon}</span>
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-3">
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
