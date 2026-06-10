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
  access_platform: "Platform Scopes Add/Remove", access_lending: "Lending Portal",
  system_problem: "Report a System Problem", it_service_request: "IT Service Request",
  access_aws: "AWS Access", access_platform_role: "Create New Platform Role",
};

const APPROVAL_TYPES = ["access_commando", "access_nucleus", "access_superset", "access_platform", "access_lending", "access_aws", "access_platform_role"];
const APPROVAL_STATUS = "AWAITING APPROVAL";

const FIELD_LABELS = {
  full_name: "Full Name", preferred_email: "Preferred Email ID", personal_email: "Personal Email ID",
  job_title: "Job Title", date_of_joining: "Date of Joining", it_essentials: "IT Essentials",
  application_requested: "Application Requested", employment_type: "Employment Type",
  department: "Department", line_manager: "Line Manager", mobile_number: "Mobile Number",
  employee_name: "Employee Name", employee_email: "Employee Email",
  last_working_date: "Last Working Date", reason_for_leaving: "Reason for Leaving",
  assets_to_return: "Assets to Return", requested_for: "Requested For",
  request_type: "Request Type", access_type: "Access Type", justification: "Justification",
  scope_action: "Action", scope_name: "Scope / Permission", platform: "Platform",
  lending_module: "Lending Portal Module", affected_system: "Affected System",
  problem_description: "Problem Description", steps_to_reproduce: "Steps to Reproduce",
  impact_level: "Impact Level",
};

