'use client';

/**
 * WORLD-CLASS TOUR ANALYTICS DASHBOARD
 * 
 * Features:
 * - Real-time performance metrics
 * - Revenue/attendance charts
 * - Geographic insights
 * - AI-powered recommendations
 * - Export capabilities
 * - Mobile-responsive design
 */

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  Download,
  AlertCircle,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Navigation,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface TourAnalyticsProps {
  tourId: string;
  tourSlug: string;
}

export function TourAnalyticsDashboard({ tourId, tourSlug }: TourAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [routing, setRouting] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'routing'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [tourId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load analytics data
      const [analyticsRes, routingRes, financialsRes] = await Promise.all([
        fetch(`/api/tours/${tourSlug}/analytics`),
        fetch(`/api/tours/${tourSlug}/routing`),
        fetch(`/api/tours/${tourSlug}/financials`),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.analytics);
      }

      if (routingRes.ok) {
        const data = await routingRes.json();
        setRouting(data);
      }

      if (financialsRes.ok) {
        const data = await financialsRes.json();
        setFinancials(data.financials);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf-data') => {
    try {
      const response = await fetch(`/api/tours/${tourSlug}/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tourSlug}-export.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tourSlug}-export.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-brand-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <p className="text-muted-foreground">No analytics data available yet.</p>
        <p className="text-muted-foreground text-sm">Add shows with revenue and attendance data to see insights.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'financial' ? 'default' : 'outline'}
            onClick={() => setActiveTab('financial')}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Financials
          </Button>
          <Button
            variant={activeTab === 'routing' ? 'default' : 'outline'}
            onClick={() => setActiveTab('routing')}
            className="flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Routing
          </Button>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${analytics.financial.totalRevenue.toLocaleString()}`}
              subtext={`Avg $${analytics.financial.averageRevenuePerShow.toLocaleString()}/show`}
              color="green"
            />
            <MetricCard
              icon={Users}
              label="Total Attendance"
              value={analytics.attendance.totalAttendance.toLocaleString()}
              subtext={`${analytics.attendance.averageUtilization.toFixed(1)}% avg fill rate`}
              color="blue"
            />
            <MetricCard
              icon={Calendar}
              label="Tour Progress"
              value={`${analytics.progress.percentComplete.toFixed(0)}%`}
              subtext={`${analytics.progress.completedShows}/${analytics.progress.totalShows} shows`}
              color="purple"
            />
            <MetricCard
              icon={TrendingUp}
              label="Revenue Growth"
              value={`${analytics.performanceMetrics.revenueGrowth > 0 ? '+' : ''}${analytics.performanceMetrics.revenueGrowth.toFixed(1)}%`}
              subtext="Compared to early shows"
              color="orange"
            />
          </div>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricDisplay
                label="Venue Fill Rate"
                value={`${analytics.performanceMetrics.utilizationRate.toFixed(1)}%`}
                description="Average attendance vs capacity"
              />
              <MetricDisplay
                label="Revenue Growth"
                value={`${analytics.performanceMetrics.revenueGrowth > 0 ? '+' : ''}${analytics.performanceMetrics.revenueGrowth.toFixed(1)}%`}
                description="Early shows vs recent shows"
              />
              <MetricDisplay
                label="Consistency Score"
                value={`${analytics.performanceMetrics.consistency.toFixed(0)}%`}
                description="How similar shows perform"
              />
            </div>
          </Card>

          {/* Data-Driven Recommendations */}
          {analytics.recommendations && analytics.recommendations.length > 0 && (
            <Card className="border-blue-500/20 bg-blue-500/5 p-6">
              <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                Recommendations
              </h3>
              <div className="space-y-2">
                {analytics.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-blue-500/20 mt-0.5 h-1.5 w-1.5 rounded-full" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-4 text-xs italic">
                Based on your tour data. Not financial or legal advice.
              </p>
            </Card>
          )}

          {/* Top Markets */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Markets
            </h3>
            <div className="space-y-3">
              {analytics.geographic.topMarkets.slice(0, 5).map((market: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {index + 1}. {market.city}, {market.state}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {market.shows} shows • {market.totalAttendance.toLocaleString()} fans
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500">
                      ${market.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      ${market.averageRevenue.toLocaleString()}/show
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Growth Markets */}
          {analytics.geographic.growthMarkets && analytics.geographic.growthMarkets.length > 0 && (
            <Card className="border-green-500/20 bg-green-500/5 p-6">
              <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Growth Markets
              </h3>
              <div className="space-y-3">
                {analytics.geographic.growthMarkets.slice(0, 3).map((market: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{market.city}</p>
                      <p className="text-muted-foreground text-sm">
                        {market.shows} shows
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-500">
                        +{market.growth.toFixed(1)}%
                      </p>
                      <p className="text-muted-foreground text-sm">
                        ${market.firstRevenue.toLocaleString()} → ${market.lastRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && financials && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Financial Summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-green-500/20 bg-green-500/5 p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Total Revenue</h4>
              <p className="text-2xl font-bold text-green-500">
                ${financials.revenue.total.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                ${financials.revenue.completed.toLocaleString()} completed • ${financials.revenue.projected.toLocaleString()} projected
              </p>
            </Card>
            <Card className="border-red-500/20 bg-red-500/5 p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Total Expenses</h4>
              <p className="text-2xl font-bold text-red-500">
                ${financials.expenses.total.total.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                ${financials.expenses.completed.total.toLocaleString()} actual • ${financials.expenses.upcoming.total.toLocaleString()} estimated
              </p>
            </Card>
            <Card className="border-blue-500/20 bg-blue-500/5 p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Net Profit</h4>
              <p className="text-2xl font-bold text-blue-500">
                ${financials.profitLoss.total.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {financials.profitLoss.margin.toFixed(1)}% margin
              </p>
            </Card>
          </div>

          {/* Health Indicators */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Financial Health</h3>
            <div className="space-y-4">
              <HealthIndicator
                label="Profit Margin"
                value={`${financials.healthIndicators.profitMargin.value.toFixed(1)}%`}
                status={financials.healthIndicators.profitMargin.status}
                benchmark={financials.healthIndicators.profitMargin.benchmark}
              />
              <HealthIndicator
                label="Revenue Trend"
                value={`${financials.healthIndicators.revenueGrowth.value > 0 ? '+' : ''}${financials.healthIndicators.revenueGrowth.value.toFixed(1)}%`}
                status={financials.healthIndicators.revenueGrowth.status}
              />
              <HealthIndicator
                label="Cash Position"
                value={`$${financials.healthIndicators.cashPosition.value.toLocaleString()}`}
                status={financials.healthIndicators.cashPosition.status}
              />
            </div>
          </Card>

          {/* Expense Estimates (Planning Tool) */}
          <Card className="border-yellow-500/20 bg-yellow-500/5 p-6">
            <div className="mb-4 flex items-start gap-2">
              <AlertCircle className="text-yellow-500 mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h3 className="text-lg font-semibold">Expense Estimates (Planning Only)</h3>
                <p className="text-muted-foreground text-sm">
                  Industry-standard percentages - NOT your actual expenses
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <ExpenseRow label="Venue Rental (est. 15%)" amount={financials.expenses.total.venueRental} />
              <ExpenseRow label="Production (est. 20%)" amount={financials.expenses.total.production} />
              <ExpenseRow label="Crew (est. 15%)" amount={financials.expenses.total.crew} />
              <ExpenseRow label="Travel (est. 10%)" amount={financials.expenses.total.travel} />
              <ExpenseRow label="Accommodation (est. 10%)" amount={financials.expenses.total.accommodation} />
              <ExpenseRow label="Marketing (est. 5%)" amount={financials.expenses.total.marketing} />
              <ExpenseRow label="Miscellaneous (est. 5%)" amount={financials.expenses.total.misc} />
            </div>
            <div className="border-yellow-500/20 mt-4 rounded-lg border bg-yellow-500/10 p-3">
              <p className="text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                ⚠️ {financials.disclaimer}
              </p>
            </div>
          </Card>

          {/* Top Performing Shows */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Most Profitable Shows</h3>
            <div className="space-y-3">
              {financials.topPerformers.mostProfitable.slice(0, 5).map((show: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 p-3"
                >
                  <div>
                    <p className="font-medium">{show.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {show.venue} • {new Date(show.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-500">
                      ${show.profit.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {show.profitMargin.toFixed(1)}% margin
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          {financials.recommendations && financials.recommendations.length > 0 && (
            <Card className="border-yellow-500/20 bg-yellow-500/5 p-6">
              <h3 className="mb-4 text-lg font-semibold">Financial Recommendations</h3>
              <div className="space-y-2">
                {financials.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-yellow-500/20 mt-0.5 h-1.5 w-1.5 rounded-full" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Routing Tab */}
      {activeTab === 'routing' && routing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Routing Summary */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Total Distance</h4>
              <p className="text-2xl font-bold">
                {routing.current.totalDistance.toLocaleString()} mi
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {routing.current.totalDrivingTime.toFixed(1)} hours driving
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Estimated Cost</h4>
              <p className="text-2xl font-bold">
                ${routing.current.estimatedCost.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Based on IRS mileage rate
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-muted-foreground mb-2 text-sm">Issues Detected</h4>
              <p className="text-2xl font-bold text-yellow-500">
                {routing.current.issues.backtracking + routing.current.issues.longDrives + routing.current.issues.tightSchedules}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {routing.current.issues.backtracking} backtrack • {routing.current.issues.longDrives} long • {routing.current.issues.tightSchedules} tight
              </p>
            </Card>
          </div>

          {/* Optimization Savings */}
          {routing.savings.distance > 0 && (
            <Card className="border-green-500/20 bg-green-500/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-green-500">
                Optimization Opportunity
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-sm">Distance Saved</p>
                  <p className="text-2xl font-bold text-green-500">
                    {Math.round(routing.savings.distance).toLocaleString()} mi
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {routing.savings.distancePercent.toFixed(1)}% reduction
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Cost Saved</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${Math.round(routing.savings.estimatedCost).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Time Saved</p>
                  <p className="text-2xl font-bold text-green-500">
                    {routing.savings.drivingHours.toFixed(1)} hrs
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Routing Recommendations */}
          {routing.recommendations && routing.recommendations.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Routing Recommendations</h3>
              <div className="space-y-4">
                {routing.recommendations.map((rec: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 ${
                      rec.priority === 'high'
                        ? 'border-red-500/20 bg-red-500/5'
                        : rec.priority === 'medium'
                          ? 'border-yellow-500/20 bg-yellow-500/5'
                          : 'border-blue-500/20 bg-blue-500/5'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          rec.priority === 'high'
                            ? 'bg-red-500/20 text-red-500'
                            : rec.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-blue-500/20 text-blue-500'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{rec.description}</p>
                    {rec.savings && (
                      <div className="mt-3 flex gap-4 text-sm">
                        <span className="text-green-500">
                          Save {rec.savings.miles} mi
                        </span>
                        <span className="text-green-500">
                          Save ${rec.savings.cost}
                        </span>
                        <span className="text-green-500">
                          Save {rec.savings.hours} hrs
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Helper components
function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  const colorClasses = {
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
  };

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{label}</p>
        <div className={`rounded-lg p-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mb-1 text-2xl font-bold">{value}</p>
      <p className="text-muted-foreground text-xs">{subtext}</p>
    </Card>
  );
}

function MetricDisplay({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-muted-foreground mb-1 text-sm">{label}</p>
      <p className="mb-1 text-2xl font-bold">{value}</p>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  );
}

function HealthIndicator({
  label,
  value,
  status,
  benchmark,
}: {
  label: string;
  value: string;
  status: string;
  benchmark?: string;
}) {
  const statusColors = {
    excellent: 'text-green-500 bg-green-500/10',
    good: 'text-blue-500 bg-blue-500/10',
    fair: 'text-yellow-500 bg-yellow-500/10',
    poor: 'text-red-500 bg-red-500/10',
    growing: 'text-green-500 bg-green-500/10',
    stable: 'text-blue-500 bg-blue-500/10',
    declining: 'text-red-500 bg-red-500/10',
    positive: 'text-green-500 bg-green-500/10',
    negative: 'text-red-500 bg-red-500/10',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        {benchmark && <p className="text-muted-foreground text-xs">{benchmark}</p>}
      </div>
      <div className="flex items-center gap-3">
        <p className="font-semibold">{value}</p>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
            statusColors[status as keyof typeof statusColors]
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function ExpenseRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm">{label}</p>
      <p className="font-medium">${amount.toLocaleString()}</p>
    </div>
  );
}

