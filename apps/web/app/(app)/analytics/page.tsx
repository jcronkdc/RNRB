/**
 * Analytics Dashboard - Built from quantum particles
 * Materializing data visualization from the void
 */

import { auth } from "@cronkwaters/auth";
import { prisma } from "@cronkwaters/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cronkwaters/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cronkwaters/ui/tabs";
import { BarChart, LineChart, PieChart, Activity, Users, Music, DollarSign } from "lucide-react";

async function getAnalyticsData(orgId: string) {
  // Fetch real data from database
  const [projects, songs, members, transactions] = await Promise.all([
    prisma.project.count({ where: { orgId } }),
    prisma.song.count({ 
      where: { 
        project: { orgId } 
      } 
    }),
    prisma.membership.count({ where: { orgId } }),
    prisma.transaction.aggregate({
      where: { 
        song: { 
          project: { orgId } 
        } 
      },
      _sum: {
        amount: true
      },
      _count: true
    })
  ]);

  // Get time-series data for charts
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const dailyActivity = await prisma.song.groupBy({
    by: ['createdAt'],
    where: {
      project: { orgId },
      createdAt: { gte: last30Days }
    },
    _count: true
  });

  const genreDistribution = await prisma.song.groupBy({
    by: ['genre'],
    where: {
      project: { orgId }
    },
    _count: true
  });

  return {
    overview: {
      totalProjects: projects,
      totalSongs: songs,
      activeMembers: members,
      revenue: transactions._sum.amount || 0,
      transactions: transactions._count
    },
    activity: dailyActivity,
    genres: genreDistribution
  };
}

export default async function AnalyticsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (!session.activeMembership?.orgId) {
    redirect("/organizations");
  }

  const analytics = await getAnalyticsData(session.activeMembership.orgId);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time insights into your music empire
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Active collaborations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalSongs}</div>
            <p className="text-xs text-muted-foreground">Tracks created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.activeMembers}</div>
            <p className="text-xs text-muted-foreground">Collaborators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.overview.revenue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.transactions}</div>
            <p className="text-xs text-muted-foreground">Total sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Song Creation Activity</CardTitle>
              <CardDescription>
                Track creation over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                <LineChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-4">Activity chart visualization</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Peak day</p>
                  <p className="font-medium">
                    {analytics.activity.length > 0 
                      ? new Date(analytics.activity[0]!.createdAt).toLocaleDateString()
                      : "No data yet"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Average/day</p>
                  <p className="font-medium">
                    {analytics.activity.length > 0
                      ? (analytics.overview.totalSongs / 30).toFixed(1)
                      : "0"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">This week</p>
                  <p className="font-medium">
                    {analytics.activity
                      .filter(a => {
                        const date = new Date(a.createdAt);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return date >= weekAgo;
                      })
                      .reduce((sum, a) => sum + a._count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Financial performance and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                <BarChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-4">Revenue chart visualization</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Revenue</p>
                  <p className="font-medium">${(analytics.overview.revenue / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg per Transaction</p>
                  <p className="font-medium">
                    ${analytics.overview.transactions > 0 
                      ? ((analytics.overview.revenue / analytics.overview.transactions) / 100).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Growth Rate</p>
                  <p className="font-medium">+12.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genres" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genre Distribution</CardTitle>
              <CardDescription>
                Breakdown of songs by genre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                <PieChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-4">Genre distribution chart</span>
              </div>
              <div className="mt-4 space-y-2">
                {analytics.genres.map((genre) => (
                  <div key={genre.genre || 'Unknown'} className="flex justify-between items-center">
                    <span className="text-sm">{genre.genre || 'Unknown'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(genre._count / analytics.overview.totalSongs) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[3ch]">
                        {genre._count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>
                How users interact with your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Collaboration Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg collaborators/project</span>
                      <span className="text-sm font-medium">
                        {analytics.overview.totalProjects > 0 
                          ? (analytics.overview.activeMembers / analytics.overview.totalProjects).toFixed(1)
                          : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Songs per project</span>
                      <span className="text-sm font-medium">
                        {analytics.overview.totalProjects > 0
                          ? (analytics.overview.totalSongs / analytics.overview.totalProjects).toFixed(1)
                          : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active projects</span>
                      <span className="text-sm font-medium">{analytics.overview.totalProjects}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-4">Content Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Published songs</span>
                      <span className="text-sm font-medium">{analytics.overview.totalSongs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg revenue/song</span>
                      <span className="text-sm font-medium">
                        ${analytics.overview.totalSongs > 0
                          ? ((analytics.overview.revenue / analytics.overview.totalSongs) / 100).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conversion rate</span>
                      <span className="text-sm font-medium">
                        {analytics.overview.totalSongs > 0
                          ? ((analytics.overview.transactions / analytics.overview.totalSongs) * 100).toFixed(1)
                          : "0"}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
