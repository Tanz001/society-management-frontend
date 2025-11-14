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
  MapPin
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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
  const [likedPosts, setLikedPosts] = useState<{[key: number]: boolean}>({});
  const [likingPost, setLikingPost] = useState<number | null>(null);
  const [commentingOn, setCommentingOn] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<{[key: number]: any[]}>({});
  const [selectedEventForReport, setSelectedEventForReport] = useState<{id: number, title: string} | null>(null);
  const [isReportUploadOpen, setIsReportUploadOpen] = useState(false);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Fetch society data by user_id
  const fetchSocietyData = async () => {
    // Get user_id from localStorage or token
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.log("No user data available");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      const userId = userData.id;
      
      if (!userId) {
        console.log("No user ID found in user data");
        return;
      }

      setLoadingSociety(true);
      console.log("Fetching society data for user ID:", userId);
      
      const response = await axios.post(
        "http://localhost:5000/society/society/data",
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Handle society data as array - take the first society
        const societyData = response.data.society && response.data.society.length > 0 
          ? response.data.society[0] 
          : null;
        
        setSocietyInfo(societyData);
        console.log("Society data fetched:", societyData);
        
        // If we have society data, fetch membership requests and settings using society_id
        if (societyData && societyData.society_id) {
          fetchMembershipRequests(societyData.society_id);
          // Fetch settings using the society ID from the response
          fetchMembershipSettings(societyData.society_id);
          // Fetch posts and events
          fetchSocietyPosts(societyData.society_id);
          fetchSocietyEvents(societyData.society_id);
        }
      } else {
        console.error("Failed to fetch society data:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error fetching society data:", error.response?.data || error.message);
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
      const response = await axios.post(
        `http://localhost:5000/society/membership/form`,
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
      console.log("Fetching membership requests for society ID:", currentSocietyId);
      const response = await axios.post(
        "http://localhost:5000/society/membership/requests",
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
      }
    } catch (error: any) {
      console.error("Error fetching membership requests:", error.response?.data || error.message);
      setMembershipRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Approve membership request
  const handleApproveRequest = async (requestId: number) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/society/membership/approve",
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
        console.log("Request approved successfully");
      } else {
        console.error("Failed to approve request:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error approving request:", error.response?.data || error.message);
    }
  };

  // Decline membership request
  const handleDeclineRequest = async (requestId: number) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/society/membership/reject",
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
        console.log("Request declined successfully");
      } else {
        console.error("Failed to decline request:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error declining request:", error.response?.data || error.message);
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
      console.error("No society ID available");
      return;
    }

    if (!membershipFee || !accountNumber || !accountTitle) {
      console.error("All fields are required: fee, account number, and account title");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/society/membership/settings",
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

      if (response.data.message) {
        console.log("Membership settings saved successfully:", response.data.message);
        // You can add a success toast here if you have one
      }
    } catch (error: any) {
      console.error("Error saving membership settings:", error.response?.data || error.message);
    }
  };


  // Fetch posts for the society
  const fetchSocietyPosts = async (societyId: number) => {
    try {
      setLoadingPosts(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id || user.user_id;

      const response = await axios.post(
        "http://localhost:5000/society/posts",
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
        const commentsState: {[key: number]: any[]} = {};
        const likedPostsState: {[key: number]: boolean} = {};
        
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
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch events for the society
  const fetchSocietyEvents = async (societyId: number) => {
    try {
      setLoadingEvents(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        "http://localhost:5000/society/events",
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
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Handle like/unlike functionality
  const handleLike = async (postId: number) => {
    if (likingPost === postId) return;
    
    try {
      setLikingPost(postId);
      
      const response = await axios.post('http://localhost:5000/user/like/toggle', {
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
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingPost(null);
    }
  };

  // Handle comment submission
  const handleComment = async (postId: number) => {
    if (!newComment.trim() || submittingComment) return;
    
    try {
      setSubmittingComment(true);
      
      const response = await axios.post('http://localhost:5000/user/comment/add', {
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
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Fetch data when component loads
  useEffect(() => {
    // Fetch society data first, which will trigger fetching members and requests
    fetchSocietyData();
  }, []);


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
    }
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
                      posts.slice(0, 3).map((post) => (
                        <div key={post.post_id} className="border-b pb-4 last:border-0">
                          <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {post.content}
                          </p>
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
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy text-sm md:text-base">Upcoming Events</h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("events")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {loadingEvents ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-university-navy mx-auto"></div>
                      </div>
                    ) : events.filter(e => new Date(e.event_date) >= new Date()).length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No upcoming events</p>
                    ) : (
                      events
                        .filter(e => new Date(e.event_date) >= new Date())
                        .slice(0, 3)
                        .map((event, index) => (
                        <div key={event.id || index} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <Badge variant="default" className="text-xs">
                              {event.status}
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
                    {membershipRequests.map((request, index) => (
                    <Card key={index} className="p-4 border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-university-navy/30 bg-gradient-to-br from-white to-gray-50/30">
                        <div className="space-y-4">
                          {/* Header Section */}
                          <div className="flex items-start space-x-3">
                            <div className="bg-gradient-to-br from-university-gold to-university-gold/80 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0 shadow-md">
                              {(request.firstName || 'S')?.charAt(0).toUpperCase()}{(request.lastName || 'T')?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-base md:text-lg text-university-navy">
                                    {request.firstName} {request.lastName}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Membership Applicant
                                  </p>
                                </div>
                                <Badge 
                                  variant={request.status === 'pending' ? 'secondary' : 
                                           request.status === 'approved' ? 'default' : 'destructive'}
                                  className="text-xs flex-shrink-0 ml-2 shadow-sm"
                                >
                                  {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                  {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                  {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 text-university-navy/60" />
                              <span className="truncate">{request.email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4 text-university-navy/60" />
                              <span>{request.major} • {request.semester}</span>
                            </div>
                            {request.phone && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 text-university-navy/60" />
                                <span>{request.phone}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Message Section */}
                          {request.message && (
                            <div className="bg-gradient-to-r from-university-navy/5 to-university-gold/5 p-3 rounded-lg border border-university-navy/10">
                              <p className="text-sm text-muted-foreground italic">
                                "{request.message}"
                              </p>
                            </div>
                          )}
                          
                          {/* Action Section */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Submitted: {request.submitted_at ? new Date(request.submitted_at).toLocaleDateString() : 'Unknown'}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="university"
                                    onClick={() => handleApproveRequest(request.request_id)}
                                    className="flex-1 sm:flex-none shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleDeclineRequest(request.request_id)}
                                    className="flex-1 sm:flex-none hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              {request.status === 'approved' && (
                                <Badge className="bg-green-100 text-green-800 border-green-200 shadow-sm">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              )}
                              {request.status === 'rejected' && (
                                <Badge className="bg-red-100 text-red-800 border-red-200 shadow-sm">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rejected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                    </Card>
                  ))}
                </div>
                )}
              </Card>

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
              {societyInfo?.society_id && (() => {
                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                return (
                  <>
                    <EventRequestForm 
                      societyId={societyInfo.society_id}
                      userId={userData.id}
                      onSubmitSuccess={() => setEventRequestsRefreshKey(prev => prev + 1)}
                    />
                    <EventRequestsList key={eventRequestsRefreshKey} societyId={societyInfo.society_id} />
                  </>
                );
              })()}
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

                        {post.post_type === 'photo' && post.media_files && post.media_files.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {post.media_files.map((file: any) => {
                                let imageUrl = file.file_url;
                                if (file.file_url && !file.file_url.startsWith('http')) {
                                  imageUrl = `http://localhost:5000/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
                                }
                                return (
                                  <img 
                                    key={file.media_id}
                                    src={imageUrl}
                                    alt="Post"
                                    className="w-full h-48 object-cover rounded-lg border"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {post.post_type === 'video' && post.media_files && post.media_files.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                            {post.media_files.map((file: any) => {
                              let videoUrl = file.file_url;
                              if (file.file_url && !file.file_url.startsWith('http')) {
                                videoUrl = `http://localhost:5000/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
                              }
                              return (
                                <video 
                                  key={file.media_id}
                                  src={videoUrl}
                                  controls
                                  className="w-full max-w-md rounded-lg border"
                                />
                              );
                            })}
                          </div>
                        )}

                        {post.post_type === 'document' && post.media_files && post.media_files.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                            {post.media_files.map((file: any) => {
                              let fileUrl = file.file_url;
                              if (file.file_url && !file.file_url.startsWith('http')) {
                                fileUrl = `http://localhost:5000/${file.file_url.replace(/\\/g, '/').replace(/^.*?\/assets\//, 'assets/')}`;
                              }
                              return (
                                <div key={file.media_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <FileText className="h-5 w-5 text-university-navy" />
                                  <span className="flex-1 text-sm text-muted-foreground truncate">
                                    {file.file_url.split('/').pop()}
                                  </span>
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </a>
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {post.post_type === 'poll' && post.poll_data && (
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed font-medium">{post.poll_data.question || post.content}</p>
                            {post.poll_data.options && post.poll_data.options.length > 0 && (() => {
                              const totalVotes = post.poll_data.options.reduce((sum: number, option: any) => sum + (option.vote_count || 0), 0);
                              const pollId = post.poll_data.poll_id || post.poll_id;
                              
                              return (
                                <div className="space-y-3">
                                  {post.poll_data.options.map((option: any) => {
                                    const percentage = totalVotes > 0 ? ((option.vote_count || 0) / totalVotes) * 100 : 0;
                                    const isVoted = option.user_voted || false;
                                    
                                    return (
                                      <div 
                                        key={option.option_id} 
                                        className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 hover:bg-gray-50 ${
                                          isVoted ? 'border-university-navy bg-university-navy/5' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => {
                                          const handlePollVote = async (postId: number, optionId: number, pollId: number) => {
                                            try {
                                              const token = localStorage.getItem("token");
                                              if (!token) return;

                                              const response = await axios.post(
                                                'http://localhost:5000/user/poll/vote',
                                                { option_id: optionId, poll_id: pollId },
                                                {
                                                  headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                  }
                                                }
                                              );

                                              if (response.data.success && societyInfo?.society_id) {
                                                const user = JSON.parse(localStorage.getItem("user") || "{}");
                                                const userId = user.id || user.user_id;
                                                fetchSocietyPosts(societyInfo.society_id);
                                              }
                                            } catch (error) {
                                              console.error('Error voting on poll:', error);
                                            }
                                          };
                                          handlePollVote(post.post_id, option.option_id, pollId);
                                        }}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className={`font-medium ${isVoted ? 'text-university-navy' : 'text-gray-900'}`}>
                                            {option.option_text}
                                          </span>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">
                                              {option.vote_count || 0} {option.vote_count === 1 ? 'vote' : 'votes'}
                                            </span>
                                            {isVoted && (
                                              <div className="w-2 h-2 bg-university-navy rounded-full"></div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="relative">
                                          <Progress 
                                            value={percentage} 
                                            className={`h-2 ${isVoted ? '[&>div]:bg-university-navy' : '[&>div]:bg-gray-300'}`} 
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                    <div className="flex items-center space-x-2">
                                      <BarChartIcon className="h-3 w-3" />
                                      <span>{totalVotes} {totalVotes === 1 ? 'total vote' : 'total votes'}</span>
                                    </div>
                                    <span>{post.poll_data.options.length} {post.poll_data.options.length === 1 ? 'option' : 'options'}</span>
                                  </div>
                                </div>
                              );
                            })()}
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
                        
                        <Dialog open={commentingOn === post.post_id} onOpenChange={(open) => {
                          if (!open) {
                            setCommentingOn(null);
                            setNewComment("");
                          } else {
                            setCommentingOn(post.post_id);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-muted-foreground hover:text-university-navy hover:bg-university-navy/5"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Comment ({post.comment_count || 0})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle>Comments ({post.comment_count || 0})</DialogTitle>
                              <DialogDescription>
                                Share your thoughts and see what others are saying.
                              </DialogDescription>
                            </DialogHeader>
                            
                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                              {comments[post.post_id] && comments[post.post_id].length > 0 ? (
                                comments[post.post_id].map((comment: any) => (
                                  <div key={comment.id || comment.comment_id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-university-navy text-white text-xs">
                                        {comment.author ? comment.author.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-sm text-university-navy">
                                          {comment.author || comment.commenter_name || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          }) : ''}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-900 leading-relaxed">
                                        {comment.text || comment.comment_text}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                  <p>No comments yet. Be the first to comment!</p>
                                </div>
                              )}
                            </div>

                            {/* Add Comment Section */}
                            <div className="border-t pt-4">
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Write your comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  className="min-h-[80px] resize-none"
                                />
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">
                                    {newComment.length}/500 characters
                                  </span>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setCommentingOn(null);
                                        setNewComment("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => handleComment(post.post_id)}
                                      disabled={!newComment.trim() || submittingComment || newComment.length > 500}
                                    >
                                      {submittingComment ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Posting...
                                        </>
                                      ) : (
                                        <>
                                          <Send className="h-4 w-4 mr-2" />
                                          Post Comment
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                          variant={event.status_id === 11 ? "default" : event.status_id === 10 ? "secondary" : "outline"} 
                          className="text-xs"
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
                      {/* Complete Event Button - Only show for Active events (status_id = 10) */}
                      {event.status_id === 10 && event.source_table === 'event_req' && (
                        <Button
                          variant="university"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedEventForReport({ id: event.id, title: event.title });
                            setIsReportUploadOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Complete Event
                        </Button>
                      )}
                      {event.status_id === 11 && (
                        <div className="flex items-center justify-center text-sm text-green-600 bg-green-50 rounded-lg p-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Report Submitted
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
    </div>
  );
};

export default SocietyDashboard;
