import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import { useAuth } from "../../../context/AuthContext";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";

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
    try {
      await axios.delete(`${API_BASE_URL}/event/delete/${selectedEvent._id}`, {
        withCredentials: true,
      });
      setShowDeleteModal(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch {
      alert("Failed to delete event.");
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
    <div className="min-h-screen bg-gray-50 p-6 font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Events Management
        </h1>
        <Link to="/manager/eventForm">
          <button className="bg-gray-900 text-white px-5 py-2 font-medium tracking-wide hover:bg-gray-800 transition">
            Add New
          </button>
        </Link>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white border border-gray-300 p-4 mb-6">
        <input
          type="text"
          placeholder="Search by Event or Organizer"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none px-2 py-1"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-1/4 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none px-2 py-1"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {filteredEvents.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No events found.
          </p>
        )}

        {filteredEvents.map((event) => (
          <div
            key={event._id}
            className="bg-white border border-gray-200 hover:shadow-md transition-transform hover:-translate-y-1"
          >
            <div className="w-full h-32 overflow-hidden mb-4">
              {event.image ? (
                <img
                  src={`http://localhost:8000/uploads/${event.image}`}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>

            <div className="px-4 pb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {event.title}
              </h3>

              <p className="text-gray-600 text-sm mb-1">
                Organizer: {event.organizer?.name || "N/A"}
              </p>

              <p className="text-gray-500 text-xs mb-1">
                Status: {event.status}
              </p>

              <p className="text-gray-500 text-xs mb-2">
                {new Date(event.startDateTime).toLocaleString()} –{" "}
                {new Date(event.endDateTime).toLocaleString()}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/manager/eventForm/${event._id}/edit`)
                  }
                  className="flex-1 bg-gray-900 text-white text-sm py-2 hover:bg-gray-800 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(event)}
                  className="flex-1 border border-red-600 text-red-600 text-sm py-2 hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EVENT TABLE */}
      <div className="overflow-x-auto bg-white border border-gray-200">
        <table className="min-w-full text-left divide-y divide-gray-200">
          <thead className="bg-gray-100">
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
              <tr key={event._id} className="hover:bg-gray-50">
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
                    className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
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
          <div className="bg-white p-6 w-80 border border-gray-300 shadow-lg">
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
