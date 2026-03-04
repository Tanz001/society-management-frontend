import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import AdminEventReportsSection from "@/components/admin/AdminEventReportsSection";
import EventRequestDetailModal from "@/components/admin/EventRequestDetailModal";
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
  UserPlus,
  Check,
  ChevronsUpDown,
  X,
  Power,
  Trash2,
  Upload,
  Image as ImageIcon,
  MoreVertical,
  Search,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeToAMPM, getDashboardPath } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Label } from "@/components/ui/label";
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
  logo_path?: string;
  cover_image_path?: string;
  advisor_info?: {
    faculty_id: number;
    name: string;
    email?: string;
    phone?: string;
    cnic?: string;
    dept?: string;
  };
  student_info?: {
    firstName: string;
    lastName: string;
    email: string;
    rollNo: string;
    university?: string;
    major?: string;
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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
  const [eventRequestSearch, setEventRequestSearch] = useState<string>("");
  const [eventRequestDateFilter, setEventRequestDateFilter] = useState<string>("");
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
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [societyToDelete, setSocietyToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSocietyDetail, setSelectedSocietyDetail] = useState<Society | null>(null);
  const [advisorInfo, setAdvisorInfo] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [advisors, setAdvisors] = useState<Array<{ faculty_id: number; name: string; email: string; dept?: string }>>([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);
  const [facultyComboboxOpen, setFacultyComboboxOpen] = useState(false);

  // Faculty Management states
  const [allFaculty, setAllFaculty] = useState<Array<{ faculty_id: number; name: string; email: string; cnic?: string; phone?: string; is_active: number; created_at: string }>>([]);
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [isFacultyEditModalOpen, setIsFacultyEditModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [facultyEditFormData, setFacultyEditFormData] = useState({
    name: "",
    email: "",
    cnic: "",
    phone: "",
  });

  // Pagination states
  const [societiesCurrentPage, setSocietiesCurrentPage] = useState(1);
  const [eventRequestsCurrentPage, setEventRequestsCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");


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

  // Handle approve/reject/revise action
  const handleAction = async (action: 'approve' | 'reject' | 'revise') => {
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

      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'requested revision for';
      console.log(`Society ${actionText} successfully:`, response.data);

      // Refresh the societies list
      await fetchAllSocieties();

      // Close modal
      setIsModalOpen(false);
      setSelectedSociety(null);
      setReviewNote("");

      // Show success message
      toast({
        title: "Success",
        description: `Society ${actionText} successfully!`,
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

  // Fetch all faculty for edit form
  const fetchAdvisors = async () => {
    try {
      setLoadingAdvisors(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/faculty`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Filter only active faculty
        const facultyList = (response.data.faculty || []).filter(
          (f: { is_active: number }) => f.is_active === 1
        );
        console.log("Fetched faculty:", facultyList);
        setAdvisors(facultyList);
      }
    } catch (err: any) {
      console.error("Error fetching faculty:", err);
      toast({
        title: "Error",
        description: "Failed to fetch faculty",
        variant: "destructive",
      });
    } finally {
      setLoadingAdvisors(false);
    }
  };

  // Fetch all faculty for management tab
  const fetchAllFaculty = async () => {
    try {
      setLoadingFaculty(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/faculty`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAllFaculty(response.data.faculty || []);
      }
    } catch (err: any) {
      console.error("Error fetching all faculty:", err);
      toast({
        title: "Error",
        description: "Failed to fetch faculty",
        variant: "destructive",
      });
    } finally {
      setLoadingFaculty(false);
    }
  };

  // Handle edit faculty click
  const handleEditFacultyClick = (faculty: any) => {
    setSelectedFaculty(faculty);
    setFacultyEditFormData({
      name: faculty.name || "",
      email: faculty.email || "",
      cnic: faculty.cnic || "",
      phone: faculty.phone || "",
    });
    setIsFacultyEditModalOpen(true);
  };

  // Handle update faculty
  const handleUpdateFaculty = async () => {
    if (!selectedFaculty) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Note: We'll need to create an update endpoint or use existing one
      // For now, we'll show a message that update functionality needs backend support
      toast({
        title: "Info",
        description: "Faculty update endpoint needs to be implemented in backend",
        variant: "default",
      });

      setIsFacultyEditModalOpen(false);
      setSelectedFaculty(null);
    } catch (err: any) {
      console.error("Error updating faculty:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update faculty",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle toggle faculty status (activate/deactivate)
  const handleToggleFacultyStatus = async (facultyId: number, currentStatus: number) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/faculty/${facultyId}/status`,
        { is_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Faculty member ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
          variant: "default",
        });
        await fetchAllFaculty();
        await fetchAdvisors(); // Refresh advisors list too
      }
    } catch (err: any) {
      console.error("Error toggling faculty status:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update faculty status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete society
  const handleDeleteSociety = async (societyId: number) => {
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

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/societies/${societyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Society deleted successfully!",
        });
        setIsDeleteDialogOpen(false);
        setSocietyToDelete(null);
        await fetchAllSocieties();
      }
    } catch (err: any) {
      console.error("Error deleting society:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete society",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle file change for edit modal
  const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${type === 'logo' ? 'Logo' : 'Cover photo'} size exceeds 5MB. Please choose a smaller file.`,
          variant: "destructive",
        });
        event.target.value = '';
        return;
      }

      if (!file.type.match(/^image\/(png|jpeg|jpg)$/i)) {
        toast({
          title: "Invalid file type",
          description: `Invalid file type for ${type === 'logo' ? 'logo' : 'cover photo'}. Please upload PNG or JPG images only.`,
          variant: "destructive",
        });
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setEditLogoFile(file);
          setPreviewLogo(reader.result as string);
        } else {
          setEditCoverFile(file);
          setPreviewCover(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle view details
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

      setIsDetailModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching society details:", err);
      toast({
        title: "Error",
        description: "Failed to load society details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
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
      setEditLogoFile(null);
      setEditCoverFile(null);
      setPreviewLogo(societyData.society_logo ? `${import.meta.env.VITE_API_URL}/${societyData.society_logo}` : null);
      setPreviewCover(societyData.cover_photo ? `${import.meta.env.VITE_API_URL}/${societyData.cover_photo}` : null);

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

      // Use FormData if images are being uploaded, otherwise use JSON
      const hasImages = editLogoFile || editCoverFile;

      let response;
      if (hasImages) {
        const formData = new FormData();
        formData.append("name", editFormData.name);
        formData.append("description", editFormData.description);
        formData.append("category", editFormData.category);
        formData.append("location", editFormData.location);
        formData.append("advisor", editFormData.advisor);
        formData.append("purpose", editFormData.purpose);

        if (editLogoFile) {
          formData.append("societyLogo", editLogoFile);
        }
        if (editCoverFile) {
          formData.append("coverPhoto", editCoverFile);
        }

        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/societies/${societyToEdit.society_id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        const payload = {
          name: editFormData.name,
          description: editFormData.description,
          category: editFormData.category,
          location: editFormData.location,
          advisor: editFormData.advisor,
          purpose: editFormData.purpose,
        };

        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/societies/${societyToEdit.society_id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Society updated successfully!",
          variant: "default",
        });
        setIsEditModalOpen(false);
        setSocietyToEdit(null);
        setEditLogoFile(null);
        setEditCoverFile(null);
        setPreviewLogo(null);
        setPreviewCover(null);
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

      // Always fetch ALL event requests for the role
      // Local filtering will be handled on the frontend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/event-requests`,
        {
          role: "board_secretary",
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
        pending: allRequests.filter((r: any) => [1, 15].includes(r.status_id)).length,
        approved: allRequests.filter((r: any) => [2, 4, 6, 8, 10, 11, 12, 13].includes(r.status_id)).length,
        rejected: allRequests.filter((r: any) => [3, 5, 7, 9, 14].includes(r.status_id)).length
      });

      setEventRequestsCurrentPage(1);
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

  // Secretary can update only when Pending (1) or Revise (15-18)
  const canUpdateStatus = (statusId: number) => [1, 15, 16, 17, 18].includes(statusId);
  const handleChangeEventStatus = async (request: any) => {
    if (!canUpdateStatus(request?.status_id)) return; // Don't open modal
    setSelectedEventRequest(request);
    setSelectedEventStatus(0);
    setEventStatusNote("");
    setIsEventStatusModalOpen(true);
    if ([15, 16, 17, 18].includes(request?.status_id)) return; // Revise: only show message, no need to fetch statuses
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

      // Board Secretary can approve (2), reject (3), or revise (15) event requests
      let action: 'approve' | 'reject' | 'revise';
      if (selectedEventStatus === 2) {
        action = 'approve';
      } else if (selectedEventStatus === 3) {
        action = 'reject';
      } else if (selectedEventStatus === 15) {
        action = 'revise';
      } else {
        toast({
          title: "Error",
          description: "Invalid status selected. Please select Approve (2), Reject (3), or Revise (15).",
          variant: "destructive",
        });
        setActionLoading(false);
        return;
      }

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

  // Verify user role on component mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const roles = user.roles || [];
      const roleNames = roles.map((r: any) => String(r.role_name || "").toLowerCase());

      // Check if user has board_secretary role
      if (!roleNames.includes("board_secretary")) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this dashboard.",
          variant: "destructive",
        });
        // Redirect to appropriate dashboard based on user role
        navigate(getDashboardPath());
        return;
      }
    } catch (error) {
      console.error("Error verifying user role:", error);
      navigate("/");
      return;
    }

    // Load data if role is correct
    fetchAllSocieties();
    fetchStatuses();
  }, []);

  // Fetch event requests when tab is active or filter changes
  useEffect(() => {
    if (activeTab === "event-requests") {
      fetchAllEventRequests();
      // fetchEventRequestStats();
    }
    // if (activeTab === "faculty") {
    //   fetchAllFaculty();
    // }
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
                onClick={() => navigate("/society/register")}
              >
                <Building className="h-4 w-4 mr-2" />
                Create Society
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white/20 bg-transparent"
                onClick={() => navigate("/dashboard/admin/add-faculty")}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Faculty
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
              {/* <TabsTrigger value="faculty">Faculty Management</TabsTrigger> */}
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

              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search societies by name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSocietiesCurrentPage(1); // Reset to first page when searching
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Societies List */}
              {loading && societies.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading societies...</p>
                </div>
              ) : (() => {
                // Filter societies based on search term
                const filteredSocieties = societies.filter((society) =>
                  society.name.toLowerCase().includes(searchTerm.toLowerCase())
                );

                return filteredSocieties.length > 0 ? (
                  <>
                    <div className="grid gap-6">
                      {filteredSocieties.slice((societiesCurrentPage - 1) * itemsPerPage, societiesCurrentPage * itemsPerPage).map((society) => (
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
                                  <DropdownMenuItem onClick={() => handleEditClick(society)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSocietyToDelete(society.society_id);
                                      setIsDeleteDialogOpen(true);
                                    }}
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
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      {searchTerm ? "No Societies Found" : "No Societies Found"}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? `No societies found matching "${searchTerm}". Try a different search term.`
                        : "No societies have been registered yet."}
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
                  </div>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    type="date"
                    value={eventRequestDateFilter}
                    onChange={(e) => {
                      setEventRequestDateFilter(e.target.value);
                      setEventRequestsCurrentPage(1);
                    }}
                    className="w-auto h-9"
                  />
                  <Button
                    variant={eventRequestDateFilter === new Date().toISOString().split('T')[0] ? "university" : "outline"}
                    size="sm"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      if (eventRequestDateFilter === today) {
                        setEventRequestDateFilter("");
                      } else {
                        setEventRequestDateFilter(today);
                      }
                      setEventRequestsCurrentPage(1);
                    }}
                  >
                    Today's Events
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
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
                    if (![1, 15].includes(request.status_id)) return false;
                  } else if (eventRequestFilter === "approved") {
                    if (![2, 4, 6, 8, 10, 11, 12, 13].includes(request.status_id)) return false;
                  } else if (eventRequestFilter === "rejected") {
                    if (![3, 5, 7, 9, 14].includes(request.status_id)) return false;
                  }

                  // 2. Search Filter
                  let passesSearchFilter = true;
                  if (eventRequestSearch.trim()) {
                    const searchLower = eventRequestSearch.toLowerCase();
                    passesSearchFilter = (
                      (request.title || "").toLowerCase().includes(searchLower) ||
                      (request.event_name || "").toLowerCase().includes(searchLower) ||
                      (request.society_name || "").toLowerCase().includes(searchLower) ||
                      (request.description || "").toLowerCase().includes(searchLower) ||
                      (request.venue || "").toLowerCase().includes(searchLower) ||
                      ((request.firstName || "") + " " + (request.lastName || "")).toLowerCase().includes(searchLower)
                    );
                  }

                  // 3. Date Filter
                  let passesDateFilter = true;
                  if (eventRequestDateFilter) {
                    if (!request.event_date) {
                      passesDateFilter = false;
                    } else {
                      const eventDateStr = request.event_date.substring(0, 10);
                      passesDateFilter = eventDateStr === eventRequestDateFilter;
                    }
                  }

                  return passesSearchFilter && passesDateFilter;
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
                                {[15, 16, 17, 18].includes(request.status_id) && (
                                  <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                                    Pending from Advisor
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
                              {request.cancelled_reason && (
                                <div className="bg-red-50 border-l-4 border-red-200 p-2 mt-2 rounded">
                                  <p className="text-xs font-medium text-red-900 mb-1">Cancellation Reason:</p>
                                  <p className="text-xs text-red-800">{request.cancelled_reason}</p>
                                  {request.cancelled_at && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Cancelled on: {new Date(request.cancelled_at).toLocaleString()}
                                    </p>
                                  )}
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
                                    disabled={loadingEventRequests || !canUpdateStatus(request?.status_id)}
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

            <TabsContent value="event-reports">
              <AdminEventReportsSection isActive={activeTab === "event-reports"} />
            </TabsContent>

            {/* <TabsContent value="faculty">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-university-navy">Faculty Management</h2>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={fetchAllFaculty}
                        disabled={loadingFaculty}
                      >
                        {loadingFaculty ? "Loading..." : "Refresh"}
                      </Button>
                      <Button 
                        variant="university"
                        onClick={() => navigate("/dashboard/admin/add-faculty")}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Faculty
                      </Button>
                    </div>
                  </div>

                  {loadingFaculty && allFaculty.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading faculty...</p>
                    </div>
                  ) : allFaculty.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No faculty members found</p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {allFaculty.map((faculty) => (
                        <Card key={faculty.faculty_id} className="p-6 shadow-card">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-university-navy">{faculty.name}</h3>
                                <Badge variant={faculty.is_active === 1 ? "default" : "secondary"}>
                                  {faculty.is_active === 1 ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>📧 {faculty.email}</p>
                                {faculty.phone && <p>📞 {faculty.phone}</p>}
                                {faculty.cnic && <p>🆔 CNIC: {faculty.cnic}</p>}
                                <p className="text-xs">
                                  Created: {new Date(faculty.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditFacultyClick(faculty)}
                                disabled={actionLoading}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant={faculty.is_active === 1 ? "destructive" : "default"}
                                onClick={() => handleToggleFacultyStatus(faculty.faculty_id, faculty.is_active)}
                                disabled={actionLoading}
                              >
                                <Power className="h-3 w-3 mr-1" />
                                {faculty.is_active === 1 ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent> */}
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
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Approve Application"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Request Detail Modal - Using Shared Component */}
      <EventRequestDetailModal
        isOpen={isEventRequestModalOpen}
        onClose={() => setIsEventRequestModalOpen(false)}
        eventRequest={selectedEventRequest}
        actionContent={
          !selectedEventRequest || !canUpdateStatus(selectedEventRequest.status_id) ? null : (
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
          )
        }
      />

      {/* Event Request Status Change Modal */}
      < Dialog open={isEventStatusModalOpen} onOpenChange={setIsEventStatusModalOpen} >
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

              {/* Revise: show only message - pending from advisor */}
              {[15, 16, 17, 18].includes(selectedEventRequest.status_id) ? (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    You cannot update status. It is pending from advisor side.
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={() => setIsEventStatusModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog >

      {/* Edit Society Modal */}
      < Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen} >
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
                  <SelectItem value="University Level">University Level</SelectItem>
                  <SelectItem value="Department Level">Department Level</SelectItem>
                  <SelectItem value="Intermediate Level">Intermediate Level</SelectItem>
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
                <div className="text-sm text-muted-foreground">Loading faculty...</div>
              ) : advisors.length === 0 ? (
                <div className="text-sm text-muted-foreground">No faculty available</div>
              ) : (
                <Popover open={facultyComboboxOpen} onOpenChange={setFacultyComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !editFormData.advisor && "text-muted-foreground"
                      )}
                    >
                      {editFormData.advisor && advisors.find(a => String(a.faculty_id) === editFormData.advisor)
                        ? (() => {
                          const selected = advisors.find(a => String(a.faculty_id) === editFormData.advisor);
                          return selected ? `${selected.name}${selected.email ? ` (${selected.email})` : ""}` : "Select a faculty member";
                        })()
                        : "Select a faculty member"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search faculty by name or email..." />
                      <CommandList>
                        <CommandEmpty>No faculty found.</CommandEmpty>
                        <CommandGroup>
                          {advisors.map((f) => (
                            <CommandItem
                              value={`${f.name} ${f.email || ""} ${f.dept || ""}`}
                              key={f.faculty_id}
                              onSelect={() => {
                                setEditFormData({ ...editFormData, advisor: String(f.faculty_id) });
                                setFacultyComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(f.faculty_id) === editFormData.advisor
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{f.name} {f.email ? `(${f.email})` : ""}</span>
                                {f.dept && <span className="text-xs text-muted-foreground">{f.dept}</span>}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

            {/* Image Upload Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium">Update Images</h3>

              {/* Logo Upload */}
              <div>
                <Label htmlFor="edit-logo" className="text-sm font-medium mb-2 block">
                  Society Logo
                </Label>
                <div className="flex items-center gap-4">
                  {previewLogo && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={previewLogo}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="edit-logo"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleEditFileChange(e, 'logo')}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG or JPG, max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Photo Upload */}
              <div>
                <Label htmlFor="edit-cover" className="text-sm font-medium mb-2 block">
                  Cover Photo
                </Label>
                <div className="flex items-center gap-4">
                  {previewCover && (
                    <div className="w-32 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={previewCover}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="edit-cover"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleEditFileChange(e, 'cover')}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG or JPG, max 5MB
                    </p>
                  </div>
                </div>
              </div>
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
      </Dialog >

      {/* Edit Faculty Modal */}
      < Dialog open={isFacultyEditModalOpen} onOpenChange={setIsFacultyEditModalOpen} >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Faculty Member</DialogTitle>
            <DialogDescription>
              Update the faculty member information below
            </DialogDescription>
          </DialogHeader>

          {selectedFaculty && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name *</label>
                <Input
                  value={facultyEditFormData.name}
                  onChange={(e) => setFacultyEditFormData({ ...facultyEditFormData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email *</label>
                <Input
                  type="email"
                  value={facultyEditFormData.email}
                  onChange={(e) => setFacultyEditFormData({ ...facultyEditFormData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">CNIC (Optional)</label>
                <Input
                  value={facultyEditFormData.cnic}
                  onChange={(e) => setFacultyEditFormData({ ...facultyEditFormData, cnic: e.target.value })}
                  placeholder="Enter CNIC"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Phone (Optional)</label>
                <Input
                  type="tel"
                  value={facultyEditFormData.phone}
                  onChange={(e) => setFacultyEditFormData({ ...facultyEditFormData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  maxLength={20}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setIsFacultyEditModalOpen(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button
                  variant="university"
                  onClick={handleUpdateFaculty}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating..." : "Update Faculty"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog >

      {/* Delete Confirmation Dialog */}
      < ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Society"
        description="Are you sure you want to delete this society? This action cannot be undone and will delete all associated data including events, achievements, and status history."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          if (societyToDelete) {
            handleDeleteSociety(societyToDelete);
          }
        }}
      />

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
              {/* Header Section with Cover Photo */}
              {selectedSocietyDetail.cover_image_path && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${selectedSocietyDetail.cover_image_path}`}
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
                  {selectedSocietyDetail.logo_path && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${selectedSocietyDetail.logo_path}`}
                      alt={selectedSocietyDetail.name}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-university-gold"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-university-navy">{selectedSocietyDetail.name}</h2>
                      <Badge variant="secondary">{selectedSocietyDetail.status_name}</Badge>
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
              {(selectedSocietyDetail.advisor_info || advisorInfo) && (
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
                          {selectedSocietyDetail.advisor_info?.name || advisorInfo?.name || selectedSocietyDetail.advisor || "N/A"}
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
                      {(selectedSocietyDetail.advisor_info?.faculty_id || advisorInfo?.faculty_id) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Faculty ID:</span>
                          <span className="font-medium">
                            {selectedSocietyDetail.advisor_info?.faculty_id || advisorInfo?.faculty_id}
                          </span>
                        </div>
                      )}
                      {(selectedSocietyDetail.advisor_info?.dept || advisorInfo?.dept) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium">
                            {selectedSocietyDetail.advisor_info?.dept || advisorInfo?.dept}
                          </span>
                        </div>
                      )}
                      {(selectedSocietyDetail.advisor_info?.cnic || advisorInfo?.cnic) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CNIC:</span>
                          <span className="font-medium">
                            {selectedSocietyDetail.advisor_info?.cnic || advisorInfo?.cnic}
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

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="university"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    if (selectedSocietyDetail) {
                      handleEditClick(selectedSocietyDetail as any);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Society
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
      <ChangePasswordDialog
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
      />
    </div>
  );
};

export default BoardSecretaryDashboard;

