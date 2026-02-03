import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import HotToast from "react-hot-toast";

function ElectionResult() {
  const { electionId } = useParams();

  const [results, setResults] = useState({});
  const [election, setElection] = useState(null); // store election info including status
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

const updateRole = async () => {
  if (!results || !election) {
    HotToast.error("No results found");
    return;
  }

  try {
    const res = await axios.put(`${API_BASE_URL}/election/updateRole/${electionId}`, {
      withCredentials: true,
    });

    if (res.data.success) {
      HotToast.success("Roles Updated Successfully");
      // Update election state to reflect roles are assigned
      setElection(prev => ({ ...prev, rolesAssigned: true }));
    } else {
      HotToast.error(res.data.message || "Failed to update roles");
    }
  } catch (error) {
    console.error(error);
    // Some servers may return error.response.data
    const msg = error.response?.data?.message || "Failed to update roles";
    HotToast.error(msg);
  }
};


  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/election/result/${electionId}`, {
        withCredentials: true,
      })
      .then((res) => {
        if (!res.data.success) {
          setMessage(res.data.message);
          setResults({});
          setElection(null);
        } else {
          setResults(res.data.data); // vote counts by role
          setElection({ status: res.data.election?.status || "UNKNOWN" }); // store status
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("Failed to load election results");
      })
      .finally(() => setLoading(false));
  }, [electionId]);

  if (loading) {
    return <p className="p-6">Loading results...</p>;
  }

  if (message) {
    return (
      <div className="p-6 bg-yellow-100 border border-yellow-400 rounded">
        <h2 className="text-lg font-semibold text-yellow-800">
          Results Not Available
        </h2>
        <p className="mt-2 text-yellow-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Election Results</h2>

      {Object.keys(results).length === 0 ? (
        <p>No results found</p>
      ) : (
        Object.entries(results).map(([role, candidates]) => (
          <div
            key={role}
            className="mb-8 border rounded shadow-sm overflow-hidden"
          >
            {/* Role Title */}
            <div className="bg-gray-100 px-4 py-2 font-semibold text-lg">
              {role}
            </div>

            {/* Candidates Table */}
            <table className="w-full border-t">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-2 text-left">Candidate</th>
                  <th className="border px-4 py-2 text-center">Votes</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.candidateId}>
                    <td className="border px-4 py-2">{c.name}</td>
                    <td className="border px-4 py-2 text-center font-semibold">
                      {c.votes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <div>
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
            election?.status === "COMPLETED"
              ? ""
              : "opacity-50 cursor-not-allowed"
          }`}
          onClick={election?.status === "COMPLETED" ? updateRole : undefined}
          disabled={election?.status !== "COMPLETED"}
        >
          Update Role
        </button>
      </div>
    </div>
  );
}

export default ElectionResult;
