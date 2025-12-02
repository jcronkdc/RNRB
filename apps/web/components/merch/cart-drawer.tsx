'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from '@/components/ui/custom-icons';
import { useCart, formatPrice } from '@/lib/merch/cart-context';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    itemCount,
    subtotal,
    clearCart,
    checkout,
    isCheckingOut,
    artistUsername,
  } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-zinc-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
                  <ShoppingBag className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Your Cart</h2>
                  <p className="text-sm text-white/50">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                    <ShoppingBag className="h-8 w-8 text-white/30" />
                  </div>
                  <h3 className="mb-2 font-semibold text-white">Your cart is empty</h3>
                  <p className="mb-6 text-sm text-white/50">Add some merch to get started</p>
                  <button
                    onClick={closeCart}
                    className="rounded-xl bg-white/10 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const itemKey = `${item.product.id}-${item.selectedVariants?.size || ''}-${item.selectedVariants?.color || ''}`;
                    return (
                      <motion.div
                        key={itemKey}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        {/* Product Image */}
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h4 className="font-medium text-white">{item.product.name}</h4>
                            {item.selectedVariants && (
                              <p className="text-xs text-white/50">
                                {item.selectedVariants.size &&
                                  `Size: ${item.selectedVariants.size}`}
                                {item.selectedVariants.size && item.selectedVariants.color && ' / '}
                                {item.selectedVariants.color &&
                                  `Color: ${item.selectedVariants.color}`}
                              </p>
                            )}
                            <p className="mt-1 text-sm font-semibold text-orange-400">
                              {formatPrice(item.product.price, item.product.currency)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                    item.selectedVariants
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                    item.selectedVariants
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.product.id, item.selectedVariants)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Clear Cart Button */}
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full py-2 text-center text-sm text-white/40 transition-colors hover:text-white/60"
                    >
                      Clear cart
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Checkout */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-4">
                {/* Subtotal */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-white/70">Subtotal</span>
                  <span className="text-xl font-bold text-white">{formatPrice(subtotal)}</span>
                </div>
                <p className="mb-4 text-center text-xs text-white/40">
                  Shipping and taxes calculated at checkout
                </p>

                {/* Checkout Button */}
                <motion.button
                  onClick={checkout}
                  disabled={isCheckingOut}
                  whileHover={{ scale: isCheckingOut ? 1 : 1.02 }}
                  whileTap={{ scale: isCheckingOut ? 1 : 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {artistUsername ? `Checkout from @${artistUsername}` : 'Checkout'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="mt-3 w-full py-2 text-center text-sm text-white/50 transition-colors hover:text-white"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Cart Button Component for header/nav
export function CartButton() {
  const { itemCount, toggleCart, subtotal } = useCart();

  return (
    <motion.button
      onClick={toggleCart}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white transition-colors hover:bg-white/10"
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <>
          <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.span>
        </>
      )}
    </motion.button>
  );
}
