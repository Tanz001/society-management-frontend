import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  userType?: "student" | "society" | "admin";
}

const LoginForm = ({ userType = "student" }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simple navigation function (replace with your actual router)
  const navigate = (path: string) => {
    console.log("Navigating to:", path);
    // In your actual app, uncomment this:
    // window.location.href = path;
  };

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    console.log("LoginForm - Checking authentication state:");
    console.log("Token exists:", !!token);
    console.log("User exists:", !!user);
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        console.log("User admin status:", userData.admin);
        console.log("User society owner status:", userData.society_owner);
        
        // Check role_name for routing
        if (userData.admin === 1) {
          const roleName = userData.role_name ? String(userData.role_name).trim().toLowerCase() : null;
          const roleId = userData.role_id;
          console.log("User is admin with role_id:", roleId, "role_name:", roleName);
          
          // Redirect based on role_name
          if (roleName === 'board_secretary') {
            console.log("Redirecting to Board Secretary dashboard");
            navigate("/dashboard/admin/board-secretary");
          } else if (roleName === 'board_president') {
            console.log("Redirecting to Board President dashboard");
            navigate("/dashboard/admin/board-president");
          } else if (roleName === 'registrar') {
            console.log("Redirecting to Registrar dashboard");
            navigate("/dashboard/admin/registrar");
          } else if (roleName === 'vc' || roleName === 'vice_chancellor') {
            console.log("Redirecting to VC dashboard");
            navigate("/dashboard/admin/vc");
          } else if (roleName === 'transport_office') {
            console.log("Redirecting to Transport Office dashboard");
            navigate("/dashboard/admin/transport-office");
          } else if (roleName === 'protocol_office') {
            console.log("Redirecting to Protocol Office dashboard");
            navigate("/dashboard/admin/protocol-office");
          } else if (roleName === 'admin') {
            console.log("Redirecting to Admin dashboard");
            navigate("/dashboard/admin");
          } else {
            console.warn("⚠️ Unknown admin role. Role ID:", roleId, "Role name:", roleName);
            navigate("/dashboard/admin");
          }
        } else if (userData.society_owner === 1) {
          console.log("User is society owner, redirecting to society dashboard");
          navigate("/dashboard/society");
        } else if (userData.role_name === 'advisor') {
          console.log("User is advisor, redirecting to advisor dashboard");
          navigate("/dashboard/student");
        } else {
          console.log("User is student, redirecting to student dashboard");
          navigate("/dashboard/student");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/dashboard/student");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Making login request to: https://lms.gcu.edu.pk/api/fc/login");
      console.log("Request payload:", { 
        usnm: formData.email, 
        pwd: formData.password 
      });

      // Call backend login API using fetch
      const response = await fetch("https://lms.gcu.edu.pk/api/fc/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usnm: formData.email,
          pwd: formData.password,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      const { user, error: apiError, warning, token } = data;

      if (apiError || warning) {
        throw new Error(apiError || warning);
      }

      if (token) {
        // Save JWT token
        localStorage.setItem("token", token);

        // Save student/user data
        localStorage.setItem("user", JSON.stringify(user));

        console.log("Login successful:", data);
        console.log("Token saved:", token);
        console.log("User data saved:", user);
        console.log("Available fields in user data:", Object.keys(user));
        
        // Verify localStorage storage
        console.log("Token in localStorage:", localStorage.getItem("token"));
        console.log("User in localStorage:", localStorage.getItem("user"));

        // Check user role and redirect accordingly
        const userData = user;
        console.log("=== LOGIN DEBUG INFO ===");
        console.log("Full userData object:", JSON.stringify(userData, null, 2));
        console.log("User admin status:", userData.admin);
        console.log("User role:", userData.role);
        console.log("User society owner status:", userData.society_owner);
        console.log("All userData keys:", Object.keys(userData));
        
        // Check role_name for routing
        if (userData.admin === 1) {
          const roleName = userData.role_name ? String(userData.role_name).trim().toLowerCase() : null;
          const roleId = userData.role_id;
          console.log("User is admin with role_id:", roleId, "role_name:", roleName);
          
          // Redirect based on role_name
          if (roleName === 'board_secretary') {
            console.log("Redirecting to Board Secretary dashboard");
            navigate("/dashboard/admin/board-secretary");
          } else if (roleName === 'board_president') {
            console.log("Redirecting to Board President dashboard");
            navigate("/dashboard/admin/board-president");
          } else if (roleName === 'registrar') {
            console.log("Redirecting to Registrar dashboard");
            navigate("/dashboard/admin/registrar");
          } else if (roleName === 'vc' || roleName === 'vice_chancellor') {
            console.log("Redirecting to VC dashboard");
            navigate("/dashboard/admin/vc");
          } else if (roleName === 'transport_office') {
            console.log("Redirecting to Transport Office dashboard");
            navigate("/dashboard/admin/transport-office");
          } else if (roleName === 'protocol_office') {
            console.log("Redirecting to Protocol Office dashboard");
            navigate("/dashboard/admin/protocol-office");
          } else if (roleName === 'admin') {
            console.log("Redirecting to Admin dashboard");
            navigate("/dashboard/admin");
          } else {
            console.warn("⚠️ Unknown admin role. Role ID:", roleId, "Role name:", roleName);
            navigate("/dashboard/admin");
          }
        } else if (userData.society_owner === 1) {
          console.log("User is society owner, redirecting to society dashboard");
          navigate("/dashboard/society");
        } else if (userData.role_name === 'advisor') {
          console.log("User is advisor, redirecting to advisor dashboard");
          navigate("/dashboard/student");
        } else {
          console.log("User is student, redirecting to student dashboard");
          navigate("/dashboard/student");
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error("Login failed:", err.message);
      console.error("Full error object:", err);
      
      // Clear any existing auth data on login failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      setError(err.message || "Login failed");
      setIsLoading(false);
    }
  };

  const userTypeConfig = {
    student: {
      title: "Student Login",
      description: "Access your student dashboard",
      buttonVariant: "university" as const,
      registerPath: "/auth/register",
    },
    society: {
      title: "Society Login",
      description: "Access your society dashboard",
      buttonVariant: "default" as const,
      registerPath: "/auth/register-society",
    },
    admin: {
      title: "Admin Login",
      description: "Administrator access",
      buttonVariant: "destructive" as const,
      registerPath: "",
    },
  };

  const config = userTypeConfig[userType];

  return (
    <Card className="p-8 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-university-navy">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              className="h-12 text-base border-2 focus:border-university-navy transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-university-navy">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                className="h-12 text-base border-2 pr-12 focus:border-university-navy transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-university-navy transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant={config.buttonVariant}
          size="lg"
          className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Sign In"}
        </Button>

        <div className="text-center space-y-3 pt-2">
          <a
            href="/auth/forgot-password"
            className="text-sm text-university-navy hover:text-university-gold font-medium transition-colors inline-block"
          >
            Forgot your password?
          </a>

          {userType !== "admin" && (
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href={config.registerPath}
                className="text-university-navy hover:text-university-gold font-semibold transition-colors"
              >
                Sign up
              </a>
            </div>
          )}
        </div>
      </form>
    </Card>
  );
};

export default LoginForm;