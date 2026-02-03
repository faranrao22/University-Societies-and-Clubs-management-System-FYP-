import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  IdCard,
  Upload,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Shield,
  Clock,
  Users,
} from "lucide-react";
import API_BASE_URL from "../../../config/api.config";

/* ──────────────────────────────────────────────────
   SHARED CONSTANTS
   ────────────────────────────────────────────────── */
const INPUT_BG = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)" };
const FOCUS_RING = "focus:ring-2 focus:ring-indigo-500/40";

/* ──────────────────────────────────────────────────
   SKELETON
   ────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center px-6 py-20">
    <div className="w-full max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-white/[.06]">
        {/* left */}
        <div className="lg:col-span-2 p-10 space-y-5" style={{ background: "rgba(15,17,23,0.9)" }}>
          <div className="h-2.5 w-20 rounded-full bg-white/[.07] animate-pulse" />
          <div className="h-7 w-40 rounded-full bg-white/[.08] animate-pulse" />
          <div className="h-px bg-white/[.06] my-4" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[.06] animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-2.5 w-24 rounded-full bg-white/[.07] animate-pulse" />
                <div className="h-2 w-36 rounded-full bg-white/[.05] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        {/* right */}
        <div className="lg:col-span-3 p-10 space-y-5" style={{ background: "rgba(17,20,28,0.72)" }}>
          <div className="h-2.5 w-28 rounded-full bg-white/[.06] animate-pulse" />
          <div className="h-7 w-44 rounded-full bg-white/[.07] animate-pulse" />
          <div className="h-px bg-white/[.06]" />
          {[48, 48, 120].map((h, i) => (
            <div key={i} className="space-y-2">
              <div className="h-2 w-20 rounded-full bg-white/[.06] animate-pulse" />
              <div className="w-full rounded-xl bg-white/[.04] animate-pulse" style={{ height: h }} />
            </div>
          ))}
          <div className="w-full h-14 rounded-xl bg-white/[.06] animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────
   SUCCESS MODAL
   ────────────────────────────────────────────────── */
const SuccessModal = ({ title, onBack }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)" }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="w-full max-w-[440px] rounded-2xl border border-white/[.07] p-12 text-center shadow-2xl"
      style={{ background: "#111417" }}
      initial={{ scale: 0.84, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      <motion.div
        className="mx-auto mb-6 flex items-center justify-center rounded-full border border-emerald-500/25"
        style={{ width: 80, height: 80, background: "rgba(34,197,94,0.1)" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 320 }}
      >
        <CheckCircle2 size={38} className="text-emerald-400" />
      </motion.div>
      <h2 className="text-[24px] font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
        Application Submitted
      </h2>
      <p className="text-[13px] text-white/40 leading-relaxed mb-8 max-w-sm mx-auto">
        Your candidacy for <span className="text-white/70 font-semibold">{title}</span> has been
        received and is now under official review.
      </p>
      <button
        onClick={onBack}
        className="w-full py-3.5 rounded-xl text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-200 active:scale-[.96]"
        style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: "0 4px 22px rgba(99,102,241,.4)" }}
      >
        Back to Elections
      </button>
    </motion.div>
  </motion.div>
);

/* ──────────────────────────────────────────────────
   INFO CARD (left panel items)
   ────────────────────────────────────────────────── */
const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3.5">
    <div
      className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-indigo-500/18"
      style={{ background: "rgba(99,102,241,.08)" }}
    >
      <Icon size={18} className="text-indigo-400" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-[13px] text-white/75 font-medium">{value}</p>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────
   STEP LABEL
   ────────────────────────────────────────────────── */
const StepLabel = ({ n, children }) => (
  <label className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5">
    <span
      className="flex items-center justify-center w-5 h-5 rounded-full border border-indigo-500/30 text-indigo-400 text-[9px] font-bold"
      style={{ background: "rgba(99,102,241,.1)" }}
    >
      {n}
    </span>
    {children}
  </label>
);

