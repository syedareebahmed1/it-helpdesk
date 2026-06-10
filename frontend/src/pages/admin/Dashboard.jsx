import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboard";
import Sidebar from "../../components/Sidebar";

const TYPE_LABELS = {
  onboarding: "Onboarding", offboarding: "Offboarding",
  access_google: "Google Workspace", access_commando: "Commando Access",
  access_nucleus: "Nucleus Access", access_superset: "SuperSet Access",
  access_platform: "Platform Scopes", access_lending: "Lending Portal",
  system_problem: "System Problem", incident: "Incident",
  hardware_request: "Hardware Request", it_service_request: "IT Service Request",
  access_aws: "AWS Access", access_platform_role: "Platform Role",
};

const PRIORITY_CFG = {
  P1: { label: "Critical", color: "#de350b", bg: "#ffebe6", bar: "#de350b" },
  P2: { label: "High",     color: "#ff5630", bg: "#ffebe6", bar: "#ff5630" },
  P3: { label: "Medium",   color: "#ff8b00", bg: "#fffae6", bar: "#ff8b00" },
  P4: { label: "Low",      color: "#36b37e", bg: "#e3fcef", bar: "#36b37e" },
};

function StatCard({ label, value, sub, accent = "#172b4d", bg = "white" }) {
  return (
    <div className="bg-white border border-[#dfe1e6] rounded-lg p-5 flex flex-col gap-1">
      <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wider">{label}</p>
      <p className="text-[32px] font-bold leading-none" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-[12px] text-[#8590a2]">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { dashboardApi.stats().then(setStats).catch(() => {}); }, []);

  return (
    <div className="flex min-h-screen bg-[#f7f8f9]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[22px] font-bold text-[#172b4d]">Dashboard</h1>
            <p className="text-[13px] text-[#6b778c] mt-0.5">Overview of IT Service Desk activity</p>
          </div>

          {!stats ? (
            <div className="flex items-center gap-3 text-[#8590a2] py-16 justify-center">
              <div className="w-5 h-5 border-2 border-[#0052cc] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px]">Loading dashboard…</span>
            </div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Tickets"  value={stats.total}    sub="All time" />
                <StatCard label="Open"           value={stats.open}     sub="Unresolved" accent="#0052cc" />
                <StatCard label="Resolved"       value={stats.resolved} sub="Completed"  accent="#00875a" />
                <StatCard label="Pending Approval" value={stats.queue_counts?.pending_approval || 0} sub="Awaiting review" accent="#ff8b00" />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-3 gap-4 mb-6">

                {/* By Type */}
                <div className="col-span-2 bg-white border border-[#dfe1e6] rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#dfe1e6] bg-[#f7f8f9]">
                    <h2 className="text-[13px] font-semibold text-[#172b4d]">Tickets by Type</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {Object.entries(stats.by_type)
                      .filter(([, v]) => v > 0)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 8)
                      .map(([type, count]) => {
                        const pct = stats.total ? (count / stats.total) * 100 : 0;
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <span className="text-[12px] text-[#44546f] w-36 truncate flex-shrink-0">{TYPE_LABELS[type] || type}</span>
                            <div className="flex-1 bg-[#f1f2f4] rounded-full h-2">
                              <div className="bg-[#0052cc] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[12px] font-semibold text-[#172b4d] w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* By Priority */}
                <div className="bg-white border border-[#dfe1e6] rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#dfe1e6] bg-[#f7f8f9]">
                    <h2 className="text-[13px] font-semibold text-[#172b4d]">By Priority</h2>
                  </div>
                  <div className="p-5 space-y-4">
                    {["P1","P2","P3","P4"].map((p) => {
                      const cfg = PRIORITY_CFG[p];
                      const count = stats.by_priority[p] || 0;
                      const pct = stats.total ? (count / stats.total) * 100 : 0;
                      return (
                        <div key={p}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] font-semibold" style={{ color: cfg.color }}>{p} — {cfg.label}</span>
                            <span className="text-[12px] font-bold text-[#172b4d]">{count}</span>
                          </div>
                          <div className="h-1.5 bg-[#f1f2f4] rounded-full">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.bar }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Queue shortcuts */}
              <div className="bg-white border border-[#dfe1e6] rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-[#dfe1e6] bg-[#f7f8f9]">
                  <h2 className="text-[13px] font-semibold text-[#172b4d]">Queue Summary</h2>
                </div>
                <div className="p-5 grid grid-cols-5 gap-3">
                  {[
                    { key: "unassigned",       label: "Unassigned",    path: "/admin/queues/unassigned",       accent: "#de350b" },
                    { key: "pending_approval", label: "Pending Approval", path: "/admin/queues/pending_approval", accent: "#ff8b00" },
                    { key: "in_progress",      label: "In Progress",   path: "/admin/queues/in_progress",      accent: "#0052cc" },
                    { key: "hold",             label: "On Hold",       path: "/admin/queues/hold",             accent: "#974f0c" },
                    { key: "resolved",         label: "Resolved",      path: "/admin/queues/resolved",         accent: "#00875a" },
                  ].map(({ key, label, path, accent }) => (
                    <button
                      key={key}
                      onClick={() => navigate(path)}
                      className="border border-[#dfe1e6] rounded-lg p-4 hover:border-[#4c9aff] hover:bg-[#e9f2ff] transition-colors text-left group"
                    >
                      <p className="text-[26px] font-bold group-hover:text-[#0052cc] transition-colors" style={{ color: accent }}>
                        {stats.queue_counts?.[key] || 0}
                      </p>
                      <p className="text-[12px] text-[#6b778c] mt-0.5 font-medium">{label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
