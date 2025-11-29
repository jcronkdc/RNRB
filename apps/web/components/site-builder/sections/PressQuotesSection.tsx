'use client';

import { Quote, Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface PressQuote {
  id: string;
  quote: string;
  source: string;
  publication?: string;
  author?: string;
  date?: string;
  rating?: number;
  maxRating?: number;
  url?: string;
  logo?: string;
  featured?: boolean;
}

interface PressQuotesSectionProps {
  content: {
    headline?: string;
    subheadline?: string;
    quotes?: PressQuote[];
    showRatings?: boolean;
    showDates?: boolean;
    layout?: 'grid' | 'carousel' | 'list';
    maxVisible?: number;
  };
  theme?: Record<string, unknown>;
}

export function PressQuotesSection({ content, theme }: PressQuotesSectionProps) {
  const {
    headline = 'Press',
    subheadline = 'What people are saying',
    quotes = [],
    showRatings = true,
    showDates = true,
    layout = 'grid',
    maxVisible = 6,
  } = content;

  const accentColor = (theme?.accent as string) || '#f97316';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const featuredQuotes = quotes.filter((q) => q.featured);
  const displayQuotes = showAll ? quotes : quotes.slice(0, maxVisible);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  const renderRating = (rating: number, maxRating: number = 5) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < rating ? accentColor : 'transparent'}
            style={{ color: i < rating ? accentColor : 'var(--muted)' }}
          />
        ))}
        <span className="ml-2 text-sm" style={{ color: 'var(--muted)' }}>
          {rating}/{maxRating}
        </span>
      </div>
    );
  };

  const QuoteCard = ({
    quote,
    size = 'normal',
  }: {
    quote: PressQuote;
    size?: 'featured' | 'normal';
  }) => (
    <div
      className={`relative rounded-2xl p-6 ${size === 'featured' ? 'md:p-8' : ''}`}
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Quote Icon */}
      <Quote
        size={size === 'featured' ? 48 : 32}
        className="absolute right-4 top-4 opacity-10"
        style={{ color: accentColor }}
      />

      {/* Publication Logo */}
      {quote.logo && (
        <div className="mb-4">
          <img
            src={quote.logo}
            alt={quote.publication || quote.source}
            className="h-8 object-contain"
            style={{ filter: 'brightness(0) invert(1) opacity(0.7)' }}
          />
        </div>
      )}

      {/* Quote Text */}
      <blockquote
        className={`relative z-10 italic ${size === 'featured' ? 'text-xl md:text-2xl' : 'text-lg'}`}
        style={{ color: 'var(--text)' }}
      >
        &ldquo;{quote.quote}&rdquo;
      </blockquote>

      {/* Rating */}
      {showRatings && quote.rating && (
        <div className="mt-4">{renderRating(quote.rating, quote.maxRating)}</div>
      )}

      {/* Source */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <cite className="not-italic">
            <span className="font-semibold" style={{ color: 'var(--text)' }}>
              {quote.source}
            </span>
            {quote.publication && (
              <span style={{ color: 'var(--muted)' }}> — {quote.publication}</span>
            )}
          </cite>
          {showDates && quote.date && (
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              {quote.date}
            </p>
          )}
        </div>
        {quote.url && (
          <a
            href={quote.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 transition-colors hover:bg-white/5"
            style={{ color: 'var(--muted)' }}
          >
            <ExternalLink size={18} />
          </a>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold" style={{ color: 'var(--text)' }}>
            {headline}
          </h1>
          <p className="text-xl" style={{ color: 'var(--muted)' }}>
            {subheadline}
          </p>
        </div>

        {/* Featured Quotes */}
        {featuredQuotes.length > 0 && layout !== 'carousel' && (
          <div className="mb-8">
            {featuredQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} size="featured" />
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {layout === 'carousel' && (
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {quotes.map((quote) => (
                  <div key={quote.id} className="w-full flex-shrink-0 px-4">
                    <QuoteCard quote={quote} size="featured" />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            {quotes.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full p-3 transition-colors hover:bg-white/10"
                  style={{ background: 'var(--panel)', color: 'var(--text)' }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-3 transition-colors hover:bg-white/10"
                  style={{ background: 'var(--panel)', color: 'var(--text)' }}
                >
                  <ChevronRight size={24} />
                </button>

                {/* Dots */}
                <div className="mt-6 flex justify-center gap-2">
                  {quotes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentIndex ? 'w-8' : 'w-2'
                      }`}
                      style={{
                        background: i === currentIndex ? accentColor : 'var(--muted)',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Grid Layout */}
        {layout === 'grid' && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayQuotes
                .filter((q) => !q.featured)
                .map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} />
                ))}
            </div>

            {/* Show More */}
            {!showAll && quotes.length > maxVisible && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="rounded-xl px-6 py-3 font-medium transition-colors hover:bg-white/5"
                  style={{ background: 'var(--panel)', color: 'var(--text)' }}
                >
                  Show All {quotes.length} Reviews
                </button>
              </div>
            )}
          </>
        )}

        {/* List Layout */}
        {layout === 'list' && (
          <div className="space-y-6">
            {displayQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}

            {/* Show More */}
            {!showAll && quotes.length > maxVisible && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="rounded-xl px-6 py-3 font-medium transition-colors hover:bg-white/5"
                  style={{ background: 'var(--panel)', color: 'var(--text)' }}
                >
                  Show All {quotes.length} Reviews
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {quotes.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--muted)' }}>
            <Quote size={48} className="mx-auto mb-4 opacity-50" />
            <p>No press quotes yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
