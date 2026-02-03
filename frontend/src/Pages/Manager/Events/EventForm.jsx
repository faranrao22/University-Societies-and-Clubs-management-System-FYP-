import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

function EventForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [societies, setSocieties] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    organizer: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    venue: "",
    status: "scheduled",
    image: null,
  });

  /* ================= FETCH SOCIETIES ================= */
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/societies/Mysocieties/${user._id}`, {
        withCredentials: true,
      })
      .then((res) => setSocieties(res.data.data || []))
      .catch(() => toast.error("Failed to load societies"));
  }, [user]);

  /* ================= LOAD EVENT (EDIT) ================= */
  useEffect(() => {
    if (!id) return;

    axios
      .get(`${API_BASE_URL}/event/Eventbyid/${id}`, { withCredentials: true })
      .then((res) => {
        const data = res.data.data;

        setFormData({
          title: data.title || "",
          organizer: data.organizer?._id || "",
          description: data.description || "",
          startDateTime: data.startDateTime
            ? new Date(data.startDateTime).toISOString().slice(0, 16)
            : "",
          endDateTime: data.endDateTime
            ? new Date(data.endDateTime).toISOString().slice(0, 16)
            : "",
          venue: data.venue || "",
          status: data.status || "scheduled",
          image: null,
        });

        if (data.image) {
          setPreview(`http://localhost:8000/uploads/${data.image}`);
        }
      })
      .catch(() => toast.error("Failed to load event"));
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDateTime") {
      const now = new Date();
      const selected = new Date(value);

      if (selected < now) {
        toast.error("Start date/time cannot be in the past!");
        return;
      }

      setFormData({ ...formData, startDateTime: value });

      if (formData.endDateTime && new Date(formData.endDateTime) < selected) {
        setFormData((prev) => ({ ...prev, endDateTime: "" }));
      }
    } else if (name === "endDateTime") {
      const start = new Date(formData.startDateTime);
      const end = new Date(value);

      if (end <= start) {
        toast.error("End date/time must be after start date/time!");
        return;
      }
      setFormData({ ...formData, endDateTime: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (id) {
        await axios.put(`${API_BASE_URL}/event/update/${id}`, data, {
          withCredentials: true,
        });
        toast.success("Event updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/event/create`, data, {
          withCredentials: true,
        });
        toast.success("Event created successfully");
      }

      navigate("/manager/events");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white border border-gray-300 p-8">

        {/* Back */}
        <Link to="/manager/events">
          <button className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <IoArrowBack size={18} className="mr-2" />
            Back to Events
          </button>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          {id ? "Edit Event" : "Create Event"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900"
              required
            />
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Organizer (Society)
            </label>
            <select
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900"
              required
            >
              <option value="">Select Society</option>
              {societies.map((society) => (
                <option key={society._id} value={society._id}>
                  {society.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900"
            >
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900"
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Image
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />

            {preview && (
              <div className="mt-4 border border-gray-300 w-40 h-40">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Link to="/manager/events">
              <button
                type="button"
                className="px-6 py-2 border border-gray-400 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800"
            >
              {loading ? "Saving..." : id ? "Update Event" : "Create Event"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EventForm;
