'use client';

import { useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Home } from '@/components/ui/custom-icons';
import { useCart } from '@/lib/merch/cart-context';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  // Clear cart on successful checkout
  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-2xl px-4 py-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex justify-center"
        >
          <Link href="/" className="group inline-block">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={140}
              height={57}
              priority
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
        </motion.div>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/8 to-white/2 p-8 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
          >
            <CheckCircle className="h-10 w-10 text-green-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-3xl font-bold text-white"
          >
            Order Confirmed
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 text-white/60"
          >
            Thank you for your purchase! Your RNRB merch is on its way.
          </motion.p>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8 rounded-xl bg-white/5 p-6"
          >
            <div className="flex items-center justify-center gap-3 text-white/70">
              <Package className="h-5 w-5" />
              <span>A confirmation email has been sent to your inbox</span>
            </div>
            {sessionId && (
              <p className="mt-2 text-xs text-white/40">
                Order reference: {sessionId.slice(0, 20)}...
              </p>
            )}
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8 space-y-4 text-left"
          >
            <h3 className="font-semibold text-white">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-medium text-orange-400">
                  1
                </div>
                <div>
                  <p className="font-medium text-white">Order Processing</p>
                  <p className="text-sm text-white/50">
                    We'll prepare your items for shipping (1-2 business days)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-medium text-orange-400">
                  2
                </div>
                <div>
                  <p className="font-medium text-white">Shipping Confirmation</p>
                  <p className="text-sm text-white/50">
                    You'll receive tracking info once your order ships
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-medium text-orange-400">
                  3
                </div>
                <div>
                  <p className="font-medium text-white">Delivery</p>
                  <p className="text-sm text-white/50">
                    Your merch arrives at your door - time to rock!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Link href="/merch">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white sm:w-auto"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white sm:w-auto"
              >
                <Home className="h-4 w-4" />
                Back to Dashboard
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Support Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-white/40"
        >
          Questions about your order?{' '}
          <Link href="/messages" className="text-orange-400 hover:text-orange-300">
            Contact support
          </Link>
        </motion.p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          <div className="animate-pulse text-white/50">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