function formatFieldValue(val) {
  if (!val) return <span className="text-gray-400">None</span>;
  if (val.includes(",")) {
    return (
      <div className="flex flex-wrap gap-1 mt-0.5">
        {val.split(",").map((v) => (
          <span key={v} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded">{v.trim()}</span>
        ))}
      </div>
    );
  }
  return val;
}

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [updating, setUpdating] = useState(false);
  const statusMenuRef = useRef(null);

  const load = () => {
    Promise.all([
      ticketsApi.get(id),
      usersApi.list(),
    ]).then(([t, u]) => {
      setTicket(t);
      setAgents(u.filter((u) => u.role !== "customer"));
      return workflowsApi.get(t.ticket_type);
    }).then(setWorkflow).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const handler = (e) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await ticketsApi.update(id, { status: newStatus });
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssigneeChange = async (assignee_id) => {
    await ticketsApi.update(id, { assignee_id: assignee_id ? parseInt(assignee_id) : null });
    load();
  };

  const handlePriorityChange = async (priority) => {
    await ticketsApi.update(id, { priority });
    load();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await ticketsApi.addComment(id, comment, isInternal);
      setComment("");
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const allowedTransitions = () => {
    if (!workflow || !ticket) return [];
    const seen = new Set();
    return workflow.transitions
      .filter((t) => t.from_state === ticket.status || t.from_state === "*")
      .map((t) => t.to_state)
      .filter((s) => s !== ticket.status)
      .filter((s) => { if (seen.has(s)) return false; seen.add(s); return true; });
  };

  if (loading) return <div className="flex min-h-screen"><Sidebar /><div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div></div>;
  if (!ticket) return <div className="flex min-h-screen"><Sidebar /><div className="flex-1 flex items-center justify-center text-gray-400">Ticket not found</div></div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#f4f5f7] overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 text-sm">
          <button onClick={() => navigate(-1)} className="text-[#0052cc] hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <span className="text-gray-400">·</span>
          <span className="font-semibold text-gray-700">{ticket.ticket_number}</span>
        </div>

        <div className="flex gap-0">
          {/* Main content */}
          <div className="flex-1 px-6 py-5">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{ticket.title}</h1>
            <p className="text-gray-400 text-xs mb-5">
              {TYPE_LABELS[ticket.ticket_type]} · Raised by <span className="text-gray-600">{ticket.reporter?.full_name}</span> on {new Date(ticket.created_at).toLocaleString()}
            </p>

            {/* Form fields */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Request Details</h2>
                <span className="text-xs text-gray-400">via Portal</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                {ticket.field_values.map((fv) => (
                  <div key={fv.field_key}>
                    <dt className="text-xs text-gray-500">{FIELD_LABELS[fv.field_key] || fv.field_key.replace(/_/g, " ")}</dt>
                    <dd className="text-sm text-gray-800 font-medium mt-0.5">{formatFieldValue(fv.field_value)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Description */}
            {ticket.description && (
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            )}

            {/* Activity */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity</h2>

              <div className="space-y-4 mb-5">
                {/* History */}
                {ticket.history.map((h) => (
                  <div key={h.id} className="flex gap-2 text-xs text-gray-500 items-center">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-semibold flex-shrink-0">
                      {h.changed_by.full_name[0]}
                    </div>
                    <span>
                      <span className="font-medium text-gray-700">{h.changed_by.full_name}</span>
                      {" changed "}<strong>{h.field_name}</strong>
                      {h.old_value && <> from <span className="font-medium">{h.old_value}</span></>}
                      {h.new_value && <> to <span className="font-medium text-blue-600">{h.new_value}</span></>}
                    </span>
                    <span className="ml-auto whitespace-nowrap">{new Date(h.created_at).toLocaleString()}</span>
                  </div>
                ))}

                {/* Comments */}
                {ticket.comments.map((c) => (
                  <div key={c.id} className={`flex gap-3 ${c.is_internal ? "bg-yellow-50 border border-yellow-100 rounded-lg p-3 -mx-3" : ""}`}>
                    <div className="w-7 h-7 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {c.author.full_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-800">{c.author.full_name}</span>
                        {c.is_internal && <span className="ml-1.5 text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded text-xs">Internal note</span>}
                        <span className="ml-2">{new Date(c.created_at).toLocaleString()}</span>
                      </p>
                      <p className="text-sm text-gray-800 mt-1">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              <form onSubmit={handleComment} className="space-y-2">
                <div className="flex gap-2 text-xs mb-2">
                  <button
                    type="button"
                    onClick={() => setIsInternal(false)}
                    className={`px-3 py-1 rounded border transition-colors ${!isInternal ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500"}`}
                  >
                    Reply to customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternal(true)}
                    className={`px-3 py-1 rounded border transition-colors ${isInternal ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-500"}`}
                  >
                    Internal note
                  </button>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder={isInternal ? "Add an internal note (only visible to agents)..." : "Reply to the customer..."}
                  className={`w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${
                    isInternal ? "border-yellow-200 bg-yellow-50 focus:ring-yellow-300" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50"
                >
                  {submitting ? "Saving..." : isInternal ? "Save Note" : "Reply"}
                </button>
              </form>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-64 flex-shrink-0 border-l border-gray-200 bg-white px-4 py-5 space-y-5">

            {/* Status dropdown */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
              <div className="relative" ref={statusMenuRef}>
                <button
                  onClick={() => setShowStatusMenu((v) => !v)}
                  disabled={updating}
                  className="w-full flex items-center gap-2 bg-[#0052cc] hover:bg-[#0747a6] text-white text-sm font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="flex-1 text-left truncate">{ticket.status}</span>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showStatusMenu && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                    {allowedTransitions().map((s) => (
                      <button
                        key={s}
                        onClick={() => { handleStatusChange(s); setShowStatusMenu(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 text-left"
                      >
                        <span className="text-gray-400 text-xs">Transition</span>
                        <span className="mx-1 text-gray-300">→</span>
                        <StatusBadge status={s} />
                      </button>
                    ))}
                    {allowedTransitions().length > 0 && <hr className="my-1 border-gray-100" />}
                    <button
                      onClick={() => { setShowWorkflow(true); setShowStatusMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      View workflow
                    </button>
                    <button
                      onClick={() => { navigate("/admin/workflows"); setShowStatusMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Workflow
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Approval panel — shown when ticket is waiting for approval */}
            {ticket.status === APPROVAL_STATUS && (() => {
              const approverField = ticket.field_values?.find(f => f.field_key === "_approvers");
              const approverNames = approverField
                ? approverField.field_value.split(", ").filter(Boolean)
                : ["Dayen Khan"];
              return (
                <>
                  <hr className="border-gray-100" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Approvals</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-700 font-medium mb-1">This request requires your approval</p>
                      <p className="text-xs text-gray-500">{approverNames.length} person{approverNames.length > 1 ? "s" : ""} from 'Approvers' must approve.</p>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleStatusChange("WAITING FOR SUPPORT")}
                        disabled={updating}
                        className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-semibold px-3 py-2 rounded transition-colors disabled:opacity-50"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange("REJECTED")}
                        disabled={updating}
                        className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-2">Approvers</p>
                      <div className="space-y-2">
                        {approverNames.map((name) => (
                          <div key={name} className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                              {name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-800">{name}</p>
                              <p className="text-xs text-gray-400">Waiting for approval</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            <hr className="border-gray-100" />

            {/* Priority */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Priority</p>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["P1", "P2", "P3", "P4"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assignee</p>
              <select
                value={ticket.assignee_id || ""}
                onChange={(e) => handleAssigneeChange(e.target.value || null)}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* Details */}
            <div className="space-y-3 text-sm">
              {[
                { label: "Reporter", val: ticket.reporter?.full_name },
                { label: "Request Type", val: TYPE_LABELS[ticket.ticket_type] || ticket.ticket_type },
                { label: "Department", val: ticket.department || "—" },
                { label: "Created", val: new Date(ticket.created_at).toLocaleDateString() },
                { label: "Updated", val: new Date(ticket.updated_at).toLocaleDateString() },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-gray-800 font-medium">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Workflow modal */}
      <Modal open={showWorkflow} onClose={() => setShowWorkflow(false)} title={workflow?.name || "Workflow"} size="lg">
        <div className="space-y-3">
          <div className="flex gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Current status</p>
              <StatusBadge status={ticket.status} className="mt-1" />
            </div>
            {allowedTransitions().length > 0 && (
              <div>
                <p className="text-xs text-gray-500">This request can be moved to</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {allowedTransitions().map((s) => <StatusBadge key={s} status={s} />)}
                </div>
              </div>
            )}
          </div>
          <WorkflowDiagram workflow={workflow} currentStatus={ticket.status} />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => { navigate("/admin/workflows"); setShowWorkflow(false); }}
              className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-sm font-medium px-4 py-2 rounded"
            >
              Edit Workflow
            </button>
            <button
              onClick={() => setShowWorkflow(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
