import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileSidebar, MobileNav } from "@/components/ui/mobile-sidebar";
import { ResponsiveHeader } from "@/components/ui/responsive-header";
import { Search, Filter, BookOpen, Calendar, Users, Bell, Menu, User } from "lucide-react";
import SocietyCard from "@/components/societies/SocietyCard";
import { Link } from "react-router-dom";
import axios from "axios";

const StudentDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [societies, setSocieties] = useState([]);
  const [joinedSocietiesCount, setJoinedSocietiesCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get all active societies
  const getAllSocieties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/active/societies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        console.log("All societies fetched:", response.data);
        setSocieties(response.data.societies || []);
      } else {
        setSocieties([]);
      }
    } catch (err) {
      console.error("Error fetching societies:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch societies");
      setSocieties([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to get joined societies count for stats
  const getJoinedSocietiesCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const user = localStorage.getItem("user");
      if (!user) {
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.id;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/joined/societies`,
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setJoinedSocietiesCount(response.data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching joined societies count:", err);
    }
  };

  // Load all societies and joined count on component mount (events disabled for now)
  useEffect(() => {
    getAllSocieties();
    getJoinedSocietiesCount();
  }, []);

  const categories = ["All", "University Level", "Department Level"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredSocieties = societies.filter(society => {
    const matchesSearch = society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         society.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || society.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Navigation items for mobile sidebar
  const navigationItems = [
    {
      label: "Dashboard",
      icon: <BookOpen className="h-4 w-4" />,
      href: "/dashboard",
      variant: "active" as "active" | "default" | "secondary"
    },
    {
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      href: "/profile",
      variant: "default" as "active" | "default" | "secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Header */}
      <ResponsiveHeader
        title="Student Dashboard"
        subtitle="Discover amazing societies and events"
        leftContent={
          <MobileSidebar trigger={
            <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/20">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          }>
            <MobileNav items={navigationItems} />
          </MobileSidebar>
        }
        rightContent={
          <Button variant="gold" size="sm" asChild className="hidden sm:flex">
            <Link to="/profile">Profile</Link>
          </Button>
        }
      />

      {/* Quick Stats commented out for now */}
      {/* <section className="py-4 md:py-8 px-4 bg-muted/30"> ... </section> */}

      {/* Search and Filter */}
      <section className="py-4 md:py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search societies, events, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "university" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Upcoming Events Section commented out for now */}
          {/* ... */}

          {/* All Available Societies Grid */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-university-navy">
                All Available Societies ({filteredSocieties.length})
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and discover societies to join
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-navy mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">Loading societies...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <Filter className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Error Loading Societies</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button onClick={getAllSocieties} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Joined Societies Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredSocieties.length > 0 ? (
                  filteredSocieties.map((society) => (
                    <SocietyCard key={society.society_id || society.id} society={society} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-university-navy mb-2">No Societies Found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || selectedCategory !== "All" 
                        ? "Try adjusting your search or filter criteria." 
                        : "No active societies are available at the moment."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;