-- Migration: Expand LibraryFileType enum for songwriter documents
-- Description: Adds new file types for lyrics, chord charts, sheet music, MIDI, images, documents, and DAW project files

-- Add new values to LibraryFileType enum
ALTER TYPE "LibraryFileType" ADD VALUE IF NOT EXISTS 'lyrics';
ALTER TYPE "LibraryFileType" ADD VALUE IF NOT EXISTS 'chords';
ALTER TYPE "LibraryFileType" ADD VALUE IF NOT EXISTS 'sheet_music';
ALTER TYPE "LibraryFileType" ADD VALUE IF NOT EXISTS 'midi';
ALTER TYPE "LibraryFileType" ADD VALUE IF NOT EXISTS 'image';
ALTER TYPE "LibraryFileType" ADD VALUE IF NOT EXISTS 'document';
ALTER TYPE "LibraryFileType" ADD VALUE IF NOT EXISTS 'project';

