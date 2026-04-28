import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL from "../../../config/api.config";
import { 
  Send, ChevronLeft, FileText, ShieldCheck, 
  Loader2, User, Calendar, Briefcase
} from "lucide-react";
import toast from "react-hot-toast";

// 🔹 Subtle Color Tokens (Sober Palette)
const COLORS = {
  primary: "#1e3a8a",
  primaryHover: "#1d4ed8",
  accent: "#38bdf8",
  highlight: "#60a5fa",
  bg: "#e2e8f0",
  surface: "#FFFFFF",      // White - cards, inputs
  text: "#1F2937",         // Dark gray - primary text
  textMuted: "#6B7280",    // Medium gray - secondary text
  border: "rgba(30, 64, 175, 0.22)",
  borderLight: "rgba(30, 64, 175, 0.12)",
};

const JoinSocietyFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: "",
    skills: "",
    experience: "",
    availability: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.reason.length < 20) {
      return toast.error("Please provide more detail (minimum 20 characters).");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/memberShip/join/${id}`, 
        formData, 
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Application submitted successfully.");
        setFormData({
          reason: "",
          skills: "",
          experience: "",
          availability: "",
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to submit application. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-6xl mx-auto">
        
        {/* 🔹 Back Navigation - Simple */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: COLORS.textMuted }}
        >
          <ChevronLeft size={16} /> 
          <span>Back to Societies</span>
        </button>

        {/* 🔹 Two-Column Layout - Clean & Balanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* LEFT: Context Information */}
          <div className="lg:sticky lg:top-8">
            
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-3" style={{ color: COLORS.text }}>
                Membership Application
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>
                Thank you for your interest in joining our society. Please complete the form 
                to submit your application. Applications are reviewed by society managers 
                within 3-5 business days.
              </p>
            </div>

            {/* What to Expect */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: COLORS.text }}>
                Application Process
              </h2>
              <ul className="space-y-3">
                {[
                  "Submit your application form",
                  "Society manager reviews your details",
                  "You receive an email confirmation",
                  "If accepted, you'll get onboarding instructions"
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm" style={{ color: COLORS.textMuted }}>
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
                      style={{ backgroundColor: COLORS.primary, color: "#fff" }}
                    >
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div 
              className="p-5 rounded-lg border mb-8"
              style={{ 
                backgroundColor: COLORS.surface,
                borderColor: COLORS.borderLight
              }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: COLORS.text }}>
                Requirements
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: COLORS.textMuted }}>
                <li>• Active student enrollment</li>
                <li>• Minimum 20-character statement of interest</li>
                <li>• Valid university email address</li>
                <li>• Agreement to society guidelines</li>
              </ul>
            </div>

            {/* Applicant Info */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-9 h-9 rounded-md flex items-center justify-center text-sm font-medium"
                  style={{ backgroundColor: COLORS.primary, color: "#fff" }}
                >
                  {user?.fullname?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: COLORS.text }}>
                    {user?.fullname || "Student"}
                  </p>
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>
                    {user?.Department} • Semester {user?.semester}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.primary }}>
                <ShieldCheck size={12} /> 
                <span>Verified student account</span>
              </div>
            </div>

          </div>

          {/* RIGHT: Application Form */}
          <div>
            <div 
              className="bg-white rounded-lg border p-6"
              style={{ borderColor: COLORS.border }}
            >
              {/* Form Header */}
              <div className="mb-6 pb-5 border-b" style={{ borderColor: COLORS.borderLight }}>
                <h2 className="text-lg font-semibold" style={{ color: COLORS.text }}>
                  Your Application
                </h2>
                <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                  Fields marked with <span style={{ color: "#DC2626" }}>*</span> are required
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Statement of Interest */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium" style={{ color: COLORS.text }}>
                    <FileText size={14} style={{ color: COLORS.primary }} /> 
                    Statement of Interest <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <textarea 
                    required
                    minLength={20}
                    placeholder="Briefly explain why you want to join and what you hope to contribute..."
                    className="w-full p-3 rounded-md outline-none transition-colors text-sm resize-none"
                    style={{ 
                      backgroundColor: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text
                    }}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                  />
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>
                    Minimum 20 characters • Be concise and specific
                  </p>
                </div>

                {/* Skills & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium" style={{ color: COLORS.text }}>
                      <Briefcase size={14} style={{ color: COLORS.primary }} /> 
                      Relevant Skills
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Event planning, Design"
                      className="w-full p-3 rounded-md outline-none transition-colors text-sm"
                      style={{ 
                        backgroundColor: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text
                      }}
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                      onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium" style={{ color: COLORS.text }}>
                      <Calendar size={14} style={{ color: COLORS.primary }} /> 
                      Weekly Availability
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 3-5 hours"
                      className="w-full p-3 rounded-md outline-none transition-colors text-sm"
                      style={{ 
                        backgroundColor: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text
                      }}
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                      onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    />
                  </div>
                </div>

                {/* Previous Experience */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium" style={{ color: COLORS.text }}>
                    Previous Experience <span className="text-xs font-normal" style={{ color: COLORS.textMuted }}>(Optional)</span>
                  </label>
                  <textarea 
                    placeholder="Any prior involvement in societies, clubs, or relevant projects..."
                    className="w-full p-3 rounded-md outline-none transition-colors text-sm resize-none"
                    style={{ 
                      backgroundColor: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                      minHeight: "80px"
                    }}
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = COLORS.border}
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                  style={{ 
                    backgroundColor: COLORS.primary, 
                    color: "#fff"
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> 
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application <Send size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Privacy Note */}
              <p className="mt-5 text-xs text-center" style={{ color: COLORS.textMuted }}>
                Your academic information will be shared with the society manager solely for 
                verification purposes. View our{" "}
                <a href="#" className="underline" style={{ color: COLORS.primary }}>Privacy Policy</a>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JoinSocietyFormPage;