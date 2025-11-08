import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // if true, user must be logged in
  guestOnly?: boolean;   // if true, only non-logged-in users can access
}

const ProtectedRoute = ({ children, requireAuth = false, guestOnly = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  console.log("ProtectedRoute - Route check:", {
    path: location.pathname,
    requireAuth,
    guestOnly,
    isAuthenticated,
    token: token ? "exists" : "missing"
  });

  // If route requires auth and user is not logged in
  if (requireAuth && !isAuthenticated) {
    console.log("ProtectedRoute - Redirecting to login (not authenticated)");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If route is guest-only and user is logged in
  if (guestOnly && isAuthenticated) {
    console.log("ProtectedRoute - Redirecting to dashboard (already authenticated)");
    return <Navigate to="/dashboard/student" replace />;
  }

  console.log("ProtectedRoute - Access granted");
  return <>{children}</>;
};

export default ProtectedRoute;

