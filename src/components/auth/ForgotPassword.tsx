import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Mail, 
  ArrowLeft,
  CheckCircle,
  KeyRound
} from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "sent" | "reset">("email");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendReset = () => {
    // Handle sending reset email
    console.log("Sending reset email to:", email);
    setStep("sent");
  };

  const handleVerifyCode = () => {
    // Handle verifying reset code
    console.log("Verifying code:", resetCode);
    setStep("reset");
  };

  const handleResetPassword = () => {
    // Handle password reset
    console.log("Resetting password");
    // Redirect to login or show success message
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-university-navy/10 p-4 rounded-full w-fit mx-auto mb-4">
            <KeyRound className="h-8 w-8 text-university-navy" />
          </div>
          <h1 className="text-3xl font-bold text-university-navy mb-2">
            {step === "email" && "Forgot Password"}
            {step === "sent" && "Check Your Email"}
            {step === "reset" && "Reset Password"}
          </h1>
          <p className="text-muted-foreground">
            {step === "email" && "Enter your email to receive a password reset link"}
            {step === "sent" && "We've sent a password reset code to your email"}
            {step === "reset" && "Enter your new password below"}
          </p>
        </div>

        <Card className="p-8 shadow-card">
          {step === "email" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your university email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button onClick={handleSendReset} className="w-full" variant="university">
                <Mail className="h-4 w-4 mr-2" />
                Send Reset Link
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-university-navy hover:text-university-gold"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {step === "sent" && (
            <div className="space-y-6 text-center">
              <div className="bg-university-gold/10 p-6 rounded-lg">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-university-gold" />
                <h3 className="font-semibold text-university-navy mb-2">Email Sent!</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset code to <strong>{email}</strong>.
                  Please check your inbox and enter the code below.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reset Code</label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full text-center"
                  maxLength={6}
                />
              </div>

              <Button onClick={handleVerifyCode} className="w-full" variant="university">
                Verify Code
              </Button>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={handleSendReset}
                    className="text-university-navy hover:text-university-gold font-medium"
                  >
                    resend the code
                  </button>
                </p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-university-navy hover:text-university-gold"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {step === "reset" && (
            <div className="space-y-6">
              <div className="bg-university-gold/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-university-gold" />
                  <span className="text-sm font-medium text-university-navy">
                    Code verified successfully
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long and contain at least one uppercase letter, 
                  one lowercase letter, and one number.
                </p>
              </div>

              <Button onClick={handleResetPassword} className="w-full" variant="university">
                <KeyRound className="h-4 w-4 mr-2" />
                Reset Password
              </Button>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center text-sm text-university-navy hover:text-university-gold"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;