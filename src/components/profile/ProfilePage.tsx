import { useState, useEffect } from "react";
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
  Settings,
  Trophy,
  Users,
  Star,
  BookOpen,
  Clock,
} from "lucide-react";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  // 🔹 Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("userrr",storedUser)
    if (storedUser) {
      setStudentInfo(JSON.parse(storedUser));
    }
  }, []);

  // 🔹 Handle input changes when editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentInfo({ ...studentInfo, [e.target.name]: e.target.value });
  };

  // 🔹 Save updated profile
  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/student/update-profile",
        studentInfo,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.setItem("user", JSON.stringify(res.data.user)); // update local storage
      setStudentInfo(res.data.user);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Update failed:", err.response?.data || err.message);
    }
  };

  if (!studentInfo) {
    return <p className="text-center mt-10">Loading profile...</p>;
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
      <header className="gradient-primary text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={studentInfo.avatar || ""} />
              <AvatarFallback className="bg-white text-university-navy text-2xl font-bold">
                {studentInfo.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">{studentInfo.firstName} {studentInfo.lastName}</h1>
              <p className="text-white/90 text-lg">{studentInfo.major} • {studentInfo.year}</p>
              <p className="text-white/80">Student ID: {studentInfo.RollNO}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="hero"
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-card">
              <h3 className="font-semibold text-university-navy mb-4">Personal Information</h3>
              <div className="space-y-4">
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
                      <Input name="location" value={studentInfo.university} onChange={handleInputChange} className="mt-1" />
                    ) : (
                      <p className="font-[14px]">{studentInfo.university}</p>
                    )}
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Major</p>
                    <p className="font-[14px]">{studentInfo.major}</p>
                  </div>
                </div>

                {/* GPA */}
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <p className="font-[14px]">{studentInfo.semester}</p>
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
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
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

              {/* Achievements */}
              <TabsContent value="achievements" className="space-y-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <Card key={index} className="p-6 shadow-card">
                      <div className="flex items-start space-x-4">
                        <div className="bg-university-gold/10 p-3 rounded-lg">
                          <Icon className="h-6 w-6 text-university-gold" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-university-navy mb-1">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {achievement.date}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
