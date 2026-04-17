import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaArrowRight, FaArrowLeft, FaUser, FaEnvelope, 
  FaLock, FaIdCard, FaUniversity, FaCloudUploadAlt, FaCheckCircle, FaChevronDown 
} from "react-icons/fa";

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

// 1. Centralized Department List
const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Arts & Design",
  "Social Sciences",
  "Mathematics",
  "Physics"
];

// 🔹 Sober FormField Component
const FormField = ({ label, icon: Icon, name, value, onChange, type = "text", placeholder, required = false }) => (
  <div className="space-y-2">
    <label className="block text-xs font-medium uppercase tracking-wide ml-1" style={{ color: COLORS.textMuted }}>
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: COLORS.textMuted }}>
        <Icon size={14} />
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
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
);

function SignupForm() {
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    rollNo: "",
    Department: "", 
    semester: "",
    session: "",
  });

  const [files, setFiles] = useState({
    profileImage: null,
    studentCardFront: null,
    studentCardBack: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles((prev) => ({ ...prev, [e.target.name]: e.target.files[0] }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      Object.keys(files).forEach((key) => {
        if (files[key]) data.append(key, files[key]);
      });

      await signup(data);
      alert("Signup successful! Please login.");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔹 PAGE BACKGROUND: Warm cream, professional
    <div className="public-theme min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: COLORS.bg }}>
      <div className="w-full max-w-lg">
        
        {/* 🔹 CARD: Clean, less rounded, brand-aligned */}
        <div 
          className="rounded-xl border p-8"
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

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: COLORS.text }}>
              Create Account
            </h2>
            <p className="text-sm" style={{ color: COLORS.textMuted }}>
              Join the university society community
            </p>
          </div>

          {/* 🔹 PROGRESS STEPPER: Subtle, brand-aligned */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((num) => (
              <React.Fragment key={num}>
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-medium transition-colors ${
                    step >= num ? "text-white" : ""
                  }`}
                  style={{ 
                    backgroundColor: step >= num ? COLORS.primary : COLORS.surface,
                    borderColor: step >= num ? COLORS.primary : COLORS.border
                  }}
                >
                  {step > num ? <FaCheckCircle size={14} style={{ color: step >= num ? "#fff" : COLORS.primary }} /> : num}
                </div>
                {num < 3 && (
                  <div 
                    className="w-10 h-px mx-3 transition-colors"
                    style={{ backgroundColor: step > num ? COLORS.primary : COLORS.borderLight }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error Alert - Subtle but clear */}
          {error && (
            <div 
              className="mb-6 px-4 py-3 rounded-lg text-sm"
              style={{ backgroundColor: "rgba(220, 38, 38, 0.08)", color: "#DC2626", border: `1px solid rgba(220, 38, 38, 0.2)` }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* STEP 1: Account Credentials */}
            {step === 1 && (
              <div className="space-y-5">
                <FormField 
                  label="Full Name" 
                  name="fullname" 
                  value={formData.fullname} 
                  onChange={handleChange} 
                  required 
                  icon={FaUser} 
                  placeholder="John Doe" 
                />
                <FormField 
                  label="Email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  icon={FaEnvelope} 
                  placeholder="john@university.edu" 
                />
                <FormField 
                  label="Password" 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  icon={FaLock} 
                  placeholder="••••••••" 
                />
              </div>
            )}

            {/* STEP 2: Academic Details */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField 
                    label="Roll No" 
                    name="rollNo" 
                    value={formData.rollNo} 
                    onChange={handleChange} 
                    required 
                    icon={FaIdCard} 
                    placeholder="CS-123" 
                  />
                  <FormField 
                    label="Semester" 
                    name="semester" 
                    value={formData.semester} 
                    onChange={handleChange} 
                    icon={FaUniversity} 
                    placeholder="6th" 
                  />
                </div>

                {/* Department Select - Sober Styling */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium uppercase tracking-wide ml-1" style={{ color: COLORS.textMuted }}>
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: COLORS.textMuted }}>
                      <FaUniversity size={14} />
                    </div>
                    <select
                      name="Department"
                      value={formData.Department}
                      onChange={handleChange}
                      required
                      className="w-full h-11 pl-10 pr-10 rounded-lg text-sm outline-none transition-colors appearance-none"
                      style={{ 
                        backgroundColor: COLORS.bg,
                        border: `1px solid ${COLORS.border}`,
                        color: COLORS.text
                      }}
                      onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                      onBlur={(e) => e.target.style.borderColor = COLORS.border}
                    >
                      <option value="" disabled>Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none" style={{ color: COLORS.textMuted }}>
                      <FaChevronDown size={12} />
                    </div>
                  </div>
                </div>

                <FormField 
                  label="Session" 
                  name="session" 
                  value={formData.session} 
                  onChange={handleChange} 
                  required 
                  icon={FaUniversity} 
                  placeholder="2022-2026" 
                />
              </div>
            )}

            {/* STEP 3: Document Upload */}
            {step === 3 && (
              <div className="space-y-5">
                {["profileImage", "studentCardFront", "studentCardBack"].map((fileKey) => (
                  <div key={fileKey} className="space-y-2">
                    <label className="block text-xs font-medium uppercase tracking-wide ml-1 capitalize" style={{ color: COLORS.textMuted }}>
                      {fileKey.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {/* 🔹 Sober File Upload Zone */}
                    <label 
                      className="flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
                      style={{ 
                        backgroundColor: COLORS.bg,
                        borderColor: COLORS.border,
                        color: COLORS.textMuted
                      }}
                    >
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <FaCloudUploadAlt className="mb-2" size={24} style={{ color: COLORS.textMuted }} />
                        <p className="text-xs">
                          {files[fileKey] ? (
                            <span className="font-medium truncate max-w-[200px]" style={{ color: COLORS.text }}>
                              {files[fileKey].name}
                            </span>
                          ) : (
                            "Click to upload"
                          )}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        name={fileKey} 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        required 
                        className="hidden" 
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* 🔹 Navigation Buttons: Professional, brand-aligned */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: COLORS.surface,
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`
                  }}
                >
                  <FaArrowLeft size={12} /> Back
                </button>
              )}
              {step < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="flex-[2] h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ 
                    backgroundColor: COLORS.primary, 
                    color: "#fff"
                  }}
                >
                  Continue <FaArrowRight size={12} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-[2] h-11 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: COLORS.primary, 
                    color: "#fff"
                  }}
                >
                  {loading ? "Creating Account..." : "Complete Registration"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: COLORS.textMuted }}>
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="font-medium transition-colors hover:underline"
              style={{ color: COLORS.accent }}
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default SignupForm;