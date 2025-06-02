import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SOSModal } from "@/components/sos-modal";
import { 
  FileText, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Shield,
  HandHeart,
  Bell,
  Users,
  BookOpen,
  Heart,
  Home,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Phone
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

  const { data: grievances } = useQuery({
    queryKey: ["/api/grievances"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: sosAlerts } = useQuery({
    queryKey: ["/api/sos"],
    enabled: !!user && user.role === 'admin',
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const getNotifications = () => {
    const notifications = [];
    
    if (user.role === 'soldier') {
      notifications.push(
        { id: 1, type: 'success', message: 'Medical Grant application approved - ₹15,000 credited', time: '2 hours ago' },
        { id: 2, type: 'info', message: 'New education schemes available for children', time: '1 day ago' }
      );
    } else if (user.role === 'family') {
      notifications.push(
        { id: 1, type: 'info', message: 'Family medical camp scheduled for next week', time: '1 day ago' },
        { id: 2, type: 'success', message: 'Emergency contact details updated successfully', time: '3 days ago' }
      );
    } else if (user.role === 'admin') {
      const pendingCount = grievances?.filter((g: any) => g.status !== 'resolved').length || 0;
      const sosCount = sosAlerts?.filter((s: any) => !s.acknowledgedAt).length || 0;
      if (pendingCount > 0) {
        notifications.push({ id: 1, type: 'warning', message: `${pendingCount} pending grievances require attention`, time: 'now' });
      }
      if (sosCount > 0) {
        notifications.push({ id: 2, type: 'alert', message: `${sosCount} unacknowledged SOS alerts`, time: 'now' });
      }
    }
    
    return notifications;
  };

  const renderRoleSpecificContent = () => {
    if (user.role === 'soldier') {
      return (
        <>
          {/* Soldier Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Active Welfare Schemes</h3>
                    <p className="text-green-100 mt-1">Browse and apply instantly</p>
                  </div>
                  <HandHeart className="h-8 w-8 text-green-200" />
                </div>
                <Link href="/schemes">
                  <Button className="mt-4 bg-white text-green-600 hover:bg-gray-100">
                    View Schemes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Apply for Scholarship</h3>
                    <p className="text-blue-100 mt-1">Education grants for children</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-200" />
                </div>
                <Link href="/schemes">
                  <Button className="mt-4 bg-white text-blue-600 hover:bg-gray-100">
                    Apply Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Emergency SOS</h3>
                    <p className="text-red-100 mt-1">Instant alert system</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-200" />
                </div>
                <Button 
                  className="mt-4 bg-white text-red-600 hover:bg-gray-100"
                  onClick={() => setShowSOSModal(true)}
                >
                  Send Alert
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Soldier Stats */}
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
                    <h4 className="text-sm font-medium text-gray-500">Under Review</h4>
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
                    <h4 className="text-sm font-medium text-gray-500">Support Requests</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.grievances || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
    } else if (user.role === 'family') {
      return (
        <>
          {/* Family Member Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Family Schemes</h3>
                    <p className="text-purple-100 mt-1">Medical, education & housing</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-200" />
                </div>
                <Link href="/schemes">
                  <Button className="mt-4 bg-white text-purple-600 hover:bg-gray-100">
                    Explore Benefits
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Emergency Contacts</h3>
                    <p className="text-pink-100 mt-1">24/7 support network</p>
                  </div>
                  <Phone className="h-8 w-8 text-pink-200" />
                </div>
                <Button className="mt-4 bg-white text-pink-600 hover:bg-gray-100">
                  <Phone className="h-4 w-4 mr-2" />
                  View Contacts
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Emergency SOS</h3>
                    <p className="text-red-100 mt-1">Instant family emergency alert</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-200" />
                </div>
                <Button 
                  className="mt-4 bg-white text-red-600 hover:bg-gray-100"
                  onClick={() => setShowSOSModal(true)}
                >
                  Send Alert
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Family Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Family Benefits</h4>
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
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Medical Covered</h4>
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
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Education Aid</h4>
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
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Home className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Housing Support</h4>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
    } else if (user.role === 'admin') {
      return (
        <>
          {/* Admin Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Pending Applications</h3>
                    <p className="text-indigo-100 mt-1">Review and approve schemes</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-indigo-200" />
                </div>
                <Button className="mt-4 bg-white text-indigo-600 hover:bg-gray-100">
                  Review ({applications?.filter((a: any) => a.status === 'pending').length || 0})
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Grievance Review</h3>
                    <p className="text-orange-100 mt-1">Resolve pending issues</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-200" />
                </div>
                <Link href="/grievances">
                  <Button className="mt-4 bg-white text-orange-600 hover:bg-gray-100">
                    Review ({grievances?.filter((g: any) => g.status !== 'resolved').length || 0})
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">SOS Alerts</h3>
                    <p className="text-red-100 mt-1">Emergency response center</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-200" />
                </div>
                <Button className="mt-4 bg-white text-red-600 hover:bg-gray-100">
                  Monitor ({sosAlerts?.filter((s: any) => !s.acknowledgedAt).length || 0})
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Total Users</h4>
                    <p className="text-2xl font-bold text-gray-900">247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Schemes Approved</h4>
                    <p className="text-2xl font-bold text-gray-900">89</p>
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
                    <h4 className="text-sm font-medium text-gray-500">Pending Review</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications?.filter((a: any) => a.status === 'pending').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Active Alerts</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {sosAlerts?.filter((s: any) => !s.acknowledgedAt).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }
  };

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
        {/* Notifications Panel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-army-green-600" />
              Recent Notifications
            </h2>
          </div>
          <div className="space-y-3">
            {getNotifications().map((notification) => (
              <Alert key={notification.id} className={
                notification.type === 'success' ? 'bg-green-50 border-green-200' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                notification.type === 'alert' ? 'bg-red-50 border-red-200' :
                'bg-blue-50 border-blue-200'
              }>
                <Bell className={`h-4 w-4 ${
                  notification.type === 'success' ? 'text-green-600' :
                  notification.type === 'warning' ? 'text-yellow-600' :
                  notification.type === 'alert' ? 'text-red-600' :
                  'text-blue-600'
                }`} />
                <AlertDescription className="flex justify-between items-center">
                  <span className={
                    notification.type === 'success' ? 'text-green-800' :
                    notification.type === 'warning' ? 'text-yellow-800' :
                    notification.type === 'alert' ? 'text-red-800' :
                    'text-blue-800'
                  }>
                    {notification.message}
                  </span>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>

        {/* Role-specific content */}
        {renderRoleSpecificContent()}

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
                    {user.role === 'admin' ? 'View All Applications' : 'Apply for Your First Scheme'}
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
