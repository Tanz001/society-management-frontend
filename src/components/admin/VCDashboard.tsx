import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileDown,
  Award,
  Crown,
  Edit,
  MapPin,
  Download,
  MoreVertical,
  Lock,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeToAMPM } from "@/lib/utils";
import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    designation?: string;
    department?: string;
    dept?: string;
    phone?: string;
    faculty_id?: string;
    cnic?: string;
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

const VCDashboard = () => {
  const { toast } = useToast();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  // Default to overview (societies) tab
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [eventRequestStats, setEventRequestStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [eventRequestFilter, setEventRequestFilter] = useState<string>("all"); // all, pending, approved, rejected
  const [eventReports, setEventReports] = useState<any[]>([]);
  const [loadingEventReports, setLoadingEventReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportFilter, setReportFilter] = useState<string>("all"); // all, report_submitted, report_missing
  const [reportMissingEvents, setReportMissingEvents] = useState<any[]>([]);
  const [loadingReportMissing, setLoadingReportMissing] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  // Society detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSocietyDetail, setSelectedSocietyDetail] = useState<Society | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [advisorInfo, setAdvisorInfo] = useState<any>(null);
  const [cabinetMembers, setCabinetMembers] = useState<any[]>([]);
  const [loadingCabinet, setLoadingCabinet] = useState(false);

  // Pagination states
  const [societiesCurrentPage, setSocietiesCurrentPage] = useState(1);
  const [eventRequestsCurrentPage, setEventRequestsCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [eventRequestSearch, setEventRequestSearch] = useState("");
  const [societyEvents, setSocietyEvents] = useState<any[]>([]);
  const [loadingSocietyEvents, setLoadingSocietyEvents] = useState(false);

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

  // Fetch societies approved by registrar for VC
  const fetchSocietiesForVC = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/societies-by-role`,
        { role: "vc" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Societies for VC - Full response:", response.data);
      console.log("Societies for VC - Success:", response.data.success);
      console.log("Societies for VC - Count:", response.data.count || response.data.societies?.length || 0);
      console.log("Societies for VC - Data:", response.data.societies);

      if (response.data && response.data.success) {
        let societiesList = response.data.societies || [];
        // Arrange societies alphabetically
        societiesList = societiesList.sort((a: any, b: any) => a.name.localeCompare(b.name));
        console.log("Setting societies:", societiesList.length);
        setSocieties(societiesList);

        if (societiesList.length === 0) {
          console.warn("No societies found with status_id IN (6, 8, 10, 11)");
        }
      } else {
        console.error("API response indicates failure:", response.data);
        setSocieties([]);
        setError(response.data?.message || "Failed to fetch societies");
      }
    } catch (err: any) {
      console.error("Error fetching societies:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch societies";
      setError(errorMessage);
      setSocieties([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/societies/${society.society_id}`, {
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

  // Handle view society details (for detail modal)
  const handleViewDetails = async (society: Society) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch detailed society information with advisor details
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/societies/${society.society_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const societyData = response.data.data;
      setSelectedSocietyDetail(societyData);

      // Fetch advisor details from faculty table if faculty_id exists
      if (societyData.faculty_id) {
        try {
          const advisorResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/admin/faculty`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const advisor = advisorResponse.data.faculty?.find(
            (f: any) => f.faculty_id === societyData.faculty_id
          );
          if (advisor) {
            setAdvisorInfo(advisor);
          }
        } catch (advisorErr) {
          console.error("Error fetching advisor details:", advisorErr);
        }
      }

      // Fetch cabinet members (active and not archived)
      await fetchCabinetMembers(societyData.society_id);

      setIsDetailModalOpen(true);

      // Fetch recent events for this society
      fetchSocietyRecentEvents(societyData.society_id);
    } catch (err: any) {
      console.error("Error fetching society details:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch society details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch cabinet members (active and not archived)
  const fetchCabinetMembers = async (societyId: number) => {
    try {
      setLoadingCabinet(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/society/cabinet/list`,
        {
          society_id: societyId,
          show_archived: false // Only fetch active, non-archived members
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCabinetMembers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching cabinet members:", error);
      setCabinetMembers([]);
    } finally {
      setLoadingCabinet(false);
    }
  };

  // Fetch 3 most recent events for a society (Approved, Report Missing, Report Submitted)
  const fetchSocietyRecentEvents = async (societyId: number) => {
    try {
      setLoadingSocietyEvents(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // We'll fetch all events for the society and filter/slice client-side for now
      // ideally backend should support limit and status filter
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/event-requests`,
        {
          role: "vc",
          society_id: societyId,
          filter: "all_society_events"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        let events = response.data.data || [];
        // Filter for Approved (10), Report Submitted (12), Report Missing (13)
        events = events.filter((e: any) => [10, 12, 13].includes(e.status_id));

        // Sort by date descending (assuming event_date or date_from)
        events.sort((a: any, b: any) => {
          const dateA = new Date(a.date_from || a.event_date).getTime();
          const dateB = new Date(b.date_from || b.event_date).getTime();
          return dateB - dateA;
        });

        // Take top 3
        setSocietyEvents(events.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching society events:", error);
      setSocietyEvents([]);
    } finally {
      setLoadingSocietyEvents(false);
    }
  };

  // Handle approve/reject/revise action
  const handleAction = async (action: 'approve' | 'reject' | 'revise') => {
    if (!selectedSociety) return;

    try {
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
        `${import.meta.env.VITE_API_URL}/admin/vc/societies/${selectedSociety.society_id}/review`,
        {
          action,
          note: reviewNote,
          changed_by: userId
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'requested revision for';
      console.log(`Society ${actionText} successfully:`, response.data);

      // Refresh the societies list
      await fetchSocietiesForVC();

      // Close modal
      setIsModalOpen(false);
      setSelectedSociety(null);
      setReviewNote("");

      // Show success toast
      const message = action === 'approve'
        ? "Society has been officially approved and is now active!"
        : action === 'reject'
          ? "Society application has been rejected."
          : "Revision has been requested for the society application.";
      toast({
        title: "Success",
        description: message,
        variant: "default",
      });

    } catch (err: any) {
      console.error(`Error ${action}ing society:`, err);
      const actionText = action === 'approve' ? 'approve' : action === 'reject' ? 'reject' : 'revise';
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || `Failed to ${actionText} society`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch all statuses
  // Fetch allowed statuses for VC based on current status
  const fetchStatuses = async (currentStatusId: number = 6) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // VC can only set status 8 (Approve) or 9 (Reject) from status 6 (Approved by Registrar)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/allowed-statuses?role=vc&current_status_id=${currentStatusId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatuses(response.data.statuses || []);
    } catch (err: any) {
      console.error("Error fetching statuses:", err);
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

      // Always fetch ALL event requests for the role
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/event-requests`,  // ✅ POST
        {
          role: currentUser?.role || "vc",
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
        pending: allRequests.filter((r: any) => [6, 18].includes(r.status_id)).length,
        approved: allRequests.filter((r: any) => [8, 10, 11, 12, 13].includes(r.status_id)).length,
        rejected: allRequests.filter((r: any) => [9, 14].includes(r.status_id)).length
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
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/event-requests/${reqId}`, {
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
        { role: "vc" },
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

      // VC can approve (8), reject (9), or revise (18) event requests
      let action: 'approve' | 'reject' | 'revise';
      if (selectedEventStatus === 8) {
        action = 'approve';
      } else if (selectedEventStatus === 9) {
        action = 'reject';
      } else if (selectedEventStatus === 18) {
        action = 'revise';
      } else {
        toast({
          title: "Error",
          description: "Invalid status selected. Please select Approve (8), Reject (9), or Revise (18).",
          variant: "destructive",
        });
        setActionLoading(false);
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/vc/event-requests/${selectedEventRequest.req_id}/review`,
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

      // Refresh the event requests list (stats are updated locally within this call)
      await fetchAllEventRequests();
      // await fetchEventRequestStats();

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
    fetchSocietiesForVC();
    fetchStatuses();
  }, []);

  // Fetch data when tab is active or filter changes
  useEffect(() => {
    if (activeTab === "overview") {
      fetchSocietiesForVC();
      setSocietiesCurrentPage(1); // Reset to first page when switching tabs
    } else if (activeTab === "event-requests") {
      fetchAllEventRequests();
      // fetchEventRequestStats();
    } else if (activeTab === "event-reports") {
      fetchAllEventReports();
      fetchReportMissingEvents();
    }
  }, [activeTab, eventRequestFilter]);

  // Fetch all event reports
  const fetchAllEventReports = async () => {
    try {
      setLoadingEventReports(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/event-reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Event reports fetched:", response.data);
      setEventReports(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching event reports:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch event reports");
    } finally {
      setLoadingEventReports(false);
    }
  };

  // Fetch event requests with report missing status (status 13)
  const fetchReportMissingEvents = async () => {
    try {
      setLoadingReportMissing(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/event-requests`,
        {
          role: "vc",
          filter: "all"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Event requests fetched for report missing:", response.data);
      // Filter for status 13 (Report Missing)
      const missingEvents = (response.data.data || []).filter((req: any) => req.status_id === 13);
      setReportMissingEvents(missingEvents);
    } catch (err: any) {
      console.error("Error fetching report missing events:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch report missing events");
    } finally {
      setLoadingReportMissing(false);
    }
  };

  // Handle view report details
  const handleViewReport = async (reportId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/event-reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedReport(response.data.data);
      setIsReportModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching report details:", err);
      setError(err.response?.data?.message || "Failed to fetch report details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (reportId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setPdfLoadingId(reportId);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/event-reports/${reportId}/pdf?download=1`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GCU-Activity-Report-${reportId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Failed to download PDF");
    } finally {
      setPdfLoadingId(null);
    }
  };

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
                <Crown className="h-6 w-6 mr-2" />
                Vice Chancellor Dashboard
              </h1>
              {/* <p className="text-white/80">Final Review - Societies Approved by Registrar</p> */}
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
                <h2 className="text-2xl font-semibold text-university-navy">All Societies</h2>
                <Button
                  variant="outline"
                  onClick={fetchSocietiesForVC}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search societies by name, category, location, advisor, or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSocietiesCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>

              {/* Error Display */}
              {error && (
                <Card className="p-4 border-red-200 bg-red-50 mb-6">
                  <p className="text-red-600">Error: {error}</p>
                </Card>
              )}

              {/* Filtered Societies */}
              {(() => {
                // Filter societies based on search term
                const filteredSocieties = societies.filter((society) => {
                  if (!searchTerm.trim()) return true;
                  const query = searchTerm.toLowerCase();
                  return (
                    society.name?.toLowerCase().includes(query) ||
                    society.category?.toLowerCase().includes(query) ||
                    society.location?.toLowerCase().includes(query) ||
                    society.advisor?.toLowerCase().includes(query) ||
                    society.description?.toLowerCase().includes(query) ||
                    society.status_name?.toLowerCase().includes(query)
                  );
                });

                return (
                  <>
                    {loading && societies.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading societies...</p>
                      </div>
                    ) : filteredSocieties.length > 0 ? (
                      <>
                        {searchTerm && (
                          <div className="mb-4 text-sm text-muted-foreground">
                            Found {filteredSocieties.length} society(ies) matching "{searchTerm}"
                          </div>
                        )}
                        <div className="grid gap-6">
                          {filteredSocieties.slice((societiesCurrentPage - 1) * itemsPerPage, societiesCurrentPage * itemsPerPage).map((society) => (
                            <Card
                              key={society.society_id}
                              className="p-6 shadow-card border-l-4 border-l-university-gold cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => handleViewDetails(society)}
                            >
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
                                      {society.status_id !== 2 && !society.status_name.toLowerCase().includes('approved') && (
                                        <Badge variant="default" className="mr-2 bg-blue-100 text-blue-800">
                                          {society.status_name}
                                        </Badge>
                                      )}
                                      <Badge variant="outline">{society.category}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      📍 {society.location} • 👨‍🏫 {society.advisor}
                                    </p>
                                    {society.student_info && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        📧 {society.student_info.firstName} {society.student_info.lastName} ({society.student_info.rollNo})
                                      </p>
                                    )}
                                    <p className="text-sm text-muted-foreground mb-3">
                                      {society.description.length > 150
                                        ? `${society.description.substring(0, 150)}...`
                                        : society.description
                                      }
                                    </p>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Updated: {new Date(society.updated_at || society.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        {/* Pagination for Societies */}
                        {filteredSocieties.length > itemsPerPage && (
                          <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                              Showing {(societiesCurrentPage - 1) * itemsPerPage + 1} to {Math.min(societiesCurrentPage * itemsPerPage, filteredSocieties.length)} of {filteredSocieties.length} societies
                            </div>
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    onClick={() => setSocietiesCurrentPage(prev => Math.max(1, prev - 1))}
                                    className={societiesCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                  />
                                </PaginationItem>
                                {Array.from({ length: Math.ceil(filteredSocieties.length / itemsPerPage) }, (_, i) => i + 1)
                                  .filter(page => {
                                    return page === 1 ||
                                      page === Math.ceil(filteredSocieties.length / itemsPerPage) ||
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
                                    onClick={() => setSocietiesCurrentPage(prev => Math.min(Math.ceil(filteredSocieties.length / itemsPerPage), prev + 1))}
                                    className={societiesCurrentPage >= Math.ceil(filteredSocieties.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </>
                    ) : (
                      <Card className="p-6 text-center">
                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          {searchTerm ? "No Societies Found" : "No Pending Approvals"}
                        </h3>
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? `No societies found matching "${searchTerm}". Try a different search term.`
                            : "There are no societies waiting for Vice Chancellor approval."}
                        </p>
                        {searchTerm && (
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setSearchTerm("")}
                          >
                            Clear Search
                          </Button>
                        )}
                      </Card>
                    )}
                  </>
                );
              })()}
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
                  <Button
                    variant={eventRequestFilter === "report_missing" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setEventRequestFilter("report_missing")}
                  >
                    Report Missing
                  </Button>
                </div>
              </div>

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
                    if (![6, 18].includes(request.status_id)) return false;
                  } else if (eventRequestFilter === "approved") {
                    if (![8, 10, 11, 12, 13].includes(request.status_id)) return false;
                  } else if (eventRequestFilter === "rejected") {
                    if (![9, 14].includes(request.status_id)) return false;
                  } else if (eventRequestFilter === "report_missing") {
                    if (request.status_id !== 13) return false;
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
                    <div className="grid gap-4">
                      {filteredRequests.slice((eventRequestsCurrentPage - 1) * itemsPerPage, eventRequestsCurrentPage * itemsPerPage).map((request) => (
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
                  <Card className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Event Requests Found</h3>
                    <p className="text-muted-foreground">{eventRequestSearch ? `No event requests match "${eventRequestSearch}"` : "No event requests have been submitted yet."}</p>
                  </Card>
                );
              })()}
            </TabsContent>

            {/* Event Reports Tab */}
            <TabsContent value="event-reports">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-university-navy">Event Reports</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    fetchAllEventReports();
                    fetchReportMissingEvents();
                  }}
                  disabled={loadingEventReports || loadingReportMissing}
                >
                  {(loadingEventReports || loadingReportMissing) ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {/* Filter Options */}
              <div className="flex items-center space-x-4 mb-6">
                <h3 className="text-lg font-medium text-university-navy">Filter:</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={reportFilter === "all" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setReportFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={reportFilter === "report_submitted" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setReportFilter("report_submitted")}
                  >
                    Report Submitted ({eventReports.length})
                  </Button>
                  <Button
                    variant={reportFilter === "report_missing" ? "university" : "outline"}
                    size="sm"
                    onClick={() => setReportFilter("report_missing")}
                  >
                    Report Missing ({reportMissingEvents.length})
                  </Button>
                </div>
              </div>

              {(() => {
                const isLoading = (reportFilter === "all" || reportFilter === "report_submitted") && loadingEventReports && eventReports.length === 0;
                const isLoadingMissing = (reportFilter === "all" || reportFilter === "report_missing") && loadingReportMissing && reportMissingEvents.length === 0;

                if (isLoading || isLoadingMissing) {
                  return (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading event reports...</p>
                    </div>
                  );
                }

                // Filter content based on selected filter
                const showSubmitted = reportFilter === "all" || reportFilter === "report_submitted";
                const showMissing = reportFilter === "all" || reportFilter === "report_missing";

                const hasContent = (showSubmitted && eventReports.length > 0) || (showMissing && reportMissingEvents.length > 0);

                if (!hasContent) {
                  return (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Event Reports Found</h3>
                      <p className="text-muted-foreground">
                        {reportFilter === "report_submitted"
                          ? "No event reports have been submitted yet."
                          : reportFilter === "report_missing"
                            ? "No events are missing reports."
                            : "No event reports or missing reports found."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Report Submitted Section */}
                    {showSubmitted && eventReports.length > 0 && (
                      <div>
                        {reportFilter === "all" && (
                          <h3 className="text-lg font-semibold text-university-navy mb-4">Report Submitted ({eventReports.length})</h3>
                        )}
                        <div className="grid gap-6">
                          {eventReports.map((report) => (
                            <Card key={report.report_id} className="p-6 shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-university-gold">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-3 flex-wrap gap-2">
                                    <h3 className="text-xl font-semibold text-university-navy">{report.report_title}</h3>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Report Submitted
                                    </Badge>
                                  </div>

                                  {report.report_description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                      {report.report_description}
                                    </p>
                                  )}

                                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center text-sm">
                                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-muted-foreground">Event: </span>
                                        <span className="font-medium ml-1">{report.event_title}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-muted-foreground">Society: </span>
                                        <span className="font-medium ml-1">{report.society_name}</span>
                                      </div>
                                      {report.event_date && (
                                        <div className="flex items-center text-sm">
                                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span className="text-muted-foreground">Event Date: </span>
                                          <span className="font-medium ml-1">{new Date(report.event_date).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center text-sm">
                                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-muted-foreground">Submitted by: </span>
                                        <span className="font-medium ml-1">{report.firstName} {report.lastName}</span>
                                      </div>
                                      {report.RollNO && (
                                        <div className="flex items-center text-sm">
                                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span className="text-muted-foreground">Roll No: </span>
                                          <span className="font-medium ml-1">{report.RollNO}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center text-sm">
                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-muted-foreground">Submitted: </span>
                                        <span className="font-medium ml-1">{new Date(report.submitted_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="university"
                                    onClick={() => handleViewReport(report.report_id)}
                                    disabled={loading}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Report
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadPdf(report.report_id)}
                                    disabled={pdfLoadingId === report.report_id}
                                  >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    {pdfLoadingId === report.report_id ? "Loading..." : "Download PDF"}
                                  </Button>
                                  {report.report_file && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(`${import.meta.env.VITE_API_URL}/${report.report_file}`, "_blank")}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      Download File
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Report Missing Section */}
                    {showMissing && reportMissingEvents.length > 0 && (
                      <div>
                        {reportFilter === "all" && (
                          <h3 className="text-lg font-semibold text-university-navy mb-4">Report Missing ({reportMissingEvents.length})</h3>
                        )}
                        <div className="grid gap-6">
                          {reportMissingEvents.map((event: any) => (
                            <Card key={event.req_id} className="p-6 shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-3 flex-wrap gap-2">
                                    <h3 className="text-xl font-semibold text-university-navy">{event.event_name || event.title}</h3>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Report Missing
                                    </Badge>
                                  </div>

                                  {event.description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                      {event.description}
                                    </p>
                                  )}

                                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center text-sm">
                                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span className="text-muted-foreground">Society: </span>
                                        <span className="font-medium ml-1">{event.society_name}</span>
                                      </div>
                                      {event.date_from && (
                                        <div className="flex items-center text-sm">
                                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span className="text-muted-foreground">Event Date: </span>
                                          <span className="font-medium ml-1">{new Date(event.date_from).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                      {event.venue && (
                                        <div className="flex items-center text-sm">
                                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span className="text-muted-foreground">Venue: </span>
                                          <span className="font-medium ml-1">{event.venue}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      {event.event_type && (
                                        <div className="flex items-center text-sm">
                                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span className="text-muted-foreground">Type: </span>
                                          <span className="font-medium ml-1">{event.event_type}</span>
                                        </div>
                                      )}
                                      {event.status_name && (
                                        <div className="flex items-center text-sm">
                                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span className="text-muted-foreground">Status: </span>
                                          <span className="font-medium ml-1">{event.status_name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="university"
                                    onClick={() => handleViewEventRequest(event.req_id)}
                                    disabled={loading}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Event Report Detail Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-university-navy">Event Report Details</DialogTitle>
            <DialogDescription>
              Complete information about the submitted event report
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6 overflow-y-auto h-full">
              {/* Header Section */}
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {selectedReport.event_status}
                      </Badge>
                      {selectedReport.society_name && (
                        <Badge variant="outline" className="text-white border-white">
                          {selectedReport.society_name}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedReport.report_title}</h2>
                    <p className="text-white/90 mb-4">{selectedReport.event_title}</p>
                    <div className="flex items-center flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedReport.event_date ? new Date(selectedReport.event_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {selectedReport.event_time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTimeToAMPM(selectedReport.event_time)}</span>
                        </div>
                      )}
                      {selectedReport.venue && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedReport.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Report Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Report Title:</span>
                      <span className="font-medium">{selectedReport.report_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="font-medium">{new Date(selectedReport.submitted_at).toLocaleString()}</span>
                    </div>
                    {selectedReport.updated_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="font-medium">{new Date(selectedReport.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Submitted By</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedReport.firstName} {selectedReport.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedReport.email}</span>
                    </div>
                    {selectedReport.RollNO && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll No:</span>
                        <span className="font-medium">{selectedReport.RollNO}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Report Description */}
              {selectedReport.report_description && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Report Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedReport.report_description}</p>
                </Card>
              )}

              {/* Event Details */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event Title:</span>
                    <span className="font-medium">{selectedReport.event_title}</span>
                  </div>
                  {selectedReport.event_description && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description:</span>
                      <span className="font-medium">{selectedReport.event_description}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event Date:</span>
                    <span className="font-medium">{selectedReport.event_date ? new Date(selectedReport.event_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {selectedReport.event_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Time:</span>
                      <span className="font-medium">{selectedReport.event_time}</span>
                    </div>
                  )}
                  {selectedReport.venue && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span className="font-medium">{selectedReport.venue}</span>
                    </div>
                  )}
                  {selectedReport.society_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Society:</span>
                      <span className="font-medium">{selectedReport.society_name}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* PDF Report */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-3 text-university-navy">PDF Report</h3>
                <Button
                  variant="university"
                  onClick={() => selectedReport?.report_id && handleDownloadPdf(selectedReport.report_id)}
                  disabled={pdfLoadingId === selectedReport?.report_id}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {pdfLoadingId === selectedReport?.report_id ? "Loading..." : "Download PDF"}
                </Button>
              </Card>

              {selectedReport.report_file && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold mb-3 text-university-navy">Report File</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-university-navy">
                          {selectedReport.report_file.split('/').pop()}
                        </p>
                        <p className="text-xs text-muted-foreground">Click download to view the full report</p>
                      </div>
                    </div>
                    <Button
                      variant="university"
                      onClick={() => {
                        window.open(`${import.meta.env.VITE_API_URL}/${selectedReport.report_file}`, '_blank');
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Society Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Vice Chancellor Review</DialogTitle>
            <DialogDescription>
              Make the decision on this registrar-approved society application
            </DialogDescription>
          </DialogHeader>

          {selectedSociety && (
            <div className="space-y-6 overflow-y-auto h-full">
              {/* Cover Photo */}
              {selectedSociety.cover_photo && (
                <div className="relative h-48 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${selectedSociety.cover_photo}`}
                    alt={selectedSociety.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Hero Section */}
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                    {selectedSociety.society_logo ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${selectedSociety.society_logo}`}
                        alt={selectedSociety.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="h-10 w-10 text-university-navy" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge variant="secondary" className="bg-white/20 text-white mr-2">
                        {selectedSociety.category}
                      </Badge>
                      {selectedSociety.status_id !== 2 && !selectedSociety.status_name.toLowerCase().includes('approved') && (
                        <Badge variant="outline" className="text-white border-white bg-blue-600">
                          {selectedSociety.status_name}
                        </Badge>
                      )}
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

              {/* Application Timeline */}
              <Card className="p-4 bg-green-50 border-green-200">
                <h3 className="font-semibold mb-3 text-university-navy">Approval Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Board Approved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Registrar Approved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-university-gold" />
                    <span className="font-medium">Awaiting Vice Chancellor Approval</span>
                  </div>
                </div>
              </Card>

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
                      <span className="text-muted-foreground">Registrar Approved:</span>
                      <span className="font-medium">{new Date(selectedSociety.updated_at).toLocaleDateString()}</span>
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

              {/* Previous Notes */}
              {selectedSociety.note && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold mb-3 text-university-navy">Previous Review Notes</h3>
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
                    {selectedSociety.achievements.map((achievement: any) => (
                      <div key={achievement.achievement_id} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-university-gold rounded-full mt-2"></div>
                        <span className="text-muted-foreground">{achievement.achievement}</span>
                      </div>
                    ))}

                  </div>
                </Card>
              )}

              {/* Recent Events Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-university-navy flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Recent Events
                  </h3>
                  <Button
                    variant="link"
                    className="text-blue-600 p-0 h-auto font-semibold"
                    onClick={() => {
                      setIsModalOpen(false); // Close modal 
                      navigate(`/admin/society/${selectedSociety.society_id}/events`);
                    }}
                  >
                    View All
                  </Button>
                </div>

                {loadingSocietyEvents ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-university-navy mx-auto"></div>
                    <p className="text-xs text-muted-foreground mt-2">Loading events...</p>
                  </div>
                ) : societyEvents.length > 0 ? (
                  <div className="space-y-3">
                    {societyEvents.map((event: any) => (
                      <div key={event.req_id} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm text-university-navy line-clamp-1">{event.title || event.event_name}</h4>
                          <Badge
                            className={`text-xs px-2 py-0 border-none ${event.status_id === 10 ? "bg-green-100 text-green-800" :
                              event.status_id === 13 ? "bg-red-100 text-red-800" :
                                event.status_id === 12 ? "bg-blue-100 text-blue-800" :
                                  "bg-slate-100 text-slate-800"
                              }`}
                            variant="outline"
                          >
                            {event.status_name}
                          </Badge>
                        </div>
                        <div className="flex text-xs text-muted-foreground gap-3">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(event.date_from || event.event_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.venue || "No venue"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No recent events found</p>
                  </div>
                )}
              </Card>

              {/* VC Review Note */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Vice Chancellor Decision Note (Optional)</h3>
                <Textarea
                  placeholder="Add any notes or comments for this decision..."
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
                  {actionLoading ? "Processing..." : "Rejection"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAction('revise')}
                  disabled={actionLoading}
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Request Revision"}
                </Button>
                <Button
                  variant="university"
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Grant Approval"}
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
                        {selectedEventRequest.advisor_name ||
                          (selectedEventRequest.firstName && selectedEventRequest.lastName
                            ? `${selectedEventRequest.firstName} ${selectedEventRequest.lastName}`
                            : selectedEventRequest.president_name || "Not available")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">
                        {selectedEventRequest.advisor_email ||
                          selectedEventRequest.president_email ||
                          selectedEventRequest.email ||
                          "Not provided"}
                      </span>
                    </div>
                    {selectedEventRequest.advisor_phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{selectedEventRequest.advisor_phone}</span>
                      </div>
                    )}
                    {(selectedEventRequest.rollNo || selectedEventRequest.RollNO) && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll No:</span>
                        <span className="font-medium">{selectedEventRequest.rollNo || selectedEventRequest.RollNO}</span>
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
                          // Exclude advisor notes with no content or generic update messages
                          if (h._isAdvisorNote) {
                            const n = String(h.note || "").trim();
                            if (!n) return false;
                            if (/^Event request updated and resubmitted\.?$/i.test(n)) return false;
                            if (/^Event request updated\.\s*Status remains .+\.?$/i.test(n)) return false;
                            if (/^Event request updated\.\s*Status set to .+ after revision by .+\.?$/i.test(n)) return false;
                          }
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

      {/* Society Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Society Details</DialogTitle>
            <DialogDescription>
              Complete information about the society
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy"></div>
            </div>
          ) : selectedSocietyDetail ? (
            <div className="space-y-6">
              {/* Header Section with Cover Photo - At the very top */}
              {(selectedSocietyDetail.cover_photo || selectedSocietyDetail.cover_image_path) && (
                <div className="relative h-48 rounded-lg overflow-hidden -mt-2">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${selectedSocietyDetail.cover_photo || selectedSocietyDetail.cover_image_path}`}
                    alt={selectedSocietyDetail.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Society Basic Info */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {(selectedSocietyDetail.society_logo || selectedSocietyDetail.logo_path) && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${selectedSocietyDetail.society_logo || selectedSocietyDetail.logo_path}`}
                      alt={selectedSocietyDetail.name}
                      className="w-24 h-24 rounded-lg object-cover border-2 border-university-gold shadow-md flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-university-navy">{selectedSocietyDetail.name}</h2>
                      {/* Hide status badge if it contains 'Approved' */}
                      {selectedSocietyDetail.status_name &&
                        !selectedSocietyDetail.status_name.toLowerCase().includes('approved') && (
                          <Badge variant="secondary">{selectedSocietyDetail.status_name}</Badge>
                        )}
                      <Badge variant="outline">{selectedSocietyDetail.category}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {selectedSocietyDetail.location}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Created: {new Date(selectedSocietyDetail.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card className="p-6">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">{selectedSocietyDetail.description}</p>
              </Card>

              {/* Purpose */}
              <Card className="p-6">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Purpose
                </h3>
                <p className="text-muted-foreground leading-relaxed">{selectedSocietyDetail.purpose}</p>
              </Card>

              {/* Advisor Information */}
              {(selectedSocietyDetail.advisor_info || advisorInfo || selectedSocietyDetail.advisor) && (
                <Card className="p-6 border-l-4 border-l-blue-500">
                  <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Advisor Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          {(selectedSocietyDetail.advisor_info as any)?.name ||
                            ((selectedSocietyDetail.advisor_info as any)?.firstName ? `${(selectedSocietyDetail.advisor_info as any).firstName} ${(selectedSocietyDetail.advisor_info as any).lastName}` : "") ||
                            advisorInfo?.name ||
                            selectedSocietyDetail.advisor || "N/A"}
                        </span>
                      </div>
                      {(selectedSocietyDetail.advisor_info?.email || advisorInfo?.email) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">
                            {selectedSocietyDetail.advisor_info?.email || advisorInfo?.email}
                          </span>
                        </div>
                      )}
                      {(selectedSocietyDetail.advisor_info?.phone || advisorInfo?.phone) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">
                            {selectedSocietyDetail.advisor_info?.phone || advisorInfo?.phone}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {((selectedSocietyDetail.advisor_info as any)?.faculty_id || advisorInfo?.faculty_id) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Faculty ID:</span>
                          <span className="font-medium">
                            {(selectedSocietyDetail.advisor_info as any)?.faculty_id || advisorInfo?.faculty_id}
                          </span>
                        </div>
                      )}
                      {((selectedSocietyDetail.advisor_info as any)?.dept || (selectedSocietyDetail.advisor_info as any)?.department || advisorInfo?.dept) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium">
                            {(selectedSocietyDetail.advisor_info as any)?.dept || (selectedSocietyDetail.advisor_info as any)?.department || advisorInfo?.dept}
                          </span>
                        </div>
                      )}
                      {((selectedSocietyDetail.advisor_info as any)?.cnic || advisorInfo?.cnic) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CNIC:</span>
                          <span className="font-medium">
                            {(selectedSocietyDetail.advisor_info as any)?.cnic || advisorInfo?.cnic}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Student Information */}
              {selectedSocietyDetail.student_info && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-3 text-university-navy">Submitted By (Student)</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedSocietyDetail.student_info.firstName} {selectedSocietyDetail.student_info.lastName}
                      </span>
                    </div>
                    {selectedSocietyDetail.student_info.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedSocietyDetail.student_info.email}</span>
                      </div>
                    )}
                    {selectedSocietyDetail.student_info.rollNo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll Number:</span>
                        <span className="font-medium">{selectedSocietyDetail.student_info.rollNo}</span>
                      </div>
                    )}
                    {selectedSocietyDetail.student_info.university && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">University:</span>
                        <span className="font-medium">{selectedSocietyDetail.student_info.university}</span>
                      </div>
                    )}
                    {selectedSocietyDetail.student_info.major && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Major:</span>
                        <span className="font-medium">{selectedSocietyDetail.student_info.major}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Cabinet Members */}
              <Card className="p-6">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Cabinet Members
                </h3>
                {loadingCabinet ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-university-navy"></div>
                  </div>
                ) : cabinetMembers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cabinetMembers.map((member) => (
                      <Card key={member.id} className="p-4 shadow-sm">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-university-navy/10">
                            <Crown className="h-5 w-5 text-university-navy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-university-navy truncate">{member.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{member.designation}</p>
                            {member.tenure_start && member.tenure_end && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Tenure: {member.tenure_start} - {member.tenure_end}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Crown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No active cabinet members found</p>
                  </div>
                )}
              </Card>

              {/* Achievements */}
              {selectedSocietyDetail.achievements && Array.isArray(selectedSocietyDetail.achievements) && selectedSocietyDetail.achievements.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Achievements
                  </h3>
                  <div className="space-y-2">
                    {selectedSocietyDetail.achievements.map((achievement: any, index: number) => (
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

              {/* Recent Events Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-university-navy flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Recent Events
                  </h3>
                  {societyEvents.length > 0 && (
                    <Button
                      variant="link"
                      className="text-blue-600 p-0 h-auto font-semibold"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        navigate(`/admin/society/${selectedSocietyDetail.society_id}/events`);
                      }}
                    >
                      View All
                    </Button>
                  )}
                </div>

                {loadingSocietyEvents ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-university-navy mx-auto"></div>
                    <p className="text-xs text-muted-foreground mt-2">Loading events...</p>
                  </div>
                ) : societyEvents.length > 0 ? (
                  <div className="space-y-3">
                    {societyEvents.map((event: any) => (
                      <div
                        key={event.req_id || event.id}
                        className="border rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleViewEventRequest(event.req_id || event.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm text-university-navy line-clamp-1">{event.title || event.event_name}</h4>
                          <Badge
                            className={`text-xs px-2 py-0 border-none ${event.status_id === 10 ? "bg-green-100 text-green-800" :
                              event.status_id === 13 ? "bg-red-100 text-red-800" :
                                event.status_id === 12 ? "bg-blue-100 text-blue-800" :
                                  "bg-slate-100 text-slate-800"
                              }`}
                            variant="outline"
                          >
                            {event.status_name}
                          </Badge>
                        </div>
                        <div className="flex text-xs text-muted-foreground gap-3">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(event.date_from || event.event_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.venue || "No venue"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No recent events found</p>
                  </div>
                )}
              </Card>

              {/* Status History - Filter out 'Approved' statuses */}
              {selectedSocietyDetail.status_history && Array.isArray(selectedSocietyDetail.status_history) &&
                selectedSocietyDetail.status_history.filter((h: any) =>
                  h.status_name && !h.status_name.toLowerCase().includes('approved')
                ).length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Status History
                    </h3>
                    <div className="space-y-3">
                      {selectedSocietyDetail.status_history
                        .filter((history: any) =>
                          history.status_name && !history.status_name.toLowerCase().includes('approved')
                        )
                        .map((history: any, index: number) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{history.status_name || "Status Change"}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(history.changed_at).toLocaleString()}
                              </span>
                            </div>
                            {/* Only show note if it exists and is not empty */}
                            {history.note && history.note.trim() !== "" && (
                              <p className="text-sm text-muted-foreground mt-1">{history.note}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </Card>
                )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No society details available</p>
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

export default VCDashboard;


