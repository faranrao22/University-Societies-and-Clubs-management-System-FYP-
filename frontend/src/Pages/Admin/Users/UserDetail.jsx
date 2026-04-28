import React, { useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, User, Mail, Building2, Vote } from "lucide-react";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import toast from "react-hot-toast";
import { adminUi as a } from "../components/adminUi";
import { fetchAdminUser } from "../api/adminApi";
import { adminKeys } from "../api/adminQueryKeys";

function DetailItem({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function SimpleSection({ title, icon: Icon, items, emptyText, renderItem }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <section className={a.panel}>
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {Icon ? <Icon size={16} className="text-slate-500" strokeWidth={1.75} /> : null}
        {title}
      </h2>
      {list.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm text-slate-800">
          {list.map((item, idx) => (
            <li key={idx}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
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
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(data?.profile?.fullname || "user").replace(/[^\w\s-]/g, "")}-profile-report.pdf`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("PDF download failed");
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  const p = data.profile || {};
  const role = String(p.role || "").toLowerCase();
  const profileImgSrc = uploadFileUrl(p.profileImage);
  const sessionValue = p.sessionStart && p.sessionEnd ? `${p.sessionStart} - ${p.sessionEnd}` : p.session;

  const societiesMemberOf = data.societiesMemberOf || [];
  const societiesCreated = data.societiesCreated || [];
  const roleAssignments = data.societyRoles || [];
  const electionWins = (data.electionWins || []).flatMap((block) =>
    (block.wins || []).map((w) => ({
      electionId: block.election?._id,
      electionTitle: block.election?.title,
      role: w.role,
    }))
  );

  const profileFields = [
    { label: "Department", value: p.Department },
    { label: "Roll Number", value: p.rollNo },
    { label: "Semester", value: p.semester },
    { label: "Session", value: sessionValue },
  ];

  return (
    <div className={a.pageDetail}>
      <button type="button" onClick={() => navigate("/admin/users")} className={a.backLink}>
        <ArrowLeft size={18} />
        Back to all users
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          {profileImgSrc ? (
            <img
              src={profileImgSrc}
              alt=""
              className="h-24 w-24 rounded-xl border border-slate-200 bg-slate-50 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
              <User size={40} strokeWidth={1.25} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className={a.h1}>{p.fullname}</h1>
            {p.email ? (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} />
                {p.email}
              </p>
            ) : null}
          </div>
        </div>

        <button type="button" onClick={downloadPdf} className={a.btnPrimary}>
          <Download size={18} />
          Download PDF
        </button>
      </div>

      <section className={a.panel}>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Basic information</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {profileFields.map((field) => (
            <DetailItem key={field.label} label={field.label} value={field.value} />
          ))}
        </div>
      </section>

      {/* Role-wise details (only render sections that have data) */}
      {role === "manager" && societiesCreated.length > 0 ? (
        <SimpleSection
          title="Societies created"
          icon={Building2}
          items={societiesCreated}
          emptyText=""
          renderItem={(s) => (
            <Link to={`/admin/societies/${s._id}`} className="font-medium text-slate-700 hover:underline">
              {s.name}
            </Link>
          )}
        />
      ) : null}

      {role === "user" && societiesMemberOf.length > 0 ? (
        <SimpleSection
          title="Societies joined"
          icon={Building2}
          items={societiesMemberOf}
          emptyText=""
          renderItem={(s) => (
            <Link to={`/admin/societies/${s._id}`} className="font-medium text-slate-700 hover:underline">
              {s.name}
            </Link>
          )}
        />
      ) : null}

      {electionWins.length > 0 ? (
        <SimpleSection
          title="Election wins"
          icon={Vote}
          items={electionWins}
          emptyText=""
          renderItem={(win) => (
            <>
              <Link to={`/admin/elections/${win.electionId}`} className="font-medium text-slate-700 hover:underline">
                {win.electionTitle || "Election"}
              </Link>
              <span className="text-slate-500"> - {win.role}</span>
            </>
          )}
        />
      ) : null}
    </div>
  );
}
