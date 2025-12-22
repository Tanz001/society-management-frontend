import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Input } from "@/components/ui/input";
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
    Edit,
    MapPin
  } from "lucide-react";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";
  import { useToast } from "@/components/ui/use-toast";

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

  const BoardSecretaryDashboard = () => {
    const { toast } = useToast();
    const [societies, setSocieties] = useState<Society[]>([]);
    const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  // Default to societies tab for Board Secretary
  const [activeTab, setActiveTab] = useState<string>("overview");
    const navigate = useNavigate();
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [eventRequests, setEventRequests] = useState<any[]>([]);
    const [loadingEventRequests, setLoadingEventRequests] = useState(false);
    const [selectedEventRequest, setSelectedEventRequest] = useState<any | null>(null);
    const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
    const [isEventStatusModalOpen, setIsEventStatusModalOpen] = useState(false);
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [societyToEdit, setSocietyToEdit] = useState<Society | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    advisor: "",
    purpose: "",
  });
  const [advisors, setAdvisors] = useState<Array<{ faculty_id: number; name: string; email: string }>>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);

    // Format time to AM/PM
    const formatTimeToAMPM = (time24: string) => {
      if (!time24) return "N/A";
      const [hours, minutes] = time24.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // Helper functions for event requester details
    // Get advisor info (priority) or submitted by info (fallback)
    const getRequesterName = (request?: any) => {
      if (!request) return "Not available";
      // Priority: Advisor name
      if (request.advisor_name) return request.advisor_name;
      // Fallback: Student name
      const name = `${request.firstName || ""} ${request.lastName || ""}`.trim();
      if (name) return name;
      if (request.president_name) return request.president_name;
      if (request.submitted_by_name) return request.submitted_by_name;
      return "Not available";
    };

    const getRequesterEmail = (request?: any) => {
      if (!request) return "Not provided";
      // Priority: Advisor email
      if (request.advisor_email) return request.advisor_email;
      // Fallback: Student email
      return request.email || request.president_email || request.submitted_by_email || "Not provided";
    };

    const getRequesterPhone = (request?: any) => {
      if (!request) return null;
      // Priority: Advisor phone
      if (request.advisor_phone) return request.advisor_phone;
      return null;
    };

    const getRequesterRoll = (request?: any) => {
      if (!request) return null;
      // Only show roll number for students, not advisors
      return request.rollNo || request.RollNO || request.student_rollno || request.submitted_by_rollno || null;
    };

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

    // Fetch all societies for Board Secretary
    const fetchAllSocieties = async () => {
      try {
        setLoading(true);
        setError("");
    
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
    
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/societies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        console.log("Societies for Board Secretary fetched:", response.data);
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
        setActionLoading(true);
        const token = localStorage.getItem("token");
        const currentUser = getCurrentUser();

        if (!currentUser?.id) {
          throw new Error("User information not found");
        }

        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/board-secretary/societies/${selectedSociety.society_id}/review`,
          {
            action,
            note: reviewNote,
            changed_by: currentUser.id
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(`Society ${action}d successfully:`, response.data);
        
        // Refresh the societies list
        await fetchAllSocieties();
        
        // Close modal
        setIsModalOpen(false);
        setSelectedSociety(null);
        setReviewNote("");
        
        // Show success message
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

    // Fetch allowed statuses for Board Secretary based on current status
    const fetchStatuses = async (currentStatusId: number = 1) => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;

        const token = localStorage.getItem("token");
        if (!token) return;

        // Board Secretary can only set status 2 (Approve) or 3 (Reject) from status 1 (Pending)
        const response = await axios.get(`${API_URL}/admin/allowed-statuses?role=board_secretary&current_status_id=${currentStatusId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatuses(response.data.statuses || []);
      } catch (err: any) {
        console.error("Error fetching statuses:", err);
      }
    };

    // Fetch advisors for edit form
    const fetchAdvisors = async () => {
      try {
        setLoadingAdvisors(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/faculty/advisors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // API returns 'advisors' not 'faculty'
          const advisorsList = response.data.advisors || response.data.faculty || [];
          console.log("Fetched advisors:", advisorsList);
          setAdvisors(advisorsList);
        }
      } catch (err: any) {
        console.error("Error fetching advisors:", err);
        toast({
          title: "Error",
          description: "Failed to fetch advisors",
          variant: "destructive",
        });
      } finally {
        setLoadingAdvisors(false);
      }
    };

    // Handle edit button click
    const handleEditClick = async (society: Society) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch detailed society information
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/societies/${society.society_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const societyData = response.data.data;
        
        // Get advisor faculty_id from the society data
        const advisorFacultyId = societyData.faculty_id || null;
        
        console.log("Society data:", societyData);
        console.log("Advisor faculty_id:", advisorFacultyId);
        
        setEditFormData({
          name: societyData.name || "",
          description: societyData.description || "",
          category: societyData.category || "",
          location: societyData.location || "",
          advisor: advisorFacultyId ? String(advisorFacultyId) : "",
          purpose: societyData.purpose || "",
        });

        setSocietyToEdit(society);
        
        // Always fetch advisors to ensure we have the latest list before opening modal
        await fetchAdvisors();
        
        // Open modal after advisors are loaded
        setIsEditModalOpen(true);
      } catch (err: any) {
        console.error("Error fetching society details:", err);
        toast({
          title: "Error",
          description: "Failed to load society details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Handle update society
    const handleUpdateSociety = async () => {
      if (!societyToEdit) return;

      try {
        setActionLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Error",
            description: "No authentication token found",
            variant: "destructive",
          });
          return;
        }

        // Send as JSON instead of FormData since we're not uploading files
        const payload = {
          name: editFormData.name,
          description: editFormData.description,
          category: editFormData.category,
          location: editFormData.location,
          advisor: editFormData.advisor,
          purpose: editFormData.purpose,
        };

        console.log("Updating society with payload:", payload);

        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/societies/${societyToEdit.society_id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          toast({
            title: "Success",
            description: "Society updated successfully!",
            variant: "default",
          });
          setIsEditModalOpen(false);
          setSocietyToEdit(null);
          await fetchAllSocieties();
        }
      } catch (err: any) {
        console.error("Error updating society:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to update society",
          variant: "destructive",
        });
      } finally {
        setActionLoading(false);
      }
    };

    // Fetch all event requests
    // Fetch event request stats
    const fetchEventRequestStats = async () => {
      try {
        setStatsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/event-requests/stats`,
          { role: "board_secretary" },
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
            role: "board_secretary",
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

    // Handle open event status change modal
    const handleChangeEventStatus = async (request: any) => {
      setSelectedEventRequest(request);
      setSelectedEventStatus(0); // Reset selection
      setEventStatusNote(""); // Always start with empty note - each admin writes their own
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

        // Get faculty_id from user (for Board Secretary)
        const userId = currentUser?.faculty_id || currentUser?.id || currentUser?.user_id;
        if (!userId) {
          toast({
            title: "Error",
            description: "User information not found. Please login again.",
            variant: "destructive",
          });
          return;
        }

        // Board Secretary can only approve (2) or reject (3) event requests
        const action = selectedEventStatus === 2 ? 'approve' : 'reject';
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/board-secretary/event-requests/${selectedEventRequest.req_id}/review`,
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
      fetchAllSocieties();
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
                <h1 className="text-2xl font-bold">Board Secretary Dashboard</h1>
                <p className="text-white/80">Manage Society Applications and Event Requests</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-white border-white hover:bg-white/20 bg-transparent"
                  onClick={() => navigate("/society/register")}
                >
                  <Building className="h-4 w-4 mr-2" />
                  Create Society
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
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Societies</TabsTrigger>
                <TabsTrigger value="event-requests">Event Requests</TabsTrigger>
                <TabsTrigger value="event-reports">Event Reports</TabsTrigger>
              </TabsList>

              {/* Societies Tab (kept for reference but not reachable from UI) */}
              <TabsContent value="overview">
                {/* Actions */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-university-navy">All Societies</h2>
                  <Button 
                    variant="outline" 
                    onClick={fetchAllSocieties}
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
                          {/* <p className="text-sm text-muted-foreground mb-2">
                            📧 {society.student_info.firstName} {society.student_info.lastName} ({society.student_info.rollNo})
                          </p> */}
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditClick(society)}
                          disabled={loading}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {/* Only show Review button for Pending (status 1) - Board Secretary's pending items */}
                        {/* {society.status_id === 1 ? (
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
                        )} */}
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

                {/* Stats Overview - Event Requests */}
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
                              <span>🕐 {request.event_time ? formatTimeToAMPM(request.event_time) : request.time_from ? formatTimeToAMPM(request.time_from) : "N/A"}</span>
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
                            {/* Show Update Status button for Pending (status 1), show status badge for others */}
                            {/* {request.status_id === 1 ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleChangeEventStatus(request)}
                                disabled={loading}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Update Status
                              </Button>
                            ) : request.status_id === 2 ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-center">
                                Approved: {request.status_name}
                              </Badge>
                            ) : request.status_id === 3 ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-center">
                                Rejected: {request.status_name}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-center">
                                {request.status_name}
                              </Badge>
                            )} */}
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

        {/* Society Review Modal - Same as BoardDashboard */}
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

        {/* Event Request Detail Modal - Same as BoardDashboard */}
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
                          <span>{selectedEventRequest.event_time ? formatTimeToAMPM(selectedEventRequest.event_time) : selectedEventRequest.time_from ? formatTimeToAMPM(selectedEventRequest.time_from) : "N/A"}</span>
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
                        <span className="text-muted-foreground">Event Name:</span>
                        <span className="font-medium">{selectedEventRequest.event_name || selectedEventRequest.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Event Type:</span>
                        <span className="font-medium">{selectedEventRequest.event_type || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date From:</span>
                        <span className="font-medium">
                          {selectedEventRequest.date_from 
                            ? new Date(selectedEventRequest.date_from).toLocaleDateString()
                            : selectedEventRequest.event_date 
                            ? new Date(selectedEventRequest.event_date).toLocaleDateString()
                            : "Not specified"}
                        </span>
                      </div>
                      {selectedEventRequest.date_to && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date To:</span>
                          <span className="font-medium">{new Date(selectedEventRequest.date_to).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time From:</span>
                        <span className="font-medium">
                          {selectedEventRequest.time_from 
                            ? formatTimeToAMPM(selectedEventRequest.time_from)
                            : selectedEventRequest.event_time 
                            ? formatTimeToAMPM(selectedEventRequest.event_time)
                            : "Not specified"}
                        </span>
                      </div>
                      {selectedEventRequest.time_to && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time To:</span>
                          <span className="font-medium">{formatTimeToAMPM(selectedEventRequest.time_to)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Venue:</span>
                        <span className="font-medium">{selectedEventRequest.venue || "Not specified"}</span>
                      </div>
                      {selectedEventRequest.collaborating_org && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Collaborating Org:</span>
                          <span className="font-medium">{selectedEventRequest.collaborating_org}</span>
                        </div>
                      )}
                      {selectedEventRequest.coordinator_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coordinator:</span>
                          <span className="font-medium">{selectedEventRequest.coordinator_name}</span>
                        </div>
                      )}
                      {selectedEventRequest.coordinator_contact && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coordinator Contact:</span>
                          <span className="font-medium">{selectedEventRequest.coordinator_contact}</span>
                        </div>
                      )}
                      {selectedEventRequest.media_coverage && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Media Coverage:</span>
                          <span className="font-medium">{selectedEventRequest.media_coverage}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">{selectedEventRequest.status_name}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Advisor Information Box */}
                  <Card className="p-4 border-l-4 border-l-blue-500">
                    <h3 className="font-semibold mb-3 text-university-navy flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Advisor Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      {selectedEventRequest.society_name && (
                        <div className="pb-3 border-b">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Society Name:</span>
                            <span className="font-semibold text-university-navy">{selectedEventRequest.society_name}</span>
                          </div>
                        </div>
                      )}
                      {selectedEventRequest.advisor_name ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Advisor Name:</span>
                            <span className="font-medium">{selectedEventRequest.advisor_name}</span>
                          </div>
                          {selectedEventRequest.advisor_email && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Advisor Email:</span>
                              <span className="font-medium">{selectedEventRequest.advisor_email}</span>
                            </div>
                          )}
                          {selectedEventRequest.advisor_phone && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Advisor Phone:</span>
                              <span className="font-medium">{selectedEventRequest.advisor_phone}</span>
                            </div>
                          )}
                          {selectedEventRequest.advisor_faculty_id && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Faculty ID:</span>
                              <span className="font-medium">{selectedEventRequest.advisor_faculty_id}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground italic">Advisor information not available</p>
                      )}
                    </div>
                  </Card>

                  {/* Sponsor Information Box */}
                  {(selectedEventRequest.sponsor_name || selectedEventRequest.sponsor_amount) && (
                    <Card className="p-4 border-l-4 border-l-green-500">
                      <h3 className="font-semibold mb-3 text-university-navy flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Sponsor Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        {selectedEventRequest.sponsor_name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sponsor Name:</span>
                            <span className="font-medium">{selectedEventRequest.sponsor_name}</span>
                          </div>
                        )}
                        {selectedEventRequest.sponsor_amount && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sponsor Amount:</span>
                            <span className="font-medium text-green-600">
                              {typeof selectedEventRequest.sponsor_amount === 'string' && selectedEventRequest.sponsor_amount.startsWith('$')
                                ? selectedEventRequest.sponsor_amount
                                : `$${selectedEventRequest.sponsor_amount}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Submitted By (Student)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          {getRequesterName(selectedEventRequest)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedEventRequest.president_email || getRequesterEmail(selectedEventRequest)}</span>
                      </div>
                      {getRequesterRoll(selectedEventRequest) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Roll No:</span>
                          <span className="font-medium">{getRequesterRoll(selectedEventRequest)}</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Slot Status Information */}
                  {selectedEventRequest.slot_status_name && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3 text-university-navy">Slot Status</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Slot Status:</span>
                          <Badge variant={selectedEventRequest.slot_status_id === 2 ? "default" : "secondary"}>
                            {selectedEventRequest.slot_status_name}
                          </Badge>
                        </div>
                        {selectedEventRequest.slot_status_id === 2 && (
                          <p className="text-xs text-green-600 mt-2">
                            ✓ Slot has been granted by Protocol Office. This request is ready for review.
                          </p>
                        )}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Description / Media Coverage */}
                {(selectedEventRequest.description || selectedEventRequest.media_coverage) && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Event Description / Media Coverage</h3>
                    {selectedEventRequest.description && (
                      <p className="text-muted-foreground leading-relaxed mb-3">{selectedEventRequest.description}</p>
                    )}
                    {selectedEventRequest.media_coverage && (
                      <div>
                        <p className="font-medium text-sm mb-1">Media Coverage:</p>
                        <p className="text-muted-foreground leading-relaxed">{selectedEventRequest.media_coverage}</p>
                      </div>
                    )}
                  </Card>
                )}

                {/* Participants: Students */}
                {Array.isArray(selectedEventRequest.student_participants) &&
                  selectedEventRequest.student_participants.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Student Participants</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEventRequest.student_participants.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-wrap justify-between border-b last:border-0 pb-2 last:pb-0"
                        >
                          <span className="font-medium">
                            {s.academic_program || "Program not specified"}
                          </span>
                          <span className="text-muted-foreground">
                            {s.semester && `Semester: ${s.semester} • `}
                            {typeof s.no_of_students === "number" && s.no_of_students > 0
                              ? `${s.no_of_students} students`
                              : "Count not specified"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Participants: Staff */}
                {Array.isArray(selectedEventRequest.staff_participants) &&
                  selectedEventRequest.staff_participants.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Staff Participants</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEventRequest.staff_participants.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-wrap justify-between border-b last:border-0 pb-2 last:pb-0"
                        >
                          <span className="font-medium">
                            {s.department || "Department not specified"}
                          </span>
                          <span className="text-muted-foreground">
                            {s.gazetted || "Category not specified"} •{" "}
                            {typeof s.no_of_staff === "number" && s.no_of_staff > 0
                              ? `${s.no_of_staff} staff`
                              : "Count not specified"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Management Requirements */}
                {selectedEventRequest.management_requirements && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Management Requirements</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">Sound System:</span>{" "}
                          {selectedEventRequest.management_requirements.sound_system ? "Yes" : "No"}
                        </p>
                        <p>
                          <span className="font-medium">Recording:</span>{" "}
                          {selectedEventRequest.management_requirements.recording ? "Yes" : "No"}
                        </p>
                        <p>
                          <span className="font-medium">Bouquet:</span>{" "}
                          {selectedEventRequest.management_requirements.bouquet ? "Yes" : "No"}
                        </p>
                        <p>
                          <span className="font-medium">Souvenirs:</span>{" "}
                          {selectedEventRequest.management_requirements.souvenirs ? "Yes" : "No"}
                        </p>
                        <p>
                          <span className="font-medium">University Photographer:</span>{" "}
                          {selectedEventRequest.management_requirements.university_photographer
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">Special Arrangements:</span>{" "}
                          {selectedEventRequest.management_requirements.special_arrangements
                            ? "Yes"
                            : "No"}
                        </p>
                        {selectedEventRequest.management_requirements.special_arrangements_detail && (
                          <p className="text-muted-foreground">
                            {selectedEventRequest.management_requirements.special_arrangements_detail}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Refreshments:</span>{" "}
                          {selectedEventRequest.management_requirements.refreshment_required
                            ? "Yes"
                            : "No"}
                        </p>
                        {selectedEventRequest.management_requirements.refreshment_required && (
                          <p className="text-muted-foreground">
                            {selectedEventRequest.management_requirements.refreshment_category ||
                              "Category not specified"}
                            {" • "}
                            {selectedEventRequest.management_requirements.refreshment_persons
                              ? `${selectedEventRequest.management_requirements.refreshment_persons} persons`
                              : "Count not specified"}
                          </p>
                        )}
                        {selectedEventRequest.management_requirements.any_other && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Other:</span>{" "}
                            {selectedEventRequest.management_requirements.any_other}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Transport Requests */}
                {Array.isArray(selectedEventRequest.transport_requests) &&
                  selectedEventRequest.transport_requests.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Transport Requests</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEventRequest.transport_requests.map((t: any, idx: number) => (
                        <div
                          key={idx}
                          className="border rounded p-2 flex flex-wrap justify-between gap-2"
                        >
                          <div>
                            <p className="font-medium">{t.vehicle_type || "Vehicle not specified"}</p>
                            <p className="text-muted-foreground">
                              {t.purpose || "Purpose not specified"}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {t.date && <div>📅 {new Date(t.date).toLocaleDateString()}</div>}
                            {t.time && <div>🕐 {t.time}</div>}
                            {t.destination && <div>📍 {t.destination}</div>}
                            {typeof t.no_of_persons === "number" && t.no_of_persons > 0 && (
                              <div>👥 {t.no_of_persons} persons</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Documents */}
                {Array.isArray(selectedEventRequest.documents) &&
                  selectedEventRequest.documents.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Attached Documents</h3>
                    <div className="space-y-2 text-sm">
                      {selectedEventRequest.documents.map((doc: any) => (
                        <div
                          key={doc.doc_id}
                          className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                        >
                          <span>
                            <span className="font-medium capitalize">{doc.doc_type}</span>
                            {" – "}
                            {doc.file_path.split("/").pop()}
                          </span>
                          <a
                            href={`${import.meta.env.VITE_API_URL}${doc.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Admin Notes from History - Grouped by Role */}
                {Array.isArray(selectedEventRequest.status_history) &&
                  selectedEventRequest.status_history.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4 text-university-navy">Admin Notes & Status History</h3>
                    <div className="space-y-6">
                      {(() => {
                        const notesByRole: { [key: string]: any[] } = {};
                        selectedEventRequest.status_history
                          .filter((h: any) => h.note && h.note.trim() !== "")
                          .forEach((history: any) => {
                            const role = history.role || history.role_display_name || history.role_name || "Admin";
                            if (!notesByRole[role]) {
                              notesByRole[role] = [];
                            }
                            notesByRole[role].push(history);
                          });

                        const roleOrder = ["Board Secretary", "Board President", "Registrar", "VC", "Transport Office", "Protocol Office"];
                        const sortedRoles = Object.keys(notesByRole).sort((a, b) => {
                          const aIndex = roleOrder.indexOf(a);
                          const bIndex = roleOrder.indexOf(b);
                          if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                          if (aIndex === -1) return 1;
                          if (bIndex === -1) return -1;
                          return aIndex - bIndex;
                        });

                        if (sortedRoles.length === 0) {
                          return <p className="text-sm text-muted-foreground italic">No admin notes yet.</p>;
                        }

                        return sortedRoles.map((role) => (
                          <div key={role} className="space-y-3">
                            <h4 className="font-semibold text-sm text-university-navy border-b pb-2">
                              {role} Notes
                            </h4>
                            {notesByRole[role].map((history: any, idx: number) => (
                              <div
                                key={history.history_id || idx}
                                className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      {history.firstName && history.lastName
                                        ? `${history.firstName} ${history.lastName}`
                                        : "Unknown"}
                                      {history.status_name && ` • ${history.status_name}`}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(history.changed_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{history.note}</p>
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
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
                  <label className="text-sm font-medium mb-2 block">Select Action</label>
                  <Select 
                    value={selectedEventStatus > 0 ? selectedEventStatus.toString() : ""} 
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

        {/* Edit Society Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Society</DialogTitle>
              <DialogDescription>
                Update the society information below
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Society Name</label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter society name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Faculty Advisor</label>
                {loadingAdvisors ? (
                  <div className="text-sm text-muted-foreground">Loading advisors...</div>
                ) : advisors.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No advisors available</div>
                ) : (
                  <Select
                    value={editFormData.advisor || undefined}
                    onValueChange={(value) => {
                      console.log("Advisor changed to:", value);
                      setEditFormData({ ...editFormData, advisor: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={editFormData.advisor ? "Select advisor" : "Select advisor"}>
                        {editFormData.advisor && advisors.find(a => String(a.faculty_id) === editFormData.advisor)
                          ? `${advisors.find(a => String(a.faculty_id) === editFormData.advisor)?.name} (${advisors.find(a => String(a.faculty_id) === editFormData.advisor)?.email})`
                          : "Select advisor"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {advisors.map((advisor) => (
                        <SelectItem key={advisor.faculty_id} value={String(advisor.faculty_id)}>
                          {advisor.name} ({advisor.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {editFormData.advisor && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current advisor ID: {editFormData.advisor}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Purpose</label>
                <Textarea
                  value={editFormData.purpose}
                  onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                  placeholder="Enter purpose (minimum 30 characters)"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button 
                  variant="university" 
                  onClick={handleUpdateSociety}
                  disabled={actionLoading || !editFormData.name || !editFormData.description || !editFormData.category || !editFormData.location || !editFormData.advisor || !editFormData.purpose || editFormData.purpose.length < 30}
                >
                  {actionLoading ? "Updating..." : "Update Society"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  export default BoardSecretaryDashboard;

