'use client';

import { useState } from 'react';
import { products, flavors, formatPrice } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import ScrollReveal from '@/components/ScrollReveal';

const sortOptions = [
  { value: 'default', label: 'Urutan Default' },
  { value: 'price-asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price-desc', label: 'Harga: Tinggi ke Rendah' },
  { value: 'name', label: 'Nama: A-Z' },
];

const categoryFilters = [
  { value: 'all', label: 'Semua' },
  { value: 'signature', label: 'Signature' },
  { value: 'premium', label: 'Premium' },
  { value: 'exclusive', label: 'Exclusive' },
];

export default function KatalogPage() {
  const [selectedFlavor, setSelectedFlavor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const animateKey = `${selectedFlavor}-${selectedCategory}-${sortBy}`;

  let filtered = [...products];

  // Filter by flavor
  if (selectedFlavor !== 'all') {
    filtered = filtered.filter((p) => p.flavor === selectedFlavor);
  }

  // Filter by category
  if (selectedCategory !== 'all') {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }

  // Sort
  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return (
    <>
      {/* Header */}
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-pink-light to-white">
        <div className="text-center px-4">
          <p className="text-xs uppercase tracking-[0.3em] text-pink-default font-semibold mb-2">
            Koleksi Kami
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-4">
            Katalog Kue
          </h1>
          <p className="text-charcoal/60 max-w-lg mx-auto">
            Temukan kue ulang tahun sempurna untuk momen spesialmu. Dari Signature
            hingga Exclusive, semuanya dibuat dengan cinta.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-pink-50 sticky top-16 z-30 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categoryFilters.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`category-pill px-5 py-2 rounded-full text-xs uppercase tracking-widest font-semibold border border-pink-200 transition-all ${
                  selectedCategory === cat.value ? 'active' : 'text-charcoal/60 hover:border-pink-default'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Flavor filter + Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {flavors.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSelectedFlavor(f.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedFlavor === f.value
                      ? 'bg-charcoal text-white'
                      : 'bg-pink-light/50 text-charcoal/60 hover:bg-pink-light'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-pink-200 rounded-full px-4 py-2 text-xs text-charcoal/70 bg-white focus:outline-none focus:border-pink-default"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Results count */}
          <p className="text-sm text-charcoal/50 mb-6">
            Menampilkan <span className="font-semibold text-charcoal">{filtered.length}</span> produk
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl block mb-4">🎂</span>
              <p className="text-charcoal/50 mb-2">Tidak ada produk yang cocok</p>
              <button
                onClick={() => {
                  setSelectedFlavor('all');
                  setSelectedCategory('all');
                }}
                className="text-pink-default text-sm font-semibold hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div key={animateKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 80}>
                  <ProductCard
                    product={product}
                    onQuickView={setSelectedProduct}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
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
