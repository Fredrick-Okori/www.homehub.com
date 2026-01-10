'use client';

import React from 'react';
import { StatCard, MetricCard } from '@/components/admin-stat-card';
import { ActivityTimeline, QuickActions } from '@/components/admin-activity-timeline';
import { ApplicationTable } from '@/components/application-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

// Sample data for charts
const propertyViewsData = [
  { name: 'Mon', views: 120 },
  { name: 'Tue', views: 150 },
  { name: 'Wed', views: 180 },
  { name: 'Thu', views: 220 },
  { name: 'Fri', views: 190 },
  { name: 'Sat', views: 250 },
  { name: 'Sun', views: 200 },
];

const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const propertyTypeData = [
  { name: 'Houses', value: 45, color: '#3b82f6' },
  { name: 'Apartments', value: 30, color: '#10b981' },
  { name: 'Condos', value: 15, color: '#f59e0b' },
  { name: 'Townhouses', value: 10, color: '#8b5cf6' },
];

// Sample applications data
const sampleApplications = [
  {
    id: '1',
    applicantName: 'John Smith',
    applicantEmail: 'john.smith@email.com',
    applicantPhone: '(555) 123-4567',
    listingTitle: 'Modern Downtown Loft',
    status: 'pending' as const,
    appliedAt: '2024-01-15',
    message: 'I am very interested in this property and would like to schedule a viewing.',
  },
  {
    id: '2',
    applicantName: 'Sarah Johnson',
    applicantEmail: 'sarah.j@email.com',
    applicantPhone: '(555) 234-5678',
    listingTitle: 'Beachfront Luxury Condo',
    status: 'approved' as const,
    appliedAt: '2024-01-14',
    message: 'Looking for a family home with ocean view.',
  },
  {
    id: '3',
    applicantName: 'Michael Brown',
    applicantEmail: 'm.brown@email.com',
    applicantPhone: '(555) 345-6789',
    listingTitle: 'Suburban Family Home',
    status: 'pending' as const,
    appliedAt: '2024-01-13',
    message: 'Interested in the property for investment purposes.',
  },
  {
    id: '4',
    applicantName: 'Emily Davis',
    applicantEmail: 'emily.d@email.com',
    applicantPhone: '(555) 456-7890',
    listingTitle: 'Luxury Mountain Cabin',
    status: 'rejected' as const,
    appliedAt: '2024-01-12',
    message: 'Would like more information about the neighborhood.',
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to the HomeHub admin dashboard.</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Properties"
          value="156"
          trend={{ value: '+12%', direction: 'up' }}
          icon={Building2}
        />
        <StatCard
          title="Active Listings"
          value="89"
          trend={{ value: '+8%', direction: 'up' }}
          icon={Home}
        />
        <StatCard
          title="Total Applications"
          value="234"
          trend={{ value: '+23%', direction: 'up' }}
          icon={FileText}
        />
        <StatCard
          title="Total Revenue"
          value="$2.4M"
          trend={{ value: '+15%', direction: 'up' }}
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Property Views Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Property Views This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                views: {
                  label: 'Views',
                  color: 'h(var(--primary))',
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={propertyViewsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'h(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'h(var(--muted-foreground))' }}
                />
                <ChartTooltipContent />
                <Bar 
                  dataKey="views" 
                  fill="h(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Property Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Houses: { label: 'Houses', color: '#3b82f6' },
                Apartments: { label: 'Apartments', color: '#10b981' },
                Condos: { label: 'Condos', color: '#f59e0b' },
                Townhouses: { label: 'Townhouses', color: '#8b5cf6' },
              }}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltipContent />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {propertyTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart and Activity Timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: 'Revenue',
                  color: 'h(var(--primary))',
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fill: 'h(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'h(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <ChartTooltipContent 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="h(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'h(var(--primary))' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <div className="space-y-6">
          <ActivityTimeline />
          <QuickActions />
        </div>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Applications
            </CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ApplicationTable data={sampleApplications} />
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Pending Reviews"
          value="12"
          subValue="Applications waiting"
          icon={FileText}
          color="orange"
        />
        <MetricCard
          label="Scheduled Viewings"
          value="8"
          subValue="This week"
          icon={Calendar}
          color="blue"
        />
        <MetricCard
          label="New This Month"
          value="24"
          subValue="New listings"
          icon={Home}
          color="green"
        />
        <MetricCard
          label="Avg. Days on Market"
          value="18"
          subValue="Days average"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New property listing created', item: 'Modern Downtown Loft', time: '2 hours ago', type: 'create' },
              { action: 'Price updated', item: 'Beachfront Luxury Condo', time: '4 hours ago', type: 'update' },
              { action: 'Application approved', item: 'Suburban Family Home', time: '5 hours ago', type: 'approve' },
              { action: 'Property marked as sold', item: 'Luxury Mountain Cabin', time: '1 day ago', type: 'sold' },
              { action: 'New admin user added', item: 'jane.doe@homehub.com', time: '2 days ago', type: 'user' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  activity.type === 'create' ? 'bg-green-100 text-green-600' :
                  activity.type === 'update' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'approve' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'sold' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'create' && <Home className="h-5 w-5" />}
                  {activity.type === 'update' && <TrendingUp className="h-5 w-5" />}
                  {activity.type === 'approve' && <Users className="h-5 w-5" />}
                  {activity.type === 'sold' && <DollarSign className="h-5 w-5" />}
                  {activity.type === 'user' && <Users className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.item}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.time}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

