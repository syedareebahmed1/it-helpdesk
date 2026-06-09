import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Register() {
  const [form, setForm] = useState({
    email: "", password: "", full_name: "", department: "", job_title: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, role: "customer" });
      navigate("/portal");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-[#0747a6]" style={{ fontFamily: "serif" }}>بازار</span>
          <h1 className="text-xl font-semibold text-gray-800 mt-1">Create Account</h1>
          <p className="text-gray-500 text-sm">IT Service Desk portal access</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 px-8 py-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">{error}</div>
          )}

          {[
            { k: "full_name", label: "Full Name", type: "text", placeholder: "Ali Khan", required: true },
            { k: "email", label: "Email", type: "email", placeholder: "ali@bazaartech.com", required: true },
            { k: "password", label: "Password", type: "password", placeholder: "••••••••", required: true },
            { k: "department", label: "Department", type: "text", placeholder: "Engineering" },
            { k: "job_title", label: "Job Title", type: "text", placeholder: "Software Engineer" },
          ].map(({ k, label, type, placeholder, required }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && " *"}</label>
              <input
                type={type}
                value={form[k]}
                onChange={set(k)}
                required={required}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white font-medium py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0052cc] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
