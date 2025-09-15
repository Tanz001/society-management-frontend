import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Calendar, Users, Bell } from "lucide-react";
import SocietyCard from "@/components/societies/SocietyCard";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - in a real app, this would come from an API
  const societies = [
    {
      id: "1",
      name: "Computer Science Society",
      description: "A community for computer science students to learn, collaborate, and innovate together. We organize coding workshops, tech talks, and hackathons.",
      category: "Academic",
      memberCount: 245,
      rating: 4.8,
      location: "Engineering Building",
      upcomingEvents: 3,
      tags: ["Programming", "AI", "Web Development", "Networking"]
    },
    {
      id: "2", 
      name: "Drama Club",
      description: "Express your creativity through theater and performance. We welcome everyone from beginners to experienced actors and stage crew.",
      category: "Arts",
      memberCount: 89,
      rating: 4.6,
      location: "Arts Center",
      upcomingEvents: 2,
      tags: ["Theater", "Acting", "Stage Design", "Creative Writing"]
    },
    {
      id: "3",
      name: "Environmental Action Group",
      description: "Join us in making a positive impact on our planet. We organize campus cleanups, sustainability workshops, and eco-friendly initiatives.",
      category: "Social Impact",
      memberCount: 156,
      rating: 4.9,
      location: "Student Center",
      upcomingEvents: 5,
      tags: ["Sustainability", "Climate Action", "Volunteering", "Green Tech"]
    },
    {
      id: "4",
      name: "International Students Association",
      description: "A welcoming community for international students and those interested in global cultures, languages, and international exchange.",
      category: "Cultural",
      memberCount: 198,
      rating: 4.7,
      location: "International House",
      upcomingEvents: 4,
      tags: ["Culture", "Languages", "Exchange", "Friendship"]
    },
    {
      id: "5",
      name: "Business & Entrepreneurship Society",
      description: "Develop your business acumen and entrepreneurial skills. We host guest speakers, startup competitions, and networking events.",
      category: "Professional",
      memberCount: 312,
      rating: 4.8,
      location: "Business School",
      upcomingEvents: 6,
      tags: ["Business", "Startups", "Networking", "Finance"]
    },
    {
      id: "6",
      name: "Photography Club",
      description: "Capture the world through your lens. Learn photography techniques, share your work, and explore the campus and city together.",
      category: "Arts",
      memberCount: 127,
      rating: 4.5,
      location: "Media Studio",
      upcomingEvents: 2,
      tags: ["Photography", "Digital Art", "Editing", "Travel"]
    }
  ];

  const categories = ["All", "Academic", "Arts", "Social Impact", "Cultural", "Professional", "Sports"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredSocieties = societies.filter(society => {
    const matchesSearch = society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         society.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || society.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Student Dashboard</h1>
                <p className="text-white/80">Discover amazing societies and events</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center shadow-card">
              <Users className="h-8 w-8 mx-auto mb-2 text-university-navy" />
              <div className="text-2xl font-bold text-university-navy">3</div>
              <div className="text-sm text-muted-foreground">Joined Societies</div>
            </Card>
            <Card className="p-4 text-center shadow-card">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-university-gold" />
              <div className="text-2xl font-bold text-university-navy">7</div>
              <div className="text-sm text-muted-foreground">Upcoming Events</div>
            </Card>
            <Card className="p-4 text-center shadow-card">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-university-maroon" />
              <div className="text-2xl font-bold text-university-navy">12</div>
              <div className="text-sm text-muted-foreground">Posts This Week</div>
            </Card>
            <Card className="p-4 text-center shadow-card">
              <Filter className="h-8 w-8 mx-auto mb-2 text-university-navy" />
              <div className="text-2xl font-bold text-university-navy">156</div>
              <div className="text-sm text-muted-foreground">Available Societies</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search societies, events, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "university" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Societies Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-university-navy">
                Discover Societies ({filteredSocieties.length})
              </h2>
              <Button variant="gold" asChild>
                <Link to="/societies/create">Create Society</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSocieties.map((society) => (
                <SocietyCard key={society.id} society={society} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;