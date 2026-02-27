import React, { useState, useEffect } from "react";
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
  Shield,
  Filter,
  Search,
  TrendingUp,
  Edit,
  MapPin,
  MoreVertical,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeToAMPM } from "@/lib/utils";
import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";

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

const RegistrarDashboard = () => {
  const { toast } = useToast();
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
  // Default to event-requests tab; societies/overview UI is now hidden
  const [activeTab, setActiveTab] = useState<string>("event-requests");
  const navigate = useNavigate();
  const [eventRequests, setEventRequests] = useState<any[]>([]);
  const [loadingEventRequests, setLoadingEventRequests] = useState(false);
  const [selectedEventRequest, setSelectedEventRequest] = useState<any | null>(null);
  const [isEventRequestModalOpen, setIsEventRequestModalOpen] = useState(false);
  const [isEventStatusModalOpen, setIsEventStatusModalOpen] = useState(false);
  const [eventStatusNote, setEventStatusNote] = useState("");
  const [selectedEventStatus, setSelectedEventStatus] = useState<number>(0);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [eventRequestStats, setEventRequestStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [eventRequestFilter, setEventRequestFilter] = useState<string>("all"); // all, pending, approved, rejected
  const [eventRequestSearch, setEventRequestSearch] = useState<string>("");

  // Pagination states
  const [societiesCurrentPage, setSocietiesCurrentPage] = useState(1);
  const [eventRequestsCurrentPage, setEventRequestsCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Fetch all societies
  const fetchAllSocieties = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${API_URL}/admin/societies-by-role`,
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
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) return;

      // Registrar can only set status 6 (Approve) or 7 (Reject) from status 4 (Approved by Board President)
      const response = await axios.get(`${API_URL}/admin/allowed-statuses?role=registrar&current_status_id=${currentStatusId}`, {
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
        `${API_URL}/admin/societies/${selectedSociety.society_id}/status`,
        {
          status_id: selectedStatus,
          note: statusNote,
          changed_by: userId
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

      // Show success toast
      toast({
        title: "Success",
        description: "Society status updated successfully!",
        variant: "default",
      });

    } catch (err: any) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to update status",
        variant: "destructive",
      });
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
      const API_URL = import.meta.env.VITE_API_URL;
      setLoadingEventRequests(true);
      setError("");

      const currentUser = getCurrentUser();
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Always fetch ALL event requests for the role
      const response = await axios.post(
        `${API_URL}/admin/event-requests`,  // ✅ POST
        {
          role: currentUser?.role || "registrar",
          filter: "all"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Event requests fetched:", response.data);
      const allRequests = response.data.data || [];
      setEventRequests(allRequests);

      // Update stats locally based on the refined logic
      setEventRequestStats({
        total: allRequests.length,
        pending: allRequests.filter((r: any) => [4, 17].includes(r.status_id)).length,
        approved: allRequests.filter((r: any) => [6, 8, 10, 11, 12, 13].includes(r.status_id)).length,
        rejected: allRequests.filter((r: any) => [7, 9, 14].includes(r.status_id)).length
      });

      setEventRequestsCurrentPage(1); // Reset to first page when data changes
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
        { role: "registrar" },
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

      // Registrar can approve (6), reject (7), or revise (17) event requests
      let action: 'approve' | 'reject' | 'revise';
      if (selectedEventStatus === 6) {
        action = 'approve';
      } else if (selectedEventStatus === 7) {
        action = 'reject';
      } else if (selectedEventStatus === 17) {
        action = 'revise';
      } else {
        toast({
          title: "Error",
          description: "Invalid status selected. Please select Approve (6), Reject (7), or Revise (17).",
          variant: "destructive",
        });
        setActionLoading(false);
        return;
      }

      const response = await axios.put(
        `${API_URL}/admin/registrar/event-requests/${selectedEventRequest.req_id}/review`,
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

      // Refresh the event requests list
      await fetchAllEventRequests();

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

  // Load data on component mount
  useEffect(() => {
    fetchAllSocieties();
    fetchStatuses();
  }, []);

  // Fetch event requests when tab is active or filter changes
  useEffect(() => {
    if (activeTab === "event-requests") {
      fetchAllEventRequests();
      // fetchEventRequestStats();
    }
  }, [activeTab, eventRequestFilter]);

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              {/* Societies/Overview tabs hidden as per latest requirements */}
              {/* <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="societies">All Societies</TabsTrigger> */}
              <TabsTrigger value="event-requests">Event Requests</TabsTrigger>
              <TabsTrigger value="event-reports">Event Reports</TabsTrigger>
            </TabsList>

            {/* Overview content kept for reference but no longer reachable */}
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

            {/* All Societies content kept for reference but no longer reachable */}
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
                <>
                  <div className="grid gap-6">
                    {societies.slice((societiesCurrentPage - 1) * itemsPerPage, societiesCurrentPage * itemsPerPage).map((society) => (
                      <Card key={society.society_id} className="p-6 shadow-card hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-20 h-20 bg-university-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              {society.society_logo ? (
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/${society.society_logo}`}

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

                  {/* Pagination for Societies */}
                  {societies.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-muted-foreground">
                        Showing {(societiesCurrentPage - 1) * itemsPerPage + 1} to {Math.min(societiesCurrentPage * itemsPerPage, societies.length)} of {societies.length} societies
                      </div>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setSocietiesCurrentPage(prev => Math.max(1, prev - 1))}
                              className={societiesCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: Math.ceil(societies.length / itemsPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                              return page === 1 ||
                                page === Math.ceil(societies.length / itemsPerPage) ||
                                (page >= societiesCurrentPage - 1 && page <= societiesCurrentPage + 1);
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
                                      onClick={() => setSocietiesCurrentPage(page)}
                                      isActive={societiesCurrentPage === page}
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
                              onClick={() => setSocietiesCurrentPage(prev => Math.min(Math.ceil(societies.length / itemsPerPage), prev + 1))}
                              className={societiesCurrentPage >= Math.ceil(societies.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
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
              {/* Stats Overview - Event Requests */}
              <div className="grid md:grid-cols-4 gap-6">
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

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by event name, society, description..."
                    value={eventRequestSearch}
                    onChange={(e) => {
                      setEventRequestSearch(e.target.value);
                      setEventRequestsCurrentPage(1); // Reset to first page on search
                    }}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={eventRequestFilter === "all" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setEventRequestFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={eventRequestFilter === "pending" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setEventRequestFilter("pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={eventRequestFilter === "approved" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setEventRequestFilter("approved")}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={eventRequestFilter === "rejected" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setEventRequestFilter("rejected")}
                  >
                    Rejected
                  </Button>
                </div>
              </div>

              {/* Event Requests List */}
              {loadingEventRequests && eventRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading event requests...</p>
                </div>
              ) : (() => {
                // Filter event requests based on both tab selection and search term
                const filteredRequests = eventRequests.filter((request: any) => {
                  // 1. Status Filter (Refined Logic)
                  if (eventRequestFilter === "pending") {
                    if (![4, 17].includes(request.status_id)) return false;
                  } else if (eventRequestFilter === "approved") {
                    if (![6, 8, 10, 11, 12, 13].includes(request.status_id)) return false;
                  } else if (eventRequestFilter === "rejected") {
                    if (![7, 9, 14].includes(request.status_id)) return false;
                  }

                  // 2. Search Filter
                  if (!eventRequestSearch.trim()) return true;
                  const searchLower = eventRequestSearch.toLowerCase();
                  return (
                    (request.title || "").toLowerCase().includes(searchLower) ||
                    (request.event_name || "").toLowerCase().includes(searchLower) ||
                    (request.society_name || "").toLowerCase().includes(searchLower) ||
                    (request.description || "").toLowerCase().includes(searchLower) ||
                    (request.venue || "").toLowerCase().includes(searchLower) ||
                    ((request.firstName || "") + " " + (request.lastName || "")).toLowerCase().includes(searchLower)
                  );
                });

                return filteredRequests.length > 0 ? (
                  <>
                    <div className="grid gap-6">
                      {filteredRequests.slice((eventRequestsCurrentPage - 1) * itemsPerPage, eventRequestsCurrentPage * itemsPerPage).map((request: any) => (
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

                    {/* Pagination for Event Requests */}
                    {filteredRequests.length > itemsPerPage && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">
                          Showing {(eventRequestsCurrentPage - 1) * itemsPerPage + 1} to {Math.min(eventRequestsCurrentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} event requests
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setEventRequestsCurrentPage(prev => Math.max(1, prev - 1))}
                                className={eventRequestsCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: Math.ceil(filteredRequests.length / itemsPerPage) }, (_, i) => i + 1)
                              .filter(page => {
                                return page === 1 ||
                                  page === Math.ceil(filteredRequests.length / itemsPerPage) ||
                                  (page >= eventRequestsCurrentPage - 1 && page <= eventRequestsCurrentPage + 1);
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
                                        onClick={() => setEventRequestsCurrentPage(page)}
                                        isActive={eventRequestsCurrentPage === page}
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
                                onClick={() => setEventRequestsCurrentPage(prev => Math.min(Math.ceil(filteredRequests.length / itemsPerPage), prev + 1))}
                                className={eventRequestsCurrentPage >= Math.ceil(filteredRequests.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                      {eventRequestSearch ? `No event requests match "${eventRequestSearch}"` : "No event requests have been submitted yet."}
                    </p>
                  </div>
                );
              })()}
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
                        src={`${import.meta.env.VITE_API_URL}/${selectedSociety.society_logo || selectedSociety.logo_path}`}
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
              {/* Cancellation Notice */}
              {selectedEventRequest.cancelled_reason && (
                <Card className="p-4 shadow-sm border-l-4 border-l-red-500 bg-red-50">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 text-red-900 flex items-center gap-2">
                        Event Request Cancelled
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-red-800 mb-1">Cancellation Reason:</p>
                          <p className="text-sm text-red-700 bg-white/50 p-3 rounded border border-red-200">
                            {selectedEventRequest.cancelled_reason}
                          </p>
                        </div>
                        {selectedEventRequest.cancelled_at && (
                          <p className="text-xs text-red-600">
                            Cancelled on: {new Date(selectedEventRequest.cancelled_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

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
                      <span className="font-medium">{selectedEventRequest.time_from || selectedEventRequest.event_time || "Not specified"}</span>
                    </div>
                    {selectedEventRequest.time_to && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time To:</span>
                        <span className="font-medium">{selectedEventRequest.time_to}</span>
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
                    {selectedEventRequest.sponsor_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sponsor:</span>
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

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">
                    {selectedEventRequest?.advisor_name ? "Advisor Information" : "Submitted By"}
                  </h3>
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
                    {getRequesterPhone(selectedEventRequest) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{getRequesterPhone(selectedEventRequest)}</span>
                      </div>
                    )}
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

              {/* Slot Details */}
              {(selectedEventRequest.slot_status_name || selectedEventRequest.slot_date || selectedEventRequest.slot_time_from) && (
                <Card className="p-4 shadow-sm border-slate-200 border-l-4 border-l-blue-500">
                  <h3 className="font-semibold mb-3 text-slate-800 border-b pb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Slot Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    {selectedEventRequest.slot_status_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedEventRequest.slot_status_id === 2 ? "default" : selectedEventRequest.slot_status_id === 3 ? "destructive" : "secondary"}>
                          {selectedEventRequest.slot_status_name}
                        </Badge>
                      </div>
                    )}
                    {selectedEventRequest.slot_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Date:
                        </span>
                        <span className="font-medium text-slate-900">
                          {new Date(selectedEventRequest.slot_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {(selectedEventRequest.slot_time_from || selectedEventRequest.slot_time_to) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Time:
                        </span>
                        <span className="font-medium text-slate-900">
                          {selectedEventRequest.slot_time_from
                            ? formatTimeToAMPM(selectedEventRequest.slot_time_from)
                            : "Not specified"}
                          {selectedEventRequest.slot_time_to && selectedEventRequest.slot_time_from && (
                            <> - {formatTimeToAMPM(selectedEventRequest.slot_time_to)}</>
                          )}
                        </span>
                      </div>
                    )}
                    {(selectedEventRequest.venue_name || selectedEventRequest.venue) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Venue:
                        </span>
                        <span className="font-medium text-slate-900">
                          {selectedEventRequest.venue_name || selectedEventRequest.venue || "Not specified"}
                        </span>
                      </div>
                    )}
                    {selectedEventRequest.slot_status_id === 2 && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                        ✓ Slot has been granted by Protocol Office.
                      </div>
                    )}
                  </div>
                </Card>
              )}

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

              {/* Guest Profiles (with profile documents) */}
              {Array.isArray(selectedEventRequest.event_guests) && selectedEventRequest.event_guests.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Guest Profiles</h3>
                  <div className="space-y-3 text-sm">
                    {selectedEventRequest.event_guests.map((guest: any) => (
                      <div
                        key={guest.guest_id}
                        className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{guest.guest_name || "Guest"}</span>
                          {guest.description && (
                            <span className="text-muted-foreground text-xs">{guest.description}</span>
                          )}
                        </div>
                        {guest.profile_document_path && (
                          <a
                            href={`${import.meta.env.VITE_API_URL}${guest.profile_document_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            View Profile Document
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Guest List Documents */}
              {Array.isArray(selectedEventRequest.guest_lists) && selectedEventRequest.guest_lists.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Guest List Documents</h3>
                  <div className="space-y-2 text-sm">
                    {selectedEventRequest.guest_lists.map((gl: any, idx: number) => (
                      <div
                        key={gl.guest_list_id || idx}
                        className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                      >
                        <span>
                          <span className="font-medium">Guest List</span>
                          {" – "}
                          {gl.file_path?.split("/").pop() || "Document"}
                          {gl.created_at && (
                            <span className="text-muted-foreground text-xs block">Uploaded: {new Date(gl.created_at).toLocaleDateString()}</span>
                          )}
                        </span>
                        <a
                          href={`${import.meta.env.VITE_API_URL}${gl.file_path}`}
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
                      {/* Group all status changes by role (including those without notes) */}
                      {/* Group all status changes by role chronologically (including those without notes) */}
                      {(() => {
                        // Sort items chronologically first
                        const sortedHistory: any[] = [...(selectedEventRequest.status_history || [])]
                          .sort((a: any, b: any) =>
                            new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
                          );

                        // Process history to group Advisor notes under the latest Admin
                        let currentAdminRole = "Advisor";
                        const processedHistory = sortedHistory.map((h: any) => {
                          const role = h.role || h.role_display_name || h.role_name || "";
                          const roleLower = role.toLowerCase();

                          let effectiveRole = role || "Admin";
                          let isAdvisorNote = roleLower === "advisor" || roleLower === "society";

                          let displayNote = h.note ?? h.remarks;
                          if (displayNote && typeof displayNote === 'string') {
                            try {
                              const parsed = JSON.parse(displayNote);
                              displayNote = parsed.note ?? null;
                            } catch (e) {
                              // Not JSON, keep as is
                            }
                          }

                          let displayRoleName = (h.firstName && h.lastName) ? `${h.firstName} ${h.lastName}` : role;

                          // Extract advisor notes that were recorded as system-like messages
                          if (displayNote && displayNote.startsWith("Event request updated. Status set to Pending after revision by")) {
                            isAdvisorNote = true;
                            displayRoleName = "Advisor";

                            // Try to extract just the note part
                            const noteMatch = displayNote.match(/Note:\s*(.*)/i);
                            if (noteMatch && noteMatch[1]) {
                              displayNote = noteMatch[1].trim();
                            }
                          }

                          if (!isAdvisorNote && roleLower !== "system") {
                            currentAdminRole = effectiveRole;
                          }

                          return {
                            ...h,
                            note: displayNote,
                            _displayRoleName: displayRoleName,
                            _effectiveRole: isAdvisorNote ? currentAdminRole : effectiveRole,
                            _roleLower: roleLower,
                            _isAdvisorNote: isAdvisorNote
                          };
                        }).filter((h: any) => {
                          if (h._roleLower === "system" && !h._isAdvisorNote) return false;
                          // Exclude initial submission status
                          if (h.note === "Event request submitted" || h.note === "Event request created") return false;
                          // Exclude empty advisor notes
                          if (h._isAdvisorNote && (!h.note || String(h.note).trim() === "")) return false;
                          return true;
                        });

                        const notesByRole: { [key: string]: any[] } = {};
                        processedHistory.forEach((history: any) => {
                          const role = history._effectiveRole;
                          if (!notesByRole[role]) {
                            notesByRole[role] = [];
                          }
                          notesByRole[role].push(history);
                        });

                        const roleOrder = ["Advisor", "Board Secretary", "Board President", "Registrar", "VC", "Transport Office", "Protocol Office", "Chief Proctor", "Security Office"];
                        const sortedRoles = Object.keys(notesByRole).sort((a, b) => {
                          const aIndex = roleOrder.indexOf(a);
                          const bIndex = roleOrder.indexOf(b);
                          if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                          if (aIndex === -1) return 1;
                          if (bIndex === -1) return -1;
                          return aIndex - bIndex;
                        });

                        if (sortedRoles.length === 0) {
                          return <p className="text-sm text-muted-foreground italic">No status history available.</p>;
                        }

                        return sortedRoles.map((role) => (
                          <div key={role} className="space-y-3">
                            <h4 className="font-semibold text-sm text-university-navy flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-university-navy"></span>
                              {role}
                            </h4>
                            {notesByRole[role].map((history: any, idx: number) => (
                              <div
                                key={history.history_id || idx}
                                className={`border-l-4 ${history.note ? 'border-blue-500' : 'border-slate-300'} pl-4 py-2 ${history.note ? 'bg-blue-50/50' : 'bg-slate-50/30'} rounded-r`}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <div>
                                    <p className="text-xs font-medium text-slate-700">
                                      {history._displayRoleName}
                                      {history.status_name && !history._isAdvisorNote && (
                                        <span className="text-muted-foreground font-normal">
                                          {" "}changed status to <span className="font-medium text-slate-800">{history.status_name}</span>
                                        </span>
                                      )}
                                      {history._isAdvisorNote && (
                                        <span className="text-muted-foreground font-normal">
                                          {" "}added a note
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(history.changed_at).toLocaleString()}
                                  </span>
                                </div>
                                {/* Only show note if it exists and is not empty */}
                                {history.note && history.note.trim() !== "" && (
                                  <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{history.note}</p>
                                )}
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

export default RegistrarDashboard;