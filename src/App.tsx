import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
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
import TransportOfficeDashboard from "@/components/admin/TransportOfficeDashboard";
import ProtocolOfficeDashboard from "@/components/admin/ProtocolOfficeDashboard";
import PRDashboard from "@/components/admin/PRDashboard";
import RoleAccess from "@/components/admin/RoleAccess";
import AddFaculty from "@/components/admin/AddFaculty";
import AdvisorDashboard from "@/components/admin/AdvisorDashboard";
import ChiefProctorDashboard from "@/components/admin/ChiefProctorDashboard";
import SecurityOfficeDashboard from "@/components/admin/SecurityOfficeDashboard";
import NotFound from "./pages/NotFound";
import RegisterForm from "./components/auth/RegisterForm";
import ProfilePage from "./components/profile/ProfilePage";
import Analytics from "./components/society/Analytics";
import EventsManagement from "./components/society/EventsManagement";
import EngagementPage from "./components/engagement/EngagementPage";
import EventsPage from "./components/events/EventsPage";
import MembershipRegistration from "./components/membership/MembershipRegistration";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SocietyEventRequestPage from "./components/society/SocietyEventRequestPage";
import SocietyEventsPage from "./components/admin/SocietyEventsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Default route is login */}
          <Route path="/" element={
            <ProtectedRoute guestOnly>
              <LoginForm />
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

          <Route path="/dashboard/society/:societyId" element={
            <ProtectedRoute requireAuth>
              <SocietyDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/society/event-request/create" element={
            <ProtectedRoute requireAuth>
              <SocietyEventRequestPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/society/event-request/edit/:reqId" element={
            <ProtectedRoute requireAuth>
              <SocietyEventRequestPage />
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

          <Route path="/admin/society/:societyId/events" element={
            <ProtectedRoute requireAuth>
              <SocietyEventsPage />
            </ProtectedRoute>
          } />

          {/* Transport Office and Protocol Office Routes */}
          <Route path="/dashboard/admin/transport-office" element={
            <ProtectedRoute requireAuth>
              <TransportOfficeDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin/protocol-office" element={
            <ProtectedRoute requireAuth>
              <ProtocolOfficeDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin/pr-dashboard" element={
            <ProtectedRoute requireAuth>
              <PRDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin/chief-proctor" element={
            <ProtectedRoute requireAuth>
              <ChiefProctorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin/security-office" element={
            <ProtectedRoute requireAuth>
              <SecurityOfficeDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin/role-access" element={
            <ProtectedRoute requireAuth>
              <RoleAccess />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/admin/add-faculty" element={
            <ProtectedRoute requireAuth>
              <AddFaculty />
            </ProtectedRoute>
          } />

          {/* Advisor Dashboard */}
          <Route path="/dashboard/advisor" element={
            <ProtectedRoute requireAuth>
              <AdvisorDashboard />
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