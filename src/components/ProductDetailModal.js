'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);

  if (!product) return null;

  const totalPrice = product.price + (selectedSize?.priceAdd || 0);

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    onClose();
  };

  return (
    <div className={`modal-overlay ${product ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative h-72 md:h-full min-h-[300px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Close button */}
            <button
              onClick={onClose}
              className="self-end text-charcoal/40 hover:text-charcoal transition-colors mb-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Category badge */}
            <span className="text-xs uppercase tracking-widest text-pink-default font-semibold mb-2">
              {product.category}
            </span>

            <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">
              {product.name}
            </h2>

            <p className="text-xs text-charcoal/50 uppercase tracking-wider mb-4">
              Rasa: {product.flavor}
            </p>

            <p className="text-sm text-charcoal/70 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Size Selection */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-charcoal mb-3">Pilih Ukuran:</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      selectedSize?.label === size.label
                        ? 'bg-gradient-to-r from-pink-default to-rose text-white border-transparent'
                        : 'border-pink-200 text-charcoal/70 hover:border-pink-default'
                    }`}
                  >
                    {size.label}
                    {size.priceAdd > 0 && (
                      <span className="ml-1 text-xs opacity-75">
                        (+{formatPrice(size.priceAdd)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="mt-auto pt-4 border-t border-pink-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-charcoal/50 mb-1">Total Harga</p>
                  <p className="text-2xl font-bold gradient-text">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-pink-default to-rose text-white font-semibold py-3 rounded-full hover:shadow-lg hover:shadow-pink-200/50 transition-all active:scale-[0.98]"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
