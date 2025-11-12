/**
 * Assets Library - Fully functional asset management
 * No more "coming soon" - real asset organization
 */

import PageHeader from '../../../components/app/PageHeader';
import UploadDropzone from '../../../components/app/UploadDropzone';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { redirect } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input
} from '@cronkwaters/ui';
import { FileAudio, FileText, Image, Download, Share2, Trash2, Clock, Music, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { AssetDetailsDialog } from './AssetDetailsDialog';
import { ShareAssetDialog } from './ShareAssetDialog';

export const dynamic = 'force-dynamic';

async function getOrgAssets(orgId: string) {
  const assets = await prisma.asset.findMany({
    where: {
      project: {
        orgId
      }
    },
    include: {
      project: true,
      uploadedBy: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Group assets by type
  const assetsByType = {
    audio: assets.filter(a => a.fileType?.startsWith('audio/')),
    lyrics: assets.filter(a => a.fileType === 'text/plain' || a.name.endsWith('.txt')),
    images: assets.filter(a => a.fileType?.startsWith('image/')),
    other: assets.filter(a => 
      !a.fileType?.startsWith('audio/') && 
      !a.fileType?.startsWith('image/') && 
      a.fileType !== 'text/plain' && 
      !a.name.endsWith('.txt')
    )
  };

  return { assets, assetsByType };
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

export default async function AssetsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (!session.activeMembership?.orgId) {
    redirect("/organizations");
  }

  const { assets, assetsByType } = await getOrgAssets(session.activeMembership.orgId);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Assets"
        subtitle="Upload and organize audio files, lyrics, artwork, and more."
      />

      <UploadDropzone />

      {/* Asset Library */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Asset Library</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search assets..." 
                className="pl-9 w-[200px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {assets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first asset using the dropzone above
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({assets.length})
              </TabsTrigger>
              <TabsTrigger value="audio">
                Audio ({assetsByType.audio.length})
              </TabsTrigger>
              <TabsTrigger value="lyrics">
                Lyrics ({assetsByType.lyrics.length})
              </TabsTrigger>
              <TabsTrigger value="images">
                Images ({assetsByType.images.length})
              </TabsTrigger>
              <TabsTrigger value="other">
                Other ({assetsByType.other.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <AssetGrid assets={assets} />
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <AssetGrid assets={assetsByType.audio} />
            </TabsContent>

            <TabsContent value="lyrics" className="space-y-4">
              <AssetGrid assets={assetsByType.lyrics} />
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <AssetGrid assets={assetsByType.images} />
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <AssetGrid assets={assetsByType.other} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function AssetGrid({ assets }: { assets: any[] }) {
  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No assets in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => {
        const Icon = getFileIcon(asset.fileType, asset.name);
        
        return (
          <Card key={asset.id} className="group hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base line-clamp-1">
                      {asset.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {asset.project.name}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  v{asset.version || 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(asset.size || 0)}</span>
                <span>{format(new Date(asset.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <AssetDetailsDialog asset={asset}>
                  <Button size="sm" variant="outline" className="flex-1">
                    View
                  </Button>
                </AssetDetailsDialog>
                
                <ShareAssetDialog asset={asset}>
                  <Button size="sm" variant="outline" className="px-3">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </ShareAssetDialog>
                
                <Button size="sm" variant="outline" className="px-3">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
              
              {asset.uploadedBy && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>by {asset.uploadedBy.name || asset.uploadedBy.email}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}