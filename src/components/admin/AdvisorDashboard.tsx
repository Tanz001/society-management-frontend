import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar,
  ArrowRight,
  Loader2,
  LogOut,
  BookOpen
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Society {
  society_id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  advisor: string;
  society_logo: string | null;
  cover_photo: string | null;
  status_id: number;
  status_name: string;
  created_at: string;
  updated_at: string;
}

const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvisorSocieties();
  }, []);

  const fetchAdvisorSocieties = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/advisor/societies`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSocieties(response.data.societies || []);
    } catch (err: any) {
      console.error("Error fetching advisor societies:", err);
      setError(err.response?.data?.message || "Failed to load societies");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load your assigned societies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleViewSociety = (societyId: number) => {
    navigate(`/dashboard/society/${societyId}`);
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-white py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">Advisor Dashboard</p>
              <h1 className="text-3xl font-bold mt-2">My Societies</h1>
              <p className="text-white/80 mt-2">
                Welcome, {user.name || "Advisor"}. Manage the societies you are assigned to.
              </p>
            </div>
            <Button
              variant="outline"
              className="text-white border-white/30 hover:bg-white/20 hover:border-white/50 bg-black/20 backdrop-blur-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Stats Card */}
          <div className="grid md:grid-cols-1 gap-6 mb-8">
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Societies</p>
                  <p className="text-3xl font-bold text-university-navy">{societies.length}</p>
                </div>
                <Building2 className="h-12 w-12 text-university-gold" />
              </div>
            </Card>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-university-navy" />
              <p className="text-muted-foreground">Loading your societies...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="p-6 border-red-200 bg-red-50">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchAdvisorSocieties}
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Societies List */}
          {!loading && !error && (
            <>
              {societies.length === 0 ? (
                <Card className="p-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Societies Assigned</h3>
                  <p className="text-muted-foreground">
                    You are not currently assigned as an advisor to any society.
                  </p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {societies.map((society) => (
                    <Card
                      key={society.society_id}
                      className="overflow-hidden shadow-card hover:shadow-lg transition-shadow"
                    >
                      {/* Cover Image */}
                      {society.cover_photo && (
                        <div className="h-32 bg-gradient-to-r from-university-navy to-university-maroon relative">
                          <img
                            src={`${import.meta.env.VITE_API_URL}/${society.cover_photo}`}
                            alt={society.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      {!society.cover_photo && (
                        <div className="h-32 bg-gradient-to-r from-university-navy to-university-maroon" />
                      )}

                      <div className="p-6">
                        {/* Logo and Name */}
                        <div className="flex items-start gap-4 mb-4">
                          {society.society_logo && (
                            <img
                              src={`${import.meta.env.VITE_API_URL}/${society.society_logo}`}
                              alt={society.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-university-gold"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-university-navy mb-1">
                              {society.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {society.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {society.description || "No description available"}
                        </p>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          {society.location && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-2" />
                              {society.location}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button
                          className="w-full"
                          variant="university"
                          onClick={() => handleViewSociety(society.society_id)}
                        >
                          View Dashboard
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdvisorDashboard;

