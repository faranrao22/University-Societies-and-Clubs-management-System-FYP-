import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Users,
  Mail,
  Award,
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
      alert("Failed to fetch elections");
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
      fetchElections();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleReject = (electionId, candidateId) => {
    const reason = prompt("Enter rejection reason (optional):");
    updateStatus(electionId, candidateId, "reject", reason || "");
  };

  const finalizeElection = async (electionId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/election/finalized-candidates/${electionId}`,
        {},
        { withCredentials: true }
      );
      alert("Election finalized successfully");
      fetchElections();
    } catch (err) {
      console.error(err);
      alert(
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
    <div className="min-h-screen p-6">
      <div >

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-[#3699FF]">
          Candidate Applications
        </h1>

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

              return (
                <div
                  key={election.electionId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Header */}
                  <button
                    className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-100 transition"
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
                      <p className="text-sm text-gray-500">
                        {election.society} •{" "}
                        {election.electionStatus}
                      </p>
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

                  {/* Content */}
                  {isExpanded && (
                    <div className="p-6 border-t border-gray-200">

                      {/* Finalize Button */}
                      <div className="flex justify-end mb-4">
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
                          className={`px-4 py-2 rounded-lg text-sm font-medium
                            ${
                              election.electionStatus ===
                              "APPLICATIONS_CLOSED"
                                ? "bg-[#3699FF] text-white hover:brightness-110 shadow-md"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                          Finalize Candidates
                        </button>
                      </div>

                      {/* Filter */}
                      <div className="flex gap-2 mb-4">
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
                              className={`px-3 py-1 rounded-lg text-xs font-medium
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

                      {/* Table */}
                      {filteredCandidates.length === 0 ? (
                        <div className="py-6 text-center text-gray-400">
                          No candidates found
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-gray-200 bg-slate-100">
                              <tr className="text-[#4B5563]">
                                <th className="px-4 py-3 text-left">
                                  Candidate
                                </th>
                                <th className="px-4 py-3 text-left">
                                  Contact
                                </th>
                                <th className="px-4 py-3 text-left">
                                  Position
                                </th>
                                <th className="px-4 py-3 text-left">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-right">
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
                                  <td className="px-4 py-3 font-medium text-[#3699FF]">
                                    {c.fullname}
                                  </td>
                                  <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                                    <Mail size={14} />
                                    {c.email}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600">
                                    {c.role}
                                  </td>
                                  <td className="px-4 py-3 capitalize text-gray-600">
                                    {c.applicationStatus}
                                  </td>
                                  <td className="px-4 py-3 text-right flex justify-end gap-2 flex-wrap">
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/manager/reviewCandidate/${election.electionId}/${c.candidateId}`
                                        )
                                      }
                                      className="px-3 py-1 bg-[#3699FF] text-white rounded-lg text-xs hover:brightness-110"
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
                                        className="px-3 py-1 bg-[#ECFDF5] text-[#14532D] rounded-lg text-xs border border-emerald-200 hover:brightness-95"
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
                                        className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50"
                                      >
                                        Reject
                                      </button>
                                    )}
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
