'use client';

import { useState } from 'react';
import { Card } from '@cronkwaters/ui';
import { Search, Users, Mail, Phone, Music } from 'lucide-react';
import Link from 'next/link';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'email' | 'phone'>('username');
  const [searching, setSearching] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Musicians 🎸
          </h1>
          <p className="text-xl text-muted-foreground">
            Find collaborators, connect with other artists, build your network
          </p>
        </div>

        {/* Search */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search by ${searchType}...`}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSearchType('username')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === 'username'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                Username
              </button>
              <button
                onClick={() => setSearchType('email')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === 'email'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setSearchType('phone')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === 'phone'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                Phone
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 Search respects privacy settings. You can only find users who have made their {searchType} public.
            </p>
          </div>
        </Card>

        {/* Search Results Placeholder */}
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">User Search Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            Database-powered user search is currently in development. Soon you'll be able to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">🔍 Find by Username</p>
              <p className="text-sm text-muted-foreground">
                Search for artists by their unique handle
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">📧 Find by Email</p>
              <p className="text-sm text-muted-foreground">
                If they've made it public, search by email address
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">📱 Find by Phone</p>
              <p className="text-sm text-muted-foreground">
                Connect using phone numbers (with permission)
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">🎵 Browse by Genre</p>
              <p className="text-sm text-muted-foreground">
                Discover artists in your style
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link 
              href="/settings/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Users className="w-4 h-4" />
              Set Up Your Profile First
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

