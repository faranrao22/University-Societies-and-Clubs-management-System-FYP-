import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config/api.config";

function ManagerForm({ onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const managerToEdit = location.state?.manager;

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    Department: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (managerToEdit) {
      setFormData({
        fullname: managerToEdit.fullname || "",
        email: managerToEdit.email || "",
        password: "", // leave blank for security
        Department: managerToEdit.Department || "",
      });
    }
  }, [managerToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (managerToEdit) {
        // Update existing manager
        await axios.put(`${API_BASE_URL}/auth/update/${managerToEdit._id}`, formData);
        toast.success("Manager updated successfully!");
      } else {
        // Create new manager
        await axios.post(`${API_BASE_URL}/auth/signup`, { ...formData, role: "manager" });
        toast.success("Manager created successfully!");
      }

      navigate("/admin/Allmembers"); // go back to list
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl min-h-screen mx-auto pt-8 pb-20 px-4">
      {/* Top Navigation */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-10">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          {managerToEdit ? "Edit Manager" : "Add New Manager"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                className="p-3 border rounded-lg focus:ring-2 focus:ring-black/20 outline-none"
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="p-3 border rounded-lg focus:ring-2 focus:ring-black/20 outline-none"
                placeholder="Enter email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-black/20 outline-none"
                placeholder={managerToEdit ? "Leave blank to keep current password" : "Enter password"}
                required={!managerToEdit}
              />
            </div>

            {/* Department */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Department</label>
              <input
                type="text"
                name="Department"
                value={formData.Department}
                onChange={handleChange}
                required
                className="p-3 border rounded-lg focus:ring-2 focus:ring-black/20 outline-none"
                placeholder="Enter department"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium shadow-md"
            >
              {loading ? (managerToEdit ? "Updating..." : "Saving...") : managerToEdit ? "Update Manager" : "Save Manager"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManagerForm;
