import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../../api/dashboard";
import Sidebar from "../../components/Sidebar";

const TYPE_LABELS = {
  onboarding: "Colleague Onboarding", offboarding: "Colleague Offboarding",
  access_google: "Google Workspace", access_commando: "Commando Access",
  access_nucleus: "Nucleus Access", access_superset: "SuperSet Access",
  access_platform: "Platform Scopes", access_lending: "Lending Portal",
  system_problem: "System Problem",
};

function StatCard({ label, value, color = "text-gray-900", sub }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardApi.stats().then(setStats).catch(() => {});
  }, []);

  const PRIORITY_COLORS = { P1: "text-red-600", P2: "text-orange-500", P3: "text-yellow-500", P4: "text-gray-500" };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#f4f5f7] overflow-auto">
        <div className="px-8 py-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

          {!stats ? (
            <div className="text-gray-400">Loading stats...</div>
          ) : (
            <>
              {/* Top stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <StatCard label="Total Tickets" value={stats.total} />
                <StatCard label="Open" value={stats.open} color="text-blue-600" sub="Unresolved" />
                <StatCard label="Resolved" value={stats.resolved} color="text-green-600" sub="All time" />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* By Type */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Tickets by Type</h2>
                  <div className="space-y-2">
                    {Object.entries(stats.by_type)
                      .filter(([, v]) => v > 0)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 flex-1 truncate">{TYPE_LABELS[type] || type}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 bg-blue-500 rounded" style={{ width: Math.max(8, (count / stats.total) * 120) }} />
                            <span className="text-sm font-medium text-gray-900 w-6 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* By Priority */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Tickets by Priority</h2>
                  <div className="space-y-3">
                    {["P1", "P2", "P3", "P4"].map((p) => (
                      <div key={p} className="flex items-center gap-3">
                        <span className={`text-sm font-bold w-6 ${PRIORITY_COLORS[p]}`}>{p}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: stats.total ? `${((stats.by_priority[p] || 0) / stats.total) * 100}%` : 0 }}
                          />
                        </div>
                        <span className="text-sm text-gray-700 w-6 text-right">{stats.by_priority[p] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Queue shortcuts */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Queue Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: "service_requests", label: "Service Requests", path: "/admin/queues/service_requests" },
                    { key: "onboarding", label: "Onboarding", path: "/admin/queues/onboarding" },
                    { key: "offboarding", label: "Offboarding", path: "/admin/queues/offboarding" },
                  ].map(({ key, label, path }) => (
                    <button
                      key={key}
                      onClick={() => navigate(path)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                    >
                      <p className="text-2xl font-bold text-gray-900">{stats.queue_counts[key] || 0}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{label}</p>
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
