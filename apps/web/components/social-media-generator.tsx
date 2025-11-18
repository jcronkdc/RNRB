'use client';

import { useState } from 'react';
import { Card, Button } from '@cronkwaters/ui';
import { Sparkles, Instagram, Facebook, Twitter, Copy, Check, Loader2, RefreshCw } from 'lucide-react';

type SocialMediaGeneratorProps = {
  songTitle: string;
  projectName: string;
  genre?: string;
  key?: string;
  tempo?: number;
};

export function SocialMediaGenerator({ songTitle, projectName, genre, key, tempo }: SocialMediaGeneratorProps) {
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
            tempo
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      
      // Parse response into multiple post options
      const postOptions = data.content.split('\n\n').filter((p: string) => p.trim().length > 0);
      setPosts(postOptions.slice(0, 5)); // Max 5 options
    } catch (error) {
      setPosts(['AI content generator unavailable. Ensure OPENAI_API_KEY is configured in Vercel environment.']);
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
          className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 mx-auto"
        >
          {generating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating AI Posts...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Social Media Posts</>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
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
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
          </div>

          {posts.map((post, index) => (
            <Card key={index} className="p-6 rnrb-card bg-purple-500/5 border-purple-500/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400">AI DRAFT #{index + 1}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(post, index)}
                    className="text-xs bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1"
                  >
                    {copiedIndex === index ? (
                      <><Check className="w-3 h-3" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {post}
              </p>
              <div className="mt-4 pt-4 border-t border-border flex gap-3">
                <Instagram className="w-5 h-5 text-muted-foreground" />
                <Facebook className="w-5 h-5 text-muted-foreground" />
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          ))}

          <div className="rnrb-card p-4 bg-yellow-500/5 border-yellow-500/20">
            <p className="text-xs text-muted-foreground">
              <strong className="text-yellow-500">⚠️ Important:</strong> These are AI-generated drafts. 
              Edit to match your voice and ensure accuracy before posting. Share with your team for feedback using the chat feature.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

