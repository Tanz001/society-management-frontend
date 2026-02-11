import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Edit,
  MapPin,
  MoreVertical,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";
import EventRequestDetailModal from "@/components/admin/EventRequestDetailModal";

interface Society {
  society_id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  advisor: string;
  purpose: string;
  society_logo: string;
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
    university?: string;
    major?: string;
  };
  advisor_info?: {
    firstName: string;
    lastName: string;
    email: string;
    designation: string;
    department: string;
    phone: string;
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

const BoardPresidentDashboard = () => {
  const { toast } = useToast();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  // Default to event-requests tab; societies UI is now hidden
  const [activeTab, setActiveTab] = useState<string>("event-requests");
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [eventRequests, setEventRequests] = useState<any[]>([]);
  const [loadingEventRequests, setLoadingEventRequests] = useState(false);
  const [selectedEventRequest, setSelectedEventRequest] = useState<any | null>(null);
  const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
  const [isEventStatusModalOpen, setIsEventStatusModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [eventStatusNote, setEventStatusNote] = useState("");
  const [selectedEventStatus, setSelectedEventStatus] = useState<number>(0);
  const [eventRequestStats, setEventRequestStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [eventRequestFilter, setEventRequestFilter] = useState<string>("all"); // all, pending, approved, rejected


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

  // Fetch pending societies for Board President
  const fetchPendingSocieties = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/admin/societies-by-role`,
        { role: "board_president" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Societies for Board President fetched:", response.data);
      setSocieties(response.data.societies || []);
    } catch (err: any) {
      console.error("Error fetching societies:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch societies");
    } finally {
      setLoading(false);
    }
  };

  // Handle society review
  const handleReviewClick = async (society: Society) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch detailed society information
      const response = await axios.get(`${API_URL}/admin/societies/${society.society_id}`, {
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

  // Handle approve/reject action
  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedSociety) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const currentUser = getCurrentUser();

      const userId = currentUser?.faculty_id || currentUser?.id || currentUser?.user_id;
      if (!userId) {
        toast({
          title: "Error",
          description: "User information not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.put(
        `${API_URL}/admin/board-president/societies/${selectedSociety.society_id}/review`,
        {
          action,
          note: reviewNote,
          changed_by: userId
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`Society ${action}d successfully:`, response.data);

      // Refresh the societies list
      await fetchPendingSocieties();

      // Close modal
      setIsModalOpen(false);
      setSelectedSociety(null);
      setReviewNote("");

      // Show success toast
      toast({
        title: "Success",
        description: `Society ${action}d successfully!`,
        variant: "default",
      });

    } catch (err: any) {
      console.error(`Error ${action}ing society:`, err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || `Failed to ${action} society`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch allowed statuses for Board President based on current status
  const fetchStatuses = async (currentStatusId: number = 2) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) return;

      // Board President can only set status 4 (Approve) or 5 (Reject) from status 2 (Approved by Board Secretary)
      const response = await axios.get(`${API_URL}/admin/allowed-statuses?role=board_president&current_status_id=${currentStatusId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatuses(response.data.statuses || []);
    } catch (err: any) {
      console.error("Error fetching statuses:", err);
    }
  };

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
        `${import.meta.env.VITE_API_URL}/admin/event-requests`,
        {
          role: "board_president",
          filter: eventRequestFilter
        },
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
      const API_URL = import.meta.env.VITE_API_URL;
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/admin/event-requests/${reqId}`, {
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

  // Fetch event request stats
  const fetchEventRequestStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/event-requests/stats`,
        { role: "board_president" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setEventRequestStats(response.data.data || response.data.stats);
      }
    } catch (err: any) {
      console.error("Error fetching event request stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle open event status change modal
  const handleChangeEventStatus = async (request: any) => {
    setSelectedEventRequest(request);
    setSelectedEventStatus(0); // Reset selection
    setEventStatusNote(""); // Always start with empty note
    setIsEventStatusModalOpen(true);
    // Fetch allowed statuses based on the request's current status
    await fetchStatuses(request.status_id);
  };

  // Handle event request status update
  const handleUpdateEventStatus = async () => {
    if (!selectedEventRequest || !selectedEventStatus) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const currentUser = getCurrentUser();

      const userId = currentUser?.faculty_id || currentUser?.id || currentUser?.user_id;
      if (!userId) {
        toast({
          title: "Error",
          description: "User information not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      // Board President can only approve (4) or reject (5) event requests
      const action = selectedEventStatus === 4 ? 'approve' : 'reject';
      const response = await axios.put(
        `${API_URL}/admin/board-president/event-requests/${selectedEventRequest.req_id}/review`,
        {
          action,
          note: eventStatusNote,
          changed_by: userId
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Event request status updated successfully:", response.data);

      // Refresh the event requests list and stats
      await fetchAllEventRequests();
      await fetchEventRequestStats();

      // Close modal
      setIsEventStatusModalOpen(false);
      setSelectedEventRequest(null);
      setSelectedEventStatus(0);
      setEventStatusNote("");

      // Show success toast
      toast({
        title: "Success",
        description: "Event request status updated successfully!",
        variant: "default",
      });

    } catch (err: any) {
      console.error("Error updating event request status:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Load societies on component mount
  useEffect(() => {
    fetchPendingSocieties();
    fetchStatuses();
  }, []);

  // Fetch event requests when tab is active or filter changes
  useEffect(() => {
    if (activeTab === "event-requests") {
      fetchAllEventRequests();
      fetchEventRequestStats();
    }
  }, [activeTab, eventRequestFilter]);

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
              <h1 className="text-2xl font-bold">Board President Dashboard</h1>
              <p className="text-white/80">Review Pending Society Applications</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white/20 bg-transparent flex items-center gap-2"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
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
          {/* Stats Overview - Event Requests */}
          {activeTab === "event-requests" && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold text-university-navy">
                      {statsLoading ? "..." : eventRequestStats.total}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-university-navy" />
                </div>
              </Card>

              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-university-navy">
                      {statsLoading ? "..." : eventRequestStats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-university-maroon" />
                </div>
              </Card>

              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-university-navy">
                      {statsLoading ? "..." : eventRequestStats.approved}
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
                      {statsLoading ? "..." : eventRequestStats.rejected}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </Card>
            </div>
          )}

          {activeTab !== "event-requests" && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Reviews</p>
                    <p className="text-2xl font-bold text-university-navy">{societies.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-university-maroon" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Societies awaiting board approval</p>
              </Card>

              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-university-navy">
                      {societies.filter(s => new Date(s.created_at).getMonth() === new Date().getMonth()).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-university-gold" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">New applications</p>
              </Card>

              <Card className="p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold text-university-navy">
                      {new Set(societies.map(s => s.category)).size}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-university-navy" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Different society types</p>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              {/* Societies tab hidden as per latest requirements */}
              {/* <TabsTrigger value="overview">Societies</TabsTrigger> */}
              <TabsTrigger value="event-requests">Event Requests</TabsTrigger>
              <TabsTrigger value="event-reports">Event Reports</TabsTrigger>
            </TabsList>

            {/* Societies Tab (kept for reference but not reachable from UI) */}
            <TabsContent value="overview">
              {/* Actions */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-university-navy">Pending Society Applications</h2>
                <Button
                  variant="outline"
                  onClick={fetchPendingSocieties}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <Card className="p-4 border-red-200 bg-red-50 mb-6">
                  <p className="text-red-600">Error: {error}</p>
                </Card>
              )}

              {/* Societies List */}
              {loading && societies.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading societies...</p>
                </div>
              ) : societies.length > 0 ? (
                <div className="grid gap-6">
                  {societies.map((society) => (
                    <Card key={society.society_id} className="p-6 shadow-card">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-16 bg-university-navy/10 rounded-lg flex items-center justify-center">
                            {society.society_logo ? (
                              <img
                                src={`${import.meta.env.VITE_API_URL}/${society.society_logo}`}

                                alt={society.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <Building className="h-8 w-8 text-university-navy" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-xl font-semibold text-university-navy mr-3">{society.name}</h3>
                              <Badge variant="secondary" className="mr-2">{society.status_name}</Badge>
                              <Badge variant="outline">{society.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              📍 {society.location} • 👨‍🏫 {society.advisor}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              📧 {society.student_info.firstName} {society.student_info.lastName} ({society.student_info.rollNo})
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              {society.description.length > 150
                                ? `${society.description.substring(0, 150)}...`
                                : society.description
                              }
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Submitted: {new Date(society.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {/* Only show Review button for Approved by Board Secretary (status 2) - Board President's pending items */}
                          {society.status_id === 2 ? (
                            <Button
                              size="sm"
                              variant="university"
                              onClick={() => handleReviewClick(society)}
                              disabled={loading}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Review
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
                  <h3 className="text-lg font-medium mb-2">No Pending Applications</h3>
                  <p className="text-muted-foreground">There are no society applications waiting for board review.</p>
                </div>
              )}
            </TabsContent>

            {/* Event Requests Tab */}
            <TabsContent value="event-requests">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-university-navy">Event Requests</h2>
                <Button
                  variant="outline"
                  onClick={fetchAllEventRequests}
                  disabled={loadingEventRequests}
                >
                  {loadingEventRequests ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-6">
                <Button
                  variant={eventRequestFilter === "all" ? "university" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventRequestFilter("all");
                    fetchAllEventRequests();
                  }}
                >
                  All
                </Button>
                <Button
                  variant={eventRequestFilter === "pending" ? "university" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventRequestFilter("pending");
                    fetchAllEventRequests();
                  }}
                >
                  Pending
                </Button>
                <Button
                  variant={eventRequestFilter === "approved" ? "university" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventRequestFilter("approved");
                    fetchAllEventRequests();
                  }}
                >
                  Approved
                </Button>
                <Button
                  variant={eventRequestFilter === "rejected" ? "university" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventRequestFilter("rejected");
                    fetchAllEventRequests();
                  }}
                >
                  Rejected
                </Button>
              </div>

              {loadingEventRequests && eventRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading event requests...</p>
                </div>
              ) : eventRequests.length > 0 ? (
                <div className="grid gap-4">
                  {eventRequests.map((request) => (
                    <Card key={request.req_id} className="p-4 shadow-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2 flex-wrap gap-2">
                            <h3 className="text-lg font-semibold text-university-navy">{request.title}</h3>
                            {request.status_name && (
                              <Badge variant={request.status_id === 2 ? "default" : request.status_id === 3 ? "destructive" : "secondary"}>
                                {request.status_name}
                              </Badge>
                            )}
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
                        <div className="flex items-start gap-2 ml-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewEventRequest(request.req_id)}
                                disabled={loadingEventRequests}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleChangeEventStatus(request)}
                                disabled={loadingEventRequests}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

            <TabsContent value="event-reports">
              <AdminEventReportsSection isActive={activeTab === "event-reports"} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Society Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Society Application Review</DialogTitle>
            <DialogDescription>
              Review the society application details and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedSociety && (
            <div className="space-y-6 overflow-y-auto h-full">
              {/* Hero Section */}
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                    {selectedSociety.society_logo ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${selectedSociety.society_logo}`}

                        alt={selectedSociety.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <Building className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge variant="secondary" className="bg-white/20 text-white mr-2">
                        {selectedSociety.category}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white">
                        {selectedSociety.status_name}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedSociety.name}</h2>
                    <p className="text-white/90 mb-4">{selectedSociety.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{selectedSociety.student_info.firstName} {selectedSociety.student_info.lastName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{selectedSociety.student_info.rollNo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Application Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted by:</span>
                      <span className="font-medium">{selectedSociety.student_info.firstName} {selectedSociety.student_info.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedSociety.student_info.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Roll Number:</span>
                      <span className="font-medium">{selectedSociety.student_info.rollNo}</span>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted on:</span>
                      <span className="font-medium">{new Date(selectedSociety.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Purpose */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Society Purpose
                </h3>
                <p className="text-muted-foreground leading-relaxed">{selectedSociety.purpose}</p>
              </Card>

              {/* Achievements */}
              {Array.isArray(selectedSociety?.achievements) && selectedSociety.achievements.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Achievements
                  </h3>
                  <div className="space-y-2">
                    {selectedSociety.achievements.map((achievement: any, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-university-gold rounded-full mt-2"></div>
                        <span className="text-muted-foreground">
                          {achievement.achievement || "Untitled Achievement"}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}


              {/* Review Note */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Review Note (Optional)</h3>
                <Textarea
                  placeholder="Add any notes or feedback for this review..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                />
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Reject Application"}
                </Button>
                <Button
                  variant="university"
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Approve Application"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Request Detail Modal */}
      <EventRequestDetailModal
        isOpen={isEventRequestModalOpen}
        onClose={() => setIsEventRequestModalOpen(false)}
        eventRequest={selectedEventRequest}
        variant="detailed"
        isLoading={loading}
        actionContent={
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
        }
      />

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
                <label className="text-sm font-medium mb-2 block">Select Action</label>
                <Select
                  value={selectedEventStatus.toString()}
                  onValueChange={(value) => setSelectedEventStatus(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
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
                  placeholder="Write note"
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
      <ChangePasswordDialog
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />
    </div>
  );
};


export default BoardPresidentDashboard;


