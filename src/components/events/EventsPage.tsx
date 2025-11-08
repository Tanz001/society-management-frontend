import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  Filter,
  Heart,
  Share2,
  BookmarkPlus
} from "lucide-react";
import { Link } from "react-router-dom";

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const events = [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      society: "Computer Science Society",
      date: "2024-03-15",
      time: "10:00 AM",
      location: "University Auditorium",
      attendees: 250,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
      category: "Technology",
      status: "upcoming"
    },
    {
      id: 2,
      title: "Cultural Night Celebration",
      society: "International Students Society",
      date: "2024-03-20",
      time: "6:00 PM",
      location: "Student Center Hall",
      attendees: 180,
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400",
      category: "Cultural",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Entrepreneurship Workshop",
      society: "Business Society",
      date: "2024-03-25",
      time: "2:00 PM",
      location: "Business Building Room 201",
      attendees: 120,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
      category: "Business",
      status: "upcoming"
    }
  ];

  const categories = ["All", "Technology", "Cultural", "Business", "Sports", "Academic"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-6 md:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">University Events</h1>
            <p className="text-white/90 text-sm md:text-lg">Discover exciting events happening across all societies</p>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="py-4 md:py-8 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "university" : "outline"}
                size="sm"
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden shadow-card hover:shadow-hover transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">{event.category}</Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {event.society}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-3 text-university-navy">{event.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees} attending
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="university">
                      Register
                    </Button>
                    <Button variant="outline" size="sm" className="px-3">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;