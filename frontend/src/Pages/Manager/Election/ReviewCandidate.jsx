import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { toast } from "react-hot-toast";
import { FiArrowLeft, FiCheck, FiX, FiShield } from "react-icons/fi";

function ReviewCandidate() {
  const { electionId, candidateId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [activeAction, setActiveAction] = useState(null);

  const fetchCandidate = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/election/reviewCandidate/${candidateId}`,
        { withCredentials: true }
      );
      setCandidate(res.data.data);
    } catch (err) {
      toast.error("Failed to load candidate data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const handleSelectAction = (action) => {
    if (action === "approve") {
      handleAction("approve");
      return;
    }
    setActiveAction(action);
    setReason("");
  };

  const handleAction = async (action) => {
    try {
      if ((action === "reject" || action === "dispute") && reason.trim() === "") {
        return toast.error("Please enter a reason");
      }

      setActionLoading(true);

      let statusValue = "";
      if (action === "approve") statusValue = "approved";
      else if (action === "reject") statusValue = "rejected";
      else if (action === "dispute") statusValue = "inDispute";

      await axios.patch(
        `${API_BASE_URL}/election/update-application/${electionId}/${candidateId}`,
        {
          status: statusValue,
          reason: reason.trim(),
        },
        { withCredentials: true }
      );

      toast.success(`Candidate marked as ${statusValue}`);
      setReason("");
      setActiveAction(null);
      fetchCandidate();
    } catch (err) {
      toast.error("Could not update candidate status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#4B5563]">
        Loading candidate details...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#4B5563]">
        Candidate not found.
      </div>
    );
  }

  const { fullname, email, image, cnic, status } = candidate;
  const imageUrl = image
    ? `${API_BASE_URL.replace("/api", "")}/uploads/${image}`
    : "https://via.placeholder.com/800x800?text=No+Image";

  const statusClasses =
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "rejected"
      ? "bg-rose-50 text-rose-700 border-rose-100"
      : status === "inDispute"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="manager-page-shell">
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#3699FF]"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="manager-page-header">
          <h1 className="manager-page-heading">Review Candidate</h1>
          <p className="manager-page-subtitle">
            Review the candidate profile and update application status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="aspect-square bg-slate-100">
              <img
                src={imageUrl}
                alt={fullname}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x800?text=No+Image";
                }}
              />
            </div>
            <div className="space-y-2 p-5">
              <h2 className="text-lg font-semibold text-gray-900">{fullname}</h2>
              <p className="text-sm text-gray-500">{email}</p>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                {status === "inDispute" ? "In Dispute" : status}
              </span>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-[#3699FF]">Candidate Details</h2>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    <DetailRow label="Full Name" value={fullname} />
                    <DetailRow label="Email" value={email} />
                    <DetailRow label="CNIC" value={cnic || "—"} />
                    <DetailRow label="Current Status" value={status === "inDispute" ? "In Dispute" : status} />
                  </tbody>
                </table>
              </div>
            </div>

            {status === "pending" && (
              <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#3699FF]">Review Application</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelectAction("approve")}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#3699FF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
                  >
                    <FiCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleSelectAction("reject")}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <FiX /> Reject
                  </button>
                  <button
                    onClick={() => handleSelectAction("dispute")}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                  >
                    <FiShield /> Dispute
                  </button>
                </div>

                {(activeAction === "reject" || activeAction === "dispute") && (
                  <div className="space-y-3">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`Enter reason for ${activeAction}...`}
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3699FF]/30"
                    />
                    <button
                      onClick={() => handleAction(activeAction)}
                      disabled={actionLoading || reason.trim() === ""}
                      className="rounded-lg bg-[#3699FF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
                    >
                      Submit {activeAction === "dispute" ? "dispute" : "rejection"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const DetailRow = ({ label, value }) => (
  <tr>
    <td className="w-40 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </td>
    <td className="px-4 py-3 text-sm font-medium text-gray-900">{value}</td>
  </tr>
);

export default ReviewCandidate;