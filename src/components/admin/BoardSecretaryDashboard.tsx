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
    const [societies, setSocieties] = useState<Society[]>([]);
    const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [reviewNote, setReviewNote] = useState("");
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

    // Helper functions for event requester details
    const getRequesterName = (request?: any) => {
      if (!request) return "Not available";
      const name = `${request.firstName || ""} ${request.lastName || ""}`.trim();
      if (name) return name;
      if (request.president_name) return request.president_name;
      if (request.submitted_by_name) return request.submitted_by_name;
      return "Not available";
    };

    const getRequesterEmail = (request?: any) => {
      if (!request) return "Not provided";
      return request.email || request.president_email || request.submitted_by_email || "Not provided";
    };

    const getRequesterRoll = (request?: any) => {
      if (!request) return null;
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

    // Fetch pending societies for Board Secretary
    const fetchPendingSocieties = async () => {
      try {
        setLoading(true);
        setError("");
    
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
    
        const response = await axios.post(
          "http://localhost:5000/admin/societies-by-role",
          { role: "board_secretary" },
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
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch detailed society information
        const response = await axios.get(`http://localhost:5000/admin/societies/${society.society_id}`, {
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
          `http://localhost:5000/admin/board-secretary/societies/${selectedSociety.society_id}/review`,
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
        await fetchPendingSocieties();
        
        // Close modal
        setIsModalOpen(false);
        setSelectedSociety(null);
        setReviewNote("");
        
        // Show success message
        alert(`Society ${action}d successfully!`);
        
      } catch (err: any) {
        console.error(`Error ${action}ing society:`, err);
        alert(err.response?.data?.message || err.message || `Failed to ${action} society`);
      } finally {
        setActionLoading(false);
      }
    };

    // Fetch allowed statuses for Board Secretary based on current status
    const fetchStatuses = async (currentStatusId: number = 1) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Board Secretary can only set status 2 (Approve) or 3 (Reject) from status 1 (Pending)
        const response = await axios.get(`http://localhost:5000/admin/allowed-statuses?role=board_secretary&current_status_id=${currentStatusId}`, {
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
          "http://localhost:5000/admin/event-requests",
          { role: "board_secretary" },
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

        // Board Secretary can only approve (2) or reject (3) event requests
        const action = selectedEventStatus === 2 ? 'approve' : 'reject';
        const response = await axios.put(
          `http://localhost:5000/admin/board-secretary/event-requests/${selectedEventRequest.req_id}/review`,
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

    // Load societies on component mount
    useEffect(() => {
      fetchPendingSocieties();
      fetchStatuses();
    }, []);

    // Fetch event requests when tab is active
    useEffect(() => {
      if (activeTab === "event-requests") {
        fetchAllEventRequests();
      }
    }, [activeTab]);

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
                <p className="text-white/80">Review Pending Society Applications</p>
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
            {/* Stats Overview */}
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Societies</TabsTrigger>
                <TabsTrigger value="event-requests">Event Requests</TabsTrigger>
                <TabsTrigger value="event-reports">Event Reports</TabsTrigger>
              </TabsList>

              {/* Societies Tab */}
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
                              src={`http://localhost:5000/${society.society_logo}`}
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
                        {/* Only show Review button for Pending (status 1) - Board Secretary's pending items */}
                        {society.status_id === 1 ? (
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
                            {/* Only show Update Status button for Pending (status 1) - Board Secretary's pending items */}
                            {request.status_id === 1 ? (
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
                          src={`http://localhost:5000/${selectedSociety.society_logo}`}
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
                          {getRequesterName(selectedEventRequest)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{getRequesterEmail(selectedEventRequest)}</span>
                      </div>
                      {getRequesterRoll(selectedEventRequest) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Roll No:</span>
                          <span className="font-medium">{getRequesterRoll(selectedEventRequest)}</span>
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

  export default BoardSecretaryDashboard;

