import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { IoClose, IoCheckmark, IoCloseCircle, IoEye } from "react-icons/io5";

function Volunteers() {
  const { user } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Role input for approval
  const [roleInput, setRoleInput] = useState({});

  // ─── Fetch Volunteer-Enabled Events ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/event/myevents`, {
          withCredentials: true,
        });
        
        // Filter: only volunteer-enabled events
        const volunteerEvents = (res.data.data || [])
          .filter((evt) => evt.isVolunteerOpen)
          .map((evt) => ({
            ...evt,
            volunteerCount: evt.volunteers?.filter((v) => v.status === "pending").length || 0,
          }));
          
        setEvents(volunteerEvents);
      } catch (err) {
        toast.error("Failed to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [user]);

  // ─── Fetch Volunteers for Selected Event ───────────────────────────────────
  const fetchVolunteers = async (eventId) => {
    try {
      setVolunteerLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/event/volunteer/requests/${eventId}`,
        { withCredentials: true }
      );
      setVolunteers(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load volunteer requests");
      console.error(err);
    } finally {
      setVolunteerLoading(false);
    }
  };

  // ─── Open Modal ────────────────────────────────────────────────────────────
  const handleOpenModal = async (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
    await fetchVolunteers(event._id);
  };

  // ─── Close Modal ───────────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setVolunteers([]);
    setRoleInput({});
  };

  // ─── Update Volunteer Status ───────────────────────────────────────────────
  const handleUpdateStatus = async (volunteerId, action) => {
    if (!selectedEvent) return;
    
    // Validate role for approval
    if (action === "approve" && !roleInput[volunteerId]?.trim()) {
      toast.error("Please enter a role before approving");
      return;
    }
    
    setUpdatingId(volunteerId);
    
    try {
      await axios.post(
        `${API_BASE_URL}/event/volunteer/handle`,
        {
          eventId: selectedEvent._id,
          userId: volunteerId,
          action,
          role: action === "approve" ? roleInput[volunteerId].trim() : undefined,
        },
        { withCredentials: true }
      );
      
      toast.success(`Volunteer ${action === "approve" ? "approved" : "rejected"} successfully`);
      
      // Refresh volunteer list
      await fetchVolunteers(selectedEvent._id);
      
      // Update parent event count
      setEvents((prev) =>
        prev.map((evt) =>
          evt._id === selectedEvent._id
            ? {
                ...evt,
                volunteerCount: evt.volunteerCount - (action === "approve" || action === "reject" ? 1 : 0),
              }
            : evt
        )
      );
      
      // Clear role input
      setRoleInput((prev) => ({ ...prev, [volunteerId]: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Format Date Helper ────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#4B5563]">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="manager-page-shell font-sans">
      <div>
        {/* Header */}
        <div className="manager-page-header">
          <h1 className="manager-page-heading">Volunteer Management</h1>
          <p className="manager-page-subtitle">Manage volunteer applications for your events</p>
        </div>

        {/* Events Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-slate-100">
            <h2 className="text-lg font-semibold text-[#3699FF]">Your Events</h2>
          </div>
          
          {events.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No volunteer-enabled events found</p>
              <p className="text-sm mt-1">Create an event and enable volunteer applications to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pending Requests
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      className="hover:bg-gray-100 transition cursor-pointer"
                      onClick={() => handleOpenModal(event)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {event.image ? (
                            <img
                              src={uploadFileUrl(event.image)}
                              alt={event.title}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                              No Img
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-500">{event.organizer?.name || "Unknown Society"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p>{formatDate(event.startDateTime)}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{event.venue}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {event.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {event.volunteerCount > 0 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-[#3699FF] border border-gray-300 font-semibold text-sm">
                            {event.volunteerCount}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(event);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#3699FF] bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                          <IoEye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Volunteer Requests Modal ───────────────────────────────────────── */}
      {modalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-[#3699FF]">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500">
                    {volunteers.length} application{volunteers.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white rounded-lg transition text-[#4B5563]"
                  title="Close"
                >
                  <IoClose className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {volunteerLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading requests...</div>
                  </div>
                ) : volunteers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No volunteer applications yet</p>
                    <p className="text-sm mt-1">Applications will appear here when users apply</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {volunteers.map((vol) => {
                      const volunteerUser = vol.user || {};
                      return (
                        <div
                          key={vol._id || volunteerUser._id}
                          className="border border-gray-200 rounded-xl p-4 bg-slate-100/90 hover:border-gray-300 transition"
                        >
                          {/* User Info */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                  {(volunteerUser.fullname?.[0] || volunteerUser.email?.[0] || "?").toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {volunteerUser.fullname || "Anonymous"}
                                  </p>
                                  <p className="text-sm text-gray-500">{volunteerUser.email || "No email"}</p>
                                </div>
                              </div>
                              
                              {/* Application Details */}
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {vol.motivation && (
                                  <div>
                                    <span className="text-gray-500">Motivation:</span>
                                    <p className="text-gray-800 mt-0.5 line-clamp-2">{vol.motivation}</p>
                                  </div>
                                )}
                                {vol.preferredRole && (
                                  <div>
                                    <span className="text-gray-500">Preferred Role:</span>
                                    <p className="text-gray-800 mt-0.5">{vol.preferredRole}</p>
                                  </div>
                                )}
                                {vol.availability && (
                                  <div>
                                    <span className="text-gray-500">Availability:</span>
                                    <p className="text-gray-800 mt-0.5">{vol.availability}</p>
                                  </div>
                                )}
                                {vol.skills?.length > 0 && (
                                  <div>
                                    <span className="text-gray-500">Skills:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {vol.skills.map((skill, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-700"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  vol.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : vol.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {vol.status.charAt(0).toUpperCase() + vol.status.slice(1)}
                              </span>
                              {vol.role && vol.status === "approved" && (
                                <span className="text-xs text-gray-500">Role: {vol.role}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions - Only for pending */}
                          {vol.status === "pending" && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                              {/* Role Input */}
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                  Assign Role (for approval)
                                </label>
                                {Array.isArray(selectedEvent?.volunteerRoles) && selectedEvent.volunteerRoles.length > 0 ? (
                                  <select
                                    value={roleInput[vol.user?._id] || ""}
                                    onChange={(e) =>
                                      setRoleInput((prev) => ({
                                        ...prev,
                                        [vol.user?._id]: e.target.value,
                                      }))
                                    }
                                    className="w-full border border-gray-300 px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3699FF]/30 bg-white"
                                  >
                                    <option value="">Select predefined role...</option>
                                    {selectedEvent.volunteerRoles.map((role) => (
                                      <option key={role} value={role}>{role}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    placeholder="e.g. Registration Desk, Tech Support"
                                    value={roleInput[vol.user?._id] || ""}
                                    onChange={(e) =>
                                      setRoleInput((prev) => ({
                                        ...prev,
                                        [vol.user?._id]: e.target.value,
                                      }))
                                    }
                                    className="w-full border border-gray-300 px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3699FF]/30"
                                  />
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateStatus(vol.user?._id, "reject")}
                                  disabled={updatingId === vol.user?._id}
                                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                  title="Reject Application"
                                >
                                  <IoCloseCircle className="w-4 h-4" />
                                  {updatingId === vol.user?._id ? "..." : "Reject"}
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(vol.user?._id, "approve")}
                                  disabled={updatingId === vol.user?._id}
                                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-[#3699FF] rounded-lg hover:brightness-110 transition disabled:opacity-50"
                                  title="Approve Application"
                                >
                                  <IoCheckmark className="w-4 h-4" />
                                  {updatingId === vol.user?._id ? "..." : "Approve"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-slate-100 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-[#3699FF] bg-white border border-gray-300 rounded-lg hover:bg-white/90 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Volunteers;