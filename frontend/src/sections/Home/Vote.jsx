import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config/api.config";

export default function VoteElectionsPage() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/election/allElections`);
        // show only LIVE elections
        const liveElections = res.data.data.filter(
          (e) => e.status === "LIVE"
        );
        setElections(liveElections);
        setLoading(false);
      } catch (err) {
        setError("Failed to load elections");
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Available Elections</h1>

      {elections.length === 0 ? (
        <p className="text-gray-500">No live elections available</p>
      ) : (
        elections.map((election, index) => (
          <div
            key={election._id}
            className="border p-4 mb-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {index + 1}. {election.title}
              </p>
              <p className="text-sm text-gray-500">
                Status: {election.status}
              </p>
            </div>

            <button
              onClick={() =>
                navigate(`/castVote/${election._id}`)
              }
              className="bg-green-600 text-white px-4 py-2"
            >
              Vote
            </button>
          </div>
        ))
      )}
    </div>
  );
}
