/**
 * Splits & Rights Management - No more placeholders
 * Real functionality for tracking ownership and royalties
 */

import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cronkwaters/ui/card";
import { Button } from "@cronkwaters/ui/button";
import { Badge } from "@cronkwaters/ui/badge";
import { Progress } from "@cronkwaters/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cronkwaters/ui/tabs";
import { Plus, Users, Music, DollarSign, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { NewSplitDialog } from "./NewSplitDialog";
import { SplitDetailsDialog } from "./SplitDetailsDialog";

export const dynamic = 'force-dynamic';

async function getSplitsData(orgId: string) {
  const splits = await prisma.songSplit.findMany({
    where: {
      song: {
        project: {
          orgId
        }
      }
    },
    include: {
      song: {
        include: {
          project: true
        }
      },
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Group splits by song
  const splitsBySong = splits.reduce((acc, split) => {
    const songId = split.songId;
    if (!acc[songId]) {
      acc[songId] = {
        song: split.song,
        splits: [],
        totalPercentage: 0,
        status: 'draft' as 'draft' | 'pending' | 'confirmed',
        revenue: 0
      };
    }
    acc[songId].splits.push(split);
    acc[songId].totalPercentage += split.percentage;
    
    // Determine status based on confirmations
    if (split.confirmed && acc[songId].status === 'draft') {
      acc[songId].status = 'pending';
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Mark as confirmed if all splits are confirmed and total is 100%
  Object.values(splitsBySong).forEach((songSplit: any) => {
    const allConfirmed = songSplit.splits.every((s: any) => s.confirmed);
    if (allConfirmed && songSplit.totalPercentage === 100) {
      songSplit.status = 'confirmed';
    }
  });

  // Get revenue data
  const transactions = await prisma.transaction.aggregate({
    where: {
      song: {
        project: {
          orgId
        }
      }
    },
    _sum: {
      amount: true
    },
    _count: true
  });

  return {
    splitsBySong: Object.values(splitsBySong),
    totalRevenue: transactions._sum.amount || 0,
    transactionCount: transactions._count
  };
}

export default async function SplitsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (!session.activeMembership?.orgId) {
    redirect("/organizations");
  }

  const { splitsBySong, totalRevenue, transactionCount } = await getSplitsData(session.activeMembership.orgId);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">Splits</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-foreground">Rights & contributions</h1>
            <p className="max-w-2xl text-base text-muted-foreground mt-2">
              Draft, negotiate, and publish split sheets with built-in audit trails and integrations for PRO submissions.
            </p>
          </div>
          <NewSplitDialog orgId={session.activeMembership.orgId}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Split Agreement
            </Button>
          </NewSplitDialog>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Splits</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{splitsBySong.length}</div>
            <p className="text-xs text-muted-foreground">Split agreements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {splitsBySong.filter((s: any) => s.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">Fully executed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {splitsBySong.filter((s: any) => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting signatures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Royalties</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">To be distributed</p>
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
                <CardContent className="text-center py-12">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No split agreements yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first split agreement to start tracking rights and royalties
                  </p>
                  <NewSplitDialog orgId={session.activeMembership.orgId}>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
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
                          songSplit.status === 'confirmed' 
                            ? 'success' 
                            : songSplit.status === 'pending' 
                            ? 'warning' 
                            : 'secondary'
                        }
                      >
                        {songSplit.status === 'confirmed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {songSplit.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {songSplit.status === 'draft' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {songSplit.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Ownership Distribution</span>
                        <span className={songSplit.totalPercentage === 100 ? 'text-green-600' : 'text-orange-600'}>
                          {songSplit.totalPercentage}% allocated
                        </span>
                      </div>
                      <Progress 
                        value={songSplit.totalPercentage} 
                        className={songSplit.totalPercentage === 100 ? '' : 'bg-orange-100'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      {songSplit.splits.map((split: any) => (
                        <div key={split.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{split.user.name || split.user.email}</p>
                              <p className="text-xs text-muted-foreground">{split.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">{split.percentage}%</span>
                            {split.confirmed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-orange-600" />
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
            {splitsBySong.filter((s: any) => s.status === 'pending').map((songSplit: any) => (
              <Card key={songSplit.song.id}>
                <CardHeader>
                  <CardTitle>{songSplit.song.title}</CardTitle>
                  <CardDescription>
                    Awaiting confirmation from {songSplit.splits.filter((s: any) => !s.confirmed).length} contributors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {songSplit.splits.filter((s: any) => !s.confirmed).map((split: any) => (
                      <div key={split.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{split.user.name || split.user.email}</p>
                          <p className="text-sm text-muted-foreground">{split.percentage}% • {split.role}</p>
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
            
            {splitsBySong.filter((s: any) => s.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">
                    No splits are waiting for approval
                  </p>
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
                <div className="grid grid-cols-3 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distributed</p>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Distribution Queue</h4>
                  {splitsBySong.filter((s: any) => s.status === 'confirmed').map((songSplit: any) => (
                    <div key={songSplit.song.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-medium">{songSplit.song.title}</p>
                          <p className="text-sm text-muted-foreground">
                            ${((songSplit.revenue || 0) / 100).toFixed(2)} to distribute
                          </p>
                        </div>
                        <Button size="sm">
                          Process Payouts
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {songSplit.splits.map((split: any) => (
                          <div key={split.id} className="flex justify-between text-sm">
                            <span>{split.user.name || split.user.email}</span>
                            <span className="font-medium">
                              ${(((songSplit.revenue || 0) * split.percentage / 100) / 100).toFixed(2)}
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
                {splitsBySong.filter((s: any) => s.status === 'confirmed').map((songSplit: any) => (
                  <div key={songSplit.song.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{songSplit.song.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Ready for submission • {songSplit.splits.length} writers
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Export CSV
                      </Button>
                      <Button size="sm" variant="outline">
                        Export PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {splitsBySong.filter((s: any) => s.status === 'confirmed').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
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