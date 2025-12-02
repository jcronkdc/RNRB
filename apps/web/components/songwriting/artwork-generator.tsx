'use client';

import { Button, Card } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Palette,
  Wand2,
  Download,
  Check,
  RefreshCw,
  AlertCircle,
  Loader2,
  Crown,
  Zap,
} from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

interface ArtworkGeneratorProps {
  songId?: string;
  songTitle?: string;
  artistName?: string;
  genre?: string;
  mood?: string;
  currentArtwork?: string;
  onArtworkSelect?: (url: string, prompt: string, style: string) => void;
  className?: string;
}

interface StylePreset {
  id: string;
  name: string;
}

interface ModelOption {
  id: string;
  name: string;
  credits: number;
  description: string;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
}

export function ArtworkGenerator({
  songId,
  songTitle,
  artistName,
  genre,
  mood,
  currentArtwork,
  onArtworkSelect,
  className = '',
}: ArtworkGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('minimalist-modern');
  const [quality, setQuality] = useState<'draft' | 'standard' | 'premium'>('draft');
  const [imageCount, setImageCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);

  // Fetch available styles and models on mount
  useEffect(() => {
    async function fetchOptions() {
      try {
        const response = await fetch('/api/artwork/generate');
        if (response.ok) {
          const data = await response.json();
          setStyles(data.styles || []);
          setModels(data.models || []);
        }
      } catch (err) {
        console.error('Failed to fetch artwork options:', err);
      }
    }
    fetchOptions();
  }, []);

  // Calculate total credits needed
  const creditsNeeded = (models.find((m) => m.id === quality)?.credits || 1) * imageCount;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe what you want for your album artwork');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setSelectedImage(null);

    try {
      const response = await fetch('/api/artwork/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          quality,
          count: imageCount,
          songTitle,
          artistName,
          genre,
          mood,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError('Upgrade to Creator or Studio plan to generate album artwork');
        } else if (response.status === 429) {
          setError(`Image credits exceeded. ${data.message || 'Upgrade for more credits.'}`);
        } else {
          setError(data.error || 'Failed to generate artwork');
        }
        return;
      }

      const images: GeneratedImage[] = data.images.map((url: string) => ({
        url,
        prompt: data.prompt,
        style: data.style,
      }));

      setGeneratedImages(images);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate artwork. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (image: GeneratedImage) => {
    setSelectedImage(image.url);
    onArtworkSelect?.(image.url, image.prompt, image.style);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${songTitle || 'album'}-artwork.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const styleGroups = [
    { title: 'Classic', styles: ['vinyl-classic', 'hand-drawn', 'nature-organic'] },
    { title: 'Modern', styles: ['minimalist-modern', 'abstract-art', 'dreamy-ethereal'] },
    { title: 'Bold', styles: ['neon-glow', 'psychedelic', 'grunge-rock'] },
    { title: 'Genre', styles: ['dark-moody', 'hip-hop', 'photorealistic'] },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">AI Album Art Generator</h3>
          <p className="text-sm text-muted-foreground">Create unique artwork for your music</p>
        </div>
      </div>

      {/* Main Input */}
      <Card className="rnrb-card p-6">
        <label className="mb-2 block text-sm font-medium">Describe your vision</label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A lonely figure standing in rain on a city street at night, reflections on wet pavement..."
            className="bg-panel min-h-[100px] w-full resize-none rounded-xl border border-border p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          />
          <Wand2 className="absolute right-4 top-4 h-5 w-5 text-gray-500" />
        </div>

        {/* Song context pills */}
        {(songTitle || genre || mood) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {songTitle && (
              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                {songTitle}
              </span>
            )}
            {genre && (
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                {genre}
              </span>
            )}
            {mood && (
              <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs text-pink-300">
                {mood}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Style Selection */}
      <Card className="rnrb-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4" />
            Art Style
          </label>
        </div>

        <div className="space-y-4">
          {styleGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.title}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.styles.map((styleId) => {
                  const styleDef = styles.find((s) => s.id === styleId);
                  if (!styleDef) return null;
                  return (
                    <button
                      key={styleId}
                      onClick={() => setSelectedStyle(styleId)}
                      className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                        selectedStyle === styleId
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'hover:bg-panel border-border hover:border-border/80'
                      }`}
                    >
                      {styleDef.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quality & Count */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Quality Selection */}
        <Card className="rnrb-card p-4">
          <label className="mb-3 block text-sm font-medium">Quality</label>
          <div className="space-y-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setQuality(model.id as 'draft' | 'standard' | 'premium')}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  quality === model.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'hover:bg-panel border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {model.id === 'premium' && <Crown className="h-4 w-4 text-yellow-400" />}
                    {model.id === 'standard' && <Zap className="h-4 w-4 text-blue-400" />}
                    <span className="font-medium">{model.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {model.credits} credit{model.credits > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{model.description}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Image Count */}
        <Card className="rnrb-card p-4">
          <label className="mb-3 block text-sm font-medium">Number of Options</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setImageCount(num)}
                className={`rounded-lg border py-3 text-center font-medium transition-all ${
                  imageCount === num
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'hover:bg-panel border-border'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Total: <span className="font-semibold text-purple-400">{creditsNeeded} credits</span>
          </p>
        </Card>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="rnrb-button-primary w-full rounded-xl py-4 font-semibold"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating {imageCount} artwork{imageCount > 1 ? 's' : ''}...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Artwork ({creditsNeeded} credits)
          </>
        )}
      </Button>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-red-500/10 p-4 text-red-400"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Images Gallery */}
      <AnimatePresence>
        {generatedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Generated Artwork</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-sm"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>

            <div
              className={`grid gap-4 ${generatedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
            >
              {generatedImages.map((image, index) => (
                <motion.div
                  key={image.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === image.url
                      ? 'border-purple-500 ring-2 ring-purple-500/30'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Generated artwork ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="sm"
                      onClick={() => handleSelect(image)}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Select
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(image.url)}
                      className="bg-white/10 hover:bg-white/20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Selected indicator */}
                  {selectedImage === image.url && (
                    <div className="absolute right-2 top-2 rounded-full bg-purple-500 p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Artwork Preview */}
      {currentArtwork && !generatedImages.length && (
        <Card className="rnrb-card p-4">
          <label className="mb-2 block text-sm font-medium">Current Artwork</label>
          <div className="relative aspect-square w-32 overflow-hidden rounded-xl">
            <img
              src={currentArtwork}
              alt="Current artwork"
              className="h-full w-full object-cover"
            />
          </div>
        </Card>
      )}
    </div>
  );
}

export default ArtworkGenerator;
