'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Music2, 
  Sparkles, 
  Folder, 
  Library, 
  Users2, 
  TrendingUp,
  Clock,
  Play,
  ArrowRight,
  Compass,
  Mic2,
  Radio,
  Headphones,
  Zap,
  Plus,
  FileMusic,
  Share2
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
               style={{ borderColor: 'var(--accent) transparent var(--accent) var(--accent)' }} />
          <p className="text-lg text-muted">Setting up your studio...</p>
        </motion.div>
      </div>
    );
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Artist';
  
  // Welcome messages that resonate with musicians
  const welcomeMessages = [
    "Ready to create your next masterpiece?",
    "Your music journey continues here.",
    "Time to make something amazing!",
    "Let's turn ideas into music.",
    "Welcome to your creative space."
  ];
  const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Gradient Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-12 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,99,71,0.1) 0%, rgba(255,69,0,0.05) 100%)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
                left: `${i * 20}%`,
                top: `${i * 15}%`
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
          <h1 className="text-5xl font-bold mb-3">
            Welcome back, {userName}!
          </h1>
          <p className="text-xl text-muted">
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
        <h2 className="text-2xl font-semibold mb-6">Start Creating</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "AI Music Studio",
              description: "Create tracks with AI assistance",
              icon: Sparkles,
              href: "/create",
              color: "from-orange-500/20 to-red-500/20",
              iconColor: "text-orange-400",
              badge: "NEW"
            },
            {
              title: "New Project",
              description: "Start an album or EP",
              icon: Folder,
              href: "/projects/new",
              color: "from-blue-500/20 to-purple-500/20",
              iconColor: "text-blue-400"
            },
            {
              title: "Upload Track",
              description: "Add existing music",
              icon: FileMusic,
              href: "/library/upload",
              color: "from-green-500/20 to-teal-500/20",
              iconColor: "text-green-400"
            },
            {
              title: "Find Collaborators",
              description: "Connect with artists",
              icon: Users2,
              href: "/collab",
              color: "from-purple-500/20 to-pink-500/20",
              iconColor: "text-purple-400"
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
                <div className="card h-full cursor-pointer group relative overflow-hidden">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    {/* Badge */}
                    {action.badge && (
                      <span className="absolute -top-2 -right-2 px-2 py-1 text-xs font-bold rounded-full"
                            style={{ background: 'var(--accent)', color: 'white' }}>
                        {action.badge}
                      </span>
                    )}
                    
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                         style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <action.icon className={`w-7 h-7 ${action.iconColor}`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-white transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted group-hover:text-gray-300 transition-colors">
                      {action.description}
                    </p>
                    
                    {/* Arrow indicator */}
                    <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-muted opacity-0 group-hover:opacity-100 group-hover:text-white transform translate-x-2 group-hover:translate-x-0 transition-all" />
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
        <h2 className="text-2xl font-semibold mb-6">Your Journey So Far</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Projects Started", value: "0", icon: Folder, subtext: "Create your first project" },
            { label: "Tracks Created", value: "0", icon: Music2, subtext: "Start with AI Studio" },
            { label: "Collaborators", value: "0", icon: Users2, subtext: "Invite band members" },
            { label: "Credits Used", value: "0", icon: Zap, subtext: "150 credits available" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="card text-center"
            >
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                   style={{ background: 'rgba(255,255,255,0.05)' }}>
                <stat.icon className="w-6 h-6 text-muted" />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted mb-2">{stat.label}</p>
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
      >
        <h2 className="text-2xl font-semibold mb-6">Get Started</h2>
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
              href: "/collab"
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
                <div className="card cursor-pointer group flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: 'rgba(255,99,71,0.1)' }}>
                    <guide.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1 group-hover:text-accent transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted">
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
    </div>
  );
}