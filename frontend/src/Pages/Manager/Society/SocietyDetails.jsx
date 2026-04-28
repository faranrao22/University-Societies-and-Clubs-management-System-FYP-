import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { FiArrowLeft, FiUser, FiUsers, FiDownload } from "react-icons/fi";
import { toast } from "react-hot-toast";

const FALLBACK_SOCIETY_IMG =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";

function SocietyDetails() {
  const { societyId } = useParams();
  const navigate = useNavigate();

  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [roleAssignments, setRoleAssignments] = useState({});
  const [savingRoleId, setSavingRoleId] = useState(null);

  useEffect(() => {
    fetchSociety();
  }, [societyId]);

  const fetchSociety = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/societies/${societyId}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setSociety(res.data.data);
        const nextAssignments = {};
        (res.data.data?.roles || []).forEach((role) => {
          nextAssignments[role._id] = role.user?._id || "";
        });
        setRoleAssignments(nextAssignments);
      } else {
        setError(res.data.message || "Failed to fetch society");
      }
    } catch (err) {
      setError("Failed to fetch society");
    } finally {
      setLoading(false);
    }
  };

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

  const societyImageRaw =
    typeof society.image === "string" ? society.image.trim() : society.image?.url || society.image?.path || "";
  const societyImageSrc = uploadFileUrl(societyImageRaw) || FALLBACK_SOCIETY_IMG;

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await axios.get(`${API_BASE_URL}/societies/${societyId}/pdf`, {
        withCredentials: true,
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const fileName = `${(society?.name || "society").replace(/[^\w\s-]/g, "").trim() || "society"}-report.pdf`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to download PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSaveRole = async (role) => {
    const selectedUserId = roleAssignments[role._id] || null;
    const currentUserId = role.user?._id || null;
    if ((selectedUserId || null) === (currentUserId || null)) {
      toast("No changes to save");
      return;
    }
    try {
      setSavingRoleId(role._id);
      const res = await axios.patch(
        `${API_BASE_URL}/societies/${societyId}/roles/${role._id}`,
        { userId: selectedUserId || null },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(res.data?.message || "Role updated successfully");
      } else {
        toast.error(res.data?.message || "Failed to update role");
        return;
      }
      await fetchSociety();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    } finally {
      setSavingRoleId(null);
    }
  };

  const assignedRoleByUserId = {};
  (society.roles || []).forEach((r) => {
    const uid = r.user?._id;
    if (uid) assignedRoleByUserId[uid] = r.name;
  });

  const handleRemoveMember = async (member) => {
    setSelectedMember(member || null);
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = async () => {
    const memberId = selectedMember?._id;
    if (!memberId) return;
    try {
      setRemovingMemberId(memberId);
      await axios.delete(`${API_BASE_URL}/societies/${societyId}/members/${memberId}`, {
        withCredentials: true,
      });
      toast.success("Student removed from society");
      await fetchSociety();
      setShowRemoveModal(false);
      setSelectedMember(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove student");
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="manager-page-shell space-y-6 text-gray-900">
      <div className="space-y-6">

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#3699FF] shadow-sm transition hover:bg-slate-50"
          >
            <FiArrowLeft /> Back to Societies
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 rounded-md border border-[#3699FF] bg-[#3699FF] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiDownload />
            {downloadingPdf ? "Downloading..." : "Download PDF"}
          </button>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
            <div className="w-full md:w-80 md:shrink-0">
              <div className="h-56 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 md:h-56">
                <img
                  src={societyImageSrc}
                  alt={society.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_SOCIETY_IMG;
                  }}
                />
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">Department:</span>{" "}
                    {society.department || "N/A"}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">Advisor:</span>{" "}
                    {society.advisor || "N/A"}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">Status:</span>{" "}
                    {society.status || "N/A"}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">Email:</span>{" "}
                    {society.email || "N/A"}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">Phone:</span>{" "}
                    {society.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                    society.status === "Active" ? "bg-[#3699FF]" : "bg-rose-500"
                  }`}
                >
                  {society.status || "N/A"}
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  Members: {society.members?.length || 0}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#3699FF]">{society.name}</h1>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">{society.shortName || "—"}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{society.description || "No description available."}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#3699FF]">
            <FiUser /> Roles
          </h2>

          {society.roles && society.roles.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {society.roles.map((role) => (
                <div
                  key={role._id}
                  className="rounded-lg border border-slate-200 p-4 transition hover:shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{role.name}</p>
                  {role.user ? (
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">{role.user.fullname}</p>
                      <p className="text-xs text-slate-600">{role.user.email || "N/A"}</p>
                      <p className="text-xs text-slate-600">Department: {role.user.Department || "N/A"}</p>
                      <p className="text-xs text-slate-600">Semester: {role.user.semester || "N/A"}</p>
                      <p className="text-xs text-slate-600">Roll No: {role.user.rollNo || "N/A"}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">Vacant</p>
                  )}
                  <div className="mt-3 space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Assign member
                    </label>
                    <select
                      value={roleAssignments[role._id] || ""}
                      onChange={(e) =>
                        setRoleAssignments((prev) => ({
                          ...prev,
                          [role._id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-[#3699FF] focus:outline-none focus:ring-2 focus:ring-[#3699FF]/20"
                    >
                      <option value="">Unassigned</option>
                      {(society.members || []).map((member) => (
                        <option
                          key={member._id}
                          value={member._id}
                          disabled={
                            Boolean(assignedRoleByUserId[member._id]) &&
                            assignedRoleByUserId[member._id] !== role.name
                          }
                        >
                          {member.fullname || member.name || "N/A"}
                          {assignedRoleByUserId[member._id] &&
                          assignedRoleByUserId[member._id] !== role.name
                            ? ` (Assigned: ${assignedRoleByUserId[member._id]})`
                            : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleSaveRole(role)}
                      disabled={savingRoleId === role._id}
                      className="w-full rounded-md bg-[#3699FF] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                    >
                      {savingRoleId === role._id ? "Saving..." : "Save Role"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No roles defined.</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#3699FF]">
            <FiUsers /> Members
          </h2>
          {society.members && society.members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">Name</th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">Department</th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">Semester</th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">Roll No</th>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {society.members.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{member.fullname || member.name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{member.Department || member.department || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{member.semester || member.Semester || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{member.rollNo || "N/A"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          disabled={removingMemberId === member._id}
                          className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                        >
                          {removingMemberId === member._id ? "Removing..." : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No members yet.</p>
          )}
        </section>
      </div>

      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900">Remove Student</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-900">
                {selectedMember?.fullname || "this student"}
              </span>{" "}
              from this society?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              This action can be reversed by adding the student again.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (removingMemberId) return;
                  setShowRemoveModal(false);
                  setSelectedMember(null);
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveMember}
                disabled={removingMemberId === selectedMember?._id}
                className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {removingMemberId === selectedMember?._id ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocietyDetails;
