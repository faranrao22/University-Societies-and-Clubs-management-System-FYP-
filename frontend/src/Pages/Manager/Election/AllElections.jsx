import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import API_BASE_URL from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import { Loader2, RefreshCw, ArrowRight, CalendarClock, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MANAGER_CARD_CLASS =
  "group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#3699FF]/35 hover:shadow-md";

function formatDateTime(iso) {
  if (!iso) return "Not set";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Not set";
  return d.toLocaleString();
}

export default function AllElections() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/election/manager/list`, {
        withCredentials: true,
      });
      const list = res.data?.data || [];
      setElections(list);
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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#3699FF]" />
      </div>
    );
  }

  return (
    <div className="manager-page-shell">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="manager-page-header mb-0">
          <h1 className="manager-page-heading">All elections</h1>
          <p className="manager-page-subtitle">
            Elections for societies you manage. Click any card to open the full edit page.
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {elections.map((e) => {
            const societyName =
              typeof e.societyId === "object" && e.societyId?.name ? e.societyId.name : "—";
            return (
              <button
                key={e._id}
                type="button"
                onClick={() => navigate(`/manager/all-elections/${e._id}/edit`)}
                className={MANAGER_CARD_CLASS}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="line-clamp-2 text-sm font-bold text-[#111827]">{e.title || "Untitled election"}</p>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                    {(e.status || "DRAFT").replace(/_/g, " ")}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <p className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-[#3699FF]" />
                    <span className="font-semibold text-gray-700">Society:</span> {societyName}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CalendarClock size={14} className="text-[#3699FF]" />
                    <span className="font-semibold text-gray-700">Application deadline:</span>{" "}
                    {formatDateTime(e.applyDeadline)}
                  </p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3699FF]">
                  Edit election
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
