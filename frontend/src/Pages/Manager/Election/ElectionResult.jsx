import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
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
        rolesAssigned: res.data.rolesAssigned, // get rolesAssigned from backend
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
        alert("Roles assigned successfully!");
        // Refresh results and update rolesAssigned
        fetchResults(selectedElection);
      } else {
        alert("Failed to assign roles: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning roles: " + err.message);
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
    <div className="min-h-screen p-6">
      <div>
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6 text-[#3699FF]">
          Election Results
        </h1>

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

        {/* Assign Roles Button */}
        {selectedElection?.status === "COMPLETED" &&
          !selectedElection.rolesAssigned && (
            <button
              onClick={handleAssignRoles}
              className="mb-6 px-4 py-2 cursor-pointer bg-[#3699FF] text-white rounded-lg shadow-md hover:brightness-110"
            >
              UPDATE WINNER
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

            {/* Results */}
            {Object.keys(results).length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-[#4B5563] text-center">
                Loading results...
              </div>
            ) : (
              Object.entries(results).map(([role, candidates]) => {
                const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
                const totalVotes = sorted.reduce((sum, c) => sum + c.votes, 0);

                return (
                  <div key={role} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-[#3699FF] mb-4 flex items-center gap-2">
                      <User size={18} />
                      {role}
                    </h3>

                    <div className="space-y-4">
                      {sorted.map((c, index) => {
                        const isWinner = index === 0 && c.votes > 0;
                        const pct =
                          totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0;

                        return (
                          <div key={c.candidateId} className="border border-gray-200 p-4 rounded-lg bg-slate-100/60">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">#{index + 1}</span>
                                {isWinner && <Trophy size={16} className="text-yellow-500" />}
                                <span className="font-medium text-gray-900">{c.fullname}</span>
                              </div>

                              <div className="text-right">
                                <p className="font-bold text-gray-900">{c.votes}</p>
                                <p className="text-xs text-gray-500">{pct}%</p>
                              </div>
                            </div>

                            <div className="w-full bg-gray-200 h-2 rounded mt-2">
                              <div
                                className="bg-gradient-to-r from-[#3699FF] to-[#60a5fa] h-2 rounded"
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            {isWinner && (
                              <p className="text-xs mt-2 font-semibold text-[#3699FF]">
                                {selectedElection.status === "COMPLETED" ? "ELECTED" : "LEADING"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
