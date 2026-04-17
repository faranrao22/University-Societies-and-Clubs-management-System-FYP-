import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function SocietyStatus() {
  const { user } = useAuth();
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/societies/Mysocieties/${user._id}`,
          { withCredentials: true }
        );
        if (!cancelled) setSocieties(res.data?.data || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setSocieties([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#3699FF]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Society status</h1>
        <p className="mt-1 text-sm text-gray-500">
          Read-only overview of societies you manage. New societies are created
          inactive until activated.
        </p>
      </div>

      {societies.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          No societies found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Short name
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Join policy
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Department
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    President
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Members</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {societies.map((s) => {
                  const president =
                    s.roles?.find((r) => r.name === "President")?.user?.fullname ||
                    "—";
                  const created = s.createdAt
                    ? new Date(s.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";
                  return (
                    <tr key={s._id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.shortName || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            s.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {s.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.joinPolicy?.replace(/_/g, " ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.department || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{president}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {Array.isArray(s.members) ? s.members.length : 0}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{created}</td>
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
