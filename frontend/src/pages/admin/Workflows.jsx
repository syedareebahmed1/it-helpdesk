import { useEffect, useState } from "react";
import { workflowsApi } from "../../api/workflows";
import Sidebar from "../../components/Sidebar";
import WorkflowDiagram from "../../components/WorkflowDiagram";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import useAuthStore from "../../store/authStore";

const TYPE_LABELS = {
  onboarding: "Colleague Onboarding", offboarding: "Colleague Offboarding",
  access_google: "Google Workspace Request", access_commando: "Commando Access Request",
  access_nucleus: "Nucleus Access Request", access_superset: "SuperSet Access Request",
  access_platform: "Platform Scopes Add/Remove", access_lending: "Lending Portal",
  system_problem: "Report a System Problem",
};

function StateEditor({ state, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
      <input
        type="color"
        value={state.color}
        onChange={(e) => onChange({ ...state, color: e.target.value })}
        className="w-6 h-6 rounded border-0 cursor-pointer"
        title="Background color"
      />
      <input
        value={state.name}
        onChange={(e) => onChange({ ...state, name: e.target.value })}
        className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
        placeholder="State name"
      />
      <label className="flex items-center gap-1 text-xs text-gray-500">
        <input type="checkbox" checked={state.is_initial} onChange={(e) => onChange({ ...state, is_initial: e.target.checked })} />
        Initial
      </label>
      <label className="flex items-center gap-1 text-xs text-gray-500">
        <input type="checkbox" checked={state.is_terminal} onChange={(e) => onChange({ ...state, is_terminal: e.target.checked })} />
        Terminal
      </label>
      <button onClick={onDelete} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
    </div>
  );
}

export default function Workflows() {
  const { user } = useAuthStore();
  const isManager = user?.role === "manager";

  const [workflows, setWorkflows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    workflowsApi.list().then(setWorkflows).catch(() => {});
  }, []);

  const openEdit = (wf) => {
    setEditing(JSON.parse(JSON.stringify(wf)));
    setShowEdit(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await workflowsApi.update(editing.ticket_type, {
        name: editing.name,
        states: editing.states,
        transitions: editing.transitions,
      });
      setWorkflows((prev) => prev.map((w) => w.ticket_type === updated.ticket_type ? updated : w));
      if (selected?.ticket_type === updated.ticket_type) setSelected(updated);
      setShowEdit(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addState = () => {
    setEditing((e) => ({
      ...e,
      states: [...e.states, { id: Date.now(), name: "NEW STATE", color: "#e2e8f0", text_color: "#1e293b", is_initial: false, is_terminal: false, order: e.states.length }],
    }));
  };

  const addTransition = () => {
    const first = editing.states[0]?.name || "";
    const second = editing.states[1]?.name || "";
    setEditing((e) => ({
      ...e,
      transitions: [...e.transitions, { id: Date.now(), from_state: first, to_state: second, label: null }],
    }));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#f4f5f7] overflow-auto">
        <div className="px-8 py-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Workflows</h1>
          <p className="text-gray-500 text-sm mb-6">Manage ticket lifecycle workflows for each request type.</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setSelected(wf === selected ? null : wf)}
                className={`bg-white border rounded-lg p-4 text-left hover:border-blue-400 transition-colors ${
                  selected?.id === wf.id ? "border-blue-500 ring-1 ring-blue-400" : "border-gray-200"
                }`}
              >
                <p className="text-sm font-semibold text-gray-800">{TYPE_LABELS[wf.ticket_type] || wf.ticket_type}</p>
                <p className="text-xs text-gray-400 mt-0.5">{wf.name}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {wf.states.slice(0, 4).map((s) => (
                    <span key={s.id} className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: s.color, color: s.text_color }}>
                      {s.name}
                    </span>
                  ))}
                  {wf.states.length > 4 && <span className="text-xs text-gray-400">+{wf.states.length - 4}</span>}
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">{selected.name}</h2>
                  <p className="text-xs text-gray-500">{TYPE_LABELS[selected.ticket_type]} · {selected.states.length} states · {selected.transitions.length} transitions</p>
                </div>
                {isManager && (
                  <button
                    onClick={() => openEdit(selected)}
                    className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-sm font-medium px-4 py-2 rounded"
                  >
                    Edit Workflow
                  </button>
                )}
              </div>

              <WorkflowDiagram workflow={selected} />

              {/* States table */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">States</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.states.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded border"
                      style={{ background: s.color, borderColor: s.color, color: s.text_color }}>
                      <span className="text-xs font-medium">{s.name}</span>
                      {s.is_initial && <span className="text-xs opacity-70">(start)</span>}
                      {s.is_terminal && <span className="text-xs opacity-70">(end)</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title={`Edit: ${editing?.name}`} size="xl">
        {editing && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Workflow Name</label>
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">States</label>
                <button onClick={addState} className="text-xs text-blue-600 hover:underline">+ Add State</button>
              </div>
              <div className="space-y-2">
                {editing.states.map((s, i) => (
                  <StateEditor
                    key={s.id}
                    state={s}
                    onChange={(ns) => setEditing((e) => ({ ...e, states: e.states.map((st, j) => j === i ? ns : st) }))}
                    onDelete={() => setEditing((e) => ({ ...e, states: e.states.filter((_, j) => j !== i) }))}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Transitions</label>
                <button onClick={addTransition} className="text-xs text-blue-600 hover:underline">+ Add Transition</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editing.transitions.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-2">
                    <select
                      value={t.from_state}
                      onChange={(e) => setEditing((ed) => ({ ...ed, transitions: ed.transitions.map((tr, j) => j === i ? { ...tr, from_state: e.target.value } : tr) }))}
                      className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs bg-white"
                    >
                      <option value="*">Any (*)</option>
                      {editing.states.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                    <span className="text-gray-400">→</span>
                    <select
                      value={t.to_state}
                      onChange={(e) => setEditing((ed) => ({ ...ed, transitions: ed.transitions.map((tr, j) => j === i ? { ...tr, to_state: e.target.value } : tr) }))}
                      className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs bg-white"
                    >
                      {editing.states.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                    <button
                      onClick={() => setEditing((e) => ({ ...e, transitions: e.transitions.filter((_, j) => j !== i) }))}
                      className="text-gray-300 hover:text-red-400 text-lg leading-none"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#0052cc] hover:bg-[#0747a6] text-white text-sm font-medium px-5 py-2 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Workflow"}
              </button>
              <button onClick={() => setShowEdit(false)} className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
