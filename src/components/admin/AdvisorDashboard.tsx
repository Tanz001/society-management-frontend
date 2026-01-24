import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar,
  ArrowRight,
  Loader2,
  LogOut,
  BookOpen,
  Lock,
  Eye,
  EyeOff
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
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setIsChangePasswordOpen(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (err: any) {
      console.error("Error changing password:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-white border-white/30 hover:bg-white/20 hover:border-white/50 bg-black/20 backdrop-blur-sm"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
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

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                  }
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                  }
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                  }
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: ""
                });
              }}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
              variant="university"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvisorDashboard;

