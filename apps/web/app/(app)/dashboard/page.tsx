'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Music2, 
  Sparkles, 
  Folder, 
  Users2, 
  Play,
  ArrowRight,
  Compass,
  FileMusic,
  Share2,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/use-require-auth';

// Dynamically import activity feed
const CompactActivityFeed = dynamic(() => import('@/components/activity-feed').then(m => m.CompactActivityFeed), { ssr: false });

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();

  // Optimistic rendering: Show UI immediately, update user name when ready
  const userName = loading 
    ? 'Artist' 
    : user?.user_metadata?.name || user?.email?.split('@')[0] || 'Artist';
  
  // Welcome messages that resonate with musicians
  const welcomeMessages = [
    "Ready to create your next masterpiece?",
    "Your music journey continues here.",
    "Time to make something amazing!",
    "Let's turn ideas into music.",
    "Welcome to your creative space."
  ];
  const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

  // Show loading indicator only briefly at top, not full screen
  const showLoadingBadge = loading;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Subtle loading indicator */}
        {showLoadingBadge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-20 right-6 z-50 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 text-xs text-orange-400 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Loading...
          </motion.div>
        )}

        {/* Hero Section with Orange Gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
          className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-red-600/10 border border-orange-500/20"
      >
          {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
                className="absolute rounded-full bg-orange-500/10 blur-3xl"
              style={{
                  width: `${200 + i * 100}px`,
                  height: `${200 + i * 100}px`,
                  left: `${i * 30}%`,
                  top: `${i * 20}%`
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 p-10">
            <h1 className="text-5xl font-bold mb-3 text-white">
            Welcome back, {userName}!
          </h1>
            <p className="text-xl text-gray-300">
            {randomWelcome}
          </p>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12"
      >
          <h2 className="text-2xl font-semibold mb-6 text-white">Start Creating</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Songwriting Studio",
              description: "AI-powered chord progressions & lyrics",
              icon: Music2,
              href: "/songwriting",
              badge: "AI POWERED"
            },
            {
              title: "Create Track",
              description: "Generate full songs with AI",
              icon: Sparkles,
                href: "/create"
            },
            {
              title: "New Project",
              description: "Start an album or EP",
              icon: Folder,
                href: "/projects/new"
            },
            {
              title: "My Library",
              description: "View your music assets",
              icon: FileMusic,
                href: "/library"
            },
            {
              title: "Explore Community",
              description: "Discover trending tracks & musicians",
              icon: Users2,
                href: "/explore"
            }
          ].map((action, index) => (
            <motion.div
              key={action.href}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link href={action.href}>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full cursor-pointer group relative overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
                    {/* Orange glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    {/* Badge */}
                    {action.badge && (
                        <span className="absolute -top-3 -right-3 px-2 py-1 text-xs font-bold rounded-full bg-orange-500 text-white">
                        {action.badge}
                      </span>
                    )}
                    
                    {/* Icon */}
                      <div className="w-14 h-14 bg-orange-500/10 rounded-xl mb-4 flex items-center justify-center group-hover:bg-orange-500/20 transition-all duration-300">
                        <action.icon className="w-7 h-7 text-orange-500" />
                    </div>
                    
                    {/* Content */}
                      <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-orange-500 transition-colors">
                      {action.title}
                    </h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      {action.description}
                    </p>
                    
                    {/* Arrow indicator */}
                      <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-orange-500 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Your Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
          <h2 className="text-2xl font-semibold mb-6 text-white">Your Journey So Far</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Projects Started", value: "0", icon: Folder, subtext: "Create your first project" },
            { label: "Tracks Created", value: "0", icon: Music2, subtext: "Start with AI Studio" },
            { label: "Collaborators", value: "0", icon: Users2, subtext: "Invite band members" },
            { label: "Total Plays", value: "0", icon: Play, subtext: "Share music to get plays" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center hover:border-orange-500/50 transition-colors"
            >
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-orange-500" />
              </div>
                <p className="text-3xl font-bold mb-1 text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
              <p className="text-xs text-gray-500">{stat.subtext}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Learning Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
      >
          <h2 className="text-2xl font-semibold mb-6 text-white">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "5-Minute Quick Start",
              description: "Create your first AI track",
              icon: Play,
              time: "5 min",
              href: "/create"
            },
            {
              title: "Collaboration Guide",
              description: "Work with your band remotely",
              icon: Share2,
              time: "10 min",
              href: "/projects"
            },
            {
              title: "Tour Our Features",
              description: "See everything we offer",
              icon: Compass,
              time: "3 min",
              href: "/explore"
            }
          ].map((guide, index) => (
            <motion.div
              key={guide.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Link href={guide.href}>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer group flex items-center gap-4 hover:border-orange-500/50 transition-all">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                      <guide.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-medium mb-1 text-white group-hover:text-orange-500 transition-colors">
                      {guide.title}
                    </h3>
                      <p className="text-sm text-gray-400">
                      {guide.description}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {guide.time}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Feed - Only show when user is loaded */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
            <h2 className="text-2xl font-semibold mb-6 text-white">Recent Activity</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <CompactActivityFeed channelName="activity:global" />
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
