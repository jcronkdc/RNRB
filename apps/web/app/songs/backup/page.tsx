'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, FileText, Cloud, Shield, Calendar, Archive } from 'lucide-react';

export default function BackupPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  const exportAllSongs = (format: 'txt' | 'json') => {
    if (!user) return;
    
    setExporting(true);
    const songs = user.user_metadata?.songs || [];
    
    if (format === 'txt') {
      // Plain text format - readable
      const content = songs.map((song: any) => {
        return `${'='.repeat(60)}\n` +
               `TITLE: ${song.title}\n` +
               `WRITER: ${song.writer || 'Not specified'}\n` +
               (song.coWriters?.length ? `CO-WRITERS: ${song.coWriters.join(', ')}\n` : '') +
               (song.dateWritten ? `DATE: ${song.dateWritten}\n` : '') +
               (song.tags?.length ? `TAGS: ${song.tags.join(', ')}\n` : '') +
               `STATUS: ${song.status}\n` +
               `VISIBILITY: ${song.visibility}\n` +
               (song.key ? `KEY: ${song.key}\n` : '') +
               (song.tempo ? `TEMPO: ${song.tempo} BPM\n` : '') +
               `CREATED: ${new Date(song.createdAt).toLocaleDateString()}\n` +
               `${'='.repeat(60)}\n\n` +
               `${song.lyrics}\n\n\n`;
      }).join('');
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RNRB_Song_Backup_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // JSON format - complete data
      const backup = {
        exportDate: new Date().toISOString(),
        userEmail: user.email,
        totalSongs: songs.length,
        songs: songs,
        collections: user.user_metadata?.collections || [],
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RNRB_Complete_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    setTimeout(() => setExporting(false), 500);
  };

  const songs = user?.user_metadata?.songs || [];
  const lastBackup = songs.length > 0 
    ? new Date(Math.max(...songs.map((s: any) => new Date(s.updatedAt).getTime())))
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="rnrb-container max-w-4xl py-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/songs" 
            className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors inline-block mb-4"
          >
            ← BACK TO LIBRARY
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            Backup & Export
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your songs are auto-saved to the cloud. Export complete backups for extra security.
          </p>
        </div>

        {/* Cloud Status */}
        <div className="rnrb-card p-6 mb-8 border-green-500/30 bg-green-500/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-500 mb-2">Cloud Backup Active</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All your songs are automatically backed up to secure cloud storage. 
                Every keystroke is saved within 3 seconds.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Songs</p>
                  <p className="font-semibold text-foreground">{songs.length} songs</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Modified</p>
                  <p className="font-semibold text-foreground">
                    {lastBackup ? lastBackup.toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Download Backup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Text Format */}
            <div className="rnrb-card p-6">
              <FileText className="w-10 h-10 text-brand-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Text Format</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Readable format with all metadata. Perfect for archiving and sharing.
              </p>
              <ul className="text-xs text-muted-foreground mb-6 space-y-1">
                <li>• All lyrics with metadata</li>
                <li>• Writer, co-writers, dates</li>
                <li>• Tags, status, musical details</li>
                <li>• Easy to read and print</li>
              </ul>
              <button
                onClick={() => exportAllSongs('txt')}
                disabled={songs.length === 0 || exporting}
                className="rnrb-button-secondary w-full py-3 rounded-lg disabled:opacity-50"
              >
                <Download className="w-4 h-4 inline mr-2" />
                EXPORT AS TEXT
              </button>
            </div>

            {/* JSON Format */}
            <div className="rnrb-card p-6">
              <Shield className="w-10 h-10 text-brand-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Backup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Full data backup including all metadata. Use to restore if needed.
              </p>
              <ul className="text-xs text-muted-foreground mb-6 space-y-1">
                <li>• Complete song data</li>
                <li>• All collections/folders</li>
                <li>• Timestamps and IDs</li>
                <li>• Can re-import later</li>
              </ul>
              <button
                onClick={() => exportAllSongs('json')}
                disabled={songs.length === 0 || exporting}
                className="rnrb-button-primary w-full py-3 rounded-lg disabled:opacity-50"
              >
                <Shield className="w-4 h-4 inline mr-2" />
                EXPORT COMPLETE BACKUP
              </button>
            </div>
          </div>
        </div>

        {/* Protection Features */}
        <div className="mt-12 rnrb-card p-8 bg-muted/20">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-primary" />
            Data Protection Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-500">Auto-Save</h4>
              <p className="text-sm text-muted-foreground">
                Every change is automatically saved to the cloud within 3 seconds. 
                You'll never lose work from a browser crash.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-green-500">Cloud Storage</h4>
              <p className="text-sm text-muted-foreground">
                All songs stored in secure cloud database with redundancy. 
                Accessible from any device.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-green-500">Version History</h4>
              <p className="text-sm text-muted-foreground">
                Major changes create version snapshots. Restore previous versions if needed.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-green-500">Export Anytime</h4>
              <p className="text-sm text-muted-foreground">
                Download complete backups as text or JSON. Keep offline copies for extra safety.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-background rounded-lg border border-border">
            <p className="text-sm">
              <strong className="text-foreground">Recommendation:</strong> Export a backup every month and store it in Google Drive, Dropbox, or external drive.
              While our cloud storage is secure, having an offline backup gives complete peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
