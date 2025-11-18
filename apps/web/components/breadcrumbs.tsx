'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show on homepage or marketing pages
  if (pathname === '/' || pathname.startsWith('/pricing') || pathname.startsWith('/why-')) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .replace(/[\[\]]/g, '') // Remove brackets from dynamic routes
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return { href, label };
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="rnrb-container max-w-7xl py-3 px-4">
        <div className="flex items-center gap-2 text-sm">
          <Link 
            href="/dashboard" 
            className="text-muted-foreground hover:text-brand-primary transition flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link 
                  href={crumb.href}
                  className="text-muted-foreground hover:text-brand-primary transition"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

