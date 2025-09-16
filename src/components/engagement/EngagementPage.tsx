import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Bookmark,
  Eye,
  TrendingUp,
  Clock
} from "lucide-react";

const EngagementPage = () => {
  const [activeTab, setActiveTab] = useState("latest");

  const posts = [
    {
      id: 1,
      type: "text",
      title: "Welcome New Members!",
      content: "We're excited to welcome 25 new members to our Computer Science Society! Looking forward to an amazing semester filled with coding workshops, hackathons, and tech talks.",
      author: "Computer Science Society",
      authorAvatar: "CS",
      timestamp: "2 hours ago",
      likes: 45,
      comments: 12,
      shares: 8,
      tags: ["Welcome", "NewMembers", "Community"]
    },
    {
      id: 2,
      type: "poll",
      title: "What topic should our next workshop cover?",
      content: "",
      author: "Business Society",
      authorAvatar: "BS",
      timestamp: "4 hours ago",
      likes: 32,
      comments: 18,
      shares: 5,
      pollOptions: [
        { option: "Digital Marketing Strategies", votes: 42 },
        { option: "Financial Planning for Startups", votes: 38 },
        { option: "Leadership & Team Management", votes: 29 },
        { option: "Investment & Portfolio Management", votes: 25 }
      ],
      tags: ["Workshop", "Poll", "BusinessSkills"]
    },
    {
      id: 3,
      type: "photo",
      title: "Cultural Night 2024 - Behind the Scenes",
      content: "Here are some amazing moments from our Cultural Night preparation. The dedication and talent of our members never cease to amaze us!",
      author: "International Students Society",
      authorAvatar: "IS",
      timestamp: "1 day ago",
      likes: 89,
      comments: 24,
      shares: 15,
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",
      tags: ["CulturalNight", "Community", "Diversity"]
    }
  ];

  const renderPostContent = (post: any) => {
    switch (post.type) {
      case "poll":
        const totalVotes = post.pollOptions.reduce((sum: number, option: any) => sum + option.votes, 0);
        return (
          <div className="space-y-3">
            <p className="text-sm font-medium mb-3">Vote for your preferred topic:</p>
            {post.pollOptions.map((option: any, index: number) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>{option.option}</span>
                    <span className="text-muted-foreground">{option.votes} votes</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-university-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">{totalVotes} total votes</p>
          </div>
        );
      
      case "photo":
        return (
          <div className="space-y-3">
            <p className="text-sm">{post.content}</p>
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full rounded-lg object-cover max-h-96"
            />
          </div>
        );
      
      default:
        return <p className="text-sm">{post.content}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Society Feed</h1>
          <p className="text-white/90">Stay updated with the latest from all your societies</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="p-6 shadow-card">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-navy text-white">
                        {post.authorAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{post.author}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.timestamp}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Title */}
                <h2 className="text-lg font-bold mb-3 text-university-navy">{post.title}</h2>

                {/* Post Content */}
                <div className="mb-4">
                  {renderPostContent(post)}
                </div>

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-university-maroon transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-university-navy transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-university-gold transition-colors">
                      <Share2 className="h-4 w-4" />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <Card className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Trending Posts</h3>
              <p className="text-muted-foreground">Discover the most popular content across all societies</p>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <Card className="p-6 text-center">
              <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Following</h3>
              <p className="text-muted-foreground">Posts from societies you follow</p>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card className="p-6 text-center">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Saved Posts</h3>
              <p className="text-muted-foreground">Your bookmarked posts and content</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EngagementPage;