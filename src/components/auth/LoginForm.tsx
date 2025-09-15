import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface LoginFormProps {
  userType: "student" | "society" | "admin";
}

const LoginForm = ({ userType }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication - in a real app, this would call an API
    console.log("Login attempt:", { userType, ...formData });
    
    // Navigate to appropriate dashboard
    switch (userType) {
      case "student":
        navigate("/dashboard/student");
        break;
      case "society":
        navigate("/dashboard/society");
        break;
      case "admin":
        navigate("/dashboard/admin");
        break;
    }
  };

  const userTypeConfig = {
    student: {
      title: "Student Login",
      description: "Access your student dashboard",
      buttonVariant: "university" as const,
      registerPath: "/auth/student/register"
    },
    society: {
      title: "Society Owner Login", 
      description: "Manage your society",
      buttonVariant: "gold" as const,
      registerPath: "/auth/society/register"
    },
    admin: {
      title: "Administrator Login",
      description: "Access admin panel",
      buttonVariant: "maroon" as const,
      registerPath: "/auth/admin/register"
    }
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
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" variant={config.buttonVariant} size="lg" className="w-full">
          Sign In
        </Button>

        <div className="text-center space-y-2">
          <Link to="/auth/forgot-password" className="text-sm text-university-navy hover:underline">
            Forgot your password?
          </Link>
          
          {userType !== "admin" && (
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to={config.registerPath} className="text-university-navy hover:underline font-medium">
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