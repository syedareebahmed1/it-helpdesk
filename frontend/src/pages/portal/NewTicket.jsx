import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dashboardApi } from "../../api/dashboard";
import { ticketsApi } from "../../api/tickets";

const TYPE_LABELS = {
  onboarding: "Colleague Onboarding",
  offboarding: "Colleague Offboarding",
  access_google: "Google Workspace Request",
  access_commando: "Commando Access Request",
  access_nucleus: "Nucleus Access Request",
  access_superset: "SuperSet Access Request",
  access_platform: "Platform Scopes Add/Remove",
  access_lending: "Lending Portal",
  system_problem: "Report a System Problem",
};

function titleFromFields(type, values) {
  const v = values;
  if (type === "onboarding" && v.full_name) return `Colleague Onboarding - ${v.preferred_email || v.full_name}`;
  if (type === "offboarding" && v.employee_email) return `Colleague Offboarding - ${v.employee_email}`;
  if (type === "system_problem" && v.affected_system) return `System Problem - ${v.affected_system}`;
  if (type.startsWith("access_") && v.requested_for) return `${TYPE_LABELS[type]} - ${v.requested_for}`;
  if (type === "access_lending" && v.mobile_number) return `Lending Portal Access - ${v.mobile_number}`;
  return TYPE_LABELS[type] || type;
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "text" || field.type === "email" || field.type === "date") {
    return (
      <input
        type={field.type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Select...</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  if (field.type === "multiselect") {
    const selected = value ? value.split(",").filter(Boolean) : [];
    const toggle = (opt) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      onChange(next.join(","));
    };
    return (
      <div className="flex flex-wrap gap-2">
        {field.options?.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded border text-sm transition-colors ${
              selected.includes(opt)
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }
  return null;
}

export default function NewTicket() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi.formFields(type).then(setFields).catch(() => setFields([]));
  }, [type]);

  const setVal = (key) => (val) => setValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const field_values = Object.entries(values)
        .filter(([, v]) => v)
        .map(([field_key, field_value]) => ({ field_key, field_value }));

      const title = titleFromFields(type, values);
      await ticketsApi.create({ ticket_type: type, title, field_values });
      navigate("/portal/my-tickets", { state: { success: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center gap-3">
        <span className="text-xl font-bold text-[#0747a6]" style={{ fontFamily: "serif" }}>بازار</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-700 font-semibold text-sm">IT Service Desk</span>
      </header>

      {/* Breadcrumb */}
      <div className="bg-[#f4f5f7] border-b border-gray-200 px-8 py-3">
        <nav className="text-sm text-gray-500">
          <button onClick={() => navigate("/portal")} className="hover:text-[#0052cc]">Help Center</button>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">{TYPE_LABELS[type] || type}</span>
        </nav>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{TYPE_LABELS[type]}</h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-2">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <FieldInput field={field} value={values[field.key]} onChange={setVal(field.key)} />
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-gray-400 text-sm">Loading form...</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0052cc] hover:bg-[#0747a6] text-white font-medium py-2 px-6 rounded text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/portal")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
