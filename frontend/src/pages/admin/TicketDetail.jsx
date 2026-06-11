import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ticketsApi } from "../../api/tickets";
import { usersApi } from "../../api/users";
import { workflowsApi } from "../../api/workflows";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import WorkflowDiagram from "../../components/WorkflowDiagram";
import Modal from "../../components/Modal";
import useAuthStore from "../../store/authStore";

const TYPE_LABELS = {
  onboarding: "Colleague Onboarding", offboarding: "Colleague Offboarding",
  incident: "Incident", hardware_request: "Hardware Request",
  access_google: "Google Workspace Request", access_commando: "Commando Access Request",
  access_nucleus: "Nucleus Access Request", access_superset: "SuperSet Access Request",
  access_platform: "Platform Scopes", access_lending: "Lending Portal",
  system_problem: "System Problem", it_service_request: "IT Service Request",
  bz_internal_transfer: "BZ Internal Transfer",
  access_aws: "AWS Access", access_platform_role: "Create New Platform Role",
};

const APPROVAL_TYPES = ["access_commando","access_nucleus","access_superset","access_platform","access_lending","access_aws","access_platform_role"];
const APPROVAL_STATUS = "AWAITING APPROVAL";

const FIELD_LABELS = {
  full_name: "Full Name", preferred_email: "Preferred Email", personal_email: "Personal Email",
  job_title: "Job Title", date_of_joining: "Date of Joining", it_essentials: "IT Essentials",
  employment_type: "Employment Type", department: "Department", line_manager: "Line Manager",
  mobile_number: "Mobile Number", employee_name: "Employee Name", employee_email: "Employee Email",
  colleague_email: "Colleague Email ID", contact_number: "Contact Number",
  resignation_date: "Resignation Date", last_working_day: "Last Working Day",
  last_working_date: "Last Working Date", reason_for_leaving: "Reason for Leaving",
  assets_to_return: "Assets to Return", city: "City", requested_for: "Requested For",
  request_type: "Request Type", access_type: "Access Type", commando_role: "Commando Role", justification: "Justification",
  scope_action: "Action", scope_name: "Scope / Permission", platform: "Platform",
  lending_module: "Lending Module", affected_system: "Affected System",
  raise_on_behalf_of: "Raise on Behalf Of", colleague_full_name: "Colleague Full Name",
  colleague_id: "Colleague ID", colleague_email: "Colleague Email",
  type_of_movement: "Type of Movement", effective_date: "Effective Date",
  new_job_title: "New Job Title", new_function: "New Function",
  new_location: "New Location", new_line_manager_email: "New Line Manager (Email)",
  change_in_benefit: "Change in Benefit", reason_for_hire: "Reason for Hire",
  problem_description: "Problem Description", steps_to_reproduce: "Steps to Reproduce",
  impact_level: "Impact Level", application_requested: "Application Requested",
};

