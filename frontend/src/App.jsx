import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import PortalHome from "./pages/portal/PortalHome";
import NewTicket from "./pages/portal/NewTicket";
import MyTickets from "./pages/portal/MyTickets";
import PortalTicketDetail from "./pages/portal/PortalTicketDetail";
import Dashboard from "./pages/admin/Dashboard";
import Queue from "./pages/admin/Queue";
import AdminTicketDetail from "./pages/admin/TicketDetail";
import Workflows from "./pages/admin/Workflows";
import Users from "./pages/admin/Users";

function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "customer") return <Navigate to="/portal" replace />;
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function AppRoutes() {
  const { fetchMe, user } = useAuthStore();
  const { loading } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer portal */}
      <Route path="/portal" element={<RequireAuth allowedRoles={["customer"]}><PortalHome /></RequireAuth>} />
      <Route path="/portal/new/:type" element={<RequireAuth allowedRoles={["customer"]}><NewTicket /></RequireAuth>} />
      <Route path="/portal/my-tickets" element={<RequireAuth allowedRoles={["customer"]}><MyTickets /></RequireAuth>} />
      <Route path="/portal/tickets/:id" element={<RequireAuth allowedRoles={["customer"]}><PortalTicketDetail /></RequireAuth>} />

      {/* Admin portal */}
      <Route path="/admin" element={<RequireAuth allowedRoles={["agent", "manager"]}><Dashboard /></RequireAuth>} />
      <Route path="/admin/queues/:queue" element={<RequireAuth allowedRoles={["agent", "manager"]}><Queue /></RequireAuth>} />
      <Route path="/admin/tickets/:id" element={<RequireAuth allowedRoles={["agent", "manager"]}><AdminTicketDetail /></RequireAuth>} />
      <Route path="/admin/workflows" element={<RequireAuth allowedRoles={["agent", "manager"]}><Workflows /></RequireAuth>} />
      <Route path="/admin/users" element={<RequireAuth allowedRoles={["manager"]}><Users /></RequireAuth>} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const { user, loading } = useAuthStore();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "customer") return <Navigate to="/portal" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
