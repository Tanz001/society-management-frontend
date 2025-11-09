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
      <div className="hidden lg:flex gradient-hero text-white p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center mb-8 hover:opacity-80 transition-smooth">
            {!logoError ? (
              <img 
                src="/university-logo.png" 
                alt="University Logo" 
                className="h-12 w-12 mr-3 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <BookOpen className="h-10 w-10 mr-3" />
            )}
            <span className="text-2xl font-bold">University Societies</span>
          </Link>
          
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">Welcome to Your University Community</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Join thousands of students in discovering, creating, and participating in 
              amazing societies that enrich your university experience.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">150+</div>
            <div className="text-sm text-white/80">Societies</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">5K+</div>
            <div className="text-sm text-white/80">Members</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">300+</div>
            <div className="text-sm text-white/80">Events/Month</div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Branding */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center mb-8 hover:opacity-80 transition-smooth">
              {!mobileLogoError ? (
                <img 
                  src="/university-logo.png" 
                  alt="University Logo" 
                  className="h-10 w-10 mr-2 object-contain"
                  onError={() => setMobileLogoError(true)}
                />
              ) : (
                <BookOpen className="h-8 w-8 mr-2 text-university-navy" />
              )}
              <span className="text-xl font-bold text-university-navy">University Societies</span>
            </Link>
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