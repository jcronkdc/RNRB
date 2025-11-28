'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Save,
  Eye,
  Globe,
  Loader2,
  ArrowLeft,
  Layers,
  Palette,
  Settings as SettingsIcon,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  ExternalLink,
  Check,
  Link,
  PanelLeftClose,
  PanelLeft,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Undo,
  Redo,
  CloudOff,
  Cloud,
  FileText,
  BarChart3,
  HelpCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { DomainSettings } from '@/components/site-builder/DomainSettings';
import { DraggableSections } from '@/components/site-builder/DraggableSections';
import { LivePreview } from '@/components/site-builder/LivePreview';
import { TemplateSwitcher } from '@/components/site-builder/TemplateSwitcher';
import { AnalyticsDashboard } from '@/components/site-builder/AnalyticsDashboard';
import { SEOPreview } from '@/components/site-builder/SEOPreview';
import { PageManager } from '@/components/site-builder/PageManager';
import { ResponsiveTesting } from '@/components/site-builder/ResponsiveTesting';
import { SectionEditor } from '@/components/site-builder/SectionEditor';
import { KeyboardShortcutsHelp } from '@/components/site-builder/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface SiteSection {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  isVisible: boolean;
  animation?: string | null;
}

interface Site {
  id: string;
  subdomain: string;
  siteName: string | null;
  tagline: string | null;
  templateId: string;
  theme: Record<string, unknown> | null;
  socialLinks: Record<string, string> | null;
  status: string;
  siteTitle: string | null;
  metaDescription: string | null;
  bookingEmail: string | null;
  publicEmail: string | null;
  sections: SiteSection[];
}

function SiteEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'sections';

  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // New state for enhanced editor
  const [showPreview, setShowPreview] = useState(true);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [history, setHistory] = useState<Site[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editingSection, setEditingSection] = useState<SiteSection | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchSite();
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSaveError(null);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize history when site loads
  useEffect(() => {
    if (site && history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(site))]);
      setHistoryIndex(0);
    }
  }, [site, history.length]);

  // Save to history when site changes
  const saveToHistory = useCallback(() => {
    if (!site) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(site)));

    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex((prev) => prev + 1);
    }

    setHistory(newHistory);
  }, [site, history, historyIndex]);

  // Undo handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setSite(JSON.parse(JSON.stringify(history[historyIndex - 1])));
      setHasChanges(true);
      setPreviewRefreshKey((k) => k + 1);
    }
  }, [history, historyIndex]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setSite(JSON.parse(JSON.stringify(history[historyIndex + 1])));
      setHasChanges(true);
      setPreviewRefreshKey((k) => k + 1);
    }
  }, [history, historyIndex]);

  // Refresh preview handler
  const handleRefreshPreview = useCallback(() => {
    setPreviewRefreshKey((k) => k + 1);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      description: 'Save changes',
      callback: () => {
        if (hasChanges && !isSaving) {
          handleSave();
        }
      },
    },
    {
      key: 'z',
      ctrl: true,
      shift: false,
      description: 'Undo',
      callback: handleUndo,
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      description: 'Redo',
      callback: handleRedo,
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Toggle preview',
      callback: () => setShowPreview((prev) => !prev),
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh preview',
      callback: handleRefreshPreview,
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Toggle editor',
      callback: () => setShowPreview((prev) => !prev),
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      callback: () => setShowShortcutsHelp(true),
    },
  ]);

  // Auto-save effect
  useEffect(() => {
    if (!hasChanges || !autoSaveEnabled || !site) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save (2 seconds after last change)
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasChanges, site, autoSaveEnabled]);

  // Refresh preview when site changes
  useEffect(() => {
    if (site && !hasChanges) {
      setPreviewRefreshKey((k) => k + 1);
    }
  }, [site?.sections, site?.theme, hasChanges]);

  const fetchSite = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      if (data.site) {
        setSite(data.site);
      } else {
        router.push('/sites');
      }
    } catch {
      router.push('/sites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!site) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: site.siteName,
          tagline: site.tagline,
          siteTitle: site.siteTitle,
          metaDescription: site.metaDescription,
          socialLinks: site.socialLinks,
          bookingEmail: site.bookingEmail,
          publicEmail: site.publicEmail,
          theme: site.theme,
        }),
      });

      if (response.ok) {
        setHasChanges(false);
        setLastSaved(new Date());
        setSaveMessage('Saved!');
        setPreviewRefreshKey((k) => k + 1);
        saveToHistory();
        setTimeout(() => setSaveMessage(''), 2000);
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      setSaveError('Failed to save. Check your connection.');
      setSaveMessage('Error saving');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder sections handler for drag & drop
  const handleReorderSections = async (newSections: SiteSection[]) => {
    if (!site) return;

    setSite({ ...site, sections: newSections });
    setHasChanges(true);

    // Save the new order to the server
    try {
      for (const section of newSections) {
        await fetch('/api/sites/sections', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: section.id,
            order: section.order,
          }),
        });
      }
      setPreviewRefreshKey((k) => k + 1);
    } catch (error) {
      console.error('Failed to save section order:', error);
    }
  };

  // Edit section handler
  const handleEditSection = (section: SiteSection) => {
    setEditingSection(section);
  };

  // Save section handler
  const handleSaveSection = async (updatedSection: SiteSection) => {
    try {
      const response = await fetch('/api/sites/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedSection.id,
          content: updatedSection.content,
          animation: updatedSection.animation,
        }),
      });

      if (response.ok) {
        // Update local state
        setSite((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
          };
        });
        setPreviewRefreshKey((k) => k + 1);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Failed to save section:', error);
    }
  };

  const handlePublish = async () => {
    if (!site) return;
    setIsPublishing(true);

    try {
      const response = await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: site.status === 'published' ? 'draft' : 'published',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSite(data.site);
      }
    } catch {
      // Handle error
    } finally {
      setIsPublishing(false);
    }
  };

  const updateSite = (updates: Partial<Site>) => {
    if (!site) return;
    setSite({ ...site, ...updates });
    setHasChanges(true);
  };

  const handleTemplateChange = async (templateId: string, keepTheme: boolean) => {
    if (!site) return;

    try {
      // Fetch template theme
      const response = await fetch(`/api/sites/templates/${templateId}`);
      const { theme: newTheme } = await response.json();

      const updatedTheme = keepTheme
        ? { ...newTheme, ...(site.theme || {}) } // Merge keeping custom settings
        : newTheme; // Replace completely

      await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          theme: updatedTheme,
        }),
      });

      setSite({ ...site, templateId, theme: updatedTheme as Record<string, unknown> | null });
      setPreviewRefreshKey((k) => k + 1);
    } catch (error) {
      console.error('Failed to change template:', error);
      throw error;
    }
  };

  const moveSectionUp = async (sectionId: string) => {
    if (!site) return;
    const sections = [...site.sections];
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index > 0) {
      [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
      sections[index - 1].order = index - 1;
      sections[index].order = index;
      setSite({ ...site, sections });

      // Save to server
      await fetch('/api/sites/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sectionId, order: index - 1 }),
      });
    }
  };

  const moveSectionDown = async (sectionId: string) => {
    if (!site) return;
    const sections = [...site.sections];
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      sections[index].order = index;
      sections[index + 1].order = index + 1;
      setSite({ ...site, sections });

      // Save to server
      await fetch('/api/sites/sections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sectionId, order: index + 1 }),
      });
    }
  };

  const toggleSectionVisibility = async (sectionId: string) => {
    if (!site) return;
    const sections = site.sections.map((s) =>
      s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
    );
    setSite({ ...site, sections });

    const section = sections.find((s) => s.id === sectionId);
    await fetch('/api/sites/sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sectionId, isVisible: section?.isVisible }),
    });
  };

  const deleteSection = async (sectionId: string) => {
    if (!site || !confirm('Delete this section?')) return;

    const sections = site.sections.filter((s) => s.id !== sectionId);
    setSite({ ...site, sections });

    await fetch(`/api/sites/sections?id=${sectionId}`, {
      method: 'DELETE',
    });
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (!site) {
    return null;
  }

  const tabs = [
    { id: 'sections', label: 'Sections', icon: Layers },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'domain', label: 'Domain', icon: Link },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Top Bar */}
      <div
        className="flex flex-shrink-0 items-center justify-between px-4 py-3"
        style={{
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/sites')}
            className="rounded-lg p-2 transition-colors hover:bg-white/5"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-semibold" style={{ color: 'var(--text)' }}>
              {site.siteName || 'My Website'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {site.subdomain}.cronkwaters.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
            {!isOnline ? (
              <>
                <WifiOff size={14} className="text-red-400" />
                <span className="text-red-400">Offline</span>
              </>
            ) : autoSaveEnabled ? (
              <>
                <Cloud size={14} className="text-green-400" />
                <span>{hasChanges ? 'Saving...' : formatLastSaved() || 'Auto-save on'}</span>
              </>
            ) : (
              <>
                <CloudOff size={14} />
                <span>Auto-save off</span>
              </>
            )}
          </div>

          {saveError && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle size={14} />
              {saveError}
            </span>
          )}

          {saveMessage && !saveError && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <Check size={14} />
              {saveMessage}
            </span>
          )}

          {/* Undo/Redo Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="rounded-lg p-2 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ color: 'var(--muted)' }}
              title="Undo (Cmd/Ctrl+Z)"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="rounded-lg p-2 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ color: 'var(--muted)' }}
              title="Redo (Cmd/Ctrl+Shift+Z)"
            >
              <Redo size={16} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px" style={{ background: 'var(--border)' }} />

          {/* Help Button */}
          <button
            onClick={() => setShowShortcutsHelp(true)}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle size={16} />
          </button>

          {/* Toggle Preview Button */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
            style={{
              background: showPreview ? 'var(--accent)' : 'var(--bg)',
              color: showPreview ? '#fff' : 'var(--muted)',
              border: showPreview ? 'none' : '1px solid var(--border)',
            }}
            title={showPreview ? 'Hide Preview (Cmd/Ctrl+P)' : 'Show Preview (Cmd/Ctrl+P)'}
          >
            {showPreview ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            Preview
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges || !isOnline}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              background: hasChanges ? 'var(--accent)' : 'var(--bg)',
              color: hasChanges ? '#fff' : 'var(--muted)',
              border: hasChanges ? 'none' : '1px solid var(--border)',
            }}
            title="Save (Cmd/Ctrl+S)"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              site.status === 'published'
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            {site.status === 'published' ? 'Published' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-shrink-0 gap-2 px-4 py-2"
        style={{
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content - Split Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div
          className={`flex-shrink-0 overflow-y-auto transition-all duration-300 ${
            showPreview ? 'w-1/2' : 'w-full'
          }`}
          style={{ borderRight: showPreview ? '1px solid var(--border)' : 'none' }}
        >
          <div className="mx-auto max-w-2xl p-6">
            {activeTab === 'sections' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    Page Sections
                  </h2>
                  <button
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                    style={{
                      background: 'var(--accent)',
                      color: '#fff',
                    }}
                  >
                    <Plus size={16} />
                    Add Section
                  </button>
                </div>
                <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
                  Drag and drop to reorder sections
                </p>
                <DraggableSections
                  sections={site.sections}
                  onReorder={handleReorderSections}
                  onToggleVisibility={toggleSectionVisibility}
                  onDelete={deleteSection}
                  onEdit={handleEditSection}
                />
              </div>
            )}

            {activeTab === 'pages' && <PagesTab site={site} onUpdate={() => fetchSite()} />}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                <TemplateSwitcher
                  currentTemplateId={site.templateId}
                  currentTheme={site.theme as Record<string, unknown> | undefined}
                  onTemplateChange={handleTemplateChange}
                />
                <ThemeTab
                  theme={(site.theme || {}) as Record<string, unknown>}
                  templateId={site.templateId}
                  onChange={(theme) => updateSite({ theme })}
                />
              </div>
            )}

            {activeTab === 'analytics' && <AnalyticsDashboard />}

            {activeTab === 'seo' && (
              <SEOPreview
                siteTitle={site.siteTitle || site.siteName || ''}
                metaDescription={site.metaDescription || ''}
                subdomain={site.subdomain}
                customDomain={site.customDomain}
                siteName={site.siteName || undefined}
              />
            )}

            {activeTab === 'domain' && <DomainSettings />}

            {activeTab === 'settings' && <SettingsTab site={site} onChange={updateSite} />}
          </div>
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="flex-1 overflow-hidden p-4">
            <LivePreview subdomain={site.subdomain} refreshKey={previewRefreshKey} />
          </div>
        )}
      </div>

      {/* Section Editor Modal */}
      <SectionEditor
        section={editingSection}
        isOpen={editingSection !== null}
        onClose={() => setEditingSection(null)}
        onSave={handleSaveSection}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </div>
  );
}

// Sections Tab Component
function SectionsTab({
  sections,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onDelete,
}: {
  sections: SiteSection[];
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const sectionLabels: Record<string, string> = {
    header: 'Header',
    footer: 'Footer',
    hero_image: 'Hero Image',
    hero_video: 'Hero Video',
    music_player: 'Music Player',
    tour_dates: 'Tour Dates',
    bio_split: 'Bio (Split Layout)',
    bio_full: 'Bio (Full Width)',
    band_members: 'Band Members',
    achievements: 'Achievements',
    contact_form: 'Contact Form',
    mailing_list: 'Mailing List',
    social_links: 'Social Links',
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          Page Sections
        </h2>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          style={{
            background: 'var(--accent)',
            color: '#fff',
          }}
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>

      <div className="space-y-3">
        {sortedSections.map((section, index) => (
          <div
            key={section.id}
            className={`flex items-center justify-between rounded-xl p-4 transition-all ${
              section.isVisible ? '' : 'opacity-50'
            }`}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onMoveUp(section.id)}
                  disabled={index === 0}
                  className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
                  style={{ color: 'var(--muted)' }}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => onMoveDown(section.id)}
                  disabled={index === sortedSections.length - 1}
                  className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
                  style={{ color: 'var(--muted)' }}
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div>
                <h3 className="font-medium" style={{ color: 'var(--text)' }}>
                  {sectionLabels[section.type] || section.type}
                </h3>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {section.isVisible ? 'Visible' : 'Hidden'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleVisibility(section.id)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                style={{ color: section.isVisible ? 'var(--accent)' : 'var(--muted)' }}
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => onDelete(section.id)}
                className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Theme Tab Component
function ThemeTab({
  theme,
  templateId,
  onChange,
}: {
  theme: Record<string, unknown>;
  templateId: string;
  onChange: (theme: Record<string, unknown>) => void;
}) {
  const colorFields = [
    { key: 'primaryColor', label: 'Primary Color' },
    { key: 'secondaryColor', label: 'Secondary Color' },
    { key: 'accentColor', label: 'Accent Color' },
    { key: 'textColor', label: 'Text Color' },
    { key: 'mutedColor', label: 'Muted Text' },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--text)' }}>
        Theme Customization
      </h2>

      <div className="space-y-6">
        {/* Current Template */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Template
          </label>
          <p className="text-lg font-bold uppercase" style={{ color: 'var(--text)' }}>
            {templateId}
          </p>
        </div>

        {/* Colors */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
            Colors
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(theme[key] as string) || '#000000'}
                    onChange={(e) => onChange({ ...theme, [key]: e.target.value })}
                    className="h-10 w-10 cursor-pointer rounded"
                  />
                  <input
                    type="text"
                    value={(theme[key] as string) || ''}
                    onChange={(e) => onChange({ ...theme, [key]: e.target.value })}
                    className="flex-1 rounded-lg px-3 py-2 text-sm"
                    style={{
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
            Typography
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
                Heading Font
              </label>
              <input
                type="text"
                value={(theme.fontHeading as string) || ''}
                onChange={(e) => onChange({ ...theme, fontHeading: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
                placeholder="Playfair Display"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
                Body Font
              </label>
              <input
                type="text"
                value={(theme.fontBody as string) || ''}
                onChange={(e) => onChange({ ...theme, fontBody: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
                placeholder="Inter"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({
  site,
  onChange,
}: {
  site: Site;
  onChange: (updates: Partial<Site>) => void;
}) {
  const socialPlatforms = [
    'spotify',
    'apple',
    'youtube',
    'instagram',
    'twitter',
    'tiktok',
    'facebook',
    'bandcamp',
    'soundcloud',
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
        Site Settings
      </h2>

      {/* Basic Info */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
          Basic Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Site Name
            </label>
            <input
              type="text"
              value={site.siteName || ''}
              onChange={(e) => onChange({ siteName: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Your Band Name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Tagline
            </label>
            <input
              type="text"
              value={site.tagline || ''}
              onChange={(e) => onChange({ tagline: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Rock & Roll Since 2015"
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
          SEO Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Page Title (for Google)
            </label>
            <input
              type="text"
              value={site.siteTitle || ''}
              onChange={(e) => onChange({ siteTitle: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Band Name | Official Website"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Meta Description
            </label>
            <textarea
              value={site.metaDescription || ''}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="A brief description for search engines..."
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
          Social Links
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {socialPlatforms.map((platform) => (
            <div key={platform}>
              <label className="mb-2 block text-sm capitalize" style={{ color: 'var(--muted)' }}>
                {platform}
              </label>
              <input
                type="url"
                value={(site.socialLinks as Record<string, string>)?.[platform] || ''}
                onChange={(e) =>
                  onChange({
                    socialLinks: {
                      ...(site.socialLinks || {}),
                      [platform]: e.target.value,
                    },
                  })
                }
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
        }}
      >
        <h3 className="mb-4 font-medium" style={{ color: 'var(--text)' }}>
          Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Booking Email
            </label>
            <input
              type="email"
              value={site.bookingEmail || ''}
              onChange={(e) => onChange({ bookingEmail: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="booking@yourband.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm" style={{ color: 'var(--muted)' }}>
              Public Email
            </label>
            <input
              type="email"
              value={site.publicEmail || ''}
              onChange={(e) => onChange({ publicEmail: e.target.value })}
              className="w-full rounded-lg px-3 py-2"
              style={{
                background: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="info@yourband.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Pages Tab Component
function PagesTab({ site, onUpdate }: { site: Site; onUpdate: () => void }) {
  const [pages, setPages] = useState<
    Array<{
      id: string;
      slug: string;
      title: string;
      isHomepage: boolean;
      isVisible: boolean;
      order: number;
      sectionCount?: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/sites/pages');
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageAdd = async (page: Omit<(typeof pages)[0], 'id' | 'sectionCount'>) => {
    try {
      const response = await fetch('/api/sites/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create page');
      }

      await fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Failed to add page:', error);
      throw error;
    }
  };

  const handlePageUpdate = async (pageId: string, updates: Partial<(typeof pages)[0]>) => {
    try {
      const response = await fetch(`/api/sites/pages?id=${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update page');
      }

      await fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Failed to update page:', error);
      throw error;
    }
  };

  const handlePageDelete = async (pageId: string) => {
    try {
      const response = await fetch(`/api/sites/pages?id=${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      await fetchPages();
      onUpdate();
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  };

  const handlePageReorder = async (reorderedPages: typeof pages) => {
    // Optimistically update UI
    setPages(reorderedPages);

    // Save each page's new order
    try {
      await Promise.all(
        reorderedPages.map((page) =>
          fetch(`/api/sites/pages?id=${page.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: page.order }),
          })
        )
      );
      onUpdate();
    } catch (error) {
      console.error('Failed to reorder pages:', error);
      // Revert on error
      await fetchPages();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <PageManager
      pages={pages}
      onPageAdd={handlePageAdd}
      onPageUpdate={handlePageUpdate}
      onPageDelete={handlePageDelete}
      onPageReorder={handlePageReorder}
    />
  );
}

export default function SiteEditorPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      }
    >
      <SiteEditorContent />
    </Suspense>
  );
}
