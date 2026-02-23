'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Bell, Mail, CheckCircle } from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';

// ============================================
// Coming Soon Component
// ============================================
function ComingSoonView() {
  const [email, setEmail] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call - in future, connect to actual notification system
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setNotifyEnabled(true);
    setIsSubmitting(false);
  };

  const teaserItems = [
    {
      name: 'Apparel',
      description: 'Tees, hoodies & more',
      gradient: 'from-orange-500/30 to-red-600/30',
    },
    {
      name: 'Accessories',
      description: 'Hats, pins & patches',
      gradient: 'from-purple-500/30 to-indigo-600/30',
    },
    {
      name: 'Studio Gear',
      description: 'For the serious musician',
      gradient: 'from-emerald-500/30 to-teal-600/30',
    },
    {
      name: 'Limited Drops',
      description: 'Exclusive collaborations',
      gradient: 'from-amber-500/30 to-orange-600/30',
    },
  ];

  return (
    <>
      {/* Coming Soon Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/8 to-white/2 p-8 text-center md:p-12"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-6 py-2"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-2 w-2 rounded-full bg-orange-500"
          />
          <span className="text-sm font-semibold uppercase tracking-wider text-orange-400">
            Coming Soon
          </span>
        </motion.div>

        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">Something Big is Brewing</h2>
        <p className="mx-auto mb-8 max-w-xl text-white/60">
          We're crafting premium merchandise for musicians, by musicians. Quality gear that
          represents the Rock N' Roll Basement community and the passion we share for music.
        </p>

        {!notifyEnabled ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleNotifyMe}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
                style={{ color: 'var(--muted)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-red-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 disabled:opacity-50"
            >
              <Bell className="h-4 w-4" />
              {isSubmitting ? 'Joining...' : 'Notify Me'}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-4"
          >
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="font-medium text-green-400">
              You'll be first to know when we launch
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Teaser Product Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-white/50">
          What's Coming
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teaserItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br ${item.gradient} p-6 transition-all duration-300 hover:border-white/20`}
            >
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <div className="relative z-10">
                <h4 className="mb-1 text-lg font-semibold text-white">{item.name}</h4>
                <p className="text-sm text-white/50">{item.description}</p>
              </div>
              <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <span className="text-xs text-white/40">Soon</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Brand Values Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/6 to-white/2 p-8"
      >
        <div className="grid gap-8 text-center md:grid-cols-3">
          <div className="group">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500/20 to-red-500/20 transition-transform duration-300 group-hover:scale-110">
              <span className="text-2xl font-bold text-orange-400">01</span>
            </div>
            <h4 className="mb-2 font-semibold text-white">Premium Quality</h4>
            <p className="text-sm text-white/50">
              Every item crafted with care and built to last through countless gigs
            </p>
          </div>
          <div className="group">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500/20 to-indigo-500/20 transition-transform duration-300 group-hover:scale-110">
              <span className="text-2xl font-bold text-purple-400">02</span>
            </div>
            <h4 className="mb-2 font-semibold text-white">Made for Musicians</h4>
            <p className="text-sm text-white/50">
              Designed with the working musician in mind, from stage to studio
            </p>
          </div>
          <div className="group">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 transition-transform duration-300 group-hover:scale-110">
              <span className="text-2xl font-bold text-emerald-400">03</span>
            </div>
            <h4 className="mb-2 font-semibold text-white">Community Driven</h4>
            <p className="text-sm text-white/50">
              Proceeds support the platform and fellow musicians in the community
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ============================================
// Main Page Component
// ============================================
export default function MerchStorePage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-linear-to-br from-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-linear-to-tl from-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-linear-to-br from-red-500/5 to-transparent blur-3xl" />
      </div>

      {/* Logo & Header Section */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* RR Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
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
            transition={{ delay: 0.1 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(249, 115, 22, 0.15)' }}
              >
                <ShoppingBag className="h-7 w-7" style={{ color: 'var(--accent)' }} />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">RNRB Merch Store</h1>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>
              Official Rock N' Roll Basement merchandise
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <ComingSoonView />

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-white/40">
            Questions about the merch store?{' '}
            <Link href="/messages" className="text-orange-400 hover:text-orange-300">
              Reach out to us
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
