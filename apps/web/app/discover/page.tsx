'use client';

import { useState } from 'react';
import { Card } from '@cronkwaters/ui';
import { Search, Users, Filter, Music2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'genre' | 'instrument'>('username');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] via-[#0f172a] to-[#050816] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-3">
            Discover Musicians
          </h1>
          <p className="text-xl text-gray-400">
            Find collaborators and build your network
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 mb-8 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search by ${searchType}...`}
                  className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-[#c9a961] focus:outline-none focus:ring-1 focus:ring-[#c9a961]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchType('username')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    searchType === 'username'
                      ? 'bg-[#c9a961] text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Username
                </button>
                <button
                  onClick={() => setSearchType('genre')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    searchType === 'genre'
                      ? 'bg-[#c9a961] text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Genre
                </button>
                <button
                  onClick={() => setSearchType('instrument')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    searchType === 'instrument'
                      ? 'bg-[#c9a961] text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Instrument
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Search respects privacy settings. Only users with public profiles are discoverable.
            </p>
          </Card>
        </motion.div>

        {/* Search Results Placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-12 text-center border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="max-w-2xl mx-auto">
              <Users className="w-20 h-20 text-gray-700 mx-auto mb-6" />
              <h3 className="text-2xl font-serif font-semibold text-white mb-3">
                Musician Discovery
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Connect with artists, producers, and collaborators.
                Database-powered search launching soon.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto text-left mb-8">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-lg">
                  <Search className="w-5 h-5 text-[#c9a961] mb-3" />
                  <p className="font-medium text-white mb-2">Search by Handle</p>
                  <p className="text-sm text-gray-500">
                    Find artists by their unique username
                  </p>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-lg">
                  <Music2 className="w-5 h-5 text-[#c9a961] mb-3" />
                  <p className="font-medium text-white mb-2">Browse by Genre</p>
                  <p className="text-sm text-gray-500">
                    Discover artists in your style
                  </p>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-lg">
                  <Filter className="w-5 h-5 text-[#c9a961] mb-3" />
                  <p className="font-medium text-white mb-2">Filter by Instrument</p>
                  <p className="text-sm text-gray-500">
                    Find guitarists, drummers, vocalists
                  </p>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-lg">
                  <Users className="w-5 h-5 text-[#c9a961] mb-3" />
                  <p className="font-medium text-white mb-2">Collaboration History</p>
                  <p className="text-sm text-gray-500">
                    See who collaborates with who
                  </p>
                </div>
              </div>

              <Link 
                href="/settings/profile"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a961] text-black rounded-lg hover:bg-[#c9a961]/90 transition-all font-medium"
              >
                Complete Your Profile First
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
