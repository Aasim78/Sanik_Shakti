import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SOSModal } from "@/components/sos-modal";
import { 
  FileText, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Shield,
  HandHeart
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user } = useAuth();
  const [showSOSModal, setShowSOSModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, <span className="font-medium">{user.fullName}</span></p>
            </div>
            <Badge variant="secondary" className="bg-army-green-100 text-army-green-800">
              <Shield className="h-3 w-3 mr-1" />
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Apply for Scheme</h3>
                  <p className="text-green-100 mt-1">Browse and apply for welfare schemes</p>
                </div>
                <HandHeart className="h-8 w-8 text-green-200" />
              </div>
              <Link href="/schemes">
                <Button className="mt-4 bg-white text-green-600 hover:bg-gray-100">
                  Browse Schemes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">SOS Alert</h3>
                  <p className="text-red-100 mt-1">Emergency assistance network</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
              <Button 
                className="mt-4 bg-white text-red-600 hover:bg-gray-100"
                onClick={() => setShowSOSModal(true)}
              >
                Send SOS Alert
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Submit Grievance</h3>
                  <p className="text-blue-100 mt-1">Report issues and track progress</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-200" />
              </div>
              <Link href="/grievances">
                <Button className="mt-4 bg-white text-blue-600 hover:bg-gray-100">
                  File Grievance
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-army-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-army-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Active Applications</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.activeApplications || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Approved</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.approved || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Pending</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.pending || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-500">Grievances</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stats?.grievances || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading recent activities...</div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application: any) => (
                  <div key={application.id} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className={`p-2 rounded-full ${
                      application.status === 'approved' ? 'bg-green-100' :
                      application.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {application.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : application.status === 'pending' ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {application.scheme?.title || 'Application'} - {application.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        Applied on {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={application.status === 'approved' ? 'default' : 'secondary'}
                      className={
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activities found</p>
                <Link href="/schemes">
                  <Button className="mt-4 bg-army-green-600 hover:bg-army-green-700">
                    Apply for Your First Scheme
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SOSModal isOpen={showSOSModal} onClose={() => setShowSOSModal(false)} />
    </div>
  );
}
