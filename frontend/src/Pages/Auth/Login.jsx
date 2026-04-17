import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaLock, FaEnvelope } from "react-icons/fa";

// 🔹 Sober Color Tokens
const COLORS = {
  primary: "#1e3a8a",
  primaryHover: "#1d4ed8",
  accent: "#38bdf8",
  bg: "#e2e8f0",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
  borderLight: "rgba(30, 64, 175, 0.1)",
};

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(formData.email, formData.password);
      const role = data.user?.role || "user";
      if (role === "admin") navigate("/admin");
      else if (role === "manager") navigate("/manager");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔹 PAGE BACKGROUND: Warm cream, professional
    <div className="public-theme min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: COLORS.bg }}>
      
      {/* 🔹 LOGIN CARD: Clean, less rounded, brand-aligned */}
      <div 
        className="w-full max-w-md rounded-xl border p-8"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        
        {/* 🔹 BACK BUTTON - Subtle, professional */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
          style={{ color: COLORS.textMuted }}
        >
          <FaArrowLeft size={14} />
          <span className="hover:underline">Back to Home</span>
        </Link>

        {/* Header - Clean Typography */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: COLORS.text }}>
            Welcome Back
          </h2>
          <p className="text-sm" style={{ color: COLORS.textMuted }}>
            Enter your credentials to access the USCMS dashboard
          </p>
        </div>

        {/* Error Alert - Subtle but clear */}
        {error && (
          <div 
            className="mb-6 px-4 py-3 rounded-lg text-sm"
            style={{ backgroundColor: "rgba(220, 38, 38, 0.08)", color: "#DC2626", border: `1px solid rgba(220, 38, 38, 0.2)` }}
          >
            <p className="font-medium">Login Failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: COLORS.textMuted }}>
                <FaEnvelope size={14} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none transition-colors"
                style={{ 
                  backgroundColor: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: COLORS.textMuted }}>
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-medium transition-colors hover:underline"
                style={{ color: COLORS.accent }}
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: COLORS.textMuted }}>
                <FaLock size={14} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-10 rounded-lg text-sm outline-none transition-colors"
                style={{ 
                  backgroundColor: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: COLORS.textMuted }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit Button - Professional, brand-aligned */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: COLORS.primary, 
              color: "#fff"
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In 
                <FaArrowRight size={14} />
              </span>
            )}
          </button>
        </form>

        {/* Divider - Subtle */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ backgroundColor: COLORS.borderLight }} />
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: COLORS.textMuted }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: COLORS.borderLight }} />
        </div>

        {/* Footer - Minimal */}
        <div className="text-center">
          <p className="text-sm" style={{ color: COLORS.textMuted }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium transition-colors hover:underline"
              style={{ color: COLORS.accent }}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;