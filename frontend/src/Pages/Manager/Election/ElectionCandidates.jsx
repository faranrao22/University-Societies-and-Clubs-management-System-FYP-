import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronRight,
  ChevronDown,
  Mail,
  Info,
} from "lucide-react";

function ElectionApplications() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedElection, setExpandedElection] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/election/my-election-applications`,
        { withCredentials: true }
      );
      setElections(res.data.data || []);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg = String(err?.response?.data?.message || "").toLowerCase();
      const isEmptyState =
        status === 404 ||
        msg.includes("no election") ||
        msg.includes("no applications") ||
        msg.includes("not found");
      if (isEmptyState) {
        setElections([]);
      } else {
        toast.error("Failed to fetch election applications");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const updateStatus = async (
    electionId,
    candidateId,
    action,
    reason = ""
  ) => {
    try {
      await axios.put(
        `${API_BASE_URL}/election/${electionId}/candidate/${candidateId}/review`,
        { action, rejectionReason: reason },
        { withCredentials: true }
      );
      toast.success(
        action === "approve"
          ? "Candidate approved"
          : "Candidate rejected"
      );
      fetchElections();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleReject = (electionId, candidateId) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return;
    updateStatus(electionId, candidateId, "reject", reason || "");
  };

  const finalizeElection = async (electionId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/election/finalized-candidates/${electionId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Election finalized successfully");
      fetchElections();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Failed to finalize election"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#4B5563]">
        Loading...
      </div>
    );
  }

  return (
    <div className="manager-page-shell">
      <div>
        <div className="manager-page-header">
          <h1 className="manager-page-heading">Candidate Applications</h1>
          <p className="manager-page-subtitle">
            Review, approve, and finalize election candidates.
          </p>
        </div>

        {elections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-[#4B5563]">
            <Info size={30} className="mx-auto mb-3 text-gray-300" />
            No applications found
          </div>
        ) : (
          <div className="space-y-5">
            {elections.map((election) => {
              const filteredCandidates =
                election.candidates.filter((c) => {
                  if (filterStatus === "all") return true;
                  return (
                    c.applicationStatus === filterStatus
                  );
                });

              const isExpanded =
                expandedElection === election.electionId;
              const counts = election.candidates.reduce(
                (acc, c) => {
                  const key = String(c.applicationStatus || "pending").toLowerCase();
                  if (key in acc) acc[key] += 1;
                  return acc;
                },
                { approved: 0, pending: 0, rejected: 0 }
              );

              return (
                <div
                  key={election.electionId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-100 transition text-left"
                    onClick={() =>
                      setExpandedElection(
                        isExpanded
                          ? null
                          : election.electionId
                      )
                    }
                  >
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-[#3699FF]">
                        {election.electionTitle}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-[#4B5563] border border-gray-200">
                          {election.society}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 border border-blue-100">
                          {election.electionStatus}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 border border-emerald-100">
                          Approved {counts.approved}
                        </span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 border border-amber-100">
                          Pending {counts.pending}
                        </span>
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 border border-rose-100">
                          Rejected {counts.rejected}
                        </span>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronDown
                        size={20}
                        className="text-gray-500"
                      />
                    ) : (
                      <ChevronRight
                        size={20}
                        className="text-gray-400"
                      />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {[
                            "all",
                            "approved",
                            "pending",
                            "rejected",
                          ].map((status) => {
                            const isActive =
                              filterStatus === status;

                            return (
                              <button
                                key={status}
                                onClick={() =>
                                  setFilterStatus(status)
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize
                                  ${
                                    isActive
                                      ? "bg-[#3699FF] text-white shadow-sm"
                                      : "bg-slate-100 text-[#4B5563] border border-gray-200 hover:bg-gray-100"
                                  }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() =>
                            finalizeElection(
                              election.electionId
                            )
                          }
                          disabled={
                            election.electionStatus !==
                            "APPLICATIONS_CLOSED"
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-semibold
                            ${
                              election.electionStatus ===
                              "APPLICATIONS_CLOSED"
                                ? "bg-[#3699FF] text-white hover:brightness-110 shadow-sm"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                          Finalize Candidates
                        </button>
                      </div>

                      <div className="mb-4 text-xs text-gray-500">
                        Open each candidate profile for full documents before final decision.
                      </div>

                      {filteredCandidates.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                          No candidates found for this filter.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                          <table className="w-full text-sm">
                            <thead className="border-b border-gray-200 bg-slate-100">
                              <tr className="text-[#4B5563]">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                                  Candidate
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                                  Contact
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                                  Position
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredCandidates.map((c) => (
                                <tr
                                  key={c.candidateId}
                                  className="hover:bg-gray-100"
                                >
                                  <td className="px-4 py-3 font-semibold text-gray-900">
                                    {c.fullname}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500">
                                    <div className="inline-flex items-center gap-1.5">
                                      <Mail size={14} />
                                      <span>{c.email}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">
                                    {c.role}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize border ${
                                        c.applicationStatus === "approved"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                          : c.applicationStatus === "rejected"
                                          ? "bg-rose-50 text-rose-700 border-rose-100"
                                          : "bg-amber-50 text-amber-700 border-amber-100"
                                      }`}
                                    >
                                      {c.applicationStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2 flex-wrap">
                                      <button
                                        onClick={() =>
                                          navigate(
                                            `/manager/reviewCandidate/${election.electionId}/${c.candidateId}`
                                          )
                                        }
                                        className="px-3 py-1.5 bg-[#3699FF] text-white rounded-lg text-xs font-semibold hover:brightness-110"
                                      >
                                        View
                                      </button>

                                      {c.applicationStatus !==
                                        "approved" && (
                                        <button
                                          onClick={() =>
                                            updateStatus(
                                              election.electionId,
                                              c.candidateId,
                                              "approve"
                                            )
                                          }
                                          className="px-3 py-1.5 bg-[#ECFDF5] text-[#14532D] rounded-lg text-xs font-semibold border border-emerald-200 hover:brightness-95"
                                        >
                                          Approve
                                        </button>
                                      )}

                                      {c.applicationStatus !==
                                        "rejected" && (
                                        <button
                                          onClick={() =>
                                            handleReject(
                                              election.electionId,
                                              c.candidateId
                                            )
                                          }
                                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50"
                                        >
                                          Reject
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ElectionApplications;
