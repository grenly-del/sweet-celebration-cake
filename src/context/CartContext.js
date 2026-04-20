'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const saved = window.localStorage.getItem('sweet-cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load cart:', error);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Save to localStorage on change
  useEffect(() => {
    window.localStorage.setItem('sweet-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product, selectedSize = null) => {
    setItems((prev) => {
      const sizeLabel = selectedSize?.label || product.sizes[0].label;
      const sizePrice = selectedSize?.priceAdd || 0;
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.sizeLabel === sizeLabel
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price + sizePrice,
          basePrice: product.price,
          sizeLabel,
          sizePrice,
          quantity: 1,
        },
      ];
    });

    setToast(`${product.name} ditambahkan ke keranjang!`);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const removeFromCart = useCallback((itemId, sizeLabel) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === itemId && item.sizeLabel === sizeLabel))
    );
  }, []);

  const updateQuantity = useCallback((itemId, sizeLabel, newQty) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.sizeLabel === sizeLabel
          ? { ...item, quantity: newQty }
          : item
      )
    );
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotal,
        getTotalItems,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        toast,
        setToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
