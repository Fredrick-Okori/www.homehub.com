'use client';

import React from 'react';
import { ApplicationTable } from '@/components/application-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Mail,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getAllApplications, updateApplicationStatus, type Application } from '@/lib/applications';
import { toast } from 'sonner';

export default function ApplicationsPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch applications from Supabase
  React.useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getAllApplications();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Handle approve application
  const handleApprove = async (id: string) => {
    try {
      const success = await updateApplicationStatus(id, 'approved');
      if (success) {
        toast.success('Application approved and listing hidden from public view');
        // Refresh applications
        const data = await getAllApplications();
        setApplications(data);
      } else {
        toast.error('Failed to approve application. Check console for details.');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application. Check console for details.');
    }
  };

  // Handle reject application
  const handleReject = async (id: string) => {
    try {
      const success = await updateApplicationStatus(id, 'rejected');
      if (success) {
        toast.success('Application rejected');
        // Refresh applications
        const data = await getAllApplications();
        setApplications(data);
      } else {
        toast.error('Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const stats = React.useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage property applications from customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Send Bulk Email
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Alert */}
      {stats.pending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {stats.pending} application{stats.pending > 1 ? 's' : ''} pending review
              </p>
              <p className="text-sm text-muted-foreground">
                Review and respond to applications to keep your pipeline moving
              </p>
            </div>
            <Button size="sm">Review Now</Button>
          </CardContent>
        </Card>
      )}

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ApplicationTable 
              data={applications.map((app) => ({
                id: app.id,
                listingId: app.listing_id,
                listingTitle: 'Property Listing', // You may want to join with listings table
                applicantName: `${app.surname} ${app.given_name}`,
                applicantEmail: app.email,
                applicantPhone: app.mobile_number,
                status: app.status as 'pending' | 'approved' | 'rejected',
                message: `Applied for listing ${app.listing_id}`,
                appliedAt: new Date(app.created_at).toLocaleDateString(),
              }))}
              fullApplications={applications}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Stats by Property */}
      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applications by Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                applications.reduce((acc, app) => {
                  const listingId = app.listing_id;
                  acc[listingId] = (acc[listingId] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([listingId, count]) => (
                <div key={listingId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Listing {listingId.substring(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      {applications.filter((a) => a.listing_id === listingId).length} application(s)
                    </p>
                  </div>
                  <Badge variant="outline">{count} applications</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

