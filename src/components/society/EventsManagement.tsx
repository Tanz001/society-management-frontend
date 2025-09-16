import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const EventsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const events = [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      date: "2024-03-15",
      time: "10:00 AM",
      location: "University Auditorium",
      status: "upcoming",
      attendees: 120,
      maxAttendees: 250,
      registrations: 85,
      description: "Annual technology summit featuring industry leaders and innovative startups."
    },
    {
      id: 2,
      title: "Coding Workshop: React Basics",
      date: "2024-03-20",
      time: "2:00 PM",
      location: "Computer Lab 301",
      status: "upcoming",
      attendees: 35,
      maxAttendees: 40,
      registrations: 42,
      description: "Hands-on workshop covering React fundamentals and modern development practices."
    },
    {
      id: 3,
      title: "Hackathon 2024",
      date: "2024-02-28",
      time: "9:00 AM",
      location: "Innovation Center",
      status: "completed",
      attendees: 80,
      maxAttendees: 100,
      registrations: 95,
      description: "24-hour hackathon challenging students to build innovative solutions."
    },
    {
      id: 4,
      title: "AI & Machine Learning Seminar",
      date: "2024-04-10",
      time: "3:00 PM",
      location: "Lecture Hall B",
      status: "draft",
      attendees: 0,
      maxAttendees: 150,
      registrations: 0,
      description: "Exploring the latest trends and applications in artificial intelligence."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "default";
      case "completed": return "secondary";
      case "draft": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const upcomingEvents = events.filter(e => e.status === "upcoming");
  const completedEvents = events.filter(e => e.status === "completed");
  const draftEvents = events.filter(e => e.status === "draft");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Events Management</h1>
              <p className="text-white/90">Create and manage society events</p>
            </div>
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="py-8 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-navy">{upcomingEvents.length}</div>
              <div className="text-sm text-muted-foreground">Upcoming Events</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-navy">
                {upcomingEvents.reduce((sum, e) => sum + e.registrations, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Registrations</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-navy">{completedEvents.length}</div>
              <div className="text-sm text-muted-foreground">Completed Events</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-university-navy">{draftEvents.length}</div>
              <div className="text-sm text-muted-foreground">Draft Events</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-university-navy">{event.title}</h3>
                      <Badge variant={getStatusColor(event.status)}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-6 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {event.registrations} registered / {event.maxAttendees} max
                      </div>
                      <div className="text-muted-foreground">
                        Attendance: {event.attendees}
                      </div>
                    </div>

                    {event.status === "upcoming" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Registration Progress</span>
                          <span>{Math.round((event.registrations / event.maxAttendees) * 100)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-university-gold h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(event.registrations / event.maxAttendees) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-university-navy mb-2">{event.title}</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.registrations} registered
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="university" size="sm">View Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedEvents.map((event) => (
              <Card key={event.id} className="p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-university-navy mb-2">{event.title}</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.attendees} attended
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="drafts" className="space-y-4">
            {draftEvents.map((event) => (
              <Card key={event.id} className="p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-university-navy mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="university" size="sm">Publish</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventsManagement;