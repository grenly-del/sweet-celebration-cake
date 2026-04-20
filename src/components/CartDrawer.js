'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/data/products';

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-pink-100">
            <h2 className="font-serif text-xl font-bold text-charcoal flex items-center gap-2">
              🛒 Keranjang
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-charcoal/40 hover:text-charcoal transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-grow overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl block mb-4">🎂</span>
                <p className="text-charcoal/50 text-sm mb-4">
                  Keranjangmu masih kosong
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-pink-default text-sm font-semibold hover:underline"
                >
                  Mulai Belanja →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.sizeLabel}`}
                    className="flex gap-4 p-3 rounded-xl bg-pink-light/30 border border-pink-100/50"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-sm text-charcoal truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-charcoal/50 mb-2">
                        {item.sizeLabel}
                      </p>
                      <p className="text-sm font-bold gradient-text">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.id, item.sizeLabel)}
                        className="text-charcoal/30 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.sizeLabel, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-pink-200 flex items-center justify-center text-charcoal/50 hover:bg-pink-light transition-colors text-sm"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.sizeLabel, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-pink-200 flex items-center justify-center text-charcoal/50 hover:bg-pink-light transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-pink-100 bg-pink-light/30">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-charcoal">Total</span>
                <span className="text-xl font-bold gradient-text">
                  {formatPrice(getTotal())}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full bg-gradient-to-r from-pink-default to-rose text-white font-semibold py-3 rounded-full text-center hover:shadow-lg hover:shadow-pink-200/50 transition-all"
              >
                Checkout →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
