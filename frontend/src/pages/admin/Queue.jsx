import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ticketsApi } from "../../api/tickets";
import { usersApi } from "../../api/users";
import useAuthStore from "../../store/authStore";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";

const TYPE_LABELS = {
  onboarding: "Onboarding", offboarding: "Offboarding",
  incident: "Incident", hardware_request: "Hardware Request",
  access_google: "Google Workspace", access_commando: "Commando Access",
  access_nucleus: "Nucleus Access", access_superset: "SuperSet Access",
  access_platform: "Platform Scopes", access_lending: "Lending Portal",
  access_aws: "AWS Access", access_platform_role: "Platform Role",
  system_problem: "System Problem", it_service_request: "IT Service Request",
};

const ALL_STATUSES = [
  "WAITING FOR APPROVAL","WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS",
  "HOLD","PENDING VENDOR","PENDING","CREATE CREDENTIALS","CLOSE CREDENTIALS",
  "WAITING FOR LAPTOP","OPEN","WORK IN PROGRESS","COMPLETED",
  "RESOLVED","CANCELED","REJECTED","CLOSED",
];

const QUEUE_CONFIG = {
  unassigned:      { label: "Unassigned Tickets",  types: null, statuses: ALL_STATUSES, filterAssignee: "none" },
  service_requests:{ label: "Service Requests",    types: ["access_google","access_commando","access_nucleus","access_superset","access_platform","access_lending","access_aws","access_platform_role","system_problem","it_service_request"], statuses: ["WAITING FOR APPROVAL","WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS","HOLD","RESOLVED","REJECTED","CANCELED"] },
  incidents:       { label: "Incidents",           types: ["incident"], statuses: ["OPEN","WORK IN PROGRESS","PENDING","COMPLETED","CANCELED","CLOSED"] },
  hardware:        { label: "Hardware Requests",   types: ["hardware_request"], statuses: ["WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS","HOLD","PENDING VENDOR","RESOLVED","CANCELED"] },
  onboarding:      { label: "Onboarding",          types: ["onboarding"], statuses: ["WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS","HOLD","CREATE CREDENTIALS","RESOLVED","CANCELED"] },
  offboarding:     { label: "Offboarding",         types: ["offboarding"], statuses: ["WAITING FOR SUPPORT","ACKNOWLEDGE","IN PROGRESS","HOLD","CLOSE CREDENTIALS","WAITING FOR LAPTOP","RESOLVED","CANCELED"] },
  pending_approval:{ label: "Pending Approval",    types: null, statuses: ALL_STATUSES, filterStatus: "WAITING FOR APPROVAL" },
  in_progress:     { label: "In Progress",         types: null, statuses: ALL_STATUSES, filterStatus: "IN PROGRESS" },
  hold:            { label: "On Hold",             types: null, statuses: ALL_STATUSES, filterStatus: "HOLD" },
  resolved:        { label: "All Resolved",        types: null, statuses: ALL_STATUSES, filterStatus: "RESOLVED" },
  all:             { label: "All Tickets",         types: null, statuses: ALL_STATUSES },
};

