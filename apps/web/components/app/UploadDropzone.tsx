'use client';

import { Badge, Button, cn } from '@cronkwaters/ui';
import { Inbox, X, Hash } from 'lucide-react';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from 'react';

import WaveformMini from './WaveformMini';

const ACCEPT_EXTENSIONS = ['.wav', '.aiff', '.mp3', '.flac', '.txt'];
const ACCEPT_ATTRIBUTE = ACCEPT_EXTENSIONS.join(',');

type UploadEntry = {
  id: string;
  name: string;
  size: number;
  type: string;
  checksum: string;
  file: File;
};

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return '0 B';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const toKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

export default function UploadDropzone() {
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const humanAcceptList = useMemo(() => ACCEPT_EXTENSIONS.map((ext) => ext.replace('.', '').toUpperCase()).join(', '), []);

  const computeChecksum = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, '0'));
    return hashArray.join('').slice(0, 8);
  }, []);

  const addFiles = useCallback(
    async (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      if (entries.length >= 10) return;
      const files = Array.from(fileList).filter((file) =>
        ACCEPT_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
      );
      if (!files.length) return;

      const remaining = Math.max(10 - entries.length, 0);
      const limited = files.slice(0, remaining);

      const existingKeys = new Set(entries.map((entry) => entry.id));
      const newEntries: UploadEntry[] = [];
      for (const file of limited) {
        const key = toKey(file);
        if (existingKeys.has(key)) continue;
        const checksum = await computeChecksum(file);
        newEntries.push({ id: key, name: file.name, size: file.size, type: file.type || 'Unknown', checksum, file });
        existingKeys.add(key);
      }
      if (newEntries.length) {
        setEntries((prev) => [...newEntries, ...prev]);
      }
    },
    [computeChecksum, entries]
  );

  const handleInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await addFiles(event.target.files);
      event.target.value = '';
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      await addFiles(event.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDragActive(false);
  }, []);

  const removeEntry = useCallback((id: string) => setEntries((prev) => prev.filter((entry) => entry.id !== id)), []);

  const openFileDialog = useCallback(() => inputRef.current?.click(), []);

  return (
    <section className="space-y-6">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFileDialog();
          }
        }}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/60 bg-surface/80 px-6 py-16 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary',
          dragActive && 'border-brand-primary bg-brand-primary/5'
        )}
        aria-label="Upload audio or lyric files"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
          <Inbox className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-brand-foreground">Drag files here or click to browse</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Accepted formats: {humanAcceptList}. Files stay local until you confirm uploads with your team.
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-brand-muted-foreground">Max 10 files per batch</p>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-surface/80 px-6 py-8 text-center text-sm text-muted-foreground">
            Your selected files will appear here with a quick checksum before syncing to storage.
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface px-6 py-5 shadow-soft transition hover:border-brand-primary/40 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 flex-col gap-2 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-brand-foreground" title={entry.name}>
                        {entry.name}
                      </span>
                      <Badge variant="outline" className="uppercase">
                        {entry.type ? entry.type.split('/').pop() ?? entry.type : 'File'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatBytes(entry.size)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="font-mono uppercase" aria-label="Checksum">
                        {entry.checksum}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start text-xs text-muted-foreground hover:text-brand-foreground"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Remove
                  </Button>
                </div>
                {entry.file.type.startsWith('audio/') ? <WaveformMini file={entry.file} /> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
