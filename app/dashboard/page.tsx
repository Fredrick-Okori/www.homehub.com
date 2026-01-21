'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { StatCard, MetricCard } from '@/components/admin-stat-card';
import { ActivityTimeline } from '@/components/admin-activity-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Home, 
  FileText, 
  DollarSign,
  Eye,
  Download,
  LogOut,
  Users,
  TrendingUp,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getDashboardStats,
  getRecentApplications,
  formatCurrency,
  type DashboardStats,
  type RecentApplication,
} from '@/lib/dashboard-data';

export default function DashboardPage() {
  const { signOut, user } = useAuth();
  
  // State for dashboard data
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = React.useState<RecentApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch all dashboard data on mount
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel
        const [statsResult, appsResult] = await Promise.all([
          getDashboardStats().catch(err => {
            console.error('Error fetching stats:', err);
            return null;
          }),
          getRecentApplications(5).catch(err => {
            console.error('Error fetching recent apps:', err);
            return [];
          }),
        ]);

        setStats(statsResult);
        setRecentApplications(appsResult);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        toast.error('Failed to load some dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  // Format currency helper
  const formatValue = (value: number | null | undefined, type: 'number' | 'currency' = 'number'): string => {
    if (value === null || value === undefined) return '0';
    if (type === 'currency') {
      return formatCurrency(value);
    }
    return value.toLocaleString();
  };

  // Calculate trend percentage
  const calculateTrend = (current: number, previousRatio: number = 0.15): { value: string; direction: 'up' | 'down' } => {
    const previous = Math.round(current / (1 + previousRatio));
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change >= 0 ? '+' : ''}${Math.round(change)}%`,
      direction: change >= 0 ? 'up' : 'down',
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.email?.split('@')[0] || 'Admin'}! Here's your overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Listings"
          value={formatValue(stats?.totalListings, 'number')}
          trend={calculateTrend(stats?.totalListings || 0)}
          icon={Building2}
        />
        <StatCard
          title="Available"
          value={formatValue(stats?.activeListings, 'number')}
          trend={calculateTrend(stats?.activeListings || 0)}
          icon={Home}
        />
        <StatCard
          title="Applications"
          value={formatValue(stats?.totalApplications, 'number')}
          trend={calculateTrend(stats?.totalApplications || 0)}
          icon={FileText}
        />
        <StatCard
          title="Revenue"
          value={formatValue(stats?.totalRevenue, 'currency')}
          trend={calculateTrend(stats?.totalRevenue || 0)}
          icon={DollarSign}
        />
      </div>

      {/* Activity Timeline and Recent Applications */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Recent Applications
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard/applications">
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{app.surname} {app.given_name}</p>
                          <p className="text-sm text-gray-500">{app.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            app.status === 'approved'
                              ? 'default'
                              : app.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {app.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent applications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-6">
          <ActivityTimeline />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Pending Reviews"
          value={formatValue(stats?.pendingApplications, 'number')}
          subValue="Applications waiting"
          icon={FileText}
          color="orange"
        />
        <MetricCard
          label="Approved"
          value={formatValue(stats?.approvedApplications, 'number')}
          subValue="Applications approved"
          icon={Users}
          color="green"
        />
        <MetricCard
          label="Available"
          value={formatValue(stats?.activeListings, 'number')}
          subValue="Active listings"
          icon={Home}
          color="blue"
        />
        <MetricCard
          label="Avg. Days"
          value={formatValue(stats?.avgDaysOnMarket, 'number')}
          subValue="Days on market"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Available</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatValue(stats?.activeListings, 'number')}
                </p>
              </div>
              <Home className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {formatValue(stats?.pendingListings, 'number')}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Taken</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatValue(stats?.takenListings, 'number')}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary">Sold</p>
                <p className="text-2xl font-bold text-primary">
                  {formatValue(stats?.soldListings, 'number')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

