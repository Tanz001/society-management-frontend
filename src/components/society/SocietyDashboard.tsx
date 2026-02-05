import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileSidebar, MobileNav } from "@/components/ui/mobile-sidebar";
import { ResponsiveHeader } from "@/components/ui/responsive-header";
import {
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  BarChart3,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  UserCheck,
  Settings,
  FileText,
  Activity,
  Mail,
  Phone,
  Clock,
  ThumbsUp,
  MessageCircle,
  Send,
  Loader2,
  Image as ImageIcon,
  Video,
  Download,
  BarChart3 as BarChartIcon,
  MapPin,
  ArrowLeft,
  Edit,
  Save,
  X,
  Building,
  Upload,
  ChevronLeft,
  ChevronRight,
  Crown,
  Trash2,
  MoreVertical,
  Archive,
  ArchiveRestore
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import EventRequestForm from "./EventRequestForm";
import EventRequestsList from "./EventRequestsList";
import EventReportUpload from "./EventReportUpload";

const SocietyDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { societyId } = useParams(); // Get society ID from URL params
  const [membershipFee, setMembershipFee] = useState(250);
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [societyInfo, setSocietyInfo] = useState<any>(null);
  const [loadingSociety, setLoadingSociety] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [eventRequestsRefreshKey, setEventRequestsRefreshKey] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({});
  const [likingPost, setLikingPost] = useState<number | null>(null);
  const [commentingOn, setCommentingOn] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<{ [key: number]: any[] }>({});
  const [selectedEventForReport, setSelectedEventForReport] = useState<{ id: number, title: string } | null>(null);
  const [isReportUploadOpen, setIsReportUploadOpen] = useState(false);
  const [completingEvent, setCompletingEvent] = useState<number | null>(null);
  const [viewingMedia, setViewingMedia] = useState<{ url: string, type: string, files: any[], currentIndex: number } | null>(null);

  // Cabinet management state
  const [cabinetMembers, setCabinetMembers] = useState<any[]>([]);
  const [archivedCabinetMembers, setArchivedCabinetMembers] = useState<any[]>([]);
  const [loadingCabinet, setLoadingCabinet] = useState(false);
  const [isCabinetModalOpen, setIsCabinetModalOpen] = useState(false);
  const [cabinetYearFilter, setCabinetYearFilter] = useState<string>("all");
  const [showArchivedCabinet, setShowArchivedCabinet] = useState(false);

  const [editingCabinetMember, setEditingCabinetMember] = useState<any | null>(null);
  const [cabinetFormData, setCabinetFormData] = useState({ 
    name: "", 
    designation: "", 
    tenure_start: new Date().getFullYear().toString(), 
    tenure_end: (new Date().getFullYear() + 1).toString() 
  });
  const [viewingRequestDetails, setViewingRequestDetails] = useState<any | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Society details edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    purpose: "",
  });
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [savingSociety, setSavingSociety] = useState(false);

  // Check if user is advisor
  const isAdvisor = () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return false;

      const userData = JSON.parse(user);
      const roles = userData.roles || [];
      const roleNames = roles.map((r: any) => String(r.role_name || "").toLowerCase());

      // Check if user has advisor role or has faculty_id (indicating faculty/advisor)
      return roleNames.includes("advisor") || !!userData.faculty_id;
    } catch (error) {
      console.error("Error checking advisor status:", error);
      return false;
    }
  };

  // Navigate back to advisor dashboard
  const handleBackToAdvisorDashboard = () => {
    navigate("/dashboard/advisor");
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Fetch society data by user_id or society_id from URL
  const fetchSocietyData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No authentication token found");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoadingSociety(true);
      let response;

      // Priority 1: Use societyId from URL params (for advisors)
      // Priority 2: Use stored societyId from localStorage
      // Priority 3: Fetch by user_id (for society owners)
      let currentSocietyId = societyId;

      if (!currentSocietyId) {
        const storedSocietyId = localStorage.getItem("currentSocietyId");
        if (storedSocietyId) {
          currentSocietyId = storedSocietyId;
          console.log("Using stored society ID from localStorage:", currentSocietyId);
        }
      }

      if (currentSocietyId) {
        console.log("Fetching society data for society ID:", currentSocietyId);
        response = await axios.get(
          `${API_URL}/society/society/data/${currentSocietyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Otherwise, fetch by user_id (for society owners)
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          console.log("No user data available");
          setLoadingSociety(false);
          return;
        }

        const userData = JSON.parse(storedUser);
        const userId = userData.id || userData.faculty_id;

        if (!userId) {
          console.log("No user ID found in user data");
          setLoadingSociety(false);
          return;
        }

        console.log("Fetching society data for user ID:", userId);
        response = await axios.post(
          `${API_URL}/society/society/data`,
          { user_id: userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (response.data.success) {
        // Handle society data as array - take the first society
        const societyData = response.data.society && response.data.society.length > 0
          ? response.data.society[0]
          : null;

        setSocietyInfo(societyData);
        console.log("Society data fetched:", societyData);

        // If we have society data, save it to localStorage for persistence
        if (societyData && societyData.society_id) {
          // Save society ID to localStorage for persistence across navigation
          localStorage.setItem("currentSocietyId", societyData.society_id.toString());
          // Save full society data to localStorage for quick access
          localStorage.setItem("currentSocietyData", JSON.stringify(societyData));

          fetchMembershipRequests(societyData.society_id);
          // Fetch settings using the society ID from the response
          fetchMembershipSettings(societyData.society_id);
          // Fetch posts and events
          fetchSocietyPosts(societyData.society_id);
          fetchSocietyEvents(societyData.society_id);
          // Fetch cabinet members
          fetchCabinetMembers(societyData.society_id, cabinetYearFilter, showArchivedCabinet);
        }
      } else {
        console.error("Failed to fetch society data:", response.data.message);
        toast.error(response.data.message || "Failed to fetch society data");
      }
    } catch (error: any) {
      console.error("Error fetching society data:", error.response?.data || error.message);
      toast.error("Failed to fetch society data");
    } finally {
      setLoadingSociety(false);
    }
  };

  // Fetch membership settings from backend
  const fetchMembershipSettings = async (societyId?: number) => {
    const currentSocietyId = societyId || societyInfo?.society_id;

    if (!currentSocietyId) {
      console.log("No society ID available for fetching settings");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${API_URL}/society/membership/form`,
        { society_id: currentSocietyId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const settings = response.data.data;
        setMembershipFee(settings.membership_fee || 250);
        setAccountNumber(settings.account_number || "");
        setAccountTitle(settings.account_title || "");
        console.log("Membership settings loaded:", settings);
      } else {
        console.log("No settings found in response:", response.data);
      }

    } catch (error: any) {
      console.error("Error fetching membership settings:", error.response?.data || error.message);
      // Set default values if fetch fails
      setMembershipFee(250);
      setAccountNumber("");
      setAccountTitle("");
      toast.error("Failed to load membership settings");
    }
  };

  // Fetch membership requests for the society
  const fetchMembershipRequests = async (societyId?: number) => {
    const currentSocietyId = societyId || societyInfo?.society_id;

    if (!currentSocietyId) {
      console.log("No society ID available");
      return;
    }

    setLoadingRequests(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      console.log("Fetching membership requests for society ID:", currentSocietyId);
      const response = await axios.post(
        `${API_URL}/society/membership/requests`,
        { society_id: currentSocietyId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setMembershipRequests(response.data.data || []);
        console.log("Membership requests fetched:", response.data.data);
      } else {
        console.error("Failed to fetch membership requests:", response.data.message);
        setMembershipRequests([]);
        toast.error(response.data.message || "Failed to fetch membership requests");
      }
    } catch (error: any) {
      console.error("Error fetching membership requests:", error.response?.data || error.message);
      setMembershipRequests([]);
      toast.error("Failed to fetch membership requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  // Approve membership request
  const handleApproveRequest = async (requestId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${API_URL}/society/membership/approve`,
        { request_id: requestId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Refresh the requests list
        fetchMembershipRequests();
        toast.success("Membership request approved successfully");
      } else {
        toast.error(response.data.message || "Failed to approve request");
      }
    } catch (error: any) {
      console.error("Error approving request:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to approve request");
    }
  };

  // Decline membership request
  const handleDeclineRequest = async (requestId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${API_URL}/society/membership/reject`,
        { request_id: requestId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Refresh the requests list
        fetchMembershipRequests();
        toast.success("Membership request declined successfully");
      } else {
        toast.error(response.data.message || "Failed to decline request");
      }
    } catch (error: any) {
      console.error("Error declining request:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to decline request");
    }
  };

  // Membership fee update function (now just updates state)
  const handleFeeUpdate = (newFee: number) => {
    setMembershipFee(newFee);
    console.log("Membership fee updated to:", newFee);
  };

  // Save membership settings to backend
  const saveMembershipSettings = async () => {
    if (!societyInfo?.society_id) {
      toast.error("Society information not available");
      return;
    }

    if (!membershipFee || !accountNumber || !accountTitle) {
      toast.error("All fields are required: fee, account number, and account title");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${API_URL}/society/membership/settings`,
        {
          society_id: societyInfo.society_id,
          membership_fee: membershipFee,
          account_number: accountNumber,
          account_title: accountTitle
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success || response.data.message) {
        toast.success("Membership settings saved successfully");
      } else {
        toast.error(response.data.message || "Failed to save membership settings");
      }
    } catch (error: any) {
      console.error("Error saving membership settings:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to save membership settings");
    }
  };


  // Fetch posts for the society
  const fetchSocietyPosts = async (societyId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoadingPosts(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;

      const response = await axios.post(
        `${API_URL}/society/posts`,
        { society_id: societyId, user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const postsData = response.data.posts || response.data.data || [];
        setPosts(postsData);

        // Initialize comments and likes state
        const commentsState: { [key: number]: any[] } = {};
        const likedPostsState: { [key: number]: boolean } = {};

        postsData.forEach((post: any) => {
          if (post.comments && post.comments.length > 0) {
            commentsState[post.post_id] = post.comments;
          }
          if (post.is_liked_by_user !== undefined) {
            likedPostsState[post.post_id] = post.is_liked_by_user;
          }
        });

        setComments(commentsState);
        setLikedPosts(likedPostsState);
      } else {
        toast.error(response.data.message || "Failed to fetch posts");
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch events for the society
  const fetchSocietyEvents = async (societyId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoadingEvents(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${API_URL}/society/events`,
        { society_id: societyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const responseEvents = response.data.events || [];

        const transformedEvents = responseEvents.map((event: any) => {
          // For backward compatibility: some endpoints return `source_table`
          // If that's missing, infer based on available fields
          const sourceTable = event.source_table || (event.event_time !== null || event.event_time !== undefined ? 'event_req' : 'events');

          let statusId = event.status_id;
          let statusName = event.status_name;

          // If coming from `events` table, ensure status defaults to 10/Complete
          if (sourceTable === 'events') {
            statusId = statusId ?? 10;
            statusName = statusName ?? 'Active';
          }

          return {
            ...event,
            source_table: sourceTable,
            status_id: statusId,
            status_name: statusName,
          };
        });

        setEvents(transformedEvents);
      } else {
        toast.error(response.data.message || "Failed to fetch events");
      }
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch cabinet members
  const fetchCabinetMembers = async (societyId: number, year?: string, showArchived?: boolean) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLoadingCabinet(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch active (non-archived) members
      const activeResponse = await axios.post(
        `${API_URL}/society/cabinet/list`,
        { 
          society_id: societyId,
          year: year && year !== "all" ? parseInt(year) : undefined,
          show_archived: false
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch archived members
      const archivedResponse = await axios.post(
        `${API_URL}/society/cabinet/list`,
        { 
          society_id: societyId,
          year: year && year !== "all" ? parseInt(year) : undefined,
          show_archived: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (activeResponse.data.success) {
        setCabinetMembers(activeResponse.data.data || []);
      }
      if (archivedResponse.data.success) {
        setArchivedCabinetMembers(archivedResponse.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching cabinet members:", error);
      toast.error("Failed to fetch cabinet members");
    } finally {
      setLoadingCabinet(false);
    }
  };

  // Add or update cabinet member
  const handleSaveCabinetMember = async () => {
    if (!cabinetFormData.name.trim() || !cabinetFormData.designation.trim() || !cabinetFormData.tenure_start || !cabinetFormData.tenure_end) {
      toast.error("Please fill in all fields");
      return;
    }

    if (parseInt(cabinetFormData.tenure_start) > parseInt(cabinetFormData.tenure_end)) {
      toast.error("Tenure start year must be less than or equal to tenure end year");
      return;
    }

    if (!societyInfo?.society_id) {
      toast.error("Society ID not found");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      if (editingCabinetMember) {
        // Update existing member
        const response = await axios.put(
          `${API_URL}/society/cabinet/update`,
          {
            id: editingCabinetMember.id,
            name: cabinetFormData.name.trim(),
            designation: cabinetFormData.designation.trim(),
            tenure_start: parseInt(cabinetFormData.tenure_start),
            tenure_end: parseInt(cabinetFormData.tenure_end)
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Cabinet member updated successfully");
          setIsCabinetModalOpen(false);
          setEditingCabinetMember(null);
          setCabinetFormData({ name: "", designation: "", tenure_start: new Date().getFullYear().toString(), tenure_end: (new Date().getFullYear() + 1).toString() });
          fetchCabinetMembers(societyInfo.society_id, cabinetYearFilter, showArchivedCabinet);
        } else {
          toast.error(response.data.message || "Failed to update cabinet member");
        }
      } else {
        // Add new member
        const response = await axios.post(
          `${API_URL}/society/cabinet/add`,
          {
            society_id: societyInfo.society_id,
            name: cabinetFormData.name.trim(),
            designation: cabinetFormData.designation.trim(),
            tenure_start: parseInt(cabinetFormData.tenure_start),
            tenure_end: parseInt(cabinetFormData.tenure_end)
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Cabinet member added successfully");
          setIsCabinetModalOpen(false);
          setCabinetFormData({ name: "", designation: "", tenure_start: new Date().getFullYear().toString(), tenure_end: (new Date().getFullYear() + 1).toString() });
          fetchCabinetMembers(societyInfo.society_id, cabinetYearFilter, showArchivedCabinet);
        } else {
          toast.error(response.data.message || "Failed to add cabinet member");
        }
      }
    } catch (error: any) {
      console.error("Error saving cabinet member:", error);
      toast.error(error.response?.data?.message || "Failed to save cabinet member");
    }
  };

  // Archive/Unarchive cabinet member
  const handleArchiveCabinetMember = async (id: number, isArchived: boolean) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/society/cabinet/archive`,
        { id, is_archived: !isArchived },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(`Cabinet member ${!isArchived ? 'archived' : 'unarchived'} successfully`);
        if (societyInfo?.society_id) {
          fetchCabinetMembers(societyInfo.society_id, cabinetYearFilter, showArchivedCabinet);
        }
      } else {
        toast.error(response.data.message || `Failed to ${!isArchived ? 'archive' : 'unarchive'} cabinet member`);
      }
    } catch (error: any) {
      console.error("Error archiving/unarchiving cabinet member:", error);
      toast.error(error.response?.data?.message || `Failed to ${!isArchived ? 'archive' : 'unarchive'} cabinet member`);
    }
  };

  // Deactivate cabinet member
  // Deactivate cabinet member (trigger modal)
  const handleDeactivateCabinetMember = (id: number) => {
    setItemToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // Confirm deactivation
  const confirmDeactivateMember = async () => {
    if (!itemToDelete) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/society/cabinet/deactivate`,
        { id: itemToDelete },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

        if (response.data.success) {
          toast.success("Cabinet member deactivated successfully");
          if (societyInfo?.society_id) {
            fetchCabinetMembers(societyInfo.society_id, cabinetYearFilter, showArchivedCabinet);
          }
        }
    } catch (error: any) {
      console.error("Error deactivating cabinet member:", error);
      toast.error(error.response?.data?.message || "Failed to deactivate cabinet member");
    } finally {
      setIsDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Handle like/unlike functionality
  const handleLike = async (postId: number) => {
    if (likingPost === postId) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setLikingPost(postId);

      const response = await axios.post(`${API_URL}/user/like/toggle`, {
        post_id: postId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPosts(prev => prev.map(post =>
          post.post_id === postId
            ? {
              ...post,
              like_count: response.data.like_count,
              is_liked_by_user: response.data.is_liked_by_user
            }
            : post
        ));

        setLikedPosts(prev => ({
          ...prev,
          [postId]: response.data.is_liked_by_user
        }));
      } else {
        toast.error(response.data.message || "Failed to update like");
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error(error.response?.data?.message || "Failed to update like");
    } finally {
      setLikingPost(null);
    }
  };

  // Handle comment submission
  const handleComment = async (postId: number) => {
    if (!newComment.trim() || submittingComment) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      setSubmittingComment(true);

      const response = await axios.post(`${API_URL}/user/comment/add`, {
        post_id: postId,
        comment_text: newComment.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setPosts(prev => prev.map(post =>
          post.post_id === postId
            ? { ...post, comment_count: response.data.comment_count }
            : post
        ));

        if (response.data.new_comment) {
          setComments(prev => ({
            ...prev,
            [postId]: [response.data.new_comment, ...(prev[postId] || [])]
          }));
        }

        setNewComment("");
        toast.success("Comment added successfully");
      } else {
        toast.error(response.data.message || "Failed to add comment");
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle update society
  const handleUpdateSociety = async () => {
    if (!societyInfo?.society_id) {
      toast.error("Society information not available");
      return;
    }

    try {
      setSavingSociety(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL;
      const hasImages = editLogoFile || editCoverFile;

      // Get advisor faculty_id from societyInfo or localStorage
      let advisorFacultyId = societyInfo?.advisor_info?.faculty_id ||
        societyInfo?.advisor_faculty_id ||
        societyInfo?.faculty_id ||
        null;

      // If not found in societyInfo, try to get from localStorage
      if (!advisorFacultyId) {
        try {
          const storedSocietyData = localStorage.getItem("currentSocietyData");
          if (storedSocietyData) {
            const parsedData = JSON.parse(storedSocietyData);
            advisorFacultyId = parsedData?.advisor_info?.faculty_id ||
              parsedData?.advisor_faculty_id ||
              parsedData?.faculty_id ||
              null;
          }
        } catch (error) {
          console.error("Error parsing stored society data:", error);
        }
      }

      if (!advisorFacultyId) {
        toast.error("Advisor information not found. Cannot update society details.");
        setSavingSociety(false);
        return;
      }

      let response;
      if (hasImages) {
        const formData = new FormData();
        formData.append("name", editFormData.name);
        formData.append("description", editFormData.description);
        formData.append("category", editFormData.category);
        formData.append("location", editFormData.location);
        formData.append("purpose", editFormData.purpose);
        formData.append("advisor", String(advisorFacultyId));

        if (editLogoFile) {
          formData.append("societyLogo", editLogoFile);
        }
        if (editCoverFile) {
          formData.append("coverPhoto", editCoverFile);
        }

        response = await axios.put(
          `${API_URL}/admin/societies/${societyInfo.society_id}`,
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
          purpose: editFormData.purpose,
          advisor: advisorFacultyId,
        };

        response = await axios.put(
          `${API_URL}/admin/societies/${societyInfo.society_id}`,
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
        toast.success("Society details updated successfully!");
        setIsEditMode(false);
        setEditLogoFile(null);
        setEditCoverFile(null);
        setPreviewLogo(null);
        setPreviewCover(null);
        // Refresh society data
        await fetchSocietyData();
      } else {
        toast.error(response.data.message || "Failed to update society details");
      }
    } catch (error: any) {
      console.error("Error updating society:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update society details");
    } finally {
      setSavingSociety(false);
    }
  };

  // Fetch data when component loads or when societyId changes
  useEffect(() => {
    // First, try to load from localStorage for instant display
    const storedSocietyData = localStorage.getItem("currentSocietyData");
    if (storedSocietyData) {
      try {
        const parsedData = JSON.parse(storedSocietyData);
        setSocietyInfo(parsedData);
        console.log("Loaded society data from localStorage:", parsedData);
        // Still fetch fresh data
      } catch (e) {
        console.error("Error parsing stored society data:", e);
      }
    }

    // Fetch society data first, which will trigger fetching members and requests
    fetchSocietyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [societyId]); // Re-fetch when societyId from URL changes


  // Navigation items for mobile sidebar
  const navigationItems = [
    {
      label: "Overview",
      icon: <Activity className="h-4 w-4" />,
      onClick: () => setActiveTab("overview"),
      variant: (activeTab === "overview" ? "active" : "default") as "active" | "default" | "secondary"
    },
    {
      label: "Members",
      icon: <Users className="h-4 w-4" />,
      onClick: () => setActiveTab("members"),
      variant: (activeTab === "members" ? "active" : "default") as "active" | "default" | "secondary"
    },
    {
      label: "Requests",
      icon: <UserCheck className="h-4 w-4" />,
      onClick: () => setActiveTab("requests"),
      variant: (activeTab === "requests" ? "active" : "default") as "active" | "default" | "secondary"
    },
    {
      label: "Membership",
      icon: <Settings className="h-4 w-4" />,
      onClick: () => setActiveTab("membership"),
      variant: (activeTab === "membership" ? "active" : "default") as "active" | "default" | "secondary"
    },
    {
      label: "Event Requests",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => setActiveTab("event-requests"),
      variant: (activeTab === "event-requests" ? "active" : "default") as "active" | "default" | "secondary"
    },
    {
      label: "Posts",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => setActiveTab("posts"),
      variant: (activeTab === "posts" ? "active" : "default") as "active" | "default" | "secondary"
    },
    {
      label: "Events",
      icon: <Calendar className="h-4 w-4" />,
      onClick: () => setActiveTab("events"),
      variant: (activeTab === "events" ? "active" : "default") as "active" | "default" | "secondary"
    },
    ...(isAdvisor() ? [
      {
        label: "Cabinet",
        icon: <Crown className="h-4 w-4" />,
        onClick: () => setActiveTab("cabinet"),
        variant: (activeTab === "cabinet" ? "active" : "default") as "active" | "default" | "secondary"
      },
      {
        label: "Society Details",
        icon: <Building className="h-4 w-4" />,
        onClick: () => setActiveTab("society-details"),
        variant: (activeTab === "society-details" ? "active" : "default") as "active" | "default" | "secondary"
      }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Header */}
      <ResponsiveHeader
        title={loadingSociety ? "Loading..." : societyInfo?.name || "Society Dashboard"}
        subtitle={`${membershipRequests.filter(req => req.status === 'approved').length} members`}
        badge={{
          text: societyInfo?.status || "Active",
          variant: "secondary"
        }}
        leftContent={
          <div className="flex items-center gap-2">
            {isAdvisor() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToAdvisorDashboard}
                className="text-white hover:bg-white/20"
                title="Back to My Societies"
              >
                <ArrowLeft className="h-5 w-5 mr-1 md:mr-2" />
                <span className="hidden sm:inline">My Societies</span>
              </Button>
            )}
            <MobileSidebar trigger={
              <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/20">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            }>
              <MobileNav items={navigationItems} />
              <div className="border-t p-4">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </div>
            </MobileSidebar>
          </div>
        }
        rightContent={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/20 hidden md:flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        }
      />

      {/* Dashboard Content */}
      <section className="py-4 md:py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex flex-wrap gap-4 mb-8">
            <Button
              variant={activeTab === "overview" ? "university" : "outline"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "members" ? "university" : "outline"}
              onClick={() => setActiveTab("members")}
            >
              Members
            </Button>
            <Button
              variant={activeTab === "requests" ? "university" : "outline"}
              onClick={() => setActiveTab("requests")}
            >
              Requests
            </Button>
            <Button
              variant={activeTab === "membership" ? "university" : "outline"}
              onClick={() => setActiveTab("membership")}
            >
              Membership
            </Button>
            <Button
              variant={activeTab === "event-requests" ? "university" : "outline"}
              onClick={() => setActiveTab("event-requests")}
            >
              Event Requests
            </Button>
            <Button
              variant={activeTab === "posts" ? "university" : "outline"}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </Button>
            <Button
              variant={activeTab === "events" ? "university" : "outline"}
              onClick={() => setActiveTab("events")}
            >
              Events
            </Button>
            {isAdvisor() && (
              <>
                <Button
                  variant={activeTab === "cabinet" ? "university" : "outline"}
                  onClick={() => setActiveTab("cabinet")}
                >
                  Cabinet
                </Button>
                <Button
                  variant={activeTab === "society-details" ? "university" : "outline"}
                  onClick={() => setActiveTab("society-details")}
                >
                  Society Details
                </Button>
              </>
            )}
          </div>

          {/* Mobile Tab Indicator */}
          <div className="md:hidden mb-6">
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </Badge>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Total Members</p>
                      <p className="text-lg md:text-2xl font-bold text-university-navy">
                        {membershipRequests.filter(req => req.status === 'approved').length}
                      </p>
                    </div>
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-university-navy flex-shrink-0" />
                  </div>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Pending Requests</p>
                      <p className="text-lg md:text-2xl font-bold text-university-navy">
                        {membershipRequests.filter(req => req.status === 'pending').length}
                      </p>
                    </div>
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-university-gold flex-shrink-0" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Awaiting approval</p>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Upcoming Events</p>
                      <p className="text-lg md:text-2xl font-bold text-university-navy">
                        {events.filter(e => new Date(e.event_date) >= new Date()).length}
                      </p>
                    </div>
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-university-maroon flex-shrink-0" />
                  </div>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Total Posts</p>
                      <p className="text-lg md:text-2xl font-bold text-university-navy">
                        {posts.length}
                      </p>
                    </div>
                    <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-university-navy flex-shrink-0" />
                  </div>
                </Card>
              </div>


              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy text-sm md:text-base">Recent Posts</h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("posts")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {loadingPosts ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-university-navy mx-auto"></div>
                      </div>
                    ) : posts.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No posts yet</p>
                    ) : (
                      posts
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 5)
                        .map((post) => {
                          // Parse media_files from the media_files table
                          let mediaFiles: any[] = [];

                          if (post.media_files) {
                            if (typeof post.media_files === 'string') {
                              try {
                                mediaFiles = JSON.parse(post.media_files);
                              } catch (e) {
                                mediaFiles = [];
                              }
                            } else if (Array.isArray(post.media_files)) {
                              mediaFiles = post.media_files;
                            }
                          }

                          // Filter to only show images in overview
                          const imageFiles = mediaFiles.filter((file: any) =>
                            file && file.file_type === 'image' && file.file_url
                          );

                          const API_URL = import.meta.env.VITE_API_URL;

                          // Process image URLs to ensure they're properly formatted
                          const processedImages = imageFiles.map((file: any) => {
                            let imageUrl = file.file_url.trim();
                            if (!imageUrl.startsWith('http')) {
                              // Convert Windows path to URL format
                              const cleanPath = imageUrl.replace(/\\/g, '/');
                              // Handle both absolute and relative paths
                              if (cleanPath.includes('assets/')) {
                                imageUrl = `${API_URL}/${cleanPath.replace(/^.*?\/assets\//, 'assets/')}`;
                              } else if (cleanPath.startsWith('/')) {
                                imageUrl = `${API_URL}${cleanPath}`;
                              } else {
                                imageUrl = `${API_URL}/assets/${cleanPath}`;
                              }
                            }
                            return { ...file, processedUrl: imageUrl };
                          });

                          return (
                            <div key={post.post_id} className="border-b pb-4 last:border-0 space-y-2">
                              <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                              {post.content && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {post.content}
                                </p>
                              )}

                              {/* Display Images */}
                              {processedImages.length > 0 && (
                                <div className={`grid gap-2 mb-2 ${processedImages.length === 1
                                  ? 'grid-cols-1'
                                  : processedImages.length === 2
                                    ? 'grid-cols-2'
                                    : 'grid-cols-3'
                                  }`}>
                                  {processedImages.slice(0, 4).map((file: any, index: number) => (
                                    <div
                                      key={file.media_id || index}
                                      className="relative group overflow-hidden rounded-lg border border-gray-200 hover:border-university-navy/50 transition-all cursor-pointer"
                                      onClick={() => setViewingMedia({
                                        url: file.processedUrl,
                                        type: 'image',
                                        files: processedImages,
                                        currentIndex: index
                                      })}
                                    >
                                      <img
                                        src={file.processedUrl}
                                        alt={`Post image ${index + 1}`}
                                        className="w-full h-24 md:h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                          console.error('Image failed to load:', file.processedUrl);
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                      {processedImages.length > 4 && index === 3 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold backdrop-blur-sm">
                                          +{processedImages.length - 4} more
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {post.like_count || 0}
                                  </div>
                                  <div className="flex items-center">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {post.comment_count || 0}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy text-sm md:text-base">Approved Events</h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("events")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {loadingEvents ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-university-navy mx-auto"></div>
                      </div>
                    ) : events.filter(e => e.status_id === 10 && e.source_table === 'event_req').length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No approved events</p>
                    ) : (
                      events
                        .filter(e => e.status_id === 10 && e.source_table === 'event_req')
                        .sort((a, b) => new Date(b.created_at || b.event_date).getTime() - new Date(a.created_at || a.event_date).getTime())
                        .slice(0, 3)
                        .map((event, index) => (
                          <div key={event.id || index} className="border-b pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              <Badge variant="default" className="text-xs">
                                {event.status_name || event.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {new Date(event.event_date).toLocaleDateString()}
                              {event.event_time && ` • ${event.event_time}`}
                              {event.venue && ` • ${event.venue}`}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-university-navy">Member Management</h2>
                <Button variant="university" size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>

              {/* Approved Members */}
              <Card className="p-4 md:p-6 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h3 className="font-semibold text-university-navy text-sm md:text-base">
                    Approved Members ({membershipRequests.filter(req => req.status === 'approved').length})
                  </h3>
                  {/* <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchMembershipRequests()}
                    disabled={loadingRequests}
                    className="w-full sm:w-auto"
                  >
                    {loadingRequests ? "Refreshing..." : "Export Results"}
                  </Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchMembershipRequests()}
                    disabled={loadingRequests}
                    className="w-full sm:w-auto"
                  >
                    {loadingRequests ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>

                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading members...</p>
                  </div>
                ) : membershipRequests.filter(req => req.status === 'approved').length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-university-navy mb-2">No Approved Members</h3>
                    <p className="text-sm text-muted-foreground">
                      There are no approved members in this society yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {membershipRequests.filter(req => req.status === 'approved').map((member, index) => (
                      <Card key={index} className="p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-university-navy/30 bg-gradient-to-br from-white to-gray-50/50">
                        <div className="space-y-3">
                          {/* Header with Avatar and Status */}
                          <div className="flex items-start space-x-3">
                            <div className="bg-gradient-to-br from-university-navy to-university-navy/80 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0 shadow-md">
                              {(member.firstName || 'M')?.charAt(0).toUpperCase()}{(member.lastName || 'M')?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-base md:text-lg text-university-navy truncate">
                                    {member.firstName} {member.lastName}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Student Member
                                  </p>
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs ml-2 flex-shrink-0 shadow-sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 text-university-navy/60" />
                              <span className="truncate">{member.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4 text-university-navy/60" />
                              <span>{member.major || member.department || 'Department not specified'}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 text-university-navy/60" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Member since {member.submitted_at ? new Date(member.submitted_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}</span>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Online</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-university-navy">Membership Requests</h2>
                {/* <Button variant="university" size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Export Requests
                </Button> */}
              </div>

              {/* Membership Requests */}
              <Card className="p-4 md:p-6 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h3 className="font-semibold text-university-navy text-sm md:text-base">
                    Pending Membership Requests ({membershipRequests.filter(req => req.status === 'pending').length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchMembershipRequests()}
                    disabled={loadingRequests}
                    className="w-full sm:w-auto"
                  >
                    {loadingRequests ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>

                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading membership requests...</p>
                  </div>
                ) : membershipRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-university-navy mb-2">No Membership Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      There are no membership requests at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {membershipRequests.map((request, index) => {
                      // Get student name from membership_requests table (full_name) or fallback to adm_std
                      const studentName = request.full_name || request.firstName || request.NM || 'Student';
                      const department = request.request_department || request.department || request.DEPARTMENT || 'N/A';

                      return (
                        <Card key={index} className="p-5 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-university-navy/50 bg-white">
                          <div className="flex items-center justify-between">
                            {/* Left: Avatar and Info */}
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="bg-gradient-to-br from-university-navy to-university-navy/80 text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-bold text-lg md:text-xl flex-shrink-0 shadow-lg">
                                {studentName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base md:text-lg text-university-navy mb-1 truncate">
                                  {studentName}
                                </h4>
                                <p className="text-sm text-muted-foreground font-medium">
                                  {department}
                                </p>
                              </div>
                            </div>

                            {/* Right: Status Badge and Menu */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Badge
                                variant={request.status === 'pending' ? 'secondary' :
                                  request.status === 'approved' ? 'default' : 'destructive'}
                                className="text-xs shadow-sm"
                              >
                                {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                              </Badge>

                              {/* 3 Dots Menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 hover:bg-gray-100"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => setViewingRequestDetails(request)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {request.status === 'pending' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleApproveRequest(request.request_id)}
                                        className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeclineRequest(request.request_id)}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Decline
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* View Request Details Dialog */}
              <Dialog open={viewingRequestDetails !== null} onOpenChange={(open) => {
                if (!open) setViewingRequestDetails(null);
              }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  {viewingRequestDetails && (
                    <>
                      <DialogHeader>
                        <DialogTitle>Membership Request Details</DialogTitle>
                        <DialogDescription>
                          Complete information about the membership request
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h3 className="font-semibold text-university-navy mb-3">Personal Information</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-br from-university-navy to-university-navy/80 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-md">
                                {(viewingRequestDetails.full_name || viewingRequestDetails.firstName || viewingRequestDetails.NM || 'S')?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg text-university-navy">
                                  {viewingRequestDetails.full_name || viewingRequestDetails.firstName || viewingRequestDetails.NM || 'Student'}
                                </h4>
                                <Badge
                                  variant={viewingRequestDetails.status === 'pending' ? 'secondary' :
                                    viewingRequestDetails.status === 'approved' ? 'default' : 'destructive'}
                                  className="mt-1"
                                >
                                  {viewingRequestDetails.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                  {viewingRequestDetails.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {viewingRequestDetails.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                  {viewingRequestDetails.status?.charAt(0).toUpperCase() + viewingRequestDetails.status?.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div>
                          <h3 className="font-semibold text-university-navy mb-3">Contact Details</h3>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-4 w-4 text-university-navy/60 flex-shrink-0" />
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium">{viewingRequestDetails.request_email || viewingRequestDetails.email || viewingRequestDetails.EMAIL || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-4 w-4 text-university-navy/60 flex-shrink-0" />
                              <span className="text-muted-foreground">Phone:</span>
                              <span className="font-medium">{viewingRequestDetails.request_phone || viewingRequestDetails.phone || viewingRequestDetails.MOB || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                          <h3 className="font-semibold text-university-navy mb-3">Academic Information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Department</p>
                              <p className="font-medium">{viewingRequestDetails.request_department || viewingRequestDetails.department || viewingRequestDetails.DEPARTMENT || 'N/A'}</p>
                            </div>
                            {(viewingRequestDetails.rollNo || viewingRequestDetails.ROLNO || viewingRequestDetails.rollno) && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Roll Number</p>
                                <p className="font-medium">{viewingRequestDetails.rollNo || viewingRequestDetails.ROLNO || viewingRequestDetails.rollno}</p>
                              </div>
                            )}
                            {(viewingRequestDetails.session || viewingRequestDetails.SESSION) && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Session</p>
                                <p className="font-medium">{viewingRequestDetails.session || viewingRequestDetails.SESSION}</p>
                              </div>
                            )}
                            {(viewingRequestDetails.major || viewingRequestDetails.MAJOR) && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Major</p>
                                <p className="font-medium">{viewingRequestDetails.major || viewingRequestDetails.MAJOR}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment Receipt */}
                        {viewingRequestDetails.payment_receipt && (
                          <div>
                            <h3 className="font-semibold text-university-navy mb-3">Payment Receipt</h3>
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-university-navy/60" />
                                  <div>
                                    <p className="text-sm font-medium text-university-navy">
                                      Payment Receipt File
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {viewingRequestDetails.payment_receipt.split('/').pop() || viewingRequestDetails.payment_receipt}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const fileUrl = viewingRequestDetails.payment_receipt;
                                      // Handle both relative and absolute paths
                                      const fullUrl = fileUrl.startsWith('http')
                                        ? fileUrl
                                        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
                                      window.open(fullUrl, '_blank');
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const fileUrl = viewingRequestDetails.payment_receipt;
                                      // Handle both relative and absolute paths
                                      const fullUrl = fileUrl.startsWith('http')
                                        ? fileUrl
                                        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
                                      const link = document.createElement('a');
                                      link.href = fullUrl;
                                      link.download = viewingRequestDetails.payment_receipt.split('/').pop() || 'payment-receipt';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message */}
                        {viewingRequestDetails.message && (
                          <div>
                            <h3 className="font-semibold text-university-navy mb-3">Message</h3>
                            <div className="bg-gradient-to-r from-university-navy/5 to-university-gold/5 p-4 rounded-lg border border-university-navy/10">
                              <p className="text-sm text-muted-foreground italic">
                                "{viewingRequestDetails.message}"
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Request Information */}
                        <div>
                          <h3 className="font-semibold text-university-navy mb-3">Request Information</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Submitted:</span>
                              <span className="font-medium">
                                {viewingRequestDetails.submitted_at
                                  ? new Date(viewingRequestDetails.submitted_at).toLocaleString()
                                  : 'Unknown'}
                              </span>
                            </div>
                            {viewingRequestDetails.request_id && (
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Request ID:</span>
                                <span className="font-medium">#{viewingRequestDetails.request_id}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {viewingRequestDetails.status === 'pending' && (
                          <div className="flex gap-3 pt-4 border-t">
                            <Button
                              variant="university"
                              onClick={() => {
                                handleApproveRequest(viewingRequestDetails.request_id);
                                setViewingRequestDetails(null);
                              }}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept Request
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                handleDeclineRequest(viewingRequestDetails.request_id);
                                setViewingRequestDetails(null);
                              }}
                              className="flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline Request
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              {/* Request Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Pending Requests</p>
                      <p className="text-lg md:text-2xl font-bold text-university-navy">
                        {membershipRequests.filter(req => req.status === 'pending').length}
                      </p>
                    </div>
                    <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Awaiting review</p>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Approved</p>
                      <p className="text-lg md:text-2xl font-bold text-green-600">
                        {membershipRequests.filter(req => req.status === 'approved').length}
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">This month</p>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Rejected</p>
                      <p className="text-lg md:text-2xl font-bold text-red-600">
                        {membershipRequests.filter(req => req.status === 'rejected').length}
                      </p>
                    </div>
                    <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">This month</p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "event-requests" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-university-navy">
                  Event Requests
                </h2>
                <Button
                  variant="university"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => navigate("/dashboard/society/event-request/create")}
                  disabled={!societyInfo?.society_id}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event Request
                </Button>
              </div>

              {societyInfo?.society_id ? (
                <EventRequestsList
                  key={eventRequestsRefreshKey}
                  societyId={societyInfo.society_id}
                />
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Society information is still loading. Please wait a moment and try again.
                  </p>
                </Card>
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-university-navy">Society Posts</h2>
                <Button
                  variant="university"
                  size="sm"
                  onClick={() => navigate("/society/post/create", {
                    state: {
                      society_id: societyInfo?.society_id,
                      society_name: societyInfo?.name
                    }
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>

              {loadingPosts ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <Card className="p-8 text-center shadow-card">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-university-navy mb-2">No Posts Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start engaging with your members by creating your first post!
                  </p>
                  <Button
                    variant="university"
                    onClick={() => navigate("/society/post/create", {
                      state: {
                        society_id: societyInfo?.society_id,
                        society_name: societyInfo?.name
                      }
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Card key={post.post_id} className="p-6 shadow-card">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-university-navy text-white">
                              {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-university-navy">
                              {post.author_name || 'Anonymous'}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              <Badge variant="outline" className="text-xs">
                                {post.post_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2 text-university-navy">{post.title}</h3>

                        {post.post_type === 'text' && (
                          <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                        )}

                        {(() => {
                          // Parse media_files from the media_files table
                          let mediaFiles: any[] = [];

                          if (post.media_files) {
                            if (typeof post.media_files === 'string') {
                              try {
                                mediaFiles = JSON.parse(post.media_files);
                              } catch (e) {
                                mediaFiles = [];
                              }
                            } else if (Array.isArray(post.media_files)) {
                              mediaFiles = post.media_files;
                            }
                          }

                          // Filter out NULL values
                          mediaFiles = mediaFiles.filter((file: any) => file && file.media_id);

                          const API_URL = import.meta.env.VITE_API_URL;

                          // Process media files to ensure URLs are properly formatted
                          const processedFiles = mediaFiles.map((file: any) => {
                            let processedUrl = file.file_url.trim();
                            if (!processedUrl.startsWith('http')) {
                              const cleanPath = processedUrl.replace(/\\/g, '/');
                              if (cleanPath.includes('assets/')) {
                                processedUrl = `${API_URL}/${cleanPath.replace(/^.*?\/assets\//, 'assets/')}`;
                              } else if (cleanPath.startsWith('/')) {
                                processedUrl = `${API_URL}${cleanPath}`;
                              } else {
                                processedUrl = `${API_URL}/assets/${cleanPath}`;
                              }
                            }
                            return { ...file, processedUrl };
                          });

                          // Group files by type
                          const imageFiles = processedFiles.filter((f: any) => f.file_type === 'image');
                          const videoFiles = processedFiles.filter((f: any) => f.file_type === 'video');
                          const documentFiles = processedFiles.filter((f: any) => f.file_type === 'document');

                          return (
                            <>
                              {imageFiles.length > 0 && (
                                <div className="space-y-3">
                                  {post.content && (
                                    <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                                  )}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {imageFiles.map((file: any, index: number) => (
                                      <div
                                        key={file.media_id}
                                        className="cursor-pointer rounded-lg border overflow-hidden hover:border-university-navy/50 transition-all"
                                        onClick={() => setViewingMedia({
                                          url: file.processedUrl,
                                          type: 'image',
                                          files: imageFiles,
                                          currentIndex: index
                                        })}
                                      >
                                        <img
                                          src={file.processedUrl}
                                          alt={`Post image ${file.media_id}`}
                                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            console.error('Image failed to load:', file.processedUrl);
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {videoFiles.length > 0 && (
                                <div className="space-y-3">
                                  {post.content && (
                                    <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                                  )}
                                  {videoFiles.map((file: any, index: number) => (
                                    <div
                                      key={file.media_id}
                                      className="cursor-pointer rounded-lg border overflow-hidden hover:border-university-navy/50 transition-all"
                                      onClick={() => setViewingMedia({
                                        url: file.processedUrl,
                                        type: 'video',
                                        files: videoFiles,
                                        currentIndex: index
                                      })}
                                    >
                                      <video
                                        src={file.processedUrl}
                                        controls
                                        className="w-full max-w-md rounded-lg"
                                        onError={(e) => {
                                          console.error('Video failed to load:', file.processedUrl);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {documentFiles.length > 0 && (
                                <div className="space-y-3">
                                  {post.content && (
                                    <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                                  )}
                                  {documentFiles.map((file: any) => (
                                    <div
                                      key={file.media_id}
                                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                      onClick={() => window.open(file.processedUrl, '_blank')}
                                    >
                                      <FileText className="h-5 w-5 text-university-navy" />
                                      <span className="flex-1 text-sm text-muted-foreground truncate">
                                        {file.file_url.split('/').pop()}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(file.processedUrl, '_blank');
                                        }}
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {post.post_type === 'poll' && post.poll_data && (
                          <div className="space-y-4 bg-gradient-to-br from-gray-50 to-white p-5 rounded-lg border border-gray-200">
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-university-navy/10 rounded-lg">
                                <BarChartIcon className="h-5 w-5 text-university-navy" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {post.poll_data.question || post.content || "Poll"}
                                </h3>
                                <p className="text-sm text-muted-foreground">Cast your vote below</p>
                              </div>
                            </div>
                            {post.poll_data.options && post.poll_data.options.length > 0 && (() => {
                              const totalVotes = post.poll_data.options.reduce((sum: number, option: any) => sum + (option.vote_count || 0), 0);
                              const pollId = post.poll_data.poll_id || post.poll_id;

                              return (
                                <div className="space-y-3 mt-4">
                                  {post.poll_data.options.map((option: any, index: number) => {
                                    const voteCount = option.vote_count || 0;
                                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                                    const isVoted = option.user_voted || false;
                                    const isLeading = totalVotes > 0 && voteCount === Math.max(...post.poll_data.options.map((opt: any) => opt.vote_count || 0));

                                    return (
                                      <div
                                        key={option.option_id}
                                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                                          isVoted 
                                            ? 'border-university-navy bg-university-navy/10 shadow-md hover:shadow-lg' 
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        } ${isLeading && totalVotes > 0 ? 'ring-2 ring-university-gold/30' : ''}`}
                                        onClick={() => {
                                          const handlePollVote = async (postId: number, optionId: number, pollId: number) => {
                                            try {
                                              const token = localStorage.getItem("token");
                                              if (!token) {
                                                toast.error("Please login to vote");
                                                return;
                                              }

                                              const response = await axios.post(
                                                `${import.meta.env.VITE_API_URL}/user/poll/vote`,
                                                { option_id: optionId, poll_id: pollId },
                                                {
                                                  headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                  }
                                                }
                                              );

                                              if (response.data.success && societyInfo?.society_id) {
                                                fetchSocietyPosts(societyInfo.society_id);
                                                toast.success("Vote submitted successfully");
                                              } else {
                                                toast.error(response.data.message || "Failed to submit vote");
                                              }
                                            } catch (error: any) {
                                              console.error('Error voting on poll:', error);
                                              toast.error(error.response?.data?.message || "Failed to submit vote");
                                            }
                                          };
                                          handlePollVote(post.post_id, option.option_id, pollId);
                                        }}
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center space-x-3 flex-1">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                              isVoted 
                                                ? 'bg-university-navy text-white' 
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                              {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className={`font-medium text-base flex-1 ${
                                              isVoted ? 'text-university-navy' : 'text-gray-900'
                                            }`}>
                                              {option.option_text}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-3 ml-4">
                                            {isLeading && totalVotes > 0 && (
                                              <Badge variant="outline" className="bg-university-gold/10 text-university-gold border-university-gold/30">
                                                Leading
                                              </Badge>
                                            )}
                                            <div className="text-right">
                                              <div className={`text-sm font-semibold ${isVoted ? 'text-university-navy' : 'text-gray-700'}`}>
                                                {percentage.toFixed(1)}%
                                              </div>
                                              <div className="text-xs text-muted-foreground">
                                                {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                                              </div>
                                            </div>
                                            {isVoted && (
                                              <div className="flex-shrink-0">
                                                <CheckCircle className="h-5 w-5 text-university-navy" />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="relative">
                                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                              className={`h-full rounded-full transition-all duration-500 ${
                                                isVoted 
                                                  ? 'bg-university-navy' 
                                                  : 'bg-gradient-to-r from-gray-300 to-gray-400'
                                              }`}
                                              style={{ width: `${percentage}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      <BarChartIcon className="h-4 w-4" />
                                      <span className="font-medium">
                                        {totalVotes} {totalVotes === 1 ? 'total vote' : 'total votes'}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      <span>{post.poll_data.options.length} {post.poll_data.options.length === 1 ? 'option' : 'options'}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                            
                            {(!post.poll_data.options || post.poll_data.options.length === 0) && (
                              <div className="text-center py-8 text-muted-foreground">
                                <BarChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No poll options available</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${post.is_liked_by_user === true || likedPosts[post.post_id] === true
                            ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-muted-foreground hover:text-university-navy hover:bg-university-navy/5'
                            }`}
                          onClick={() => handleLike(post.post_id)}
                          disabled={likingPost === post.post_id}
                        >
                          {likingPost === post.post_id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : post.is_liked_by_user === true || likedPosts[post.post_id] === true ? (
                            <Heart className="h-4 w-4 mr-2 fill-current" />
                          ) : (
                            <ThumbsUp className="h-4 w-4 mr-2" />
                          )}
                          Like ({post.like_count || 0})
                        </Button>

                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-university-navy">Society Events</h2>
              </div>

              {loadingEvents ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <Card className="p-8 text-center shadow-card">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-university-navy mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground">
                    No events have been created for this society yet.
                  </p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card key={event.id} className="p-6 shadow-card hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-university-navy flex-1">{event.title}</h3>
                        <Badge
                          variant={
                            event.status_id === 12 ? "default" : 
                            event.status_id === 13 ? "secondary" : 
                            event.status_id === 11 ? "default" : 
                            event.status_id === 10 ? "default" : 
                            "outline"
                          }
                          className={`text-xs ${
                            event.status_id === 12 ? "bg-green-100 text-green-800" :
                            event.status_id === 13 ? "bg-yellow-100 text-yellow-800" :
                            event.status_id === 11 ? "bg-purple-100 text-purple-800" :
                            event.status_id === 10 ? "bg-blue-100 text-blue-800" :
                            ""
                          }`}
                        >
                          {event.status_name || event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {event.description}
                      </p>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(event.event_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                        {event.event_time && (
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{event.event_time}</span>
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                      </div>
                      {/* Mark as Complete Button - Only show for Approved events (status_id = 10) */}
                      {event.status_id === 10 && event.source_table === 'event_req' && isAdvisor() && (
                        <Button
                          variant="university"
                          size="sm"
                          className="w-full"
                          onClick={async () => {
                            try {
                              setCompletingEvent(event.id);
                              const API_URL = import.meta.env.VITE_API_URL;
                              const token = localStorage.getItem("token");

                              if (!token) {
                                toast.error("Authentication required");
                                return;
                              }

                              const response = await axios.post(
                                `${API_URL}/society/event-request/complete`,
                                { event_req_id: event.id },
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                              if (response.data.success) {
                                toast.success("Event marked as completed. Report missing.");
                                fetchSocietyEvents(societyInfo?.society_id); // Refresh events list
                              } else {
                                toast.error(response.data.message || "Failed to mark event as complete");
                              }
                            } catch (error: any) {
                              console.error("Error marking event as complete:", error);
                              toast.error(error.response?.data?.message || "Failed to mark event as complete");
                            } finally {
                              setCompletingEvent(null);
                            }
                          }}
                          disabled={completingEvent === event.id}
                        >
                          {completingEvent === event.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Marking...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Complete
                            </>
                          )}
                        </Button>
                      )}
                      {/* Upload Report Button - Only show for Report Missing events (status_id = 13) */}
                      {event.status_id === 13 && event.source_table === 'event_req' && isAdvisor() && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-green-500 text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setSelectedEventForReport({ id: event.id, title: event.title });
                            setIsReportUploadOpen(true);
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Report
                        </Button>
                      )}
                      {/* Complete - Show for status_id = 11 */}
                      {event.status_id === 11 && (
                        <div className="flex items-center justify-center text-sm text-purple-600 bg-purple-50 rounded-lg p-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </div>
                      )}
                      {/* Report Submitted - Show for status_id = 12 */}
                      {event.status_id === 12 && (
                        <div className="flex items-center justify-center text-sm text-green-600 bg-green-50 rounded-lg p-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Report Submitted
                        </div>
                      )}
                      {/* Report Missing - Show for status_id = 13 */}
                      {event.status_id === 13 && !isAdvisor() && (
                        <div className="flex items-center justify-center text-sm text-yellow-600 bg-yellow-50 rounded-lg p-2">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Report Missing
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "membership" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-university-navy">Membership Management</h2>
                <div className="text-sm text-muted-foreground">
                  Current Fee: <span className="font-semibold text-university-navy">PKR {membershipFee}</span>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Fee Management Card */}
                <div className="lg:col-span-1">
                  <Card className="p-6 shadow-card">
                    <h3 className="font-semibold mb-4 text-university-navy">Fee Management</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Current Membership Fee</Label>
                        <div className="text-2xl font-bold text-university-navy">PKR {membershipFee}</div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newFee">Update Fee (PKR)</Label>
                        <Input
                          id="newFee"
                          type="number"
                          placeholder="Enter new fee amount"
                          value={membershipFee}
                          onChange={(e) => handleFeeUpdate(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Account Details Card */}
                  <Card className="p-6 shadow-card mt-6">
                    <h3 className="font-semibold mb-4 text-university-navy">Account Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          type="text"
                          placeholder="Enter account number"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountTitle">Account Title</Label>
                        <Input
                          id="accountTitle"
                          type="text"
                          placeholder="Enter account title"
                          value={accountTitle}
                          onChange={(e) => setAccountTitle(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => saveMembershipSettings()}
                        className="w-full"
                      >
                        Update Settings
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Membership Form Preview */}
                <div className="lg:col-span-2">
                  <Card className="p-6 shadow-card">
                    <h3 className="font-semibold mb-4 text-university-navy">Membership Registration Form</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Form Fields</Label>
                          <ul className="text-sm space-y-1 mt-2">
                            <li>• Full Name</li>
                            <li>• Email Address</li>
                            <li>• Phone Number</li>
                            <li>• Address</li>
                            <li>• University</li>
                            <li>• Department</li>
                            <li>• Semester</li>
                            <li>• Payment Receipt</li>
                          </ul>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Current Settings</Label>
                          <ul className="text-sm space-y-1 mt-2">
                            <li>• Membership Fee: PKR {membershipFee}</li>
                            <li>• Payment Required: Yes</li>
                            <li>• File Upload: Enabled</li>
                            <li>• Form Status: Active</li>
                          </ul>
                        </div>
                      </div>

                      {/* Account Details Section */}
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <Label className="text-sm text-muted-foreground">Payment Information</Label>
                          <div className="mt-2 space-y-2">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground">Account Number</p>
                              <p className="text-sm font-medium">
                                {accountNumber || "Not set"}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground">Account Title</p>
                              <p className="text-sm font-medium">
                                {accountTitle || "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Payment Instructions</Label>
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            <p>• Deposit PKR {membershipFee} to the above account</p>
                            <p>• Upload payment receipt in the form</p>
                            <p>• Account details will be shown on the form</p>
                            <p>• Keep receipt for your records</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            // Store settings in localStorage to pass to registration form
                            const settingsData = {
                              society_id: societyInfo?.society_id,
                              membership_fee: membershipFee,
                              account_number: accountNumber,
                              account_title: accountTitle,
                              society_name: societyInfo?.name
                            };
                            localStorage.setItem('membershipSettings', JSON.stringify(settingsData));
                            navigate(`/membership/register/${societyInfo?.society_id}`);
                          }}
                        >
                          View Registration Form
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Society Details Tab - Only for Advisors */}
          {isAdvisor() && activeTab === "cabinet" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-university-navy">Cabinet Management</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Year Filter */}
                  <Select value={cabinetYearFilter} onValueChange={(value) => {
                    setCabinetYearFilter(value);
                    if (societyInfo?.society_id) {
                      fetchCabinetMembers(societyInfo.society_id, value, showArchivedCabinet);
                    }
                  }}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  {/* Archive Toggle */}
                  <Button
                    variant={showArchivedCabinet ? "default" : "outline"}
                    onClick={() => {
                      const newShowArchived = !showArchivedCabinet;
                      setShowArchivedCabinet(newShowArchived);
                      if (societyInfo?.society_id) {
                        fetchCabinetMembers(societyInfo.society_id, cabinetYearFilter, newShowArchived);
                      }
                    }}
                  >
                    {showArchivedCabinet ? "Show Active" : "Show Archived"}
                  </Button>
                  
                  <Button
                    variant="university"
                    onClick={() => {
                      setEditingCabinetMember(null);
                      setCabinetFormData({ 
                        name: "", 
                        designation: "", 
                        tenure_start: new Date().getFullYear().toString(), 
                        tenure_end: (new Date().getFullYear() + 1).toString() 
                      });
                      setIsCabinetModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Cabinet Member
                  </Button>
                </div>
              </div>

              {loadingCabinet ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading cabinet members...</p>
                </div>
              ) : (showArchivedCabinet ? archivedCabinetMembers : cabinetMembers).length === 0 ? (
                <Card className="p-8 text-center shadow-card">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-university-navy mb-2">
                    {showArchivedCabinet ? "No Archived Cabinet Members" : "No Cabinet Members"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {showArchivedCabinet 
                      ? "No archived cabinet members found for the selected year."
                      : "Start building your cabinet by adding members."}
                  </p>
                  {!showArchivedCabinet && (
                    <Button
                      variant="university"
                      onClick={() => {
                        setEditingCabinetMember(null);
                        setCabinetFormData({ 
                          name: "", 
                          designation: "", 
                          tenure_start: new Date().getFullYear().toString(), 
                          tenure_end: (new Date().getFullYear() + 1).toString() 
                        });
                        setIsCabinetModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Member
                    </Button>
                  )}
                </Card>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(showArchivedCabinet ? archivedCabinetMembers : cabinetMembers).map((member) => (
                      <Card key={member.id} className={`p-6 shadow-card hover:shadow-lg transition-shadow ${member.is_archived ? 'opacity-75 border-2 border-gray-300' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.is_archived ? 'bg-gray-200' : 'bg-university-navy/10'}`}>
                              <Crown className={`h-6 w-6 ${member.is_archived ? 'text-gray-500' : 'text-university-navy'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-university-navy truncate">{member.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">{member.designation}</p>
                              {member.tenure_start && member.tenure_end && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Tenure: {member.tenure_start} - {member.tenure_end}
                                </p>
                              )}
                            </div>
                          </div>
                          {member.is_archived && (
                            <Badge variant="secondary" className="ml-2">Archived</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Added {new Date(member.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCabinetMember(member);
                                setCabinetFormData({
                                  name: member.name,
                                  designation: member.designation,
                                  tenure_start: member.tenure_start?.toString() || new Date().getFullYear().toString(),
                                  tenure_end: member.tenure_end?.toString() || (new Date().getFullYear() + 1).toString()
                                });
                                setIsCabinetModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchiveCabinetMember(member.id, member.is_archived === 1)}
                              className={member.is_archived ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"}
                              title={member.is_archived ? "Unarchive" : "Archive"}
                            >
                              {member.is_archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivateCabinetMember(member.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Add/Edit Cabinet Member Modal */}
              <Dialog open={isCabinetModalOpen} onOpenChange={setIsCabinetModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCabinetMember ? "Edit Cabinet Member" : "Add Cabinet Member"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCabinetMember
                        ? "Update the cabinet member's information."
                        : "Add a new member to the society cabinet."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cabinet-name">Name</Label>
                      <Input
                        id="cabinet-name"
                        placeholder="Enter member name"
                        value={cabinetFormData.name}
                        onChange={(e) => setCabinetFormData({ ...cabinetFormData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cabinet-designation">Designation</Label>
                      <Input
                        id="cabinet-designation"
                        placeholder="e.g., President, Vice President, Secretary"
                        value={cabinetFormData.designation}
                        onChange={(e) => setCabinetFormData({ ...cabinetFormData, designation: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cabinet-tenure-start">Tenure Start Year</Label>
                        <Input
                          id="cabinet-tenure-start"
                          type="number"
                          placeholder="e.g., 2024"
                          value={cabinetFormData.tenure_start}
                          onChange={(e) => setCabinetFormData({ ...cabinetFormData, tenure_start: e.target.value })}
                          min="2000"
                          max="2100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cabinet-tenure-end">Tenure End Year</Label>
                        <Input
                          id="cabinet-tenure-end"
                          type="number"
                          placeholder="e.g., 2025"
                          value={cabinetFormData.tenure_end}
                          onChange={(e) => setCabinetFormData({ ...cabinetFormData, tenure_end: e.target.value })}
                          min="2000"
                          max="2100"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCabinetModalOpen(false);
                          setEditingCabinetMember(null);
                          setCabinetFormData({ 
                            name: "", 
                            designation: "", 
                            tenure_start: new Date().getFullYear().toString(), 
                            tenure_end: (new Date().getFullYear() + 1).toString() 
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="university"
                        onClick={handleSaveCabinetMember}
                        disabled={!cabinetFormData.name.trim() || !cabinetFormData.designation.trim() || !cabinetFormData.tenure_start || !cabinetFormData.tenure_end}
                      >
                        {editingCabinetMember ? "Update" : "Add"} Member
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {isAdvisor() && activeTab === "society-details" && (
            <div className="space-y-6">
              {loadingSociety ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading society details...</p>
                </div>
              ) : societyInfo ? (
                <div className="space-y-6">
                  {/* Header with Edit Button */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-university-navy">Society Details</h2>
                    {!isEditMode ? (
                      <Button
                        variant="university"
                        onClick={() => {
                          setIsEditMode(true);
                          setEditFormData({
                            name: societyInfo.name || "",
                            description: societyInfo.description || "",
                            category: societyInfo.category || "",
                            location: societyInfo.location || "",
                            purpose: societyInfo.purpose || "",
                          });
                          setPreviewLogo(societyInfo.society_logo ? `${import.meta.env.VITE_API_URL}/${societyInfo.society_logo}` : null);
                          setPreviewCover(societyInfo.cover_photo ? `${import.meta.env.VITE_API_URL}/${societyInfo.cover_photo}` : null);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditMode(false);
                            setEditLogoFile(null);
                            setEditCoverFile(null);
                            setPreviewLogo(null);
                            setPreviewCover(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          variant="university"
                          onClick={handleUpdateSociety}
                          disabled={savingSociety}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {savingSociety ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Cover Photo */}
                  {!isEditMode && societyInfo.cover_photo && (
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${societyInfo.cover_photo}`}
                        alt={societyInfo.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {isEditMode && (
                    <Card className="p-6">
                      <Label className="text-base font-semibold mb-3 block">Cover Photo</Label>
                      <div className="space-y-4">
                        {(previewCover || editCoverFile) && (
                          <div className="relative h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                            <img
                              src={previewCover || (editCoverFile ? URL.createObjectURL(editCoverFile) : "")}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setEditCoverFile(file);
                                setPreviewCover(URL.createObjectURL(file));
                              }
                            }}
                            className="flex-1"
                          />
                          {previewCover && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditCoverFile(null);
                                setPreviewCover(societyInfo.cover_photo ? `${import.meta.env.VITE_API_URL}/${societyInfo.cover_photo}` : null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Society Basic Info */}
                  <Card className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {!isEditMode && societyInfo.society_logo && (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${societyInfo.society_logo}`}
                          alt={societyInfo.name}
                          className="w-20 h-20 rounded-lg object-cover border-2 border-university-gold"
                        />
                      )}
                      {isEditMode && (
                        <div className="space-y-2">
                          <Label>Society Logo</Label>
                          <div className="space-y-2">
                            {(previewLogo || editLogoFile) && (
                              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                                <img
                                  src={previewLogo || (editLogoFile ? URL.createObjectURL(editLogoFile) : "")}
                                  alt="Logo preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setEditLogoFile(file);
                                    setPreviewLogo(URL.createObjectURL(file));
                                  }
                                }}
                                className="flex-1"
                              />
                              {previewLogo && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditLogoFile(null);
                                    setPreviewLogo(societyInfo.society_logo ? `${import.meta.env.VITE_API_URL}/${societyInfo.society_logo}` : null);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        {!isEditMode ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <h2 className="text-2xl font-bold text-university-navy">{societyInfo.name}</h2>
                              <Badge variant="secondary">{societyInfo.status_name || "Active"}</Badge>
                              <Badge variant="outline">{societyInfo.category}</Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {societyInfo.location}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              Created: {new Date(societyInfo.created_at || '').toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="name">Society Name *</Label>
                              <Input
                                id="name"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                placeholder="Enter society name"
                              />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                  value={editFormData.category}
                                  onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="University Level">University Level</SelectItem>
                                    <SelectItem value="Intermediate Level">Intermediate Level</SelectItem>
                                    <SelectItem value="Department Level">Department Level</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                  id="location"
                                  value={editFormData.location}
                                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                                  placeholder="Enter location"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Description */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Description
                    </h3>
                    {!isEditMode ? (
                      <p className="text-muted-foreground leading-relaxed">{societyInfo.description}</p>
                    ) : (
                      <Textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        placeholder="Enter society description"
                        rows={5}
                      />
                    )}
                  </Card>

                  {/* Purpose */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-3 text-university-navy flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Purpose
                    </h3>
                    {!isEditMode ? (
                      <p className="text-muted-foreground leading-relaxed">{societyInfo.purpose}</p>
                    ) : (
                      <Textarea
                        value={editFormData.purpose}
                        onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                        placeholder="Enter society purpose"
                        rows={5}
                      />
                    )}
                  </Card>
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Society Information</h3>
                  <p className="text-muted-foreground">Society details not available.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Event Report Upload Dialog */}
      {selectedEventForReport && (
        <EventReportUpload
          eventId={selectedEventForReport.id}
          eventTitle={selectedEventForReport.title}
          isOpen={isReportUploadOpen}
          onClose={() => {
            setIsReportUploadOpen(false);
            setSelectedEventForReport(null);
          }}
          onSuccess={() => {
            // Refresh events list after successful upload
            if (societyInfo?.society_id) {
              fetchSocietyEvents(societyInfo.society_id);
            }
          }}
        />
      )}

      {/* Media Viewer Modal */}
      <Dialog open={viewingMedia !== null} onOpenChange={(open) => {
        if (!open) setViewingMedia(null);
      }}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-none">
          {viewingMedia && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={() => setViewingMedia(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {viewingMedia.files.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 z-50 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      const prevIndex = viewingMedia.currentIndex > 0
                        ? viewingMedia.currentIndex - 1
                        : viewingMedia.files.length - 1;
                      setViewingMedia({
                        ...viewingMedia,
                        url: viewingMedia.files[prevIndex].processedUrl,
                        currentIndex: prevIndex
                      });
                    }}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 z-50 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextIndex = viewingMedia.currentIndex < viewingMedia.files.length - 1
                        ? viewingMedia.currentIndex + 1
                        : 0;
                      setViewingMedia({
                        ...viewingMedia,
                        url: viewingMedia.files[nextIndex].processedUrl,
                        currentIndex: nextIndex
                      });
                    }}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Media Display */}
              <div className="w-full h-full flex items-center justify-center p-8">
                {viewingMedia.type === 'image' ? (
                  <img
                    src={viewingMedia.url}
                    alt="Media viewer"
                    className="max-w-full max-h-[85vh] object-contain"
                    onError={(e) => {
                      console.error('Image failed to load in viewer:', viewingMedia.url);
                    }}
                  />
                ) : viewingMedia.type === 'video' ? (
                  <video
                    src={viewingMedia.url}
                    controls
                    className="max-w-full max-h-[85vh]"
                    autoPlay
                  />
                ) : (
                  <div className="text-white text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4" />
                    <p className="mb-4">Document Preview</p>
                    <Button
                      onClick={() => window.open(viewingMedia.url, '_blank')}
                      variant="outline"
                      className="text-white border-white hover:bg-white/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Open Document
                    </Button>
                  </div>
                )}
              </div>

              {/* Image Counter */}
              {viewingMedia.files.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {viewingMedia.currentIndex + 1} / {viewingMedia.files.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the member from the cabinet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivateMember} className="bg-red-600 hover:bg-red-700">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SocietyDashboard;
