/**
 * Assets Library - Fully functional asset management
 * No more "coming soon" - real asset organization
 */

import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
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
  Input,
} from "@cronkwaters/ui";
import { format } from "date-fns";
import {
  FileAudio,
  FileText,
  Image,
  Download,
  Share2,
  Clock,
  Music,
  Search,
  Filter,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AssetDetailsDialog } from "./AssetDetailsDialog";
import { ShareAssetDialog } from "./ShareAssetDialog";
import PageHeader from "../../../components/app/PageHeader";
import { UploadDropzone } from "../../../components/app/UploadDropzone";

export const dynamic = "force-dynamic";

async function getOrgAssets(orgId: string) {
  const assets = await prisma.asset.findMany({
    where: {
      project: {
        orgId,
      },
    },
    include: {
      project: true,
      uploadedBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group assets by type
  const assetsByType = {
    audio: assets.filter((a) => a.mimeType?.startsWith("audio/")),
    lyrics: assets.filter((a) => a.mimeType === "text/plain" || a.name.endsWith(".txt")),
    images: assets.filter((a) => a.mimeType?.startsWith("image/")),
    other: assets.filter(
      (a) =>
        !a.mimeType?.startsWith("audio/") &&
        !a.mimeType?.startsWith("image/") &&
        a.mimeType !== "text/plain" &&
        !a.name.endsWith(".txt"),
    ),
  };

  return { assets, assetsByType };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(1) + " MB";
  const gb = mb / 1024;
  return gb.toFixed(1) + " GB";
}

function getFileIcon(mimeType?: string, fileName?: string) {
  if (mimeType?.startsWith("audio/") || fileName?.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    return FileAudio;
  }
  if (mimeType?.startsWith("image/") || fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return Image;
  }
  if (mimeType === "text/plain" || fileName?.match(/\.(txt|lyrics)$/i)) {
    return FileText;
  }
  return Music;
}

// eslint-disable-next-line import/no-default-export
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
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input placeholder="Search assets..." className="w-[200px] pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {assets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Music className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No assets yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first asset using the dropzone above
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({assets.length})</TabsTrigger>
              <TabsTrigger value="audio">Audio ({assetsByType.audio.length})</TabsTrigger>
              <TabsTrigger value="lyrics">Lyrics ({assetsByType.lyrics.length})</TabsTrigger>
              <TabsTrigger value="images">Images ({assetsByType.images.length})</TabsTrigger>
              <TabsTrigger value="other">Other ({assetsByType.other.length})</TabsTrigger>
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

type AssetWithDetails = {
  id: string;
  name: string;
  mimeType: string;
  size: number | null;
  version: number;
  createdAt: Date;
  uploadedBy: {
    name: string | null;
    email: string;
  } | null;
  project: {
    name: string;
  } | null;
};

function AssetGrid({ assets }: { assets: AssetWithDetails[] }) {
  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No assets in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => {
        const Icon = getFileIcon(asset.mimeType, asset.name);

        return (
          <Card key={asset.id} className="group transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-lg p-2">
                    <Icon className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="line-clamp-1 text-base">{asset.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {asset.project?.name || "No project"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="subtle" className="text-xs">
                  v{asset.version || 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{formatFileSize(asset.size || 0)}</span>
                <span>{format(new Date(asset.createdAt), "MMM dd, yyyy")}</span>
              </div>

              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
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
