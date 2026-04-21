'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import {
  formatPrice,
  getCategoryLabel,
  getFlavorLabel,
} from '@/data/products';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();

  const getBadge = () => {
    if (product.isBestSeller) return <span className="badge badge-bestseller">Best Seller</span>;
    if (product.isPopular) return <span className="badge badge-popular">Populer</span>;
    if (product.isNew) return <span className="badge badge-new">Baru</span>;
    return null;
  };

  const metaLine = product.metaLine || getFlavorLabel(product.flavor);

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100/50 flex flex-col">
      {/* Image */}
      <div
        className="relative h-64 overflow-hidden cursor-pointer"
        onClick={() => onQuickView && onQuickView(product)}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="product-image object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          {getBadge()}
        </div>
        {/* Category label */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-charcoal/70">
            {getCategoryLabel(product.category)}
          </span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 hover:opacity-100 text-white font-medium text-sm bg-pink-default/80 px-4 py-2 rounded-full transition-opacity backdrop-blur-sm">
            Lihat Detail
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3
            className="font-serif text-lg font-bold text-charcoal mb-1 cursor-pointer hover:text-pink-default transition-colors"
            onClick={() => onQuickView && onQuickView(product)}
          >
            {product.name}
          </h3>
          <p className="text-xs text-charcoal/50 uppercase tracking-wider mb-1">
            {metaLine}
          </p>
          <p className="text-sm text-charcoal/60 line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-pink-50">
          <span className="font-bold text-lg gradient-text">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => addToCart(product)}
            className="bg-gradient-to-r from-pink-default to-rose text-white text-xs font-semibold px-4 py-2 rounded-full hover:shadow-lg hover:shadow-pink-200/50 transition-all active:scale-95"
          >
            + Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
