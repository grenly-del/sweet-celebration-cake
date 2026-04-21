'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  categories,
  flavors,
  getCategoryLabel,
  getFlavorLabel,
  products,
} from '@/data/products';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import ScrollReveal from '@/components/ScrollReveal';

const sortOptions = [
  { value: 'default', label: 'Urutan Default' },
  { value: 'price-asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price-desc', label: 'Harga: Tinggi ke Rendah' },
  { value: 'name', label: 'Nama: A-Z' },
];

function KatalogContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim() || '';
  const [selectedFlavor, setSelectedFlavor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const animateKey = `${selectedFlavor}-${selectedCategory}-${sortBy}`;

  let filtered = [...products];

  if (selectedFlavor !== 'all') {
    filtered = filtered.filter((product) => product.flavor === selectedFlavor);
  }

  if (selectedCategory !== 'all') {
    filtered = filtered.filter((product) => product.category === selectedCategory);
  }

  if (searchQuery) {
    const normalizedSearchQuery = searchQuery.toLowerCase();
    filtered = filtered.filter((product) => (
      [
        product.name,
        product.description,
        product.metaLine,
        getFlavorLabel(product.flavor),
        getCategoryLabel(product.category),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearchQuery)
    ));
  }

  switch (sortBy) {
    case 'price-asc':
      filtered.sort((first, second) => first.price - second.price);
      break;
    case 'price-desc':
      filtered.sort((first, second) => second.price - first.price);
      break;
    case 'name':
      filtered.sort((first, second) => first.name.localeCompare(second.name));
      break;
  }

  const visibleCategories = categories.filter((category) => (
    category.value !== 'all'
      && (selectedCategory === 'all' || selectedCategory === category.value)
  ));

  const groupedProducts = visibleCategories
    .map((category) => ({
      ...category,
      items: filtered.filter((product) => product.category === category.value),
    }))
    .filter((category) => category.items.length > 0);

  const totalProducts = groupedProducts.reduce(
    (sum, category) => sum + category.items.length,
    0
  );

  return (
    <>
      <section className="relative flex h-[300px] items-center justify-center overflow-hidden bg-gradient-to-b from-pink-light to-white">
        <div className="px-4 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-pink-default">
            Koleksi Kami
          </p>
          <h1 className="mb-4 font-serif text-4xl font-bold text-charcoal md:text-5xl">
            Katalog Celebration
          </h1>
          <p className="mx-auto max-w-2xl text-charcoal/60">
            Katalog kini dibagi per kategori agar lebih mudah dipilih: Slice Cake,
            Whole Cake, Dry Cake, dan Merchandise untuk pelengkap pesta.
          </p>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-pink-50 bg-white/95 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`category-pill rounded-full border border-pink-200 px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${
                  selectedCategory === category.value
                    ? 'active'
                    : 'text-charcoal/60 hover:border-pink-default'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {flavors.map((flavor) => (
                <button
                  key={flavor.value}
                  onClick={() => setSelectedFlavor(flavor.value)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    selectedFlavor === flavor.value
                      ? 'bg-charcoal text-white'
                      : 'bg-pink-light/50 text-charcoal/60 hover:bg-pink-light'
                  }`}
                >
                  {flavor.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-full border border-pink-200 bg-white px-4 py-2 text-xs text-charcoal/70 focus:border-pink-default focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-6 text-sm text-charcoal/50">
            Menampilkan <span className="font-semibold text-charcoal">{totalProducts}</span> produk
          </p>

          {searchQuery && (
            <div className="mb-6 rounded-[24px] border border-pink-100 bg-[#fffaf8] px-5 py-4 text-sm text-charcoal/65">
              Hasil pencarian untuk <span className="font-semibold text-charcoal">&quot;{searchQuery}&quot;</span>.
            </div>
          )}

          {groupedProducts.length === 0 ? (
            <div className="py-20 text-center">
              <span className="mb-4 block text-5xl">Cake</span>
              <p className="mb-2 text-charcoal/50">Tidak ada produk yang cocok</p>
              <button
                onClick={() => {
                  setSelectedFlavor('all');
                  setSelectedCategory('all');
                }}
                className="text-sm font-semibold text-pink-default hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div key={animateKey} className="space-y-14">
              {groupedProducts.map((category) => (
                <div key={category.value}>
                  <ScrollReveal>
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">
                          Kategori
                        </p>
                        <h2 className="mt-2 font-serif text-3xl font-bold text-charcoal">
                          {category.label}
                        </h2>
                      </div>
                      <p className="max-w-2xl text-sm leading-7 text-charcoal/60">
                        {category.description}
                      </p>
                    </div>
                  </ScrollReveal>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.items.map((product, index) => (
                      <ScrollReveal key={product.id} delay={index * 80}>
                        <ProductCard
                          product={product}
                          onQuickView={setSelectedProduct}
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

export default function KatalogPage() {
  return (
    <Suspense fallback={<section className="bg-white py-20 text-center text-charcoal/60">Memuat katalog...</section>}>
      <KatalogContent />
    </Suspense>
  );
}
