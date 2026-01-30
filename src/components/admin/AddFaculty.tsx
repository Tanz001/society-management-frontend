import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const AddFaculty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cnic: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Name, email, and password are required",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        cnic: formData.cnic || null,
        phone: formData.phone || null,
        password: formData.password,
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/admin/faculty`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "Success",
        description: "Faculty member created successfully",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        cnic: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Optionally navigate back or to role access
      setTimeout(() => {
        navigate("/dashboard/admin/role-access");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating faculty:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create faculty member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary text-white py-10 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">Super Admin</p>
              <h1 className="text-3xl font-bold">Register Faculty / Advisor</h1>
              <p className="text-white/80">
                Create a new faculty member or advisor account. All fields marked with * are required.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-white border-white bg-white/20" asChild>
                <Link to="/dashboard/admin/role-access">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Role Access
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-8 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.smith@gcu.edu.pk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC (Optional, Unique)</Label>
                <Input
                  id="cnic"
                  type="text"
                  placeholder="12345-1234567-1"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">
                  CNIC must be unique if provided
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/admin/role-access")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="university" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register Faculty / Advisor
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AddFaculty;

