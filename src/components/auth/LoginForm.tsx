import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ add axios for API calls

interface LoginFormProps {
  userType: "student" | "society" | "admin";
}

const LoginForm = ({ userType }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Check if user is already authenticated
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
        
        if (userData.admin === 1) {
          // Normalize role to handle case sensitivity and whitespace
          const normalizedRole = userData.role ? String(userData.role).trim().toLowerCase() : null;
          console.log("User is admin with role:", normalizedRole);
          // Redirect based on admin role
          switch(normalizedRole) {
            case 'society_board':
              console.log("Redirecting to Society Board dashboard");
              navigate("/dashboard/admin/board");
              break;
            case 'registrar':
              console.log("Redirecting to Registrar dashboard");
              navigate("/dashboard/admin/registrar");
              break;
            case 'vc':
            case 'vice_chancellor':
              console.log("Redirecting to VC dashboard");
              navigate("/dashboard/admin/vc");
              break;
            default:
              console.warn("⚠️ Unknown admin role in stored session. Role value:", normalizedRole);
              navigate("/dashboard/admin");
              break;
          }
        } else if (userData.society_owner === 1) {
          console.log("User is society owner, redirecting to society dashboard");
          navigate("/dashboard/society");
        } else {
          console.log("User is student, redirecting to student dashboard");
          navigate("/dashboard/student");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        // If parsing fails, default to student dashboard
        navigate("/dashboard/student");
      }
    }
  }, [navigate]);
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    // ✅ Call your backend login API
    const res = await axios.post("http://localhost:5000/student/login", {
      email: formData.email,
      password: formData.password,
    });

    // ✅ Save JWT token
    localStorage.setItem("token", res.data.token);

    // ✅ Save student/user data
    localStorage.setItem("user", JSON.stringify(res.data.student));

    console.log("Login successful:", res.data);
    console.log("Token saved:", res.data.token);
    console.log("User data saved:", res.data.student);
    console.log("Available fields in student data:", Object.keys(res.data.student));
    console.log("User role from backend:", res.data.student.role);
    console.log("Roll number in student data:", res.data.student.RollNO || res.data.student.RollNO || res.data.student.student_id);
    
    // ✅ Verify localStorage storage
    console.log("Token in localStorage:", localStorage.getItem("token"));
    console.log("User in localStorage:", localStorage.getItem("user"));

    // ✅ Check user role and redirect accordingly
    const userData = res.data.student;
    console.log("=== LOGIN DEBUG INFO ===");
    console.log("Full userData object:", JSON.stringify(userData, null, 2));
    console.log("User admin status:", userData.admin);
    console.log("User role:", userData.role);
    console.log("User role type:", typeof userData.role);
    console.log("User role value (stringified):", JSON.stringify(userData.role));
    console.log("User society owner status:", userData.society_owner);
    console.log("All userData keys:", Object.keys(userData));
    
    if (userData.admin === 1) {
      // Normalize role to handle case sensitivity and whitespace
      const normalizedRole = userData.role ? String(userData.role).trim().toLowerCase() : null;
      console.log("Normalized role:", normalizedRole);
      console.log("User is admin with role:", normalizedRole);
      
      // Redirect based on admin role
      switch(normalizedRole) {
        case 'society_board':
          console.log("Redirecting to Society Board dashboard");
          navigate("/dashboard/admin/board");
          break;
        case 'registrar':
          console.log("Redirecting to Registrar dashboard");
          navigate("/dashboard/admin/registrar");
          break;
        case 'vc':
        case 'vice_chancellor':
          console.log("Redirecting to VC dashboard");
          navigate("/dashboard/admin/vc");
          break;
        default:
          console.warn("⚠️ Unknown admin role! Role value:", normalizedRole, "| Original value:", userData.role);
          console.warn("⚠️ Redirecting to general admin dashboard. Please check backend response.");
          navigate("/dashboard/admin");
          break;
      }
    } else if (userData.society_owner === 1) {
      console.log("User is society owner, redirecting to society dashboard");
      navigate("/dashboard/society");
    } else {
      console.log("User is student, redirecting to student dashboard");
      navigate("/dashboard/student");
    }
  } catch (err: any) {
    console.error("Login failed:", err.response?.data || err.message);
    console.error("Full error object:", err);
    
    // Clear any existing auth data on login failure
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    setError(err.response?.data?.message || "Login failed");
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
    <Card className="p-6 shadow-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button
          type="submit"
          variant={config.buttonVariant}
          size="lg"
          className="w-full"
        >
          Sign In
        </Button>

        <div className="text-center space-y-2">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-university-navy hover:underline"
          >
            Forgot your password?
          </Link>

          {userType !== "admin" && (
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to={config.registerPath}
                className="text-university-navy hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </form>
    </Card>
  );
};

export default LoginForm;
