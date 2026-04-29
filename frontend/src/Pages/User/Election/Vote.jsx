import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../../../config/api.config";

const COLORS = {
  primary: "#1e3a8a",
  accent: "#38bdf8",
  bg: "#e2e8f0",
  surface: "#FFFFFF",
  text: "#111827",
  textMuted: "#4B5563",
  border: "rgba(30, 64, 175, 0.2)",
  borderLight: "rgba(30, 64, 175, 0.1)",
};

export default function VotePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [candidatesByRole, setCandidatesByRole] = useState({});
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchVotingData();
  }, []);

  const fetchVotingData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/election/${id}/candidates-for-voting`,
        { withCredentials: true }
      );

      setCandidatesByRole(res.data.data || {});
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load candidates"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    const roles = Object.keys(selectedVotes);

    if (roles.length === 0) {
      toast.error("Please select at least one candidate");
      return;
    }

    try {
      setSubmitting(true);

      for (const role of roles) {
        await axios.post(
          `${API_BASE_URL}/election/castVote/${id}`,
          {
            role,
            candidateId: selectedVotes[role],
          },
          { withCredentials: true }
        );
      }

      setSuccess(true); // show modal
    } catch (err) {
      toast.error(err.response?.data?.message || "Voting failed");
    } finally {
      setSubmitting(false);
    }
  };

  const roles = Object.keys(candidatesByRole || {});
  const selectedCount = Object.keys(selectedVotes).length;

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <header className="mb-8">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-md px-3 py-1.5"
            style={{ backgroundColor: "rgba(29, 78, 216, 0.12)" }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: COLORS.primary }}
            >
              Voting Portal
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold" style={{ color: COLORS.text }}>
            {election?.title || "Election Voting"}
          </h1>
          <p className="text-sm" style={{ color: COLORS.textMuted }}>
            Select one candidate for each role and submit your vote.
          </p>
        </header>

        {/* ROLES */}
        <div className="space-y-10">
          {!loading && roles.length === 0 ? (
            <div
              className="rounded-xl border p-8 text-center"
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
            >
              <h3 className="mb-2 text-base font-semibold" style={{ color: COLORS.text }}>
                No candidates available right now
              </h3>
              <p className="text-sm" style={{ color: COLORS.textMuted }}>
                Please check back later.
              </p>
            </div>
          ) : null}

          {roles.map((role) => (
            <div key={role}>
              <h2
                className="text-lg font-semibold mb-4 border-b pb-2"
                style={{ borderBottomColor: COLORS.borderLight, color: COLORS.text }}
              >
                {role}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {candidatesByRole[role]?.map((c) => {
                  const isSelected =
                    selectedVotes[role] === c.candidateId;

                  return (
                    <div
                      key={c.candidateId}
                      onClick={() =>
                        setSelectedVotes((prev) => ({
                          ...prev,
                          [role]: c.candidateId,
                        }))
                      }
                      className={`cursor-pointer rounded-xl border hover:shadow-md transition ${
                        isSelected
                          ? "ring-2 ring-blue-100"
                          : ""
                      }`}
                      style={{
                        backgroundColor: COLORS.surface,
                        borderColor: isSelected ? COLORS.primary : COLORS.border,
                      }}
                    >
                      {/* IMAGE */}
                      <div className="h-44 w-full overflow-hidden rounded-t-xl bg-gray-100">
                        <img
                          src={`${API_BASE_URL.replace("/api", "")}/uploads/${c.image}`}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* INFO */}
                      <div className="p-4">
                        <h3 className="font-semibold" style={{ color: COLORS.text }}>{c.name}</h3>
                        <p className="text-sm" style={{ color: COLORS.textMuted }}>
                          {c.position || role}
                        </p>

                        {isSelected && (
                          <p className="text-sm mt-2" style={{ color: COLORS.primary }}>
                            ✔ Selected
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <div className="mt-8 rounded-xl border px-4 py-4" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>
              {selectedCount} role{selectedCount === 1 ? "" : "s"} selected
            </p>
            <button
              onClick={handleVoteSubmit}
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: COLORS.primary }}
            >
              {submitting ? "Submitting..." : "Submit Vote"}
            </button>
          </div>
        </div>

      </div>

      {/* 🔥 SUCCESS MODAL */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-[90%] max-w-md">

            <h2 className="text-2xl font-bold text-green-600 mb-2">
              🎉 Vote Submitted
            </h2>

            <p className="text-gray-600 mb-6">
              Your vote has been successfully recorded.
            </p>

            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}