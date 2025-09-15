import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Building, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  BarChart3,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const stats = {
    totalSocieties: 156,
    activeSocieties: 142,
    pendingSocieties: 8,
    suspendedSocieties: 6,
    totalUsers: 2840,
    activeUsers: 2654,
    totalPosts: 1248,
    flaggedPosts: 12,
    totalEvents: 89,
    upcomingEvents: 23,
    monthlyGrowth: 12,
    engagementRate: 4.7
  };

  const pendingSocieties = [
    {
      id: 1,
      name: "Robotics Engineering Society",
      category: "Academic",
      submittedBy: "John Smith",
      submittedDate: "2024-03-15",
      memberCount: 0,
      status: "Under Review"
    },
    {
      id: 2,
      name: "Cultural Dance Group",
      category: "Cultural",
      submittedBy: "Maria Garcia",
      submittedDate: "2024-03-14",
      memberCount: 0,
      status: "Under Review"
    },
    {
      id: 3,
      name: "Debate Society",
      category: "Academic",
      submittedBy: "David Wilson",
      submittedDate: "2024-03-12",
      memberCount: 0,
      status: "Under Review"
    }
  ];

  const flaggedContent = [
    {
      id: 1,
      type: "post",
      title: "Inappropriate content in CS Society",
      society: "Computer Science Society",
      reportedBy: "Anonymous",
      reportedDate: "2024-03-16",
      reason: "Spam",
      status: "Pending"
    },
    {
      id: 2,
      type: "comment",
      title: "Offensive language in event discussion",
      society: "Drama Club",
      reportedBy: "Alice Johnson",
      reportedDate: "2024-03-15",
      reason: "Harassment",
      status: "Under Review"
    }
  ];

  const recentActivity = [
    { action: "New society approved", item: "Photography Club", time: "2 hours ago", type: "success" },
    { action: "Post flagged for review", item: "Business Society", time: "4 hours ago", type: "warning" },
    { action: "User account suspended", item: "user@example.com", time: "6 hours ago", type: "error" },
    { action: "New society application", item: "Gaming Society", time: "1 day ago", type: "info" },
    { action: "Event reported", item: "Annual Hackathon", time: "2 days ago", type: "warning" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Administrator Dashboard</h1>
              <p className="text-white/80">University Societies Management System</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20">
                <Bell className="h-4 w-4 mr-2" />
                Alerts ({stats.flaggedPosts})
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="societies">Societies</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Overview */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Societies</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.totalSocieties}</p>
                    </div>
                    <Building className="h-8 w-8 text-university-navy" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{stats.monthlyGrowth}% this month</span>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-university-gold" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{stats.activeUsers} active</p>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Reviews</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.pendingSocieties}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-university-maroon" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Societies awaiting approval</p>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Flagged Content</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.flaggedPosts}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-university-maroon" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Requiring attention</p>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6 shadow-card">
                <h3 className="font-semibold mb-4 text-university-navy">Quick Actions</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button variant="university" asChild>
                    <Link to="/admin/societies/pending">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Review Societies
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/admin/moderation">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Moderate Content
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/admin/users">
                      <Users className="h-4 w-4 mr-2" />
                      User Management
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/admin/reports">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Reports
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Recent Activity & Pending Items */}
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy">Pending Society Applications</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/societies/pending">View All</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {pendingSocieties.map((society) => (
                      <div key={society.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{society.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {society.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Category: {society.category} • By: {society.submittedBy}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Submitted: {society.submittedDate}
                        </p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="university" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy">Recent Activity</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/activity">View All</Link>
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'success' ? 'bg-green-500' :
                          activity.type === 'warning' ? 'bg-yellow-500' :
                          activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.item}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="societies" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">Society Management</h2>
                <div className="flex space-x-2">
                  <Button variant="outline">Export Data</Button>
                  <Button variant="university">Create Society</Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 shadow-card text-center">
                  <Building className="h-12 w-12 mx-auto mb-4 text-university-navy" />
                  <h3 className="text-lg font-semibold mb-2">Active Societies</h3>
                  <p className="text-2xl font-bold text-university-navy mb-2">{stats.activeSocieties}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/societies/active">Manage</Link>
                  </Button>
                </Card>

                <Card className="p-6 shadow-card text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-university-gold" />
                  <h3 className="text-lg font-semibold mb-2">Pending Approval</h3>
                  <p className="text-2xl font-bold text-university-navy mb-2">{stats.pendingSocieties}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/societies/pending">Review</Link>
                  </Button>
                </Card>

                <Card className="p-6 shadow-card text-center">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-university-maroon" />
                  <h3 className="text-lg font-semibold mb-2">Suspended</h3>
                  <p className="text-2xl font-bold text-university-navy mb-2">{stats.suspendedSocieties}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/societies/suspended">Manage</Link>
                  </Button>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">User Management</h3>
                <p className="text-muted-foreground mb-4">Manage student accounts, society owners, and permissions</p>
                <Button variant="university">Manage Users</Button>
              </div>
            </TabsContent>

            <TabsContent value="moderation">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-university-navy">Content Moderation</h2>
                  <Button variant="university">View All Reports</Button>
                </div>

                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold mb-4 text-university-navy">Flagged Content ({flaggedContent.length})</h3>
                  <div className="space-y-4">
                    {flaggedContent.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.society} • Reported by {item.reportedBy}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.reportedDate} • Reason: {item.reason}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="university">Review</Button>
                          <Button size="sm" variant="outline">Dismiss</Button>
                          <Button size="sm" variant="destructive">Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Analytics & Reports</h3>
                <p className="text-muted-foreground mb-4">Platform usage statistics and growth reports</p>
                <Button variant="university">Generate Reports</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;