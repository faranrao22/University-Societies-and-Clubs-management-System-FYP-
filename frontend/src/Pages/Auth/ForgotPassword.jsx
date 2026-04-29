import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaEnvelope, FaIdCard, FaLock, FaArrowRight } from "react-icons/fa";
import API_BASE_URL from "../../config/api.config";

const COLORS = {
  primary: "#1e3a8a",
  accent: "#38bdf8",
  bg: "#e2e8f0",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#4B5563",
  border: "rgba(30, 64, 175, 0.16)",
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    rollNo: "",
    cnicLast4: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        rollNo: formData.rollNo,
        cnicLast4: formData.cnicLast4,
        newPassword: formData.newPassword,
      };
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, payload, {
        withCredentials: true,
      });
      toast.success(res.data?.message || "Password reset successful");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-theme min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: COLORS.bg }}>
      <div className="w-full max-w-md rounded-xl border p-8" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
          style={{ color: COLORS.textMuted }}
        >
          <FaArrowLeft size={14} />
          <span className="hover:underline">Back to Login</span>
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: COLORS.text }}>
            Reset Password
          </h2>
          <p className="text-sm" style={{ color: COLORS.textMuted }}>
            Verify your student details and set a new password.
          </p>
        </div>

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-lg text-sm"
            style={{ backgroundColor: "rgba(220, 38, 38, 0.08)", color: "#DC2626", border: "1px solid rgba(220, 38, 38, 0.2)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
              style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
            />
          </div>

          <div className="relative">
            <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              name="rollNo"
              placeholder="Roll number"
              value={formData.rollNo}
              onChange={handleChange}
              required
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
              style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
            />
          </div>

          <div className="relative">
            <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              name="cnicLast4"
              placeholder="CNIC last 4 digits"
              value={formData.cnicLast4}
              onChange={handleChange}
              required
              maxLength={4}
              pattern="\d{4}"
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
              style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="password"
              name="newPassword"
              placeholder="New password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
              style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none"
              style={{ backgroundColor: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: COLORS.primary }}
          >
            {loading ? "Resetting..." : (
              <>
                Reset Password
                <FaArrowRight size={12} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: COLORS.textMuted }}>
          This reset method is available for student accounts.
        </p>
      </div>
    </div>
  );
}
