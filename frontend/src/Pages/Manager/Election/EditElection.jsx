import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import API_BASE_URL from "../../../config/api.config";

const STATUS_OPTIONS = [
  "DRAFT",
  "APPLICATIONS_OPEN",
  "APPLICATIONS_CLOSED",
  "CANDIDATES_FINALIZED",
  "VOTING_SCHEDULED",
  "VOTING_LIVE",
  "COMPLETED",
];
const ELIGIBILITY_OPTIONS = ["MEMBERS_ONLY", "ANYONE"];

function formatDeadlineLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function eligibilityLabel(v) {
  return v === "MEMBERS_ONLY" ? "Members only" : "Anyone";
}

export default function EditElection() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [election, setElection] = useState(null);
  const [societyRoleOptions, setSocietyRoleOptions] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [form, setForm] = useState({
    title: "",
    roles: [],
    status: "DRAFT",
    applyDeadline: "",
    startDate: "",
    endDate: "",
    votingEligibility: "MEMBERS_ONLY",
    applicationEligibility: "MEMBERS_ONLY",
  });

  const loadElection = useCallback(async () => {
    if (!electionId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/election/manager/list`, {
        withCredentials: true,
      });
      const list = res.data?.data || [];
      const selected = list.find((item) => item._id === electionId);
      if (!selected) {
        toast.error("Election not found");
        navigate("/manager/all-elections");
        return;
      }
      setElection(selected);
      const roleOptions =
        typeof selected?.societyId === "object" && Array.isArray(selected.societyId?.roles)
          ? selected.societyId.roles.map((r) => r?.name).filter(Boolean)
          : [];
      setSocietyRoleOptions(roleOptions);
      setForm({
        title: selected.title || "",
        roles: Array.isArray(selected.roles) ? selected.roles : [],
        status: selected.status || "DRAFT",
        applyDeadline: formatDeadlineLocal(selected.applyDeadline),
        startDate: formatDeadlineLocal(selected.startDate),
        endDate: formatDeadlineLocal(selected.endDate),
        votingEligibility: selected.votingEligibility || "MEMBERS_ONLY",
        applicationEligibility: selected.applicationEligibility || "MEMBERS_ONLY",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load election");
    } finally {
      setLoading(false);
    }
  }, [electionId, navigate]);

  useEffect(() => {
    loadElection();
  }, [loadElection]);

  const societyName = useMemo(() => {
    if (!election) return "—";
    if (typeof election.societyId === "object" && election.societyId?.name) {
      return election.societyId.name;
    }
    return "—";
  }, [election]);

  const updateField = (field, value) => {
    setForm((prev) =>
      field === "status" && value === "DRAFT"
        ? { ...prev, status: value, applyDeadline: "", startDate: "", endDate: "" }
        : field === "applyDeadline"
        ? { ...prev, applyDeadline: value, startDate: "", endDate: "" }
        : { ...prev, [field]: value }
    );
  };

  const handleSave = async () => {
    if (!electionId) return;
    if (!form.roles.length) {
      toast.error("Select at least one election role");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title,
        roles: form.roles,
        status: form.status,
        applyDeadline: form.applyDeadline ? form.applyDeadline : null,
        startDate: form.startDate ? form.startDate : null,
        endDate: form.endDate ? form.endDate : null,
        votingEligibility: form.votingEligibility,
        applicationEligibility: form.applicationEligibility,
      };
      const res = await axios.patch(
        `${API_BASE_URL}/election/manager/${electionId}`,
        body,
        { withCredentials: true }
      );
      const updated = res.data?.data;
      if (updated) {
        setElection(updated);
        const roleOptions =
          typeof updated?.societyId === "object" && Array.isArray(updated.societyId?.roles)
            ? updated.societyId.roles.map((r) => r?.name).filter(Boolean)
            : [];
        setSocietyRoleOptions(roleOptions);
        setForm({
          title: updated.title || "",
          roles: Array.isArray(updated.roles) ? updated.roles : [],
          status: updated.status,
          applyDeadline: formatDeadlineLocal(updated.applyDeadline),
          startDate: formatDeadlineLocal(updated.startDate),
          endDate: formatDeadlineLocal(updated.endDate),
          votingEligibility: updated.votingEligibility || "MEMBERS_ONLY",
          applicationEligibility: updated.applicationEligibility || "MEMBERS_ONLY",
        });
      }
      toast.success("Election updated");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#3699FF]" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
        Election not found.
      </div>
    );
  }

  const addRole = (roleName) => {
    const next = String(roleName || "").trim();
    if (!next) return;
    if (form.roles.some((r) => r.toLowerCase() === next.toLowerCase())) return;
    setForm((prev) => ({ ...prev, roles: [...prev.roles, next] }));
    setRoleInput("");
  };

  const removeRole = (roleName) => {
    setForm((prev) => ({ ...prev, roles: prev.roles.filter((r) => r !== roleName) }));
  };

  return (
    <div className="manager-page-shell max-w-3xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="manager-page-header mb-0">
          <h1 className="manager-page-heading">Edit election</h1>
          <p className="manager-page-subtitle">
            Update title, roles, status, application deadline, voting dates, and eligibilities.
          </p>
        </div>
        <Link
          to="/manager/all-elections"
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Society
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-800">{societyName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(ev) => updateField("title", ev.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </label>
              <select
                value={form.status}
                onChange={(ev) => updateField("status", ev.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Application deadline
              </label>
              <input
                type="datetime-local"
                value={form.applyDeadline}
                onChange={(ev) => updateField("applyDeadline", ev.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
              />
            </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Election roles
            </label>
            {societyRoleOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {societyRoleOptions.map((role) => {
                  const selected = form.roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        selected
                          ? removeRole(role)
                          : addRole(role)
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                        selected
                          ? "border-[#3699FF] bg-[#3699FF] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-[#3699FF]/40"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roleInput}
                  onChange={(ev) => setRoleInput(ev.target.value)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") {
                      ev.preventDefault();
                      addRole(roleInput);
                    }
                  }}
                  placeholder="Type role and press Enter"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
                />
                <button
                  type="button"
                  onClick={() => addRole(roleInput)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
            )}
            {form.roles.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-slate-50 px-2 py-1 text-xs font-medium text-gray-700"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => removeRole(role)}
                      className="text-[#3699FF] hover:text-red-600"
                      aria-label={`Remove ${role}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-red-600">Select at least one role.</p>
            )}
          </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Voting start
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(ev) => updateField("startDate", ev.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Voting end
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(ev) => updateField("endDate", ev.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Application eligibility
              </label>
              <select
                value={form.applicationEligibility}
                onChange={(ev) => updateField("applicationEligibility", ev.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
              >
                {ELIGIBILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {eligibilityLabel(opt)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Voting eligibility
              </label>
              <select
                value={form.votingEligibility}
                onChange={(ev) => updateField("votingEligibility", ev.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
              >
                {ELIGIBILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {eligibilityLabel(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3699FF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={15} />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
