import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react"

function AdminMembers() {
  const [managers, setManagers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState(null);

  // When clicking trash icon:
  <button
    onClick={() => {
      setSelectedManagerId(m._id);
      setDeleteModal(true);
    }}
    className="flex items-center justify-center p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
  >
    <Trash2 size={18} />
  </button>

  const navigate = useNavigate();

  const fetchManagers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/users`);
      const allUsers = res.data.users || [];
      const onlyManagers = allUsers.filter(u => u.role === "manager");
      setManagers(onlyManagers);
    } catch (error) {
      console.log(error);
      setManagers([]);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/delete/${id}`);
      fetchManagers();
      toast.success("Manager deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete manager!");
      console.log(error);
    }
  };

  const handleEdit = (manager) => {
    navigate("/admin/memberForm", { state: { manager } });
  };

  return (
    <div className="p-5 h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Managers</h2>
        <button
          onClick={() => navigate("/admin/memberForm")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
        >
          <Plus size={20} />
          Add Manager
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4 text-gray-700 font-medium">Full Name</th>
              <th className="text-left p-4 text-gray-700 font-medium">Email</th>
              <th className="text-left p-4 text-gray-700 font-medium">Department</th>
              <th className="text-center p-4 text-gray-700 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {managers.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No managers found
                </td>
              </tr>
            ) : (
              managers.map((m, idx) => (
                <tr
                  key={m._id}
                  className={`border-b transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                >
                  <td className="p-4 text-gray-800 font-medium">{m.fullname}</td>
                  <td className="p-4 text-gray-700">{m.email}</td>
                  <td className="p-4 text-gray-700">{m.Department}</td>
                  <td className="p-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(m)}
                      className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedManagerId(m._id);
                        setDeleteModal(true);
                      }}
                      className="flex items-center justify-center p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`fixed inset-0 z-50 flex justify-center items-center ${deleteModal ? "block" : "hidden"} bg-black/50`}>
        <div className="bg-white rounded-2xl w-96 p-6 shadow-xl text-center">
          {/* Warning Icon */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="text-red-600" size={36} />
            <h3 className="text-xl font-semibold text-gray-800">
              Delete Manager
            </h3>
          </div>




          {/* Message */}
          <p className="text-gray-600 mb-6 border-b pb-4">
            Are you sure you want to delete this manager? This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setDeleteModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleDelete(selectedManagerId);
                setDeleteModal(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <AlertTriangle size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminMembers;
