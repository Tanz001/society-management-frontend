import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import home2Image from "@/assets/images/home4.jpg";

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 👉 Detect student roll no
  const isStudentRoll = (value: string) => {
    const trimmed = value.trim();
    
    // If it has dash → treat as student
    if (trimmed.includes("-")) return true;
  
    return false;
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const isStudent = isStudentRoll(formData.email);

      let payload;
      let url;

      if (isStudent) {
        url = "https://lms.gcu.edu.pk/api/fc/login";
        payload = { usnm: formData.email, pwd: formData.password };
      } else {
        url = `${API_URL}/auth/login`;
        payload = { email: formData.email, password: formData.password };
      }

      const res = await axios.post(url, payload);

      // 👉 Store login session
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const user = res.data.user;

      // 👉 STUDENT DASHBOARD
      if (isStudent) {
        navigate("/dashboard/student");
        return;
      }

      // 👉 FACULTY / ADMIN FLOW
      const roles = user.roles || [];

      const roleNames = roles.map((r: any) =>
        String(r.role_name).toLowerCase()
      );

      // Admin roles
      if (roleNames.includes("vc")) {
        navigate("/dashboard/admin/vc");
        return;
      }
      if (roleNames.includes("board_secretary")) {
        navigate("/dashboard/admin/board-secretary");
        return;
      }
      if (roleNames.includes("board_president")) {
        navigate("/dashboard/admin/board-president");
        return;
      }
      if (roleNames.includes("registrar")) {
        navigate("/dashboard/admin/registrar");
        return;
      }
      if (roleNames.includes("transport_office")) {
        navigate("/dashboard/admin/transport-office");
        return;
      }
      if (roleNames.includes("protocol_office")) {
        navigate("/dashboard/admin/protocol-office");
        return;
      }
      if (roleNames.includes("admin")) {
        navigate("/dashboard/admin");
        return;
      }

      // Advisor roles
      if (roleNames.includes("advisor")) {
        navigate("/dashboard/advisor");
        return;
      }

      // Default faculty
      navigate("/dashboard/faculty");

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || "Login failed");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${home2Image})`,
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Logo and Welcome Message */}
        <div className="hidden lg:flex flex-col items-start text-white space-y-6">
          {/* Logo with Welcome Message */}


          {!logoError ? (
              <img 
                src="/gcu.png" 
                alt="GCU Logo" 
                className="h-30 w-40 object-contain drop-shadow-2xl flex-shrink-0"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12" />
              </div>
            )}
          <div className="space-x-4 mb-8">
          
            <div className="flex flex-col">
              <span className="text-5xl font-lincoln mb-1 drop-shadow-lg">Government College University Lahore</span>
               <p className="text-lg text-white/90 leading-relaxed drop-shadow-md mt-2 text-[#caac70]">
                Welcome to the GCU Societies Portal, use your LMS credentials to log in and access services.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex items-center justify-center w-full">
          <div 
            className="w-full max-w-sm p-8 rounded-lg shadow-2xl"
            style={{
              backgroundColor: '#CAAC70',
            }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-start justify-center mb-6 space-x-3">
              {!logoError ? (
                <img 
                  src="/gcu.png" 
                  alt="GCU Logo" 
                  className="h-16 w-16 object-contain flex-shrink-0"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <User className="h-12 w-12 text-[#59111C] flex-shrink-0" />
              )}
              <div className="text-center">
                <div className="text-lg font-lincoln text-[#59111C]">Government College</div>
                <div className="text-lg font-lincoln text-[#59111C] mb-2">University Lahore</div>
                <p className="text-sm text-[#59111C] mt-1">
                  Welcome to the GCU Societies Portal
                </p>
              </div>
            </div>

            {/* Card Title */}
            <div className="mb-6">
              <h2 
                className="text-2xl font-bold mb-1 font-sans text-center"
                style={{ color: '#59111C' }}
              >
                GCU SOCIETIES PORTAL
              </h2>
              <div 
                className="h-0.5 w-full mb-2"
                style={{ backgroundColor: '#59111C' }}
              ></div>
              <p 
                className="text-sm"
                style={{ color: '#59111C' }}
              >
                Sign in to continue
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Roll Number Input */}
              <div className="space-y-2">
                <div className="relative">
                  <User 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{ color: '#59111C' }}
                  />
                  <Input
                    type="text"
                    placeholder="0012-BS-SP-CS-24"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 h-12 border-2 rounded-md"
                    style={{ 
                      borderColor: '#59111C',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 relative">
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{ color: '#59111C' }}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 pr-10 h-12 border-2 rounded-md"
                    style={{ 
                      borderColor: '#59111C',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: '#59111C' }}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="p-3 rounded-md text-sm"
                  style={{ 
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    color: '#dc2626',
                    border: '1px solid #dc2626'
                  }}
                >
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-white font-bold text-lg rounded-md shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #59111C 0%, #1e3a8a 100%)',
                }}
              >
                LOGIN
              </Button>
            </form>

            {/* Footer Notes */}
            <div className="mt-6 text-center space-y-1">
              <p 
                className="text-xs"
                style={{ color: '#59111C' }}
              >
                Note: If login does not work, contact DIT
              </p>
              <p 
                className="text-xs"
                style={{ color: '#59111C' }}
              >
                Need help?{' '}
                <a 
                  href="#" 
                  className="underline font-semibold hover:opacity-80"
                  style={{ color: '#1e3a8a' }}
                >
                  Login Guide
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
