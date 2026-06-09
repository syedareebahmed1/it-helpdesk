import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ticketsApi } from "../../api/tickets";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import useAuthStore from "../../store/authStore";

const TYPE_LABELS = {
  onboarding: "Colleague Onboarding", offboarding: "Colleague Offboarding",
  access_google: "Google Workspace", access_commando: "Commando Access",
  access_nucleus: "Nucleus Access", access_superset: "SuperSet Access",
  access_platform: "Platform Scopes", access_lending: "Lending Portal",
  system_problem: "System Problem",
};

export default function MyTickets() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(location.state?.success);

  useEffect(() => {
    ticketsApi.list({ limit: 50 })
      .then((res) => setTickets(res.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-[#0747a6]" style={{ fontFamily: "serif" }}>بازار</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 font-semibold text-sm">IT Service Desk</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/portal")} className="text-sm text-[#0052cc] hover:underline">New Request</button>
          <span className="text-sm text-gray-700">{user?.full_name}</span>
          <button onClick={() => { logout(); navigate("/login"); }} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
        </div>
      </header>

      <div className="bg-[#f4f5f7] border-b border-gray-200 px-8 py-4">
        <h1 className="text-lg font-semibold text-gray-900">My Requests</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {showBanner && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded px-4 py-3 flex items-center justify-between">
            <span>Your request has been submitted successfully.</span>
            <button onClick={() => setShowBanner(false)} className="text-green-500 hover:text-green-700 text-lg leading-none">×</button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">You haven't raised any requests yet.</p>
            <button
              onClick={() => navigate("/portal")}
              className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-sm font-medium px-4 py-2 rounded"
            >
              Raise a Request
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Reference", "Summary", "Type", "Status", "Priority", "Created"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/portal/tickets/${ticket.id}`)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#0052cc] whitespace-nowrap">{ticket.ticket_number}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-[240px] truncate">{ticket.title}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{TYPE_LABELS[ticket.ticket_type] || ticket.ticket_type}</td>
                    <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
