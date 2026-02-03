// UpcomingElections.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config/api.config"; // update with your API URL

export default function UpcomingElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcomingElections = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/election/allElections`);
        const upcoming = res.data.data.filter((e) => e.status === "ANNOUNCED"); // filter only upcoming
        setElections(upcoming);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load upcoming elections");
        setLoading(false);
      }
    };

    fetchUpcomingElections();
  }, []);

  if (loading) return <p className="p-4 text-center">Loading upcoming elections...</p>;
  if (error) return <p className="p-4 text-center text-red-600">{error}</p>;
  if (elections.length === 0) return <p className="p-4 text-center text-gray-500">No upcoming elections</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Apply now for the following roles</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {elections.map((election) => (
          <div
            key={election._id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{election.title}</h2>
            <p className="text-gray-600 mb-4">Election starts on: {new Date(election.startDate).toLocaleDateString()}</p>
            <p className="text-gray-500 mb-4">Roles available: {election.roles?.join(", ") || "N/A"}</p>

            <button
              onClick={() => navigate(`/apply/${election._id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
