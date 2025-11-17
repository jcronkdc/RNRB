"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Badge,
} from "@cronkwaters/ui";
import { FileAudio, FileText, Image, Music, Download, Share2, Clock, User, Hash } from "lucide-react";
import { format } from "date-fns";

function getFileIcon(fileType?: string, fileName?: string) {
  if (fileType?.startsWith('audio/') || fileName?.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    return FileAudio;
  }
  if (fileType?.startsWith('image/') || fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return Image;
  }
  if (fileType === 'text/plain' || fileName?.match(/\.(txt|lyrics)$/i)) {
    return FileText;
  }
  return Music;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(1) + ' MB';
  const gb = mb / 1024;
  return gb.toFixed(1) + ' GB';
}

export function AssetDetailsDialog({ 
  children, 
  asset 
}: { 
  children: React.ReactNode;
  asset: any;
}) {
  const [open, setOpen] = useState(false);
  const Icon = getFileIcon(asset.fileType, asset.name);

  const handleDownload = () => {
    if (asset.publicUrl) {
      window.open(asset.publicUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">{asset.name}</DialogTitle>
              <DialogDescription>
                {asset.project.name} • Version {asset.version || 1}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Preview Section */}
          {asset.fileType?.startsWith('image/') && asset.publicUrl && (
            <div className="rounded-lg overflow-hidden bg-muted">
              <img 
                src={asset.publicUrl} 
                alt={asset.name}
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
          )}

          {asset.fileType?.startsWith('audio/') && asset.publicUrl && (
            <div className="p-4 bg-muted rounded-lg">
              <audio controls className="w-full">
                <source src={asset.publicUrl} type={asset.fileType} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {asset.fileType === 'text/plain' && asset.publicUrl && (
            <div className="p-4 bg-muted rounded-lg max-h-[300px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {/* TODO: Fetch and display text content */}
                <span className="text-muted-foreground">Text preview not implemented</span>
              </pre>
            </div>
          )}

          {/* File Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">File Details</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{asset.fileType || 'Unknown'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Size</dt>
                  <dd>{formatFileSize(asset.size || 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Format</dt>
                  <dd className="uppercase">
                    {asset.name.split('.').pop() || 'Unknown'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium mb-2">Upload Information</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Uploaded by</dt>
                  <dd className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {asset.uploadedBy?.name || asset.uploadedBy?.email || 'Unknown'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(asset.createdAt), 'MMM dd, yyyy')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Version</dt>
                  <dd className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    v{asset.version || 1}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Tags */}
          {asset.tags && asset.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag: string) => (
                  <Badge key={tag} variant="subtle">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {asset.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {asset.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
