'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  TShirt,
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  HelpCircle,
  CheckCircle,
  Star,
  Clock,
  Globe,
  ArrowRight,
} from '@/components/ui/custom-icons';

export default function MerchHelpPage() {
  const faqs = [
    {
      question: 'How does the merch system work?',
      answer:
        'We handle everything: printing, inventory, packing, and shipping. You create designs, set your prices, and earn 85% of the profit on each sale. No upfront costs.',
    },
    {
      question: 'What can I sell?',
      answer:
        'T-shirts, hoodies, hats, mugs, posters, and more. All products are high-quality and printed on-demand when fans order.',
    },
    {
      question: 'How do I get paid?',
      answer:
        'Earnings are calculated automatically. You receive 85% of the profit (retail price minus base cost). Payouts are made monthly via Stripe.',
    },
    {
      question: 'What are the quality standards?',
      answer:
        'We use premium materials and professional printing. All products go through quality checks before shipping. 30-day satisfaction guarantee for customers.',
    },
    {
      question: 'How long does shipping take?',
      answer:
        'Production takes 3-5 business days. Shipping varies by location: US (3-7 days), International (7-14 days). Tracking provided for all orders.',
    },
    {
      question: 'Can I offer custom designs?',
      answer:
        'Yes! Upload your own artwork or use our design tools. Designs must meet minimum resolution requirements (300 DPI recommended).',
    },
  ];

  const steps = [
    {
      icon: TShirt,
      title: 'Create Products',
      description: 'Choose from t-shirts, hoodies, hats, and more. Upload your designs.',
      bgColor: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
    },
    {
      icon: DollarSign,
      title: 'Set Your Price',
      description: 'Control your profit margin. We show you the base cost and suggested pricing.',
      bgColor: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      icon: Globe,
      title: 'Share & Sell',
      description: 'Your merch appears on your profile and can be shared anywhere.',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: ShoppingCart,
      title: 'We Ship It',
      description: 'We handle production, packing, and shipping. You just earn.',
      bgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-linear-to-br from-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-linear-to-tl from-purple-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex flex-col items-center"
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

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/20">
                <ShoppingBag className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">Merch Help Center</h1>
            <p className="text-lg text-white/60">
              Everything you need to know about selling merchandise
            </p>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="mb-6 text-2xl font-bold text-white">How It Works</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${step.bgColor}`}
                  >
                    <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-white/60">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Key Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 rounded-2xl border border-green-500/20 bg-linear-to-br from-green-500/10 to-transparent p-8"
          >
            <h2 className="mb-6 text-2xl font-bold text-white">
              Why Sell on Rock N' Roll Basement
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <h4 className="font-semibold text-white">Zero Upfront Cost</h4>
                  <p className="text-sm text-white/60">
                    No inventory or printing fees. Start today.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <h4 className="font-semibold text-white">85% Profit Share</h4>
                  <p className="text-sm text-white/60">You keep most of the earnings.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <h4 className="font-semibold text-white">Premium Quality</h4>
                  <p className="text-sm text-white/60">High-quality materials and printing.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <h4 className="font-semibold text-white">Global Shipping</h4>
                  <p className="text-sm text-white/60">We ship worldwide with tracking.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="mb-6 text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="mb-2 flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
                    <h3 className="font-semibold text-white">{faq.question}</h3>
                  </div>
                  <p className="ml-8 text-white/60">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-orange-500/20 bg-linear-to-br from-orange-500/10 to-transparent p-8 text-center"
          >
            <h2 className="mb-3 text-2xl font-bold text-white">Ready to Start Selling?</h2>
            <p className="mb-6 text-white/60">
              Create your first product in minutes. No credit card required.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/my-merch/create"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                Create Your First Product
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/my-merch"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:bg-white/20"
              >
                View My Store
              </Link>
            </div>
          </motion.div>

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center"
          >
            <Link href="/my-merch" className="text-sm text-white/50 hover:text-white">
              ← Back to My Merch
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