/* ── Inline-editable field row ─────────────────────────────────────────────── */
function EditableFields({ fields, ticketId, onSaved }) {
  const [editing, setEditing] = useState(null);   // field_key being edited
  const [draft,   setDraft]   = useState("");
  const [saving,  setSaving]  = useState(false);

  const startEdit = (fv) => { setEditing(fv.field_key); setDraft(fv.field_value || ""); };
  const cancel    = ()   => { setEditing(null); setDraft(""); };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await ticketsApi.updateFields(ticketId, [{ field_key: editing, field_value: draft }]);
      onSaved();
      cancel();
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white border border-[#dfe1e6] rounded-lg mb-4 overflow-hidden">
      <div className="px-5 py-3 border-b border-[#dfe1e6] bg-[#f7f8f9] flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-[#172b4d]">Request Details</h2>
        <span className="text-[11px] text-[#8590a2]">Click any field to edit</span>
      </div>
      <div className="p-5">
        <dl className="grid grid-cols-2 gap-x-10 gap-y-4">
          {fields.map((fv) => (
            <div key={fv.field_key} className="group relative">
              <dt className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wide mb-0.5">
                {FIELD_LABELS[fv.field_key] || fv.field_key.replace(/_/g, " ")}
              </dt>

              {editing === fv.field_key ? (
                /* ── Edit mode ── */
                <div>
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
                    className="w-full border border-[#4c9aff] rounded-md px-2.5 py-1.5 text-[13px] text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff]"
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={save}
                      disabled={saving}
                      className="text-[11px] font-semibold bg-[#0052cc] hover:bg-[#0747a6] text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button onClick={cancel} className="text-[11px] text-[#6b778c] hover:text-[#172b4d] px-2 py-1">
                      Cancel
                    </button>
                    <span className="text-[10px] text-[#8590a2]">Enter to save · Esc to cancel</span>
                  </div>
                </div>
              ) : (
                /* ── View mode with hover-edit ── */
                <dd
                  onClick={() => startEdit(fv)}
                  className="flex items-start gap-2 cursor-pointer rounded-md -mx-1 px-1 py-0.5 hover:bg-[#f7f8f9] transition-colors group/field"
                >
                  <span className="text-[13px] text-[#172b4d] font-medium flex-1">
                    <FieldValue val={fv.field_value} />
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-[#8590a2] opacity-0 group-hover/field:opacity-100 flex-shrink-0 mt-0.5 transition-opacity"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Avatar({ name, size = 7 }) {
  if (!name) return null;
  const colors = ["#0052cc","#00875a","#403294","#008da6","#974f0c","#de350b"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  const cls = `w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`;
  const fontSize = size <= 6 ? "text-[10px]" : "text-[12px]";
  return <div className={`${cls} ${fontSize}`} style={{ backgroundColor: bg }}>{name[0].toUpperCase()}</div>;
}

function FieldValue({ val }) {
  if (!val) return <span className="text-[#8590a2] italic">None</span>;
  if (val.includes(",")) {
    return (
      <div className="flex flex-wrap gap-1 mt-0.5">
        {val.split(",").map((v) => (
          <span key={v} className="bg-[#e9f2ff] border border-[#b3d4ff] text-[#0052cc] text-[11px] px-1.5 py-0.5 rounded font-medium">{v.trim()}</span>
        ))}
      </div>
    );
  }
  return <span>{val}</span>;
}

export default function AdminTicketDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuthStore();

  const [ticket,       setTicket]       = useState(null);
  const [workflow,     setWorkflow]     = useState(null);
  const [agents,       setAgents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [comment,      setComment]      = useState("");
  const [isInternal,   setIsInternal]   = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showStatus,   setShowStatus]   = useState(false);
  const [updating,     setUpdating]     = useState(false);
  const statusRef = useRef(null);

  const load = () => {
    Promise.all([ticketsApi.get(id), usersApi.list()])
      .then(([t, u]) => {
        setTicket(t);
        setAgents(u.filter((u) => u.role !== "customer"));
        return workflowsApi.get(t.ticket_type);
      }).then(setWorkflow).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const h = (e) => { if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatus(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleStatusChange  = async (s)  => { setUpdating(true); try { await ticketsApi.update(id, { status: s }); await load(); } catch (e) { alert(e.message); } finally { setUpdating(false); } };
  const handleAssigneeChange = async (v) => { await ticketsApi.update(id, { assignee_id: v ? parseInt(v) : null }); load(); };
  const handlePriorityChange = async (p) => { await ticketsApi.update(id, { priority: p }); load(); };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try { await ticketsApi.addComment(id, comment, isInternal); setComment(""); load(); }
    finally { setSubmitting(false); }
  };

  const transitions = () => {
    if (!workflow || !ticket) return [];
    const seen = new Set();
    return workflow.transitions
      .filter((t) => t.from_state === ticket.status || t.from_state === "*")
      .map((t) => t.to_state)
      .filter((s) => s !== ticket.status)
      .filter((s) => { if (seen.has(s)) return false; seen.add(s); return true; });
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#f7f8f9]">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center gap-3 text-[#8590a2]">
        <div className="w-5 h-5 border-2 border-[#0052cc] border-t-transparent rounded-full animate-spin" />
        <span className="text-[13px]">Loading ticket…</span>
      </div>
    </div>
  );

  if (!ticket) return (
    <div className="flex min-h-screen bg-[#f7f8f9]">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-[#44546f] text-[14px]">Ticket not found</div>
    </div>
  );

  const approverField = ticket.field_values?.find(f => f.field_key === "_approvers");
  const approverNames = approverField ? approverField.field_value.split(", ").filter(Boolean) : ["Dayen Khan"];
  const visibleFields = ticket.field_values?.filter(f => !f.field_key.startsWith("_")) || [];

  return (
    <div className="flex min-h-screen bg-[#f7f8f9]">
      <Sidebar />
      <main className="flex-1 overflow-auto">

        {/* ── Breadcrumb bar ── */}
        <div className="bg-white border-b border-[#dfe1e6] px-6 py-2.5 flex items-center gap-2 text-[13px]">
          <button onClick={() => navigate(-1)} className="text-[#0052cc] hover:underline flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Queues
          </button>
          <span className="text-[#dfe1e6]">/</span>
          <span className="text-[#6b778c]">{ticket.ticket_number}</span>
          <span className="text-[#dfe1e6]">/</span>
          <span className="text-[#172b4d] font-medium truncate max-w-xs">{ticket.title}</span>
        </div>

        <div className="flex min-h-[calc(100vh-50px)]">
          {/* ── Main column ── */}
          <div className="flex-1 px-8 py-6 min-w-0">

            {/* ── Linked ticket banner ── */}
            {ticket.linked_ticket && (
              <div className="mb-5 flex items-center gap-3 bg-[#e9f2ff] border border-[#b3d4ff] rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-[#0052cc] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="flex-1 text-[13px]">
                  <span className="text-[#6b778c]">Linked ticket — </span>
                  <span className="font-semibold text-[#172b4d]">
                    {ticket.linked_ticket.portal_source === "people" ? "📋 People Helpdesk" : "🖥️ IT Task"}:
                  </span>
                  <button
                    onClick={() => navigate(`/admin/tickets/${ticket.linked_ticket.id}`)}
                    className="ml-1.5 font-bold text-[#0052cc] hover:underline"
                  >
                    {ticket.linked_ticket.ticket_number}
                  </button>
                  <span className="ml-2 text-[#6b778c]">— {ticket.linked_ticket.title}</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#b3d4ff] text-[#0052cc]">
                  {ticket.linked_ticket.status}
                </span>
                <button
                  onClick={() => navigate(`/admin/tickets/${ticket.linked_ticket.id}`)}
                  className="text-[#0052cc] hover:underline text-[12px] font-medium whitespace-nowrap"
                >
                  View →
                </button>
              </div>
            )}

            {/* Ticket title + meta */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1">
                  <h1 className="text-[22px] font-bold text-[#172b4d] leading-tight">{ticket.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="bg-[#f1f2f4] text-[#44546f] text-[11px] font-semibold px-2 py-0.5 rounded">{TYPE_LABELS[ticket.ticket_type] || ticket.ticket_type}</span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-[12px] text-[#6b778c]">
                      Raised by <span className="font-semibold text-[#172b4d]">{ticket.reporter?.full_name}</span> · {new Date(ticket.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Details card — inline editable */}
            {visibleFields.length > 0 && (
              <EditableFields
                fields={visibleFields}
                ticketId={ticket.id}
                onSaved={load}
              />
            )}

            {/* Description */}
            {ticket.description && (
              <section className="bg-white border border-[#dfe1e6] rounded-lg mb-4">
                <div className="px-5 py-3 border-b border-[#dfe1e6] bg-[#f7f8f9]">
                  <h2 className="text-[13px] font-semibold text-[#172b4d]">Description</h2>
                </div>
                <div className="p-5">
                  <p className="text-[13px] text-[#172b4d] whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>
              </section>
            )}

            {/* Activity */}
            <section className="bg-white border border-[#dfe1e6] rounded-lg">
              <div className="px-5 py-3 border-b border-[#dfe1e6] bg-[#f7f8f9]">
                <h2 className="text-[13px] font-semibold text-[#172b4d]">Activity</h2>
              </div>
              <div className="p-5">

                {/* History + comments thread */}
                <div className="space-y-4 mb-6">
                  {ticket.history.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 text-[12px] text-[#6b778c]">
                      <Avatar name={h.changed_by?.full_name} size={6} />
                      <span>
                        <span className="font-semibold text-[#172b4d]">{h.changed_by?.full_name}</span>
                        {" changed "}<span className="font-medium">{h.field_name}</span>
                        {h.old_value && <> from <span className="font-medium text-[#44546f]">{h.old_value}</span></>}
                        {h.new_value && <> to <span className="font-semibold text-[#0052cc]">{h.new_value}</span></>}
                      </span>
                      <span className="ml-auto text-[11px] whitespace-nowrap">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                  ))}

                  {ticket.comments.map((c) => (
                    <div key={c.id} className={`flex gap-3 ${c.is_internal ? "bg-[#fffae6] border border-[#ffe380] rounded-lg p-3 -mx-1" : ""}`}>
                      <Avatar name={c.author?.full_name} size={7} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-[#172b4d]">{c.author?.full_name}</span>
                          {c.is_internal && (
                            <span className="bg-[#ffe380] text-[#172b4d] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Internal note</span>
                          )}
                          <span className="text-[11px] text-[#8590a2] ml-auto">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-[13px] text-[#172b4d] leading-relaxed">{c.body}</p>
                      </div>
                    </div>
                  ))}

                  {ticket.history.length === 0 && ticket.comments.length === 0 && (
                    <p className="text-[13px] text-[#8590a2] text-center py-4">No activity yet</p>
                  )}
                </div>

                {/* Reply box */}
                <div className="border-t border-[#dfe1e6] pt-4">
                  {/* Toggle */}
                  <div className="flex gap-1 mb-3">
                    <button
                      type="button"
                      onClick={() => setIsInternal(false)}
                      className={`text-[12px] font-medium px-3 py-1.5 rounded border transition-colors ${!isInternal ? "bg-[#e9f2ff] border-[#4c9aff] text-[#0052cc]" : "border-[#dfe1e6] text-[#6b778c] hover:bg-[#f7f8f9]"}`}
                    >
                      Reply to customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternal(true)}
                      className={`text-[12px] font-medium px-3 py-1.5 rounded border transition-colors ${isInternal ? "bg-[#fffae6] border-[#ffe380] text-[#974f0c]" : "border-[#dfe1e6] text-[#6b778c] hover:bg-[#f7f8f9]"}`}
                    >
                      🔒 Internal note
                    </button>
                  </div>
                  <form onSubmit={handleComment}>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder={isInternal ? "Add an internal note (only visible to agents)…" : "Reply to the customer…"}
                      className={`w-full border rounded-lg px-3 py-2.5 text-[13px] resize-none focus:outline-none focus:ring-2 transition-colors ${
                        isInternal
                          ? "border-[#ffe380] bg-[#fffae6] focus:ring-[#ffe380] text-[#172b4d]"
                          : "border-[#dfe1e6] focus:ring-[#4c9aff] focus:border-[#4c9aff] text-[#172b4d]"
                      }`}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="submit"
                        disabled={submitting || !comment.trim()}
                        className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors disabled:opacity-50"
                      >
                        {submitting ? "Saving…" : isInternal ? "Save Note" : "Reply"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>

          {/* ── Right panel ── */}
          <div className="w-72 flex-shrink-0 border-l border-[#dfe1e6] bg-white overflow-y-auto">

            {/* Status transition */}
            <div className="p-4 border-b border-[#dfe1e6]">
              <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wider mb-2">Status</p>
              <div className="mb-2"><StatusBadge status={ticket.status} /></div>
              <div className="relative" ref={statusRef}>
                <button
                  onClick={() => setShowStatus((v) => !v)}
                  disabled={updating || transitions().length === 0}
                  className="w-full flex items-center justify-between gap-2 bg-[#0052cc] hover:bg-[#0747a6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-3 py-2 rounded transition-colors"
                >
                  <span>Transition</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showStatus && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#dfe1e6] rounded-lg shadow-lg z-20 py-1">
                    {transitions().map((s) => (
                      <button
                        key={s}
                        onClick={() => { handleStatusChange(s); setShowStatus(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#172b4d] hover:bg-[#f7f8f9] text-left transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-[#0052cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <StatusBadge status={s} />
                      </button>
                    ))}
                    <div className="border-t border-[#dfe1e6] mt-1 pt-1">
                      <button
                        onClick={() => { setShowWorkflow(true); setShowStatus(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#6b778c] hover:bg-[#f7f8f9] text-left"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        View workflow
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Approval panel */}
            {ticket.status === APPROVAL_STATUS && (
              <div className="p-4 border-b border-[#dfe1e6] bg-[#fffae6]">
                <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wider mb-3">Approvals</p>
                <div className="bg-white border border-[#ffe380] rounded-lg p-3 mb-3">
                  <p className="text-[12px] font-semibold text-[#172b4d] mb-0.5">Approval required</p>
                  <p className="text-[11px] text-[#6b778c]">{approverNames.length} approver{approverNames.length > 1 ? "s" : ""} must approve this request.</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleStatusChange("WAITING FOR SUPPORT")}
                    disabled={updating}
                    className="flex-1 bg-[#00875a] hover:bg-[#006644] text-white text-[12px] font-bold px-3 py-2 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange("REJECTED")}
                    disabled={updating}
                    className="flex-1 bg-white border border-[#dfe1e6] hover:bg-[#ffebe6] hover:border-[#de350b] text-[#172b4d] hover:text-[#de350b] text-[12px] font-bold px-3 py-2 rounded transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
                <div className="space-y-2">
                  {approverNames.map((name) => (
                    <div key={name} className="flex items-center gap-2">
                      <Avatar name={name} size={7} />
                      <div>
                        <p className="text-[12px] font-semibold text-[#172b4d]">{name}</p>
                        <p className="text-[11px] text-[#8590a2]">Waiting for approval</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority */}
            <div className="p-4 border-b border-[#dfe1e6]">
              <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wider mb-2">Priority</p>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full border border-[#dfe1e6] rounded px-2.5 py-1.5 text-[13px] bg-white text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff]"
              >
                {["P1","P2","P3","P4"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Assignee */}
            <div className="p-4 border-b border-[#dfe1e6]">
              <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wider mb-2">Assignee</p>
              {ticket.assignee && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={ticket.assignee.full_name} size={6} />
                  <span className="text-[13px] font-medium text-[#172b4d]">{ticket.assignee.full_name}</span>
                </div>
              )}
              <select
                value={ticket.assignee_id || ""}
                onChange={(e) => handleAssigneeChange(e.target.value || null)}
                className="w-full border border-[#dfe1e6] rounded px-2.5 py-1.5 text-[13px] bg-white text-[#172b4d] focus:outline-none focus:ring-2 focus:ring-[#4c9aff]"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </select>
            </div>

            {/* Details */}
            <div className="p-4">
              <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wider mb-3">Details</p>
              <div className="space-y-3">
                {[
                  { label: "Reporter",     value: ticket.reporter?.full_name, avatar: true },
                  { label: "Request Type", value: TYPE_LABELS[ticket.ticket_type] || ticket.ticket_type },
                  { label: "Department",   value: ticket.department || "—" },
                  { label: "Created",      value: new Date(ticket.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
                  { label: "Updated",      value: new Date(ticket.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
                ].map(({ label, value, avatar }) => (
                  <div key={label}>
                    <p className="text-[11px] text-[#6b778c] font-semibold uppercase tracking-wide mb-0.5">{label}</p>
                    {avatar ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={value} size={5} />
                        <span className="text-[13px] font-medium text-[#172b4d]">{value}</span>
                      </div>
                    ) : (
                      <p className="text-[13px] font-medium text-[#172b4d]">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Workflow modal */}
      <Modal open={showWorkflow} onClose={() => setShowWorkflow(false)} title={workflow?.name || "Workflow"} size="lg">
        <div className="space-y-4">
          <div className="flex gap-4 text-[13px]">
            <div>
              <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wide mb-1">Current status</p>
              <StatusBadge status={ticket.status} />
            </div>
            {transitions().length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#6b778c] uppercase tracking-wide mb-1">Can transition to</p>
                <div className="flex gap-1 flex-wrap">{transitions().map((s) => <StatusBadge key={s} status={s} />)}</div>
              </div>
            )}
          </div>
          <WorkflowDiagram workflow={workflow} currentStatus={ticket.status} />
          <div className="flex justify-end gap-2 pt-3 border-t border-[#dfe1e6]">
            <button onClick={() => { navigate("/admin/workflows"); setShowWorkflow(false); }} className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-[13px] font-semibold px-4 py-2 rounded">Edit Workflow</button>
            <button onClick={() => setShowWorkflow(false)} className="border border-[#dfe1e6] bg-white hover:bg-[#f7f8f9] text-[#172b4d] text-[13px] font-semibold px-4 py-2 rounded">Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
