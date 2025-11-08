import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
  Bell,
  MapPin,
  Star,
  BookOpen,
  Award,
  Heart,
  Share2,
  X,
  LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allSocieties, setAllSocieties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [societyFilter, setSocietyFilter] = useState("all"); // all, active, pending, rejected
  const navigate = useNavigate();

  // Calculate stats from actual data
  const stats = {
    totalSocieties: allSocieties.length,
    activeSocieties: allSocieties.filter(society => 
      society.status_name === 'Approved by VC' || society.status === 'active'
    ).length,
    pendingSocieties: allSocieties.filter(society => 
      society.status_id === 1 || society.status === 'pending' || society.status === 'under_review'
    ).length,
    suspendedSocieties: allSocieties.filter(society => 
      society.status === 'suspended' || society.status_name?.includes('Rejected')
    ).length,
    totalUsers: 0, // This would need to come from a separate API call
    activeUsers: 0, // This would need to come from a separate API call
    totalPosts: 0, // This would need to come from a separate API call
    flaggedPosts: 0, // This would need to come from a separate API call
    totalEvents: allSocieties.reduce((total, society) => total + (society.events?.length || 0), 0),
    upcomingEvents: allSocieties.reduce((total, society) => {
      if (!society.events) return total;
      const upcoming = society.events.filter((event: any) => new Date(event.event_date) > new Date());
      return total + upcoming.length;
    }, 0),
    monthlyGrowth: 0, // This would need to be calculated from historical data
    engagementRate: 0 // This would need to be calculated from engagement metrics
  };

  // Get pending societies from actual data
  const pendingSocieties = allSocieties.filter(society => 
    society.status_id === 1 || 
    society.status === 'pending' || 
    society.status === 'under_review'
  );

  // Filter societies based on selected filter
  const filteredSocieties = allSocieties.filter(society => {
    if (societyFilter === "all") return true;
    if (societyFilter === "active") return society.status_name === 'Approved by VC' || society.status === 'active';
    if (societyFilter === "pending") return society.status_id === 1 || society.status === 'pending' || society.status === 'under_review';
    if (societyFilter === "rejected") return society.status_name?.includes('Rejected') || society.status === 'rejected';
    return true;
  });

  // These would be fetched from separate API endpoints
  const flaggedContent = [];
  const recentActivity = [];

  // Handler functions
  const handleReviewClick = (society) => {
    setSelectedSociety(society);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSociety(null);
  };

  const handleApprove = async (societyId) => {
    try {
      console.log("Approving society:", societyId);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `http://localhost:5000/admin/societies/${societyId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Society approved successfully:", response.data);
      
      // Refresh the societies list
      await getAllSocieties();
      
      // Close modal
      handleCloseModal();
      
      // Show success message (you can add a toast notification here)
      alert("Society approved successfully!");
      
    } catch (err) {
      console.error("Error approving society:", err);
      alert(err.response?.data?.message || err.message || "Failed to approve society");
    }
  };

  const handleReject = async (societyId) => {
    try {
      console.log("Rejecting society:", societyId);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `http://localhost:5000/admin/societies/${societyId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Society rejected successfully:", response.data);
      
      // Refresh the societies list
      await getAllSocieties();
      
      // Close modal
      handleCloseModal();
      
      // Show success message
      alert("Society rejected successfully!");
      
    } catch (err) {
      console.error("Error rejecting society:", err);
      alert(err.response?.data?.message || err.message || "Failed to reject society");
    }
  };

  // Function to get all societies
  const getAllSocieties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get("http://localhost:5000/admin/societies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("All societies fetched:", response.data);
      
      // Map the societies to match the expected format
      const mappedSocieties = response.data.societies?.map((society: any) => ({
        ...society,
        status: society.status_name?.toLowerCase() || 'pending',
        id: society.society_id,
        memberCount: 0, // This would need to come from a separate API
        submitted_by: `${society.student_info?.firstName || ''} ${society.student_info?.lastName || ''}`.trim(),
        achievements: society.achievements || []
      })) || [];
      
      setAllSocieties(mappedSocieties);
    } catch (err: any) {
      console.error("Error fetching societies:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch societies");
    } finally {
      setLoading(false);
    }
  };

  // Load societies on component mount
  useEffect(() => {
    getAllSocieties();
  }, []);

  // Logout function
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear();
    
    console.log("Admin logged out successfully");
    
    // Navigate to login page
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Administrator Dashboard</h1>
              <p className="text-white/80">Complete University Societies Management System</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-white border-white hover:bg-white/20 bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="societies">Societies</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
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


              {/* Pending Society Applications - Full Width */}
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy">Pending Society Applications</h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/societies/pending">View All</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {pendingSocieties.map((society) => (
                      <div key={society.society_id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{society.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {society.status || 'Under Review'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Category: {society.category} • Advisor: {society.advisor}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Location: {society.location} • Created: {new Date(society.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="university" 
                            className="text-xs"
                            onClick={() => handleReviewClick(society)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => handleApprove(society.society_id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => handleReject(society.society_id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
            </TabsContent>

            <TabsContent value="societies" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">Society Management</h2>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={getAllSocieties}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                  <Button variant="outline">Export Data</Button>
                  <Button variant="university">Create Society</Button>
                </div>
              </div>

              {/* Filter Options */}
              <div className="flex items-center space-x-4 mb-6">
                <h3 className="text-lg font-medium text-university-navy">Filter by Status:</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={societyFilter === "all" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setSocietyFilter("all")}
                  >
                    All ({allSocieties.length})
                  </Button>
                  <Button
                    variant={societyFilter === "active" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setSocietyFilter("active")}
                  >
                    Active ({allSocieties.filter(s => s.status_name === 'Approved by VC' || s.status === 'active').length})
                  </Button>
                  <Button
                    variant={societyFilter === "pending" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setSocietyFilter("pending")}
                  >
                    Pending ({allSocieties.filter(s => s.status_id === 1 || s.status === 'pending' || s.status === 'under_review').length})
                  </Button>
                  <Button
                    variant={societyFilter === "rejected" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setSocietyFilter("rejected")}
                  >
                    Rejected ({allSocieties.filter(s => s.status_name?.includes('Rejected') || s.status === 'rejected').length})
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <p className="text-red-600">Error: {error}</p>
                </Card>
              )}

              {/* Societies List */}
              {filteredSocieties.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-university-navy">
                    {societyFilter === "all" ? "All Societies" : 
                     societyFilter === "active" ? "Active Societies" :
                     societyFilter === "pending" ? "Pending Societies" :
                     "Rejected Societies"} ({filteredSocieties.length})
                  </h3>
                  <div className="grid gap-6">
                    {filteredSocieties.map((society) => (
                      <Card key={society.society_id} className="p-6 shadow-card">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-16 h-16 bg-university-navy/10 rounded-lg flex items-center justify-center">
                                {society.society_logo ? (
                                  <img 
                                    src={`http://localhost:5000/${society.society_logo}`} 
                                    alt={society.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <Building className="h-8 w-8 text-university-navy" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-xl font-semibold text-university-navy">{society.name}</h4>
                                  <Badge 
                                    variant={
                                      society.status_name === 'Approved by VC' ? 'default' :
                                      society.status_id === 1 ? 'secondary' :
                                      society.status_name?.includes('Rejected') ? 'destructive' : 'outline'
                                    }
                                    className="ml-2"
                                  >
                                    {society.status_name || 'Unknown'}
                                  </Badge>
                                </div>
                                <Badge variant="outline" className="mb-2 capitalize">
                                  {society.category}
                                </Badge>
                                <p className="text-sm text-muted-foreground mb-2">
                                  📍 {society.location} • 👨‍🏫 {society.advisor}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Created: {new Date(society.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>

                          {/* Description */}
                          <div>
                            <h5 className="font-medium text-university-navy mb-2">Description</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {society.description.length > 200 
                                ? `${society.description.substring(0, 200)}...` 
                                : society.description
                              }
                            </p>
                          </div>

                          {/* Purpose */}
                          <div>
                            <h5 className="font-medium text-university-navy mb-2">Purpose</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {society.purpose}
                            </p>
                          </div>

                          {/* Achievements */}
                          {society.achievements && society.achievements.length > 0 && (
                            <div>
                              <h5 className="font-medium text-university-navy mb-2">Achievements</h5>
                              <div className="flex flex-wrap gap-2">
                                {society.achievements.map((achievement, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Award className="h-3 w-3 mr-1" />
                                    {achievement}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Events */}
                          {society.events && society.events.length > 0 && (
                            <div>
                              <h5 className="font-medium text-university-navy mb-2">Upcoming Events</h5>
                              <div className="space-y-2">
                                {society.events.slice(0, 2).map((event) => (
                                  <div key={event.id} className="bg-muted/50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h6 className="font-medium text-sm">{event.title}</h6>
                                        <p className="text-xs text-muted-foreground">
                                          📅 {new Date(event.event_date).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {event.description.length > 100 
                                        ? `${event.description.substring(0, 100)}...` 
                                        : event.description
                                      }
                                    </p>
                                  </div>
                                ))}
                                {society.events.length > 2 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{society.events.length - 2} more events
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && allSocieties.length === 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading societies...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredSocieties.length === 0 && !error && (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    {societyFilter === "all" ? "No Societies Found" :
                     societyFilter === "active" ? "No Active Societies" :
                     societyFilter === "pending" ? "No Pending Societies" :
                     "No Rejected Societies"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {societyFilter === "all" ? "No societies have been created yet." :
                     `No ${societyFilter} societies found.`}
                  </p>
                  {societyFilter === "all" && (
                    <Button variant="university">Create First Society</Button>
                  )}
                </div>
              )}

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

      {/* Society Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>
              Society Application Review
            </DialogTitle>
            <DialogDescription>
              Review the society application details and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedSociety && (
            <div className="space-y-6 overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Hero Section */}
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge variant="secondary" className="bg-white/20 text-white mr-2">
                        {selectedSociety.category}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white">
                        {selectedSociety.status}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedSociety.name}</h2>
                    <p className="text-white/90 mb-4">{selectedSociety.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{selectedSociety.memberCount} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedSociety.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <Card className="p-4 max-w-md">
                <h3 className="font-semibold mb-3 text-university-navy">Application Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted by:</span>
                      <span className="font-medium">{selectedSociety.submitted_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted on:</span>
                      <span className="font-medium">{selectedSociety.created_at}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advisor:</span>
                      <span className="font-medium">{selectedSociety.advisor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedSociety.location}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Purpose */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Society Purpose
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedSociety.purpose}
                </p>
              </Card>

              {/* Achievements */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Proposed Achievements
                </h3>
                <div className="space-y-2">
                  {selectedSociety.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-university-gold rounded-full mt-2"></div>
                      <span className="text-muted-foreground">{achievement}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleReject(selectedSociety.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
                <Button 
                  variant="university" 
                  onClick={() => handleApprove(selectedSociety.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;