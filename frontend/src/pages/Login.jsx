import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "customer") {
        navigate("/portal");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-[#0747a6]" style={{ fontFamily: "serif" }}>بازار</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">IT Service Desk</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 px-8 py-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@bazaartech.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white font-medium py-2 px-4 rounded text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-[#0052cc] hover:underline font-medium">
            Register
          </Link>
        </p>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded px-4 py-3 text-xs text-gray-600">
          <p className="font-semibold text-gray-700 mb-1">Demo accounts</p>
          <p>Manager: manager@bazaartech.com / manager123</p>
          <p>Agent: agent@bazaartech.com / agent123</p>
          <p>Customer: ibrahim.jamal@bazaartech.com / user123</p>
        </div>
      </div>
    </div>
  );
}
