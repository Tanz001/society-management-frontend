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
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Calendar,
  MessageCircle,
  Shield,
  AlertTriangle
} from "lucide-react";

const SocietyManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const societies = [
    {
      id: 1,
      name: "Computer Science Society",
      status: "active",
      members: 245,
      president: "John Doe",
      email: "cs.society@university.edu",
      registrationDate: "2023-09-15",
      lastActivity: "2 hours ago",
      posts: 42,
      events: 12,
      avatar: "CS",
      category: "Technology"
    },
    {
      id: 2,
      name: "Business Society",
      status: "pending",
      members: 0,
      president: "Sarah Wilson",
      email: "business.society@university.edu",
      registrationDate: "2024-03-10",
      lastActivity: "1 day ago",
      posts: 0,
      events: 0,
      avatar: "BS",
      category: "Business"
    },
    {
      id: 3,
      name: "International Students Society",
      status: "active",
      members: 189,
      president: "Maria Rodriguez",
      email: "international@university.edu",
      registrationDate: "2023-08-20",
      lastActivity: "30 minutes ago",
      posts: 28,
      events: 8,
      avatar: "IS",
      category: "Cultural"
    },
    {
      id: 4,
      name: "Environmental Club",
      status: "suspended",
      members: 67,
      president: "David Green",
      email: "environment@university.edu",
      registrationDate: "2023-10-05",
      lastActivity: "2 weeks ago",
      posts: 15,
      events: 3,
      avatar: "EC",
      category: "Environmental"
    },
    {
      id: 5,
      name: "Photography Society",
      status: "under_review",
      members: 0,
      president: "Lisa Chen",
      email: "photography@university.edu",
      registrationDate: "2024-03-12",
      lastActivity: "3 days ago",
      posts: 0,
      events: 0,
      avatar: "PS",
      category: "Arts"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "under_review": return "outline";
      case "suspended": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return CheckCircle;
      case "pending": return Clock;
      case "under_review": return AlertTriangle;
      case "suspended": return XCircle;
      default: return Clock;
    }
  };

  const activeSocieties = societies.filter(s => s.status === "active");
  const pendingSocieties = societies.filter(s => s.status === "pending");
  const underReviewSocieties = societies.filter(s => s.status === "under_review");
  const suspendedSocieties = societies.filter(s => s.status === "suspended");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Society Management</h1>
              <p className="text-white/90">Manage and moderate university societies</p>
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
              <div className="text-2xl font-bold text-university-navy">{activeSocieties.length}</div>
              <div className="text-sm text-muted-foreground">Active Societies</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-gold">{pendingSocieties.length}</div>
              <div className="text-sm text-muted-foreground">Pending Approval</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-maroon">{underReviewSocieties.length}</div>
              <div className="text-sm text-muted-foreground">Under Review</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{suspendedSocieties.length}</div>
              <div className="text-sm text-muted-foreground">Suspended</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">All Societies</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="review">Under Review</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search societies..."
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
            {societies.map((society) => {
              const StatusIcon = getStatusIcon(society.status);
              return (
                <Card key={society.id} className="p-6 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-university-navy text-white">
                          {society.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-university-navy">{society.name}</h3>
                          <Badge variant={getStatusColor(society.status)} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {society.status.replace("_", " ").charAt(0).toUpperCase() + society.status.replace("_", " ").slice(1)}
                          </Badge>
                          <Badge variant="outline">{society.category}</Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                          <div>
                            <span className="font-medium">President:</span> {society.president}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {society.email}
                          </div>
                          <div>
                            <span className="font-medium">Registered:</span> {new Date(society.registrationDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Last Activity:</span> {society.lastActivity}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            {society.members} members
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {society.posts} posts
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {society.events} events
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {society.status === "pending" && (
                        <>
                          <Button variant="university" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {society.status === "active" && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {society.status === "suspended" && (
                        <Button variant="university" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeSocieties.map((society) => (
              <Card key={society.id} className="p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-navy text-white">
                        {society.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{society.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {society.members} members • {society.posts} posts • {society.events} events
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingSocieties.map((society) => (
              <Card key={society.id} className="p-6 shadow-card border-university-gold">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-gold text-white">
                        {society.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{society.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        President: {society.president} • Registered: {new Date(society.registrationDate).toLocaleDateString()}
                      </p>
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

          <TabsContent value="review" className="space-y-4">
            {underReviewSocieties.map((society) => (
              <Card key={society.id} className="p-6 shadow-card border-university-maroon">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-maroon text-white">
                        {society.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{society.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Under review for policy violations • Last activity: {society.lastActivity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="university" size="sm">Resolve</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="suspended" className="space-y-4">
            {suspendedSocieties.map((society) => (
              <Card key={society.id} className="p-6 shadow-card border-destructive">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-destructive text-white">
                        {society.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{society.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Suspended • {society.members} members affected • Last activity: {society.lastActivity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View Reason</Button>
                    <Button variant="university" size="sm">Reactivate</Button>
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

export default SocietyManagement;