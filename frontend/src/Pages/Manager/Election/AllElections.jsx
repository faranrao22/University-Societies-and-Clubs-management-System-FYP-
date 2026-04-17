import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import { Loader2, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = [
  "DRAFT",
  "APPLICATIONS_OPEN",
  "APPLICATIONS_CLOSED",
  "CANDIDATES_FINALIZED",
  "VOTING_SCHEDULED",
  "VOTING_LIVE",
  "COMPLETED",
];

function formatDeadlineLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AllElections() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/election/manager/list`, {
        withCredentials: true,
      });
      const list = res.data?.data || [];
      setElections(list);
      const next = {};
      list.forEach((e) => {
        next[e._id] = {
          status: e.status,
          applyDeadline: formatDeadlineLocal(e.applyDeadline),
        };
      });
      setDrafts(next);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load elections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?._id) load();
  }, [user?._id, load]);

  const updateDraft = (id, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (electionId) => {
    const d = drafts[electionId];
    if (!d) return;
    setSavingId(electionId);
    try {
      const body = {
        status: d.status,
        applyDeadline: d.applyDeadline ? d.applyDeadline : null,
      };
      const res = await axios.patch(
        `${API_BASE_URL}/election/manager/${electionId}`,
        body,
        { withCredentials: true }
      );
      const updated = res.data?.data;
      if (updated) {
        setElections((prev) =>
          prev.map((e) => (e._id === electionId ? updated : e))
        );
        setDrafts((prev) => ({
          ...prev,
          [electionId]: {
            status: updated.status,
            applyDeadline: formatDeadlineLocal(updated.applyDeadline),
          },
        }));
      }
      toast.success("Election updated");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#3699FF]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">All elections</h1>
          <p className="mt-1 text-sm text-gray-500">
            Elections for societies you manage. Update status and application
            deadline.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {elections.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          No elections found for your societies.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Society
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Application deadline
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {elections.map((e) => {
                  const id = e._id;
                  const societyName =
                    typeof e.societyId === "object" && e.societyId?.name
                      ? e.societyId.name
                      : "—";
                  const d = drafts[id] || {
                    status: e.status,
                    applyDeadline: formatDeadlineLocal(e.applyDeadline),
                  };
                  return (
                    <tr key={id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {e.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{societyName}</td>
                      <td className="px-4 py-3">
                        <select
                          value={d.status}
                          onChange={(ev) =>
                            updateDraft(id, "status", ev.target.value)
                          }
                          className="w-full min-w-[10rem] max-w-xs rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="datetime-local"
                          value={d.applyDeadline}
                          onChange={(ev) =>
                            updateDraft(id, "applyDeadline", ev.target.value)
                          }
                          className="w-full min-w-[11rem] max-w-xs rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/25"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={savingId === id}
                          onClick={() => handleSave(id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#3699FF] px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:brightness-105 disabled:opacity-60"
                        >
                          {savingId === id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
