'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Search, Users, Mail, Phone, Music, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'email' | 'phone'>('username');

  return (
    <div className="bg-background min-h-screen">
      {/* Premium Hero */}
      <div className="border-border/50 relative overflow-hidden border-b">
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="bg-brand-primary/10 absolute right-1/3 top-0 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-6xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <Users className="text-brand-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Build Your Network</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Discover Musicians</h1>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Find collaborators, connect with artists worldwide, build your creative network
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-6xl px-4 py-12">
        {/* Search Box */}
        <Card className="rnrb-card mb-8 p-8">
          <h2 className="font-display mb-6 text-2xl font-bold">Search for Artists</h2>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSearchType('username')}
              className={`rounded-xl px-6 py-2.5 font-medium transition ${
                searchType === 'username'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'border-border bg-surface-muted text-foreground hover:bg-surface border'
              }`}
            >
              <Users className="mr-2 inline-block h-4 w-4" />
              Username
            </button>
            <button
              onClick={() => setSearchType('email')}
              className={`rounded-xl px-6 py-2.5 font-medium transition ${
                searchType === 'email'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'border-border bg-surface-muted text-foreground hover:bg-surface border'
              }`}
            >
              <Mail className="mr-2 inline-block h-4 w-4" />
              Email
            </button>
            <button
              onClick={() => setSearchType('phone')}
              className={`rounded-xl px-6 py-2.5 font-medium transition ${
                searchType === 'phone'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'border-border bg-surface-muted text-foreground hover:bg-surface border'
              }`}
            >
              <Phone className="mr-2 inline-block h-4 w-4" />
              Phone
            </button>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search by ${searchType}...`}
              className="border-border bg-surface text-foreground placeholder-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-xl border py-3.5 pl-12 pr-4 outline-none transition focus:ring-2"
            />
          </div>

          <div className="rnrb-card border-brand-primary/20 bg-brand-primary/5 mt-4 p-4">
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Sparkles className="text-brand-primary h-4 w-4" />
              Search respects privacy. Only public profiles appear in results.
            </p>
          </div>
        </Card>

        {/* Coming Soon Features */}
        <Card className="rnrb-card p-8">
          <h2 className="font-display mb-4 text-2xl font-bold">Advanced Search Coming Soon</h2>
          <p className="text-muted-foreground mb-8">
            Full user database search launching soon. Here's what's coming:
          </p>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rnrb-card bg-surface-muted p-6">
              <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Search className="text-brand-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Search by Username</h3>
              <p className="text-muted-foreground text-sm">
                Find artists by their unique handle across the platform
              </p>
            </div>

            <div className="rnrb-card bg-surface-muted p-6">
              <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Mail className="text-brand-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Search by Email</h3>
              <p className="text-muted-foreground text-sm">
                Find artists who have made their email address public
              </p>
            </div>

            <div className="rnrb-card bg-surface-muted p-6">
              <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Phone className="text-brand-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Search by Phone</h3>
              <p className="text-muted-foreground text-sm">
                Connect using phone numbers (with artist permission)
              </p>
            </div>

            <div className="rnrb-card bg-surface-muted p-6">
              <div className="bg-brand-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Music className="text-brand-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Browse by Genre</h3>
              <p className="text-muted-foreground text-sm">
                Discover artists working in your musical style
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/settings/profile">
              <Button className="rnrb-button-primary rounded-xl px-8 py-3 font-semibold">
                Set Up Your Profile First
              </Button>
            </Link>
            <p className="text-muted-foreground mt-3 text-xs">
              Make your profile public so other artists can find and connect with you
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
