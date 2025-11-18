'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Music, Users, Play, Download, RefreshCw, Sliders } from 'lucide-react';
import { Button, Card } from '@cronkwaters/ui';
import { useChannel } from '@ably/ably-react';

type CollaborativeAIMusicProps = {
  projectSlug: string;
  projectName: string;
  collaborators: Array<{ id: string; email: string; role: string }>;
};

type AIGenerationState = 'idle' | 'generating_lyrics' | 'generating_stems' | 'ready';

type StemType = 'vocals' | 'drums' | 'bass' | 'guitar' | 'synth';

interface Stem {
  type: StemType;
  url: string | null;
  isAI: boolean;
  uploadedBy?: string;
  status: 'generating' | 'ready' | 'replaced';
}

interface MusicSession {
  id: string;
  prompt: string;
  mood?: string;
  title: string;
  lyrics: string;
  stems: Stem[];
  status: AIGenerationState;
  collaborators: string[];
  createdBy: string;
  createdAt: string;
}

export function CollaborativeAIMusic({ projectSlug, projectName, collaborators }: CollaborativeAIMusicProps) {
  const [session, setSession] = useState<MusicSession | null>(null);
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState<string[]>([]);
  const [selectedStem, setSelectedStem] = useState<StemType | null>(null);
  const isLocalUpdate = useRef(false);

  // Real-time collaboration state sync via Ably
  const channelName = `ai-music-${projectSlug}`;

  // Subscribe to real-time session updates
  const { channel } = useChannel(channelName, (message) => {
    // Only update if this is a remote change (not from this client)
    if (message.name === 'session-update' && !isLocalUpdate.current) {
      setSession(message.data);
    }
    if (message.name === 'stem-update' && !isLocalUpdate.current) {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stems: prev.stems.map(s => 
            s.type === message.data.stemType 
              ? { ...s, ...message.data.updates }
              : s
          )
        };
      });
    }
  });

  // Broadcast session changes to other collaborators
  const broadcastSessionUpdate = useCallback((newSession: MusicSession) => {
    isLocalUpdate.current = true;
    channel?.publish('session-update', newSession);
    setTimeout(() => {
      isLocalUpdate.current = false;
    }, 100);
  }, [channel]);

  const broadcastStemUpdate = useCallback((stemType: StemType, updates: Partial<Stem>) => {
    isLocalUpdate.current = true;
    channel?.publish('stem-update', { stemType, updates });
    setTimeout(() => {
      isLocalUpdate.current = false;
    }, 100);
  }, [channel]);

  const startNewSession = async () => {
    if (!prompt.trim() || !title.trim()) return;

    setIsGenerating(true);
    const newSession: MusicSession = {
      id: `session_${Date.now()}`,
      prompt,
      mood,
      title,
      lyrics: '',
      stems: [
        { type: 'vocals', url: null, isAI: true, status: 'generating' },
        { type: 'drums', url: null, isAI: true, status: 'generating' },
        { type: 'bass', url: null, isAI: true, status: 'generating' },
        { type: 'guitar', url: null, isAI: true, status: 'generating' },
        { type: 'synth', url: null, isAI: true, status: 'generating' },
      ],
      status: 'generating_lyrics',
      collaborators: collaborators.map(c => c.id),
      createdBy: 'current-user', // TODO: Get from session
      createdAt: new Date().toISOString(),
    };

    setSession(newSession);
    broadcastSessionUpdate(newSession);

    try {
      // Step 1: Generate lyrics with OpenAI
      const lyricsResponse = await fetch('/api/ai-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId: null }),
      });

      const { lyrics: generatedLyrics } = await lyricsResponse.json();
      const lyricsText = typeof generatedLyrics === 'string' 
        ? generatedLyrics 
        : JSON.stringify(generatedLyrics, null, 2);

      const updatedSession = { ...newSession, lyrics: lyricsText, status: 'generating_stems' as AIGenerationState };
      setSession(updatedSession);
      broadcastSessionUpdate(updatedSession);

      // Step 2: Generate AI stems (mock for now, will integrate real AI music API)
      // In production: Use Suno API, Udio, or MusicGen
      const stemPromises = newSession.stems.map(async (stem) => {
        // Simulate stem generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          ...stem,
          url: `/api/mock-stem/${newSession.id}/${stem.type}`,
          status: 'ready' as const,
        };
      });

      const generatedStems = await Promise.all(stemPromises);
      
      const finalSession = {
        ...newSession,
        lyrics: lyricsText,
        stems: generatedStems,
        status: 'ready' as AIGenerationState
      };
      setSession(finalSession);
      broadcastSessionUpdate(finalSession);

    } catch (error) {
      console.error('AI music generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateStem = async (stemType: StemType) => {
    if (!session) return;

    // Broadcast that this stem is regenerating
    broadcastStemUpdate(stemType, { status: 'generating' });
    
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        stems: prev.stems.map(s => 
          s.type === stemType 
            ? { ...s, status: 'generating' as const } 
            : s
        )
      };
    });

    // Simulate regeneration
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newStemData = {
      url: `/api/mock-stem/${session.id}/${stemType}-v2`,
      status: 'ready' as const
    };

    // Broadcast the regenerated stem
    broadcastStemUpdate(stemType, newStemData);

    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        stems: prev.stems.map(s => 
          s.type === stemType 
            ? { ...s, ...newStemData } 
            : s
        )
      };
    });
  };

  const replaceStemWithHuman = async (stemType: StemType, file: File) => {
    if (!session) return;

    // Upload human recording
    const formData = new FormData();
    formData.append('file', file);
    formData.append('stemType', stemType);
    formData.append('sessionId', session.id);

    try {
      const uploadResponse = await fetch('/api/upload-stem', {
        method: 'POST',
        body: formData,
      });

      const { url } = await uploadResponse.json();

      const newStemData = {
        url,
        isAI: false,
        status: 'replaced' as const,
        uploadedBy: 'current-user'
      };

      // Broadcast the human stem replacement
      broadcastStemUpdate(stemType, newStemData);

      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          stems: prev.stems.map(s => 
            s.type === stemType 
              ? { ...s, ...newStemData } 
              : s
          )
        };
      });
    } catch (error) {
      console.error('Stem upload failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Collaborative AI Music Studio
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create music together - AI assists, you control • Real-time sync enabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-primary" />
            <span className="text-sm text-muted-foreground">
              {collaborators.length} team {collaborators.length === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
      </div>

      {!session ? (
        /* New Session Form */
        <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Song Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your song title..."
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Creative Direction
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the song you want to create... (e.g., 'Upbeat indie rock about summer nights, with catchy chorus and guitar-driven melody')"
                rows={4}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mood (Optional)
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
              >
                <option value="">Choose a mood...</option>
                <option value="energetic">Energetic</option>
                <option value="melancholic">Melancholic</option>
                <option value="romantic">Romantic</option>
                <option value="aggressive">Aggressive</option>
                <option value="chill">Chill</option>
                <option value="euphoric">Euphoric</option>
              </select>
            </div>

            <Button
              onClick={startNewSession}
              disabled={isGenerating || !prompt.trim() || !title.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-4 text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generating...' : 'Start AI-Assisted Creation'}
            </Button>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <div className="text-center p-3 bg-surface/50 rounded-lg">
                <p className="text-xs font-medium text-purple-400 mb-1">✨ AI Generates</p>
                <p className="text-xs text-muted-foreground">Lyrics, melody, arrangement</p>
              </div>
              <div className="text-center p-3 bg-surface/50 rounded-lg">
                <p className="text-xs font-medium text-blue-400 mb-1">🎸 You Control</p>
                <p className="text-xs text-muted-foreground">Replace any part with your recordings</p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Active Session */
        <div className="space-y-6">
          {/* Lyrics Section */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-brand-primary" />
              Lyrics
            </h4>
            {session.status === 'generating_lyrics' ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">AI is writing your lyrics...</p>
              </div>
            ) : (
              <pre className="bg-surface border border-border rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap font-mono">
                {session.lyrics || 'Lyrics will appear here...'}
              </pre>
            )}
          </Card>

          {/* Stems Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-primary" />
                Individual Stems
              </h4>
              <p className="text-xs text-muted-foreground">
                Click any stem to replace with your own recording
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {session.stems.map((stem) => (
                <div 
                  key={stem.type}
                  className="p-4 bg-surface border border-border rounded-lg hover:border-brand-primary transition cursor-pointer"
                  onClick={() => setSelectedStem(stem.type)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground capitalize">{stem.type}</span>
                    {stem.status === 'replaced' && (
                      <span className="text-xs px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400">
                        Human
                      </span>
                    )}
                    {stem.status === 'ready' && stem.isAI && (
                      <span className="text-xs px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400">
                        AI
                      </span>
                    )}
                  </div>

                  {stem.status === 'generating' ? (
                    <div className="text-center py-4">
                      <RefreshCw className="w-5 h-5 text-brand-primary animate-spin mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Generating...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <audio 
                        controls 
                        className="w-full"
                        src={stem.url || undefined}
                      >
                        Your browser does not support audio
                      </audio>
                      <div className="flex gap-2">
                        {stem.isAI && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              regenerateStem(stem.type);
                            }}
                            variant="secondary"
                            className="text-xs flex-1"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Regenerate
                          </Button>
                        )}
                        <label className="flex-1">
                          <Button
                            as="span"
                            variant="secondary"
                            className="text-xs w-full cursor-pointer"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) replaceStemWithHuman(stem.type, file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => setSession(null)}
              variant="secondary"
              className="flex-1"
            >
              Start New Session
            </Button>
            <Button
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground"
              disabled={session.status !== 'ready'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Final Mix
            </Button>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400 font-medium mb-1">💡 Pro Tip</p>
            <p className="text-xs text-muted-foreground">
              All collaborators see updates in real-time. Record your parts, replace AI stems, and create together!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

