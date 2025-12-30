import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calendar, 
  Eye,
  AlertTriangle,
  LogOut,
  Clock,
  FileText,
  MapPin,
  Shield,
  CheckCircle,
  XCircle,
  Lightbulb,
  Filter,
  MoreVertical,
  Pencil,
  User
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const ProtocolOfficeDashboard = () => {
  const { toast } = useToast();
  const [eventRequests, setEventRequests] = useState([]);
  const [selectedEventRequest, setSelectedEventRequest] = useState(null);
  const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
  const [isSlotStatusModalOpen, setIsSlotStatusModalOpen] = useState(false);
  const [isSuggestSlotModalOpen, setIsSuggestSlotModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  // Filters
  const [selectedVenueId, setSelectedVenueId] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotStatus, setSelectedSlotStatus] = useState<string>("all"); // Default: All statuses
  
  // Venues list
  const [venues, setVenues] = useState<Array<{ venue_id: number; venue_name: string }>>([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Slot status update
  const [slotStatusNote, setSlotStatusNote] = useState("");
  const [selectedSlotStatusId, setSelectedSlotStatusId] = useState<string>("2"); // Default: GRANTED
  
  // Suggest slot - manual entry
  const [suggestSlotNote, setSuggestSlotNote] = useState("");
  const [suggestSlotDate, setSuggestSlotDate] = useState<string>("");
  const [suggestSlotTimeFrom, setSuggestSlotTimeFrom] = useState<string>("");
  const [suggestSlotTimeTo, setSuggestSlotTimeTo] = useState<string>("");
  const [suggestSlotVenueId, setSuggestSlotVenueId] = useState<string>("");
  
  // Stats
  const [eventRequestStats, setEventRequestStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Suggested slots tab
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [suggestedSlotsLoading, setSuggestedSlotsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentSuggestedPage, setCurrentSuggestedPage] = useState(1);

  // Helper function to convert 24h time to AM/PM
  const formatTimeToAMPM = (time24: string) => {
    if (!time24) return "";
    try {
      const [hours, minutes] = time24.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return time24;
    }
  };

  // Check if advisor can edit the request
  const canAdvisorEdit = (request: any) => {
    if (!request) return false;
    
    // Check if slot is REJECTED (3) or SUGGESTED (4)
    const slotRejectedOrSuggested = request.slot_status_id === 3 || request.slot_status_id === 4;
    
    // Check if event is rejected by any admin (3, 5, 7, 9, 12, 14)
    const eventRejected = [3, 5, 7, 9, 12, 14].includes(request.event_status_id);
    
    return slotRejectedOrSuggested || eventRejected;
  };

  // Handle edit request - redirect to edit form
  const handleEditRequest = (reqId: number) => {
    // Navigate to event request edit page - advisor can edit when slot is rejected/suggested or event is rejected
    navigate(`/dashboard/society/event-request/edit/${reqId}`);
  };

  // Helper functions for advisor (faculty) details
  const getAdvisorName = (request) => {
    if (!request) return "Not available";
    return request.advisor_name || "Not available";
  };

  const getAdvisorEmail = (request) => {
    if (!request) return "Not provided";
    return request.advisor_email || "Not provided";
  };

  const getAdvisorPhone = (request) => {
    if (!request) return null;
    return request.advisor_phone || null;
  };

  // Get status badge variant
  const getStatusVariant = (statusId) => {
    if ([1].includes(statusId)) return "secondary"; // Pending
    if ([2, 4, 6, 8, 11, 13, 15].includes(statusId)) return "default"; // Approved statuses
    if ([3, 5, 7, 9, 12, 14].includes(statusId)) return "destructive"; // Rejected statuses
    return "outline";
  };

  // Fetch venues
  const fetchVenues = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/society/venues`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setVenues(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching venues:", err);
    }
  };

  // Fetch protocol event requests with filters
  const fetchProtocolEventRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

    const params: any = {};
    if (selectedVenueId && selectedVenueId !== "all") params.venue_id = selectedVenueId;
    if (selectedDate) params.date = selectedDate;
    // Only send status_id if not "all" - don't send status_id at all to get all statuses
    if (selectedSlotStatus && selectedSlotStatus !== "all") {
      params.status_id = selectedSlotStatus;
    }
    // If "all" is selected, don't send status_id parameter at all

      const response = await axios.get(
        `${API_URL}/admin/protocol/event-requests`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setEventRequests(response.data.data || []);
        setCurrentPage(1); // Reset to first page when data changes
      }
    } catch (err: any) {
      console.error("Error fetching protocol event requests:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch event requests");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch event requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available slots for suggesting
  const fetchAvailableSlots = async (venueId: number, date: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/admin/protocol/slots/available`, {
        params: { venue_id: venueId, date },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAvailableSlots(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching available slots:", err);
    }
  };

  // Handle view event request details
  const handleViewEventRequest = async (reqId) => {
    try {
       const API_URL = import.meta.env.VITE_API_URL;
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`${API_URL}/admin/event-requests/${reqId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedEventRequest(response.data.data);
      setIsEventRequestModalOpen(true);
    } catch (err) {
      console.error("Error fetching event request details:", err);
      setError(err.response?.data?.message || "Failed to fetch event request details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch event request stats
  const fetchEventRequestStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setStatsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(`${API_URL}/admin/event-requests/stats`, {
        role: "protocol_office_view"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEventRequestStats(response.data.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error("Error fetching event request stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle slot status update
  const handleUpdateSlotStatus = async () => {
    if (!selectedEventRequest) return;

    try {
      setActionLoading(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const changed_by = user.faculty_id || user.id;

      if (!changed_by) {
        toast({
          title: "Error",
          description: "User information not found",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.put(
        `${API_URL}/admin/protocol/slots/${selectedEventRequest.slot_id}/status`,
        {
          status_id: parseInt(selectedSlotStatusId),
          note: slotStatusNote,
          changed_by,
          event_req_id: selectedEventRequest.req_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Slot status updated successfully - event request status remains unchanged
        // Event request should remain in pending status (1) for Board Secretary to review
        toast({
          title: "Success",
          description: "Slot status updated successfully. Event request remains pending for Board Secretary review.",
        });
        setIsSlotStatusModalOpen(false);
        setSlotStatusNote("");
        fetchProtocolEventRequests();
      }
    } catch (err: any) {
      console.error("Error updating slot status:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update slot status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle suggest slot - manual entry
  const handleSuggestSlot = async () => {
    if (!selectedEventRequest || !suggestSlotDate || !suggestSlotTimeFrom || !suggestSlotTimeTo || !suggestSlotVenueId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Date, Time From, Time To, and Venue)",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const suggested_by = user.faculty_id || user.id;

      if (!suggested_by) {
        toast({
          title: "Error",
          description: "User information not found",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(
        `${API_URL}/admin/protocol/slots/suggest`,
        {
          slot_request_id: selectedEventRequest.slot_request_id,
          venue_id: parseInt(suggestSlotVenueId),
          slot_date: suggestSlotDate,
          slot_time_from: suggestSlotTimeFrom,
          slot_time_to: suggestSlotTimeTo,
          suggested_by,
          note: suggestSlotNote,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Slot suggestion created successfully",
        });
        setIsSuggestSlotModalOpen(false);
        setSuggestSlotNote("");
        setSuggestSlotDate("");
        setSuggestSlotTimeFrom("");
        setSuggestSlotTimeTo("");
        setSuggestSlotVenueId("");
        fetchProtocolEventRequests();
        fetchSuggestedSlots();
      }
    } catch (err: any) {
      console.error("Error suggesting slot:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to suggest slot",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch suggested slots
  const fetchSuggestedSlots = async () => {
    try {
      setSuggestedSlotsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/admin/protocol/slots/suggested`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuggestedSlots(response.data.data || []);
        setCurrentSuggestedPage(1); // Reset to first page when data changes
      }
    } catch (err) {
      console.error("Error fetching suggested slots:", err);
    } finally {
      setSuggestedSlotsLoading(false);
    }
  };

  // Open slot status modal
  const handleOpenSlotStatusModal = (request: any) => {
    setSelectedEventRequest(request);
    setSelectedSlotStatusId("2"); // Default to GRANTED
    setSlotStatusNote("");
    setIsSlotStatusModalOpen(true);
  };

  // Open suggest slot modal
  const handleOpenSuggestSlotModal = async (request: any) => {
    setSelectedEventRequest(request);
    setSuggestSlotNote("");
    setSuggestSlotDate(request.slot_date ? new Date(request.slot_date).toISOString().split('T')[0] : "");
    setSuggestSlotTimeFrom(request.slot_time_from || "");
    setSuggestSlotTimeTo(request.slot_time_to || "");
    setSuggestSlotVenueId(request.venue_id ? String(request.venue_id) : "");
    setIsSuggestSlotModalOpen(true);
  };

  useEffect(() => {
    fetchVenues();
    fetchProtocolEventRequests();
    fetchEventRequestStats();
    fetchSuggestedSlots();
  }, [selectedVenueId, selectedDate, selectedSlotStatus]);

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
                <Shield className="h-8 w-8 mr-3" />
                Protocol Office Dashboard
              </h1>
              <p className="text-white/80">View All Event Protocol Requests</p>
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
                <FileText className="h-8 w-8 text-green-600" />
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
                <FileText className="h-8 w-8 text-red-600" />
              </div>
            </Card>
          </div>

          {/* Info Banner */}
          {/* <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Read-Only Access</p>
                <p className="text-sm text-blue-700">
                  You have view-only access to all event requests. You cannot modify statuses or add notes.
                </p>
              </div>
            </div>
          </Card> */}

          {/* Filters Section */}
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-university-navy" />
              <h3 className="text-lg font-semibold text-university-navy">Filters</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Venue</Label>
                <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Venues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Venues</SelectItem>
                    {venues.map((venue) => (
                      <SelectItem key={venue.venue_id} value={String(venue.venue_id)}>
                        {venue.venue_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  placeholder="Select date"
                />
              </div>
              <div>
                <Label>Slot Status</Label>
                <Select value={selectedSlotStatus} onValueChange={setSelectedSlotStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="1">REQUESTED</SelectItem>
                    <SelectItem value="2">GRANTED</SelectItem>
                    <SelectItem value="3">REJECTED</SelectItem>
                    <SelectItem value="4">SUGGESTED</SelectItem>
                    <SelectItem value="5">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedVenueId("all");
                    setSelectedDate("");
                    setSelectedSlotStatus("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>

          {/* Tabs for Requests and Suggested Slots */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="requests">Slot Requests</TabsTrigger>
                <TabsTrigger value="suggested">Suggested Slots</TabsTrigger>
              </TabsList>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (activeTab === "requests") {
                    fetchProtocolEventRequests();
                  } else {
                    fetchSuggestedSlots();
                  }
                }}
                disabled={loading || suggestedSlotsLoading}
              >
                {loading || suggestedSlotsLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Card className="p-4 border-red-200 bg-red-50 mb-6">
                <p className="text-red-600">Error: {error}</p>
              </Card>
            )}

            {/* Event Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              {/* Event Requests List */}
          {loading && eventRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading event requests...</p>
            </div>
          ) : eventRequests.length > 0 ? (
            <>
            <div className="grid gap-4">
              {eventRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((request) => (
                <Card key={request.req_id} className="p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 flex-wrap gap-2">
                        <h3 className="text-lg font-semibold text-university-navy">
                          {request.event_name || request.title || "Event Request"}
                        </h3>
                        {request.slot_status_name && (
                          <Badge variant={getStatusVariant(request.slot_status_id)}>
                            Slot: {request.slot_status_name}
                          </Badge>
                        )}
                        {request.event_status_id && (
                          <Badge variant={getStatusVariant(request.event_status_id)}>
                            Event: {request.status_name || "Pending"}
                          </Badge>
                        )}
                        {request.society_name && (
                          <Badge variant="outline">{request.society_name}</Badge>
                        )}
                      </div>
                      {request.event_type && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Type: {request.event_type}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                        {request.date_from && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.date_from).toLocaleDateString()}
                            {request.date_to && request.date_to !== request.date_from && (
                              <> - {new Date(request.date_to).toLocaleDateString()}</>
                            )}
                          </span>
                        )}
                        {request.time_from && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeToAMPM(request.time_from)}
                            {request.time_to && <> - {formatTimeToAMPM(request.time_to)}</>}
                          </span>
                        )}
                        {request.venue_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {request.venue_name}
                          </span>
                        )}
                        {request.advisor_name && (
                          <span className="flex items-center gap-1">
                            👤 Advisor: {request.advisor_name}
                            {request.advisor_email && <> ({request.advisor_email})</>}
                          </span>
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
                            disabled={loading}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canAdvisorEdit(request) && (
                            <DropdownMenuItem 
                              onClick={() => handleEditRequest(request.req_id)}
                              disabled={loading}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Request
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleOpenSlotStatusModal(request)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleOpenSuggestSlotModal(request)}
                            disabled={loading}
                          >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Suggest Slot
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {eventRequests.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, eventRequests.length)} of {eventRequests.length} event requests
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.ceil(eventRequests.length / itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return page === 1 || 
                               page === Math.ceil(eventRequests.length / itemsPerPage) ||
                               (page >= currentPage - 1 && page <= currentPage + 1);
                      })
                      .map((page, idx, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[idx - 1];
                        const showEllipsisBefore = prevPage && page - prevPage > 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(eventRequests.length / itemsPerPage), prev + 1))}
                        className={currentPage >= Math.ceil(eventRequests.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            </>
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

            {/* Suggested Slots Tab */}
            <TabsContent value="suggested" className="space-y-4">
              {suggestedSlotsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading suggested slots...</p>
                </div>
              ) : suggestedSlots.length > 0 ? (
                <>
                <div className="grid gap-4">
                  {suggestedSlots.slice((currentSuggestedPage - 1) * itemsPerPage, currentSuggestedPage * itemsPerPage).map((slot: any) => (
                    <Card key={slot.suggested_slot_id || slot.id} className="p-4 shadow-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2 flex-wrap gap-2">
                            <h3 className="text-lg font-semibold text-university-navy">
                              {slot.event_name || "Event"}
                            </h3>
                            {slot.society_name && (
                              <Badge variant="outline">{slot.society_name}</Badge>
                            )}
                            {slot.slot_status_name && (
                              <Badge variant={getStatusVariant(slot.slot_status_id)}>
                                {slot.slot_status_name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                            {slot.venue_name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {slot.venue_name}
                              </span>
                            )}
                            {slot.slot_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(slot.slot_date).toLocaleDateString()}
                              </span>
                            )}
                            {slot.slot_time_from && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeToAMPM(slot.slot_time_from)}
                                {slot.slot_time_to && <> - {formatTimeToAMPM(slot.slot_time_to)}</>}
                              </span>
                            )}
                          </div>
                          {slot.note && (
                            <div className="bg-blue-50 border-l-4 border-blue-200 p-2 mt-2 rounded">
                              <p className="text-xs font-medium text-blue-900 mb-1">Note:</p>
                              <p className="text-xs text-blue-800">{slot.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {/* Pagination for Suggested Slots */}
                {suggestedSlots.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentSuggestedPage - 1) * itemsPerPage + 1} to {Math.min(currentSuggestedPage * itemsPerPage, suggestedSlots.length)} of {suggestedSlots.length} suggested slots
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentSuggestedPage(prev => Math.max(1, prev - 1))}
                            className={currentSuggestedPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: Math.ceil(suggestedSlots.length / itemsPerPage) }, (_, i) => i + 1)
                          .filter(page => {
                            return page === 1 || 
                                   page === Math.ceil(suggestedSlots.length / itemsPerPage) ||
                                   (page >= currentSuggestedPage - 1 && page <= currentSuggestedPage + 1);
                          })
                          .map((page, idx, array) => {
                            const prevPage = array[idx - 1];
                            const showEllipsisBefore = prevPage && page - prevPage > 1;
                            
                            return (
                              <React.Fragment key={page}>
                                {showEllipsisBefore && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => setCurrentSuggestedPage(page)}
                                    isActive={currentSuggestedPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            );
                          })}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentSuggestedPage(prev => Math.min(Math.ceil(suggestedSlots.length / itemsPerPage), prev + 1))}
                            className={currentSuggestedPage >= Math.ceil(suggestedSlots.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Suggested Slots Found</h3>
                  <p className="text-muted-foreground">
                    No slot suggestions have been made yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Event Request Detail Modal (Read-Only) */}
      <Dialog open={isEventRequestModalOpen} onOpenChange={setIsEventRequestModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Event Request Details (Read-Only)</DialogTitle>
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
                      {selectedEventRequest.slot_status_name && (
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          Slot: {selectedEventRequest.slot_status_name}
                        </Badge>
                      )}
                      {selectedEventRequest.status_name && (
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          Event: {selectedEventRequest.status_name}
                        </Badge>
                      )}
                      {selectedEventRequest.society_name && (
                        <Badge variant="outline" className="text-white border-white">
                          {selectedEventRequest.society_name}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedEventRequest.event_name || selectedEventRequest.title || "Event Request"}
                    </h2>
                    {selectedEventRequest.description && (
                      <p className="text-white/90 mb-4">{selectedEventRequest.description}</p>
                    )}
                    <div className="flex items-center flex-wrap gap-4 text-sm">
                      {selectedEventRequest.date_from && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(selectedEventRequest.date_from).toLocaleDateString()}</span>
                          {selectedEventRequest.date_to && selectedEventRequest.date_to !== selectedEventRequest.date_from && (
                            <> - {new Date(selectedEventRequest.date_to).toLocaleDateString()}</>
                          )}
                        </div>
                      )}
                      {selectedEventRequest.time_from && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTimeToAMPM(selectedEventRequest.time_from)}</span>
                          {selectedEventRequest.time_to && <> - {formatTimeToAMPM(selectedEventRequest.time_to)}</>}
                        </div>
                      )}
                      {selectedEventRequest.venue_name && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedEventRequest.venue_name}</span>
                        </div>
                      )}
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
                      <span className="font-medium">{selectedEventRequest.venue_name || selectedEventRequest.venue || "Not specified"}</span>
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
                    <User className="h-5 w-5" />
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
                    {selectedEventRequest.advisor_name || getAdvisorName(selectedEventRequest) ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Advisor Name:</span>
                          <span className="font-medium">
                            {selectedEventRequest.advisor_name || getAdvisorName(selectedEventRequest)}
                          </span>
                        </div>
                        {(selectedEventRequest.advisor_email || getAdvisorEmail(selectedEventRequest)) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Advisor Email:</span>
                            <span className="font-medium">
                              {selectedEventRequest.advisor_email || getAdvisorEmail(selectedEventRequest)}
                            </span>
                          </div>
                        )}
                        {(selectedEventRequest.advisor_phone || getAdvisorPhone(selectedEventRequest)) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Advisor Phone:</span>
                            <span className="font-medium">
                              {selectedEventRequest.advisor_phone || getAdvisorPhone(selectedEventRequest)}
                            </span>
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
                            {typeof selectedEventRequest.sponsor_amount === 'string' 
                              ? (selectedEventRequest.sponsor_amount.startsWith('PKR') || selectedEventRequest.sponsor_amount.startsWith('$')
                                  ? selectedEventRequest.sponsor_amount.replace(/^\$/, 'PKR ')
                                  : `PKR ${selectedEventRequest.sponsor_amount}`)
                              : `PKR ${selectedEventRequest.sponsor_amount}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Slot Status Information */}
                {selectedEventRequest.slot_status_name && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 text-university-navy">Slot Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Slot Status:</span>
                        <Badge variant={getStatusVariant(selectedEventRequest.slot_status_id)}>
                          {selectedEventRequest.slot_status_name}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slot Date:</span>
                        <span className="font-medium">
                          {selectedEventRequest.slot_date 
                            ? new Date(selectedEventRequest.slot_date).toLocaleDateString()
                            : "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slot Time:</span>
                        <span className="font-medium">
                          {selectedEventRequest.slot_time_from 
                            ? formatTimeToAMPM(selectedEventRequest.slot_time_from)
                            : ""} - {selectedEventRequest.slot_time_to 
                            ? formatTimeToAMPM(selectedEventRequest.slot_time_to)
                            : ""}
                        </span>
                      </div>
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
                        <>
                          {selectedEventRequest.management_requirements.refreshment_category && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Category:</span>{" "}
                              {selectedEventRequest.management_requirements.refreshment_category}
                            </p>
                          )}
                          {selectedEventRequest.management_requirements.refreshment_persons && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">Persons:</span>{" "}
                              {selectedEventRequest.management_requirements.refreshment_persons} persons
                            </p>
                          )}
                        </>
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
                    {/* Group notes by role */}
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Slot Status Update Modal */}
      <Dialog open={isSlotStatusModalOpen} onOpenChange={setIsSlotStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Slot Status</DialogTitle>
            <DialogDescription>
              Update the slot status for {selectedEventRequest?.event_name}
            </DialogDescription>
          </DialogHeader>
          {selectedEventRequest && (
            <div className="space-y-4">
              <div>
                <Label>Current Slot</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedEventRequest.slot_time_from 
                    ? formatTimeToAMPM(selectedEventRequest.slot_time_from)
                    : ""} - {selectedEventRequest.slot_time_to 
                    ? formatTimeToAMPM(selectedEventRequest.slot_time_to)
                    : ""} on {selectedEventRequest.slot_date 
                    ? new Date(selectedEventRequest.slot_date).toLocaleDateString()
                    : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: <Badge>{selectedEventRequest.slot_status_name}</Badge>
                </p>
              </div>
              <div>
                <Label>New Status *</Label>
                <Select value={selectedSlotStatusId} onValueChange={setSelectedSlotStatusId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">REQUESTED</SelectItem>
                    <SelectItem value="2">GRANTED</SelectItem>
                    <SelectItem value="3">REJECTED</SelectItem>
                    <SelectItem value="4">SUGGESTED</SelectItem>
                    <SelectItem value="5">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Note: If status is GRANTED, the event request will be forwarded to Board Secretary.
                </p>
              </div>
              <div>
                <Label>Note</Label>
                <Textarea
                  value={slotStatusNote}
                  onChange={(e) => setSlotStatusNote(e.target.value)}
                  placeholder="Add a note about this status change..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsSlotStatusModalOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSlotStatus} disabled={actionLoading}>
                  {actionLoading ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suggest Slot Modal */}
      <Dialog open={isSuggestSlotModalOpen} onOpenChange={setIsSuggestSlotModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest Alternative Slot</DialogTitle>
            <DialogDescription>
              Suggest an alternative slot for {selectedEventRequest?.event_name}
            </DialogDescription>
          </DialogHeader>
          {selectedEventRequest && (
            <div className="space-y-4">
              <div>
                <Label>Original Slot</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedEventRequest.slot_time_from 
                    ? formatTimeToAMPM(selectedEventRequest.slot_time_from)
                    : ""} - {selectedEventRequest.slot_time_to 
                    ? formatTimeToAMPM(selectedEventRequest.slot_time_to)
                    : ""} on {selectedEventRequest.slot_date 
                    ? new Date(selectedEventRequest.slot_date).toLocaleDateString()
                    : ""}
                </p>
              </div>
              <div>
                <Label>Venue *</Label>
                <Select value={suggestSlotVenueId} onValueChange={setSuggestSlotVenueId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.venue_id} value={String(venue.venue_id)}>
                        {venue.venue_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Slot Date *</Label>
                <Input
                  type="date"
                  value={suggestSlotDate}
                  onChange={(e) => setSuggestSlotDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time From *</Label>
                  <Input
                    type="time"
                    value={suggestSlotTimeFrom}
                    onChange={(e) => setSuggestSlotTimeFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Time To *</Label>
                  <Input
                    type="time"
                    value={suggestSlotTimeTo}
                    onChange={(e) => setSuggestSlotTimeTo(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Note</Label>
                <Textarea
                  value={suggestSlotNote}
                  onChange={(e) => setSuggestSlotNote(e.target.value)}
                  placeholder="Add a note about this suggestion..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsSuggestSlotModalOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSuggestSlot} 
                  disabled={actionLoading || !suggestSlotDate || !suggestSlotTimeFrom || !suggestSlotTimeTo || !suggestSlotVenueId}
                >
                  {actionLoading ? "Suggesting..." : "Suggest Slot"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProtocolOfficeDashboard;