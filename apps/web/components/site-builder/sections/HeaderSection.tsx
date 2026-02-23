'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HeaderSectionProps {
  content: {
    siteName?: string;
    logo?: string;
    showNav?: boolean;
    navItems?: string[];
    sticky?: boolean;
  };
  theme: Record<string, unknown>;
  socialLinks?: Record<string, string>;
}

export function HeaderSection({ content, theme, socialLinks }: HeaderSectionProps) {
  const {
    siteName = 'Artist',
    logo,
    showNav = true,
    navItems = ['Home', 'Music', 'Tour', 'About', 'Contact'],
    sticky = true,
  } = content;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const accentColor = (theme.accentColor as string) || '#ff6347';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (item: string) => {
    const sectionId = item.toLowerCase().replace(/\s+/g, '-');
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`${sticky ? 'fixed left-0 right-0 top-0 z-50' : 'relative'} transition-all duration-300`}
        style={{
          backgroundColor: isScrolled
            ? (theme.primaryColor as string) + 'f0' || '#000000f0'
            : 'transparent',
        }}
      >
        <nav className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo / Site Name */}
            <Link href="/" className="flex items-center gap-3">
              {logo ? (
                <img src={logo} alt={siteName} className="h-10 w-auto" />
              ) : (
                <span
                  className="text-2xl font-bold tracking-tight"
                  style={{
                    fontFamily: (theme.fontHeading as string) || 'inherit',
                    color: (theme.textColor as string) || '#fff',
                  }}
                >
                  {siteName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            {showNav && (
              <div className="hidden items-center gap-8 md:flex">
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{
                      fontFamily: (theme.fontBody as string) || 'inherit',
                      color: (theme.textColor as string) || '#fff',
                    }}
                  >
                    {item}
                  </button>
                ))}

                {/* Social Icons in header (optional) */}
                {socialLinks && Object.keys(socialLinks).length > 0 && (
                  <div className="ml-4 flex items-center gap-3 border-l border-white/20 pl-4">
                    {Object.entries(socialLinks)
                      .slice(0, 3)
                      .map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:opacity-80"
                          style={{ color: (theme.mutedColor as string) || '#888' }}
                        >
                          <SocialIcon platform={platform} size={18} />
                        </a>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            {showNav && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 md:hidden"
                style={{ color: (theme.textColor as string) || '#fff' }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ backgroundColor: (theme.primaryColor as string) + 'f8' || '#000000f8' }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => scrollToSection(item)}
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: (theme.fontHeading as string) || 'inherit',
                    color: (theme.textColor as string) || '#fff',
                  }}
                >
                  {item}
                </motion.button>
              ))}

              {/* Social Icons in mobile menu */}
              {socialLinks && Object.keys(socialLinks).length > 0 && (
                <div className="mt-8 flex items-center gap-6 border-t border-white/20 pt-8">
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors"
                      style={{ color: accentColor }}
                    >
                      <SocialIcon platform={platform} size={24} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple social icon component
function SocialIcon({ platform, size = 20 }: { platform: string; size?: number }) {
  const icons: Record<string, string> = {
    spotify: '♪',
    apple: '',
    youtube: '▶️',
    instagram: '📷',
    twitter: '🐦',
    facebook: 'f',
    tiktok: '♪',
    bandcamp: '',
    soundcloud: '',
  };

  return <span style={{ fontSize: size * 0.8 }}>{icons[platform.toLowerCase()] ?? '→'}</span>;
}
