import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Settings, 
  Eye,
  MessageSquare,
  Heart,
  Share2,
  BarChart3,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";

const SocietyDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const societyData = {
    name: "Computer Science Society",
    status: "Active",
    memberCount: 245,
    pendingRequests: 12,
    upcomingEvents: 3,
    totalPosts: 28,
    thisMonthGrowth: 18,
    engagementRate: 4.2,
  };

  const recentPosts = [
    {
      id: 1,
      title: "Welcome New Members!",
      content: "We're excited to welcome 23 new members to our society this semester...",
      timestamp: "2 days ago",
      likes: 34,
      comments: 8,
      views: 156
    },
    {
      id: 2,
      title: "Hackathon Registration Open",
      content: "Registration is now open for our Spring Hackathon. Limited spots available...",
      timestamp: "5 days ago",
      likes: 67,
      comments: 15,
      views: 203
    }
  ];

  const upcomingEvents = [
    {
      title: "JavaScript Workshop Series",
      date: "2024-03-20",
      time: "6:00 PM",
      attendees: 45,
      status: "Published"
    },
    {
      title: "AI & Machine Learning Seminar",
      date: "2024-03-25",
      time: "5:30 PM",
      attendees: 78,
      status: "Published"
    },
    {
      title: "Spring Hackathon 2024",
      date: "2024-04-10",
      time: "9:00 AM",
      attendees: 120,
      status: "Draft"
    }
  ];

  const memberRequests = [
    { name: "Alice Johnson", email: "alice@university.edu", program: "Computer Science", year: "3rd Year" },
    { name: "Bob Chen", email: "bob@university.edu", program: "Software Engineering", year: "2nd Year" },
    { name: "Carol Davis", email: "carol@university.edu", program: "Information Technology", year: "4th Year" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{societyData.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {societyData.status}
                </Badge>
                <span className="text-white/80">{societyData.memberCount} members</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link to="/society/settings">
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
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Overview */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Members</p>
                      <p className="text-2xl font-bold text-university-navy">{societyData.memberCount}</p>
                    </div>
                    <Users className="h-8 w-8 text-university-navy" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{societyData.thisMonthGrowth} this month</span>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">  
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Requests</p>
                      <p className="text-2xl font-bold text-university-navy">{societyData.pendingRequests}</p>
                    </div>
                    <Bell className="h-8 w-8 text-university-gold" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Awaiting approval</p>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming Events</p>
                      <p className="text-2xl font-bold text-university-navy">{societyData.upcomingEvents}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-university-maroon" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Next 30 days</p>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                      <p className="text-2xl font-bold text-university-navy">{societyData.totalPosts}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-university-navy" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">All time</p>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6 shadow-card">
                <h3 className="font-semibold mb-4 text-university-navy">Quick Actions</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button variant="university" asChild>
                    <Link to="/society/post/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/society/events/create">
                      <Calendar className="h-4 w-4 mr-2" />
                      Add Event
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/society/members">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Members
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/society/analytics">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy">Recent Posts</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/society/posts">View All</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="border-b pb-4 last:border-0">
                        <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.timestamp}</span>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.views}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {post.likes}
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {post.comments}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy">Upcoming Events</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/society/events">Manage All</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge variant={event.status === 'Published' ? 'default' : 'secondary'} className="text-xs">
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {event.date} • {event.time}
                        </p>
                        <p className="text-xs text-university-gold">
                          {event.attendees} registered
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">Member Management</h2>
                <Button variant="university">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>

              {/* Pending Requests */}
              <Card className="p-6 shadow-card">
                <h3 className="font-semibold mb-4 text-university-navy">Pending Membership Requests ({memberRequests.length})</h3>
                <div className="space-y-4">
                  {memberRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{request.name}</h4>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        <p className="text-xs text-muted-foreground">{request.program} • {request.year}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="university">Accept</Button>
                        <Button size="sm" variant="outline">Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Other tabs content would be here */}
            <TabsContent value="posts">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Posts Management</h3>
                <p className="text-muted-foreground mb-4">Create and manage your society posts</p>
                <Button variant="university" asChild>
                  <Link to="/society/post/create">Create New Post</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="events">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Events Management</h3>
                <p className="text-muted-foreground mb-4">Plan and manage your society events</p>
                <Button variant="university" asChild>
                  <Link to="/society/events/create">Create New Event</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Analytics & Reports</h3>
                <p className="text-muted-foreground mb-4">Track your society's growth and engagement</p>
                <Button variant="university" asChild>
                  <Link to="/society/analytics">View Detailed Analytics</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default SocietyDashboard;
