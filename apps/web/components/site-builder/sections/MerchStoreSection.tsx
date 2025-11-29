'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Plus, Minus, X, CreditCard, Loader2, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category?: string;
  variants?: {
    name: string;
    options: string[];
  }[];
  inStock: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  variant?: Record<string, string>;
}

interface MerchStoreSectionProps {
  content: {
    title?: string;
    subtitle?: string;
    products?: Product[];
    layout?: 'grid' | 'featured' | 'carousel';
    columns?: 2 | 3 | 4;
    showCategories?: boolean;
    stripeEnabled?: boolean;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  subdomain?: string;
}

export function MerchStoreSection({ content, styles, subdomain }: MerchStoreSectionProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const {
    title = 'Merch',
    subtitle = 'Official merchandise',
    products = [],
    layout = 'grid',
    columns = 3,
    showCategories = true,
  } = content;

  const bgColor = styles?.backgroundColor || 'transparent';
  const textColor = styles?.textColor || 'var(--text)';
  const accentColor = styles?.accentColor || 'var(--accent)';

  const categories = showCategories
    ? [...new Set(products.map((p) => p.category).filter(Boolean))]
    : [];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const addToCart = (product: Product, variant?: Record<string, string>) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id && JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, variant }];
    });
    setSelectedProduct(null);
    setSelectedVariants({});
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/sites/merch/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            variant: item.variant,
          })),
        }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getColumnClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <section className="relative px-4 py-16 md:px-8 lg:py-24" style={{ background: bgColor }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2
            className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl"
            style={{ color: textColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg opacity-70" style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: !activeCategory ? accentColor : 'rgba(255,255,255,0.1)',
                color: !activeCategory ? '#fff' : textColor,
                border: !activeCategory ? `2px solid ${accentColor}` : '2px solid transparent',
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as string)}
                className="rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors"
                style={{
                  background: activeCategory === cat ? accentColor : 'rgba(255,255,255,0.1)',
                  color: activeCategory === cat ? '#fff' : textColor,
                  border:
                    activeCategory === cat ? `2px solid ${accentColor}` : '2px solid transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${getColumnClass()}`}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      <ShoppingBag size={48} style={{ color: textColor, opacity: 0.3 }} />
                    </div>
                  )}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span
                      className="absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-bold"
                      style={{ background: '#ef4444', color: '#fff' }}
                    >
                      SALE
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="mb-1 font-semibold" style={{ color: textColor }}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: accentColor }}>
                      ${product.price.toFixed(2)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span
                        className="text-sm line-through opacity-50"
                        style={{ color: textColor }}
                      >
                        ${product.comparePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {!product.inStock && (
                    <span className="mt-2 inline-block text-sm text-red-400">Out of Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-16"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '2px dashed rgba(255,255,255,0.2)',
            }}
          >
            <ShoppingBag size={48} className="mb-4 opacity-40" style={{ color: textColor }} />
            <p className="font-medium" style={{ color: textColor }}>
              No products available
            </p>
            <p className="text-sm opacity-60" style={{ color: textColor }}>
              Check back soon for new merch!
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-6 py-3 shadow-lg transition-transform hover:scale-105"
          style={{ background: accentColor, color: '#fff' }}
        >
          <ShoppingBag size={20} />
          <span className="font-semibold">
            {cartCount} item{cartCount !== 1 ? 's' : ''} - ${cartTotal.toFixed(2)}
          </span>
        </button>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl"
            style={{ background: 'var(--panel)', color: textColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 hover:bg-white/20"
            >
              <X size={20} />
            </button>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Images */}
              <div className="relative aspect-square overflow-hidden rounded-xl">
                {selectedProduct.images[0] ? (
                  <Image
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <ShoppingBag size={64} style={{ opacity: 0.3 }} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <h3 className="mb-2 text-2xl font-bold">{selectedProduct.name}</h3>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl font-bold" style={{ color: accentColor }}>
                    ${selectedProduct.price.toFixed(2)}
                  </span>
                  {selectedProduct.comparePrice &&
                    selectedProduct.comparePrice > selectedProduct.price && (
                      <span className="text-lg line-through opacity-50">
                        ${selectedProduct.comparePrice.toFixed(2)}
                      </span>
                    )}
                </div>

                {selectedProduct.description && (
                  <p className="mb-6 opacity-80">{selectedProduct.description}</p>
                )}

                {/* Variants */}
                {selectedProduct.variants?.map((variant) => (
                  <div key={variant.name} className="mb-4">
                    <label className="mb-2 block text-sm font-medium">{variant.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option) => (
                        <button
                          key={option}
                          onClick={() =>
                            setSelectedVariants((prev) => ({ ...prev, [variant.name]: option }))
                          }
                          className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                            selectedVariants[variant.name] === option
                              ? 'border-transparent'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          style={{
                            background:
                              selectedVariants[variant.name] === option
                                ? accentColor
                                : 'transparent',
                            color: selectedVariants[variant.name] === option ? '#fff' : textColor,
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addToCart(selectedProduct, selectedVariants)}
                  disabled={!selectedProduct.inStock}
                  className="mt-auto flex items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors disabled:opacity-50"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  <ShoppingBag size={20} />
                  {selectedProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/80"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="h-full w-full max-w-md overflow-y-auto"
            style={{ background: 'var(--panel)', color: textColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h3 className="text-xl font-bold">Your Cart</h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ShoppingBag size={48} className="mb-4 opacity-30" />
                <p className="opacity-70">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="p-6">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="mb-4 flex gap-4 rounded-xl p-4"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-white/10">
                            <ShoppingBag size={24} className="opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        {item.variant && (
                          <p className="text-sm opacity-60">
                            {Object.entries(item.variant)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="rounded-full p-1 hover:bg-white/10"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="rounded-full p-1 hover:bg-white/10"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="font-semibold" style={{ color: accentColor }}>
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 p-6">
                  <div className="mb-4 flex items-center justify-between text-lg">
                    <span>Total</span>
                    <span className="text-2xl font-bold" style={{ color: accentColor }}>
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-colors disabled:opacity-50"
                    style={{ background: accentColor, color: '#fff' }}
                  >
                    {isCheckingOut ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CreditCard size={20} />
                    )}
                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
