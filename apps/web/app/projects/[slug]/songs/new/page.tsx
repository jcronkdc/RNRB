'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Music, GripVertical, Plus, X } from 'lucide-react';

type SongSection = {
  id: string;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'instrumental';
  label: string;
  lyrics: string;
};

const SECTION_TEMPLATES = [
  { type: 'intro' as const, label: 'Intro', placeholder: 'Intro lyrics or notes...' },
  { type: 'verse' as const, label: 'Verse', placeholder: 'Verse lyrics...' },
  { type: 'chorus' as const, label: 'Chorus', placeholder: 'Chorus lyrics...' },
  { type: 'bridge' as const, label: 'Bridge', placeholder: 'Bridge lyrics...' },
  { type: 'instrumental' as const, label: 'Instrumental', placeholder: 'Instrumental break notes...' },
  { type: 'outro' as const, label: 'Outro', placeholder: 'Outro lyrics or notes...' },
];

export default function NewSongPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [songData, setSongData] = useState({
    title: '',
    key: '',
    tempo: '',
    time_signature: '4/4',
  });

  const [sections, setSections] = useState<SongSection[]>([
    { id: '1', type: 'verse', label: 'Verse 1', lyrics: '' },
    { id: '2', type: 'chorus', label: 'Chorus', lyrics: '' },
  ]);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      
      setUser(user);
      const projects = user.user_metadata?.projects || [];
      const foundProject = projects.find((p: any) => p.slug === slug);
      
      if (!foundProject) {
        router.push('/projects');
        return;
      }
      
      setProject(foundProject);
    });
  }, [router, slug]);

  const addSection = (type: SongSection['type'], label: string) => {
    const newSection: SongSection = {
      id: Date.now().toString(),
      type,
      label,
      lyrics: ''
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, lyrics: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, lyrics } : s));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);
    
    setSections(newSections);
    setDraggedIndex(index);
  };

  const handleSave = async () => {
    if (!songData.title.trim()) {
      setMessage({ type: 'error', text: 'Song title required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const combinedLyrics = sections
        .map(section => `[${section.label}]\n${section.lyrics}`)
        .join('\n\n');

      const newSong = {
        id: `song_${Date.now()}`,
        ...songData,
        tempo: songData.tempo ? parseInt(songData.tempo) : null,
        structure: sections,
        lyrics: combinedLyrics,
        created_at: new Date().toISOString()
      };

      const allProjects = user.user_metadata?.projects || [];
      const updatedProjects = allProjects.map((p: any) => {
        if (p.slug === slug) {
          return {
            ...p,
            songs: [...(p.songs || []), newSong],
            song_count: (p.song_count || 0) + 1,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      });

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects
        }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Song created! Redirecting...' });
      setTimeout(() => {
        router.push(`/projects/${slug}`);
      }, 1000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="rnrb-container max-w-7xl py-12">
        
        <Link 
          href={`/projects/${slug}`} 
          className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-block mb-6"
        >
          ← BACK TO PROJECT
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            Create New Song
          </h1>
          <p className="text-lg text-muted-foreground">
            Build your song structure by dragging and dropping sections
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-500'
              : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Song Structure Builder */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="rnrb-card p-6">
              <h2 className="text-xl font-semibold mb-4">Song Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={songData.title}
                    onChange={(e) => setSongData({ ...songData, title: e.target.value })}
                    placeholder="Untitled Song"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Key
                    </label>
                    <input
                      type="text"
                      value={songData.key}
                      onChange={(e) => setSongData({ ...songData, key: e.target.value })}
                      placeholder="C, Am, G"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tempo
                    </label>
                    <input
                      type="number"
                      value={songData.tempo}
                      onChange={(e) => setSongData({ ...songData, tempo: e.target.value })}
                      placeholder="120"
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Time Sig
                    </label>
                    <select
                      value={songData.time_signature}
                      onChange={(e) => setSongData({ ...songData, time_signature: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
                    >
                      <option value="4/4">4/4</option>
                      <option value="3/4">3/4</option>
                      <option value="6/8">6/8</option>
                      <option value="5/4">5/4</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Drag & Drop Song Structure */}
            <div className="rnrb-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Song Structure</h2>
                <p className="text-xs text-muted-foreground">
                  Drag to reorder sections
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`border border-border rounded-lg p-4 bg-surface cursor-move transition-all ${
                      draggedIndex === index ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-2 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="text"
                            value={section.label}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[index].label = e.target.value;
                              setSections(updated);
                            }}
                            className="font-semibold bg-transparent border-0 border-b border-transparent hover:border-border focus:border-brand-primary focus:outline-none px-0 py-1"
                            placeholder="Section name"
                          />
                          <button
                            onClick={() => removeSection(section.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <textarea
                          value={section.lyrics}
                          onChange={(e) => updateSection(section.id, e.target.value)}
                          placeholder={SECTION_TEMPLATES.find(t => t.type === section.type)?.placeholder}
                          rows={4}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-sm font-mono focus:border-brand-primary focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Section Buttons */}
              <div className="flex flex-wrap gap-2">
                {SECTION_TEMPLATES.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => addSection(template.type, template.label)}
                    className="px-3 py-1.5 bg-surface hover:bg-surface-muted border border-border rounded text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview & Actions */}
          <div className="space-y-6">
            
            {/* Preview */}
            <div className="rnrb-card p-6">
              <h3 className="font-semibold mb-4">Structure Preview</h3>
              <div className="space-y-2 text-sm font-mono">
                {sections.map((section, index) => (
                  <div key={section.id} className="flex items-center gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="text-brand-primary">{section.label}</span>
                  </div>
                ))}
                {sections.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    Add sections to see structure
                  </p>
                )}
              </div>
            </div>

            {/* Save Actions */}
            <div className="rnrb-card p-6">
              <button
                onClick={handleSave}
                disabled={saving || !songData.title.trim()}
                className="w-full rnrb-button-primary py-3 rounded-lg disabled:opacity-50 font-semibold"
              >
                {saving ? 'CREATING...' : 'CREATE SONG'}
              </button>
              
              <Link href={`/projects/${slug}`}>
                <button className="w-full mt-3 px-4 py-2 border border-border hover:border-muted rounded-lg transition-colors font-mono text-xs uppercase tracking-wider">
                  CANCEL
                </button>
              </Link>
            </div>

            {/* Help */}
            <div className="rnrb-card p-6 bg-muted/20">
              <h4 className="font-semibold text-sm mb-3">Building Your Song</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• Drag sections to reorder</li>
                <li>• Click section name to rename</li>
                <li>• Add multiple verses/choruses</li>
                <li>• Remove sections with X button</li>
                <li>• Structure saves with song</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}