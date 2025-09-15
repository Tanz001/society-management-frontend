import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/components/LandingPage";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import SocietyDetail from "@/components/societies/SocietyDetail";
import SocietyRegistration from "@/components/society/SocietyRegistration";
import SocietyDashboard from "@/components/society/SocietyDashboard";
import CreatePost from "@/components/society/CreatePost";
import AdminDashboard from "@/components/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Authentication Routes */}
          <Route path="/auth/student" element={
            <AuthLayout title="Student Login" subtitle="Access your student dashboard">
              <LoginForm userType="student" />
            </AuthLayout>
          } />
          <Route path="/auth/society" element={
            <AuthLayout title="Society Owner Login" subtitle="Manage your society">
              <LoginForm userType="society" />
            </AuthLayout>
          } />
          <Route path="/auth/admin" element={
            <AuthLayout title="Administrator Login" subtitle="Access admin panel">
              <LoginForm userType="admin" />
            </AuthLayout>
          } />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/explore" element={<StudentDashboard />} />
          
          {/* Society Routes */}
          <Route path="/society/:id" element={<SocietyDetail />} />
          <Route path="/society/register" element={<SocietyRegistration />} />
          <Route path="/dashboard/society" element={<SocietyDashboard />} />
          <Route path="/society/post/create" element={<CreatePost />} />
          
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
