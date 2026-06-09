import { useEffect, useState } from "react";
import { usersApi } from "../../api/users";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";
import useAuthStore from "../../store/authStore";

const ROLE_STYLES = {
  manager: "bg-purple-100 text-purple-700",
  agent: "bg-blue-100 text-blue-700",
  customer: "bg-gray-100 text-gray-600",
};

export default function Users() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "agent", department: "", job_title: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => usersApi.list().then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => {
    setForm({ email: "", password: "", full_name: "", role: "agent", department: "", job_title: "" });
    setError("");
    setShowCreate(true);
  };

  const openEdit = (u) => {
    setForm({ email: u.email, password: "", full_name: u.full_name, role: u.role, department: u.department || "", job_title: u.job_title || "" });
    setEditUser(u);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editUser) {
        const payload = { full_name: form.full_name, role: form.role, department: form.department, job_title: form.job_title };
        if (form.password) payload.password = form.password;
        await usersApi.update(editUser.id, payload);
        setEditUser(null);
      } else {
        await usersApi.create(form);
        setShowCreate(false);
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await usersApi.delete(id);
    load();
  };

  const FormFields = () => (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">{error}</div>}
      {!editUser && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
          <input type="email" value={form.email} onChange={set("email")} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      )}
      {["full_name", "department", "job_title"].map((k) => (
        <div key={k}>
          <label className="text-sm font-medium text-gray-700 block mb-1">{k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</label>
          <input type="text" value={form[k]} onChange={set(k)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      ))}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Role *</label>
        <select value={form.role} onChange={set("role")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">{editUser ? "New Password (leave blank to keep)" : "Password *"}</label>
        <input type="password" value={form.password} onChange={set("password")} required={!editUser} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="bg-[#0052cc] text-white text-sm font-medium px-5 py-2 rounded hover:bg-[#0747a6] disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={() => { setShowCreate(false); setEditUser(null); }} className="text-sm text-gray-600 px-4 py-2">Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#f4f5f7] overflow-auto">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Users</h1>
            <button onClick={openCreate} className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-sm font-medium px-4 py-2 rounded">
              + New User
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Name", "Email", "Role", "Department", "Job Title", "Joined", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-xs font-semibold">
                          {u.full_name[0]}
                        </div>
                        <span className="font-medium text-gray-800">{u.full_name}</span>
                        {u.id === currentUser?.id && <span className="text-xs text-gray-400">(you)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.department || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{u.job_title || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {u.id !== currentUser?.id && (
                          <button onClick={() => handleDelete(u.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User"><FormFields /></Modal>
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit: ${editUser?.full_name}`}><FormFields /></Modal>
    </div>
  );
}
