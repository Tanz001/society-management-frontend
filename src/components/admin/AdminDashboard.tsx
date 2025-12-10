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
  LogOut,
  Trash2,
  UserPlus,
  ShieldCheck,
  FileText
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSocietyDetailModalOpen, setIsSocietyDetailModalOpen] = useState(false);
  const [selectedSocietyForDetail, setSelectedSocietyForDetail] = useState<any>(null);
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
  const [loadingEventRequestDetails, setLoadingEventRequestDetails] = useState(false);
  const [societyFilter, setSocietyFilter] = useState("all"); // all, active, pending, rejected
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
    onConfirm: () => {},
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
      setAllEventRequests(response.data.data || []);
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
                                    src={`${import.meta.env.VITE_API_URL}/${society.society_logo}`}

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
                            <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSocietyForDetail(society);
                                setIsSocietyDetailModalOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteSociety(society.society_id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                            </div>
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
                            onClick={() => {
                              setSelectedSocietyForDetail(society);
                              setIsSocietyDetailModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">All Event Requests</h2>
                <Button variant="outline" size="sm" onClick={getAllEventRequests} disabled={eventRequestsLoading}>
                  {eventRequestsLoading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>

              {eventRequestsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading event requests...</p>
                </div>
              ) : allEventRequests.length === 0 ? (
                <Card className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Event Requests Found</h3>
                  <p className="text-muted-foreground">No event requests have been submitted yet.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {allEventRequests.map((request: any) => (
                    <Card key={request.req_id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-university-navy">{request.title || request.event_name}</h3>
                            <Badge variant={request.status_id === 1 ? "secondary" : [2, 4, 6, 8, 11, 13, 15].includes(request.status_id) ? "default" : "destructive"}>
                              {request.status_name || "Pending"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{request.description || request.media_coverage}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>📅 {request.event_date ? new Date(request.event_date).toLocaleDateString() : "Date TBD"}</span>
                            {request.event_time && <span>🕐 {request.event_time}</span>}
                            {request.venue && <span>📍 {request.venue}</span>}
                            {request.society_name && <span>🏛️ {request.society_name}</span>}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await handleViewEventRequestDetails(request.req_id);
                          }}
                          disabled={loadingEventRequestDetails}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {loadingEventRequestDetails ? "Loading..." : "View Details"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
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

              {/* Societies List */}
              {filteredSocieties.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-university-navy">
                    All Societies ({filteredSocieties.length})
                  </h3>
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
                            onClick={() => {
                              setSelectedSocietyForDetail(society);
                              setIsSocietyDetailModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
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

      {/* Society Detail Modal */}
      <Dialog open={isSocietyDetailModalOpen} onOpenChange={setIsSocietyDetailModalOpen}>
        <DialogContent className="max-w-4xl h-[95vh] overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>Society Details</DialogTitle>
            <DialogDescription>
              View complete information about the society
            </DialogDescription>
          </DialogHeader>

          {selectedSocietyForDetail && (
            <div className="space-y-6 overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Hero Section */}
              <div className="gradient-primary text-white p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                    {selectedSocietyForDetail.society_logo ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL}/${selectedSocietyForDetail.society_logo}`} 
                        alt={selectedSocietyForDetail.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <Building className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge variant="secondary" className="bg-white/20 text-white mr-2 capitalize">
                        {selectedSocietyForDetail.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-white border-white ${
                          selectedSocietyForDetail.status_name === 'Approved by VC' ? 'bg-green-500/20' :
                          selectedSocietyForDetail.status_id === 1 ? 'bg-yellow-500/20' :
                          selectedSocietyForDetail.status_name?.includes('Rejected') ? 'bg-red-500/20' : ''
                        }`}
                      >
                        {selectedSocietyForDetail.status_name || 'Unknown'}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{selectedSocietyForDetail.name}</h2>
                    <p className="text-white/90 mb-4">{selectedSocietyForDetail.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedSocietyForDetail.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Advisor: {selectedSocietyForDetail.advisor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Society Information */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Society Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Society ID:</span>
                      <span className="font-medium">{selectedSocietyForDetail.society_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium capitalize">{selectedSocietyForDetail.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedSocietyForDetail.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advisor:</span>
                      <span className="font-medium">{selectedSocietyForDetail.advisor}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge 
                        variant={
                          selectedSocietyForDetail.status_name === 'Approved by VC' ? 'default' :
                          selectedSocietyForDetail.status_id === 1 ? 'secondary' :
                          selectedSocietyForDetail.status_name?.includes('Rejected') ? 'destructive' : 'outline'
                        }
                      >
                        {selectedSocietyForDetail.status_name || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {selectedSocietyForDetail.created_at ? new Date(selectedSocietyForDetail.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {selectedSocietyForDetail.student_info && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner:</span>
                          <span className="font-medium">
                            {selectedSocietyForDetail.student_info.firstName} {selectedSocietyForDetail.student_info.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Owner Email:</span>
                          <span className="font-medium">{selectedSocietyForDetail.student_info.email}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedSocietyForDetail.description}
                </p>
              </Card>

              {/* Purpose */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Society Purpose
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedSocietyForDetail.purpose}
                </p>
              </Card>

              {/* Achievements */}
              {selectedSocietyForDetail.achievements && selectedSocietyForDetail.achievements.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Achievements
                  </h3>
                  <div className="space-y-2">
                    {selectedSocietyForDetail.achievements.map((achievement: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-university-gold rounded-full mt-2"></div>
                        <span className="text-muted-foreground">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Events */}
              {selectedSocietyForDetail.events && selectedSocietyForDetail.events.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Events ({selectedSocietyForDetail.events.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedSocietyForDetail.events.map((event: any, index: number) => (
                      <div key={index} className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h6 className="font-medium text-sm">{event.title || event.event_title || 'Untitled Event'}</h6>
                          {event.event_date && (
                            <Badge variant="outline" className="text-xs">
                              {new Date(event.event_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Cover Image */}
              {selectedSocietyForDetail.cover_photo && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Cover Image</h3>
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/${selectedSocietyForDetail.cover_photo}`} 
                    alt={selectedSocietyForDetail.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
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
      <Dialog open={isEventRequestDetailModalOpen} onOpenChange={setIsEventRequestDetailModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the event request including all notes and documents
            </DialogDescription>
          </DialogHeader>
          {loadingEventRequestDetails ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading event request details...</p>
            </div>
          ) : selectedEventRequest ? (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Event Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Name:</span>
                      <span className="font-medium">{selectedEventRequest.title || selectedEventRequest.event_name || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Type:</span>
                      <span className="font-medium">{selectedEventRequest.event_type || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date From:</span>
                      <span className="font-medium">{selectedEventRequest.event_date || selectedEventRequest.date_from ? new Date(selectedEventRequest.event_date || selectedEventRequest.date_from).toLocaleDateString() : "TBD"}</span>
                    </div>
                    {selectedEventRequest.date_to && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date To:</span>
                        <span className="font-medium">{new Date(selectedEventRequest.date_to).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time From:</span>
                      <span className="font-medium">{selectedEventRequest.event_time || selectedEventRequest.time_from || "TBD"}</span>
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
                        <span className="font-medium">{selectedEventRequest.sponsor_amount}</span>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={selectedEventRequest.status_id === 1 ? "secondary" : [2, 4, 6, 8, 11, 13, 15].includes(selectedEventRequest.status_id) ? "default" : "destructive"}>
                        {selectedEventRequest.status_name || "Pending"}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-university-navy">Submitted By</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedEventRequest.firstName && selectedEventRequest.lastName
                          ? `${selectedEventRequest.firstName} ${selectedEventRequest.lastName}`
                          : selectedEventRequest.president_name || "Not available"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">
                        {selectedEventRequest.president_email || selectedEventRequest.email || "Not provided"}
                      </span>
                    </div>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created At:</span>
                      <span className="font-medium">{new Date(selectedEventRequest.created_at).toLocaleString()}</span>
                    </div>
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
            </div>
          ) : null}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEventRequestDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />
    </div>
  );
};

export default AdminDashboard;