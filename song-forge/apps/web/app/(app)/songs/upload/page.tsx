'use client';

import { Button } from '@cronkwaters/ui';
import { Input } from '@cronkwaters/ui';
import { Label } from '@cronkwaters/ui';
import { Textarea } from '@cronkwaters/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cronkwaters/ui';
import { Upload, Music, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useMemo, memo } from 'react';

// Memoized file upload area component
const FileUploadArea = memo(({ 
  file, 
  uploading, 
  onFileChange, 
  onFileRemove,
  dragActive,
  onDrag,
  onDrop 
}: {
  file: File | null;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) => (
  <div
    className={`
      relative border-2 border-dashed rounded-xl p-12 text-center transition-all
      ${dragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-border hover:border-brand-primary/50'}
    `}
    onDragEnter={onDrag}
    onDragLeave={onDrag}
    onDragOver={onDrag}
    onDrop={onDrop}
  >
    <input
      type="file"
      id="file-upload"
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      accept="audio/*"
      onChange={onFileChange}
      disabled={uploading}
    />
    
    <div className="flex flex-col items-center gap-4">
      {file ? (
        <>
          <Music className="w-12 h-12 text-brand-primary" />
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onFileRemove}
          >
            Remove file
          </Button>
        </>
      ) : (
        <>
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="font-medium mb-1">
              Drag and drop your audio file here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse (MP3, WAV, FLAC, M4A)
            </p>
          </div>
        </>
      )}
    </div>
  </div>
));
FileUploadArea.displayName = 'FileUploadArea';

export default function UploadSongPage() {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Memoized drag handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  }, []);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setFile(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    
    // TODO: Implement actual upload logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setUploading(false);
    // Redirect to dashboard or song page
  }, []);

  // Memoize button disabled state
  const isSubmitDisabled = useMemo(() => !file || uploading, [file, uploading]);

  return (
    <div className="container mx-auto max-w-3xl py-8 px-6">
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="text-sm text-muted-foreground hover:text-brand-foreground inline-flex items-center gap-2 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-brand-foreground mb-2">Upload Song</h1>
        <p className="text-muted-foreground">
          Add a new track to your collection
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div className="rnrb-card p-6">
          <Label className="mb-4 block">Audio File *</Label>
          <FileUploadArea
            file={file}
            uploading={uploading}
            onFileChange={handleChange}
            onFileRemove={handleRemove}
            dragActive={dragActive}
            onDrag={handleDrag}
            onDrop={handleDrop}
          />
          
          <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>Maximum file size: 100MB. Supported formats: MP3, WAV, FLAC, M4A, AAC</p>
          </div>
        </div>

        {/* Song Details */}
        <div className="rnrb-card p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Song Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter song title"
              required
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Artist</Label>
            <Input
              id="artist"
              name="artist"
              placeholder="Artist or band name"
              disabled={uploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select name="genre" disabled={uploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="pop">Pop</SelectItem>
                  <SelectItem value="hip-hop">Hip Hop</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="classical">Classical</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                name="bpm"
                type="number"
                placeholder="120"
                min="1"
                max="300"
                disabled={uploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Musical Key</Label>
            <Select name="key" disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select key" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C">C Major</SelectItem>
                <SelectItem value="Cm">C Minor</SelectItem>
                <SelectItem value="D">D Major</SelectItem>
                <SelectItem value="Dm">D Minor</SelectItem>
                <SelectItem value="E">E Major</SelectItem>
                <SelectItem value="Em">E Minor</SelectItem>
                <SelectItem value="F">F Major</SelectItem>
                <SelectItem value="Fm">F Minor</SelectItem>
                <SelectItem value="G">G Major</SelectItem>
                <SelectItem value="Gm">G Minor</SelectItem>
                <SelectItem value="A">A Major</SelectItem>
                <SelectItem value="Am">A Minor</SelectItem>
                <SelectItem value="B">B Major</SelectItem>
                <SelectItem value="Bm">B Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add notes about this song..."
              rows={4}
              disabled={uploading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitDisabled}
          >
            {uploading ? 'Uploading...' : 'Upload Song'}
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

