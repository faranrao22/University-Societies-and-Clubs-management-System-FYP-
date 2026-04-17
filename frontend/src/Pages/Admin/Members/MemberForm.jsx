import React, { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../../config/api.config";
import AdminPageHeader from "../components/AdminPageHeader";
import { adminKeys } from "../api/adminQueryKeys";
import { adminUi as a } from "../components/adminUi";

// 1. Same centralized list as SignupForm
const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Arts & Design",
  "Social Sciences",
  "Mathematics",
  "Physics"
];

function ManagerForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const managerToEdit = location.state?.manager;

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    Department: "",
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (managerToEdit) {
        await axios.put(`${API_BASE_URL}/auth/update/${managerToEdit._id}`, formData, {
          withCredentials: true,
        });
        return "updated";
      }
      await axios.post(
        `${API_BASE_URL}/auth/signup`,
        { ...formData, role: "manager" },
        { withCredentials: true }
      );
      return "created";
    },
    onSuccess: (mode) => {
      toast.success(mode === "updated" ? "Manager updated successfully!" : "Manager created successfully!");
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
      if (managerToEdit?._id) {
        queryClient.invalidateQueries({ queryKey: adminKeys.user(managerToEdit._id) });
      }
      navigate("/admin/managers");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Operation failed"),
  });

  useEffect(() => {
    if (managerToEdit) {
      setFormData({
        fullname: managerToEdit.fullname || "",
        email: managerToEdit.email || "",
        password: "", 
        Department: managerToEdit.Department || "",
      });
    }
  }, [managerToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMut.mutate();
  };

  return (
    <div className={a.pageForm}>
      <button type="button" onClick={() => navigate(-1)} className={a.backLink}>
        <ArrowLeft size={18} />
        Back
      </button>

      <AdminPageHeader
        eyebrow={false}
        title={managerToEdit ? "Edit manager" : "Add manager"}
        description="Create or update a manager account. Password is required only when adding a new manager."
      />

      <div className={`${a.cardPadded} sm:p-8`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <div>
              <label className={a.label}>Full name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                className={a.input}
                placeholder="Full name"
              />
            </div>

            <div>
              <label className={a.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={a.input}
                placeholder="Email"
              />
            </div>

            <div>
              <label className={a.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={a.input}
                placeholder={managerToEdit ? "Leave blank to keep current" : "Password"}
                required={!managerToEdit}
              />
            </div>

            <div>
              <label className={a.label}>Department</label>
              <div className="relative">
                <select
                  name="Department"
                  value={formData.Department}
                  onChange={handleChange}
                  required
                  className={`${a.select} w-full appearance-none py-3 pr-10`}
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => navigate(-1)} className={a.btnSecondary}>
              Cancel
            </button>

            <button type="submit" disabled={saveMut.isPending} className={a.btnPrimary}>
              {saveMut.isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {managerToEdit ? "Update manager" : "Save manager"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManagerForm;