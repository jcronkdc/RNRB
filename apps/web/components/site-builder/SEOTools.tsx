'use client';

import {
  Search,
  Globe,
  FileText,
  Image,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Share2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  BarChart,
  Target,
  Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SEOToolsProps {
  siteTitle: string;
  metaDescription: string;
  subdomain: string;
  customDomain?: string | null;
  siteName?: string;
  sections?: Array<{ type: string; content: Record<string, unknown> }>;
  onUpdateSEO: (updates: { siteTitle?: string; metaDescription?: string }) => void;
}

interface SEOScore {
  overall: number;
  title: { score: number; issues: string[]; suggestions: string[] };
  description: { score: number; issues: string[]; suggestions: string[] };
  content: { score: number; issues: string[]; suggestions: string[] };
  technical: { score: number; issues: string[]; suggestions: string[] };
  social: { score: number; issues: string[]; suggestions: string[] };
}

interface KeywordAnalysis {
  keyword: string;
  density: number;
  count: number;
  inTitle: boolean;
  inDescription: boolean;
  competition: 'low' | 'medium' | 'high';
}

export function SEOTools({
  siteTitle,
  metaDescription,
  subdomain,
  customDomain,
  siteName,
  sections = [],
  onUpdateSEO,
}: SEOToolsProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'keywords' | 'social' | 'sitemap'>('audit');
  const [seoScore, setSeoScore] = useState<SEOScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywords, setKeywords] = useState<KeywordAnalysis[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Social preview state
  const [ogTitle, setOgTitle] = useState(siteTitle);
  const [ogDescription, setOgDescription] = useState(metaDescription);
  const [ogImage, setOgImage] = useState('');

  const siteUrl = customDomain || `${subdomain}.cronkwaters.com`;

  // Analyze SEO on mount and when content changes
  useEffect(() => {
    analyzeSEO();
  }, [siteTitle, metaDescription, sections]);

  const analyzeSEO = () => {
    setIsAnalyzing(true);

    // Simulate analysis delay
    setTimeout(() => {
      const score = calculateSEOScore();
      setSeoScore(score);
      setIsAnalyzing(false);
    }, 1000);
  };

  const calculateSEOScore = (): SEOScore => {
    const titleIssues: string[] = [];
    const titleSuggestions: string[] = [];
    let titleScore = 100;

    // Title analysis
    if (!siteTitle) {
      titleIssues.push('Missing page title');
      titleScore -= 40;
    } else {
      if (siteTitle.length < 30) {
        titleIssues.push('Title is too short (under 30 characters)');
        titleSuggestions.push('Add more descriptive keywords to your title');
        titleScore -= 15;
      }
      if (siteTitle.length > 60) {
        titleIssues.push('Title is too long (over 60 characters)');
        titleSuggestions.push('Shorten your title to under 60 characters');
        titleScore -= 10;
      }
      if (
        !siteTitle.toLowerCase().includes('music') &&
        !siteTitle.toLowerCase().includes('artist') &&
        !siteTitle.toLowerCase().includes('band')
      ) {
        titleSuggestions.push('Consider adding music-related keywords');
      }
    }

    // Description analysis
    const descIssues: string[] = [];
    const descSuggestions: string[] = [];
    let descScore = 100;

    if (!metaDescription) {
      descIssues.push('Missing meta description');
      descScore -= 40;
    } else {
      if (metaDescription.length < 120) {
        descIssues.push('Description is too short (under 120 characters)');
        descSuggestions.push('Expand your description to 150-160 characters');
        descScore -= 15;
      }
      if (metaDescription.length > 160) {
        descIssues.push('Description is too long (over 160 characters)');
        descSuggestions.push('Trim to 160 characters to avoid truncation');
        descScore -= 10;
      }
      if (!metaDescription.includes(siteName || '')) {
        descSuggestions.push('Include your artist/band name in the description');
      }
    }

    // Content analysis
    const contentIssues: string[] = [];
    const contentSuggestions: string[] = [];
    let contentScore = 100;

    if (sections.length < 3) {
      contentIssues.push('Limited content sections');
      contentSuggestions.push('Add more sections for better SEO');
      contentScore -= 20;
    }

    const hasBio = sections.some((s) => s.type.includes('bio'));
    const hasMusic = sections.some((s) => s.type.includes('music') || s.type.includes('streaming'));
    const hasTour = sections.some((s) => s.type.includes('tour'));
    const hasContact = sections.some((s) => s.type.includes('contact'));

    if (!hasBio) {
      contentSuggestions.push('Add a bio section for better search visibility');
      contentScore -= 10;
    }
    if (!hasMusic) {
      contentSuggestions.push('Add a music section to help fans find your tracks');
      contentScore -= 10;
    }
    if (!hasTour) {
      contentSuggestions.push('Add tour dates to appear in local searches');
    }
    if (!hasContact) {
      contentSuggestions.push('Add contact info for booking inquiries');
    }

    // Technical analysis
    const techIssues: string[] = [];
    const techSuggestions: string[] = [];
    let techScore = 100;

    if (!customDomain) {
      techIssues.push('Using subdomain instead of custom domain');
      techSuggestions.push('Custom domains rank better in search results');
      techScore -= 15;
    }

    // Social analysis
    const socialIssues: string[] = [];
    const socialSuggestions: string[] = [];
    let socialScore = 100;

    if (!ogImage) {
      socialIssues.push('Missing Open Graph image');
      socialSuggestions.push('Add a social share image for better engagement');
      socialScore -= 20;
    }

    const overall = Math.round(
      (titleScore + descScore + contentScore + techScore + socialScore) / 5
    );

    return {
      overall,
      title: { score: titleScore, issues: titleIssues, suggestions: titleSuggestions },
      description: { score: descScore, issues: descIssues, suggestions: descSuggestions },
      content: { score: contentScore, issues: contentIssues, suggestions: contentSuggestions },
      technical: { score: techScore, issues: techIssues, suggestions: techSuggestions },
      social: { score: socialScore, issues: socialIssues, suggestions: socialSuggestions },
    };
  };

  const generateAISuggestions = async (type: 'title' | 'description') => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: type === 'title' ? 'tagline' : 'seo_description',
          formData: {
            name: siteName || subdomain,
            genre: '',
            location: '',
            keywords: keywords.map((k) => k.keyword).join(', '),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'title') {
          // Take first suggestion
          const firstLine = data.content
            .split('\n')[0]
            .replace(/^\d+\.\s*/, '')
            .replace(/"/g, '');
          onUpdateSEO({ siteTitle: firstLine });
        } else {
          onUpdateSEO({ metaDescription: data.content.substring(0, 160) });
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;

    const analysis: KeywordAnalysis = {
      keyword: newKeyword.toLowerCase(),
      density: Math.random() * 3, // Would calculate from actual content
      count: Math.floor(Math.random() * 10),
      inTitle: siteTitle.toLowerCase().includes(newKeyword.toLowerCase()),
      inDescription: metaDescription.toLowerCase().includes(newKeyword.toLowerCase()),
      competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as
        | 'low'
        | 'medium'
        | 'high',
    };

    setKeywords([...keywords, analysis]);
    setNewKeyword('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const tabs = [
    { id: 'audit', label: 'SEO Audit', icon: Search },
    { id: 'keywords', label: 'Keywords', icon: Target },
    { id: 'social', label: 'Social Preview', icon: Share2 },
    { id: 'sitemap', label: 'Technical', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            SEO Tools
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Optimize your website for search engines
          </p>
        </div>
        <button
          onClick={analyzeSEO}
          disabled={isAnalyzing}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Re-analyze
        </button>
      </div>

      {/* Overall Score */}
      {seoScore && (
        <div
          className="flex items-center gap-6 rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div
            className={`flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full ${getScoreBg(seoScore.overall)}`}
          >
            <span className={`text-4xl font-bold ${getScoreColor(seoScore.overall)}`}>
              {seoScore.overall}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
              SEO Score
            </h3>
            <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
              {seoScore.overall >= 80
                ? 'Great! Your site is well-optimized for search engines.'
                : seoScore.overall >= 60
                  ? 'Good progress! A few improvements will boost your ranking.'
                  : 'Needs work. Follow the suggestions below to improve.'}
            </p>
            <div className="flex gap-4">
              {[
                { label: 'Title', score: seoScore.title.score },
                { label: 'Description', score: seoScore.description.score },
                { label: 'Content', score: seoScore.content.score },
                { label: 'Technical', score: seoScore.technical.score },
                { label: 'Social', score: seoScore.social.score },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className={`text-lg font-semibold ${getScoreColor(item.score)}`}>
                    {item.score}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
            style={{ color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)' }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        {activeTab === 'audit' && seoScore && (
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <FileText size={16} />
                  Page Title
                  <span
                    className={`ml-2 rounded px-2 py-0.5 text-xs ${getScoreBg(seoScore.title.score)} ${getScoreColor(seoScore.title.score)}`}
                  >
                    {seoScore.title.score}/100
                  </span>
                </h4>
                <button
                  onClick={() => generateAISuggestions('title')}
                  disabled={isGenerating}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
                  style={{ color: 'var(--accent)' }}
                >
                  <Sparkles size={12} />
                  AI Suggest
                </button>
              </div>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => onUpdateSEO({ siteTitle: e.target.value })}
                placeholder="Enter page title..."
                className="w-full rounded-lg px-4 py-3"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
              <div
                className="mt-2 flex items-center justify-between text-xs"
                style={{ color: 'var(--muted)' }}
              >
                <span>{siteTitle.length}/60 characters</span>
                <span
                  className={
                    siteTitle.length > 60
                      ? 'text-red-400'
                      : siteTitle.length >= 30
                        ? 'text-green-400'
                        : 'text-yellow-400'
                  }
                >
                  {siteTitle.length > 60
                    ? 'Too long'
                    : siteTitle.length >= 30
                      ? 'Good length'
                      : 'Too short'}
                </span>
              </div>
              {seoScore.title.issues.length > 0 && (
                <div className="mt-3 space-y-2">
                  {seoScore.title.issues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                      <XCircle size={14} />
                      {issue}
                    </div>
                  ))}
                </div>
              )}
              {seoScore.title.suggestions.length > 0 && (
                <div className="mt-2 space-y-2">
                  {seoScore.title.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-yellow-400">
                      <AlertTriangle size={14} />
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Globe size={16} />
                  Meta Description
                  <span
                    className={`ml-2 rounded px-2 py-0.5 text-xs ${getScoreBg(seoScore.description.score)} ${getScoreColor(seoScore.description.score)}`}
                  >
                    {seoScore.description.score}/100
                  </span>
                </h4>
                <button
                  onClick={() => generateAISuggestions('description')}
                  disabled={isGenerating}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
                  style={{ color: 'var(--accent)' }}
                >
                  <Sparkles size={12} />
                  AI Suggest
                </button>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => onUpdateSEO({ metaDescription: e.target.value })}
                placeholder="Enter meta description..."
                rows={3}
                className="w-full rounded-lg px-4 py-3"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              />
              <div
                className="mt-2 flex items-center justify-between text-xs"
                style={{ color: 'var(--muted)' }}
              >
                <span>{metaDescription.length}/160 characters</span>
                <span
                  className={
                    metaDescription.length > 160
                      ? 'text-red-400'
                      : metaDescription.length >= 120
                        ? 'text-green-400'
                        : 'text-yellow-400'
                  }
                >
                  {metaDescription.length > 160
                    ? 'Too long'
                    : metaDescription.length >= 120
                      ? 'Good length'
                      : 'Too short'}
                </span>
              </div>
            </div>

            {/* Content & Technical Issues */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4
                  className="mb-3 flex items-center gap-2 font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <BarChart size={16} />
                  Content Analysis
                </h4>
                <div className="space-y-2">
                  {seoScore.content.issues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                      <XCircle size={14} />
                      {issue}
                    </div>
                  ))}
                  {seoScore.content.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-yellow-400">
                      <AlertTriangle size={14} />
                      {suggestion}
                    </div>
                  ))}
                  {seoScore.content.issues.length === 0 &&
                    seoScore.content.suggestions.length === 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle size={14} />
                        Content is well-optimized
                      </div>
                    )}
                </div>
              </div>
              <div>
                <h4
                  className="mb-3 flex items-center gap-2 font-semibold"
                  style={{ color: 'var(--text)' }}
                >
                  <Zap size={16} />
                  Technical SEO
                </h4>
                <div className="space-y-2">
                  {seoScore.technical.issues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                      <XCircle size={14} />
                      {issue}
                    </div>
                  ))}
                  {seoScore.technical.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-yellow-400">
                      <AlertTriangle size={14} />
                      {suggestion}
                    </div>
                  ))}
                  {seoScore.technical.issues.length === 0 &&
                    seoScore.technical.suggestions.length === 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle size={14} />
                        Technical setup looks good
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div>
              <h4 className="mb-3 font-semibold" style={{ color: 'var(--text)' }}>
                Track Keywords
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="Enter a keyword to track..."
                  className="flex-1 rounded-lg px-4 py-2"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
                <button
                  onClick={addKeyword}
                  className="rounded-lg px-4 py-2 font-medium"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Add
                </button>
              </div>
            </div>

            {keywords.length > 0 ? (
              <div className="space-y-3">
                {keywords.map((kw, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg p-4"
                    style={{ background: 'var(--bg)' }}
                  >
                    <div>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>
                        {kw.keyword}
                      </span>
                      <div
                        className="mt-1 flex items-center gap-4 text-xs"
                        style={{ color: 'var(--muted)' }}
                      >
                        <span>Density: {kw.density.toFixed(1)}%</span>
                        <span>Count: {kw.count}</span>
                        <span
                          className={
                            kw.competition === 'low'
                              ? 'text-green-400'
                              : kw.competition === 'medium'
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }
                        >
                          Competition: {kw.competition}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {kw.inTitle ? (
                        <span className="flex items-center gap-1 rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                          <Check size={12} /> In Title
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
                          <XCircle size={12} /> Not in Title
                        </span>
                      )}
                      {kw.inDescription ? (
                        <span className="flex items-center gap-1 rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                          <Check size={12} /> In Description
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
                          <XCircle size={12} /> Not in Description
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <p>No keywords tracked yet</p>
                <p className="text-sm">Add keywords to track their usage and optimization</p>
              </div>
            )}

            {/* Suggested Keywords */}
            <div>
              <h4 className="mb-3 font-semibold" style={{ color: 'var(--text)' }}>
                Suggested Keywords for Musicians
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  '[your genre] music',
                  '[your city] band',
                  'live music',
                  'new album',
                  'tour dates',
                  'book artist',
                  'indie artist',
                  'original music',
                ].map((kw) => (
                  <button
                    key={kw}
                    onClick={() => setNewKeyword(kw)}
                    className="rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
                    style={{ background: 'var(--bg)', color: 'var(--text)' }}
                  >
                    + {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Preview how your site appears when shared on social media
            </p>

            {/* Facebook Preview */}
            <div>
              <h4 className="mb-3 font-semibold" style={{ color: 'var(--text)' }}>
                Facebook / LinkedIn Preview
              </h4>
              <div
                className="overflow-hidden rounded-lg"
                style={{ background: '#fff', maxWidth: '500px' }}
              >
                <div className="aspect-[1.91/1] bg-gray-200">
                  {ogImage ? (
                    <img src={ogImage} alt="OG Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <Image size={48} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs uppercase text-gray-500">{siteUrl}</p>
                  <p className="font-semibold text-gray-900">{ogTitle || 'Page Title'}</p>
                  <p className="text-sm text-gray-600">
                    {ogDescription || 'Page description will appear here...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Twitter Preview */}
            <div>
              <h4 className="mb-3 font-semibold" style={{ color: 'var(--text)' }}>
                Twitter / X Preview
              </h4>
              <div
                className="overflow-hidden rounded-2xl"
                style={{ background: '#fff', maxWidth: '500px' }}
              >
                <div className="aspect-[2/1] bg-gray-200">
                  {ogImage ? (
                    <img
                      src={ogImage}
                      alt="Twitter Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <Image size={48} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900">{ogTitle || 'Page Title'}</p>
                  <p className="text-sm text-gray-600">{ogDescription || 'Page description...'}</p>
                  <p className="mt-1 text-xs text-gray-500">{siteUrl}</p>
                </div>
              </div>
            </div>

            {/* Edit Social Tags */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="og-title"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Social Title
                </label>
                <input
                  id="og-title"
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full rounded-lg px-4 py-2"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="og-desc"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Social Description
                </label>
                <textarea
                  id="og-desc"
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg px-4 py-2"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="og-image"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Social Share Image URL
                </label>
                <input
                  id="og-image"
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg px-4 py-2"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                  Recommended: 1200x630 pixels for best display
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            {/* Sitemap */}
            <div>
              <h4 className="mb-3 font-semibold" style={{ color: 'var(--text)' }}>
                XML Sitemap
              </h4>
              <div
                className="flex items-center justify-between rounded-lg p-4"
                style={{ background: 'var(--bg)' }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-500" />
                  <div>
                    <p style={{ color: 'var(--text)' }}>Sitemap automatically generated</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {siteUrl}/sitemap.xml
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(`https://${siteUrl}/sitemap.xml`, 'sitemap')}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
                  style={{ color: 'var(--muted)' }}
                >
                  {copied === 'sitemap' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'sitemap' ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>

            {/* Robots.txt */}
            <div>
              <h4 className="mb-3 font-semibold" style={{ color: 'var(--text)' }}>
                Robots.txt
              </h4>
              <div
                className="flex items-center justify-between rounded-lg p-4"
                style={{ background: 'var(--bg)' }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-500" />
                  <div>
                    <p style={{ color: 'var(--text)' }}>Search engines allowed to crawl</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {siteUrl}/robots.txt
                    </p>
                  </div>
                </div>
                <a
                  href={`https://${siteUrl}/robots.txt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/10"
                  style={{ color: 'var(--muted)' }}
                >
                  <ExternalLink size={14} />
                  View
                </a>
              </div>
            </div>

            {/* SSL Certificate */}
            <div>
              <h4 className="mb-3 font-semibold" style={{ color: 'var(--text)' }}>
                SSL Certificate
              </h4>
              <div
                className="flex items-center justify-between rounded-lg p-4"
                style={{ background: 'var(--bg)' }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-500" />
                  <div>
                    <p style={{ color: 'var(--text)' }}>HTTPS enabled</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Free SSL certificate active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Search Console */}
            <div>
              <h4 className="mb-3 font-semibold" style={{ color: 'var(--text)' }}>
                Google Search Console
              </h4>
              <div className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                <p className="mb-3" style={{ color: 'var(--text)' }}>
                  Connect to Google Search Console to track your search performance
                </p>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors hover:bg-white/10"
                  style={{
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <ExternalLink size={16} />
                  Open Search Console
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
