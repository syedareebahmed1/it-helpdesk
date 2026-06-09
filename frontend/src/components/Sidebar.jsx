import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboard";

const ICON_QUEUES = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);
const ICON_DASH = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const ICON_WORKFLOW = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const ICON_USERS = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

function NavItem({ to, icon, label, count, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-1.5 rounded text-sm transition-colors ${
          isActive
            ? "bg-white text-black font-medium"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="ml-auto bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {count}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    dashboardApi.stats().then((s) => {
      setCounts(s.queue_counts || {});
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-[#111111] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg" style={{ fontFamily: "serif" }}>بازار</span>
          <span className="text-gray-400 text-xs leading-tight">IT Service<br />Desk</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        <p className="px-3 pt-1 pb-0.5 text-gray-500 text-xs uppercase tracking-wider font-medium">Overview</p>
        <NavItem to="/admin" end icon={ICON_DASH} label="Dashboard" />

        <p className="px-3 pt-3 pb-0.5 text-gray-500 text-xs uppercase tracking-wider font-medium">Queues</p>
        <NavItem
          to="/admin/queues/service_requests"
          icon={ICON_QUEUES}
          label="Service Requests"
          count={counts.service_requests}
        />
        <NavItem
          to="/admin/queues/onboarding"
          icon={ICON_QUEUES}
          label="Onboarding"
          count={counts.onboarding}
        />
        <NavItem
          to="/admin/queues/offboarding"
          icon={ICON_QUEUES}
          label="Offboarding"
          count={counts.offboarding}
        />
        <NavItem to="/admin/queues/all" icon={ICON_QUEUES} label="All Tickets" />

        <p className="px-3 pt-3 pb-0.5 text-gray-500 text-xs uppercase tracking-wider font-medium">Settings</p>
        <NavItem to="/admin/workflows" icon={ICON_WORKFLOW} label="Workflows" />
        {user?.role === "manager" && (
          <NavItem to="/admin/users" icon={ICON_USERS} label="Users" />
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.full_name}</p>
            <p className="text-gray-400 text-xs truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-gray-400 hover:text-white text-xs px-1 py-0.5 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
