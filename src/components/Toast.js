'use client';

import { useCart } from '@/context/CartContext';

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-[1300] toast-enter">
      <div className="bg-white border border-pink-200 rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 max-w-sm">
        <span className="text-2xl">✅</span>
        <p className="text-sm text-charcoal font-medium">{toast}</p>
      </div>
    </div>
  );
}
