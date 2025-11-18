'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '@cronkwaters/ui';
import { Search, Users, Mail, Phone, Music, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'email' | 'phone'>('username');

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Hero */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-6xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Build Your Network</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Discover Musicians</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Find collaborators, connect with artists worldwide, build your creative network
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-6xl py-12 px-4">

        {/* Search Box */}
        <Card className="p-8 mb-8 rnrb-card">
          <h2 className="text-2xl font-display font-bold mb-6">Search for Artists</h2>
          
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setSearchType('username')}
              className={`px-6 py-2.5 rounded-xl transition font-medium ${
                searchType === 'username'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'bg-surface-muted hover:bg-surface text-foreground border border-border'
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              Username
            </button>
            <button
              onClick={() => setSearchType('email')}
              className={`px-6 py-2.5 rounded-xl transition font-medium ${
                searchType === 'email'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'bg-surface-muted hover:bg-surface text-foreground border border-border'
              }`}
            >
              <Mail className="w-4 h-4 inline-block mr-2" />
              Email
            </button>
            <button
              onClick={() => setSearchType('phone')}
              className={`px-6 py-2.5 rounded-xl transition font-medium ${
                searchType === 'phone'
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-lg'
                  : 'bg-surface-muted hover:bg-surface text-foreground border border-border'
              }`}
            >
              <Phone className="w-4 h-4 inline-block mr-2" />
              Phone
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search by ${searchType}...`}
              className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition"
            />
          </div>

          <div className="mt-4 p-4 rnrb-card bg-brand-primary/5 border-brand-primary/20">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              Search respects privacy. Only public profiles appear in results.
            </p>
          </div>
        </Card>

        {/* Coming Soon Features */}
        <Card className="p-8 rnrb-card">
          <h2 className="text-2xl font-display font-bold mb-4">Advanced Search Coming Soon</h2>
          <p className="text-muted-foreground mb-8">
            Full user database search launching soon. Here's what's coming:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="rnrb-card p-6 bg-surface-muted">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="font-semibold mb-2">Search by Username</h3>
              <p className="text-sm text-muted-foreground">
                Find artists by their unique handle across the platform
              </p>
            </div>

            <div className="rnrb-card p-6 bg-surface-muted">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="font-semibold mb-2">Search by Email</h3>
              <p className="text-sm text-muted-foreground">
                Find artists who have made their email address public
              </p>
            </div>

            <div className="rnrb-card p-6 bg-surface-muted">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="font-semibold mb-2">Search by Phone</h3>
              <p className="text-sm text-muted-foreground">
                Connect using phone numbers (with artist permission)
              </p>
            </div>

            <div className="rnrb-card p-6 bg-surface-muted">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="font-semibold mb-2">Browse by Genre</h3>
              <p className="text-sm text-muted-foreground">
                Discover artists working in your musical style
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/settings/profile">
              <Button className="rnrb-button-primary px-8 py-3 rounded-xl font-semibold">
                Set Up Your Profile First
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              Make your profile public so other artists can find and connect with you
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
