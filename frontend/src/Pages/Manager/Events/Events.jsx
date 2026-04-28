import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL, { uploadFileUrl } from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-hot-toast";

const MANAGER_CARD_CLASS =
  "group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#3699FF]/35 hover:shadow-md";

function Events() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const fetchEvents = () => {
    axios
      .get(`${API_BASE_URL}/event/myevents`, { withCredentials: true })
      .then((res) => setEvents(res.data.data || []))
      .catch(console.error);
  };

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent?._id) {
      toast.error("No event selected");
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/event/delete/${selectedEvent._id}`,
        {
          withCredentials: true,
        }
      );

      setShowDeleteModal(false);
      setSelectedEvent(null);

      await fetchEvents();

      toast.success(
        response?.data?.message || "Event deleted successfully"
      );
    } catch (error) {
      console.error("Delete error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete event"
      );
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="manager-page-shell space-y-6 font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="manager-page-header mb-0">
          <h1 className="manager-page-heading">Events</h1>
          <p className="manager-page-subtitle">Manage your events in one place.</p>
        </div>
        <Link to="/manager/eventForm">
          <button className="bg-[#3699FF] text-white px-5 py-2.5 font-medium tracking-wide rounded-lg shadow-md hover:brightness-110 transition">
            Add New
          </button>
        </Link>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="Search by Event or Organizer"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 border-b-2 border-gray-300 focus:border-[#3699FF] focus:outline-none px-2 py-1 bg-transparent"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-1/4 border-b-2 border-gray-300 focus:border-[#3699FF] focus:outline-none px-2 py-1 bg-transparent"
        >
          <option value="All">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="postponed">Postponed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* EVENT CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No events found.
          </p>
        )}

        {filteredEvents.map((event) => (
          <div
            key={event._id}
            className={MANAGER_CARD_CLASS}
          >
            <div className="relative h-36 w-full overflow-hidden bg-slate-100">
              {event.image ? (
                <img
                  src={uploadFileUrl(event.image)}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#4B5563]">
                  No Image
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/45 via-transparent to-transparent" />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#3699FF]">
                Event
              </p>
              <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-snug tracking-tight text-slate-800">
                {event.title}
              </h3>

              <p className="mb-1 text-sm text-gray-600 line-clamp-1">
                Organizer: {event.organizer?.name || "N/A"}
              </p>

              <p className="mb-1 text-xs text-gray-500">
                Status: {event.status}
              </p>

              <button
                onClick={() => navigate(`/manager/details/${event._id}`)}
                className="mt-auto inline-flex w-full items-center justify-center rounded-md bg-[#3699FF] py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EVENT TABLE */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full text-left divide-y divide-gray-100">
          <thead className="bg-slate-100">
            <tr>
              {["#", "Title", "Organizer", "Status", "Date", "Venue", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-gray-700 font-semibold"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredEvents.map((event, idx) => (
              <tr key={event._id} className="hover:bg-gray-100">
                <td className="px-6 py-4">{idx + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {event.title}
                </td>
                <td className="px-6 py-4">
                  {event.organizer?.name || "N/A"}
                </td>
                <td className="px-6 py-4">{event.status}</td>
                <td className="px-6 py-4">
                  {new Date(event.startDateTime).toLocaleString()}
                </td>
                <td className="px-6 py-4">{event.venue}</td>
                <td className="px-6 py-4 flex justify-end gap-3">
                  <FaEdit
                    size={18}
                    className="text-[#3699FF] hover:text-[#2B8ACF] cursor-pointer"
                    onClick={() =>
                      navigate(`/manager/eventForm/${event._id}/edit`)
                    }
                  />
                  <RiDeleteBinLine
                    size={18}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                    onClick={() => handleDeleteClick(event)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 w-80 border border-gray-200 shadow-lg rounded-xl">
            <h2 className="text-lg font-bold text-red-700 mb-2">
              Confirm Delete
            </h2>
            <p className="text-gray-700 mb-6">
              This action <span className="font-semibold">cannot be undone</span>.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-400 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition"
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

export default Events;