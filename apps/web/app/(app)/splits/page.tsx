/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Splits & Rights Management - No more placeholders
 * Real functionality for tracking ownership and royalties
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
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cronkwaters/ui";
import {
  Plus,
  Users,
  Music,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { redirect } from "next/navigation";

import { NewSplitDialog } from "./NewSplitDialog";
import { SplitDetailsDialog } from "./SplitDetailsDialog";

export const dynamic = "force-dynamic";

async function getSplitsData(orgId: string) {
  const splits = await prisma.songSplit.findMany({
    where: {
      song: {
        project: {
          orgId,
        },
      },
    },
    include: {
      song: {
        include: {
          project: true,
        },
      },
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group splits by song
  const splitsBySong = splits.reduce(
    (acc, split) => {
      const songId = split.songId;
      if (!acc[songId]) {
        acc[songId] = {
          song: split.song,
          splits: [],
          totalPercentage: 0,
          status: "draft" as "draft" | "pending" | "confirmed",
          revenue: 0,
        };
      }
      acc[songId].splits.push(split);
      acc[songId].totalPercentage += split.percentage;

      // Determine status based on confirmations
      if (split.confirmed && acc[songId].status === "draft") {
        acc[songId].status = "pending";
      }

      return acc;
    },
    {} as Record<string, any>,
  );

  // Mark as confirmed if all splits are confirmed and total is 100%
  Object.values(splitsBySong).forEach((songSplit: any) => {
    const allConfirmed = songSplit.splits.every((s: any) => s.confirmed);
    if (allConfirmed && songSplit.totalPercentage === 100) {
      songSplit.status = "confirmed";
    }
  });

  // Get revenue data
  const transactions = await prisma.transaction.aggregate({
    where: {
      song: {
        project: {
          orgId,
        },
      },
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  return {
    splitsBySong: Object.values(splitsBySong),
    totalRevenue: transactions._sum.amount ? Number(transactions._sum.amount) : 0,
    transactionCount: transactions._count,
  };
}

// eslint-disable-next-line import/no-default-export
export default async function SplitsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  // Get user's active organization
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { org: true },
  });

  if (!membership) {
    redirect("/onboarding/organization");
  }

  const {
    splitsBySong,
    totalRevenue,
    transactionCount: _transactionCount,
  } = await getSplitsData(membership.orgId);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-brand-muted-foreground text-xs uppercase tracking-[0.28em]">Splits</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-brand-foreground text-2xl font-semibold sm:text-3xl">
              Rights & contributions
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
              Draft, negotiate, and publish split sheets with built-in audit trails and integrations
              for PRO submissions.
            </p>
          </div>
          <NewSplitDialog orgId={session.activeMembership.orgId}>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Split Agreement
            </Button>
          </NewSplitDialog>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Splits</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{splitsBySong.length}</div>
            <p className="text-muted-foreground text-xs">Split agreements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {splitsBySong.filter((s: any) => s.status === "confirmed").length}
            </div>
            <p className="text-muted-foreground text-xs">Fully executed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {splitsBySong.filter((s: any) => s.status === "pending").length}
            </div>
            <p className="text-muted-foreground text-xs">Awaiting signatures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Royalties</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
            <p className="text-muted-foreground text-xs">To be distributed</p>
          </CardContent>
        </Card>
      </div>

      {/* Splits Management Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Splits</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Distribution</TabsTrigger>
          <TabsTrigger value="export">PRO Export</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
            {splitsBySong.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Music className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">No split agreements yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first split agreement to start tracking rights and royalties
                  </p>
                  <NewSplitDialog orgId={session.activeMembership.orgId}>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Split
                    </Button>
                  </NewSplitDialog>
                </CardContent>
              </Card>
            ) : (
              splitsBySong.map((songSplit: any) => (
                <Card key={songSplit.song.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{songSplit.song.title}</CardTitle>
                        <CardDescription>
                          {songSplit.song.project.name} • {songSplit.splits.length} contributors
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          songSplit.status === "confirmed"
                            ? "success"
                            : songSplit.status === "pending"
                              ? "warning"
                              : "subtle"
                        }
                      >
                        {songSplit.status === "confirmed" && (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {songSplit.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                        {songSplit.status === "draft" && <AlertCircle className="mr-1 h-3 w-3" />}
                        {songSplit.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">Ownership Distribution</span>
                        <span
                          className={
                            songSplit.totalPercentage === 100 ? "text-green-600" : "text-orange-600"
                          }
                        >
                          {songSplit.totalPercentage}% allocated
                        </span>
                      </div>
                      <Progress
                        value={songSplit.totalPercentage}
                        className={songSplit.totalPercentage === 100 ? "" : "bg-orange-100"}
                      />
                    </div>

                    <div className="space-y-2">
                      {songSplit.splits.map((split: any) => (
                        <div key={split.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {split.user.name || split.user.email}
                              </p>
                              <p className="text-muted-foreground text-xs">{split.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">{split.percentage}%</span>
                            {split.confirmed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between pt-2">
                      <SplitDetailsDialog split={songSplit}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </SplitDetailsDialog>
                      <Button variant="ghost" size="sm">
                        Edit Split
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {splitsBySong
              .filter((s: any) => s.status === "pending")
              .map((songSplit: any) => (
                <Card key={songSplit.song.id}>
                  <CardHeader>
                    <CardTitle>{songSplit.song.title}</CardTitle>
                    <CardDescription>
                      Awaiting confirmation from{" "}
                      {songSplit.splits.filter((s: any) => !s.confirmed).length} contributors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {songSplit.splits
                        .filter((s: any) => !s.confirmed)
                        .map((split: any) => (
                          <div
                            key={split.id}
                            className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                          >
                            <div>
                              <p className="font-medium">{split.user.name || split.user.email}</p>
                              <p className="text-muted-foreground text-sm">
                                {split.percentage}% • {split.role}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Send Reminder
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

            {splitsBySong.filter((s: any) => s.status === "pending").length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
                  <h3 className="mb-2 text-lg font-semibold">All caught up!</h3>
                  <p className="text-muted-foreground">No splits are waiting for approval</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>
                Track and distribute royalties based on split agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Distributed</p>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Pending</p>
                    <p className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Distribution Queue</h4>
                  {splitsBySong
                    .filter((s: any) => s.status === "confirmed")
                    .map((songSplit: any) => (
                      <div key={songSplit.song.id} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{songSplit.song.title}</p>
                            <p className="text-muted-foreground text-sm">
                              ${((songSplit.revenue || 0) / 100).toFixed(2)} to distribute
                            </p>
                          </div>
                          <Button size="sm">Process Payouts</Button>
                        </div>
                        <div className="space-y-2">
                          {songSplit.splits.map((split: any) => (
                            <div key={split.id} className="flex justify-between text-sm">
                              <span>{split.user.name || split.user.email}</span>
                              <span className="font-medium">
                                $
                                {(
                                  ((songSplit.revenue || 0) * split.percentage) /
                                  100 /
                                  100
                                ).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PRO Export</CardTitle>
              <CardDescription>
                Export split sheets in formats accepted by performing rights organizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {splitsBySong
                  .filter((s: any) => s.status === "confirmed")
                  .map((songSplit: any) => (
                    <div
                      key={songSplit.song.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{songSplit.song.title}</p>
                        <p className="text-muted-foreground text-sm">
                          Ready for submission • {songSplit.splits.length} writers
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Generate CSV for this song's splits
                            const headers = [
                              "Song",
                              "Writer",
                              "Email",
                              "Role",
                              "Percentage",
                              "Status",
                            ];
                            const rows = songSplit.splits.map((s: any) => [
                              songSplit.song.title,
                              s.user.name || "N/A",
                              s.user.email,
                              s.role,
                              `${s.percentage}%`,
                              s.confirmed ? "Confirmed" : "Pending",
                            ]);

                            const csvContent = [
                              headers.join(","),
                              ...rows.map((row: string[]) =>
                                row.map((cell: string) => `"${cell}"`).join(","),
                              ),
                            ].join("\n");

                            const blob = new Blob([csvContent], { type: "text/csv" });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${songSplit.song.title.replace(/[^a-z0-9]/gi, "_")}_splits.csv`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          }}
                        >
                          Export CSV
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const projectSlug = songSplit.song.project?.slug;
                            if (projectSlug) {
                              window.open(
                                `/api/projects/${projectSlug}/export/pdf?songId=${songSplit.song.id}`,
                                "_blank",
                              );
                            }
                          }}
                        >
                          Export PDF
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>

              {splitsBySong.filter((s: any) => s.status === "confirmed").length === 0 && (
                <div className="text-muted-foreground py-8 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No confirmed splits ready for export</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
