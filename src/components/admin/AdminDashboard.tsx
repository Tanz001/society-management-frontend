import React, { useState, useEffect } from "react";
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
  LogOut,
  Trash2,
  UserPlus,
  ShieldCheck,
  FileText,
  Edit,
  Clock,
  MoreVertical,
  Lock,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatTimeToAMPM } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";
import EventRequestDetailModal from "@/components/admin/EventRequestDetailModal";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSocietyDetailModalOpen, setIsSocietyDetailModalOpen] = useState(false);
  const [selectedSocietyForDetail, setSelectedSocietyForDetail] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [advisorInfo, setAdvisorInfo] = useState<any>(null);
  const [allSocieties, setAllSocieties] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allEventRequests, setAllEventRequests] = useState([]);
  const [allEventReports, setAllEventReports] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [eventRequestsLoading, setEventRequestsLoading] = useState(false);
  const [eventReportsLoading, setEventReportsLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEventRequest, setSelectedEventRequest] = useState<any>(null);
  const [isEventRequestDetailModalOpen, setIsEventRequestDetailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loadingEventRequestDetails, setLoadingEventRequestDetails] = useState(false);
  const [societyFilter, setSocietyFilter] = useState("all"); // all, active, pending, rejected
  const [eventRequestFilter, setEventRequestFilter] = useState<string>("all"); // all, pending, approved, rejected
  const [societySearchTerm, setSocietySearchTerm] = useState(""); // Search term for societies
  const [eventRequestStats, setEventRequestStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [eventRequestsCurrentPage, setEventRequestsCurrentPage] = useState(1);
  const [societiesCurrentPage, setSocietiesCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAdvisorDialogOpen, setIsAdvisorDialogOpen] = useState(false);
  const [advisorData, setAdvisorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    rollNo: "",
    university: "",
    major: "",
    degree: "",
    semester: "",
    password: "",
    confirmPassword: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: () => { },
    variant: "default" as "default" | "destructive"
  });
  const [societyToDelete, setSocietyToDelete] = useState<number | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  // Calculate stats from actual data
  const stats = {
    totalSocieties: allSocieties.length,
    totalEventRequests: allEventRequests.length,
    totalUsers: allStudents.length + allFaculty.length,
    activeSocieties: allSocieties.filter(society =>
      society.status_name === 'Approved by VC' || society.status === 'active'
    ).length,
    pendingSocieties: allSocieties.filter(society =>
      society.status_id === 1 || society.status === 'pending' || society.status === 'under_review'
    ).length,
    suspendedSocieties: allSocieties.filter(society =>
      society.status === 'suspended' || society.status_name?.includes('Rejected')
    ).length,
    activeUsers: allStudents.length + allFaculty.filter((f: any) => f.is_active === 1).length,
    totalPosts: 0, // This would need to come from a separate API call
    flaggedPosts: 0, // This would need to come from a separate API call
    totalEvents: allEvents.length || allSocieties.reduce((total, society) => total + (society.events?.length || 0), 0),
    upcomingEvents: allEvents.length > 0
      ? allEvents.filter((event: any) => event.event_date && new Date(event.event_date) > new Date()).length
      : allSocieties.reduce((total, society) => {
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

  // Filter societies based on selected filter and search term
  const filteredSocieties = allSocieties.filter(society => {
    // Apply status filter
    let matchesFilter = true;
    if (societyFilter === "all") matchesFilter = true;
    else if (societyFilter === "active") matchesFilter = society.status_name === 'Approved by VC' || society.status === 'active';
    else if (societyFilter === "pending") matchesFilter = society.status_id === 1 || society.status === 'pending' || society.status === 'under_review';
    else if (societyFilter === "rejected") matchesFilter = society.status_name?.includes('Rejected') || society.status === 'rejected';
    
    // Apply search filter
    if (!matchesFilter) return false;
    if (!societySearchTerm.trim()) return true;
    
    const query = societySearchTerm.toLowerCase();
    return (
      society.name?.toLowerCase().includes(query) ||
      society.category?.toLowerCase().includes(query) ||
      society.location?.toLowerCase().includes(query) ||
      society.advisor?.toLowerCase().includes(query) ||
      society.description?.toLowerCase().includes(query) ||
      society.status_name?.toLowerCase().includes(query)
    );
  });

  // Paginated societies (fallback to filteredSocieties if pagination not needed)
  // This prevents "paginatedSocieties is not defined" errors
  const paginatedSocieties = filteredSocieties;

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
      const API_URL = import.meta.env.VITE_API_URL;


      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/admin/societies/${societyId}/approve`,
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

      toast({
        title: "Success",
        description: "Society approved successfully!",
      });

    } catch (err: any) {
      console.error("Error approving society:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to approve society",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (societyId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      console.log("Rejecting society:", societyId);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${API_URL}/admin/societies/${societyId}/reject`,
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

      toast({
        title: "Success",
        description: "Society rejected successfully!",
      });

    } catch (err: any) {
      console.error("Error rejecting society:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to reject society",
        variant: "destructive",
      });
    }
  };

  // Handle view details - same as BoardSecretaryDashboard
  const handleViewDetails = async (society: any) => {
    try {
      console.log("handleViewDetails called for society:", society);
      setLoadingDetails(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Fetch detailed society information with advisor details
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/societies/${society.society_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Society details fetched:", response.data);
      const societyData = response.data.data;
      setSelectedSocietyForDetail(societyData);

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
          } else {
            setAdvisorInfo(null);
          }
        } catch (err) {
          console.error("Error fetching advisor details:", err);
          setAdvisorInfo(null);
        }
      } else {
        setAdvisorInfo(null);
      }

      console.log("Opening modal with society data:", societyData);
      setIsSocietyDetailModalOpen(true);
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

  // Function to get all societies
  const getAllSocieties = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/admin/societies`, {
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

  // Function to delete a society
  const handleDeleteSociety = (societyId: number) => {
    setSocietyToDelete(societyId);
    setConfirmDialog({
      open: true,
      title: "Delete Society",
      description: "Are you sure you want to delete this society? This action cannot be undone.",
      onConfirm: async () => {
        await performDeleteSociety(societyId);
      },
      variant: "destructive"
    });
  };

  const performDeleteSociety = async (societyId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.delete(
        `${API_URL}/admin/societies/${societyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Society deleted successfully:", response.data);

      // Refresh the societies list
      await getAllSocieties();

      toast({
        title: "Success",
        description: "Society deleted successfully!",
      });

    } catch (err: any) {
      console.error("Error deleting society:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to delete society",
        variant: "destructive",
      });
    } finally {
      setSocietyToDelete(null);
    }
  };

  // Function to get all events
  const getAllEvents = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setEventsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/admin/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("All events fetched:", response.data);
      setAllEvents(response.data.events || []);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch events");
    } finally {
      setEventsLoading(false);
    }
  };

  // Function to get all students
  const getAllStudents = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setStudentsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/admin/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("All students fetched:", response.data);
      setAllStudents(response.data.students || []);
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch students");
    } finally {
      setStudentsLoading(false);
    }
  };

  // Function to get all event requests
  const getAllEventRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setEventRequestsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${API_URL}/admin/event-requests`,
        { role: "super_admin", filter: "all" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("All event requests fetched:", response.data);
      const requests = response.data.data || [];
      setAllEventRequests(requests);

      // Calculate stats
      const stats = {
        total: requests.length,
        pending: requests.filter((r: any) => r.status_id === 1).length,
        approved: requests.filter((r: any) => [2, 4, 6, 8, 11, 13, 15].includes(r.status_id)).length,
        rejected: requests.filter((r: any) => r.status_id === 3 || r.status_name?.includes('Rejected')).length
      };
      setEventRequestStats(stats);
    } catch (err: any) {
      console.error("Error fetching event requests:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch event requests");
    } finally {
      setEventRequestsLoading(false);
    }
  };

  // Function to get all event reports
  const getAllEventReports = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setEventReportsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/admin/event-reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("All event reports fetched:", response.data);
      setAllEventReports(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching event reports:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch event reports");
    } finally {
      setEventReportsLoading(false);
    }
  };

  // Function to get all faculty
  const getAllFaculty = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setFacultyLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/admin/faculty`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("All faculty fetched:", response.data);
      setAllFaculty(response.data.faculty || []);
    } catch (err: any) {
      console.error("Error fetching faculty:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch faculty");
    } finally {
      setFacultyLoading(false);
    }
  };

  // Function to fetch complete event request details
  const handleViewEventRequestDetails = async (eventRequestId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoadingEventRequestDetails(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${API_URL}/admin/event-requests/${eventRequestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSelectedEventRequest(response.data.data);
        setIsEventRequestDetailModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch event request details",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error fetching event request details:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to fetch event request details",
        variant: "destructive",
      });
    } finally {
      setLoadingEventRequestDetails(false);
    }
  };

  // Function to toggle faculty status
  const handleToggleFacultyStatus = async (facultyId: number, currentStatus: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const newStatus = currentStatus === 1 ? 0 : 1;

      const response = await axios.put(
        `${API_URL}/admin/faculty/${facultyId}/status`,
        { is_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: `Faculty member ${newStatus === 1 ? 'activated' : 'deactivated'} successfully!`,
      });

      // Refresh faculty list
      await getAllFaculty();
    } catch (err: any) {
      console.error("Error toggling faculty status:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to update faculty status",
        variant: "destructive",
      });
    }
  };

  // Function to delete a student
  const handleDeleteStudent = (studentId: number) => {
    setStudentToDelete(studentId);
    setConfirmDialog({
      open: true,
      title: "Delete Student",
      description: "Are you sure you want to delete this student? This action cannot be undone and will also delete all their societies.",
      onConfirm: async () => {
        await performDeleteStudent(studentId);
      },
      variant: "destructive"
    });
  };

  const performDeleteStudent = async (studentId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.delete(
        `${API_URL}/admin/students/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Student deleted successfully:", response.data);

      // Refresh the students list
      await getAllStudents();
      // Also refresh societies as some may have been deleted
      await getAllSocieties();

      toast({
        title: "Success",
        description: "Student deleted successfully!",
      });

    } catch (err: any) {
      console.error("Error deleting student:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setStudentToDelete(null);
    }
  };

  // Function to create advisor
  const handleCreateAdvisor = async () => {
    setError("");

    // Password confirmation check
    if (advisorData.password !== advisorData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload = { ...advisorData };
      delete payload.confirmPassword;

      const response = await axios.post(
        `${API_URL}/admin/create-advisor`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Advisor created successfully:", response.data);

      // Reset form
      setAdvisorData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        rollNo: "",
        university: "",
        major: "",
        degree: "",
        semester: "",
        password: "",
        confirmPassword: "",
      });

      setIsAdvisorDialogOpen(false);

      // Refresh students list
      await getAllStudents();

      toast({
        title: "Success",
        description: "Advisor account created successfully!",
      });

    } catch (err: any) {
      console.error("Error creating advisor:", err);
      setError(err.response?.data?.message || err.message || "Failed to create advisor account");
    }
  };

  // Load societies on component mount
  useEffect(() => {
    getAllSocieties();
    getAllEventRequests();
    getAllEventReports();
    getAllFaculty();
  }, []);

  // Load events when events tab is selected
  useEffect(() => {
    if (activeTab === "events") {
      getAllEvents();
    }
  }, [activeTab]);

  // Load students when users tab is selected
  useEffect(() => {
    if (activeTab === "users") {
      getAllStudents();
    }
  }, [activeTab]);

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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="societies">Societies</TabsTrigger>
              <TabsTrigger value="event-requests">Event Requests</TabsTrigger>
              <TabsTrigger value="event-reports">Event Reports</TabsTrigger>
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
              {/* <TabsTrigger value="events">Events</TabsTrigger> */}
              {/* <TabsTrigger value="users">Users</TabsTrigger> */}
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
                  {/* <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{stats.monthlyGrowth}% this month</span>
                  </div> */}
                </Card>

                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Event Requests</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.totalEventRequests}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-university-gold" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">All event requests</p>
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

                {/* <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Reviews</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.pendingSocieties}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-university-maroon" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Societies awaiting approval</p>
                </Card> */}

                {/* <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Flagged Content</p>
                      <p className="text-2xl font-bold text-university-navy">{stats.flaggedPosts}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-university-maroon" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Requiring attention</p>
                </Card> */}
              </div>

              {/* Role Access Quick Link */}
              <Card className="p-6 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-university-navy flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-university-gold" />
                    Role Based Access
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assign system roles and advisor responsibilities for faculty members.
                  </p>
                </div>
                <Button variant="university" asChild>
                  <Link to="/dashboard/admin/role-access">
                    Manage Access
                  </Link>
                </Button>
              </Card>


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
                  <Button
                    variant="university"
                    onClick={() => navigate("/society/register", { state: { returnTo: "/dashboard/admin" } })}
                  >
                    Create Society
                  </Button>
                </div>
              </div>

              {/* Filter Options */}
              <div className="flex items-center space-x-4 mb-6">
                <h3 className="text-lg font-medium text-university-navy">Filter by Status:</h3>
                <div className="flex space-x-2">
                  <Button
                    variant={societyFilter === "all" ? "university" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSocietyFilter("all");
                      setSocietiesCurrentPage(1);
                    }}
                  >
                    All ({allSocieties.length})
                  </Button>
                  <Button
                    variant={societyFilter === "active" ? "university" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSocietyFilter("active");
                      setSocietiesCurrentPage(1);
                    }}
                  >
                    Active ({allSocieties.filter(s => s.status_name === 'Approved by VC' || s.status === 'active').length})
                  </Button>
                  <Button
                    variant={societyFilter === "pending" ? "university" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSocietyFilter("pending");
                      setSocietiesCurrentPage(1);
                    }}
                  >
                    Pending ({allSocieties.filter(s => s.status_id === 1 || s.status === 'pending' || s.status === 'under_review').length})
                  </Button>
                  <Button
                    variant={societyFilter === "rejected" ? "university" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSocietyFilter("rejected");
                      setSocietiesCurrentPage(1);
                    }}
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
                    {filteredSocieties
                      .slice((societiesCurrentPage - 1) * itemsPerPage, societiesCurrentPage * itemsPerPage)
                      .map((society) => (
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
                            <div className="flex items-center ml-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={loading}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(society)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteSociety(society.society_id)}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>

                  {/* Pagination for Societies */}
                  {filteredSocieties.length > itemsPerPage && (
                    <div className="mt-6">
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
                              const totalPages = Math.ceil(filteredSocieties.length / itemsPerPage);
                              return page === 1 ||
                                page === totalPages ||
                                (page >= societiesCurrentPage - 1 && page <= societiesCurrentPage + 1);
                            })
                            .map((page, index, array) => {
                              const totalPages = Math.ceil(filteredSocieties.length / itemsPerPage);
                              const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                              const showEllipsisAfter = index < array.length - 1 && array[index + 1] - page > 1;

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
                                  {showEllipsisAfter && (
                                    <PaginationItem>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  )}
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
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">All Societies</h2>
                <Button
                  variant="outline"
                  onClick={getAllEvents}
                  disabled={eventsLoading}
                >
                  {eventsLoading ? "Loading..." : "Refresh"}
                </Button>
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
                    All Societies ({filteredSocieties.length})
                  </h3>
                  <div className="grid gap-6">
                    {filteredSocieties
                      .slice((societiesCurrentPage - 1) * itemsPerPage, societiesCurrentPage * itemsPerPage)
                      .map((society: any) => (
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
                            <div className="flex items-center ml-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={loading}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(society)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteSociety(society.society_id)}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>

                  {/* Pagination for Societies */}
                  {filteredSocieties.length > itemsPerPage && (
                    <div className="mt-6">
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
                              const totalPages = Math.ceil(filteredSocieties.length / itemsPerPage);
                              return page === 1 ||
                                page === totalPages ||
                                (page >= societiesCurrentPage - 1 && page <= societiesCurrentPage + 1);
                            })
                            .map((page, index, array) => {
                              const totalPages = Math.ceil(filteredSocieties.length / itemsPerPage);
                              const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                              const showEllipsisAfter = index < array.length - 1 && array[index + 1] - page > 1;

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
                                  {showEllipsisAfter && (
                                    <PaginationItem>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  )}
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
                </div>
              )}

              {/* Loading State */}
              {loading && filteredSocieties.length === 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading societies...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredSocieties.length === 0 && !error && (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Societies Found</h3>
                  <p className="text-muted-foreground">No societies have been created yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="event-requests" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-university-navy">Event Requests</h2>
                <Button
                  variant="outline"
                  onClick={getAllEventRequests}
                  disabled={eventRequestsLoading}
                >
                  {eventRequestsLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {/* Stats Overview - Event Requests */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold text-university-navy">
                        {eventRequestStats.total}
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
                        {eventRequestStats.pending}
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
                        {eventRequestStats.approved}
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
                        {eventRequestStats.rejected}
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
                    getAllEventRequests();
                  }}
                >
                  All
                </Button>
                <Button
                  variant={eventRequestFilter === "pending" ? "university" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventRequestFilter("pending");
                    getAllEventRequests();
                  }}
                >
                  Pending
                </Button>
                <Button
                  variant={eventRequestFilter === "approved" ? "university" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventRequestFilter("approved");
                    getAllEventRequests();
                  }}
                >
                  Approved
                </Button>
                <Button
                  variant={eventRequestFilter === "rejected" ? "university" : "outline"}
                  size="sm"
                  onClick={() => {
                    setEventRequestFilter("rejected");
                    getAllEventRequests();
                  }}
                >
                  Rejected
                </Button>
              </div>

              {eventRequestsLoading && allEventRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading event requests...</p>
                </div>
              ) : allEventRequests.length > 0 ? (
                <>
                  {/* Filter event requests based on filter */}
                  {(() => {
                    const filteredRequests = allEventRequests.filter((request: any) => {
                      if (eventRequestFilter === "all") return true;
                      if (eventRequestFilter === "pending") return request.status_id === 1;
                      if (eventRequestFilter === "approved") return [2, 4, 6, 8, 11, 13, 15].includes(request.status_id);
                      if (eventRequestFilter === "rejected") return request.status_id === 3 || request.status_name?.includes('Rejected');
                      return true;
                    });

                    return filteredRequests.length > 0 ? (
                      <>
                        <div className="grid gap-4">
                          {filteredRequests.slice((eventRequestsCurrentPage - 1) * itemsPerPage, eventRequestsCurrentPage * itemsPerPage).map((request: any) => (
                            <Card key={request.req_id} className="p-4 shadow-card">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2 flex-wrap gap-2">
                                    <h3 className="text-lg font-semibold text-university-navy">{request.title || request.event_name}</h3>
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
                                    {request.description || request.media_coverage}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                                    <span>📅 {request.event_date ? new Date(request.event_date).toLocaleDateString() : "Date TBD"}</span>
                                    <span>🕐 {request.event_time ? formatTimeToAMPM(request.event_time) : request.time_from ? formatTimeToAMPM(request.time_from) : "N/A"}</span>
                                    <span>📍 {request.venue || "Not specified"}</span>
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
                                    onClick={() => handleViewEventRequestDetails(request.req_id)}
                                    disabled={loadingEventRequestDetails}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Details
                                  </Button>
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
                        <p className="text-muted-foreground">No {eventRequestFilter} event requests found.</p>
                      </Card>
                    );
                  })()}
                </>
              ) : (
                <Card className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Event Requests Found</h3>
                  <p className="text-muted-foreground">No event requests have been submitted yet.</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="event-reports" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">All Event Reports</h2>
                <Button variant="outline" size="sm" onClick={getAllEventReports} disabled={eventReportsLoading}>
                  {eventReportsLoading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>

              {eventReportsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading event reports...</p>
                </div>
              ) : allEventReports.length === 0 ? (
                <Card className="p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Event Reports Found</h3>
                  <p className="text-muted-foreground">No event reports have been submitted yet.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {allEventReports.map((report: any) => (
                    <Card key={report.report_id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-university-navy mb-2">{report.report_title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{report.report_description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>📅 Event: {report.event_title}</span>
                            <span>🏛️ {report.society_name}</span>
                            <span>👤 {report.firstName} {report.lastName}</span>
                            <span>📆 Submitted: {new Date(report.submitted_at).toLocaleDateString()}</span>
                          </div>
                          {report.report_file && (
                            <div className="mt-2">
                              <a
                                href={`${import.meta.env.VITE_API_URL}/${report.report_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-university-navy hover:underline"
                              >
                                📄 View Report File
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="faculty" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">Faculty Management</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={getAllFaculty} disabled={facultyLoading}>
                    {facultyLoading ? "Refreshing..." : "Refresh"}
                  </Button>
                  <Button variant="university" size="sm" onClick={() => navigate("/dashboard/admin/add-faculty")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Faculty
                  </Button>
                </div>
              </div>

              {facultyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading faculty...</p>
                </div>
              ) : allFaculty.length === 0 ? (
                <Card className="p-6 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Faculty Members Found</h3>
                  <p className="text-muted-foreground">No faculty members have been added yet.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {allFaculty.map((faculty: any) => (
                    <Card key={faculty.faculty_id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-university-navy">{faculty.name}</h3>
                            <Badge variant={faculty.is_active === 1 ? "default" : "secondary"}>
                              {faculty.is_active === 1 ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>📧 {faculty.email}</span>
                            {faculty.phone && <span>📞 {faculty.phone}</span>}
                            {faculty.cnic && <span>🆔 CNIC: {faculty.cnic}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(faculty.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant={faculty.is_active === 1 ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleFacultyStatus(faculty.faculty_id, faculty.is_active)}
                          >
                            {faculty.is_active === 1 ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/admin/role-access?faculty_id=${faculty.faculty_id}`)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Roles
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">All Societies</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={getAllSocieties}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                  <Button
                    variant="university"
                    onClick={() => navigate("/society/register", { state: { returnTo: "/dashboard/admin" } })}
                  >
                    Create Society
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <p className="text-red-600">Error: {error}</p>
                </Card>
              )}

              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search societies by name, category, location, advisor, or description..."
                  value={societySearchTerm}
                  onChange={(e) => {
                    setSocietySearchTerm(e.target.value);
                    setSocietiesCurrentPage(1); // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>

              {/* Societies List */}
              {filteredSocieties.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-university-navy">
                      All Societies ({filteredSocieties.length})
                    </h3>
                    {societySearchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSocietySearchTerm("");
                          setSocietiesCurrentPage(1);
                        }}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                  {societySearchTerm && (
                    <div className="text-sm text-muted-foreground">
                      Found {filteredSocieties.length} society(ies) matching "{societySearchTerm}"
                    </div>
                  )}
                  <div className="grid gap-4">
                    {filteredSocieties.map((society: any) => (
                      <Card key={society.society_id} className="p-4 shadow-card hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-university-navy">{society.name}</h4>
                              <Badge variant={society.status_name === 'Approved by VC' ? "default" : society.status_id === 1 ? "secondary" : "destructive"}>
                                {society.status_name || 'Pending'}
                              </Badge>
                              <Badge variant="outline">{society.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{society.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{society.location || 'N/A'}</span>
                              </div>
                              {society.advisor && (
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>Advisor: {society.advisor}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(society)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {societySearchTerm || societyFilter !== "all" ? "No Societies Found" : "No Societies Available"}
                  </h3>
                  <p className="text-muted-foreground">
                    {societySearchTerm
                      ? `No societies found matching "${societySearchTerm}". Try a different search term.`
                      : societyFilter !== "all"
                      ? `No societies found with the selected filter.`
                      : "No societies have been registered yet."}
                  </p>
                  {(societySearchTerm || societyFilter !== "all") && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSocietySearchTerm("");
                        setSocietyFilter("all");
                        setSocietiesCurrentPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Card>
              )}

              {/* Loading State */}
              {studentsLoading && allStudents.length === 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              )}

              {/* Empty State */}
              {!studentsLoading && allStudents.length === 0 && !error && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                  <p className="text-muted-foreground">No students have been registered yet.</p>
                </div>
              )}
            </TabsContent>

            {/* Reports tab commented out for now */}
            {/* <TabsContent value="reports">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Analytics & Reports</h3>
                <p className="text-muted-foreground mb-4">Platform usage statistics and growth reports</p>
                <Button variant="university">Generate Reports</Button>
              </div>
            </TabsContent> */}
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

      {/* Society Detail Modal - Same as BoardSecretaryDashboard */}
      <Dialog open={isSocietyDetailModalOpen} onOpenChange={setIsSocietyDetailModalOpen}>
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
          ) : selectedSocietyForDetail ? (
            <div className="space-y-6">
              {/* Header Section with Cover Photo */}
              {selectedSocietyForDetail.cover_image_path && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${selectedSocietyForDetail.cover_image_path}`}
                    alt={selectedSocietyForDetail.name}
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
                  {selectedSocietyForDetail.logo_path && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${selectedSocietyForDetail.logo_path}`}
                      alt={selectedSocietyForDetail.name}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-university-gold"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-university-navy">{selectedSocietyForDetail.name}</h2>
                      <Badge variant="secondary">{selectedSocietyForDetail.status_name}</Badge>
                      <Badge variant="outline">{selectedSocietyForDetail.category}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {selectedSocietyForDetail.location}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Created: {new Date(selectedSocietyForDetail.created_at || '').toLocaleDateString()}
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
                <p className="text-muted-foreground leading-relaxed">{selectedSocietyForDetail.description}</p>
              </Card>

              {/* Purpose */}
              <Card className="p-6">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Purpose
                </h3>
                <p className="text-muted-foreground leading-relaxed">{selectedSocietyForDetail.purpose}</p>
              </Card>

              {/* Advisor Information */}
              {(selectedSocietyForDetail.advisor_info || advisorInfo) && (
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
                          {selectedSocietyForDetail.advisor_info?.name || advisorInfo?.name || selectedSocietyForDetail.advisor || "N/A"}
                        </span>
                      </div>
                      {(selectedSocietyForDetail.advisor_info?.email || advisorInfo?.email) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">
                            {selectedSocietyForDetail.advisor_info?.email || advisorInfo?.email}
                          </span>
                        </div>
                      )}
                      {(selectedSocietyForDetail.advisor_info?.phone || advisorInfo?.phone) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">
                            {selectedSocietyForDetail.advisor_info?.phone || advisorInfo?.phone}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {(selectedSocietyForDetail.advisor_info?.faculty_id || advisorInfo?.faculty_id) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Faculty ID:</span>
                          <span className="font-medium">
                            {selectedSocietyForDetail.advisor_info?.faculty_id || advisorInfo?.faculty_id}
                          </span>
                        </div>
                      )}
                      {(selectedSocietyForDetail.advisor_info?.dept || advisorInfo?.dept) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium">
                            {selectedSocietyForDetail.advisor_info?.dept || advisorInfo?.dept}
                          </span>
                        </div>
                      )}
                      {(selectedSocietyForDetail.advisor_info?.cnic || advisorInfo?.cnic) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CNIC:</span>
                          <span className="font-medium">
                            {selectedSocietyForDetail.advisor_info?.cnic || advisorInfo?.cnic}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Student Information */}
              {selectedSocietyForDetail.student_info && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-3 text-university-navy">Submitted By (Student)</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedSocietyForDetail.student_info.firstName} {selectedSocietyForDetail.student_info.lastName}
                      </span>
                    </div>
                    {selectedSocietyForDetail.student_info.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedSocietyForDetail.student_info.email}</span>
                      </div>
                    )}
                    {selectedSocietyForDetail.student_info.rollNo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Roll Number:</span>
                        <span className="font-medium">{selectedSocietyForDetail.student_info.rollNo}</span>
                      </div>
                    )}
                    {selectedSocietyForDetail.student_info.university && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">University:</span>
                        <span className="font-medium">{selectedSocietyForDetail.student_info.university}</span>
                      </div>
                    )}
                    {selectedSocietyForDetail.student_info.major && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Major:</span>
                        <span className="font-medium">{selectedSocietyForDetail.student_info.major}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Achievements */}
              {selectedSocietyForDetail.achievements && Array.isArray(selectedSocietyForDetail.achievements) && selectedSocietyForDetail.achievements.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Achievements
                  </h3>
                  <div className="space-y-2">
                    {selectedSocietyForDetail.achievements.map((achievement: any, index: number) => (
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

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsSocietyDetailModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setConfirmDialog({
                      open: true,
                      title: "Delete Society",
                      description: "Are you sure you want to delete this society? This action cannot be undone.",
                      onConfirm: () => {
                        handleDeleteSociety(selectedSocietyForDetail.society_id);
                        setIsSocietyDetailModalOpen(false);
                      },
                      variant: "destructive"
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Society
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Advisor Creation Dialog */}
      <Dialog open={isAdvisorDialogOpen} onOpenChange={setIsAdvisorDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Advisor Account</DialogTitle>
            <DialogDescription>
              Create a new advisor account. The advisor will have the same fields as student registration but with the role "advisor".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={advisorData.firstName}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={advisorData.lastName}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="advisor@university.edu"
                value={advisorData.email}
                onChange={(e) =>
                  setAdvisorData({ ...advisorData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={advisorData.phone}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="rollNo">Roll No</Label>
                <Input
                  id="rollNo"
                  placeholder="0000-XX-0000"
                  value={advisorData.rollNo}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, rollNo: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  placeholder="Government College University"
                  value={advisorData.university}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, university: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  placeholder="Computer Science"
                  value={advisorData.major}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, major: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="degree">Degree Level</Label>
                <select
                  id="degree"
                  className="w-full p-2 border rounded-md text-sm"
                  value={advisorData.degree}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, degree: e.target.value })
                  }
                  required
                >
                  <option value="">Select degree level</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="UnderGraduate">UnderGraduate</option>
                  <option value="Mphil">Mphil</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <select
                  id="semester"
                  className="w-full p-2 border rounded-md text-sm"
                  value={advisorData.semester}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, semester: e.target.value })
                  }
                  required
                >
                  <option value="">Select semester</option>
                  {["1", "2", "3", "4", "5", "6", "7", "8"].map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={advisorData.password}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={advisorData.confirmPassword}
                  onChange={(e) =>
                    setAdvisorData({ ...advisorData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Show error */}
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsAdvisorDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="university" onClick={handleCreateAdvisor}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Advisor Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Request Detail Modal */}
      <EventRequestDetailModal
        isOpen={isEventRequestDetailModalOpen}
        onClose={() => setIsEventRequestDetailModalOpen(false)}
        eventRequest={selectedEventRequest}
        variant="detailed"
        isLoading={loadingEventRequestDetails}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />

      <ChangePasswordDialog
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />
    </div>
  );
};

export default AdminDashboard;