/* ──────────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────────── */
export default function ApplyPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [formData, setFormData] = useState({ role: "", cnic: "", image: null });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/election/Singleelection/${electionId}`)
      .then((r) => setElection(r.data.data))
      .catch((e) => console.error(e));
  }, [electionId]);

  /* image */
  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((p) => ({ ...p, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const clearImage = () => {
    setFormData((p) => ({ ...p, image: null }));
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role || !formData.cnic || !formData.image) {
      setError("Please complete all fields and upload a photo to continue.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("role", formData.role);
      fd.append("cnic", formData.cnic);
      fd.append("image", formData.image);
      await axios.post(`${API_BASE_URL}/election/apply/${electionId}`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!election) return <Skeleton />;
  if (success)
    return (
      <div className="min-h-screen bg-[#0a0c10]">
        <SuccessModal title={election.title} onBack={() => navigate("/elections")} />
      </div>
    );

  const d = (i) => i * 0.06;

  /* ───── RENDER ───── */
  return (
    <div className="min-h-screen bg-[#0a0c10] px-6 py-20 relative overflow-hidden">

      {/* ambient blobs */}
      <div className="absolute rounded-full pointer-events-none" style={{ width: 560, height: 560, top: -220, left: -260, background: "radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)", filter: "blur(90px)" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: 420, height: 420, bottom: -180, right: -200, background: "radial-gradient(circle,rgba(14,165,233,.14) 0%,transparent 68%)", filter: "blur(90px)" }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto">

        {/* ── top nav bar ── */}
        <motion.button
          onClick={() => navigate("/applyForElections")}
          className="flex items-center gap-2 text-white/38 hover:text-indigo-400 text-[12px] font-semibold uppercase tracking-widest transition-colors duration-200 mb-6"
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <ArrowLeft size={15} /> Back to Elections
        </motion.button>

        {/* ── two-column container ── */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden border border-white/[.06]"
          style={{ boxShadow: "0 0 0 1px rgba(99,102,241,.06) inset, 0 32px 64px rgba(0,0,0,.5)" }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* ════════════════════════════════════════
              LEFT  —  hero / info panel
              ════════════════════════════════════════ */}
          <div
            className="lg:col-span-2 relative overflow-hidden p-10 lg:p-12 flex flex-col justify-between"
            style={{ background: "linear-gradient(160deg, #111520 0%, #0e1018 100%)", minHeight: 520 }}
          >
            {/* subtle top-left glow inside panel */}
            <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle at 0% 0%,rgba(99,102,241,.15) 0%,transparent 70%)" }} />

            {/* decorative grid lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[.04]" style={{ minHeight: 520 }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            <div className="relative z-10">
              {/* badge */}
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-indigo-500/22 px-3.5 py-1 mb-6"
                style={{ background: "rgba(99,102,241,.1)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(1), duration: 0.35 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Open Election</span>
              </motion.div>

              {/* title */}
              <motion.h1
                className="text-[34px] font-bold text-white leading-tight mb-3"
                style={{ fontFamily: "Georgia, serif" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(2), duration: 0.4 }}
              >
                {election.title}
              </motion.h1>

              <motion.p
                className="text-white/38 text-[13px] leading-relaxed mb-8 max-w-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: d(3), duration: 0.35 }}
              >
                Submit your official candidacy application for this election. All submissions are verified before review.
              </motion.p>

              {/* divider */}
              <motion.div
                className="h-px mb-8"
                style={{ background: "linear-gradient(90deg, rgba(99,102,241,.28), transparent)" }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: d(4), duration: 0.5 }}
              />

              {/* info items */}
              <div className="space-y-5">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: d(5), duration: 0.35 }}>
                  <InfoCard icon={Users} label="Available Positions" value={`${election.roles.length} role${election.roles.length !== 1 ? "s" : ""} open`} />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: d(6), duration: 0.35 }}>
                  <InfoCard icon={FileText} label="Required Documents" value="CNIC + Profile Photo" />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: d(7), duration: 0.35 }}>
                  <InfoCard icon={Shield} label="Verification" value="Identity verified before review" />
                </motion.div>
              </div>
            </div>

            {/* bottom note */}
            <p className="relative z-10 text-white/20 text-[11px] mt-10">
              © Election Management System · Confidential
            </p>
          </div>

          {/* ════════════════════════════════════════
              RIGHT  —  the form
              ════════════════════════════════════════ */}
          <div
            className="lg:col-span-3 p-10 lg:p-12"
            style={{ background: "rgba(17,20,28,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          >
            {/* heading */}
            <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(2), duration: 0.4 }}>
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-2">Candidacy Form</p>
              <h2 className="text-[26px] font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                Fill in your <span style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Details</span>
              </h2>
            </motion.div>

            {/* divider */}
            <motion.div
              className="h-px mb-8"
              style={{ background: "linear-gradient(90deg, rgba(99,102,241,.25), transparent)" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: d(3), duration: 0.5 }}
            />

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── 1  POSITION ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(4), duration: 0.35 }}>
                <StepLabel n={1}>Position</StepLabel>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => { setFormData((p) => ({ ...p, role: e.target.value })); setError(""); }}
                    className={`w-full appearance-none rounded-xl text-white text-[14px] font-medium outline-none transition-all duration-200 ${FOCUS_RING} cursor-pointer`}
                    style={{ ...INPUT_BG, padding: "15px 42px 15px 18px" }}
                  >
                    <option value="" style={{ background: "#1a1d26", color: "#fff" }}>Select a position…</option>
                    {election.roles.map((r) => (
                      <option key={r} value={r} style={{ background: "#1a1d26", color: "#fff" }}>{r}</option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </motion.div>

              {/* ── 2  CNIC ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(5), duration: 0.35 }}>
                <StepLabel n={2}>Identity (CNIC)</StepLabel>
                <div className="relative">
                  <IdCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.cnic}
                    onChange={(e) => { setFormData((p) => ({ ...p, cnic: e.target.value })); setError(""); }}
                    placeholder="00000-0000000-0"
                    className={`w-full rounded-xl text-white text-[14px] font-medium placeholder-white/22 outline-none transition-all duration-200 ${FOCUS_RING}`}
                    style={{ ...INPUT_BG, padding: "15px 18px 15px 44px" }}
                  />
                </div>
              </motion.div>

              {/* ── 3  PHOTO ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(6), duration: 0.35 }}>
                <StepLabel n={3}>Profile Photo</StepLabel>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />

                {preview ? (
                  /* preview row */
                  <div className="flex items-center gap-5 rounded-xl p-4" style={INPUT_BG}>
                    <img src={preview} alt="preview" className="w-16 h-16 rounded-lg object-cover border-2 border-indigo-500/30" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[14px] font-semibold truncate">{formData.image.name}</p>
                      <p className="text-white/30 text-[12px] mt-0.5">{(formData.image.size / 1024).toFixed(1)} KB · Image uploaded</p>
                    </div>
                    <button type="button" onClick={clearImage} className="text-white/28 hover:text-red-400 transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/[.05]">
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  /* empty zone */
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full rounded-xl flex flex-col items-center justify-center gap-2.5 transition-all duration-200"
                    style={{ padding: "32px 16px", border: "1.5px dashed rgba(255,255,255,.13)", background: "rgba(255,255,255,.02)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,.42)"; e.currentTarget.style.background = "rgba(99,102,241,.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.13)"; e.currentTarget.style.background = "rgba(255,255,255,.02)"; }}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-indigo-500/20" style={{ background: "rgba(99,102,241,.08)" }}>
                      <Upload size={20} className="text-indigo-400" />
                    </div>
                    <p className="text-white/60 text-[14px] font-semibold">Click to upload photo</p>
                    <p className="text-white/25 text-[12px]">JPG, PNG or WEBP — max 5 MB</p>
                  </button>
                )}
              </motion.div>

              {/* ── error ── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="flex items-start gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)" }}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                    <span className="text-red-400 text-[13px] font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── submit ── */}
              <motion.button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl text-white text-[13px] font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.97]"
                style={{ padding: "17px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: "0 4px 28px rgba(99,102,241,.38)" }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.boxShadow = "0 8px 36px rgba(99,102,241,.52)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 28px rgba(99,102,241,.38)"; }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(7), duration: 0.35 }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={17} className="animate-spin" /> Processing…
                  </span>
                ) : (
                  "Submit Candidacy"
                )}
              </motion.button>
            </form>

            {/* footer */}
            <motion.p
              className="text-center text-white/18 text-[11px] mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: d(8), duration: 0.4 }}
            >
              Your information is kept secure and confidential at all times.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}