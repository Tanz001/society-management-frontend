import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  LogOut,
  Trophy,
  Users,
  Star,
  BookOpen,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const navigate = useNavigate();

  // 🔹 Load user from localStorage
  useEffect(() => {
    console.log("ProfilePage - Component loaded");
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    console.log("ProfilePage - Authentication check:");
    console.log("Token exists:", !!token);
    console.log("User exists:", !!storedUser);
    console.log("User data:", storedUser);
    
    if (!token || !storedUser) {
      console.error("ProfilePage - User not authenticated, redirecting to login");
      navigate("/");
      return;
    }
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("ProfilePage - Parsed user data:", userData);
        setStudentInfo(userData);
      } catch (error) {
        console.error("ProfilePage - Error parsing user data:", error);
        navigate("/");
      }
    }
  }, [navigate]);

  // 🔹 Fetch membership requests when student info is loaded
  useEffect(() => {
    console.log("StudentInfo in useEffect:", studentInfo);
    if (studentInfo) {
      fetchMembershipRequests();
    }
  }, [studentInfo]);

  // 🔹 Handle input changes when editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentInfo({ ...studentInfo, [e.target.name]: e.target.value });
  };

  // 🔹 Save updated profile
  const handleSave = async () => {
    try {
      // Prepare data according to backend API structure
      const updateData = {
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        email: studentInfo.email,
        phone: studentInfo.phone,
        university: studentInfo.university,
        major: studentInfo.major,
        semester: studentInfo.semester
      };

      console.log("Sending update data:", updateData);

      const res = await axios.put(
        "http://localhost:5000/user/update-profile",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user)); // update local storage
        setStudentInfo(res.data.user);
        setIsEditing(false);
        console.log("Profile updated successfully");
      } else {
        console.error("Update failed:", res.data.message);
      }
    } catch (err: any) {
      console.error("Update failed:", err.response?.data || err.message);
    }
  };

  // 🔹 Fetch membership requests
  const fetchMembershipRequests = async () => {
    console.log("fetchMembershipRequests called with studentInfo:", studentInfo);
    
    if (!studentInfo) {
      console.log("No studentInfo available");
      return;
    }

    // Try different possible user ID field names
    const userId = studentInfo.user_id || studentInfo.id || studentInfo.RollNO || studentInfo.rollno;
    
    if (!userId) {
      console.log("No user ID found in studentInfo. Available fields:", Object.keys(studentInfo));
      return;
    }

    console.log("Using user ID:", userId);
    console.log("Making request...............")
    setLoadingRequests(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/user/membership/requests",
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setMembershipRequests(response.data.requests || []);
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

  // 🔹 Handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.clear();
    
    // Navigate to login page
    navigate("/");
  };

  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mx-auto mb-4"></div>
          <p className="text-lg">Loading profile...</p>
          <p className="text-sm text-muted-foreground mt-2">If this takes too long, check console for errors</p>
        </div>
      </div>
    );
  }

  // 🔹 Example dummy data (replace with backend later)
  const joinedSocieties = [
    { id: 1, name: "Computer Science Society", role: "Member", joinDate: "Sept 2022", status: "Active", avatar: "CS" },
    { id: 2, name: "Business Society", role: "Vice President", joinDate: "Jan 2023", status: "Active", avatar: "BS" },
    { id: 3, name: "International Students Society", role: "Event Coordinator", joinDate: "Mar 2023", status: "Active", avatar: "IS" },
  ];

  const participatedEvents = [
    { id: 1, name: "Tech Innovation Summit 2024", society: "Computer Science Society", date: "March 15, 2024", role: "Participant", certificate: true },
    { id: 2, name: "Leadership Workshop", society: "Business Society", date: "February 28, 2024", role: "Organizer", certificate: true },
    { id: 3, name: "Cultural Night Celebration", society: "International Students Society", date: "February 20, 2024", role: "Event Coordinator", certificate: false },
  ];

  const achievements = [
    { title: "Outstanding Leadership", description: "Recognized for exceptional leadership in Business Society", date: "March 2024", icon: Trophy },
    { title: "Community Builder", description: "Helped grow International Students Society membership by 40%", date: "February 2024", icon: Users },
    { title: "Academic Excellence", description: "Maintained GPA above 3.8 for 4 consecutive semesters", date: "January 2024", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-4 md:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Avatar className="h-16 w-16 md:h-24 md:w-24">
              <AvatarImage src={studentInfo.avatar || ""} />
              <AvatarFallback className="bg-white text-university-navy text-lg md:text-2xl font-bold">
                {(studentInfo.firstName?.substring(0, 1) || '') + (studentInfo.lastName?.substring(0, 1) || '')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{studentInfo.firstName} {studentInfo.lastName}</h1>
              <p className="text-white/90 text-sm md:text-lg">{studentInfo.major} • {studentInfo.year}</p>
              <p className="text-white/80 text-xs md:text-base">Student ID: {studentInfo.RollNO}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Action Buttons */}
      <section className="py-4 md:py-6 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center md:justify-start gap-3">
            <Button
              variant="university"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              size="lg"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleLogout}
              size="lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-card">
              <h3 className="font-semibold text-university-navy mb-4">Personal Information</h3>
              <div className="space-y-4">
                {/* First Name */}
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">First Name</p>
                    {isEditing ? (
                      <Input name="firstName" value={studentInfo.firstName} onChange={handleInputChange} className="mt-1" />
                    ) : (
                      <p className="font-[14px]">{studentInfo.firstName}</p>
                    )}
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Name</p>
                    {isEditing ? (
                      <Input name="lastName" value={studentInfo.lastName} onChange={handleInputChange} className="mt-1" />
                    ) : (
                      <p className="font-[14px]">{studentInfo.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    {isEditing ? (
                      <Input name="email" value={studentInfo.email} onChange={handleInputChange} className="mt-1" />
                    ) : (
                      <p className="font-[14px]">{studentInfo.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    {isEditing ? (
                      <Input name="phone" value={studentInfo.phone} onChange={handleInputChange} className="mt-1" />
                    ) : (
                      <p className="font-[14px]">{studentInfo.phone}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">University</p>
                    {isEditing ? (
                      <Input name="university" value={studentInfo.university} onChange={handleInputChange} className="mt-1" />
                    ) : (
                      <p className="font-[14px]">{studentInfo.university}</p>
                    )}
                  </div>
                </div>

                {/* Major */}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Major</p>
                    {isEditing ? (
                      <Input name="major" value={studentInfo.major} onChange={handleInputChange} className="mt-1" />
                    ) : (
                      <p className="font-[14px]">{studentInfo.major}</p>
                    )}
                  </div>
                </div>

                {/* Semester */}
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Semester</p>
                    {isEditing ? (
                      <Input name="semester" value={studentInfo.semester} onChange={handleInputChange} className="mt-1" />
                    ) : (
                      <p className="font-[14px]">{studentInfo.semester}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6 shadow-card">
              <h3 className="font-semibold text-university-navy mb-4">Recent Achievements</h3>
              <div className="space-y-4">
                {achievements.slice(0, 3).map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-university-gold/10 p-2 rounded-lg">
                        <Icon className="h-4 w-4 text-university-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="societies" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="societies">My Societies</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="requests">My Requests</TabsTrigger>
              </TabsList>

              {/* Societies */}
              <TabsContent value="societies" className="space-y-4">
                {joinedSocieties.map((society) => (
                  <Card key={society.id} className="p-6 shadow-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-university-navy text-white">
                            {society.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-university-navy">{society.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {society.role} • Joined {society.joinDate}
                          </p>
                        </div>
                      </div>
                      <Badge variant={society.status === "Active" ? "default" : "secondary"}>
                        {society.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* Events */}
              <TabsContent value="events" className="space-y-4">
                {participatedEvents.map((event) => (
                  <Card key={event.id} className="p-6 shadow-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-university-navy mb-1">{event.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{event.society}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {event.date}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.role}
                          </Badge>
                        </div>
                      </div>
                      {event.certificate && (
                        <Badge variant="secondary">
                          <Trophy className="h-3 w-3 mr-1" />
                          Certificate
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </TabsContent>

              {/* My Requests */}
              <TabsContent value="requests" className="space-y-4">
                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-navy mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your requests...</p>
                  </div>
                ) : membershipRequests.length === 0 ? (
                  <Card className="p-8 text-center shadow-card">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-university-navy mb-2">No Membership Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      You haven't submitted any membership requests yet.
                    </p>
                  </Card>
                ) : (
                  membershipRequests.map((request, index) => {
                    const getStatusIcon = (status: string) => {
                      switch (status?.toLowerCase()) {
                        case 'approved':
                          return <CheckCircle className="h-4 w-4 text-green-500" />;
                        case 'rejected':
                          return <XCircle className="h-4 w-4 text-red-500" />;
                        case 'pending':
                          return <AlertCircle className="h-4 w-4 text-yellow-500" />;
                        default:
                          return <AlertCircle className="h-4 w-4 text-gray-500" />;
                      }
                    };

                    const getStatusBadge = (status: string) => {
                      switch (status?.toLowerCase()) {
                        case 'approved':
                          return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
                        case 'rejected':
                          return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
                        case 'pending':
                          return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
                        default:
                          return <Badge variant="secondary">Unknown</Badge>;
                      }
                    };

                    return (
                      <Card key={index} className="p-6 shadow-card">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="bg-university-navy/10 p-3 rounded-lg">
                              {getStatusIcon(request.status)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-university-navy mb-1">
                                {request.society_name || 'Society Request'}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Request ID: {request.request_id || index + 1}
                              </p>
                              {request.message && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  Message: {request.message}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {request.submitted_at ? new Date(request.submitted_at).toLocaleDateString() : 'Date not available'}
                                </div>
                                {request.processed_at && (
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Processed: {new Date(request.processed_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
