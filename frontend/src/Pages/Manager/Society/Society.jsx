import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";

function Society() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [societies, setSocieties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);

  useEffect(() => {
    if (user) fetchSocieties();
  }, [user]);

  const fetchSocieties = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/societies/Mysocieties/${user._id}`,
        { withCredentials: true }
      );
      const list = res.data?.data || [];
      setSocieties(list.filter((s) => s.status === "Active"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (society) => {
    setSelectedSociety(society);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/societies/delete/${selectedSociety._id}`,
        { withCredentials: true }
      );
      setShowDeleteModal(false);
      setSelectedSociety(null);
      fetchSocieties();
    } catch (err) {
      console.error(err);
      alert("Failed to delete society.");
    }
  };

  const filteredSocieties = societies.filter((society) => {
    const matchesSearch =
      society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      society.president?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#3699FF] tracking-tight">Societies & Clubs</h1>
          <p className="mt-1 text-sm text-gray-500">Active societies only. Pending societies appear under Society status.</p>
        </div>
        <Link to="/manager/societyform">
          <button className="bg-[#3699FF] text-white px-5 py-2.5 font-medium tracking-wide rounded-lg shadow-md hover:brightness-110 transition">
            Add New
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white border border-gray-200 p-4 mb-6 rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="Search by Society or President"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-xl border-b-2 border-gray-300 focus:border-[#3699FF] focus:outline-none px-2 py-1 bg-transparent"
        />
      </div>

      {/* Society Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {filteredSocieties.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No active societies found.
          </p>
        )}
        {filteredSocieties.map((society) => (
          <div
            key={society._id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1"
          >
            <div className="w-full h-32 overflow-hidden mb-4">
              {society.image ? (
                <img
                  src={uploadFileUrl(society.image)}
                  alt={society.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[#4B5563]">
                  No Image
                </div>
              )}
            </div>
            <div className="px-4 pb-4">
              <h3 className="text-lg font-semibold text-gray-800">{society.name}</h3>
              <p className="text-gray-600 text-sm mb-1">
                {society.description?.substring(0, 80) || "No description available."}
              </p>
              <p className="text-gray-500 text-xs mb-1">
                President: {society.roles?.find(r => r.name === "President")?.user?.fullname || "N/A"}
              </p>
              <p className="text-gray-500 text-xs">Members: {society.members?.length || 0}</p>
              <button
                onClick={() => navigate(`/manager/societyDetails/${society._id}`)}
                className="mt-2 w-full bg-[#3699FF] text-white text-sm font-medium py-2.5 rounded-lg hover:brightness-110 transition shadow-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Society Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full text-left divide-y divide-gray-100">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-gray-700 font-semibold">#</th>
              <th className="px-6 py-3 text-gray-700 font-semibold">Name</th>
              <th className="px-6 py-3 text-gray-700 font-semibold">President</th>
              <th className="px-6 py-3 text-gray-700 font-semibold">Members</th>
              <th className="px-6 py-3 text-right text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSocieties.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No active societies found.
                </td>
              </tr>
            ) : (
              filteredSocieties.map((society, idx) => (
                <tr key={society._id} className="hover:bg-gray-100 transition">
                  <td className="px-6 py-4 text-gray-700">{idx + 1}</td>
                  <td className="px-6 py-4 text-gray-900">{society.name}</td>
                  <td className="px-6 py-4 text-gray-700">{society.roles?.find(r => r.name === "President")?.user?.fullname || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-700">{society.members?.length || 0}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <Link to={`/manager/societyform/${society._id}/edit`}>
                      <FaEdit size={18} className="text-[#3699FF] hover:text-[#2B8ACF] transition cursor-pointer" />
                    </Link>
                    <RiDeleteBinLine
                      size={18}
                      className="text-red-600 hover:text-red-800 transition cursor-pointer"
                      onClick={() => handleDeleteClick(society)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

     {/* Delete Modal */}
{showDeleteModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <div className="bg-white rounded-xl p-6 w-80 shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          />
        </svg>
        <h2 className="text-lg font-bold text-red-700">Warning!</h2>
      </div>
      <p className="mb-6 text-gray-700">
        Are you sure you want to <span className="font-semibold text-red-600">delete</span> this society/club? This action <span className="font-semibold">cannot be undone</span>.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 border border-gray-400 text-gray-700 hover:bg-gray-100 transition rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelete}
          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition rounded"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Society;
