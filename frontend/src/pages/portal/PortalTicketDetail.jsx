import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ticketsApi } from "../../api/tickets";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import useAuthStore from "../../store/authStore";

const TYPE_LABELS = {
  onboarding: "Colleague Onboarding", offboarding: "Colleague Offboarding",
  access_google: "Google Workspace Request", access_commando: "Commando Access Request",
  access_nucleus: "Nucleus Access Request", access_superset: "SuperSet Access Request",
  access_platform: "Platform Scopes Add/Remove", access_lending: "Lending Portal",
  system_problem: "Report a System Problem",
};

export default function PortalTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    ticketsApi.get(id).then(setTicket).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await ticketsApi.addComment(id, comment);
      setComment("");
      load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>;
  if (!ticket) return <div className="flex items-center justify-center min-h-screen text-gray-400">Ticket not found</div>;

  const publicComments = ticket.comments.filter((c) => !c.is_internal);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#0747a6]" style={{ fontFamily: "serif" }}>بازار</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 font-semibold text-sm">IT Service Desk</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/portal/my-tickets")} className="text-sm text-[#0052cc] hover:underline">My Requests</button>
          <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
        </div>
      </header>

      <div className="bg-[#f4f5f7] border-b border-gray-200 px-8 py-3">
        <nav className="text-sm text-gray-500">
          <button onClick={() => navigate("/portal")} className="hover:text-[#0052cc]">Help Center</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate("/portal/my-tickets")} className="hover:text-[#0052cc]">My Requests</button>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{ticket.ticket_number}</span>
        </nav>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{ticket.ticket_number} · {TYPE_LABELS[ticket.ticket_type]}</p>
          </div>
          <StatusBadge status={ticket.status} className="mt-1" />
        </div>

        {/* Fields */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Request Details</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            {ticket.field_values.map((fv) => (
              <div key={fv.field_key}>
                <dt className="text-xs text-gray-500 capitalize">{fv.field_key.replace(/_/g, " ")}</dt>
                <dd className="text-sm text-gray-800 font-medium mt-0.5">
                  {fv.field_value || <span className="text-gray-400">None</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity</h2>

          {publicComments.length === 0 && (
            <p className="text-gray-400 text-sm mb-4">No comments yet.</p>
          )}

          <div className="space-y-4 mb-5">
            {publicComments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {c.author.full_name[0]}
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{c.author.full_name}</span>
                    {" · "}{new Date(c.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-800 mt-1">{c.body}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleComment} className="flex gap-3">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Reply to this request..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50"
            >
              Reply
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
