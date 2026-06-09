import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ticketsApi } from "../../api/tickets";
import { usersApi } from "../../api/users";
import useAuthStore from "../../store/authStore";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";

const TYPE_LABELS = {
  onboarding: "Colleague Onboarding", offboarding: "Colleague Offboarding",
  incident: "Incident", hardware_request: "Hardware Request",
  access_google: "Google Workspace", access_commando: "Commando Access",
  access_nucleus: "Nucleus Access", access_superset: "SuperSet Access",
  access_platform: "Platform Scopes", access_lending: "Lending Portal",
  system_problem: "System Problem", it_service_request: "IT Service Request",
};

const ALL_STATUSES = [
  "WAITING FOR APPROVAL","WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS",
  "HOLD","PENDING VENDOR","PENDING","CREATE CREDENTIALS","CLOSE CREDENTIALS",
  "WAITING FOR LAPTOP","OPEN","WORK IN PROGRESS","COMPLETED",
  "RESOLVED","CANCELED","REJECTED","CLOSED",
];

const QUEUE_CONFIG = {
  unassigned: {
    label: "Unassigned Tickets",
    types: null,
    statuses: ALL_STATUSES,
    filterAssignee: "none",
  },
  service_requests: {
    label: "Service Requests",
    types: ["access_google","access_commando","access_nucleus","access_superset","access_platform","access_lending","system_problem","it_service_request"],
    statuses: ["WAITING FOR APPROVAL","WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS","HOLD","RESOLVED","REJECTED","CANCELED"],
  },
  incidents: {
    label: "Incidents",
    types: ["incident"],
    statuses: ["OPEN","WORK IN PROGRESS","PENDING","COMPLETED","CANCELED","CLOSED"],
  },
  hardware: {
    label: "Hardware Requests",
    types: ["hardware_request"],
    statuses: ["WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS","HOLD","PENDING VENDOR","RESOLVED","CANCELED"],
  },
  onboarding: {
    label: "Onboarding",
    types: ["onboarding"],
    statuses: ["WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS","HOLD","CREATE CREDENTIALS","RESOLVED","CANCELED"],
  },
  offboarding: {
    label: "Offboarding",
    types: ["offboarding"],
    statuses: ["WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS","HOLD","CLOSE CREDENTIALS","WAITING FOR LAPTOP","RESOLVED","CANCELED"],
  },
  pending_approval: {
    label: "Pending Approval",
    types: null,
    statuses: ALL_STATUSES,
    filterStatus: "WAITING FOR APPROVAL",
  },
  in_progress: {
    label: "In Progress",
    types: null,
    statuses: ALL_STATUSES,
    filterStatus: "IN PROGRESS",
  },
  hold: {
    label: "On Hold",
    types: null,
    statuses: ALL_STATUSES,
    filterStatus: "HOLD",
  },
  resolved: {
    label: "All Resolved",
    types: null,
    statuses: ALL_STATUSES,
    filterStatus: "RESOLVED",
  },
  all: {
    label: "All Tickets",
    types: null,
    statuses: ALL_STATUSES,
  },
};

