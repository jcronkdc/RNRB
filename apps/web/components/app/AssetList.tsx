import { Badge, cn } from '@songforge/ui';
import { FileAudio, FileDigit, FileImage, FileText, FileType, Upload } from 'lucide-react';
import Link from 'next/link';

import { EmptyState } from './EmptyState';

const ICON_MAP = {
  audio: FileAudio,
  lyric: FileText,
  image: FileImage,
  pdf: FileType,
  chart: FileDigit
} as const;

type AssetType = keyof typeof ICON_MAP;

export interface AssetListItem {
  id: string;
  name: string;
  type: AssetType;
  bytes?: number;
}

interface AssetListProps {
  items: AssetListItem[];
}

const formatBytes = (bytes?: number) => {
  if (!bytes || !Number.isFinite(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

export default function AssetList({ items, onCreate }: AssetListProps & { onCreate?: () => void }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<Upload className="h-6 w-6" aria-hidden="true" />}
        title="No Assets Yet"
        description="Upload audio files, lyrics, charts, and more to keep everything organized in one place. Your collaborators will thank you."
        action={onCreate ? { label: 'Upload Assets', onClick: onCreate } : undefined}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface/80 shadow-soft">
      <div className="grid grid-cols-[3fr_1fr_1fr] items-center border-b border-border/50 px-5 py-3 text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">
        <span>Name</span>
        <span>Type</span>
        <span>Size</span>
      </div>
      <ul>
        {items.map((asset) => {
          const Icon = ICON_MAP[asset.type];
          return (
            <li key={asset.id}>
              <Link
                href="#"
                className={cn(
                  'grid w-full grid-cols-[3fr_1fr_1fr] items-center gap-2 px-5 py-4 text-left text-sm transition hover:bg-brand-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary'
                )}
                aria-label={`View asset ${asset.name}`}
              >
                <span className="truncate font-medium text-brand-foreground">{asset.name}</span>
                <Badge variant="outline" className="flex items-center gap-1 text-xs uppercase">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {asset.type}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatBytes(asset.bytes)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
