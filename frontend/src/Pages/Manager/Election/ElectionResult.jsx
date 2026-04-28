import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import {
  User,
  Trophy,
  Radio,
  CheckCircle2,
  Hash,
  RefreshCcw,
} from "lucide-react";
import API_BASE_URL from "../../../config/api.config";

const socket = io(API_BASE_URL.replace("/api", ""));

export default function ElectionResultsPage() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ---------------- Fetch Elections ---------------- */
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/election/allElections`);
        const filtered = (res.data.data || []).filter((e) =>
          ["VOTING_LIVE", "COMPLETED"].includes(e.status)
        );
        setElections(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();

    return () => {
      socket.off("liveResultsUpdate");
      socket.disconnect();
    };
  }, []);

  /* ---------------- Fetch Results ---------------- */
  const fetchResults = useCallback(async (election) => {
    if (!election) return;

    setIsRefreshing(true);
    setResults({});
    socket.off("liveResultsUpdate");

    try {
      let res;

      if (election.status === "VOTING_LIVE") {
        socket.emit("joinElection", election._id);

        socket.on("liveResultsUpdate", (data) => {
          setResults(data.results || {});
        });

        res = await axios.get(`${API_BASE_URL}/election/liveResults/${election._id}`);
      } else {
        res = await axios.get(`${API_BASE_URL}/election/finalResults/${election._id}`);
      }

      setSelectedElection((prev) => ({
        ...prev,
        societyName: res.data.societyName,
        rolesAssigned: Boolean(res.data.rolesAssigned),
        officialWinners: Array.isArray(res.data.officialWinners) ? res.data.officialWinners : [],
      }));

      setResults(res.data.results || {});
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleSelectElection = (e) => {
    const electionId = e.target.value;
    if (!electionId) return;

    const election = elections.find((el) => el._id === electionId);
    setSelectedElection(election);
    fetchResults(election);
  };

  const handleRefresh = () => {
    if (selectedElection) fetchResults(selectedElection);
  };

  /* ---------------- Assign Roles ---------------- */
  const handleAssignRoles = async () => {
    if (!selectedElection || selectedElection.status !== "COMPLETED") return;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/election/updateRole/${selectedElection._id}`
      );

      if (res.data.success) {
        toast.success("Winners announced successfully");
        // Refresh results and update rolesAssigned
        fetchResults(selectedElection);
      } else {
        toast.error("Failed to announce winners: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error announcing winners: " + err.message);
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-[#4B5563]">
        Loading...
      </div>
    );

  return (
    <div className="manager-page-shell">
      <div>
        {/* Header */}
        <div className="manager-page-header">
          <h1 className="manager-page-heading">Election Results</h1>
          <p className="manager-page-subtitle">
            Review full vote counts for every candidate and announce official winners.
          </p>
        </div>

        {/* Dropdown */}
        <div className="mb-6 flex gap-3">
          <select
            onChange={handleSelectElection}
            defaultValue=""
            className="w-full border border-gray-200 px-4 py-2 rounded-lg bg-white"
          >
            <option value="" disabled>
              Select Election
            </option>
            {elections.map((e) => (
              <option key={e._id} value={e._id}>
                {e.status === "COMPLETED" ? "FINAL - " : "LIVE - "}
                {e.title}
              </option>
            ))}
          </select>

          {selectedElection?.status === "VOTING_LIVE" && (
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#3699FF] text-white rounded-lg shadow-sm hover:brightness-110 flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          )}
        </div>

        {/* Announce Winners Button */}
        {selectedElection?.status === "COMPLETED" && (
          <button
            onClick={handleAssignRoles}
            disabled={Boolean(selectedElection.rolesAssigned)}
            className="mb-6 rounded-lg bg-[#3699FF] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {selectedElection.rolesAssigned ? "Winner Announced" : "Announce Winner"}
          </button>
        )}

        {/* No Selection */}
        {!selectedElection && (
          <div className="text-center py-10 text-[#4B5563] bg-white rounded-xl shadow-sm border border-gray-200">
            <Hash size={30} className="mx-auto mb-3 text-gray-300" />
            Select an election to view results.
          </div>
        )}

        {/* Selected Election */}
        {selectedElection && (
          <div className="space-y-6">
            {/* Election Info Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg text-[#3699FF]">
                    {selectedElection.title}
                  </h2>

                  {selectedElection.societyName && (
                    <p className="text-sm text-gray-500">
                      Society: {selectedElection.societyName}
                    </p>
                  )}

                  <p className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    {selectedElection.status === "VOTING_LIVE"
                      ? "Live Voting"
                      : "Completed"}
                  </p>
                </div>

                {selectedElection.status === "VOTING_LIVE" ? (
                  <Radio size={24} className="text-[#3699FF]" />
                ) : (
                  <CheckCircle2 size={24} className="text-[#3699FF]" />
                )}
              </div>
            </div>

            {/* Manager view: always show all candidates with vote counts */}
            {Object.keys(results).length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-[#4B5563] text-center">
                Loading results...
              </div>
            ) : (
              Object.entries(results).map(([role, candidates]) => {
                const list = Array.isArray(candidates) ? candidates : [];
                const sorted = [...list].sort((a, b) => {
                  const vb = Number(b.votes) || 0;
                  const va = Number(a.votes) || 0;
                  if (vb !== va) return vb - va;
                  return (a.candidateId || "").localeCompare(b.candidateId || "", undefined, { sensitivity: "base" });
                });
                const totalVotes = sorted.reduce((sum, c) => sum + (Number(c.votes) || 0), 0);
                const officialWinner = (selectedElection.officialWinners || []).find((w) => w.role === role);
                const officialWinnerId = officialWinner?.candidateId ? String(officialWinner.candidateId) : null;
                const leadingId = sorted[0]?.candidateId ? String(sorted[0].candidateId) : null;

                return (
                  <div key={role} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-[#3699FF] mb-4 flex items-center gap-2">
                      <User size={18} />
                      {role}
                    </h3>

                    {sorted.length === 0 ? (
                      <p className="text-sm text-gray-500">No votes cast for this role yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {sorted.map((candidate) => {
                          const votes = Number(candidate.votes) || 0;
                          const pct = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0.0";
                          const cid = String(candidate.candidateId || "");
                          const isOfficialWinner = officialWinnerId && cid === officialWinnerId;
                          const isLeading = !officialWinnerId && leadingId && cid === leadingId;
                          return (
                            <div
                              key={cid || candidate.fullname}
                              className="rounded-lg border border-gray-200 bg-slate-100/60 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  {(isOfficialWinner || isLeading) && (
                                    <Trophy size={16} className="text-yellow-500" />
                                  )}
                                  <span className="font-medium text-gray-900">{candidate.fullname}</span>
                                  {isOfficialWinner && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                                      Winner
                                    </span>
                                  )}
                                  {isLeading && !isOfficialWinner && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                                      Leading
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">{votes}</p>
                                  <p className="text-xs text-gray-500">{pct}%</p>
                                </div>
                              </div>
                              <div className="mt-2 h-2 w-full rounded bg-gray-200">
                                <div
                                  className="h-2 rounded bg-gradient-to-r from-[#3699FF] to-[#60a5fa]"
                                  style={{ width: `${Math.max(0, Math.min(100, Number(pct)))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
