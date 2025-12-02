'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Lock,
  Loader2,
  CheckCircle,
} from '@/components/ui/custom-icons';
import { useCart, formatPrice } from '@/lib/merch/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shipping estimate (flat rate for now)
  const shippingCost = subtotal > 5000 ? 0 : 599; // Free shipping over $50
  const taxRate = 0.08; // 8% tax estimate
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + shippingCost + taxAmount;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/merch/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            stripePriceId: item.product.stripePriceId,
            quantity: item.quantity,
            variants: item.selectedVariants,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
              <ShoppingBag className="h-10 w-10 text-white/30" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-white">Your cart is empty</h1>
            <p className="mb-8 text-white/50">Add some merch before checking out</p>
            <Link href="/merch">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white"
              >
                Browse Merch
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link
            href="/merch"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to store
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">Checkout</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Order Summary - Left Side */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="mb-6 text-xl font-semibold text-white">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => {
                  const itemKey = `${item.product.id}-${item.selectedVariants?.size || ''}-${item.selectedVariants?.color || ''}`;
                  return (
                    <div
                      key={itemKey}
                      className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
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
                              {item.selectedVariants.size && `Size: ${item.selectedVariants.size}`}
                              {item.selectedVariants.size && item.selectedVariants.color && ' / '}
                              {item.selectedVariants.color &&
                                `Color: ${item.selectedVariants.color}`}
                            </p>
                          )}
                          <p className="text-sm text-white/50">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-orange-400">
                          {formatPrice(item.product.price * item.quantity, item.product.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Edit Cart Link */}
              <Link
                href="/merch"
                className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300"
              >
                Edit cart
              </Link>
            </motion.div>
          </div>

          {/* Payment Summary - Right Side */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="sticky top-8 rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="mb-6 text-xl font-semibold text-white">Payment</h2>

              {/* Price Breakdown */}
              <div className="space-y-3 border-b border-white/10 pb-4">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Estimated Tax</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 flex justify-between pt-4">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
              </div>

              {/* Free Shipping Notice */}
              {subtotal < 5000 && (
                <div className="mb-4 rounded-lg bg-orange-500/10 p-3 text-center text-sm text-orange-400">
                  Add {formatPrice(5000 - subtotal)} more for free shipping
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Checkout Button */}
              <motion.button
                onClick={handleCheckout}
                disabled={isProcessing}
                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-4 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay with Stripe
                  </>
                )}
              </motion.button>

              {/* Security Note */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
                <Lock className="h-3 w-3" />
                Secure checkout powered by Stripe
              </div>

              {/* Accepted Cards */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="rounded bg-white/10 px-2 py-1 text-[10px] font-medium text-white/50">
                  VISA
                </div>
                <div className="rounded bg-white/10 px-2 py-1 text-[10px] font-medium text-white/50">
                  MC
                </div>
                <div className="rounded bg-white/10 px-2 py-1 text-[10px] font-medium text-white/50">
                  AMEX
                </div>
                <div className="rounded bg-white/10 px-2 py-1 text-[10px] font-medium text-white/50">
                  DISCOVER
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
