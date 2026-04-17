import React, { useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  User,
  Building2,
  CalendarDays,
  Vote,
  Mail,
  GraduationCap,
  ImageIcon,
  ClipboardList,
} from "lucide-react";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import toast from "react-hot-toast";
import { adminUi as a } from "../components/adminUi";
import { fetchAdminUser } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";

function fmt(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
}

function Section({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`${a.panel} ${className}`}>
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {Icon && <Icon size={16} className="text-slate-500" strokeWidth={1.75} />}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const {
    data,
    isPending: loading,
    isError,
  } = useQuery({
    queryKey: adminKeys.user(userId),
    queryFn: () => fetchAdminUser(userId),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      toast.error("Could not load user");
      navigate("/admin/users");
    }
  }, [isError, navigate]);

  const downloadPdf = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users/${userId}/pdf`, {
        withCredentials: true,
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data?.profile?.fullname || "user").replace(/[^\w\s-]/g, "")}-profile-report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("PDF download failed");
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading profile…
      </div>
    );
  }

  const p = data.profile;
  const profileImgSrc = uploadFileUrl(p.profileImage);
  const cardFrontSrc = uploadFileUrl(p.studentCardFront);
  const cardBackSrc = uploadFileUrl(p.studentCardBack);

  return (
    <div className={a.pageDetail}>
      <button type="button" onClick={() => navigate("/admin/users")} className={a.backLink}>
        <ArrowLeft size={18} />
        Back to all users
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          {profileImgSrc ? (
            <div className="shrink-0">
              <img
                src={profileImgSrc}
                alt=""
                className="h-24 w-24 rounded-xl border border-slate-200 object-cover bg-slate-50"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
              <User size={40} strokeWidth={1.25} />
            </div>
          )}
          <div className="min-w-0">
          <h1 className={a.h1}>{p.fullname}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <Mail size={14} />
            {p.email}
          </p>
          <p className="mt-1 text-xs capitalize text-slate-500">
            Role: <span className="font-medium text-slate-800">{p.role}</span>
          </p>
          </div>
        </div>
        <button type="button" onClick={downloadPdf} className={a.btnPrimary}>
          <Download size={18} />
          Download full report (PDF)
        </button>
      </div>

      <Section title="Account and academic" icon={User}>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500">Department</dt>
            <dd className="text-slate-900">{p.Department || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Roll number</dt>
            <dd className="font-mono text-slate-900">{p.rollNo || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Semester</dt>
            <dd className="text-slate-900">{p.semester || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Session</dt>
            <dd className="text-slate-900">{p.session || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Graduated</dt>
            <dd className="text-slate-900">{p.isGraduated ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Joined / updated</dt>
            <dd className="text-slate-900">
              {fmt(p.createdAt)} · {fmt(p.updatedAt)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500">
              <ImageIcon size={14} />
              Student ID card
            </p>
            <div className="flex flex-wrap gap-4">
              {cardFrontSrc ? (
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500">Front</p>
                  <a href={cardFrontSrc} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={cardFrontSrc}
                      alt="Student card front"
                      className="max-h-48 max-w-[min(100%,280px)] rounded-lg border border-slate-200 object-contain bg-slate-50"
                    />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No front card on file.</p>
              )}
              {cardBackSrc ? (
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500">Back</p>
                  <a href={cardBackSrc} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={cardBackSrc}
                      alt="Student card back"
                      className="max-h-48 max-w-[min(100%,280px)] rounded-lg border border-slate-200 object-contain bg-slate-50"
                    />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No back card on file.</p>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Societies joined (member)" icon={Building2}>
        {data.societiesMemberOf?.length ? (
          <ul className="space-y-3 text-sm">
            {data.societiesMemberOf.map((s) => (
              <li
                key={s._id}
                className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <span className="text-xs font-medium text-amber-800">{s.status}</span>
                </div>
                <p className="text-xs text-slate-600">
                  Creator: {s.Creator?.fullname || "—"} · Dept: {s.department || "—"}
                </p>
                <Link
                  to={`/admin/societies/${s._id}`}
                  className="mt-2 inline-block text-xs font-medium text-slate-700 hover:underline"
                >
                  Society admin page →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Not a member of any society.</p>
        )}
      </Section>

      <Section title="Societies created (as manager)" icon={Building2}>
        {data.societiesCreated?.length ? (
          <ul className="space-y-2 text-sm">
            {data.societiesCreated.map((s) => (
              <li key={s._id}>
                <Link
                  to={`/admin/societies/${s._id}`}
                  className="font-medium text-slate-700 hover:underline"
                >
                  {s.name}
                </Link>
                <span className="text-slate-500"> · {s.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">None.</p>
        )}
      </Section>

      <Section title="Official roles in societies" icon={GraduationCap}>
        {data.societyRoles?.length ? (
          <ul className="space-y-2 text-sm text-slate-800">
            {data.societyRoles.map((row, i) => (
              <li key={`${row.society._id}-${row.roleName}-${i}`}>
                <span className="font-medium">{row.roleName}</span> at{" "}
                <Link
                  to={`/admin/societies/${row.society._id}`}
                  className="text-slate-700 hover:underline"
                >
                  {row.society.name}
                </Link>
                <span className="text-slate-500"> ({row.society.status})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No role assignments.</p>
        )}
      </Section>

      <Section title="Join requests submitted" icon={ClipboardList}>
        {data.joinRequestHistory?.length ? (
          <ul className="space-y-4 text-sm">
            {data.joinRequestHistory.map((row, i) => (
              <li
                key={`${row.society._id}-${i}`}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
              >
                <p className="font-medium text-slate-900">{row.society.name}</p>
                <p className="text-xs text-slate-500">
                  Request: <span className="font-semibold text-slate-700">{row.requestStatus}</span> ·{" "}
                  {fmt(row.requestedAt)}
                </p>
                <p className="mt-2 text-xs text-slate-700">{row.reason || "—"}</p>
                <p className="mt-1 text-xs text-slate-600">
                  Skills: {row.skills || "—"} · Experience: {row.experience || "—"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No join requests on file.</p>
        )}
      </Section>

      <Section title="Events created" icon={CalendarDays}>
        {data.eventsCreated?.length ? (
          <ul className="space-y-2 text-sm">
            {data.eventsCreated.map((ev) => (
              <li key={ev._id}>
                <Link
                  to={`/admin/events/${ev._id}`}
                  className="font-medium text-slate-700 hover:underline"
                >
                  {ev.title}
                </Link>
                <span className="text-slate-500">
                  {" "}
                  · {ev.status} · {ev.organizer?.name || "Society"} · {fmt(ev.startDateTime)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">None.</p>
        )}
      </Section>

      <Section title="Event volunteer applications" icon={CalendarDays}>
        {data.volunteerParticipation?.length ? (
          <ul className="space-y-4 text-sm">
            {data.volunteerParticipation.map((row) => (
              <li
                key={row.event._id}
                className="rounded-xl border border-slate-100 p-4"
              >
                <Link
                  to={`/admin/events/${row.event._id}`}
                  className="font-medium text-slate-700 hover:underline"
                >
                  {row.event.title}
                </Link>
                <p className="text-xs text-slate-600">
                  Status: {row.application?.status || "—"} · {fmt(row.event.startDateTime)}
                </p>
                {row.application && (
                  <p className="mt-2 text-xs text-slate-700">{row.application.motivation || "—"}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">None.</p>
        )}
      </Section>

      <Section title="Elections — candidacies" icon={Vote}>
        {data.electionApplications?.some((b) => b.candidacies?.length) ? (
          <ul className="space-y-4 text-sm">
            {data.electionApplications.map((block) =>
              (block.candidacies || []).map((c, j) => (
                <li
                  key={`${block.election._id}-${j}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <p className="font-medium text-slate-900">{block.election.title}</p>
                  <p className="text-xs text-slate-600">
                    {block.election.societyId?.name || "Society"} · Role: {c.role} · Candidate:{" "}
                    <span className="font-semibold">{c.status}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-700">CNIC: {c.cnic}</p>
                  {c.reason && <p className="mt-1 text-xs text-slate-600">{c.reason}</p>}
                  <Link
                    to={`/admin/elections/${block.election._id}`}
                    className="mt-2 inline-block text-xs font-medium text-slate-700 hover:underline"
                  >
                    Election details →
                  </Link>
                </li>
              ))
            )}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No candidacies.</p>
        )}
      </Section>

      <Section title="Elections — votes cast" icon={Vote}>
        {data.votesCast?.some((b) => b.votes?.length) ? (
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm text-slate-800">
            {data.votesCast.map((block) =>
              (block.votes || []).map((v, j) => (
                <li key={`${block.election._id}-v-${j}`}>
                  <span className="text-slate-500">{block.election.title}</span> · Role {v.role} ·
                  For {v.candidate?.fullname || "—"}
                </li>
              ))
            )}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No votes recorded.</p>
        )}
      </Section>

      <Section title="Election wins" icon={Vote}>
        {data.electionWins?.some((b) => b.wins?.length) ? (
          <ul className="text-sm text-slate-800">
            {data.electionWins.map((block) =>
              (block.wins || []).map((w, j) => (
                <li key={`${block.election._id}-w-${j}`}>
                  {block.election.title} — <span className="font-medium">{w.role}</span>
                </li>
              ))
            )}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">None.</p>
        )}
      </Section>
    </div>
  );
}
