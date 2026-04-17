import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { FiArrowLeft, FiUser, FiMail, FiUsers, FiStar } from "react-icons/fi";

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
        setError("Failed to fetch society");
      } finally {
        setLoading(false);
      }
    };

    fetchSociety();
  }, [societyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#3699FF] rounded-full animate-spin"></div>
          <span className="text-[#4B5563] text-sm font-bold uppercase tracking-widest">
            Loading Society
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500 font-semibold">{error}</div>;
  }

  if (!society) {
    return (
      <div className="p-6 text-center text-gray-500 font-medium">
        Society details not available.
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white text-[#3699FF] px-4 py-2 rounded-xl shadow border border-gray-200 hover:shadow-md font-bold text-sm transition"
          >
            <FiArrowLeft /> Back to Societies
          </button>
        </div>

        {/* Society Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-2xl shadow-md border border-gray-200">
          <div className="w-full md:w-64 h-64 rounded-xl overflow-hidden shadow-inner">
            {society.image ? (
              <img
                src={`${API_BASE_URL.replace("/api", "")}/uploads/${society.image}`}
                alt={society.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                No Image
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-[#3699FF]">{society.name}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest">{society.shortName}</p>
            <p className="text-gray-700">{society.description || "No description available."}</p>

            <div className="flex flex-wrap gap-3 mt-2">
              <span
                className={`px-3 py-1 rounded-full font-semibold text-white ${
                  society.status === "Active" ? "bg-[#3699FF]" : "bg-rose-500"
                }`}
              >
                {society.status || "N/A"}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#3699FF] text-white font-semibold">
                Members: {society.members?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Advisor & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-[#3699FF] mb-2 flex items-center gap-2">
              <FiStar /> Advisor
            </h2>
            <p className="text-gray-700">{society.advisor || "Not Assigned"}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#3699FF] mb-2 flex items-center gap-2">
              <FiMail /> Contact Info
            </h2>
            <p className="text-gray-700">Email: {society.email || "N/A"}</p>
            <p className="text-gray-700">Phone: {society.phone || "N/A"}</p>
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-[#3699FF] mb-4 flex items-center gap-2">
            <FiUser /> Roles
          </h2>

          {society.roles && society.roles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {society.roles.map((role) => (
                <div
                  key={role._id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition flex flex-col items-center text-center"
                >
                  {/* User Picture */}
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
                    {role.user?.image ? (
                      <img
                        src={`${API_BASE_URL.replace("/api", "")}/uploads/${role.user.image}`}
                        alt={role.user.fullname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Role Name */}
                  <p className="font-semibold text-gray-700">{role.name}</p>

                  {/* User Details */}
                  {role.user ? (
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Fullname: {role.user.fullname}</p>
                      <p>Email: {role.user.email}</p>
                      <p>Department: {role.user.Department}</p>
                      <p>Semester: {role.user.semester}</p>
                      <p>Roll No: {role.user.rollNo}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 mt-2">Vacant</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No roles defined.</p>
          )}
        </div>

        {/* Members */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-[#3699FF] mb-4 flex items-center gap-2">
            <FiUsers /> Members
          </h2>
          {society.members && society.members.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {society.members.map((member) => (
                <li
                  key={member._id}
                  className="p-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 transition flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                    {member.image ? (
                      <img
                        src={`${API_BASE_URL.replace("/api", "")}/uploads/${member.image}`}
                        alt={member.fullname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                        No Image
                      </div>
                    )}
                  </div>
                  <p className="font-semibold">{member.fullname}</p>
                  <p className="text-sm text-gray-500">{member.Department || "N/A"}</p>
                  <p className="text-sm text-gray-500">{member.semester || "N/A"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No members yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocietyDetails;
