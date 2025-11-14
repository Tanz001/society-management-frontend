import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminEventReportsSection from "@/components/admin/AdminEventReportsSection";
import { 
  Users, 
  Building, 
  Calendar, 
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  LogOut,
  Clock,
  FileText,
  Award,
  Shield,
  Filter,
  Search,
  TrendingUp,
  Edit,
  MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Society {
  society_id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  advisor: string;
  purpose: string;
  society_logo: string;
  logo_path?: string;
  cover_photo: string;
  status_id: number;
  status_name: string;
  status_description: string;
  note: string;
  created_at: string;
  updated_at: string;
  student_info: {
    firstName: string;
    lastName: string;
    email: string;
    rollNo: string;
  };
  achievements?: any[];
  events?: any[];
  status_history?: any[];
}

interface Status {
  status_id: number;
  status_name: string;
  description: string;
}

const RegistrarDashboard = () => {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [allSocieties, setAllSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [statusNote, setStatusNote] = useState("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const navigate = useNavigate();
  const [eventRequests, setEventRequests] = useState<any[]>([]);
  const [loadingEventRequests, setLoadingEventRequests] = useState(false);
  const [selectedEventRequest, setSelectedEventRequest] = useState<any | null>(null);
  const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
  const [isEventStatusModalOpen, setIsEventStatusModalOpen] = useState(false);
  const [eventStatusNote, setEventStatusNote] = useState("");
  const [selectedEventStatus, setSelectedEventStatus] = useState<number>(0);

  // Get current user info
  const getCurrentUser = () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  // Fetch all societies
  const fetchAllSocieties = async () => {
    try {
      setLoading(true);
      setError("");
  
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
  
      const response = await axios.post(
        "http://localhost:5000/admin/societies-by-role",
        { role: "registrar" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Societies for VC fetched:", response.data);
      setSocieties(response.data.societies || []);
    } catch (err: any) {
      console.error("Error fetching societies:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch societies");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all statuses
  // Fetch allowed statuses for Registrar based on current status
  const fetchStatuses = async (currentStatusId: number = 4) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Registrar can only set status 6 (Approve) or 7 (Reject) from status 4 (Approved by Board President)
      const response = await axios.get(`http://localhost:5000/admin/allowed-statuses?role=registrar&current_status_id=${currentStatusId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatuses(response.data.statuses || []);
    } catch (err: any) {
      console.error("Error fetching statuses:", err);
    }
  };

  // Handle society review/detail view
  const handleViewDetails = async (society: Society) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch detailed society information
      const response = await axios.get(`http://localhost:5000/admin/societies/${society.society_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedSociety(response.data.data);
      setIsModalOpen(true);
      setReviewNote("");
      
      // Fetch allowed statuses based on the society's current status
      await fetchStatuses(society.status_id);
    } catch (err: any) {
      console.error("Error fetching society details:", err);
      setError(err.response?.data?.message || "Failed to fetch society details");
    } finally {
      setLoading(false);
    }
  };

  // Handle open status change modal
  const handleChangeStatus = async (society: Society) => {
    setSelectedSociety(society);
    setSelectedStatus(0); // Reset selection
    setStatusNote("");
    setIsStatusModalOpen(true);
    // Fetch allowed statuses based on the society's current status
    await fetchStatuses(society.status_id);
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedSociety || !selectedStatus) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const currentUser = getCurrentUser();

      if (!currentUser?.id) {
        throw new Error("User information not found");
      }

      const response = await axios.put(
        `http://localhost:5000/admin/societies/${selectedSociety.society_id}/status`,
        {
          status_id: selectedStatus,
          note: statusNote,
          changed_by: currentUser.id
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Status updated successfully:", response.data);
      
      // Refresh the societies list
      await fetchAllSocieties();
      
      // Close modal
      setIsStatusModalOpen(false);
      setSelectedSociety(null);
      setSelectedStatus(0);
      setStatusNote("");
      
      // Show success message
      alert("Society status updated successfully!");
      
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.message || err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter societies based on selected filters
  useEffect(() => {
    let filtered = [...allSocieties];

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter(s => s.status_id === 1);
      } else if (statusFilter === "board_approved") {
        filtered = filtered.filter(s => s.status_id === 2);
      } else if (statusFilter === "registrar_approved") {
        filtered = filtered.filter(s => s.status_id === 4);
      } else if (statusFilter === "vc_approved") {
        filtered = filtered.filter(s => s.status_id === 6);
      } else if (statusFilter === "rejected") {
        filtered = filtered.filter(s => [3, 5, 7].includes(s.status_id));
      }
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.student_info.firstName.toLowerCase().includes(query) ||
        s.student_info.lastName.toLowerCase().includes(query)
      );
    }

    setSocieties(filtered);
  }, [allSocieties, statusFilter, categoryFilter, searchQuery]);

  // Fetch all event requests
  const fetchAllEventRequests = async () => {
    try {
      setLoadingEventRequests(true);
      setError("");
  
      const currentUser = getCurrentUser();
      const token = localStorage.getItem("token");
  
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const response = await axios.post(
        "http://localhost:5000/admin/event-requests",  // ✅ POST
        { role: currentUser?.role },                   // ✅ send role in body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Event requests fetched:", response.data);
      setEventRequests(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching event requests:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch event requests");
    } finally {
      setLoadingEventRequests(false);
    }
  };
  
  // Handle view event request details
  const handleViewEventRequest = async (reqId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`http://localhost:5000/admin/event-requests/${reqId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedEventRequest(response.data.data);
      setIsEventRequestModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching event request details:", err);
      setError(err.response?.data?.message || "Failed to fetch event request details");
    } finally {
      setLoading(false);
    }
  };

  // Handle open event status change modal
  const handleChangeEventStatus = async (request: any) => {
    setSelectedEventRequest(request);
    setSelectedEventStatus(0); // Reset selection
    setEventStatusNote(request.note || "");
    setIsEventStatusModalOpen(true);
    // Fetch allowed statuses based on the request's current status
    await fetchStatuses(request.status_id);
  };

  // Handle event request status update
  const handleUpdateEventStatus = async () => {
    if (!selectedEventRequest || !selectedEventStatus) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const currentUser = getCurrentUser();

      if (!currentUser?.id) {
        throw new Error("User information not found");
      }

      // Registrar can only approve (6) or reject (7) event requests
      const action = selectedEventStatus === 6 ? 'approve' : 'reject';
      const response = await axios.put(
        `http://localhost:5000/admin/registrar/event-requests/${selectedEventRequest.req_id}/review`,
        {
          action,
          note: eventStatusNote,
          changed_by: currentUser.id
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Event request status updated successfully:", response.data);
      
      // Refresh the event requests list
      await fetchAllEventRequests();
      
      // Close modal
      setIsEventStatusModalOpen(false);
      setSelectedEventRequest(null);
      setSelectedEventStatus(0);
      setEventStatusNote("");
      
      // Show success message
      alert("Event request status updated successfully!");
      
    } catch (err: any) {
      console.error("Error updating event request status:", err);
      alert(err.response?.data?.message || err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAllSocieties();
    fetchStatuses();
  }, []);

  // Fetch event requests when tab is active
  useEffect(() => {
    if (activeTab === "event-requests") {
      fetchAllEventRequests();
    }
  }, [activeTab]);

  // Calculate stats
  const stats = {
    total: allSocieties.length,
    pending: allSocieties.filter(s => s.status_id === 1).length,
    boardApproved: allSocieties.filter(s => s.status_id === 2).length,
    registrarApproved: allSocieties.filter(s => s.status_id === 4).length,
    vcApproved: allSocieties.filter(s => s.status_id === 6).length,
    rejected: allSocieties.filter(s => [3, 5, 7].includes(s.status_id)).length,
    categories: new Set(allSocieties.map(s => s.category)).size
  };

  // Get unique categories
  const categories = Array.from(new Set(allSocieties.map(s => s.category)));

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                Registrar Dashboard
              </h1>
              <p className="text-white/80">Complete Society Management System</p>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="societies">All Societies</TabsTrigger>
            <TabsTrigger value="event-requests">Event Requests</TabsTrigger>
            <TabsTrigger value="event-reports">Event Reports</TabsTrigger>
          </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Societies</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.total}</p>
                    </div>
                    <Building className="h-8 w-8 text-university-navy" />
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.pending}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-university-maroon" />
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Board Approved</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.boardApproved}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Registrar Approved</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.registrarApproved}</p>
                    </div>
                    <Shield className="h-8 w-8 text-university-gold" />
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6 shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-university-navy">Quick Actions</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStatusFilter("board_approved");
                      setActiveTab("societies");
                    }}
                    className="h-20 flex-col"
                  >
                    <Eye className="h-5 w-5 mb-2" />
                    Review Board Approved
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("pending");
                      setActiveTab("societies");
                    }}
                    className="h-20 flex-col"
                  >
                    <AlertTriangle className="h-5 w-5 mb-2" />
                    View Pending
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all");
                      setActiveTab("societies");
                    }}
                    className="h-20 flex-col"
                  >
                    <Building className="h-5 w-5 mb-2" />
                    View All Societies
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="event-reports">
              <AdminEventReportsSection isActive={activeTab === "event-reports"} />
            </TabsContent>

            <TabsContent value="societies" className="space-y-6">
              {/* Filters and Actions */}
              <Card className="p-6 shadow-card">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search societies by name, description, category, or creator..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-university-navy"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending (Status 1)</SelectItem>
                      <SelectItem value="board_approved">Board Approved (Status 2)</SelectItem>
                      <SelectItem value="registrar_approved">Registrar Approved (Status 4)</SelectItem>
                      <SelectItem value="vc_approved">VC Approved (Status 6)</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Category Filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Refresh Button */}
                  <Button 
                    variant="outline" 
                    onClick={fetchAllSocieties}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {societies.length} of {allSocieties.length} societies
                  </p>
                  {statusFilter !== "all" && (
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => {
                        setStatusFilter("all");
                        setCategoryFilter("all");
                        setSearchQuery("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </Card>

              {/* Error Display */}
              {error && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <p className="text-red-600">Error: {error}</p>
                </Card>
              )}

              {/* Societies List */}
              {loading && societies.length === 0 && allSocieties.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading societies...</p>
                </div>
              ) : societies.length > 0 ? (
                <div className="grid gap-6">
                  {societies.map((society) => (
                    <Card key={society.society_id} className="p-6 shadow-card hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-20 h-20 bg-university-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            {society.society_logo ? (
                              <img 
                                src={`http://localhost:5000/${society.society_logo}`}
                                alt={society.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <Building className="h-10 w-10 text-university-navy" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2 flex-wrap gap-2">
                              <h3 className="text-xl font-semibold text-university-navy">{society.name}</h3>
                              <Badge 
                                variant={
                                  society.status_id === 6 ? 'default' :
                                  society.status_id === 4 ? 'default' :
                                  society.status_id === 2 ? 'default' :
                                  society.status_id === 1 ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  society.status_id === 6 ? 'bg-green-600' :
                                  society.status_id === 4 ? 'bg-blue-600' :
                                  society.status_id === 2 ? 'bg-green-600' :
                                  ''
                                }
                              >
                                {society.status_name}
                              </Badge>
                              <Badge variant="outline">{society.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {society.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                              <span>📍 {society.location}</span>
                              <span>👨‍🏫 {society.advisor}</span>
                              <span>📧 {society.student_info.firstName} {society.student_info.lastName}</span>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Created: {new Date(society.created_at).toLocaleDateString()}
                              {society.updated_at && (
                                <> • Updated: {new Date(society.updated_at).toLocaleDateString()}</>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="university"
                            onClick={() => handleViewDetails(society)}
                            disabled={loading}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          {/* Only show Change Status button for Approved by Board President (status 4) - Registrar's pending items */}
                          {society.status_id === 4 ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleChangeStatus(society)}
                              disabled={loading}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Change Status
                            </Button>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Tracked: {society.status_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Societies Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No societies have been registered yet"}
                  </p>
                  {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setCategoryFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="event-requests" className="space-y-6">
              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold text-university-navy">{eventRequests.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-university-navy" />
                  </div>
                </Card>
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-university-navy">
                        {eventRequests.filter((r: any) => r.status_id === 1).length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-university-maroon" />
                  </div>
                </Card>
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-university-navy">
                        {eventRequests.filter((r: any) => r.status_id === 6).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </Card>
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-university-navy">
                        {eventRequests.filter((r: any) => [3, 5, 7].includes(r.status_id)).length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </Card>
              </div>

              {/* Event Requests List */}
              {loadingEventRequests && eventRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading event requests...</p>
                </div>
              ) : eventRequests.length > 0 ? (
                <div className="grid gap-6">
                  {eventRequests.map((request: any) => (
                    <Card key={request.req_id} className="p-6 shadow-card hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-16 bg-university-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-8 w-8 text-university-navy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2 flex-wrap gap-2">
                              <h3 className="text-xl font-semibold text-university-navy">{request.title}</h3>
                              <Badge 
                                variant={
                                  request.status_id === 6 ? 'default' :
                                  request.status_id === 4 ? 'default' :
                                  request.status_id === 2 ? 'default' :
                                  request.status_id === 1 ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  request.status_id === 6 ? 'bg-green-600' :
                                  request.status_id === 4 ? 'bg-blue-600' :
                                  request.status_id === 2 ? 'bg-green-600' :
                                  ''
                                }
                              >
                                {request.status_name}
                              </Badge>
                              {request.society_name && (
                                <Badge variant="outline">{request.society_name}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {request.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                              <span>📅 {new Date(request.event_date).toLocaleDateString()}</span>
                              <span>🕐 {request.event_time}</span>
                              <span>📍 {request.venue}</span>
                              {request.firstName && request.lastName && (
                                <span>👤 {request.firstName} {request.lastName}</span>
                              )}
                            </div>
                            {request.note && (
                              <div className="bg-blue-50 border-l-4 border-blue-200 p-2 mt-2 rounded">
                                <p className="text-xs font-medium text-blue-900 mb-1">Note:</p>
                                <p className="text-xs text-blue-800">{request.note}</p>
                              </div>
                            )}
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Clock className="h-3 w-3 mr-1" />
                              Created: {new Date(request.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="university"
                            onClick={() => handleViewEventRequest(request.req_id)}
                            disabled={loading}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          {/* Only show Update Status button for Approved by Board President (status 4) - Registrar's pending items */}
                          {request.status_id === 4 ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleChangeEventStatus(request)}
                              disabled={loading}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Update Status
                            </Button>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-center">
                              Tracked: {request.status_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Event Requests Found</h3>
                  <p className="text-muted-foreground">
                    No event requests have been submitted yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Society Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Society Details</DialogTitle>
            <DialogDescription>
              Complete information about the society application
            </DialogDescription>
          </DialogHeader>

          {selectedSociety && (
            <div className="space-y-6 overflow-y-auto h-full">
              {/* Hero Section */}
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {selectedSociety.society_logo || selectedSociety.logo_path ? (
                      <img 
                        src={`http://localhost:5000/${selectedSociety.society_logo || selectedSociety.logo_path}`}
                        alt={selectedSociety.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <Building className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {selectedSociety.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-white border-white"
                      >
                        {selectedSociety.status_name}
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{selectedSociety.name}</h2>
                    <p className="text-white/90 mb-4">{selectedSociety.description}</p>
                    <div className="flex items-center flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{selectedSociety.student_info?.firstName} {selectedSociety.student_info?.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{selectedSociety.student_info?.rollNo}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {new Date(selectedSociety.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Application Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted by:</span>
                      <span className="font-medium">{selectedSociety.student_info?.firstName} {selectedSociety.student_info?.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedSociety.student_info?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roll Number:</span>
                      <span className="font-medium">{selectedSociety.student_info?.rollNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advisor:</span>
                      <span className="font-medium">{selectedSociety.advisor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedSociety.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{selectedSociety.status_name}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Status History</h3>
                  {selectedSociety.status_history && selectedSociety.status_history.length > 0 ? (
                    <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                      {selectedSociety.status_history.map((history: any, index: number) => (
                        <div key={index} className="border-l-2 border-university-navy pl-3 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{history.status_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(history.changed_at).toLocaleDateString()}
                            </span>
                          </div>
                          {history.remarks && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{history.remarks}</p>
                          )}
                          {history.firstName && (
                            <p className="text-xs text-muted-foreground">
                              By: {history.firstName} {history.lastName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No status history available</p>
                  )}
                </Card>
              </div>

              {/* Purpose */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Society Purpose
                </h3>
                <p className="text-muted-foreground leading-relaxed">{selectedSociety.purpose}</p>
              </Card>

              {/* Current Note */}
              {selectedSociety.note && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold mb-3 text-university-navy">Current Note</h3>
                  <p className="text-muted-foreground italic">{selectedSociety.note}</p>
                </Card>
              )}

              {/* Achievements */}
              {selectedSociety.achievements && selectedSociety.achievements.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Achievements
                  </h3>
                  <div className="space-y-2">
                    {selectedSociety.achievements.map((achievement: any, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-university-gold rounded-full mt-2"></div>
                        <span className="text-muted-foreground">{achievement.title || achievement.achievement || achievement}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Events */}
              {selectedSociety.events && selectedSociety.events.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Events ({selectedSociety.events.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedSociety.events.slice(0, 4).map((event: any) => (
                      <div key={event.event_id || event.id} className="bg-muted/50 p-3 rounded-lg">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="university" 
                  onClick={() => {
                    setIsModalOpen(false);
                    handleChangeStatus(selectedSociety);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Change Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Status Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Change Society Status</DialogTitle>
            <DialogDescription>
              Update the status and add a note for {selectedSociety?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedSociety && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Status</label>
                <Badge variant="outline" className="text-lg p-2">
                  {selectedSociety.status_name}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select New Status</label>
                <Select 
                  value={selectedStatus.toString()} 
                  onValueChange={(value) => setSelectedStatus(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.status_id} value={status.status_id.toString()}>
                        {status.status_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStatus > 0 && statuses.find(s => s.status_id === selectedStatus) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {statuses.find(s => s.status_id === selectedStatus)?.description}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Note (Optional)</label>
                <Textarea
                  placeholder="Add a note explaining the status change..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsStatusModalOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button 
                  variant="university" 
                  onClick={handleUpdateStatus}
                  disabled={actionLoading || selectedStatus === selectedSociety.status_id}
                >
                  {actionLoading ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Request Detail Modal */}
      <Dialog open={isEventRequestModalOpen} onOpenChange={setIsEventRequestModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Event Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the event request
            </DialogDescription>
          </DialogHeader>

          {selectedEventRequest && (
            <div className="space-y-6 overflow-y-auto h-full">
              {/* Header Section */}
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {selectedEventRequest.status_name}
                      </Badge>
                      {selectedEventRequest.society_name && (
                        <Badge variant="outline" className="text-white border-white">
                          {selectedEventRequest.society_name}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedEventRequest.title}</h2>
                    <p className="text-white/90 mb-4">{selectedEventRequest.description}</p>
                    <div className="flex items-center flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedEventRequest.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedEventRequest.event_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedEventRequest.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Event Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Date:</span>
                      <span className="font-medium">{new Date(selectedEventRequest.event_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Time:</span>
                      <span className="font-medium">{selectedEventRequest.event_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span className="font-medium">{selectedEventRequest.venue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{selectedEventRequest.status_name}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Submitted By</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedEventRequest.president_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedEventRequest.president_email}</span>
                    </div>
                    {selectedEventRequest.rollNo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll No:</span>
                        <span className="font-medium">{selectedEventRequest.rollNo}</span>
                      </div>
                    )}
                    {selectedEventRequest.society_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Society:</span>
                        <span className="font-medium">{selectedEventRequest.society_name}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Description */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Event Description</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedEventRequest.description}</p>
              </Card>

              {/* Note */}
              {selectedEventRequest.note && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold mb-3 text-university-navy">Admin Note</h3>
                  <p className="text-muted-foreground italic">{selectedEventRequest.note}</p>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEventRequestModalOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="university" 
                  onClick={() => {
                    setIsEventRequestModalOpen(false);
                    handleChangeEventStatus(selectedEventRequest);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Request Status Change Modal */}
      <Dialog open={isEventStatusModalOpen} onOpenChange={setIsEventStatusModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Event Request Status</DialogTitle>
            <DialogDescription>
              Update the status and add a note for the event request
            </DialogDescription>
          </DialogHeader>

          {selectedEventRequest && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Status</label>
                <Badge variant="outline" className="text-lg p-2">
                  {selectedEventRequest.status_name}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select New Status</label>
                <Select 
                  value={selectedEventStatus.toString()} 
                  onValueChange={(value) => setSelectedEventStatus(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.status_id} value={status.status_id.toString()}>
                        {status.status_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEventStatus > 0 && statuses.find(s => s.status_id === selectedEventStatus) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {statuses.find(s => s.status_id === selectedEventStatus)?.description}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Note (Optional)</label>
                <Textarea
                  placeholder="Add a note explaining the status change..."
                  value={eventStatusNote}
                  onChange={(e) => setEventStatusNote(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsEventStatusModalOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button 
                  variant="university" 
                  onClick={handleUpdateEventStatus}
                  disabled={actionLoading || selectedEventStatus === selectedEventRequest.status_id}
                >
                  {actionLoading ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrarDashboard;