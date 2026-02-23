'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Music,
  File,
  Loader2,
  ExternalLink,
  Copy,
  Check,
} from '@/components/ui/custom-icons';
import { motion, AnimatePresence } from 'motion/react';

interface FileViewerProps {
  url: string;
  name: string;
  mimeType: string;
  onClose: () => void;
}

export function FileViewer({ url, name, mimeType, onClose }: FileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Determine file type
  const isImage = mimeType.startsWith('image/');
  const isPdf = mimeType === 'application/pdf';
  const isText =
    mimeType.startsWith('text/') ||
    mimeType === 'application/rtf' ||
    name.match(/\.(txt|md|rtf|chordpro|cho|crd)$/i);
  const isAudio = mimeType.startsWith('audio/');
  const isMidi = mimeType.includes('midi') || name.match(/\.(mid|midi)$/i);

  // Load text content for text files
  useEffect(() => {
    if (isText && !textContent) {
      setLoading(true);
      fetch(url)
        .then((res) => res.text())
        .then((text) => {
          setTextContent(text);
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to load file content');
          setLoading(false);
        });
    } else if (!isText) {
      // For non-text files, loading state is managed by onLoad handlers
    }
  }, [url, isText, textContent]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 300));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleCopyText = async () => {
    if (textContent) {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === '+' || e.key === '=') handleZoomIn();
    if (e.key === '-') handleZoomOut();
    if (e.key === 'r') handleRotate();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, []);

  const renderContent = () => {
    // PDF Viewer
    if (isPdf) {
      return (
        <div className="flex h-full w-full flex-col">
          <iframe
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="h-full w-full rounded-lg bg-white"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('Failed to load PDF');
              setLoading(false);
            }}
            title={name}
          />
        </div>
      );
    }

    // Image Viewer
    if (isImage) {
      return (
        <div className="flex h-full items-center justify-center overflow-auto p-4">
          <img
            src={url}
            alt={name}
            className="max-h-full max-w-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('Failed to load image');
              setLoading(false);
            }}
          />
        </div>
      );
    }

    // Text/Lyrics/Chords Viewer
    if (isText) {
      return (
        <div className="relative flex h-full flex-col">
          {/* Copy button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white transition-all hover:bg-gray-700"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <pre
              className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-200"
              style={{ fontSize: `${zoom}%` }}
            >
              {textContent || 'Loading...'}
            </pre>
          </div>
        </div>
      );
    }

    // Audio files - show message to use audio player
    if (isAudio || isMidi) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-500/20">
            <Music className="h-12 w-12 text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold text-white">{name}</h3>
          <p className="max-w-md text-center text-gray-400">
            {isMidi
              ? 'MIDI files can be opened in your DAW or notation software.'
              : 'Use the audio player in the library list to play this file.'}
          </p>
          <a
            href={url}
            download={name}
            className="mt-4 flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition-all hover:bg-orange-600"
          >
            <Download className="h-5 w-5" />
            Download File
          </a>
        </div>
      );
    }

    // Fallback for other file types
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800">
          <File className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">{name}</h3>
        <p className="max-w-md text-center text-gray-400">
          This file type cannot be previewed directly. Download it to open in the appropriate
          application.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href={url}
            download={name}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition-all hover:bg-orange-600"
          >
            <Download className="h-5 w-5" />
            Download
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 text-white transition-all hover:bg-gray-700"
          >
            <ExternalLink className="h-5 w-5" />
            Open in New Tab
          </a>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/95"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {isImage && <ImageIcon className="h-5 w-5 shrink-0 text-orange-500" />}
            {isPdf && <FileText className="h-5 w-5 shrink-0 text-orange-500" />}
            {isText && <FileText className="h-5 w-5 shrink-0 text-orange-500" />}
            {(isAudio || isMidi) && <Music className="h-5 w-5 shrink-0 text-orange-500" />}
            {!isImage && !isPdf && !isText && !isAudio && !isMidi && (
              <File className="h-5 w-5 shrink-0 text-orange-500" />
            )}
            <span className="truncate text-sm font-medium text-white sm:text-base">{name}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Zoom controls for images and text */}
            {(isImage || isText) && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
                  title="Zoom out (-)"
                >
                  <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <span className="min-w-12 text-center text-xs text-gray-400 sm:text-sm">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
                  title="Zoom in (+)"
                >
                  <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}

            {/* Rotation for images */}
            {isImage && (
              <button
                onClick={handleRotate}
                className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
                title="Rotate (R)"
              >
                <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Reset button */}
            {(isImage || isText) && (zoom !== 100 || rotation !== 0) && (
              <button
                onClick={handleReset}
                className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
                title="Reset"
              >
                <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Download */}
            <a
              href={url}
              download={name}
              className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-800 hover:text-white"
              title="Download"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="ml-2 rounded-lg bg-gray-800 p-2 text-gray-400 transition-all hover:bg-gray-700 hover:text-white"
              title="Close (Esc)"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!error && renderContent()}
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="border-t border-gray-800 px-4 py-2">
          <p className="text-center text-xs text-gray-500">
            Press <kbd className="rounded bg-gray-800 px-1.5 py-0.5">Esc</kbd> to close
            {(isImage || isText) && (
              <>
                {' · '}
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5">+</kbd>/
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5">-</kbd> to zoom
              </>
            )}
            {isImage && (
              <>
                {' · '}
                <kbd className="rounded bg-gray-800 px-1.5 py-0.5">R</kbd> to rotate
              </>
            )}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
