// src/pages/student/profile/sections/ProfileVolunteers.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config/api.config";
import {
  Calendar, MapPin, Clock, Loader2,
  BadgeCheck, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";

export default function ProfileVolunteers({ user }) {
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expandedId, setExpandedId] = useState(null); // which card is open

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/event/volunteer/my-events`, {
          withCredentials: true,
        });
        const approved = (res.data.data || []).filter(
          (e) => e.applicationStatus === "approved"
        );
        setEvents(approved);
      } catch (err) {
        console.error("Failed to fetch volunteer events:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-[#1e3a8a]" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100">
        <BadgeCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Approved Volunteering Yet</h3>
        <p className="text-gray-500">You don't have any approved volunteer positions yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900">My Volunteer Events</h2>
        <p className="text-gray-500 text-sm mt-1">
          {events.length} approved {events.length === 1 ? "position" : "positions"}
        </p>
      </div>

      {/* List */}
      <div className="space-y-3">
        {events.map((event) => {
          const isOpen = expandedId === event._id;

          return (
            <div
              key={event._id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* ── Row ── */}
              <div className="flex items-center justify-between px-5 py-4 gap-4">
                {/* Left: title + organizer */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <BadgeCheck size={15} className="text-[#1d4ed8] shrink-0" />
                    <h3 className="text-sm font-bold text-gray-900 truncate">{event.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 pl-[23px]">{event.organizer?.name}</p>
                </div>

                {/* Right: View Details button */}
                <button
                  onClick={() => toggle(event._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1e3a8a] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe] border border-[rgba(30,64,175,0.14)] transition shrink-0"
                >
                  {isOpen ? "Hide" : "View Details"}
                  {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {/* ── Dropdown details ── */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">

                    <div className="flex items-start gap-2">
                      <Calendar size={14} className="mt-0.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                        <p className="font-medium text-gray-800">
                          {new Date(event.startDateTime).toLocaleDateString("en-US", {
                            weekday: "short", day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock size={14} className="mt-0.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Time</p>
                        <p className="font-medium text-gray-800">
                          {new Date(event.startDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" — "}
                          {new Date(event.endDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Venue</p>
                        <p className="font-medium text-gray-800">{event.venue || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <BadgeCheck size={14} className="mt-0.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Role</p>
                        <p className="font-medium text-gray-800">{event.role || "Volunteer"}</p>
                      </div>
                    </div>

                    {event.approvedAt && (
                      <div className="flex items-start gap-2 sm:col-span-2">
                        <Clock size={14} className="mt-0.5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Approved On</p>
                          <p className="font-medium text-gray-800">
                            {new Date(event.approvedAt).toLocaleDateString("en-US", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}