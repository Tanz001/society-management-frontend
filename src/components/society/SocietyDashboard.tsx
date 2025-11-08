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
  Clock
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EventRequestForm from "./EventRequestForm";
import EventRequestsList from "./EventRequestsList";

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


  // Fetch data when component loads
  useEffect(() => {
    // Fetch society data first, which will trigger fetching members and requests
    fetchSocietyData();
  }, []);

  // Mock data
  const societyData = {
    name: "Computer Science Society",
    status: "Active",
    memberCount: 245,
    pendingRequests: 12,
    upcomingEvents: 3,
    totalPosts: 28,
    thisMonthGrowth: 18,
    engagementRate: 4.2,
  };

  const recentPosts = [
    {
      id: 1,
      title: "Welcome New Members!",
      content: "We're excited to welcome 23 new members to our society this semester...",
      timestamp: "2 days ago",
      likes: 34,
      comments: 8,
      views: 156
    },
    {
      id: 2,
      title: "Hackathon Registration Open",
      content: "Registration is now open for our Spring Hackathon. Limited spots available...",
      timestamp: "5 days ago",
      likes: 67,
      comments: 15,
      views: 203
    }
  ];

  const upcomingEvents = [
    {
      title: "JavaScript Workshop Series",
      date: "2024-03-20",
      time: "6:00 PM",
      attendees: 45,
      status: "Published"
    },
    {
      title: "AI & Machine Learning Seminar",
      date: "2024-03-25",
      time: "5:30 PM",
      attendees: 78,
      status: "Published"
    },
    {
      title: "Spring Hackathon 2024",
      date: "2024-04-10",
      time: "9:00 AM",
      attendees: 120,
      status: "Draft"
    }
  ];

  const memberRequests = [
    { name: "Alice Johnson", email: "alice@university.edu", program: "Computer Science", year: "3rd Year" },
    { name: "Bob Chen", email: "bob@university.edu", program: "Software Engineering", year: "2nd Year" },
    { name: "Carol Davis", email: "carol@university.edu", program: "Information Technology", year: "4th Year" }
  ];

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
      href: "/society/post/create",
      state: {
        society_id: societyInfo?.society_id,
        society_name: societyInfo?.name
      },
      variant: "secondary" as "active" | "default" | "secondary"
    },
    {
      label: "Events",
      icon: <Calendar className="h-4 w-4" />,
      href: "/event",
      variant: "secondary" as "active" | "default" | "secondary"
    },
    {
      label: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      href: "/analytics",
      variant: "secondary" as "active" | "default" | "secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Header */}
      <ResponsiveHeader
        title={loadingSociety ? "Loading..." : societyInfo?.name || societyData.name}
        subtitle={`${membershipRequests.filter(req => req.status === 'approved').length || societyData.memberCount} members`}
        badge={{
          text: societyInfo?.status || societyData.status,
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
              variant="outline"
              asChild
            >
              <Link to="/society/post/create"
               state={{   society_id: societyInfo?.society_id,
                society_name:societyInfo?.name
                }}>Posts</Link>
            </Button>
            <Button 
              variant="outline"
              asChild
            >
              <Link to="/event">Events</Link>
            </Button>
            <Button 
              variant="outline"
              asChild
            >
              <Link to="/analytics">Analytics</Link>
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
                        {membershipRequests.filter(req => req.status === 'approved').length || societyData.memberCount}
                      </p>
                    </div>
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-university-navy flex-shrink-0" />
                  </div>
                  <div className="flex items-center mt-2 text-xs md:text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">
                      +{societyInfo?.thisMonthGrowth || societyData.thisMonthGrowth} this month
                    </span>
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
                        {societyInfo?.upcomingEvents || societyData.upcomingEvents}
                      </p>
                    </div>
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-university-maroon flex-shrink-0" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">Next 30 days</p>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Total Posts</p>
                      <p className="text-lg md:text-2xl font-bold text-university-navy">
                        {societyInfo?.totalPosts || societyData.totalPosts}
                      </p>
                    </div>
                    <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-university-navy flex-shrink-0" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">All time</p>
                </Card>
              </div>


              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy text-sm md:text-base">Recent Posts</h3>
                    <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                      <Link to="/society/posts">View All</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="sm:hidden">
                      <Link to="/society/posts">View</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="border-b pb-4 last:border-0">
                        <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.timestamp}</span>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.views}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {post.likes}
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {post.comments}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 md:p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-university-navy text-sm md:text-base">Upcoming Events</h3>
                    <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                      <Link to="/society/events">Manage All</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="sm:hidden">
                      <Link to="/society/events">Manage</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge variant={event.status === 'Published' ? 'default' : 'secondary'} className="text-xs">
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {event.date} • {event.time}
                        </p>
                        <p className="text-xs text-university-gold">
                          {event.attendees} registered
                        </p>
                      </div>
                    ))}
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
    </div>
  );
};

export default SocietyDashboard;
