import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboard";

function NavItem({ to, icon, label, count, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-[6px] rounded text-[13px] font-medium transition-colors ${
          isActive
            ? "bg-[#e9f2ff] text-[#0052cc]"
            : "text-[#44546f] hover:bg-[#f1f2f4] hover:text-[#172b4d]"
        }`
      }
    >
      <span className="flex-shrink-0 w-4 h-4 opacity-80">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-auto bg-[#0052cc] text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight">
          {count}
        </span>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[11px] font-semibold text-[#8590a2] uppercase tracking-wider">
      {children}
    </p>
  );
}

const IC = {
  dash: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  queue: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  workflow: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  users: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  shield: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  inbox: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
  clock: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  check: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  list: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    dashboardApi.stats().then((s) => setCounts(s.queue_counts || {})).catch(() => {});
  }, []);

  return (
    <aside className="w-[220px] min-h-screen bg-[#f7f8f9] border-r border-[#dfe1e6] flex flex-col flex-shrink-0">
      {/* Logo / Project header */}
      <div className="px-4 py-3 border-b border-[#dfe1e6]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#0052cc] flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#172b4d] truncate leading-tight">IT Service Desk</p>
            <p className="text-[11px] text-[#8590a2] truncate">Bazaar Technologies</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <SectionLabel>Overview</SectionLabel>
        <NavItem to="/admin" end icon={IC.dash} label="Dashboard" />

        <SectionLabel>Queues</SectionLabel>
        <NavItem to="/admin/queues/unassigned"       icon={IC.inbox}  label="Unassigned"        count={counts.unassigned} />
        <NavItem to="/admin/queues/service_requests" icon={IC.queue}  label="Service Requests"  count={counts.service_requests} />
        <NavItem to="/admin/queues/incidents"        icon={IC.queue}  label="Incidents"         count={counts.incidents} />
        <NavItem to="/admin/queues/hardware"         icon={IC.queue}  label="Hardware Requests" count={counts.hardware} />
        <NavItem to="/admin/queues/onboarding"       icon={IC.queue}  label="Onboarding"        count={counts.onboarding} />
        <NavItem to="/admin/queues/offboarding"      icon={IC.queue}  label="Offboarding"       count={counts.offboarding} />
        <NavItem to="/admin/queues/pending_approval" icon={IC.clock}  label="Pending Approval"  count={counts.pending_approval} />
        <NavItem to="/admin/queues/in_progress"      icon={IC.clock}  label="In Progress"       count={counts.in_progress} />
        <NavItem to="/admin/queues/hold"             icon={IC.clock}  label="On Hold"           count={counts.hold} />
        <NavItem to="/admin/queues/resolved"         icon={IC.check}  label="All Resolved"      count={counts.resolved} />
        <NavItem to="/admin/queues/all"              icon={IC.list}   label="All Tickets" />

        <SectionLabel>Settings</SectionLabel>
        <NavItem to="/admin/workflows" icon={IC.workflow} label="Workflows" />
        {user?.role === "manager" && <NavItem to="/admin/users"          icon={IC.users}  label="Users" />}
        {user?.role === "manager" && <NavItem to="/admin/approver-rules" icon={IC.shield} label="Approver Rules" />}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-[#dfe1e6] bg-[#f7f8f9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[#172b4d] truncate">{user?.full_name}</p>
            <p className="text-[11px] text-[#8590a2] capitalize truncate">{user?.role}</p>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            title="Sign out"
            className="text-[#8590a2] hover:text-[#172b4d] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
