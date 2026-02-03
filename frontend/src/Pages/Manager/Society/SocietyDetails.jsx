import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";

function SocietyDetails() {
  const { societyId } = useParams();
  const navigate = useNavigate();

  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSociety = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/societies/${societyId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setSociety(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch society");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch society");
      } finally {
        setLoading(false);
      }
    };

    fetchSociety();
  }, [societyId]);

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading society details...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  if (!society) {
    return <p className="p-6 text-center text-gray-500">Society details not available.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Society Header */}
       <div className="flex flex-wrap gap-4 justify-center">
        
        <button
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md transition"
          onClick={() => navigate(-1)}
        >
          Back to Societies
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-xl shadow-md">
        <div className="w-full md:w-64 h-64 rounded-lg overflow-hidden shadow-sm">
          {society.image ? (
            <img
              src={`http://localhost:8000/uploads/${society.image}`}
              alt={society.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg">
              No Image
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold text-gray-800">{society.name}</h1>
          <p className="text-gray-600">{society.shortName}</p>
          <p className="text-gray-700">{society.description || "No description available."}</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-white font-medium ${society.status === "Active" ? "bg-green-500" : "bg-red-500"}`}>
              {society.status || "N/A"}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500 text-white font-medium">
              Members: {society.members?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Advisor & Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-md">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Advisor</h2>
          <p className="text-gray-700">{society.advisor || "Not Assigned"}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Contact Info</h2>
          <p className="text-gray-700">Email: {society.email || "N/A"}</p>
          <p className="text-gray-700">Phone: {society.phone || "N/A"}</p>
        </div>
      </div>

      {/* Roles Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Roles</h2>
        {society.roles && society.roles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {society.roles.map((role) => (
              <div
                key={role._id}
                className="border rounded-xl p-4 hover:shadow-lg transition cursor-default"
              >
                <p className="font-semibold text-gray-700">{role.name}</p>
                <p className={`mt-2 text-sm font-medium ${role.user ? "text-green-600" : "text-gray-400"}`}>
                  {role.user ? role.user.fullname : "Vacant"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No roles defined.</p>
        )}
      </div>

      {/* Members Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Members</h2>
        {society.members && society.members.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {society.members.map((member) => (
              <li
                key={member._id}
                className="p-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {member.fullname}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No members yet.</p>
        )}
      </div>

      {/* Join & Back Buttons */}
     
    </div>
  );
}

export default SocietyDetails;