function Avatar({ name }) {
  if (!name) return <div className="w-6 h-6 rounded-full bg-[#dfe1e6] flex items-center justify-center text-[10px] font-bold text-[#44546f]">?</div>;
  const colors = ["#0052cc","#00875a","#403294","#008da6","#974f0c"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: bg }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default function Queue() {
  const { queue } = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const config    = QUEUE_CONFIG[queue] || QUEUE_CONFIG.all;

  const [tickets,      setTickets]      = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [agents,       setAgents]       = useState([]);
  const [showFilters,  setShowFilters]  = useState(false);
  const [selected,     setSelected]     = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [assigneeFilter,setAssigneeFilter]= useState("");
  const [employeeName,  setEmployeeName]  = useState("");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [page,          setPage]          = useState(1);
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
    const effectiveStatus = statusFilter || config.filterStatus || undefined;
    const params = { status: effectiveStatus, q: search || undefined, full_name: employeeName || undefined, page, limit };
    const promises = config.types
      ? config.types.map((type) => ticketsApi.list({ ...params, ticket_type: type }))
      : [ticketsApi.list(params)];

    Promise.all(promises).then((results) => {
      let all = results.flatMap((r) => r.items);
      if (assigneeFilter) all = all.filter((t) => String(t.assignee_id) === assigneeFilter);
      if (config.filterAssignee === "none") all = all.filter((t) => !t.assignee_id);
      if (dateFrom) all = all.filter((t) => new Date(t.created_at) >= new Date(dateFrom));
      if (dateTo)   all = all.filter((t) => new Date(t.created_at) <= new Date(dateTo + "T23:59:59"));
      all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTickets(all);
      setTotal(results.reduce((s, r) => s + r.total, 0));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [queue, statusFilter, assigneeFilter, employeeName, dateFrom, dateTo, search, page]);

  const handleDelete = async (e, ticketId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    await ticketsApi.delete(ticketId);
    setSelected((prev) => { const n = new Set(prev); n.delete(ticketId); return n; });
    load();
  };

  const toggleSelect    = (e, id) => { e.stopPropagation(); setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const toggleSelectAll = () => { if (selected.size === tickets.length) setSelected(new Set()); else setSelected(new Set(tickets.map((t) => t.id))); };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} ticket(s)?`)) return;
    setBulkDeleting(true);
    await Promise.all([...selected].map((id) => ticketsApi.delete(id)));
    setSelected(new Set()); setBulkDeleting(false); load();
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8f9]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">

        {/* ── Page header ── */}
        <div className="bg-white border-b border-[#dfe1e6] px-6 py-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-[#172b4d]">{config.label}</h1>
            <p className="text-[13px] text-[#6b778c] mt-0.5">{total} ticket{total !== 1 ? "s" : ""}</p>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-[#8590a2] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search tickets…"
              className="pl-9 pr-4 py-2 text-[13px] border border-[#dfe1e6] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#4c9aff] focus:border-[#4c9aff] w-56 text-[#172b4d] placeholder-[#8590a2]"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 text-[13px] font-medium px-3 py-2 rounded border transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-[#e9f2ff] border-[#4c9aff] text-[#0052cc]"
                : "border-[#dfe1e6] text-[#44546f] bg-white hover:bg-[#f7f8f9]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#0052cc] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-[13px] text-[#6b778c] hover:text-[#de350b] transition-colors">Clear</button>
          )}
        </div>

        {/* ── Filter panel ── */}
        {showFilters && (
          <div className="bg-white border-b border-[#dfe1e6] px-6 py-3">
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: "Status", content: (
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-full border border-[#dfe1e6] rounded px-2.5 py-1.5 text-[13px] bg-white text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff]">
                    <option value="">All Statuses</option>
                    {config.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )},
                { label: "Assignee", content: (
                  <select value={assigneeFilter} onChange={(e) => { setAssigneeFilter(e.target.value); setPage(1); }} className="w-full border border-[#dfe1e6] rounded px-2.5 py-1.5 text-[13px] bg-white text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff]">
                    <option value="">All Assignees</option>
                    {agents.map((a) => <option key={a.id} value={String(a.id)}>{a.full_name}</option>)}
                  </select>
                )},
                { label: "Full Name", content: (
                  <input type="text" value={employeeName} onChange={(e) => { setEmployeeName(e.target.value); setPage(1); }} placeholder="Employee name…" className="w-full border border-[#dfe1e6] rounded px-2.5 py-1.5 text-[13px] text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff]" />
                )},
                { label: "From", content: (
                  <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-full border border-[#dfe1e6] rounded px-2.5 py-1.5 text-[13px] text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff]" />
                )},
                { label: "To", content: (
                  <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-full border border-[#dfe1e6] rounded px-2.5 py-1.5 text-[13px] text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff]" />
                )},
              ].map(({ label, content }) => (
                <div key={label}>
                  <label className="block text-[11px] font-semibold text-[#6b778c] mb-1 uppercase tracking-wide">{label}</label>
                  {content}
                </div>
              ))}
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {statusFilter   && <Chip label={`Status: ${statusFilter}`}   onRemove={() => setStatusFilter("")} />}
                {assigneeFilter && <Chip label={`Assignee: ${agents.find(a => String(a.id) === assigneeFilter)?.full_name || assigneeFilter}`} onRemove={() => setAssigneeFilter("")} />}
                {employeeName   && <Chip label={`Name: ${employeeName}`}      onRemove={() => setEmployeeName("")} />}
                {dateFrom       && <Chip label={`From: ${dateFrom}`}          onRemove={() => setDateFrom("")} />}
                {dateTo         && <Chip label={`To: ${dateTo}`}              onRemove={() => setDateTo("")} />}
              </div>
            )}
          </div>
        )}

        {/* ── Bulk action bar ── */}
        {selected.size > 0 && (
          <div className="bg-[#172b4d] text-white px-6 py-2.5 flex items-center gap-4">
            <span className="text-[13px] font-medium">{selected.size} ticket{selected.size > 1 ? "s" : ""} selected</span>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 bg-[#de350b] hover:bg-[#bf2600] text-white text-[12px] font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {bulkDeleting ? "Deleting…" : "Delete Selected"}
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-[#a5adba] hover:text-white text-[12px] transition-colors">Deselect all</button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-[#8590a2]">
              <div className="w-5 h-5 border-2 border-[#0052cc] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px]">Loading tickets…</span>
            </div>
          ) : (
            <>
              <div className="bg-white border border-[#dfe1e6] rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#dfe1e6] bg-[#f7f8f9]">
                      <th className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          checked={tickets.length > 0 && selected.size === tickets.length}
                          ref={(el) => { if (el) el.indeterminate = selected.size > 0 && selected.size < tickets.length; }}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-[#dfe1e6] accent-[#0052cc] cursor-pointer"
                        />
                      </th>
                      {["Ticket", "Summary", "Type", "Reporter", "Assignee", "Status", "Priority", "Created", ""].map((h) => (
                        <th key={h} className="text-left px-3 py-3 text-[11px] font-semibold text-[#6b778c] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-[#8590a2]">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-[14px] font-medium text-[#44546f]">No tickets found</p>
                            <p className="text-[12px]">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : tickets.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/admin/tickets/${t.id}`)}
                        className={`border-b border-[#f1f2f4] cursor-pointer transition-colors ${selected.has(t.id) ? "bg-[#e9f2ff]" : "hover:bg-[#f7f8f9]"}`}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(t.id)} onChange={(e) => toggleSelect(e, t.id)} className="w-4 h-4 rounded border-[#dfe1e6] accent-[#0052cc] cursor-pointer" />
                        </td>
                        <td className="px-3 py-3 font-semibold text-[#0052cc] whitespace-nowrap hover:underline">{t.ticket_number}</td>
                        <td className="px-3 py-3 text-[#172b4d] max-w-[220px] truncate font-medium">{t.title}</td>
                        <td className="px-3 py-3 text-[#6b778c] whitespace-nowrap">
                          <span className="bg-[#f1f2f4] text-[#44546f] text-[11px] font-medium px-1.5 py-0.5 rounded">{TYPE_LABELS[t.ticket_type] || t.ticket_type}</span>
                        </td>
                        <td className="px-3 py-3 text-[#172b4d] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={t.reporter?.full_name} />
                            <span className="text-[12px]">{t.reporter?.full_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {t.assignee ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar name={t.assignee.full_name} />
                              <span className="text-[12px] text-[#172b4d]">{t.assignee.full_name}</span>
                            </div>
                          ) : (
                            <span className="text-[12px] text-[#8590a2] italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap"><StatusBadge status={t.status} /></td>
                        <td className="px-3 py-3 whitespace-nowrap"><PriorityBadge priority={t.priority} /></td>
                        <td className="px-3 py-3 text-[#6b778c] whitespace-nowrap text-[12px]">
                          {new Date(t.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDelete(e, t.id)}
                            className="opacity-0 group-hover:opacity-100 text-[#dfe1e6] hover:text-[#de350b] transition-colors p-1 rounded hover:bg-[#ffebe6]"
                            title="Delete ticket"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > limit && (
                <div className="flex items-center justify-between mt-4 text-[13px] text-[#6b778c]">
                  <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-[#dfe1e6] rounded bg-white hover:bg-[#f7f8f9] disabled:opacity-40 text-[#172b4d]">← Previous</button>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total} className="px-3 py-1.5 border border-[#dfe1e6] rounded bg-white hover:bg-[#f7f8f9] disabled:opacity-40 text-[#172b4d]">Next →</button>
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

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-[#e9f2ff] border border-[#b3d4ff] text-[#0052cc] text-[11px] font-medium px-2 py-0.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-[#de350b] ml-0.5 font-bold text-[13px] leading-none">×</button>
    </span>
  );
}
