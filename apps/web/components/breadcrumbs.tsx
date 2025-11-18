'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, ArrowLeft, Folder } from 'lucide-react';

// Custom labels for known routes
const routeLabels: Record<string, string> = {
  'dashboard': 'Home',
  'create': 'Create',
  'projects': 'Projects',
  'library': 'Library',
  'collab': 'Collaboration',
  'explore': 'Explore',
  'credits': 'Credits & Billing',
  'settings': 'Settings',
  'new': 'New Project',
  'tracks': 'Tracks',
  'assets': 'Assets',
  'people': 'Team',
  'activity': 'Activity',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Don't show on homepage, marketing pages, or auth pages
  if (
    pathname === '/' || 
    pathname.startsWith('/pricing') || 
    pathname.startsWith('/why-') ||
    pathname.startsWith('/auth')
  ) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  
  // Build breadcrumb items with proper labels
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    // Check for custom label first
    let label = routeLabels[segment] || segment;
    
    // Handle dynamic routes (e.g., project IDs)
    if (segment.includes('[') || segment.length === 24) { // Assuming 24-char IDs
      if (segments[index - 1] === 'projects') {
        label = 'Project Details';
      } else if (segments[index - 1] === 'tracks') {
        label = 'Track';
      }
    } else if (!routeLabels[segment]) {
      // Fallback: Format segment as title case
      label = segment
        .replace(/[\[\]]/g, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    }
    
    return { href, label, segment };
  });
  
  // Check if we're in a project context
  const isInProject = segments.includes('projects') && segments.length > 1;

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Back button for deep navigation */}
      {isInProject && (
        <button
          onClick={() => router.push('/projects')}
          className="
            flex items-center gap-1.5 px-3 py-1.5
            text-sm font-medium text-foreground-muted
            hover:text-foreground hover:bg-surface
            rounded-md transition-all duration-200
          "
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      )}
      
      {/* Breadcrumb trail */}
      <div className="flex items-center gap-1.5 text-sm flex-1">
        {/* Home/Dashboard link */}
          <Link 
            href="/dashboard" 
          className="
            flex items-center gap-1 px-2 py-1 rounded-md
            text-foreground-muted hover:text-foreground 
            hover:bg-surface transition-all duration-200
          "
          >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Home</span>
          </Link>
        
        {/* Breadcrumb segments */}
          {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-foreground-muted opacity-50" />
            
              {index === breadcrumbs.length - 1 ? (
              // Current page (non-clickable)
              <span className="
                px-2 py-1 text-foreground font-medium
                flex items-center gap-1.5
              ">
                {crumb.segment === 'projects' && <Folder className="w-3.5 h-3.5" />}
                {crumb.label}
              </span>
              ) : (
              // Clickable parent segments
                <Link 
                  href={crumb.href}
                className="
                  px-2 py-1 rounded-md
                  text-foreground-muted hover:text-foreground
                  hover:bg-surface transition-all duration-200
                  flex items-center gap-1.5
                "
                >
                {crumb.segment === 'projects' && <Folder className="w-3.5 h-3.5" />}
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      
      {/* Quick actions based on context */}
      {segments[0] === 'projects' && segments.length === 2 && (
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-sm">
            Move Project
          </button>
          <button className="btn-ghost text-sm">
            Project Settings
          </button>
      </div>
      )}
    </div>
  );
}

