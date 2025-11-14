import { ReactNode, useState } from "react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const [logoError, setLogoError] = useState(false);
  const [mobileLogoError, setMobileLogoError] = useState(false);
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex gradient-hero text-white p-12 flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-12">
            {!logoError ? (
              <img 
                src="/gcu.png" 
                alt="GCU Logo" 
                className="h-20 w-20 mr-4 object-contain drop-shadow-lg"
                onError={() => setLogoError(true)}
              />
            ) : (
              <BookOpen className="h-16 w-16 mr-4" />
            )}
            <div className="flex flex-col">
              <span className="text-2xl font-bold mb-1">Government College</span>
              <span className="text-2xl font-bold">University Lahore</span>
            </div>
          </div>
          
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to Your University Community
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Join thousands of students in discovering, creating, and participating in 
              amazing societies that enrich your university experience.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex flex-col items-center mb-6">
              {!mobileLogoError ? (
                <img 
                  src="/gcu.png" 
                  alt="GCU Logo" 
                  className="h-16 w-16 mb-3 object-contain"
                  onError={() => setMobileLogoError(true)}
                />
              ) : (
                <BookOpen className="h-12 w-12 mb-3 text-university-navy" />
              )}
              <div className="text-center">
                <div className="text-lg font-bold text-university-navy">Government College</div>
                <div className="text-lg font-bold text-university-navy">University Lahore</div>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-university-navy mb-2">Login to Continue</h1>
            <p className="text-muted-foreground">Use your email and password</p>
          </div>

          {/* Form Content */}
          {children}

          {/* Back to Home */}
          <div className="text-center pt-4">
            <Button variant="ghost" asChild>
              <Link to="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;