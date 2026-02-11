import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import home2Image from "@/assets/images/image5.png";

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
        // Synchroniser les données de l'étudiant depuis l'API externe
        // Le token de l'API LMS est utilisé pour appeler l'API userProfile
        try {
          const API_URL = import.meta.env.VITE_API_URL;
          const syncResponse = await axios.post(`${API_URL}/user/student/sync`, {
            token: res.data.token, // Token de l'API LMS (https://lms.gcu.edu.pk/api/fc/login)
          });
          console.log("Student data synchronized successfully:", syncResponse.data);
        } catch (syncError: any) {
          // Ne pas bloquer le login si la synchronisation échoue
          console.error("Error syncing student data:", syncError.response?.data || syncError.message);
        }

        navigate("/dashboard/student");
        return;
      }

      // 👉 FACULTY / ADMIN FLOW
      const roles = user.roles || [];

      console.log("User roles from login:", roles);
      console.log("User object:", user);

      const roleNames = roles.map((r: any) =>
        String(r.role_name).toLowerCase()
      );

      console.log("Role names extracted:", roleNames);

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
      if (roleNames.includes("transport") || roleNames.includes("transport_office")) {
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

      // Proctor and Security roles
      if (roleNames.some(r => r === "proctor" || r === "chief_proctor")) {
        navigate("/dashboard/admin/chief-proctor");
        return;
      }

      if (roleNames.some(r => r === "security" || r === "security_office")) {
        navigate("/dashboard/admin/security-office");
        return;
      }

      // Advisor roles - check for advisor role
      if (roleNames.includes("advisor")) {
        console.log("Advisor role detected, navigating to /dashboard/advisor");
        navigate("/dashboard/advisor");
        return;
      }

      // If no roles found but user is faculty, default to advisor dashboard
      // (since faculty without specific roles might be advisors)
      if (user.faculty_id && roles.length === 0) {
        console.log("No roles found, but faculty_id exists. Navigating to advisor dashboard as fallback");
        navigate("/dashboard/advisor");
        return;
      }

      // Default fallback - show error instead of navigating to non-existent route
      console.error("No matching role found for user:", user);
      setError("Unable to determine user role. Please contact administrator.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

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
        {/* Light overlay for better text readability only */}
        <div className="absolute inset-0 bg-black/10"></div>
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
            <div
              className="h-24 w-24 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <User className="h-12 w-12 text-white" />
            </div>
          )}
          <div className="space-x-4 mb-8">
            <div className="flex flex-col">
              <span
                className="text-5xl font-lincoln mb-1 drop-shadow-2xl"
                style={{
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                Government College University Lahore
              </span>
              <p
                className="text-lg leading-relaxed drop-shadow-lg mt-2"
                style={{
                  color: 'rgba(206, 173, 114, 1)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                Welcome to the GCU Societies Portal, access your societies and events.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex items-center justify-center w-full">
          <div
            className="w-full max-w-sm p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 92, 0.25) 0%, rgba(91, 0, 7, 0.25) 50%, rgba(206, 173, 114, 0.2) 100%)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 92, 0.37), 0 4px 16px 0 rgba(91, 0, 7, 0.2)',
            }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-start justify-center mb-6 space-x-3">
              {!logoError ? (
                <img
                  src="/gcu.png"
                  alt="GCU Logo"
                  className="h-16 w-16 object-contain flex-shrink-0 drop-shadow-lg"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <User className="h-12 w-12 text-white flex-shrink-0 drop-shadow-lg" />
              )}
              <div className="text-center">
                <div
                  className="text-lg font-lincoln drop-shadow-lg"
                  style={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  Government College
                </div>
                <div
                  className="text-lg font-lincoln mb-2 drop-shadow-lg"
                  style={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  University Lahore
                </div>
                <p
                  className="text-sm mt-1 drop-shadow-md"
                  style={{
                    color: 'rgba(206, 173, 114, 1)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Welcome to the GCU Societies Portal
                </p>
              </div>
            </div>

            {/* Card Title */}
            <div className="mb-6">
              <h2
                className="text-2xl font-bold mb-1 font-sans text-center drop-shadow-lg"
                style={{
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                GCU SOCIETIES PORTAL
              </h2>
              <div
                className="h-0.5 w-full mb-2 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(206, 173, 114, 0.8) 0%, rgba(91, 0, 7, 0.8) 50%, rgba(0, 0, 92, 0.8) 100%)',
                  boxShadow: '0 2px 4px rgba(206, 173, 114, 0.4)'
                }}
              ></div>
              <p
                className="text-sm text-center"
                style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10"
                    style={{ color: 'rgba(0, 0, 92, 0.8)' }}
                  />
                  <Input
                    type="text"
                    placeholder="email/username"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 h-12 border-2 rounded-lg backdrop-blur-sm"
                    style={{
                      borderColor: 'rgba(206, 173, 114, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 relative">
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10"
                    style={{ color: 'rgba(0, 0, 92, 0.8)' }}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 pr-10 h-12 border-2 rounded-lg backdrop-blur-sm"
                    style={{
                      borderColor: 'rgba(206, 173, 114, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 hover:opacity-70 transition-opacity"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: 'rgba(0, 0, 92, 0.8)' }}
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
                className="w-full h-12 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 92, 0.9) 0%, rgba(91, 0, 7, 0.9) 50%, rgba(206, 173, 114, 0.8) 100%)',
                  border: '1px solid rgba(206, 173, 114, 0.3)',
                  boxShadow: '0 4px 15px rgba(0, 0, 92, 0.4), 0 2px 8px rgba(91, 0, 7, 0.3)',
                }}
              >
                LOGIN
              </Button>
            </form>

            {/* Footer Notes */}
            <div className="mt-6 text-center space-y-1">
              <p
                className="text-xs"
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >
                Note: If login does not work, contact DIT
              </p>
              <p
                className="text-xs"
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              >
                Need help?{' '}
                <a
                  href="#"
                  className="underline font-semibold hover:opacity-80 transition-opacity"
                  style={{
                    color: 'rgba(206, 173, 114, 1)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
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
