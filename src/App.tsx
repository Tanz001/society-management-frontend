import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/components/LandingPage";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import SocietyDetail from "@/components/societies/SocietyDetail";
import SocietyRegistration from "@/components/society/SocietyRegistration";
import SocietyDashboard from "@/components/society/SocietyDashboard";
import CreatePost from "@/components/society/CreatePost";
import AdminDashboard from "@/components/admin/AdminDashboard";
import BoardDashboard from "@/components/admin/BoardDashboard";
import BoardSecretaryDashboard from "@/components/admin/BoardSecretaryDashboard";
import BoardPresidentDashboard from "@/components/admin/BoardPresidentDashboard";
import RegistrarDashboard from "@/components/admin/RegistrarDashboard";
import VCDashboard from "@/components/admin/VCDashboard";
import NotFound from "./pages/NotFound";
import RegisterForm from "./components/auth/RegisterForm";
import ProfilePage from "./components/profile/ProfilePage";
import Analytics from "./components/society/Analytics";
import EventsManagement from "./components/society/EventsManagement";
import EngagementPage from "./components/engagement/EngagementPage";
import EventsPage from "./components/events/EventsPage";
import MembershipRegistration from "./components/membership/MembershipRegistration";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Default route is login */}
          <Route path="/" element={
            <ProtectedRoute guestOnly>
              <AuthLayout title="Student Login" subtitle="Access your student dashboard">
                <LoginForm userType="student" />
              </AuthLayout>
            </ProtectedRoute>
          } />
          
          {/* Landing page moved to /welcome */}
          <Route path="/welcome" element={<LandingPage />} />
          
          {/* Redirect /auth/login to root */}
          <Route path="/auth/login" element={<Navigate to="/" replace />} />
          
          <Route path="/auth/register" element={
            <ProtectedRoute guestOnly>
              <RegisterForm />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes (Require Authentication) */}
          <Route path="/dashboard/student" element={
            <ProtectedRoute requireAuth>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/explore" element={
            <ProtectedRoute requireAuth>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          {/* Society Routes */}
          <Route path="/society/:id" element={
            <ProtectedRoute requireAuth>
              <SocietyDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/society/register" element={
            <ProtectedRoute requireAuth>
              <SocietyRegistration />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/society" element={
            <ProtectedRoute requireAuth>
              <SocietyDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/society/post/create" element={
            <ProtectedRoute requireAuth>
              <CreatePost />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute requireAuth>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Role-based Admin Routes */}
          <Route path="/dashboard/admin/board" element={
            <ProtectedRoute requireAuth>
              <BoardDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/admin/board-secretary" element={
            <ProtectedRoute requireAuth>
              <BoardSecretaryDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/admin/board-president" element={
            <ProtectedRoute requireAuth>
              <BoardPresidentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/admin/registrar" element={
            <ProtectedRoute requireAuth>
              <RegistrarDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/admin/vc" element={
            <ProtectedRoute requireAuth>
              <VCDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/society/registration" element={
            <ProtectedRoute requireAuth>
              <SocietyRegistration />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute requireAuth>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute requireAuth>
              <Analytics />
            </ProtectedRoute>
          } />
          
          <Route path="/event" element={
            <ProtectedRoute requireAuth>
              <EventsManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/engagement" element={
            <ProtectedRoute requireAuth>
              <EngagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events" element={
            <ProtectedRoute requireAuth>
              <EventsPage />
            </ProtectedRoute>
          } />






          
          <Route path="/membership/register" element={
            <ProtectedRoute requireAuth>
              <MembershipRegistration />
            </ProtectedRoute>
          } />
          
          <Route path="/membership/register/:societyId" element={
            <ProtectedRoute requireAuth>
              <MembershipRegistration />
            </ProtectedRoute>
          } />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
