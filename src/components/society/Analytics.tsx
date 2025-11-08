import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageCircle,
  Download,
  Eye,
  Heart,
  Share2,
  UserPlus,
  Activity
} from "lucide-react";

const Analytics = () => {
  const membershipStats = {
    totalMembers: 245,
    newThisMonth: 18,
    activeMembers: 189,
    growthRate: "+12.5%"
  };

  const engagementStats = {
    totalPosts: 42,
    totalLikes: 1247,
    totalComments: 318,
    totalShares: 156,
    avgEngagement: "8.2%"
  };

  const eventStats = {
    totalEvents: 12,
    upcomingEvents: 3,
    completedEvents: 9,
    totalAttendance: 1456,
    avgAttendance: 162
  };

  const recentActivity = [
    {
      type: "member_join",
      description: "5 new members joined",
      timestamp: "2 hours ago",
      icon: UserPlus
    },
    {
      type: "post_engagement",
      description: "Tech Summit post reached 50 likes",
      timestamp: "4 hours ago",
      icon: Heart
    },
    {
      type: "event_registration",
      description: "React Workshop: 15 new registrations",
      timestamp: "6 hours ago",
      icon: Calendar
    },
    {
      type: "post_created",
      description: "New post: 'Welcome New Members'",
      timestamp: "1 day ago",
      icon: MessageCircle
    }
  ];

  const topPosts = [
    {
      title: "Tech Innovation Summit 2024 - Registration Open",
      likes: 89,
      comments: 24,
      shares: 15,
      views: 456,
      engagement: "19.5%"
    },
    {
      title: "Welcome New Members to CS Society!",
      likes: 67,
      comments: 18,
      shares: 8,
      views: 312,
      engagement: "29.8%"
    },
    {
      title: "Hackathon 2024 Results Announcement",
      likes: 54,
      comments: 12,
      shares: 22,
      views: 298,
      engagement: "29.5%"
    }
  ];

  const membershipData = [
    { month: "Oct", members: 198 },
    { month: "Nov", members: 215 },
    { month: "Dec", members: 227 },
    { month: "Jan", members: 234 },
    { month: "Feb", members: 238 },
    { month: "Mar", members: 245 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-4 md:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-bold mb-2">Society Analytics</h1>
              <p className="text-white/90 text-sm md:text-base hidden md:block">Track your society's growth and engagement</p>
            </div>
          </div>
        </div>
      </header>

      {/* Export Button */}
      <section className="py-4 md:py-6 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center md:justify-start">
            <Button variant="university" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Stats */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-navy/10 p-3 rounded-full w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-university-navy" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{membershipStats.totalMembers}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
              <div className="text-xs text-university-gold font-medium mt-1">{membershipStats.growthRate}</div>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-gold/10 p-3 rounded-full w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-university-gold" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{engagementStats.avgEngagement}</div>
              <div className="text-sm text-muted-foreground">Avg Engagement</div>
              <div className="text-xs text-university-gold font-medium mt-1">+2.3%</div>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-maroon/10 p-3 rounded-full w-fit mx-auto mb-3">
                <Calendar className="h-6 w-6 text-university-maroon" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{eventStats.totalEvents}</div>
              <div className="text-sm text-muted-foreground">Events This Year</div>
              <div className="text-xs text-university-gold font-medium mt-1">+3 from last year</div>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-navy/10 p-3 rounded-full w-fit mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-university-navy" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{engagementStats.totalPosts}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
              <div className="text-xs text-university-gold font-medium mt-1">+8 this month</div>
            </Card>
          </div>

          <Tabs defaultValue="membership" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="membership">Membership</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="membership" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Membership Growth</h3>
                  <div className="space-y-4">
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Membership growth chart would be displayed here</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-university-navy">{membershipStats.newThisMonth}</div>
                        <div className="text-muted-foreground">New This Month</div>
                      </div>
                      <div>
                        <div className="font-semibold text-university-navy">{membershipStats.activeMembers}</div>
                        <div className="text-muted-foreground">Active Members</div>
                      </div>
                      <div>
                        <div className="font-semibold text-university-navy">{membershipStats.growthRate}</div>
                        <div className="text-muted-foreground">Growth Rate</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Member Demographics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Computer Science</span>
                        <span>35%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-university-navy h-2 rounded-full" style={{ width: "35%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Engineering</span>
                        <span>28%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-university-gold h-2 rounded-full" style={{ width: "28%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Business</span>
                        <span>22%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-university-maroon h-2 rounded-full" style={{ width: "22%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Other</span>
                        <span>15%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-muted-foreground h-2 rounded-full" style={{ width: "15%" }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Post Performance</h3>
                  <div className="space-y-4">
                    {topPosts.map((post, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">{post.title}</h4>
                        <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {post.views}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {post.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {post.comments}
                          </div>
                          <div className="flex items-center">
                            <Share2 className="h-3 w-3 mr-1" />
                            {post.shares}
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Engagement Rate</div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-university-gold h-2 rounded-full" 
                              style={{ width: post.engagement }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Engagement Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{engagementStats.totalLikes}</div>
                      <div className="text-sm text-muted-foreground">Total Likes</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{engagementStats.totalComments}</div>
                      <div className="text-sm text-muted-foreground">Total Comments</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{engagementStats.totalShares}</div>
                      <div className="text-sm text-muted-foreground">Total Shares</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{engagementStats.avgEngagement}</div>
                      <div className="text-sm text-muted-foreground">Avg Engagement</div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Event Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{eventStats.totalEvents}</div>
                      <div className="text-sm text-muted-foreground">Total Events</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{eventStats.totalAttendance}</div>
                      <div className="text-sm text-muted-foreground">Total Attendance</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{eventStats.avgAttendance}</div>
                      <div className="text-sm text-muted-foreground">Avg Attendance</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{eventStats.upcomingEvents}</div>
                      <div className="text-sm text-muted-foreground">Upcoming</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Event Attendance Trends</h3>
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Event attendance chart would be displayed here</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="p-6 shadow-card">
                <h3 className="font-semibold text-university-navy mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="bg-university-navy/10 p-2 rounded-lg">
                          <Icon className="h-4 w-4 text-university-navy" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Analytics;