export default function Queue() {
  const { queue } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const config = QUEUE_CONFIG[queue] || QUEUE_CONFIG.all;

  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const activeFilterCount = [statusFilter, assigneeFilter, employeeName, dateFrom, dateTo].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter(""); setAssigneeFilter("");
    setEmployeeName(""); setDateFrom(""); setDateTo(""); setSearch(""); setPage(1);
  };

  useEffect(() => {
    usersApi.list().then((u) => setAgents(u.filter((u) => u.role !== "customer"))).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    // Use config-level filterStatus if no user filter applied
    const effectiveStatus = statusFilter || config.filterStatus || undefined;
    const params = {
      status: effectiveStatus,
      q: search || undefined,
      full_name: employeeName || undefined,
      page,
      limit,
    };

    const promises = config.types
      ? config.types.map((type) => ticketsApi.list({ ...params, ticket_type: type }))
      : [ticketsApi.list(params)];

    Promise.all(promises)
      .then((results) => {
        let all = results.flatMap((r) => r.items);
        // client-side filtering for assignee & date
        if (assigneeFilter) all = all.filter((t) => String(t.assignee_id) === assigneeFilter);
        if (config.filterAssignee === "none") all = all.filter((t) => !t.assignee_id);
        if (dateFrom) all = all.filter((t) => new Date(t.created_at) >= new Date(dateFrom));
        if (dateTo) all = all.filter((t) => new Date(t.created_at) <= new Date(dateTo + "T23:59:59"));
        all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTickets(all);
        setTotal(results.reduce((s, r) => s + r.total, 0));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [queue, statusFilter, priorityFilter, assigneeFilter, employeeName, dateFrom, dateTo, search, page]);

  const handleDelete = async (e, ticketId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    await ticketsApi.delete(ticketId);
    setSelected((prev) => { const n = new Set(prev); n.delete(ticketId); return n; });
    load();
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    if (selected.size === tickets.length) setSelected(new Set());
    else setSelected(new Set(tickets.map((t) => t.id)));
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} ticket(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    await Promise.all([...selected].map((id) => ticketsApi.delete(id)));
    setSelected(new Set());
    setBulkDeleting(false);
    load();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#f4f5f7] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-gray-900">{config.label}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{total} tickets</span>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border transition-colors ${showFilters || activeFilterCount > 0 ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-red-500">Clear all</button>
              )}
            </div>
          </div>

          {/* Search bar always visible */}
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ticket number or title..."
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />

          {/* Expandable filter panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 md:grid-cols-4">
              {/* Status */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {config.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Assignee</label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => { setAssigneeFilter(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Assignees</option>
                  <option value="unassigned">Unassigned</option>
                  {agents.map((a) => <option key={a.id} value={String(a.id)}>{a.full_name}</option>)}
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => { setEmployeeName(e.target.value); setPage(1); }}
                  placeholder="Search by full name..."
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date from */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Created From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date to */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Created To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {statusFilter && <FilterChip label={`Status: ${statusFilter}`} onRemove={() => setStatusFilter("")} />}
              {assigneeFilter && <FilterChip label={`Assignee: ${agents.find(a => String(a.id) === assigneeFilter)?.full_name || assigneeFilter}`} onRemove={() => setAssigneeFilter("")} />}
              {employeeName && <FilterChip label={`Full Name: ${employeeName}`} onRemove={() => setEmployeeName("")} />}
              {dateFrom && <FilterChip label={`From: ${dateFrom}`} onRemove={() => setDateFrom("")} />}
              {dateTo && <FilterChip label={`To: ${dateTo}`} onRemove={() => setDateTo("")} />}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2.5 rounded-lg mb-3">
              <span className="text-sm font-medium">{selected.size} ticket{selected.size > 1 ? "s" : ""} selected</span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {bulkDeleting ? "Deleting..." : "Delete Selected"}
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="ml-auto text-gray-400 hover:text-white text-xs"
              >
                Clear selection
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-gray-400 text-center py-12">Loading...</div>
          ) : (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={tickets.length > 0 && selected.size === tickets.length}
                          ref={(el) => { if (el) el.indeterminate = selected.size > 0 && selected.size < tickets.length; }}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                      </th>
                      {["Ticket #", "Summary", "Type", "Reporter", "Assignee", "Status", "Priority", "Created", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/admin/tickets/${t.id}`)}
                        className={`cursor-pointer transition-colors ${selected.has(t.id) ? "bg-blue-50" : "hover:bg-blue-50"}`}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(t.id)}
                            onChange={(e) => toggleSelect(e, t.id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-[#0052cc] whitespace-nowrap">{t.ticket_number}</td>
                        <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">{t.title}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{TYPE_LABELS[t.ticket_type] || t.ticket_type}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.reporter?.full_name}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.assignee?.full_name || <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                        <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDelete(e, t.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                            title="Delete ticket"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
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

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 ml-0.5 font-bold">×</button>
    </span>
  );
}
