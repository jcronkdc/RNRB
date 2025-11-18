'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Music, Users, Mic2, X, Folder } from 'lucide-react';
import Link from 'next/link';

export function FABQuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { 
      icon: Folder, 
      label: 'New Project', 
      href: '/projects/new',
      color: 'text-brand-primary',
      bg: 'bg-brand-primary/10'
    },
    { 
      icon: Music, 
      label: 'Write Song', 
      href: '/projects',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    { 
      icon: Mic2, 
      label: 'Record', 
      href: '/studio',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10'
    },
    { 
      icon: Users, 
      label: 'Find Musicians', 
      href: '/discover',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-0 w-56 space-y-2"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Link href={action.href}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 bg-surface hover:bg-surface-muted border border-border rounded-xl flex items-center gap-3 transition-all shadow-lg hover:shadow-xl group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="font-medium text-foreground group-hover:text-brand-primary transition-colors">
                      {action.label}
                    </span>
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 bg-brand-primary hover:bg-brand-primary/90 rounded-full shadow-2xl flex items-center justify-center transition-colors group"
        title="Quick actions"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7 text-brand-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-7 h-7 text-brand-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

