import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ticketsApi } from "../../api/tickets";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";

const TYPE_LABELS = {
  onboarding: "Colleague Onboarding", offboarding: "Colleague Offboarding",
  access_google: "Google Workspace", access_commando: "Commando Access",
  access_nucleus: "Nucleus Access", access_superset: "SuperSet Access",
  access_platform: "Platform Scopes", access_lending: "Lending Portal",
  system_problem: "System Problem",
};

const QUEUE_CONFIG = {
  service_requests: {
    label: "Service Requests",
    types: ["access_google", "access_commando", "access_nucleus", "access_superset", "access_platform", "access_lending", "system_problem"],
  },
  onboarding: { label: "Onboarding", types: ["onboarding"] },
  offboarding: { label: "Offboarding", types: ["offboarding"] },
  all: { label: "All Tickets", types: null },
};

export default function Queue() {
  const { queue } = useParams();
  const navigate = useNavigate();
  const config = QUEUE_CONFIG[queue] || QUEUE_CONFIG.all;

  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const load = () => {
    setLoading(true);
    const promises = config.types
      ? config.types.map((type) =>
          ticketsApi.list({ ticket_type: type, status: statusFilter || undefined, priority: priorityFilter || undefined, q: search || undefined, page, limit })
        )
      : [ticketsApi.list({ status: statusFilter || undefined, priority: priorityFilter || undefined, q: search || undefined, page, limit })];

    Promise.all(promises)
      .then((results) => {
        const all = results.flatMap((r) => r.items);
        all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTickets(all);
        setTotal(results.reduce((s, r) => s + r.total, 0));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [queue, statusFilter, priorityFilter, search, page]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#f4f5f7] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-gray-900">{config.label}</h1>
            <span className="text-sm text-gray-500">{total} tickets</span>
          </div>
          {/* Filters */}
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search tickets..."
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {["WAITING FOR SUPPORT", "ACKNOWLEDGE", "IN PROGRESS", "CREATE CREDENTIALS", "AWAITING APPROVAL", "HOLD", "RESOLVED", "NOT APPROVED", "REJECTED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              {["P1", "P2", "P3", "P4"].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="text-gray-400 text-center py-12">Loading...</div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Ticket #", "Summary", "Type", "Reporter", "Assignee", "Status", "Priority", "Created"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/admin/tickets/${t.id}`)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-[#0052cc] whitespace-nowrap">{t.ticket_number}</td>
                        <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">{t.title}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{TYPE_LABELS[t.ticket_type] || t.ticket_type}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.reporter?.full_name}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.assignee?.full_name || <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                        <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No tickets found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > limit && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Previous</button>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total} className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
