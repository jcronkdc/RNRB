'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2, Image, Check, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  bucket?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  accept = 'image/*',
  maxSizeMB = 5,
  bucket = 'site-images',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be under ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { url } = await response.json();
      onChange(url);
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(value || null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        // Image Preview
        <div
          className="group relative overflow-hidden rounded-lg"
          style={{ border: '1px solid var(--border)' }}
        >
          <img src={preview} alt="Preview" className="h-48 w-full object-cover" />

          {/* Overlay Actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleClick}
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{
                background: 'var(--accent)',
                color: '#fff',
              }}
            >
              Change
            </button>
            <button
              onClick={handleRemove}
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{
                background: '#ef4444',
                color: '#fff',
              }}
            >
              Remove
            </button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
              <p className="text-sm text-white">Uploading... {uploadProgress}%</p>
            </div>
          )}

          {uploadProgress === 100 && (
            <div className="absolute right-2 top-2 rounded-full bg-green-500 p-2">
              <Check size={16} className="text-white" />
            </div>
          )}
        </div>
      ) : (
        // Upload Button
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="group flex h-48 w-full flex-col items-center justify-center rounded-lg transition-all hover:scale-[1.01] disabled:opacity-50"
          style={{
            background: 'var(--bg)',
            border: '2px dashed var(--border)',
          }}
        >
          {isUploading ? (
            <>
              <Loader2 className="mb-3 h-10 w-10 animate-spin" style={{ color: 'var(--accent)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Uploading...
              </p>
            </>
          ) : (
            <>
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors group-hover:scale-110"
                style={{ background: 'var(--accent)', opacity: 0.2 }}
              >
                <Upload size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="mb-1 font-medium" style={{ color: 'var(--text)' }}>
                {label}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                PNG, JPG, GIF up to {maxSizeMB}MB
              </p>
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
