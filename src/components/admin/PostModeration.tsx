import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Flag, 
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Heart,
  Share2,
  AlertTriangle,
  Shield
} from "lucide-react";

const PostModeration = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const posts = [
    {
      id: 1,
      title: "Welcome New Members to CS Society!",
      content: "We're excited to welcome 25 new members to our Computer Science Society! Looking forward to an amazing semester filled with coding workshops, hackathons, and tech talks.",
      author: "Computer Science Society",
      authorAvatar: "CS",
      timestamp: "2 hours ago",
      likes: 45,
      comments: 12,
      shares: 8,
      status: "approved",
      reports: 0,
      type: "text",
      society: "Computer Science Society"
    },
    {
      id: 2,
      title: "Inappropriate Content Warning",
      content: "This post contains content that may violate our community guidelines regarding respectful communication.",
      author: "Anonymous User",
      authorAvatar: "AU",
      timestamp: "4 hours ago",
      likes: 3,
      comments: 2,
      shares: 0,
      status: "reported",
      reports: 5,
      type: "text",
      society: "General Discussion",
      reportReasons: ["Inappropriate Language", "Harassment", "Spam"]
    },
    {
      id: 3,
      title: "Cultural Night 2024 - Behind the Scenes",
      content: "Here are some amazing moments from our Cultural Night preparation. The dedication and talent of our members never cease to amaze us!",
      author: "International Students Society",
      authorAvatar: "IS",
      timestamp: "1 day ago",
      likes: 89,
      comments: 24,
      shares: 15,
      status: "approved",
      reports: 0,
      type: "photo",
      society: "International Students Society",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400"
    },
    {
      id: 4,
      title: "Spam Content Detection",
      content: "Buy cheap textbooks here! Click this link now for amazing deals! Limited time offer!!! Don't miss out!!!",
      author: "Suspicious Account",
      authorAvatar: "SA",
      timestamp: "6 hours ago",
      likes: 0,
      comments: 0,
      shares: 0,
      status: "pending_review",
      reports: 8,
      type: "text",
      society: "Student Marketplace",
      reportReasons: ["Spam", "Commercial Content", "Suspicious Activity"]
    },
    {
      id: 5,
      title: "Tech Innovation Poll Results",
      content: "",
      author: "Business Society",
      authorAvatar: "BS",
      timestamp: "2 days ago",
      likes: 32,
      comments: 18,
      shares: 5,
      status: "approved",
      reports: 0,
      type: "poll",
      society: "Business Society"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "reported": return "destructive";
      case "pending_review": return "secondary";
      case "removed": return "outline";
      default: return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return MessageCircle;
      case "photo": return Eye;
      case "poll": return Flag;
      default: return MessageCircle;
    }
  };

  const approvedPosts = posts.filter(p => p.status === "approved");
  const reportedPosts = posts.filter(p => p.status === "reported");
  const pendingPosts = posts.filter(p => p.status === "pending_review");
  const flaggedPosts = posts.filter(p => p.reports > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Post Moderation</h1>
              <p className="text-white/90">Monitor and moderate society posts and content</p>
            </div>
            <div className="flex gap-2">
              <Button variant="hero">
                <Shield className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="py-8 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-navy">{posts.length}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{flaggedPosts.length}</div>
              <div className="text-sm text-muted-foreground">Flagged Posts</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-maroon">{pendingPosts.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-navy">{approvedPosts.length}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {posts.map((post) => {
              const TypeIcon = getTypeIcon(post.type);
              return (
                <Card key={post.id} className="p-6 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-university-navy text-white">
                          {post.authorAvatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-university-navy">{post.author}</h3>
                          <Badge variant={getStatusColor(post.status)}>
                            {post.status.replace("_", " ").charAt(0).toUpperCase() + post.status.replace("_", " ").slice(1)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TypeIcon className="h-3 w-3" />
                            {post.type}
                          </Badge>
                          {post.reports > 0 && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              {post.reports} reports
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium mb-2">{post.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                        
                        {post.image && (
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full max-w-md rounded-lg mb-3"
                          />
                        )}

                        {post.reportReasons && (
                          <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">Report Reasons:</div>
                            <div className="flex flex-wrap gap-1">
                              {post.reportReasons.map((reason, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments}
                            </div>
                            <div className="flex items-center">
                              <Share2 className="h-4 w-4 mr-1" />
                              {post.shares}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {post.timestamp}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {post.society}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {post.status === "reported" || post.status === "pending_review" ? (
                        <>
                          <Button variant="university" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Flag className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="flagged" className="space-y-4">
            {flaggedPosts.map((post) => (
              <Card key={post.id} className="p-6 shadow-card border-destructive">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-destructive text-white">
                        {post.authorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-university-navy">{post.author}</h3>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {post.reports} reports
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-2">{post.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                      {post.reportReasons && (
                        <div className="flex flex-wrap gap-1">
                          {post.reportReasons.map((reason, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="university" size="sm">Approve</Button>
                    <Button variant="destructive" size="sm">Remove</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingPosts.map((post) => (
              <Card key={post.id} className="p-6 shadow-card border-university-maroon">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-maroon text-white">
                        {post.authorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{post.author}</h3>
                      <h4 className="font-medium mb-2">{post.title}</h4>
                      <p className="text-sm text-muted-foreground">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Review</Button>
                    <Button variant="university" size="sm">Approve</Button>
                    <Button variant="destructive" size="sm">Reject</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedPosts.map((post) => (
              <Card key={post.id} className="p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-navy text-white">
                        {post.authorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{post.author}</h3>
                      <h4 className="font-medium mb-1">{post.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {post.comments}
                        </div>
                        <div>{post.timestamp}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      Flag
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PostModeration;