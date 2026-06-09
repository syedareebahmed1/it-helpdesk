import { useState, useEffect } from "react";

const API = "";

const CATEGORIES = [
  {
    type: "system_problem",
    label: "Report a System Problem",
    description: "Let us know if something isn't working and we'll get it back up quickly.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    iconBg: "bg-gray-100 text-gray-600",
  },
  {
    type: "access_google",
    label: "Google Workspace Request",
    description: "Create, delete, or modify Google Workspace accounts and access.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    iconBg: "bg-white border border-gray-100",
  },
  {
    type: "access_commando",
    label: "Commando Access Request",
    description: "Request access to the Commando platform.",
    icon: <span className="text-xl font-bold text-blue-600">+</span>,
    iconBg: "bg-blue-50",
  },
  {
    type: "access_nucleus",
    label: "Nucleus Access Request",
    description: "Request access to the Nucleus system.",
    icon: <span className="text-xs font-bold text-gray-700" style={{ fontFamily: "serif" }}>بازار</span>,
    iconBg: "bg-gray-100",
  },
  {
    type: "access_superset",
    label: "SuperSet Access Request",
    description: "Request access to Apache SuperSet analytics.",
    icon: (
      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
    iconBg: "bg-orange-50",
  },
  {
    type: "access_platform",
    label: "Platform Scopes Add/Remove",
    description: "Add or remove platform-level permissions and scopes.",
    icon: (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6M12 9v6"/>
      </svg>
    ),
    iconBg: "bg-purple-50",
  },
  {
    type: "access_lending",
    label: "Lending Portal",
    description: "Request access to lending portal modules.",
    icon: (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
    iconBg: "bg-green-50",
  },
  {
    type: "onboarding",
    label: "Colleague Onboarding",
    description: "Submit an IT onboarding request for a new joiner.",
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
      </svg>
    ),
    iconBg: "bg-blue-50",
  },
  {
    type: "offboarding",
    label: "Colleague Offboarding",
    description: "Submit an IT offboarding request for a departing employee.",
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/>
      </svg>
    ),
    iconBg: "bg-red-50",
  },
];

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <span className="text-xl font-bold text-[#0747a6]" style={{ fontFamily: "serif" }}>بازار</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-700 font-semibold text-sm">IT Service Desk</span>
      </div>
    </header>
  );
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "text" || field.type === "email" || field.type === "date") {
    return (
      <input
        type={field.type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select...</option>
        {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (field.type === "multiselect") {
    const selected = value ? value.split(",").filter(Boolean) : [];
    const toggle = (opt) => {
      const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
      onChange(next.join(","));
    };
    return (
      <div className="flex flex-wrap gap-2">
        {field.options?.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 rounded-full border text-sm transition-colors ${
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

// ─── Home screen ────────────────────────────────────────────────────────────
function Home({ onSelect }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-[#f4f5f7] border-b border-gray-200 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Help Center / IT Service Desk</h1>
          <p className="text-gray-500 mt-1">Welcome! Please select your request type to raise a support ticket.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-[#0052cc] mb-4">What can we help you with?</h2>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              onClick={() => onSelect(cat)}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-blue-50 transition-colors text-left group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cat.iconBg}`}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#172b4d] group-hover:text-[#0052cc]">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-[#0052cc] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Form screen ─────────────────────────────────────────────────────────────
function RequestForm({ category, onBack, onSuccess }) {
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/public/form-fields/${category.type}`)
      .then((r) => r.json())
      .then(setFields)
      .catch(() => setFields([]));
  }, [category.type]);

  const setVal = (key) => (val) => setValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const field_values = Object.entries(values)
        .filter(([, v]) => v)
        .map(([field_key, field_value]) => ({ field_key, field_value }));

      const res = await fetch(`${API}/api/public/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submitter_name: name,
          submitter_email: email,
          ticket_type: category.type,
          field_values,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Submission failed");
      }

      const data = await res.json();
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-[#f4f5f7] border-b border-gray-200 px-6 py-3">
        <div className="max-w-2xl mx-auto">
          <nav className="text-sm text-gray-500">
            <button onClick={onBack} className="hover:text-[#0052cc]">Help Center</button>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">{category.label}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{category.label}</h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Submitter info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Your Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ali Khan"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ali@bazaartech.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Dynamic form fields */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
            {fields.length === 0 ? (
              <p className="text-gray-400 text-sm">Loading form...</p>
            ) : (
              fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <FieldInput field={field} value={values[field.key]} onChange={setVal(field.key)} />
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0052cc] hover:bg-[#0747a6] text-white font-medium py-2.5 px-6 rounded-md text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-md text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function Success({ ticket, onReset }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
        <p className="text-gray-500 mb-6">
          Your request has been received. The IT team will pick it up shortly.
        </p>

        <div className="bg-[#f4f5f7] border border-gray-200 rounded-lg px-6 py-4 mb-8 text-left">
          <p className="text-xs text-gray-500 mb-1">Reference Number</p>
          <p className="text-2xl font-bold text-[#0052cc]">{ticket.ticket_number}</p>
          <p className="text-sm text-gray-600 mt-2">{ticket.title}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">{ticket.status}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Save your reference number <strong>{ticket.ticket_number}</strong> to track your request with IT support.
        </p>

        <button
          onClick={onReset}
          className="bg-[#0052cc] hover:bg-[#0747a6] text-white font-medium py-2.5 px-6 rounded-md text-sm transition-colors"
        >
          Raise Another Request
        </button>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home"); // home | form | success
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  if (screen === "form" && selectedCategory) {
    return (
      <RequestForm
        category={selectedCategory}
        onBack={() => setScreen("home")}
        onSuccess={(ticket) => { setSubmittedTicket(ticket); setScreen("success"); }}
      />
    );
  }

  if (screen === "success" && submittedTicket) {
    return (
      <Success
        ticket={submittedTicket}
        onReset={() => { setScreen("home"); setSelectedCategory(null); setSubmittedTicket(null); }}
      />
    );
  }

  return <Home onSelect={(cat) => { setSelectedCategory(cat); setScreen("form"); }} />;
}
