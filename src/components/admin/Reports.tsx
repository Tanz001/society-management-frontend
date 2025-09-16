import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MessageCircle,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Eye
} from "lucide-react";

const Reports = () => {
  const overviewStats = {
    totalSocieties: 47,
    totalMembers: 1834,
    totalPosts: 342,
    totalEvents: 89,
    monthlyGrowth: "+12.5%"
  };

  const monthlyData = [
    { month: "Jan", societies: 42, members: 1456, posts: 287, events: 23 },
    { month: "Feb", societies: 44, members: 1623, posts: 315, events: 28 },
    { month: "Mar", societies: 47, members: 1834, posts: 342, events: 38 }
  ];

  const topSocieties = [
    {
      name: "Computer Science Society",
      members: 245,
      posts: 42,
      events: 12,
      engagement: "94.2%"
    },
    {
      name: "International Students Society",
      members: 189,
      posts: 28,
      events: 8,
      engagement: "87.6%"
    },
    {
      name: "Business Society",
      members: 156,
      posts: 23,
      events: 6,
      engagement: "82.1%"
    },
    {
      name: "Environmental Club",
      members: 134,
      posts: 18,
      events: 7,
      engagement: "79.3%"
    },
    {
      name: "Photography Society",
      members: 98,
      posts: 31,
      events: 4,
      engagement: "91.5%"
    }
  ];

  const categoryBreakdown = [
    { category: "Technology", count: 12, percentage: 25.5 },
    { category: "Cultural", count: 8, percentage: 17.0 },
    { category: "Academic", count: 7, percentage: 14.9 },
    { category: "Sports", count: 6, percentage: 12.8 },
    { category: "Arts", count: 5, percentage: 10.6 },
    { category: "Business", count: 4, percentage: 8.5 },
    { category: "Other", count: 5, percentage: 10.6 }
  ];

  const engagementMetrics = {
    avgPostsPerSociety: 7.3,
    avgEventsPerSociety: 1.9,
    avgMembersPerSociety: 39,
    overallEngagementRate: "85.7%"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
              <p className="text-white/90">Comprehensive insights into university societies</p>
            </div>
            <Button variant="hero">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      {/* Overview Stats */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-navy/10 p-3 rounded-full w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-university-navy" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{overviewStats.totalSocieties}</div>
              <div className="text-sm text-muted-foreground">Total Societies</div>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-gold/10 p-3 rounded-full w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-university-gold" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{overviewStats.totalMembers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
              <div className="text-xs text-university-gold font-medium mt-1">{overviewStats.monthlyGrowth}</div>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-maroon/10 p-3 rounded-full w-fit mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-university-maroon" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{overviewStats.totalPosts}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-navy/10 p-3 rounded-full w-fit mx-auto mb-3">
                <Calendar className="h-6 w-6 text-university-navy" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{overviewStats.totalEvents}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </Card>

            <Card className="p-6 text-center shadow-card">
              <div className="bg-university-gold/10 p-3 rounded-full w-fit mx-auto mb-3">
                <Activity className="h-6 w-6 text-university-gold" />
              </div>
              <div className="text-2xl font-bold text-university-navy">{engagementMetrics.overallEngagementRate}</div>
              <div className="text-sm text-muted-foreground">Engagement Rate</div>
            </Card>
          </div>

          <Tabs defaultValue="growth" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="growth">Growth Trends</TabsTrigger>
              <TabsTrigger value="societies">Top Societies</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>

            <TabsContent value="growth" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Monthly Growth Trends</h3>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Growth trends chart would be displayed here</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-university-navy">+5</div>
                      <div className="text-muted-foreground">New Societies</div>
                    </div>
                    <div>
                      <div className="font-semibold text-university-navy">+211</div>
                      <div className="text-muted-foreground">New Members</div>
                    </div>
                    <div>
                      <div className="font-semibold text-university-navy">+55</div>
                      <div className="text-muted-foreground">New Posts</div>
                    </div>
                    <div>
                      <div className="font-semibold text-university-navy">+15</div>
                      <div className="text-muted-foreground">New Events</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Key Performance Indicators</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Society Growth Rate</span>
                        <span className="font-medium text-university-gold">+12.5%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-university-gold h-2 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Member Retention Rate</span>
                        <span className="font-medium text-university-navy">92.3%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-university-navy h-2 rounded-full" style={{ width: "92%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Event Participation Rate</span>
                        <span className="font-medium text-university-maroon">78.6%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-university-maroon h-2 rounded-full" style={{ width: "79%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Content Engagement Rate</span>
                        <span className="font-medium text-university-gold">85.7%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-university-gold h-2 rounded-full" style={{ width: "86%" }} />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="societies" className="space-y-6">
              <Card className="p-6 shadow-card">
                <h3 className="font-semibold text-university-navy mb-4">Top Performing Societies</h3>
                <div className="space-y-4">
                  {topSocieties.map((society, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-university-navy text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{society.name}</h4>
                          <div className="text-sm text-muted-foreground">
                            {society.members} members • {society.posts} posts • {society.events} events
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-university-gold">{society.engagement}</div>
                        <div className="text-xs text-muted-foreground">Engagement Rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Society Categories Distribution</h3>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Category distribution chart would be displayed here</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Category Breakdown</h3>
                  <div className="space-y-3">
                    {categoryBreakdown.map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.category}</span>
                          <span>{category.count} societies ({category.percentage}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-university-gold h-2 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Engagement Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{engagementMetrics.avgPostsPerSociety}</div>
                      <div className="text-sm text-muted-foreground">Avg Posts per Society</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{engagementMetrics.avgEventsPerSociety}</div>
                      <div className="text-sm text-muted-foreground">Avg Events per Society</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{engagementMetrics.avgMembersPerSociety}</div>
                      <div className="text-sm text-muted-foreground">Avg Members per Society</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-university-navy">{engagementMetrics.overallEngagementRate}</div>
                      <div className="text-sm text-muted-foreground">Overall Engagement</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <h3 className="font-semibold text-university-navy mb-4">Content Performance</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Most Liked Post Type</span>
                        <span className="text-university-gold">Photo Posts</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Average 45 likes per photo post</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Most Commented Post Type</span>
                        <span className="text-university-gold">Poll Posts</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Average 18 comments per poll</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Peak Activity Time</span>
                        <span className="text-university-gold">2-4 PM</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Highest engagement during afternoon hours</div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Reports;