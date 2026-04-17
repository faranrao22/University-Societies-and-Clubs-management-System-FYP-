// src/pages/student/profile/sections/ProfileVolunteerStatus.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import {
  Download, CheckCircle, XCircle, Hourglass, Info, AlertCircle,
  Calendar, MapPin, ArrowLeft, Loader2, ExternalLink, BadgeCheck,
  Eye, X,
} from "lucide-react";

// ─── Image URL helper ─────────────────────────────────────────────────────────
const IMG_BASE = `${API_BASE_URL.replace("/api", "")}/uploads/`;
const imgUrl = (filename) => (filename ? `${IMG_BASE}${filename}` : null);

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    approved: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0", icon: <CheckCircle size={12} />, label: "Approved" },
    rejected: { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", icon: <XCircle     size={12} />, label: "Rejected" },
    pending:  { bg: "#fffbeb", text: "#a16207", border: "#fde68a", icon: <Hourglass   size={12} />, label: "Pending"  },
    unknown:  { bg: "#f9fafb", text: "#374151", border: "#e5e7eb", icon: <Info        size={12} />, label: "Unknown"  },
  };
  const c = cfg[status] || cfg.unknown;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "9999px",
      fontSize: "11px", fontWeight: "700",
      backgroundColor: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
    }}>
      {c.icon} {c.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VOLUNTEER ID CARD
// ─────────────────────────────────────────────────────────────────────────────
function VolunteerIdCard({ cardRef, app, authUser }) {
  const event       = app.event       || {};
  const application = app.application || {};
  const user        = app.user        || authUser || {};

  // ✅ Handles both user.Department (capital D) and user.department (lowercase d)
  const dept = user.Department || user.department || null;

  const eventDate = event.startDateTime
    ? new Date(event.startDateTime).toLocaleDateString("en-US", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "TBA";

  const initial = (user.fullname || "?")[0].toUpperCase();

  const ACCENT_GREEN = "#1e3a8a";
  const ACCENT_AMBER = "#38bdf8";
  const TEXT_DARK    = "#1f2937";
  const TEXT_LIGHT   = "#6b7280";
  const BG_CREAM     = "#eff6ff";
  const BORDER_COLOR = "rgba(30, 64, 175, 0.16)";

  return (
    <div
      ref={cardRef}
      style={{
        width: "380px",
        height: "580px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        overflow: "hidden",
        background: BG_CREAM,
        boxShadow: "0 12px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
        position: "relative",
      }}
    >
      {/* ── TOP: Event Image Background ── */}
      <div style={{ height: "220px", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", color: "#fff" }}>
        {event.image ? (
          <img
            src={imgUrl(event.image)}
            alt="event"
            crossOrigin="anonymous"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", zIndex: 0 }}
          />
        ) : (
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: `linear-gradient(135deg, ${ACCENT_GREEN}, ${ACCENT_AMBER})`, zIndex: 0 }} />
        )}

        {/* Dark overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 100%)", zIndex: 1 }} />

        {/* University Header */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", paddingTop: "18px", marginBottom: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "3px", textTransform: "uppercase", color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
            UNIVERSITY OF EDUCATION, LAHORE
          </div>
          <div style={{ width: "30px", height: "2px", background: ACCENT_AMBER, margin: "8px auto 0", borderRadius: "2px" }} />
        </div>

        {/* Profile Photo */}
        <div style={{ position: "relative", zIndex: 2, marginTop: "auto", marginBottom: "-32px" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "10%", overflow: "hidden", border: "1px solid #fff", background: "#f3f4f6", boxShadow: "0 6px 16px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {user.profileImage ? (
              <img
                src={imgUrl(user.profileImage)}
                alt="profile"
                crossOrigin="anonymous"
                style={{ width: "120%", height: "120%", objectFit: "cover", objectPosition: "center top" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${ACCENT_GREEN}, ${ACCENT_AMBER})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "700", color: "#fff" }}>
                {initial}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Info Section ── */}
      <div style={{ flex: 1, background: BG_CREAM, padding: "42px 26px 20px", display: "flex", flexDirection: "column" }}>

        {/* Name & Role */}
        <div style={{ textAlign: "center", marginBottom: "14px" }}>
          <div style={{ fontSize: "21px", fontWeight: "800", color: ACCENT_GREEN, lineHeight: 1.15, marginBottom: "5px" }}>
            {user.fullname || "Volunteer Name"}
          </div>
          <div style={{ fontSize: "12px", fontWeight: "700", color: TEXT_LIGHT, textTransform: "uppercase", letterSpacing: "2px" }}>
            Role: {application.role || "Volunteer"}
          </div>
        </div>

        {/* ✅ Department & Semester — safe against both casings */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "20px", fontSize: "11px", fontWeight: "700" }}>
          {dept && (
            <span style={{ color: ACCENT_GREEN, display: "flex", alignItems: "center", gap: "5px" }}>
             
              Department {" "}: {dept}
            </span>
          )}
          {user.semester && (
            <span style={{ color: ACCENT_GREEN, display: "flex", alignItems: "center", gap: "5px" }}>
             
              Semester {" "}: {user.semester}
            </span>
          )}
        </div>

        {/* Info Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "11px", marginBottom: "auto" }}>
          {[
            { label: "DATE",  value: eventDate,             icon: "📅" },
            { label: "VENUE", value: event.venue  || "TBA", icon: "📍" },
            { label: "EMAIL", value: user.email   || "N/A", icon: "✉️" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px" }}>
              <span style={{ width: "22px", textAlign: "center", fontSize: "15px", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontWeight: "700", color: TEXT_DARK, width: "48px", flexShrink: 0 }}>{item.label}</span>
              <span style={{ color: TEXT_LIGHT, flex: 1, wordBreak: "break-all", lineHeight: 1.3, letterSpacing: "1px" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "18px", paddingTop: "14px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ marginTop: "auto", borderTop: `1px solid ${BORDER_COLOR}`, paddingTop: "16px", paddingBottom: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: TEXT_LIGHT, textAlign: "center", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>
              Volunteer card for the event
            </div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: ACCENT_GREEN, textAlign: "center", letterSpacing: "1px", lineHeight: 1.3, maxWidth: "95%", wordBreak: "break-word" }}>
              {event.title || "Event Name"}
            </div>
            <div style={{ width: "40px", height: "2px", background: ACCENT_AMBER, marginTop: "10px", borderRadius: "2px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF ENGINE
// ─────────────────────────────────────────────────────────────────────────────
async function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

function replaceOklch(cssText) {
  return cssText.replace(/oklch\([^)]*\)/g, "#888888");
}

async function patchStylesheets(clonedDoc) {
  clonedDoc.querySelectorAll("style").forEach((tag) => {
    if (tag.textContent.includes("oklch")) tag.textContent = replaceOklch(tag.textContent);
  });
  await Promise.all(Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]')).map(async (link) => {
    try {
      const res = await fetch(link.href);
      let css = await res.text();
      if (css.includes("oklch")) {
        css = replaceOklch(css);
        const s = clonedDoc.createElement("style");
        s.textContent = css;
        link.parentNode.insertBefore(s, link);
        link.remove();
      }
    } catch (_) { link.remove(); }
  }));
  const override = clonedDoc.createElement("style");
  override.textContent = `
    :root, html, body, *, *::before, *::after {
      --tw-ring-color: #6366f1 !important;
      --tw-ring-shadow: none !important;
      --tw-shadow-color: rgba(0,0,0,0.1) !important;
      --tw-border-opacity: 1 !important;
      --ring-color: #6366f1 !important;
    }
    html { border-color: #e5e7eb !important; }
    body { border-color: #e5e7eb !important; }
  `;
  clonedDoc.head.appendChild(override);
}

function stripInlineOklch(el) {
  try { if (el.style?.cssText?.includes("oklch")) el.style.cssText = replaceOklch(el.style.cssText); } catch (_) {}
  for (const child of el.children) stripInlineOklch(child);
}

async function downloadCardAsPDF(cardRef, filename) {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const element = cardRef.current;
  if (!element) return;
  const images = element.querySelectorAll("img");
  await Promise.all(Array.from(images).map(img =>
    img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
  ));
  const canvas = await window.html2canvas(element, {
    scale: 2, useCORS: true, allowTaint: false,
    backgroundColor: "#ffffff", logging: false,
    onclone: async (clonedDoc) => {
      await patchStylesheets(clonedDoc);
      stripInlineOklch(clonedDoc.documentElement);
    },
  });
  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width + 40, canvas.height + 40],
  });
  pdf.addImage(imgData, "PNG", 20, 20, canvas.width, canvas.height);
  pdf.save(filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD PREVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
function CardModal({ app, authUser, onClose, onDownload, downloading }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onClose}
          style={{ alignSelf: "flex-end", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
        >
          <X size={18} />
        </button>

        {/* Card preview — visual only, not the capture ref */}
        <VolunteerIdCard app={app} authUser={authUser} />

        <button
          onClick={onDownload}
          disabled={downloading}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 32px", borderRadius: "12px", border: "none", background: downloading ? "#6b7280" : "#1e3a8a", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: downloading ? "not-allowed" : "pointer" }}
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloading ? "Generating PDF…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileVolunteerStatus({ user: propUser }) {
  const { user } = useAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [data,          setData]          = useState(null);
  const [mode,          setMode]          = useState("list");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pendingCard,   setPendingCard]   = useState(null);
  const [previewApp,    setPreviewApp]    = useState(null);
  const cardRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?._id) { setError("User not authenticated"); setLoading(false); return; }
    (async () => {
      try {
        const url = `${API_BASE_URL}/event/volunteer/status${eventId ? `/${eventId}` : ""}`;
        const res = await axios.get(url, { withCredentials: true });
        setMode(res.data.mode);
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, user]);

  // ── PDF generation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pendingCard) return;
    (async () => {
      try {
        await new Promise(r => setTimeout(r, 300));
        const filename = `volunteer-card-${String(pendingCard.event?._id || "id").slice(-6)}.pdf`;
        await downloadCardAsPDF(cardRef, filename);
      } catch {
        alert("Failed to generate PDF. Check console for details.");
      } finally {
        setPendingCard(null);
        setDownloadingId(null);
      }
    })();
  }, [pendingCard]);

  // ── Fetch full data → trigger PDF ─────────────────────────────────────────
const triggerDownload = async (eventIdStr, knownData = null) => {
  if (downloadingId) return;

  setDownloadingId(eventIdStr);

  try {
    let cardData = knownData;

    if (!cardData?.user) {
      const res = await axios.get(
        `${API_BASE_URL}/event/volunteer/status/${eventIdStr}`,
        { withCredentials: true }
      );

      cardData = res.data.data;
    }

    // ✅ FIX: Merge authenticated user data (ensures Department exists)
    cardData.user = {
      ...(cardData.user || {}),
      ...(user || {}),
    };

    console.log("✅ FINAL CARD DATA:", cardData);
    console.log("✅ USER IN CARD:", cardData.user);
    console.log("✅ DEPARTMENT:", cardData.user?.Department, cardData.user?.department);

    setPreviewApp(null);
    setPendingCard(cardData);

  } catch (err) {
    console.error("❌ Download Error:", err);
    alert("Error fetching card data.");
    setDownloadingId(null);
  }
};

  // ── Open preview modal ─────────────────────────────────────────────────────
  const openPreview = async (app) => {
    try {
      if (user) { setPreviewApp(app); return; }
      const res = await axios.get(`${API_BASE_URL}/event/volunteer/status/${String(app.event._id)}`, { withCredentials: true });
      setPreviewApp(res.data.data);
    } catch {
      alert("Could not load card preview.");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-[#1e3a8a]" /></div>;
  if (error)   return <div className="text-center py-10 text-red-500 text-sm">{error}</div>;

  return (
    <>
      {/* Hidden card for PDF capture */}
      {pendingCard && (
        <div style={{ position: "fixed", left: "-5000px", top: 0, visibility: "visible", background: "white", all: "initial" }}>
          <VolunteerIdCard cardRef={cardRef} app={pendingCard} authUser={user} />
        </div>
      )}

      {/* Card preview modal */}
      {previewApp && (
        <CardModal
          app={previewApp}
          authUser={user}
          onClose={() => setPreviewApp(null)}
          onDownload={() => triggerDownload(String(previewApp.event._id), previewApp)}
          downloading={!!downloadingId}
        />
      )}

      {mode === "single" && data ? (
        // ── Single / detail view ──────────────────────────────────────────────
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/student/profile/volunteer-status")} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-black text-gray-900">Application Details</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {data.event?.image && <img src={imgUrl(data.event.image)} className="w-full h-48 object-cover" alt="event" />}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{data.event?.title}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Calendar size={15} />{new Date(data.event?.startDateTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                <div className="flex items-center gap-2"><MapPin size={15} />{data.event?.venue}</div>
              </div>
            </div>
          </div>

          {data.application?.status === "approved" && (
            <div className="bg-[#eff6ff] border border-[rgba(30,64,175,0.14)] rounded-2xl p-8 text-center">
              <BadgeCheck className="w-12 h-12 text-[#1e3a8a] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#1e3a8a] mb-4">Your Volunteer ID is ready</h3>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => openPreview(data)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-[rgba(30,64,175,0.2)] text-[#1e3a8a] font-semibold rounded-xl hover:bg-[#eff6ff] transition text-sm"
                >
                  <Eye size={16} /> View Card
                </button>
                <button
                  onClick={() => triggerDownload(String(data.event._id), data)}
                  disabled={!!downloadingId}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1e3a8a] text-white font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 transition text-sm"
                >
                  {downloadingId ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ── List view — applications table ────────────────────────────────────
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Volunteer Applications</h2>
              <p className="text-sm text-gray-500 mt-0.5">All your volunteer applications and their status</p>
            </div>
          </div>

          {!data?.length ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Info className="w-14 h-14 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-5 text-sm">You haven't applied to volunteer for any events.</p>
              <Link to="/events" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white text-sm rounded-xl font-medium shadow-md hover:brightness-110 transition">
                Browse Events <ExternalLink size={15} />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Event</span>
                <span>Date</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-gray-50">
                {data.map((app) => {
                  const isApproved    = app.application?.status === "approved";
                  const isDownloading = downloadingId === String(app.event._id);

                  return (
                    <div
                      key={app.event._id}
                      className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50/60 transition"
                    >
                      {/* Event + organizer */}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{app.event.title}</p>
                        <p className="text-xs text-gray-400 truncate">{app.event.organizer?.name}</p>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar size={12} className="text-gray-400 shrink-0" />
                        {new Date(app.event.startDateTime).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </div>

                      {/* Status */}
                      <div><StatusBadge status={app.application?.status} /></div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isApproved ? (
                          <>
                            <button
                              onClick={() => openPreview(app)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1e3a8a] bg-[#eff6ff] rounded-lg border border-[rgba(30,64,175,0.14)] hover:brightness-95 transition"
                            >
                              <Eye size={13} /> View Card
                            </button>
                            <button
                              onClick={() => triggerDownload(String(app.event._id))}
                              disabled={!!downloadingId}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1e3a8a] rounded-lg hover:brightness-110 disabled:opacity-50 transition"
                            >
                              {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                              {isDownloading ? "…" : "Download"}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}