'use client';

import { Card, Button } from '@cronkwaters/ui';
import {
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

type SocialMediaGeneratorProps = {
  songTitle: string;
  projectName: string;
  genre?: string;
  key?: string;
  tempo?: number;
};

export function SocialMediaGenerator({
  songTitle,
  projectName,
  genre,
  key,
  tempo,
}: SocialMediaGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generatePosts = async () => {
    setGenerating(true);
    setPosts([]);

    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'social',
          context: {
            songTitle,
            projectName,
            genre,
            key,
            tempo,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();

      // Parse response into multiple post options
      const postOptions = data.content.split('\n\n').filter((p: string) => p.trim().length > 0);
      setPosts(postOptions.slice(0, 5)); // Max 5 options
    } catch (error) {
      setPosts([
        'AI content generator unavailable. Ensure OPENAI_API_KEY is configured in Vercel environment.',
      ]);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={generatePosts}
          disabled={generating}
          className="rnrb-button-primary mx-auto flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Generating AI Posts...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" /> Generate Social Media Posts
            </>
          )}
        </Button>
        <p className="text-muted-foreground mt-3 text-xs">
          AI will generate 5 caption options for Instagram, Facebook, and Twitter
        </p>
      </div>

      {/* Generated Posts */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">AI-Generated Post Options</h4>
            <Button
              onClick={generatePosts}
              size="sm"
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          </div>

          {posts.map((post, index) => (
            <Card key={index} className="rnrb-card border-purple-500/20 bg-purple-500/5 p-6">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400">
                    AI DRAFT #{index + 1}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(post, index)}
                    className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-3 w-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{post}</p>
              <div className="border-border mt-4 flex gap-3 border-t pt-4">
                <Instagram className="text-muted-foreground h-5 w-5" />
                <Facebook className="text-muted-foreground h-5 w-5" />
                <Twitter className="text-muted-foreground h-5 w-5" />
              </div>
            </Card>
          ))}

          <div className="rnrb-card border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-muted-foreground text-xs">
              <strong className="text-yellow-500">⚠️ Important:</strong> These are AI-generated
              drafts. Edit to match your voice and ensure accuracy before posting. Share with your
              team for feedback using the chat feature.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
