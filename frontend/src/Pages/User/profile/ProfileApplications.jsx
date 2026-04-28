import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import API_BASE_URL from "../../../config/api.config";
import { FileText, Loader2, AlertCircle, Trash2, Hourglass, CheckCircle, XCircle, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Member: "bg-blue-50 text-[#1e3a8a] border-blue-200",
  "Not Applied": "bg-gray-50 text-gray-600 border-gray-200",
};

const STATUS_ICONS = {
  Pending: Hourglass,
  Approved: CheckCircle,
  Rejected: XCircle,
  Member: UserCheck,
  "Not Applied": FileText,
};

export default function ProfileApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawingSocietyId, setWithdrawingSocietyId] = useState(null);

  useEffect(() => {
    if (user === undefined) return;
    if (!user?._id) {
      if (user === null) setError("Please log in to view your applications.");
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE_URL}/memberShip/my-applications`, {
          withCredentials: true,
        });

        if (res.data?.success) {
          setApplications(res.data.data || []);
        } else {
          setError(res.data?.message || "Failed to load applications");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const handleWithdraw = async (societyId, societyName) => {
    if (!window.confirm(`Withdraw your application to "${societyName}"?`)) return;

    try {
      setWithdrawingSocietyId(societyId);
      const res = await axios.delete(`${API_BASE_URL}/societies/${societyId}/withdraw-application`, {
        withCredentials: true,
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed to withdraw application");
        return;
      }

      setApplications((prev) => prev.filter((app) => app.society?._id !== societyId));
      toast.success("Application withdrawn");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error withdrawing application");
    } finally {
      setWithdrawingSocietyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#1e3a8a]" />
        <p className="text-sm text-gray-500">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 py-12 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
        <p className="mb-2 font-medium text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-red-700 underline hover:text-red-900"
        >
          Retry
        </button>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
        <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-lg font-bold text-gray-900">No Applications Yet</h3>
        <p className="mx-auto mb-6 max-w-sm text-gray-500">
          You have not applied to any societies yet.
        </p>
        <a
          href="/societies"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-5 py-2.5 font-medium text-white shadow-sm transition hover:brightness-110"
        >
          Browse Societies
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Society Applications</h2>
        <p className="mt-1 text-sm text-gray-500">
          View your application status and withdraw pending requests.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Society
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Application Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {applications.map((app) => {
                const { society, application, membershipStatus, displayStatus } = app;
                const resolvedStatus =
                  displayStatus ||
                  application?.status ||
                  (membershipStatus?.isMember ? "Member" : "Not Applied");
                const StatusIcon = STATUS_ICONS[resolvedStatus] || FileText;
                const canWithdraw = Boolean(application?.canWithdraw) && resolvedStatus !== "Approved";
                const isWithdrawing = withdrawingSocietyId === society?._id;
                return (
                  <tr key={society?._id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {society?.name || "Society"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[resolvedStatus] || STATUS_STYLES["Not Applied"]}`}
                      >
                        <StatusIcon size={12} />
                        {resolvedStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canWithdraw ? (
                        <button
                          type="button"
                          onClick={() => handleWithdraw(society._id, society.name)}
                          disabled={isWithdrawing}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isWithdrawing ? (
                            <>
                              <Loader2 size={14} className="animate-spin" /> Withdrawing...
                            </>
                          ) : (
                            <>
                              <Trash2 size={14} /> Withdraw
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
