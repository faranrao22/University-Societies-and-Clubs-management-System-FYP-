import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../../../config/api.config";

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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {election?.title || "Election Voting"}
        </h1>

        {/* ROLES */}
        <div className="space-y-10">
          {roles.map((role) => (
            <div key={role}>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">
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
                      className={`cursor-pointer rounded-xl border bg-white hover:shadow-md transition ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-100"
                          : "border-gray-200"
                      }`}
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
                        <h3 className="font-semibold">{c.name}</h3>
                        <p className="text-sm text-gray-500">
                          {c.position || role}
                        </p>

                        {isSelected && (
                          <p className="text-sm text-indigo-600 mt-2">
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
        <button
          onClick={handleVoteSubmit}
          disabled={submitting}
          className="w-full mt-10 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700"
        >
          {submitting ? "Submitting Vote..." : "Submit Vote"}
        </button>

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