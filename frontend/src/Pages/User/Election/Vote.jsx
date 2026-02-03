import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Users,
  Shield,
  FileText,
  Vote,
} from "lucide-react";
import API_BASE_URL from "../../../config/api.config";

/* ──────────────────────────────────────────────────
   SHARED DESIGN TOKENS  (identical to ApplyPage)
   ────────────────────────────────────────────────── */
const INPUT_BG = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)" };
const CARD_BG  = { background: "rgba(17,20,28,0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" };
const LEFT_BG  = { background: "linear-gradient(160deg, #111520 0%, #0e1018 100%)" };
const BTN_STYLE = { padding: "17px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: "0 4px 28px rgba(99,102,241,.38)" };
const BTN_HOVER_SHADOW = "0 8px 36px rgba(99,102,241,.52)";

/* ──────────────────────────────────────────────────
   AMBIENT BLOBS  (reusable, same as ApplyPage)
   ────────────────────────────────────────────────── */
const Blobs = () => (
  <>
    <div className="absolute rounded-full pointer-events-none" style={{ width: 560, height: 560, top: -220, left: -260, background: "radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 68%)", filter: "blur(90px)" }} />
    <div className="absolute rounded-full pointer-events-none" style={{ width: 420, height: 420, bottom: -180, right: -200, background: "radial-gradient(circle,rgba(14,165,233,.14) 0%,transparent 68%)", filter: "blur(90px)" }} />
  </>
);

/* ──────────────────────────────────────────────────
   SKELETON — list view
   ────────────────────────────────────────────────── */
const ListSkeleton = () => (
  <div className="min-h-screen bg-[#0a0c10] px-6 py-20 relative overflow-hidden">
    <Blobs />
    <div className="relative z-10 w-full max-w-6xl mx-auto">
      {/* back stub */}
      <div className="h-3 w-36 rounded-full bg-white/[.06] animate-pulse mb-8" />
      {/* header stub */}
      <div className="mb-10 space-y-2">
        <div className="h-2.5 w-24 rounded-full bg-white/[.06] animate-pulse" />
        <div className="h-9 w-48 rounded-full bg-white/[.08] animate-pulse" />
      </div>
      {/* card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-2xl border border-white/[.06] overflow-hidden" style={CARD_BG}>
            <div className="p-7 space-y-4">
              <div className="h-2.5 w-20 rounded-full bg-white/[.06] animate-pulse" />
              <div className="h-6 w-40 rounded-full bg-white/[.08] animate-pulse" />
              <div className="flex gap-2">
                {[48,56,44].map((w,j) => <div key={j} className="h-5 rounded-full bg-white/[.05] animate-pulse" style={{ width: w }} />)}
              </div>
            </div>
            <div className="px-7 pb-7">
              <div className="h-12 w-full rounded-xl bg-white/[.06] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────
   SKELETON — voting view (two-col, mirrors ApplyPage)
   ────────────────────────────────────────────────── */
const VotingSkeleton = () => (
  <div className="min-h-screen bg-[#0a0c10] px-6 py-20 relative overflow-hidden">
    <Blobs />
    <div className="relative z-10 w-full max-w-6xl mx-auto">
      <div className="h-3 w-36 rounded-full bg-white/[.06] animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-white/[.06]">
        {/* left */}
        <div className="lg:col-span-2 p-10 space-y-5" style={{ background: "rgba(15,17,23,0.9)" }}>
          <div className="h-2.5 w-20 rounded-full bg-white/[.07] animate-pulse" />
          <div className="h-7 w-40 rounded-full bg-white/[.08] animate-pulse" />
          <div className="h-px bg-white/[.06] my-4" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[.06] animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-2.5 w-24 rounded-full bg-white/[.07] animate-pulse" />
                <div className="h-2 w-36 rounded-full bg-white/[.05] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        {/* right */}
        <div className="lg:col-span-3 p-10 space-y-5" style={CARD_BG}>
          <div className="h-2.5 w-28 rounded-full bg-white/[.06] animate-pulse" />
          <div className="h-7 w-44 rounded-full bg-white/[.07] animate-pulse" />
          <div className="h-px bg-white/[.06]" />
          {[1,2].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-2.5 w-24 rounded-full bg-white/[.06] animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                {[1,2].map(j => <div key={j} className="h-24 rounded-xl bg-white/[.04] animate-pulse" />)}
              </div>
            </div>
          ))}
          <div className="h-14 w-full rounded-xl bg-white/[.06] animate-pulse mt-4" />
        </div>
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────
   SUCCESS MODAL  (identical pattern to ApplyPage)
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
        Vote Cast Successfully
      </h2>
      <p className="text-[13px] text-white/40 leading-relaxed mb-8 max-w-sm mx-auto">
        Your ballot for <span className="text-white/70 font-semibold">{title}</span> has been
        recorded. Thank you for participating.
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
   INFO CARD  (left-panel row — same as ApplyPage)
   ────────────────────────────────────────────────── */
const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3.5">
    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-indigo-500/[.18]" style={{ background: "rgba(99,102,241,.08)" }}>
      <Icon size={18} className="text-indigo-400" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-[13px] text-white/75 font-medium">{value}</p>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────
   ROLE LABEL  (section header inside voting form)
   ────────────────────────────────────────────────── */
const RoleLabel = ({ n, children }) => (
  <div className="flex items-center gap-2.5 mb-3">
    <span
      className="flex items-center justify-center w-5 h-5 rounded-full border border-indigo-500/30 text-indigo-400 text-[9px] font-bold"
      style={{ background: "rgba(99,102,241,.1)" }}
    >
      {n}
    </span>
    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{children}</span>
  </div>
);

/* ──────────────────────────────────────────────────
   CANDIDATE CARD
   ────────────────────────────────────────────────── */
const CandidateCard = ({ candidate, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative w-full text-left rounded-xl transition-all duration-200 active:scale-[.97]"
    style={{
      padding: "16px",
      background: isSelected ? "rgba(99,102,241,.12)" : "rgba(255,255,255,.04)",
      border: isSelected
        ? "1.5px solid rgba(99,102,241,.55)"
        : "1px solid rgba(255,255,255,.09)",
      boxShadow: isSelected ? "0 0 0 3px rgba(99,102,241,.15)" : "none",
    }}
  >
    {/* selected badge */}
    {isSelected && (
      <motion.div
        className="absolute -top-2.5 -right-2.5 z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#111417]"
        style={{ background: "#6366f1" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
      >
        <CheckCircle2 size={14} className="text-white" />
      </motion.div>
    )}

    <div className="flex items-center gap-4">
      {/* avatar */}
      <img
        src={`http://localhost:8000/uploads/${candidate.image}`}
        alt={candidate.name}
        className="w-14 h-14 rounded-lg object-cover shrink-0"
        style={{
          border: isSelected ? "2px solid rgba(99,102,241,.5)" : "2px solid rgba(255,255,255,.08)",
        }}
      />
      {/* info */}
      <div className="min-w-0">
        <p className="text-white text-[14px] font-semibold truncate">{candidate.name}</p>
        <p className="text-white/30 text-[11px] mt-0.5">
          {isSelected ? "Selected" : "Click to select"}
        </p>
      </div>
    </div>
  </button>
);

/* ──────────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────────── */
export default function VotePage() {
  const navigate = useNavigate();

  const [elections, setElections]           = useState([]);
  const [candidatesByRole, setCandidatesByRole] = useState({});
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedVotes, setSelectedVotes]   = useState({});
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState("");
  const [success, setSuccess]               = useState(false);

  useEffect(() => { fetchLiveElections(); }, []);

  /* ── data ── */
  const fetchLiveElections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/election/allElections`);
      setElections((res.data.data || []).filter((e) => e.status === "VOTING_LIVE"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openVote = async (election) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/election/${election._id}/candidates-for-voting`);
      setCandidatesByRole(res.data.data);
      setSelectedElection(election);
      setSelectedVotes({});
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    const roles = Object.keys(selectedVotes);
    if (roles.length === 0) {
      setError("Please select at least one candidate before voting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      for (const role of roles) {
        await axios.post(
          `${API_BASE_URL}/election/castVote/${selectedElection._id}`,
          { role, candidateId: selectedVotes[role] },
          { withCredentials: true }
        );
      }
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Voting failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAfterSuccess = () => {
    setSuccess(false);
    setSelectedElection(null);
    setCandidatesByRole({});
    setSelectedVotes({});
    fetchLiveElections();
  };

  /* stagger */
  const d = (i) => i * 0.06;

  /* ──────────────────────────────────────────────
     VIEW 1  —  ELECTION LIST
     ────────────────────────────────────────────── */
  if (loading && !selectedElection) return <ListSkeleton />;

  if (!selectedElection) {
    return (
      <div className="min-h-screen bg-[#0a0c10] px-6 py-20 relative overflow-hidden">
        <Blobs />

        <div className="relative z-10 w-full max-w-6xl mx-auto">

          {/* header block */}
          <motion.div className="mb-10" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            {/* badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/22 px-3.5 py-1 mb-5"
              style={{ background: "rgba(99,102,241,.1)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Live Now</span>
            </div>
            <h1 className="text-[38px] font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
              Live <span style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Elections</span>
            </h1>
            <p className="text-white/35 text-[14px] mt-2">Select an election below to cast your vote.</p>
          </motion.div>

          {/* gradient rule */}
          <motion.div
            className="h-px mb-10"
            style={{ background: "linear-gradient(90deg, rgba(99,102,241,.28), transparent)" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* election cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {elections.map((el, idx) => (
              <motion.div
                key={el._id}
                className="rounded-2xl border border-white/[.06] overflow-hidden flex flex-col transition-all duration-300 group"
                style={{ ...CARD_BG, boxShadow: "0 0 0 1px rgba(99,102,241,.06) inset, 0 16px 40px rgba(0,0,0,.35)" }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(idx + 1), duration: 0.4 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,.28)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; }}
              >
                {/* card body */}
                <div className="p-7 flex-1">
                  {/* live dot */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Voting Live</span>
                  </div>

                  <h3 className="text-[20px] font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>{el.title}</h3>

                  {/* role pills */}
                  <div className="flex flex-wrap gap-2">
                    {el.roles.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                        style={{ background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.22)", color: "#818cf8" }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* card footer — button */}
                <div className="px-7 pb-7">
                  <button
                    onClick={() => openVote(el)}
                    className="w-full rounded-xl text-white text-[12px] font-bold uppercase tracking-widest transition-all duration-200 active:scale-[.97]"
                    style={BTN_STYLE}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = BTN_HOVER_SHADOW; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = BTN_STYLE.boxShadow; }}
                  >
                    Cast Vote
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* empty state */}
          {elections.length === 0 && (
            <motion.div
              className="text-center py-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div
                className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-2xl border border-white/[.08]"
                style={{ background: "rgba(255,255,255,.04)" }}
              >
                <Vote size={28} className="text-white/25" />
              </div>
              <p className="text-white/50 text-[15px] font-semibold">No live elections at the moment</p>
              <p className="text-white/25 text-[13px] mt-1">Check back soon — elections will appear here when voting opens.</p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────
     VIEW 2  —  VOTING  (two-column, mirrors ApplyPage)
     ────────────────────────────────────────────── */
  if (loading) return <VotingSkeleton />;

  /* success modal overlay */
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0c10]">
        <SuccessModal title={selectedElection.title} onBack={resetAfterSuccess} />
      </div>
    );
  }

  const roles = Object.keys(candidatesByRole);
  const totalRoles = roles.length;
  const votedCount = Object.keys(selectedVotes).length;

  return (
    <div className="min-h-screen bg-[#0a0c10] px-6 py-20 relative overflow-hidden">
      <Blobs />

      <div className="relative z-10 w-full max-w-6xl mx-auto">

        {/* back */}
        <motion.button
          onClick={() => { setSelectedElection(null); setCandidatesByRole({}); setError(""); }}
          className="flex items-center gap-2 text-white/38 hover:text-indigo-400 text-[12px] font-semibold uppercase tracking-widest transition-colors duration-200 mb-6"
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <ArrowLeft size={15} /> Back to Elections
        </motion.button>

        {/* two-col shell */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden border border-white/[.06]"
          style={{ boxShadow: "0 0 0 1px rgba(99,102,241,.06) inset, 0 32px 64px rgba(0,0,0,.5)" }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* ════════════════════════════════════════
              LEFT PANEL  —  election info
              ════════════════════════════════════════ */}
          <div className="lg:col-span-2 relative overflow-hidden p-10 lg:p-12 flex flex-col justify-between" style={{ ...LEFT_BG, minHeight: 520 }}>

            {/* corner glow */}
            <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle at 0% 0%,rgba(99,102,241,.15) 0%,transparent 70%)" }} />

            {/* grid texture */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[.04]" style={{ minHeight: 520 }}>
              <defs>
                <pattern id="vgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#vgrid)" />
            </svg>

            <div className="relative z-10">
              {/* badge */}
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 px-3.5 py-1 mb-6"
                style={{ background: "rgba(34,197,94,.1)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(1), duration: 0.35 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Voting Live</span>
              </motion.div>

              {/* title */}
              <motion.h1
                className="text-[34px] font-bold text-white leading-tight mb-3"
                style={{ fontFamily: "Georgia, serif" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: d(2), duration: 0.4 }}
              >
                {selectedElection.title}
              </motion.h1>

              <motion.p
                className="text-white/38 text-[13px] leading-relaxed mb-8 max-w-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: d(3), duration: 0.35 }}
              >
                Review the candidates for each position and cast your ballot. You may vote for one candidate per role.
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
                  <InfoCard icon={Users} label="Positions" value={`${totalRoles} role${totalRoles !== 1 ? "s" : ""} to vote`} />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: d(6), duration: 0.35 }}>
                  <InfoCard icon={FileText} label="Your Progress" value={`${votedCount} of ${totalRoles} selected`} />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: d(7), duration: 0.35 }}>
                  <InfoCard icon={Shield} label="Confidentiality" value="Your ballot is secret & secure" />
                </motion.div>
              </div>
            </div>

            {/* footer */}
            <p className="relative z-10 text-white/20 text-[11px] mt-10">© Election Management System · Confidential</p>
          </div>

          {/* ════════════════════════════════════════
              RIGHT PANEL  —  candidate selection
              ════════════════════════════════════════ */}
          <div className="lg:col-span-3 p-10 lg:p-12" style={{ ...CARD_BG }}>

            {/* heading */}
            <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(2), duration: 0.4 }}>
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-2">Cast Your Ballot</p>
              <h2 className="text-[26px] font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                Select your <span style={{ background: "linear-gradient(135deg,#818cf8,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Candidates</span>
              </h2>
            </motion.div>

            {/* progress bar */}
            <motion.div
              className="w-full rounded-full overflow-hidden mb-6"
              style={{ height: 3, background: "rgba(255,255,255,.06)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: d(3), duration: 0.35 }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalRoles > 0 ? (votedCount / totalRoles) * 100 : 0}%`,
                  background: "linear-gradient(90deg,#6366f1,#818cf8)",
                }}
              />
            </motion.div>

            {/* divider */}
            <motion.div
              className="h-px mb-7"
              style={{ background: "linear-gradient(90deg, rgba(99,102,241,.25), transparent)" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: d(3), duration: 0.5 }}
            />

            {/* roles + candidate grids */}
            <div className="space-y-7">
              {roles.map((role, rIdx) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: d(rIdx + 4), duration: 0.38 }}
                >
                  <RoleLabel n={rIdx + 1}>{role}</RoleLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {candidatesByRole[role].map((c) => (
                      <CandidateCard
                        key={c.candidateId}
                        candidate={c}
                        isSelected={selectedVotes[role] === c.candidateId}
                        onClick={() => { setSelectedVotes((p) => ({ ...p, [role]: c.candidateId })); setError(""); }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── error bar ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-start gap-3 rounded-xl px-4 py-3 mt-6"
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

            {/* ── submit button ── */}
            <motion.button
              type="button"
              onClick={handleVoteSubmit}
              disabled={submitting}
              className="w-full rounded-xl text-white text-[13px] font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.97] mt-7"
              style={BTN_STYLE}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.boxShadow = BTN_HOVER_SHADOW; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = BTN_STYLE.boxShadow; }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d(roles.length + 5), duration: 0.35 }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={17} className="animate-spin" /> Submitting Ballot…
                </span>
              ) : (
                "Finalize & Vote"
              )}
            </motion.button>

            {/* footer */}
            <motion.p
              className="text-center text-white/18 text-[11px] mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: d(roles.length + 6), duration: 0.4 }}
            >
              Your ballot is kept secure and confidential at all times.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}