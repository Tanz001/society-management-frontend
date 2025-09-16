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
  Shield, 
  UserX, 
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const MemberManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const members = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.johnson@university.edu",
      studentId: "STU2024001",
      phone: "+1 (555) 123-4567",
      major: "Computer Science",
      year: "Junior",
      gpa: 3.85,
      status: "active",
      joinDate: "2022-09-15",
      lastActive: "2 hours ago",
      societies: ["Computer Science Society", "Business Society"],
      role: "student",
      violations: 0,
      avatar: "AJ"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah.wilson@university.edu",
      studentId: "STU2024002",
      phone: "+1 (555) 234-5678",
      major: "Business Administration",
      year: "Senior",
      gpa: 3.92,
      status: "active",
      joinDate: "2021-09-20",
      lastActive: "1 day ago",
      societies: ["Business Society"],
      role: "society_owner",
      violations: 0,
      avatar: "SW"
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      email: "maria.rodriguez@university.edu",
      studentId: "STU2024003",
      phone: "+1 (555) 345-6789",
      major: "International Relations",
      year: "Sophomore",
      gpa: 3.74,
      status: "active",
      joinDate: "2022-08-25",
      lastActive: "30 minutes ago",
      societies: ["International Students Society", "Cultural Club"],
      role: "society_owner",
      violations: 0,
      avatar: "MR"
    },
    {
      id: 4,
      name: "David Green",
      email: "david.green@university.edu",
      studentId: "STU2024004",
      phone: "+1 (555) 456-7890",
      major: "Environmental Science",
      year: "Graduate",
      gpa: 3.45,
      status: "suspended",
      joinDate: "2023-01-10",
      lastActive: "2 weeks ago",
      societies: ["Environmental Club"],
      role: "society_owner",
      violations: 2,
      avatar: "DG"
    },
    {
      id: 5,
      name: "Lisa Chen",
      email: "lisa.chen@university.edu",
      studentId: "STU2024005",
      phone: "+1 (555) 567-8901",
      major: "Fine Arts",
      year: "Freshman",
      gpa: 3.68,
      status: "under_review",
      joinDate: "2023-09-01",
      lastActive: "3 days ago",
      societies: ["Photography Society", "Art Club"],
      role: "student",
      violations: 1,
      avatar: "LC"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "suspended": return "destructive";
      case "under_review": return "secondary";
      case "inactive": return "outline";
      default: return "outline";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student": return "outline";
      case "society_owner": return "secondary";
      case "admin": return "default";
      default: return "outline";
    }
  };

  const activeMembers = members.filter(m => m.status === "active");
  const suspendedMembers = members.filter(m => m.status === "suspended");
  const underReviewMembers = members.filter(m => m.status === "under_review");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Member Management</h1>
              <p className="text-white/90">Manage university students and society members</p>
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
              <div className="text-2xl font-bold text-university-navy">{members.length}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-navy">{activeMembers.length}</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-maroon">{underReviewMembers.length}</div>
              <div className="text-sm text-muted-foreground">Under Review</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{suspendedMembers.length}</div>
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
              <TabsTrigger value="all">All Members</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="review">Under Review</TabsTrigger>
              <TabsTrigger value="suspended">Suspended</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
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
            {members.map((member) => (
              <Card key={member.id} className="p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-navy text-white">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-university-navy">{member.name}</h3>
                        <Badge variant={getStatusColor(member.status)}>
                          {member.status.replace("_", " ").charAt(0).toUpperCase() + member.status.replace("_", " ").slice(1)}
                        </Badge>
                        <Badge variant={getRoleColor(member.role)}>
                          {member.role.replace("_", " ").charAt(0).toUpperCase() + member.role.replace("_", " ").slice(1)}
                        </Badge>
                        {member.violations > 0 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {member.violations} violations
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-2" />
                          {member.email}
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="h-3 w-3 mr-2" />
                          {member.major}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2" />
                          {member.year}
                        </div>
                        <div>
                          <span className="font-medium">GPA:</span> {member.gpa}
                        </div>
                        <div>
                          <span className="font-medium">Student ID:</span> {member.studentId}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {member.societies.length} societies
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span> {new Date(member.joinDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Last Active:</span> {member.lastActive}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" />
                          {member.phone}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">Member of:</div>
                        <div className="flex flex-wrap gap-2">
                          {member.societies.map((society, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {society}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                    {member.status === "active" && (
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                    {member.status === "suspended" && (
                      <Button variant="university" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Reactivate
                      </Button>
                    )}
                    {member.status === "under_review" && (
                      <>
                        <Button variant="university" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                        <Button variant="destructive" size="sm">
                          <UserX className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeMembers.map((member) => (
              <Card key={member.id} className="p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-navy text-white">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.major} • {member.year} • GPA: {member.gpa}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.societies.length} societies • Last active: {member.lastActive}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View Profile</Button>
                    <Button variant="outline" size="sm">Contact</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {underReviewMembers.map((member) => (
              <Card key={member.id} className="p-6 shadow-card border-university-maroon">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-university-maroon text-white">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-university-navy">{member.name}</h3>
                        <Badge variant="destructive" className="text-xs">
                          {member.violations} violations
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.major} • {member.year} • Under review for policy violations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="university" size="sm">Clear</Button>
                    <Button variant="destructive" size="sm">Suspend</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="suspended" className="space-y-4">
            {suspendedMembers.map((member) => (
              <Card key={member.id} className="p-6 shadow-card border-destructive">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-destructive text-white">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-university-navy">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Suspended • {member.violations} violations • Last active: {member.lastActive}
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

export default MemberManagement;