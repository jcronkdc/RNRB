'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types
export interface MerchProduct {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  image?: string;
  category: 'apparel' | 'accessories' | 'studio-gear' | 'limited';
  variants?: ProductVariant[];
  inStock: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Small", "Medium", "Large" or "Black", "White"
  type: 'size' | 'color';
  inStock: boolean;
  stripePriceId?: string;
}

export interface CartItem {
  product: MerchProduct;
  quantity: number;
  selectedVariants?: {
    size?: string;
    color?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: MerchProduct,
    quantity?: number,
    variants?: CartItem['selectedVariants']
  ) => void;
  removeItem: (productId: string, variants?: CartItem['selectedVariants']) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variants?: CartItem['selectedVariants']
  ) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'rnrb-merch-cart';

// Helper to generate unique cart item key
const getCartItemKey = (productId: string, variants?: CartItem['selectedVariants']): string => {
  if (!variants) return productId;
  return `${productId}-${variants.size || ''}-${variants.color || ''}`;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      } catch (e) {
        console.error('Failed to parse cart from storage:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = useCallback(
    (product: MerchProduct, quantity: number = 1, variants?: CartItem['selectedVariants']) => {
      setItems((currentItems) => {
        const itemKey = getCartItemKey(product.id, variants);
        const existingIndex = currentItems.findIndex(
          (item) => getCartItemKey(item.product.id, item.selectedVariants) === itemKey
        );

        if (existingIndex >= 0) {
          // Update quantity of existing item
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        // Add new item
        return [...currentItems, { product, quantity, selectedVariants: variants }];
      });

      // Open cart when adding item
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string, variants?: CartItem['selectedVariants']) => {
    setItems((currentItems) => {
      const itemKey = getCartItemKey(productId, variants);
      return currentItems.filter(
        (item) => getCartItemKey(item.product.id, item.selectedVariants) !== itemKey
      );
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variants?: CartItem['selectedVariants']) => {
      if (quantity <= 0) {
        removeItem(productId, variants);
        return;
      }

      setItems((currentItems) => {
        const itemKey = getCartItemKey(productId, variants);
        return currentItems.map((item) => {
          if (getCartItemKey(item.product.id, item.selectedVariants) === itemKey) {
            return { ...item, quantity };
          }
          return item;
        });
      });
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Utility function to format price
export function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
