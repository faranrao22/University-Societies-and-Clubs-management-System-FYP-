import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import HotToast from "react-hot-toast";

export default function ElectionDraft() {
  const { user } = useAuth();

  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState(null);

  // single state for all form data
  const [formData, setFormData] = useState({
    title: "",
    selectedRoles: [],
    votingEligibility: "MEMBERS_ONLY",
    applicationEligibility: "MEMBERS_ONLY",
  });

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/societies/Mysocieties/${user._id}`,
          { withCredentials: true }
        );
        setSocieties(res.data.data);
        if (res.data.data.length) setSelectedSociety(res.data.data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSocieties();
  }, [user._id]);

  useEffect(() => {
    if (selectedSociety) {
      // reset roles when society changes
      setFormData((prev) => ({ ...prev, selectedRoles: [] }));
    }
  }, [selectedSociety]);

  const toggleRole = (roleName) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleName)
        ? prev.selectedRoles.filter((r) => r !== roleName)
        : [...prev.selectedRoles, roleName],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedRoles.length) return;

    try {
      await axios.post(
        `${API_BASE_URL}/election/create`,
        {
          societyId: selectedSociety._id,
          title: formData.title,
          roles: formData.selectedRoles,
          votingEligibility: formData.votingEligibility,
          applicationEligibility: formData.applicationEligibility,
          status: "DRAFT",
        },
        { withCredentials: true }
      );
      HotToast.success("Election saved as Draft!");
      setFormData({
        title: "",
        selectedRoles: [],
        votingEligibility: "MEMBERS_ONLY",
        applicationEligibility: "MEMBERS_ONLY",
      });
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message || // backend message
        err.message ||                 // fallback axios error
        "Something went wrong";        // final fallback

      HotToast.error(message);
    }
  };

  return (
    <div className="manager-page-shell font-sans text-gray-900">
      <div>
        {/* Header */}
        <div className="manager-page-header">
          <h1 className="manager-page-heading">Create Election Draft</h1>
          <p className="manager-page-subtitle">
            Start by creating a draft election. You can schedule applications and voting later.
          </p>
        </div>

        {/* Society Selector */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {societies.map((society) => (
            <button
              key={society._id}
              onClick={() => setSelectedSociety(society)}
              className={`px-5 py-2 text-sm font-semibold border rounded-lg transition
                ${selectedSociety?._id === society._id
                  ? "bg-[#3699FF] text-white border-[#3699FF] shadow-md"
                  : "bg-white text-[#4B5563] border-gray-300 hover:bg-gray-100"
                }`}
            >
              {society.name}
            </button>
          ))}
        </div>

        {!selectedSociety ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center text-[#4B5563]">
            Select a society to create a draft election
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Election Title
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#3699FF]/30 rounded-lg"
                  required
                />
              </div>

              {/* Roles */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Target Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {(selectedSociety?.roles || []).map((role) => (
                    <button
                      key={role.name}
                      type="button"
                      onClick={() => toggleRole(role.name)}
                      className={`px-3 py-1.5 text-xs font-bold border rounded-lg transition
                        ${formData.selectedRoles.includes(role.name)
                          ? "bg-[#3699FF] text-white border-[#3699FF]"
                          : "bg-white text-[#4B5563] border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voting Eligibility */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Voting Eligibility
                </label>
                <select
                  name="votingEligibility"
                  value={formData.votingEligibility}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#3699FF]/30"
                >
                  <option value="MEMBERS_ONLY">Registered Members Only</option>
                  <option value="ANYONE">Open to All Students</option>
                </select>
              </div>

              {/* Application Eligibility */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Application Eligibility
                </label>
                <select
                  name="applicationEligibility"
                  value={formData.applicationEligibility}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#3699FF]/30"
                >
                  <option value="MEMBERS_ONLY">Registered Members Only</option>
                  <option value="ANYONE">Open to All Students</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!formData.selectedRoles.length}
                className="w-full bg-[#3699FF] hover:brightness-110 text-white py-3 font-bold rounded-lg shadow-md transition disabled:opacity-40"
              >
                Save Draft
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
